import moment from 'moment';
import DatabaseManager from '../../managers/DatabaseManager';
import cardStatus from '../../helpers/cardStatus';
import language from '../../localization/en';

class TransmitterController {
  constructor() {
    this.BASE_API = '/Transmitter';
  }

  addNewCard = async newCard => {
    try {
      await DatabaseManager.addNewCard(newCard);
    } catch (error) {
      throw new Error(error);
    }
  };

  chargebackPurchase = async transaction => {
    try {
      const card = await DatabaseManager.findCardByTransactionId(transaction);
      this.validateChargebackTime(card.date);
      await this.updateCardTransactions(transaction);
    } catch (error) {
      throw new Error(error);
    }
  };

  validateChargebackTime = date => {
    const sixMonthAgo = moment().add(-6, 'months');
    const transactionTime = moment.unix(date);
    if (transactionTime.isBefore(sixMonthAgo)) {
      throw new Error('Time for chargeback exceed');
    }
  };

  addNewTransaction = async transaction => {
    try {
      const transactionID = await DatabaseManager.addCardTransactions(
        transaction,
      );
      return transactionID;
    } catch (error) {
      throw new Error(error);
    }
  };

  updateCardTransactions = async transaction => {
    try {
      await DatabaseManager.updateCardTransactions(transaction, 'CHARGEBACK');
    } catch (error) {
      throw new Error(error);
    }
  };

  updateCardBalance = async (card, amount) => {
    try {
      await DatabaseManager.updateCardBalance(card.number, -amount);
    } catch (error) {
      throw new Error(error);
    }
  };

  validateCard = async transactionCard => {
    const response = await DatabaseManager.validateCardIsEmitted(
      transactionCard,
    );
    this.validateAmount(response, transactionCard.amount);
    this.validateLuhn(transactionCard.number);
    this.validateExpirationDate(transactionCard.expirationDate);
    this.validateCardStatus(response.status);
    return {
      number: transactionCard.number,
      data: language.VALID_CARD,
      amount: transactionCard.amount,
    };
  };

  validateCardStatus = status => {
    if (status !== cardStatus.ENABLED) {
      throw new Error(`${language.CARD_STATUS_ERROR} ${status}`);
    }
  };

  validateExpirationDate = expirationDate => {
    const cardMonth = expirationDate.split('/')[0];
    const cardYear = expirationDate.split('/')[1];
    const actualMonth = moment().month();
    const actualYear = moment().year();
    if (
      cardYear > actualYear ||
      (cardYear === actualYear && cardMonth > actualMonth)
    ) {
      throw new Error(language.EXPIRATION_DATE_ERROR);
    }
  };

  validateAmount = (card, amount) => {
    if (card.balance < amount) {
      throw new Error(language.INSUFICIENT_FOUNDS);
    }
  };

  validateLuhn = cardNumber => {
    if (!this.luhnValidation(cardNumber)) {
      throw new Error(language.INVALID_CREDIT_CARD);
    }
  };

  luhnValidation = value => {
    let valueToWork = `${value}`;
    if (/[^0-9-\s]+/.test(valueToWork)) return false;
    let nCheck = 0;
    let nDigit = 0;
    let bEven = false;
    valueToWork = valueToWork.replace(/\D/g, '');

    for (let n = valueToWork.length - 1; n >= 0; n -= 1) {
      const cDigit = valueToWork.charAt(n);
      nDigit = parseInt(cDigit, 10);

      if (bEven) {
        nDigit *= 2;
        if (nDigit > 9) nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }
    return nCheck % 10 === 0;
  };

  returnPurchase = async transactionId => {
    const { amount, number } = await DatabaseManager.deleteCardTransactions(
      transactionId,
    );
    await DatabaseManager.updateCardBalance(number, amount);
  };
}

export default new TransmitterController();
