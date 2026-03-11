import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, Typography, IconButton, Select, MenuItem, FormControl, InputLabel, Switch, useTheme
} from '@mui/material';
import { Close, AddCircle } from '@mui/icons-material';
import { useBill } from '../../store/BillContext.jsx';
import { addProduct } from '../../services/api.js';

export default function AddCustomItemModal({ onClose, onToast }) {
    const { dispatch } = useBill();
    const [form, setForm] = useState({
        name: '', price: '', unit: 'pc', cat: 'tablets', sku: '', icon: '💊',
        composition: '', manufacturer: '', requiresPrescription: false
    });
    const [saving, setSaving] = useState(false);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    async function handleAdd() {
        if (!form.name || !form.price) {
            onToast('Name and price are required', 'warning');
            return;
        }
        setSaving(true);
        try {
            const product = await addProduct({
                name: form.name,
                price: parseFloat(form.price),
                unit: form.unit,
                cat: form.cat,
                sku: form.sku,
                icon: form.icon,
                composition: form.composition,
                manufacturer: form.manufacturer,
                requiresPrescription: form.requiresPrescription
            });
            dispatch({ type: 'ADD_CUSTOM_PROD', payload: product });
            onToast(`"${form.name}" added`, 'success');
            onClose();
        } catch (e) {
            onToast('Failed to add product: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ p: 0 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                        px: 3,
                        py: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <AddCircle sx={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                Add Custom Item
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                Add a new product to your catalog
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Basic Info */}
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Basic Information
                    </Typography>
                    <TextField
                        label="Product Name" fullWidth size="small" required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="Price (₹)" type="number" size="small" required sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}
                            value={form.price}
                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                            inputProps={{ min: 0, step: 0.5 }}
                        />
                        <FormControl size="small" sx={{ flex: 1, minWidth: { xs: '100%', sm: 100 } }}>
                            <InputLabel>Unit</InputLabel>
                            <Select
                                label="Unit"
                                value={form.unit}
                                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                            >
                                {['pc', 'pack', 'set', 'roll', 'box', 'kg', 'm', 'ft', 'ltr'].map(u => (
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ flex: 1, minWidth: { xs: '100%', sm: 120 } }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                label="Category"
                                value={form.cat}
                                onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
                            >
                                {['plumbing', 'electrical', 'tools', 'paint', 'hardware', 'other'].map(c => (
                                    <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Details */}
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '1px', mt: 1 }}>
                        Details
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="SKU (optional)" size="small" sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}
                            value={form.sku}
                            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                        />
                        <TextField
                            label="Icon (emoji)" size="small"
                            value={form.icon}
                            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                            sx={{ width: { xs: '100%', sm: 100 } }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="Composition / Generic Name" size="small" sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}
                            value={form.composition}
                            onChange={e => setForm(f => ({ ...f, composition: e.target.value }))}
                        />
                        <TextField
                            label="Manufacturer" size="small" sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}
                            value={form.manufacturer}
                            onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: isDark ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.03)',
                            border: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0,0,0,0.04)'}`,
                        }}
                    >
                        <Typography variant="body2" fontWeight={500}>Requires Prescription?</Typography>
                        <Switch
                            checked={form.requiresPrescription}
                            onChange={e => setForm(f => ({ ...f, requiresPrescription: e.target.checked }))}
                            color="primary"
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2.5 }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleAdd} disabled={saving}
                    sx={{
                        borderRadius: 2.5,
                        minWidth: 140,
                        background: 'linear-gradient(135deg, #10b981, #34d399)',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            boxShadow: '0 6px 24px rgba(16, 185, 129, 0.5)',
                        },
                    }}
                >
                    {saving ? 'Adding…' : 'Add Product'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
