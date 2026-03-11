import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, IconButton, Grid, Paper, Chip, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Tab, Tabs
} from '@mui/material';
import { Close, Warning, ErrorOutline, LocalShipping, Inventory2, Add } from '@mui/icons-material';
import { useInventory } from '../../store/InventoryContext.jsx';
import { formatCurrency } from '../../utils/format.js';

function AlertCard({ title, count, icon, color }) {
    return (
        <Paper elevation={0} sx={{ p: 2, bgcolor: `${color}.50`, border: 1, borderColor: `${color}.200`, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${color}.100`, color: `${color}.main`, display: 'flex' }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" color={`${color}.dark`} fontWeight={700} lineHeight={1}>
                        {count}
                    </Typography>
                    <Typography variant="body2" color={`${color}.800`} fontWeight={500} sx={{ mt: 0.5 }}>
                        {title}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}

export default function InventoryDashboardModal({ onClose, onOpenStockInward }) {
    const { state } = useInventory();
    const [tab, setTab] = useState(0);

    const { alerts, batches } = state;
    const lowStockCount = alerts.lowStock.length;
    const nearExpiryCount = alerts.nearExpiry.length;
    
    // Calculate total inventory value
    const totalValue = batches.reduce((sum, batch) => sum + (batch.quantity * batch.purchasePrice), 0);

    return (
        <Dialog open maxWidth="lg" fullWidth onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Inventory2 color="primary" />
                    <Typography variant="h6">Inventory Dashboard</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={onOpenStockInward}
                        size="small"
                    >
                        Stock Inward (Purchase)
                    </Button>
                    <IconButton onClick={onClose} size="small"><Close /></IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ bgcolor: 'grey.50', p: { xs: 1.5, sm: 3 } }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <AlertCard 
                            title="Low Stock Alerts" 
                            count={lowStockCount} 
                            icon={<Warning />} 
                            color="warning" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <AlertCard 
                            title="Near Expiry Warnings" 
                            count={nearExpiryCount} 
                            icon={<ErrorOutline />} 
                            color="error" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <AlertCard 
                            title="Total Stock Value" 
                            count={formatCurrency(totalValue)} 
                            icon={<LocalShipping />} 
                            color="success" 
                        />
                    </Grid>
                </Grid>

                <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label="Low Stock Items" />
                        <Tab label="Near Expiry Items" />
                        <Tab label="All Batches" />
                    </Tabs>
                    
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Batch No</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell align="right">Qty</TableCell>
                                    <TableCell align="right">MRP / Selling Price</TableCell>
                                    <TableCell>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tab === 0 && alerts.lowStock.map(batch => (
                                    <TableRow key={batch._id}>
                                        <TableCell>{batch.productId?.name}</TableCell>
                                        <TableCell>{batch.batchNumber}</TableCell>
                                        <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <Chip size="small" label={batch.quantity} color="warning" />
                                        </TableCell>
                                        <TableCell align="right">{formatCurrency(batch.mrp || batch.sellingPrice)}</TableCell>
                                        <TableCell>{batch.rackLocation || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {tab === 1 && alerts.nearExpiry.map(batch => (
                                    <TableRow key={batch._id}>
                                        <TableCell>{batch.productId?.name}</TableCell>
                                        <TableCell>{batch.batchNumber}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label={new Date(batch.expiryDate).toLocaleDateString()} color="error" />
                                        </TableCell>
                                        <TableCell align="right">{batch.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(batch.mrp || batch.sellingPrice)}</TableCell>
                                        <TableCell>{batch.rackLocation || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {tab === 2 && batches.map(batch => (
                                    <TableRow key={batch._id}>
                                        <TableCell>{batch.productId?.name}</TableCell>
                                        <TableCell>{batch.batchNumber}</TableCell>
                                        <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">{batch.quantity}</TableCell>
                                        <TableCell align="right">{formatCurrency(batch.mrp || batch.sellingPrice)}</TableCell>
                                        <TableCell>{batch.rackLocation || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {(tab === 0 && alerts.lowStock.length === 0) && (
                                    <TableRow><TableCell colSpan={6} align="center">No low stock alerts</TableCell></TableRow>
                                )}
                                {(tab === 1 && alerts.nearExpiry.length === 0) && (
                                    <TableRow><TableCell colSpan={6} align="center">No near expiry warnings</TableCell></TableRow>
                                )}
                                {(tab === 2 && batches.length === 0) && (
                                    <TableRow><TableCell colSpan={6} align="center">No inventory batches found</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
