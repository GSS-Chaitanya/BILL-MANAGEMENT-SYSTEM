import mongoose from 'mongoose';

const inventoryBatchSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true, index: true },
    mfgDate: { type: Date },
    quantity: { type: Number, required: true, default: 0 },
    purchasePrice: { type: Number, required: true },
    mrp: { type: Number },
    sellingPrice: { type: Number, required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    rackLocation: { type: String },
}, { timestamps: true });

// Compound index to ensure batch numbers are unique per product per user
inventoryBatchSchema.index({ userId: 1, productId: 1, batchNumber: 1 }, { unique: true });

const InventoryBatch = mongoose.model('InventoryBatch', inventoryBatchSchema);

export default InventoryBatch;
