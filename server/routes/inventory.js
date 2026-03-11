import { Router } from 'express';
import InventoryBatch from '../models/InventoryBatch.js';
import Product from '../models/Product.js';

const router = Router();

// GET all inventory batches for user
router.get('/', async (req, res) => {
    try {
        const batches = await InventoryBatch.find({ userId: req.user.uid })
            .populate('productId', 'name sku composition package manufacturer requiresPrescription unit price')
            .populate('supplierId', 'name')
            .sort({ expiryDate: 1 }); // Sort by closest expiry first
        res.json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET low stock or near expiry alerts
router.get('/alerts', async (req, res) => {
    try {
        const LOW_STOCK_THRESHOLD = 10;
        const THREE_MONTHS_FROM_NOW = new Date();
        THREE_MONTHS_FROM_NOW.setMonth(THREE_MONTHS_FROM_NOW.getMonth() + 3);

        const lowStock = await InventoryBatch.find({
            userId: req.user.uid,
            quantity: { $lt: LOW_STOCK_THRESHOLD, $gt: 0 }
        }).populate('productId', 'name sku unit');

        const nearExpiry = await InventoryBatch.find({
            userId: req.user.uid,
            expiryDate: { $lte: THREE_MONTHS_FROM_NOW },
            quantity: { $gt: 0 }
        }).populate('productId', 'name sku unit');

        res.json({ lowStock, nearExpiry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST an inward stock (new batch)
router.post('/inward', async (req, res) => {
    try {
        const {
            productId,
            batchNumber,
            expiryDate,
            mfgDate,
            quantity,
            purchasePrice,
            mrp,
            sellingPrice,
            supplierId,
            rackLocation
        } = req.body;

        const batch = await InventoryBatch.create({
            userId: req.user.uid,
            productId,
            batchNumber,
            expiryDate,
            mfgDate,
            quantity,
            purchasePrice,
            mrp,
            sellingPrice,
            supplierId,
            rackLocation
        });

        // Optionally update the product's selling price to match the latest batch
        await Product.findByIdAndUpdate(productId, { price: sellingPrice });

        res.status(201).json(batch);
    } catch (error) {
        // Handle duplicate batch error gracefully
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Batch number already exists for this product.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// PUT update a batch
router.put('/:id', async (req, res) => {
    try {
        // Whitelist allowed fields to prevent userId/productId overwrite
        const { batchNumber, expiryDate, mfgDate, quantity, purchasePrice, mrp, sellingPrice, supplierId, rackLocation } = req.body;
        const updates = {};
        if (batchNumber !== undefined) updates.batchNumber = batchNumber;
        if (expiryDate !== undefined) updates.expiryDate = expiryDate;
        if (mfgDate !== undefined) updates.mfgDate = mfgDate;
        if (quantity !== undefined) updates.quantity = quantity;
        if (purchasePrice !== undefined) updates.purchasePrice = purchasePrice;
        if (mrp !== undefined) updates.mrp = mrp;
        if (sellingPrice !== undefined) updates.sellingPrice = sellingPrice;
        if (supplierId !== undefined) updates.supplierId = supplierId;
        if (rackLocation !== undefined) updates.rackLocation = rackLocation;

        const batch = await InventoryBatch.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.uid },
            { $set: updates },
            { new: true }
        ).populate('productId', 'name sku').populate('supplierId', 'name');

        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        res.json(batch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
