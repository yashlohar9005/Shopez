const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'COD', 'Wallet'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['success', 'pending', 'failed', 'refunded'],
      default: 'pending'
    },
    invoiceId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
