import mongoose from 'mongoose';
// import TransactionSchema from '../models/TransactionSchema';

class DatabaseManager {
  constructor() {
    this.DB_CONNECTION = 'localhost:27017/payYouNow_db';
    mongoose.Promise = global.Promise;
  }

  connect = async () => {
    try {
      await mongoose.connect(
        'mongodb://localhost:27017/payYouNow_db',
        { useNewUrlParser: true },
      );
    } catch (error) {
      console.log('Cannot connect with Database');
    }
  };
}

export default new DatabaseManager();