import { Router } from 'express';
import Bill from '../models/Bill.js';
import Settings from '../models/Settings.js';

const router = Router();

// GET /api/bills — list user's bills (newest first)
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.user.uid }).sort({ date: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/bills — save a new bill
router.post('/', async (req, res) => {
    try {
        const bill = await Bill.create({ ...req.body, userId: req.user.uid });

        // Update the invNum in settings
        await Settings.findOneAndUpdate(
            { userId: req.user.uid },
            { $set: { invNum: req.body.invNum } },
            { upsert: true }
        );

        // Deduct stock from associated batches
        if (req.body.items && req.body.items.length > 0) {
            const batchUpdates = req.body.items
                .filter(item => item.batchId)
                .map(item => ({
                    updateOne: {
                        filter: { _id: item.batchId, userId: req.user.uid },
                        update: { $inc: { quantity: -item.qty } }
                    }
                }));
            
            if (batchUpdates.length > 0) {
                // Dynamically import InventoryBatch to avoid circular deps if they exist
                const { default: InventoryBatch } = await import('../models/InventoryBatch.js');
                await InventoryBatch.bulkWrite(batchUpdates);
            }
        }

        res.status(201).json(bill);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/bills/:id — delete a specific bill
router.delete('/:id', async (req, res) => {
    try {
        const bill = await Bill.findOne({ _id: req.params.id, userId: req.user.uid });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

        // Restore stock to associated batches
        if (bill.items && bill.items.length > 0) {
            const batchUpdates = bill.items
                .filter(item => item.batchId)
                .map(item => ({
                    updateOne: {
                        filter: { _id: item.batchId, userId: req.user.uid },
                        update: { $inc: { quantity: item.qty } } // Add stock back
                    }
                }));

            if (batchUpdates.length > 0) {
                const { default: InventoryBatch } = await import('../models/InventoryBatch.js');
                await InventoryBatch.bulkWrite(batchUpdates);
            }
        }

        await Bill.findByIdAndDelete(bill._id);

        res.json({ message: 'Bill deleted and stock restored' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/bills — clear all bills for user
router.delete('/', async (req, res) => {
    try {
        // Fetch all bills to restore stock before deleting
        const bills = await Bill.find({ userId: req.user.uid });

        // Collect all batch stock restorations
        const batchUpdates = [];
        for (const bill of bills) {
            if (bill.items && bill.items.length > 0) {
                for (const item of bill.items) {
                    if (item.batchId) {
                        batchUpdates.push({
                            updateOne: {
                                filter: { _id: item.batchId, userId: req.user.uid },
                                update: { $inc: { quantity: item.qty } }
                            }
                        });
                    }
                }
            }
        }

        if (batchUpdates.length > 0) {
            const { default: InventoryBatch } = await import('../models/InventoryBatch.js');
            await InventoryBatch.bulkWrite(batchUpdates);
        }

        await Bill.deleteMany({ userId: req.user.uid });
        res.json({ message: 'All bills cleared and stock restored' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
