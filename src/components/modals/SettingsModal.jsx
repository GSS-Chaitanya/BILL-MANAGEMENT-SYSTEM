import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, Typography, IconButton, useTheme
} from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import { useBill } from '../../store/BillContext.jsx';
import { updateSettings } from '../../services/api.js';

export default function SettingsModal({ onClose, onToast }) {
    const { state, dispatch } = useBill();
    const [form, setForm] = useState({ ...state.settings });
    const [saving, setSaving] = useState(false);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    async function handleSave() {
        setSaving(true);
        try {
            const updated = await updateSettings(form);
            dispatch({ type: 'SET_SETTINGS', payload: updated });
            onToast('Settings saved', 'success');
            onClose();
        } catch (e) {
            onToast('Failed to save settings: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ p: 0 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)',
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
                                bgcolor: 'rgba(255,255,255,0.18)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Settings sx={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                Business Settings
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Configure your store details
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff' } }}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Business Name" fullWidth size="small"
                        value={form.businessName}
                        onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                    />
                    <TextField
                        label="Address" fullWidth size="small" multiline rows={2}
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="GSTIN" size="small" sx={{ flex: 2 }}
                            value={form.gstin}
                            onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))}
                        />
                        <TextField
                            label="Default GST (%)" type="number" size="small" sx={{ flex: 1 }}
                            value={form.defaultGST}
                            onChange={e => setForm(f => ({ ...f, defaultGST: parseInt(e.target.value) || 0 }))}
                            inputProps={{ min: 0, max: 100 }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ borderRadius: 2.5 }}>Cancel</Button>
                <Button
                    variant="contained" onClick={handleSave} disabled={saving}
                    sx={{ borderRadius: 2.5, minWidth: 140 }}
                >
                    {saving ? 'Saving…' : 'Save Settings'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
