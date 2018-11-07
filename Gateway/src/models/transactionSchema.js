import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  RUT: String,
  amount: Number,
  date: String,
});

export default mongoose.model('Transaction', TransactionSchema);