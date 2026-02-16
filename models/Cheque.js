const mongoose = require('mongoose');

const chequeSchema = new mongoose.Schema(
  {
    chequeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['Processing', 'Cleared', 'Rejected'],
      default: 'Processing',
    },
    expectedClearanceDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cheque', chequeSchema);
