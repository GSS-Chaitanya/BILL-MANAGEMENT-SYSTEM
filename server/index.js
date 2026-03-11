import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authMiddleware from './middleware/auth.js';
import billRoutes from './routes/bills.js';
import productRoutes from './routes/products.js';
import settingsRoutes from './routes/settings.js';
import supplierRoutes from './routes/suppliers.js';
import inventoryRoutes from './routes/inventory.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve the uploads directory statically
app.use('/uploads', express.static('uploads'));

// Health check (no auth required)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/bills', authMiddleware, billRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/suppliers', authMiddleware, supplierRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
