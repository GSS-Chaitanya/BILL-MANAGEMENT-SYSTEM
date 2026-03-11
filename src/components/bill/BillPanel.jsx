import React, { useState } from 'react';
import {
    Paper, Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
    IconButton, Button, Chip, Divider, Collapse, useTheme, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Fade
} from '@mui/material';
import {
    Delete, Add, Remove, ExpandMore, Save, Print, RestartAlt, Receipt
} from '@mui/icons-material';
import { useBill } from '../../store/BillContext.jsx';
import CustomerAutocomplete from './CustomerAutocomplete.jsx';
import { saveBill } from '../../services/api.js';
import { pad } from '../../utils/format.js';
import { buildBillHTML, printViaIframe } from '../../utils/print.js';

const GST_RATES = [0, 5, 12, 18, 28];

export default function BillPanel({ onToast }) {
    const { state, dispatch, calcTotals, ep } = useBill();
    const { cart, customer, discount, currentGSTRate, invNum, notes } = state;
    const [notesOpen, setNotesOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { sub, gst, total } = calcTotals();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    function handleClearBill() {
        if (!cart.length) return;
        setConfirmOpen(true);
    }

    function confirmClear() {
        setConfirmOpen(false);
        dispatch({ type: 'CLEAR_BILL' });
        onToast('Bill cleared', 'info');
    }

    async function handleSave(andPrint = false) {
        if (!cart.length) { onToast('No items to save', 'warning'); return; }
        setSaving(true);
        const now = new Date();
        const afterD = sub * (1 - (discount || 0) / 100);
        const bill = {
            invNum,
            date: now.getTime(),
            dateStr: now.toISOString().slice(0, 10),
            hour: now.getHours(),
            weekday: now.getDay(),
            customer: customer.name || 'Walk-in',
            phone: customer.phone,
            address: customer.address,
            billType: customer.billType || 'Retail',
            items: cart.map(c => ({
                id: c.id, name: c.name, cat: c.cat, sku: c.sku,
                batchId: c.batchId,
                qty: c.qty, unitPrice: ep(c), total: ep(c) * c.qty,
            })),
            subtotal: +sub.toFixed(2),
            discount: discount || 0,
            gstRate: currentGSTRate,
            gst: +gst.toFixed(2),
            total: +total.toFixed(2),
            notes: notes || '',
        };
        try {
            await saveBill(bill);
            if (andPrint) {
                printViaIframe(buildBillHTML(bill));
                await new Promise(r => setTimeout(r, 400));
            }
            dispatch({ type: 'INCREMENT_INV' });
            onToast(`Bill #${bill.invNum} saved — new bill #${pad(invNum + 1)} ready`, 'success');
        } catch (e) {
            onToast('Save failed: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                border: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
                display: 'flex',
                flexDirection: 'column',
                height: { md: 'calc(100vh - 88px)' },
                overflow: 'hidden',
                background: isDark
                    ? 'linear-gradient(180deg, rgba(20, 24, 40, 0.95), rgba(20, 24, 40, 0.85))'
                    : '#ffffff',
            }}
        >
            {/* Bill Header */}
            <Box sx={{ p: 2, pb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1.5,
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Receipt sx={{ fontSize: 16, color: '#fff' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Current Bill
                        </Typography>
                        <Chip
                            label={cart.reduce((s, c) => s + c.qty, 0)}
                            size="small"
                            sx={{
                                height: 24,
                                minWidth: 24,
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                color: '#fff',
                                fontSize: '0.75rem',
                            }}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1,
                            py: 0.3,
                            borderRadius: 1.5,
                            bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 700,
                                fontFamily: '"Inter", monospace',
                                fontSize: '0.72rem',
                            }}
                        >
                            #{pad(invNum)}
                        </Typography>
                    </Box>
                </Box>

                {/* Customer form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <CustomerAutocomplete />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                        <TextField
                            label="Phone" size="small" fullWidth
                            value={customer.phone} placeholder="Mobile number"
                            onChange={e => dispatch({ type: 'SET_CUSTOMER', payload: { phone: e.target.value } })}
                        />
                        <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
                            <InputLabel>Type</InputLabel>
                            <Select
                                label="Type"
                                value={customer.billType}
                                onChange={e => dispatch({ type: 'SET_CUSTOMER', payload: { billType: e.target.value } })}
                            >
                                {['Retail', 'Wholesale', 'Contractor', 'Credit'].map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField
                        label="Address" size="small" fullWidth
                        value={customer.address} placeholder="Optional"
                        onChange={e => dispatch({ type: 'SET_CUSTOMER', payload: { address: e.target.value } })}
                    />
                </Box>
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Bill Items */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
                {cart.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h3" sx={{ mb: 1, opacity: 0.5 }}>🧾</Typography>
                        <Typography color="text.secondary" fontWeight={500}>Click on products to add to this bill</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, opacity: 0.6 }}>
                            Items will appear here
                        </Typography>
                    </Box>
                ) : (
                    cart.map((item, index) => (
                        <Fade in key={`${item.id}-${item.batchId || 'no-batch'}`} timeout={200 + index * 50}>
                            <Box>
                                <BillRow item={item} dispatch={dispatch} ep={ep} imgSrc={state.productImages[item.id]} isDark={isDark} />
                            </Box>
                        </Fade>
                    ))
                )}
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Summary */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    background: isDark
                        ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.04), transparent)'
                        : 'linear-gradient(180deg, rgba(99, 102, 241, 0.02), transparent)',
                }}
            >
                <SummaryRow label="Subtotal" value={`₹${sub.toFixed(2)}`} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Discount (%)</Typography>
                    <TextField
                        type="number" size="small" variant="outlined"
                        value={discount}
                        onChange={e => dispatch({ type: 'SET_DISCOUNT', payload: parseFloat(e.target.value) || 0 })}
                        inputProps={{ min: 0, max: 100, style: { textAlign: 'right', width: 60, padding: '4px 8px' } }}
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" component="span">
                            GST ({currentGSTRate}%)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {GST_RATES.map(r => (
                                <Chip
                                    key={r}
                                    label={`${r}%`}
                                    size="small"
                                    variant={currentGSTRate === r ? 'filled' : 'outlined'}
                                    onClick={() => dispatch({ type: 'SET_GST_RATE', payload: r })}
                                    sx={{
                                        height: 24,
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        fontWeight: currentGSTRate === r ? 700 : 400,
                                        ...(currentGSTRate === r && {
                                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                            color: '#fff',
                                        }),
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>₹{gst.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1, opacity: 0.4 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                    <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        ₹{total.toFixed(2)}
                    </Typography>
                </Box>
            </Box>

            {/* Notes */}
            <Box sx={{ px: 2, pb: 1 }}>
                <Button
                    size="small" fullWidth
                    onClick={() => setNotesOpen(o => !o)}
                    endIcon={<ExpandMore sx={{ transform: notesOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
                    sx={{ justifyContent: 'space-between', textTransform: 'none', color: 'text.secondary', borderRadius: 2 }}
                >
                    Add Notes / Remarks
                </Button>
                <Collapse in={notesOpen}>
                    <TextField
                        multiline rows={2} fullWidth size="small"
                        value={notes} placeholder="e.g. Delivery instructions, payment terms…"
                        onChange={e => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
                        sx={{ mt: 1 }}
                    />
                </Collapse>
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Footer Actions */}
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined" color="inherit" size="small"
                    startIcon={<RestartAlt />}
                    onClick={handleClearBill}
                    sx={{
                        flex: 1,
                        borderRadius: 2.5,
                        borderColor: isDark ? 'rgba(139, 149, 179, 0.15)' : 'rgba(0,0,0,0.1)',
                    }}
                >
                    Clear
                </Button>
                <Button
                    variant="outlined" color="primary" size="small"
                    startIcon={<Save />}
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    sx={{ flex: 1, borderRadius: 2.5 }}
                >
                    Save
                </Button>
                <Button
                    variant="contained" color="primary" size="small"
                    startIcon={<Print />}
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    sx={{
                        flex: 1.6,
                        borderRadius: 2.5,
                        py: 0.9,
                    }}
                >
                    Save & Print
                </Button>
            </Box>

            {/* Clear Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Clear Bill?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to clear all items from this bill? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setConfirmOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button onClick={confirmClear} color="error" variant="contained" sx={{ borderRadius: 2 }}>Clear</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

function SummaryRow({ label, value }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={500}>{value}</Typography>
        </Box>
    );
}

function BillRow({ item, dispatch, ep, imgSrc, isDark }) {
    const effectivePrice = ep(item);
    const changed = item.customPrice !== null && item.customPrice !== undefined && item.customPrice !== item.price;
    const rowTotal = effectivePrice * item.qty;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexWrap: 'wrap',
                gap: { xs: 0, sm: 1 },
                py: 1.2,
                px: 1,
                my: 0.3,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                    bgcolor: isDark ? 'rgba(99, 102, 241, 0.04)' : 'rgba(99, 102, 241, 0.02)',
                },
            }}
        >
            {/* Product info */}
            <Box sx={{ flex: 1, minWidth: { xs: '80%', sm: 0 }, display: 'flex', alignItems: 'center', gap: 1 }}>
                {imgSrc ? (
                    <Box component="img" src={imgSrc} sx={{ width: 30, height: 30, borderRadius: 1.5, objectFit: 'cover' }} />
                ) : (
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.icon || '📦'}</Typography>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.3 }}>
                        {item.name}
                        {item.batchId && (
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                    ml: 0.5,
                                    px: 0.5,
                                    py: 0.1,
                                    borderRadius: 0.5,
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    color: 'primary.main',
                                    fontSize: '0.6rem',
                                    fontWeight: 600,
                                }}
                            >
                                Batch
                            </Typography>
                        )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block' }} noWrap>
                        {item.cat} · {item.sku || 'custom'}
                    </Typography>
                </Box>
            </Box>

            {/* Second Row on Mobile / Rest of row on Desktop */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    mt: { xs: 1, sm: 0 },
                }}
            >
                {/* Qty controls */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0,
                        borderRadius: 2,
                        border: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.1)' : 'rgba(0,0,0,0.06)'}`,
                        p: 0.2,
                    }}
                >
                    <IconButton size="small" onClick={() => dispatch({ type: 'CHANGE_QTY', payload: { id: item.id, batchId: item.batchId, delta: -1 } })}>
                        <Remove sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 22, textAlign: 'center', fontSize: '0.85rem' }}>
                        {item.qty}
                    </Typography>
                    <IconButton size="small" onClick={() => dispatch({ type: 'CHANGE_QTY', payload: { id: item.id, batchId: item.batchId, delta: 1 } })}>
                        <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                </Box>

                {/* Price */}
                <TextField
                    type="number" size="small" variant="outlined"
                    value={effectivePrice}
                    onChange={e => dispatch({ type: 'UPDATE_ROW_PRICE', payload: { id: item.id, batchId: item.batchId, val: e.target.value } })}
                    onClick={e => e.stopPropagation()}
                    inputProps={{ min: 0, step: 0.5, style: { textAlign: 'right', width: 58, padding: '4px 8px', fontSize: '0.8rem' } }}
                    sx={changed ? { '& .MuiOutlinedInput-root': { borderColor: 'warning.main' } } : {}}
                />

                {/* Total */}
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60, textAlign: 'right', fontSize: '0.85rem' }}>
                    ₹{rowTotal.toFixed(2)}
                </Typography>
            </Box>

            {/* Remove */}
            <IconButton
                size="small"
                onClick={() => dispatch({ type: 'REMOVE_ROW', payload: { id: item.id, batchId: item.batchId } })}
                sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                }}
            >
                <Delete sx={{ fontSize: 16 }} />
            </IconButton>
        </Box>
    );
}
