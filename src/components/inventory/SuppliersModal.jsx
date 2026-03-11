import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, Typography, IconButton, List, ListItem,
    ListItemText, ListItemSecondaryAction, Divider, Paper, Stack,
    Tooltip
} from '@mui/material';
import { Close, Edit, Delete, Add, Business } from '@mui/icons-material';
import { useInventory } from '../../store/InventoryContext.jsx';

export default function SuppliersModal({ onClose, onToast }) {
    const { state, handleAddSupplier, handleUpdateSupplier, handleDeleteSupplier } = useInventory();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', contactPerson: '', phone: '', email: '', address: '', gstin: ''
    });

    const resetForm = () => {
        setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await handleUpdateSupplier(editingId, formData);
                onToast('Supplier updated successfully', 'success');
            } else {
                await handleAddSupplier(formData);
                onToast('Supplier added successfully', 'success');
            }
            resetForm();
        } catch (error) {
            onToast(error.message || 'Failed to save supplier', 'error');
        }
    };

    const handleEdit = (supplier) => {
        setFormData(supplier);
        setEditingId(supplier._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await handleDeleteSupplier(id);
            onToast('Supplier deleted', 'info');
        } catch (error) {
            onToast('Failed to delete supplier', 'error');
        }
    };

    return (
        <Dialog open maxWidth="md" fullWidth onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Business color="primary" />
                    <Typography variant="h6">Supplier Management</Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><Close /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Form Section */}
                <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        {editingId ? 'Edit Supplier' : 'Add New Supplier'}
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            size="small" label="Supplier / Company Name" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            size="small" label="Contact Person"
                            value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                size="small" label="Phone" fullWidth
                                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <TextField
                                size="small" label="Email" type="email" fullWidth
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Stack>
                        <TextField
                            size="small" label="GSTIN"
                            value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                        />
                        <TextField
                            size="small" label="Address" multiline rows={2}
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                        <Box display="flex" gap={1} justifyContent="flex-end">
                            {editingId && <Button onClick={resetForm}>Cancel</Button>}
                            <Button type="submit" variant="contained" startIcon={editingId ? <Edit /> : <Add />}>
                                {editingId ? 'Update Supplier' : 'Add Supplier'}
                            </Button>
                        </Box>
                    </Stack>
                </Box>

                {/* List Section */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 300 } }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Saved Suppliers ({state.suppliers.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <List disablePadding>
                            {state.suppliers.length === 0 && (
                                <ListItem>
                                    <ListItemText secondary="No suppliers added yet." />
                                </ListItem>
                            )}
                            {state.suppliers.map((supplier, index) => (
                                <React.Fragment key={supplier._id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={<Typography variant="subtitle2">{supplier.name}</Typography>}
                                            secondary={
                                                <>
                                                    <Typography variant="caption" display="block">{supplier.contactPerson} - {supplier.phone}</Typography>
                                                    {supplier.gstin && <Typography variant="caption" color="text.secondary">GSTIN: {supplier.gstin}</Typography>}
                                                </>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleEdit(supplier)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(supplier._id)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < state.suppliers.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
