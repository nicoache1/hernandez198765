import HttpService from '../HttpService';
import apiConstants from '../../helpers/ApiConstants';

class TransmitterController {
  communicateWithTransmitter = async req => {
    const uri = `${apiConstants.TRANSMITTER_API}/Transmitter`;
    const transmitterResponse = await HttpService.post(uri, req.body);
    return transmitterResponse.data;
  };

  // TODO: Maybe a post, ask about this.
  deleteTransaction = async (transactionId, transmitterTransactionId) => {
    const uri = `${
      apiConstants.TRANSMITTER_API
    }/Transmitter/${transactionId}/${transmitterTransactionId}`;
    const transmitterResponse = await HttpService.delete(uri);
    return transmitterResponse.data;
  };

  chargeback = async transactionToChargeback => {
    const uri = `${apiConstants.TRANSMITTER_API}/Transmitter`;
    const transmitterResponse = await HttpService.put(
      uri,
      transactionToChargeback,
    );
    return transmitterResponse.data;
  };
}

export default new TransmitterController();
