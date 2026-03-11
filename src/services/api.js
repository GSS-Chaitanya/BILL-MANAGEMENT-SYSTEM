import axios from 'axios';
import { fireAuth } from '../firebase.js';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
});

// Helper: get current user, waiting for auth to initialize if needed
function getCurrentUser() {
    return new Promise((resolve) => {
        const user = fireAuth.currentUser;
        if (user) return resolve(user);

        // Wait for auth state to be ready
        const unsubscribe = fireAuth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
    const user = await getCurrentUser();
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Bills ─────────────────────────────────────
export const fetchBills = () => api.get('/bills').then(r => r.data);
export const saveBill = (bill) => api.post('/bills', bill).then(r => r.data);
export const deleteBill = (id) => api.delete(`/bills/${id}`).then(r => r.data);
export const clearAllBills = () => api.delete('/bills').then(r => r.data);

// ─── Products ──────────────────────────────────
export const fetchProducts = () => api.get('/products').then(r => r.data);
export const addProduct = (product) => api.post('/products', product).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);
export const resetProducts = () => api.post('/products/reset').then(r => r.data);

// ─── Settings ──────────────────────────────────
export const fetchSettings = () => api.get('/settings').then(r => r.data);
export const updateSettings = (settings) => api.put('/settings', settings).then(r => r.data);

// Image upload
export async function uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
}

// Supplier operations ─────────────────────────────────
export const fetchSuppliers = () => api.get('/suppliers').then(r => r.data);
export const addSupplier = (supplier) => api.post('/suppliers', supplier).then(r => r.data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data).then(r => r.data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`).then(r => r.data);

// ─── Inventory ─────────────────────────────────
export const fetchInventoryBatches = () => api.get('/inventory').then(r => r.data);
export const fetchInventoryAlerts = () => api.get('/inventory/alerts').then(r => r.data);
export const addInventoryBatch = (batch) => api.post('/inventory/inward', batch).then(r => r.data);
export const updateInventoryBatch = (id, data) => api.put(`/inventory/${id}`, data).then(r => r.data);

export default api;
