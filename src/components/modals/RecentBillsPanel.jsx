import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Box, Typography, IconButton,
    List, ListItem, ListItemText, ListItemSecondaryAction, Chip, CircularProgress, Divider, Button
} from '@mui/material';
import { Close, Delete, Print } from '@mui/icons-material';
import { fetchBills, deleteBill } from '../../services/api.js';
import { buildBillHTML, printViaIframe } from '../../utils/print.js';

export default function RecentBillsPanel({ onClose, onToast }) {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchBills()
            .then(data => { setBills(data); setLoading(false); })
            .catch(e => { onToast('Failed to load bills', 'error'); setLoading(false); });
    }, []);

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            await deleteBill(deleteTarget._id);
            setBills(b => b.filter(x => x._id !== deleteTarget._id));
            onToast(`Bill #${deleteTarget.invNum} deleted`, 'info');
        } catch (e) {
            onToast('Failed to delete: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setDeleteTarget(null);
        }
    }

    function handleReprint(bill) {
        printViaIframe(buildBillHTML(bill));
    }

    return (
        <>
            <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>Recent Bills</Typography>
                    <IconButton onClick={onClose} size="small"><Close /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : bills.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
                            <Typography color="text.secondary">No saved bills yet</Typography>
                        </Box>
                    ) : (
                        <List dense>
                            {bills.map(bill => (
                                <ListItem key={bill._id} divider sx={{ px: 2 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    Bill #{bill.invNum}
                                                </Typography>
                                                <Chip
                                                    label={bill.billType}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {bill.customer} · ₹{bill.total?.toFixed(2)} · {new Date(bill.date).toLocaleDateString()}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton size="small" onClick={() => handleReprint(bill)} title="Reprint">
                                            <Print fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(bill)} title="Delete">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete Bill?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete Bill #{deleteTarget?.invNum}? Stock will be restored for any batch-linked items.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
