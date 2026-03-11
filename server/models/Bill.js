import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
    id: { type: Number },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryBatch' }, // New field
    name: { type: String, required: true },
    cat: { type: String },
    sku: { type: String },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false });

const billSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    invNum: { type: Number, required: true },
    date: { type: Number, required: true }, // timestamp
    dateStr: { type: String },
    hour: { type: Number },
    weekday: { type: Number },
    customer: { type: String, default: 'Walk-in' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    billType: { type: String, default: 'Retail' },
    items: [billItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gstRate: { type: Number, default: 18 },
    gst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);
