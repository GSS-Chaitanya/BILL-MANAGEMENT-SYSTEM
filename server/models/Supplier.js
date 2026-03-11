import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    gstin: { type: String },
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
