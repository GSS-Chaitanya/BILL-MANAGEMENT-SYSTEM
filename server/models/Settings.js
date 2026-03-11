import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    businessName: { type: String, default: 'Srinivasa Hardwares' },
    address: { type: String, default: '' },
    gstin: { type: String, default: '' },
    defaultGST: { type: Number, default: 18 },
    invNum: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
