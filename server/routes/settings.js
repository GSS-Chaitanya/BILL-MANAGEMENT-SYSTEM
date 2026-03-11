import { Router } from 'express';
import Settings from '../models/Settings.js';

const router = Router();

// GET /api/settings — get user settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne({ userId: req.user.uid });

        if (!settings) {
            // Create default settings
            settings = await Settings.create({
                userId: req.user.uid,
                businessName: 'Srinivasa Hardwares',
                address: '',
                gstin: '',
                defaultGST: 18,
                invNum: 0,
            });
        }

        res.json({
            businessName: settings.businessName,
            address: settings.address,
            gstin: settings.gstin,
            defaultGST: settings.defaultGST,
            invNum: settings.invNum,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/settings — update user settings
router.put('/', async (req, res) => {
    try {
        // Whitelist allowed fields to prevent userId overwrite
        const { businessName, address, gstin, defaultGST, invNum } = req.body;
        const updates = {};
        if (businessName !== undefined) updates.businessName = businessName;
        if (address !== undefined) updates.address = address;
        if (gstin !== undefined) updates.gstin = gstin;
        if (defaultGST !== undefined) updates.defaultGST = defaultGST;
        if (invNum !== undefined) updates.invNum = invNum;

        const settings = await Settings.findOneAndUpdate(
            { userId: req.user.uid },
            { $set: updates },
            { new: true, upsert: true }
        );

        res.json({
            businessName: settings.businessName,
            address: settings.address,
            gstin: settings.gstin,
            defaultGST: settings.defaultGST,
            invNum: settings.invNum,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
