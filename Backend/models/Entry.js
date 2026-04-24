const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be positive'],
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalValue: {
      type: Number,
    },
    type: {
      type: String,
      enum: ['stock', 'sale'],
      required: [true, 'Entry type is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate total value before saving
entrySchema.pre('save', function (next) {
  this.totalValue = this.quantity * this.pricePerUnit;
  next();
});

// Index for common query patterns
entrySchema.index({ date: -1 });
entrySchema.index({ type: 1 });
entrySchema.index({ itemName: 1 });
entrySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Entry', entrySchema);
