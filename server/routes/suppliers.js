import { Router } from 'express';
import Supplier from '../models/Supplier.js';

const router = Router();

// GET all suppliers
router.get('/', async (req, res) => {
    try {
        const suppliers = await Supplier.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new supplier
router.post('/', async (req, res) => {
    try {
        const supplier = await Supplier.create({
            ...req.body,
            userId: req.user.uid
        });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update supplier
router.put('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.uid },
            { $set: req.body },
            { new: true }
        );
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE supplier
router.delete('/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
