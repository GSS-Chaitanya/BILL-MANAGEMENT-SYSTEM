import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, IconButton, Grid, Paper, Select, MenuItem,
    FormControl, InputLabel, TextField, Autocomplete, InputAdornment,
    Stack, Divider
} from '@mui/material';
import { Close, Add, Save } from '@mui/icons-material';
import { useInventory } from '../../store/InventoryContext.jsx';
import { useBill } from '../../store/BillContext.jsx';
import { formatCurrency } from '../../utils/format.js';

export default function StockInwardModal({ onClose, onToast }) {
    const { state: invState, handleAddBatch } = useInventory();
    const { allProds } = useBill();
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        supplierId: '',
        batchNumber: '',
        mfgDate: '',
        expiryDate: '',
        quantity: '',
        purchasePrice: '',
        mrp: '',
        sellingPrice: '',
        rackLocation: ''
    });

    const products = allProds();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct) {
            onToast('Please select a product', 'error');
            return;
        }
        
        try {
            await handleAddBatch({
                ...formData,
                productId: selectedProduct._id,
                quantity: Number(formData.quantity),
                purchasePrice: Number(formData.purchasePrice),
                mrp: Number(formData.mrp),
                sellingPrice: Number(formData.sellingPrice)
            });
            onToast('Stock inward successful', 'success');
            onClose();
        } catch (error) {
            onToast(error.message || 'Failed to add stock batch', 'error');
        }
    };

    return (
        <Dialog open maxWidth="md" fullWidth onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6">Stock Inward (Add Purchase)</Typography>
                <IconButton onClick={onClose} size="small" sx={{ ml: 'auto' }}><Close /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                <Box component="form" onSubmit={handleSubmit} id="inward-form">
                    <Grid container spacing={3}>
                        {/* Product Selection */}
                        <Grid item xs={12} md={8}>
                            <Autocomplete
                                options={products}
                                getOptionLabel={(option) => `${option.name} ${option.composition ? `(${option.composition})` : ''} - ${formatCurrency(option.price)}`}
                                value={selectedProduct}
                                onChange={(_, newValue) => {
                                    setSelectedProduct(newValue);
                                    if (newValue) {
                                        setFormData(prev => ({
                                            ...prev,
                                            sellingPrice: newValue.price || '',
                                            mrp: newValue.price || ''
                                        }));
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label="Select Product" required />}
                            />
                        </Grid>
                        
                        {/* Supplier Selection */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Supplier</InputLabel>
                                <Select
                                    name="supplierId"
                                    value={formData.supplierId}
                                    label="Supplier"
                                    onChange={handleChange}
                                >
                                    {invState.suppliers.map(sup => (
                                        <MenuItem key={sup._id} value={sup._id}>{sup.name}</MenuItem>
                                    ))}
                                    {invState.suppliers.length === 0 && (
                                        <MenuItem disabled value="">No suppliers available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>Batch Details</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        {/* Batch Info */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth required label="Batch Number"
                                name="batchNumber" value={formData.batchNumber} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth required label="Quantity" type="number"
                                name="quantity" value={formData.quantity} onChange={handleChange}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth label="Mfg Date" type="month"
                                name="mfgDate" value={formData.mfgDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth required label="Expiry Date" type="month"
                                name="expiryDate" value={formData.expiryDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Pricing Info */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="primary" gutterBottom mt={1}>Pricing & Storage</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth required label="Purchase Price" type="number"
                                name="purchasePrice" value={formData.purchasePrice} onChange={handleChange}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth required label="MRP" type="number"
                                name="mrp" value={formData.mrp} onChange={handleChange}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth required label="Selling Price" type="number"
                                name="sellingPrice" value={formData.sellingPrice} onChange={handleChange}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth label="Rack Location"
                                name="rackLocation" value={formData.rackLocation} onChange={handleChange}
                                placeholder="e.g. R1-S2"
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    type="submit" 
                    form="inward-form" 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Save />}
                >
                    Save Stock Inward
                </Button>
            </DialogActions>
        </Dialog>
    );
}
