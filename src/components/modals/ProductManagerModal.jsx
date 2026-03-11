import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, Button, Box, Typography,
    IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import { Close, Delete, Refresh } from '@mui/icons-material';
import { useBill } from '../../store/BillContext.jsx';
import { deleteProduct, resetProducts as apiResetProducts } from '../../services/api.js';

export default function ProductManagerModal({ onClose, onToast }) {
    const { state, dispatch } = useBill();
    const allProducts = [...state.products, ...state.customProds];

    async function handleDelete(product) {
        if (!confirm(`Delete "${product.name}"?`)) return;
        try {
            if (product._id) {
                await deleteProduct(product._id);
            }
            dispatch({ type: 'DELETE_PROD', payload: product.id });
            onToast(`"${product.name}" deleted`, 'info');
        } catch (e) {
            onToast('Failed to delete: ' + (e.response?.data?.error || e.message), 'error');
        }
    }

    async function handleReset() {
        if (!confirm('Reset all products to defaults? Custom products will be removed.')) return;
        try {
            const products = await apiResetProducts();
            dispatch({ type: 'RESET_PRODUCTS', payload: products });
            onToast('Products reset to defaults', 'success');
        } catch (e) {
            onToast('Failed to reset: ' + (e.response?.data?.error || e.message), 'error');
        }
    }

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700}>Manage Products</Typography>
                <IconButton onClick={onClose} size="small"><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {allProducts.length} products total
                    </Typography>
                    <Button
                        size="small" color="warning" startIcon={<Refresh />}
                        onClick={handleReset}
                    >
                        Reset to Defaults
                    </Button>
                </Box>
                <Divider />
                <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {allProducts.map(p => (
                        <ListItem key={p.id} divider>
                            <Box sx={{ mr: 1.5, fontSize: '1.1rem' }}>{p.icon || '📦'}</Box>
                            <ListItemText
                                primary={p.name}
                                secondary={`${p.cat} · ${p.sku || 'custom'} · ₹${p.price}/${p.unit}`}
                                primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end" size="small" color="error"
                                    onClick={() => handleDelete(p)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}
