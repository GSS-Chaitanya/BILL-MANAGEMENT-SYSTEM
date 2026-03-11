import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    productId: { type: Number, required: true }, // original id for cart matching
    name: { type: String, required: true },
    cat: { type: String, required: true },
    icon: { type: String, default: '📦' },
    imageUrl: { type: String }, // New field for actual product photos
    sku: { type: String, default: '' },
    price: { type: Number, required: true },
    unit: { type: String, default: 'pc' },
    isCustom: { type: Boolean, default: false },
    // Pharmacy Specific Fields
    composition: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    manufacturer: { type: String },
}, { timestamps: true });

// Compound index for fast lookups
productSchema.index({ userId: 1, productId: 1 });

export default mongoose.model('Product', productSchema);
