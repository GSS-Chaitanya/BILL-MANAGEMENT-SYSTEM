import { Router } from 'express';
import Product from '../models/Product.js';
import { DEFAULTS } from '../data/defaults.js';

const router = Router();

// GET /api/products — get all products for user (defaults + custom)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ userId: req.user.uid }).sort({ isCustom: 1, productId: 1 });

        // Map to frontend shape
        const mapped = products.map(p => ({
            id: p.productId,
            _id: p._id,
            cat: p.cat,
            icon: p.icon,
            name: p.name,
            sku: p.sku,
            price: p.price,
            unit: p.unit,
            isCustom: p.isCustom,
            composition: p.composition,
            requiresPrescription: p.requiresPrescription,
            manufacturer: p.manufacturer,
            imageUrl: p.imageUrl,
        }));

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products — add a custom product
router.post('/', async (req, res) => {
    try {
        // Generate a unique productId
        const maxProduct = await Product.findOne({ userId: req.user.uid }).sort({ productId: -1 });
        const nextId = (maxProduct?.productId || 100) + 1;

        const product = await Product.create({
            userId: req.user.uid,
            productId: nextId,
            name: req.body.name,
            cat: req.body.cat || 'custom',
            icon: req.body.icon || '📦',
            sku: req.body.sku || `CUST-${nextId}`,
            price: req.body.price,
            unit: req.body.unit || 'pc',
            isCustom: true,
            composition: req.body.composition || '',
            requiresPrescription: req.body.requiresPrescription || false,
            manufacturer: req.body.manufacturer || '',
            imageUrl: req.body.imageUrl || '',
        });

        res.status(201).json({
            id: product.productId,
            _id: product._id,
            cat: product.cat,
            icon: product.icon,
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            isCustom: product.isCustom,
            composition: product.composition,
            requiresPrescription: product.requiresPrescription,
            manufacturer: product.manufacturer,
            imageUrl: product.imageUrl,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/products/:id — update a product
router.put('/:id', async (req, res) => {
    try {
        // Whitelist allowed fields to prevent userId/productId overwrite
        const { name, cat, icon, sku, price, unit, composition, requiresPrescription, manufacturer, imageUrl } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (cat !== undefined) updates.cat = cat;
        if (icon !== undefined) updates.icon = icon;
        if (sku !== undefined) updates.sku = sku;
        if (price !== undefined) updates.price = price;
        if (unit !== undefined) updates.unit = unit;
        if (composition !== undefined) updates.composition = composition;
        if (requiresPrescription !== undefined) updates.requiresPrescription = requiresPrescription;
        if (manufacturer !== undefined) updates.manufacturer = manufacturer;
        if (imageUrl !== undefined) updates.imageUrl = imageUrl;

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.uid },
            { $set: updates },
            { new: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({
            id: product.productId,
            _id: product._id,
            cat: product.cat,
            icon: product.icon,
            name: product.name,
            sku: product.sku,
            price: product.price,
            unit: product.unit,
            isCustom: product.isCustom,
            composition: product.composition,
            requiresPrescription: product.requiresPrescription,
            manufacturer: product.manufacturer,
            imageUrl: product.imageUrl,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/products/:id — delete a custom product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/products/reset — reset to defaults
router.post('/reset', async (req, res) => {
    try {
        // Remove all products for user
        await Product.deleteMany({ userId: req.user.uid });

        const products = await Product.find({ userId: req.user.uid }).sort({ productId: 1 });
        const mapped = products.map(p => ({
            id: p.productId,
            _id: p._id,
            cat: p.cat,
            icon: p.icon,
            name: p.name,
            sku: p.sku,
            price: p.price,
            unit: p.unit,
            isCustom: p.isCustom,
            composition: p.composition,
            requiresPrescription: p.requiresPrescription,
            manufacturer: p.manufacturer,
            imageUrl: p.imageUrl,
        }));

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
