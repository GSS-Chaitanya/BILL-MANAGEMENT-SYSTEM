import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, Typography, IconButton, List, ListItem,
    ListItemText, ListItemSecondaryAction, Divider, Select, MenuItem,
    FormControl, InputLabel, Chip, Avatar, Tooltip,
    InputAdornment, Badge, LinearProgress, Fade, Zoom, Snackbar
} from '@mui/material';
import {
    Close, Edit, Delete, AddBox, PhotoCamera, Inventory2,
    Search, FilterList, CheckCircle, Warning, Star,
    LocalPharmacy, BuildCircle, ElectricBolt, FormatPaint,
    Category, MedicalServices, Science, Medication, MoreVert,
    Download, Print, ContentCopy, QrCode2, Refresh
} from '@mui/icons-material';
import { useBill } from '../../store/BillContext.jsx';
import { addProduct, updateProduct, deleteProduct, uploadImage } from '../../services/api.js';

const PALETTE = {
    ink: '#0A0A0F',
    surface: '#F8F8FC',
    panel: '#FFFFFF',
    border: '#E8E8F0',
    borderStrong: '#C8C8DC',
    accent: '#4F46E5',
    accentLight: '#EEF2FF',
    accentMid: '#818CF8',
    success: '#059669',
    successLight: '#ECFDF5',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    muted: '#6B7280',
    mutedLight: '#F3F4F6',
    text: '#111827',
    textSub: '#6B7280',
};

const CAT_META = {
    plumbing: { icon: '🔧', color: '#0EA5E9', bg: '#F0F9FF', label: 'Plumbing' },
    electrical: { icon: '⚡', color: '#F59E0B', bg: '#FFFBEB', label: 'Electrical' },
    tools: { icon: '🛠️', color: '#6B7280', bg: '#F9FAFB', label: 'Tools' },
    paint: { icon: '🎨', color: '#EC4899', bg: '#FDF2F8', label: 'Paint' },
    hardware: { icon: '⚙️', color: '#8B5CF6', bg: '#F5F3FF', label: 'Hardware' },
    tablets: { icon: '💊', color: '#059669', bg: '#ECFDF5', label: 'Tablets' },
    syrups: { icon: '🧪', color: '#0891B2', bg: '#ECFEFF', label: 'Syrups' },
    injections: { icon: '💉', color: '#DC2626', bg: '#FEF2F2', label: 'Injections' },
    other: { icon: '📦', color: '#6B7280', bg: '#F9FAFB', label: 'Other' },
};

const UNITS = ['pc', 'pack', 'set', 'roll', 'box', 'kg', 'm', 'ft', 'ltr'];

/** Auto-generate a SKU from product name + category */
function generateSKU(name, cat) {
    const prefix = (cat || 'GEN').slice(0, 3).toUpperCase();
    const namePart = (name || 'PRD')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase()
        .padEnd(4, 'X');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${namePart}-${suffix}`;
}

const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    .adm-root * { font-family: 'DM Sans', sans-serif !important; box-sizing: border-box; }
    .adm-mono { font-family: 'DM Mono', monospace !important; }

    .adm-dialog .MuiDialog-paper {
        border-radius: 20px !important;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06) !important;
        background: ${PALETTE.surface} !important;
        max-height: 92vh;
    }

    .adm-field .MuiOutlinedInput-root {
        border-radius: 10px !important;
        background: ${PALETTE.panel} !important;
        transition: box-shadow 0.2s, border-color 0.2s;
        font-size: 14px !important;
        height: 40px !important;
    }
    .adm-field .MuiOutlinedInput-input {
        padding-top: 8.5px !important;
        padding-bottom: 8.5px !important;
        height: auto !important;
    }
    .adm-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
        border-color: ${PALETTE.accentMid} !important;
    }
    .adm-field .MuiOutlinedInput-root.Mui-focused {
        box-shadow: 0 0 0 3px ${PALETTE.accentLight} !important;
    }
    .adm-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${PALETTE.accent} !important;
        border-width: 1.5px !important;
    }
    .adm-field .MuiInputLabel-root.Mui-focused { color: ${PALETTE.accent} !important; }
    .adm-field .MuiInputLabel-root { font-size: 13px !important; font-weight: 500 !important; }

    .adm-select .MuiOutlinedInput-root {
        border-radius: 10px !important;
        background: ${PALETTE.panel} !important;
        font-size: 14px !important;
        height: 40px !important;
    }
    .adm-select .MuiSelect-select {
        padding-top: 8.5px !important;
        padding-bottom: 8.5px !important;
    }
    .adm-select .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${PALETTE.accent} !important;
        border-width: 1.5px !important;
    }
    .adm-select .MuiOutlinedInput-root.Mui-focused {
        box-shadow: 0 0 0 3px ${PALETTE.accentLight} !important;
    }
    .adm-select .MuiInputLabel-root.Mui-focused { color: ${PALETTE.accent} !important; }
    .adm-select .MuiInputLabel-root { font-size: 13px !important; font-weight: 500 !important; }

    .prod-row {
        transition: background 0.15s, transform 0.15s;
        border-radius: 12px !important;
        cursor: pointer;
    }
    .prod-row:hover { background: ${PALETTE.accentLight} !important; }
    .prod-row.editing { background: ${PALETTE.accentLight} !important; border: 1.5px solid ${PALETTE.accentMid} !important; }

    .adm-btn-primary {
        background: linear-gradient(135deg, ${PALETTE.accent} 0%, #6366F1 100%) !important;
        color: white !important;
        border-radius: 10px !important;
        text-transform: none !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        letter-spacing: -0.01em !important;
        box-shadow: 0 4px 14px rgba(79,70,229,0.35) !important;
        transition: all 0.2s !important;
        padding: 9px 22px !important;
    }
    .adm-btn-primary:hover {
        box-shadow: 0 6px 20px rgba(79,70,229,0.45) !important;
        transform: translateY(-1px) !important;
    }
    .adm-btn-ghost {
        color: ${PALETTE.muted} !important;
        border: 1px solid ${PALETTE.border} !important;
        border-radius: 10px !important;
        text-transform: none !important;
        font-weight: 500 !important;
        font-size: 14px !important;
        background: ${PALETTE.panel} !important;
        transition: all 0.15s !important;
        padding: 9px 18px !important;
    }
    .adm-btn-ghost:hover {
        border-color: ${PALETTE.accentMid} !important;
        color: ${PALETTE.accent} !important;
        background: ${PALETTE.accentLight} !important;
    }

    .upload-zone {
        border: 1.5px dashed ${PALETTE.borderStrong};
        border-radius: 14px;
        background: ${PALETTE.panel};
        padding: 16px;
        transition: all 0.2s;
        cursor: pointer;
    }
    .upload-zone:hover {
        border-color: ${PALETTE.accentMid};
        background: ${PALETTE.accentLight};
    }

    .section-label {
        font-size: 10px !important;
        font-weight: 700 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
        color: ${PALETTE.accentMid} !important;
    }

    .cat-chip {
        border-radius: 8px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        height: 22px !important;
    }
    .price-chip {
        border-radius: 7px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        height: 22px !important;
        font-family: 'DM Mono', monospace !important;
    }

    .search-bar .MuiOutlinedInput-root {
        border-radius: 10px !important;
        background: ${PALETTE.surface} !important;
        font-size: 13px !important;
    }

    .stats-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: ${PALETTE.accentLight};
        color: ${PALETTE.accent};
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }

    .adm-divider { border-color: ${PALETTE.border} !important; }
    
    .scrollbar-thin::-webkit-scrollbar { width: 5px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: ${PALETTE.borderStrong}; border-radius: 99px; }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: ${PALETTE.accentMid}; }

    .progress-upload {
        border-radius: 99px !important;
        background: ${PALETTE.border} !important;
    }
    .progress-upload .MuiLinearProgress-bar {
        background: linear-gradient(90deg, ${PALETTE.accent}, ${PALETTE.accentMid}) !important;
        border-radius: 99px !important;
    }

    @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-in { animation: fadeSlideUp 0.3s ease both; }

    /* QR Modal enhancements */
    @keyframes qrReveal {
        from { opacity: 0; transform: scale(0.92) translateY(12px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .qr-modal-card { animation: qrReveal 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }

    .qr-action-btn {
        flex: 1;
        border-radius: 10px !important;
        text-transform: none !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        padding: 8px 10px !important;
        transition: all 0.18s !important;
        gap: 5px !important;
    }

    @media print {
        .qr-print-area {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 24px !important;
        }
    }
`;

function StatBadge({ count, label, color = PALETTE.accent }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2, py: 0.5 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{count}</Typography>
            <Typography sx={{ fontSize: 10, color: PALETTE.textSub, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
        </Box>
    );
}

function useQRLib() {
    const [ready, setReady] = useState(!!window.QRCode);
    useEffect(() => {
        if (window.QRCode) { setReady(true); return; }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.onload = () => setReady(true);
        document.head.appendChild(s);
    }, []);
    return ready;
}

function QRModal({ product, onClose: closeQR, onToast }) {
    const { sku, name: productName, price, unit, cat } = product;
    const qrRef = useRef(null);
    const qrReady = useQRLib();
    const [dataUrl, setDataUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [qrSize, setQrSize] = useState(200);
    const [qrColor, setQrColor] = useState(PALETTE.ink);
    const meta = CAT_META[cat] || CAT_META.other;

    const buildQR = useCallback(() => {
        if (!qrReady || !qrRef.current) return;
        qrRef.current.innerHTML = '';
        new window.QRCode(qrRef.current, {
            text: sku,
            width: qrSize,
            height: qrSize,
            colorDark: qrColor,
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel.H,
        });
        setTimeout(() => {
            const canvas = qrRef.current?.querySelector('canvas');
            const img = qrRef.current?.querySelector('img');
            if (canvas) setDataUrl(canvas.toDataURL('image/png'));
            else if (img) setDataUrl(img.src);
        }, 120);
    }, [qrReady, sku, qrSize, qrColor]);

    useEffect(() => { buildQR(); }, [buildQR]);

    const handleDownload = () => {
        if (!dataUrl) return;
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qr-${sku}.png`;
        a.click();
        onToast && onToast('QR Code downloaded', 'success');
    };

    const handleCopySKU = () => {
        navigator.clipboard.writeText(sku).then(() => {
            setCopied(true);
            onToast && onToast('SKU copied to clipboard', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => {
        if (!dataUrl) return;
        const win = window.open('', '_blank', 'width=400,height=500');
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Label – ${sku}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=DM+Mono:wght@500&display=swap');
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'DM Sans', sans-serif; background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
                    .label {
                        border: 2px solid #E8E8F0;
                        border-radius: 16px;
                        padding: 24px 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 14px;
                        width: 280px;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    }
                    .cat-badge {
                        background: ${meta.bg};
                        color: ${meta.color};
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.04em;
                        text-transform: uppercase;
                    }
                    .product-name {
                        font-size: 16px;
                        font-weight: 700;
                        color: #111827;
                        text-align: center;
                        letter-spacing: -0.01em;
                    }
                    .qr-img { border-radius: 10px; border: 1.5px solid #E8E8F0; padding: 8px; }
                    .sku-box {
                        background: #F3F4F6;
                        border-radius: 8px;
                        padding: 7px 16px;
                        font-family: 'DM Mono', monospace;
                        font-size: 13px;
                        font-weight: 600;
                        color: #111827;
                        letter-spacing: 0.06em;
                        width: 100%;
                        text-align: center;
                    }
                    .price-row {
                        display: flex;
                        align-items: baseline;
                        gap: 4px;
                    }
                    .price { font-size: 22px; font-weight: 700; color: #4F46E5; font-family: 'DM Mono', monospace; }
                    .price-unit { font-size: 11px; color: #6B7280; font-weight: 600; }
                    .footer { font-size: 10px; color: #9CA3AF; letter-spacing: 0.04em; }
                </style>
            </head>
            <body>
                <div class="label">
                    <div class="cat-badge">${meta.icon} ${meta.label}</div>
                    <div class="product-name">${productName}</div>
                    <img class="qr-img" src="${dataUrl}" width="180" height="180" />
                    <div class="sku-box">${sku}</div>
                    <div class="price-row">
                        <span class="price">₹${parseFloat(price).toFixed(2)}</span>
                        <span class="price-unit">/ ${unit}</span>
                    </div>
                    <div class="footer">Scan to identify product</div>
                </div>
            </body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 400);
    };

    const colorOptions = [PALETTE.ink, '#4F46E5', '#059669', '#DC2626', '#0EA5E9'];

    return (
        <Box sx={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={closeQR}>
            <Box onClick={e => e.stopPropagation()} className="qr-modal-card" sx={{
                background: PALETTE.panel,
                borderRadius: '22px',
                p: 0,
                width: 320,
                boxShadow: '0 40px 100px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.06)',
                border: `1px solid ${PALETTE.border}`,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Modal Header */}
                <Box sx={{
                    px: 2.5, py: 2,
                    background: `linear-gradient(135deg, ${PALETTE.ink} 0%, #1E1B4B 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{
                            width: 28, height: 28, borderRadius: '8px',
                            background: 'rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <QrCode2 sx={{ color: 'white', fontSize: 16 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                                QR Code
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 500 }}>
                                {productName}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={closeQR} sx={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', '&:hover': { background: 'rgba(255,255,255,0.15)', color: 'white' } }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>

                {/* Product Info Strip */}
                <Box sx={{ px: 2.5, py: 1.5, background: meta.bg, borderBottom: `1px solid ${meta.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography sx={{ fontSize: 18 }}>{meta.icon}</Typography>
                        <Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{meta.label}</Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: PALETTE.text }}>{productName}</Typography>
                        </Box>
                    </Box>
                    <Box textAlign="right">
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: PALETTE.accent, fontFamily: 'DM Mono, monospace' }}>
                            ₹{parseFloat(price).toFixed(2)}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: PALETTE.textSub }}>per {unit}</Typography>
                    </Box>
                </Box>

                {/* QR Display */}
                <Box sx={{ px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 220, height: 220,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: `2px solid ${PALETTE.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#fff',
                        p: 1.5,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        position: 'relative',
                    }}>
                        {!qrReady ? (
                            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                <LinearProgress sx={{ width: 80, borderRadius: 99 }} />
                                <Typography sx={{ fontSize: 11, color: PALETTE.muted }}>Generating…</Typography>
                            </Box>
                        ) : (
                            <Box ref={qrRef} sx={{ '& canvas, & img': { display: 'block', width: '100% !important', height: '100% !important' } }} />
                        )}
                    </Box>

                    {/* Color picker */}
                    <Box display="flex" flexDirection="column" alignItems="center" gap={0.75} width="100%">
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: PALETTE.textSub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>QR Color</Typography>
                        <Box display="flex" gap={0.75} alignItems="center">
                            {colorOptions.map(c => (
                                <Box
                                    key={c}
                                    onClick={() => setQrColor(c)}
                                    sx={{
                                        width: 22, height: 22,
                                        borderRadius: '50%',
                                        background: c,
                                        cursor: 'pointer',
                                        border: qrColor === c ? `3px solid ${PALETTE.accentMid}` : `2px solid ${PALETTE.border}`,
                                        transition: 'transform 0.15s, border 0.15s',
                                        '&:hover': { transform: 'scale(1.2)' }
                                    }}
                                />
                            ))}
                            <Tooltip title="Regenerate QR" arrow>
                                <IconButton size="small" onClick={buildQR} sx={{ width: 22, height: 22, borderRadius: '50%', background: PALETTE.mutedLight, color: PALETTE.muted, '&:hover': { background: PALETTE.accentLight, color: PALETTE.accent } }}>
                                    <Refresh sx={{ fontSize: 13 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* SKU display with copy */}
                    <Box
                        onClick={handleCopySKU}
                        sx={{
                            background: copied ? PALETTE.successLight : PALETTE.surface,
                            border: `1.5px solid ${copied ? PALETTE.success + '44' : PALETTE.border}`,
                            borderRadius: '10px',
                            px: 2, py: 1,
                            width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: PALETTE.accentMid, background: PALETTE.accentLight },
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: 9, fontWeight: 700, color: copied ? PALETTE.success : PALETTE.textSub, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.2 }}>
                                {copied ? '✓ Copied!' : 'SKU / Barcode'}
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PALETTE.text, fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>
                                {sku}
                            </Typography>
                        </Box>
                        <ContentCopy sx={{ fontSize: 14, color: copied ? PALETTE.success : PALETTE.muted }} />
                    </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', gap: 1 }}>
                    <Button
                        className="qr-action-btn"
                        startIcon={<Print sx={{ fontSize: '15px !important' }} />}
                        onClick={handlePrint}
                        disabled={!dataUrl}
                        sx={{
                            border: `1px solid ${PALETTE.border}`,
                            color: PALETTE.muted,
                            background: PALETTE.panel,
                            '&:hover': { borderColor: PALETTE.accentMid, color: PALETTE.accent, background: PALETTE.accentLight },
                            '&:disabled': { opacity: 0.4 }
                        }}
                    >
                        Print Label
                    </Button>
                    <Button
                        className="qr-action-btn"
                        startIcon={<Download sx={{ fontSize: '15px !important' }} />}
                        onClick={handleDownload}
                        disabled={!dataUrl}
                        sx={{
                            background: `linear-gradient(135deg, ${PALETTE.accent}, #6366F1)`,
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                            '&:hover': { boxShadow: '0 6px 18px rgba(79,70,229,0.4)' },
                            '&:disabled': { opacity: 0.5 }
                        }}
                    >
                        Download PNG
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default function AdminDashboardModal({ onClose, onToast }) {
    const { state, dispatch } = useBill();
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [qrProduct, setQrProduct] = useState(null);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: '', price: '', unit: 'pc', cat: 'hardware', sku: '', imageUrl: ''
    });

    const categories = ['plumbing', 'electrical', 'tools', 'paint', 'hardware', 'other'];
    const allProducts = [...(state.products || []), ...(state.customProds || [])];

    const filtered = allProducts.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'all' || p.cat === filterCat;
        return matchSearch && matchCat;
    });

    const catCounts = categories.reduce((acc, c) => { acc[c] = allProducts.filter(p => p.cat === c).length; return acc; }, {});

    const resetForm = () => {
        setForm({ name: '', price: '', unit: 'pc', cat: 'hardware', sku: '', imageUrl: '' });
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { onToast('File too large (Max 5MB)', 'error'); return; }
        setUploading(true);
        setUploadProgress(0);
        const timer = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 200);
        try {
            const data = await uploadImage(file);
            setUploadProgress(100);
            setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
            setForm(prev => ({ ...prev, imageUrl: data.url }));
            onToast('Image uploaded successfully', 'success');
        } catch {
            onToast('Image upload failed', 'error');
            setUploading(false);
        } finally {
            clearInterval(timer);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) { onToast('Name and price are required', 'warning'); return; }
        try {
            // Auto-generate SKU if not present (editing may already have one)
            const sku = form.sku || generateSKU(form.name, form.cat);
            const payload = { ...form, sku, price: parseFloat(form.price) };
            if (editingId) {
                await updateProduct(editingId, payload);
                onToast(`"${form.name}" updated successfully`, 'success');
            } else {
                const product = await addProduct(payload);
                dispatch({ type: 'ADD_CUSTOM_PROD', payload: product });
                onToast(`"${form.name}" added to catalog`, 'success');
            }
            resetForm();
        } catch (error) {
            onToast('Failed to save: ' + (error.response?.data?.error || error.message), 'error');
        }
    };

    const handleEdit = (prod) => {
        setForm({ name: prod.name, price: prod.price, unit: prod.unit, cat: prod.cat, sku: prod.sku || '', imageUrl: prod.imageUrl || '' });
        setEditingId(prod._id);
    };

    const handleDelete = async (prod) => {
        if (!window.confirm(`Delete "${prod.name}"? This action cannot be undone.`)) return;
        try {
            if (prod._id) await deleteProduct(prod._id);
            dispatch({ type: 'DELETE_PROD', payload: prod.id });
            onToast(`"${prod.name}" removed from catalog`, 'info');
        } catch {
            onToast('Failed to delete product', 'error');
        }
    };

    const catMeta = CAT_META[form.cat] || CAT_META.other;

    return (
        <>
            <style>{globalStyles}</style>
            <Dialog open maxWidth="xl" fullWidth onClose={onClose} className="adm-dialog adm-root">
                {/* ── HEADER ── */}
                <Box sx={{
                    px: 3, py: 2,
                    background: `linear-gradient(135deg, ${PALETTE.ink} 0%, #1E1B4B 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: `1px solid rgba(255,255,255,0.08)`
                }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(79,70,229,0.5)'
                        }}>
                            <Inventory2 sx={{ color: 'white', fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                Product Catalog Management
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Administrator Console
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, background: 'rgba(255,255,255,0.06)', borderRadius: '12px', px: 1, border: '1px solid rgba(255,255,255,0.08)' }}>
                            <StatBadge count={allProducts.length} label="Products" color="#818CF8" />
                            <Box sx={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />
                            <StatBadge count={categories.length} label="Categories" color="#34D399" />
                        </Box>
                        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', '&:hover': { background: 'rgba(255,255,255,0.15)', color: 'white' } }}>
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <DialogContent sx={{ p: 0, display: 'flex', gap: 0, flexDirection: { xs: 'column', md: 'row' }, background: PALETTE.surface, overflow: 'hidden', maxHeight: 'calc(92vh - 65px)' }}>
                    {/* ── LEFT PANEL: FORM ── */}
                    <Box component="form" onSubmit={handleSubmit} sx={{
                        width: { xs: '100%', md: 420 },
                        minWidth: { md: 420 },
                        background: PALETTE.panel,
                        borderRight: `1px solid ${PALETTE.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Form header */}
                        <Box sx={{
                            px: 3, py: 2,
                            borderBottom: `1px solid ${PALETTE.border}`,
                            background: editingId ? PALETTE.accentLight : PALETTE.panel,
                            transition: 'background 0.3s'
                        }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: editingId ? PALETTE.accent : PALETTE.text, letterSpacing: '-0.01em' }}>
                                        {editingId ? '✏️  Editing Product' : '✦  New Product'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: PALETTE.textSub, mt: 0.2 }}>
                                        {editingId ? 'Modify the fields below and save' : 'Fill in the details to add to catalog'}
                                    </Typography>
                                </Box>
                                {editingId && (
                                    <Chip label="Editing" size="small" sx={{ background: PALETTE.accentLight, color: PALETTE.accent, fontWeight: 700, fontSize: 11, border: `1px solid ${PALETTE.accentMid}` }} />
                                )}
                            </Box>
                        </Box>

                        {/* Scrollable form body */}
                        <Box className="scrollbar-thin" sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                            {/* Image Upload */}
                            <Box>
                                <Typography className="section-label" sx={{ mb: 1 }}>Product Visual</Typography>
                                <Box className="upload-zone" onClick={() => !uploading && fileInputRef.current?.click()}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box sx={{
                                            width: 72, height: 72, borderRadius: '12px',
                                            background: catMeta.bg,
                                            border: `2px solid ${form.imageUrl ? PALETTE.accent : PALETTE.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', transition: 'border-color 0.2s', flexShrink: 0
                                        }}>
                                            {form.imageUrl ? (
                                                <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Typography sx={{ fontSize: 32 }}>{catMeta.icon}</Typography>
                                            )}
                                        </Box>
                                        <Box flex={1}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: PALETTE.text }}>
                                                {uploading ? 'Uploading…' : form.imageUrl ? 'Image Ready' : 'Upload Image'}
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: PALETTE.textSub, mt: 0.3 }}>
                                                JPEG, PNG or WebP · Max 5MB
                                            </Typography>
                                            {uploading && <LinearProgress className="progress-upload" variant="determinate" value={uploadProgress} sx={{ mt: 1, height: 4 }} />}
                                            {!uploading && (
                                                <Box display="flex" gap={1} mt={1}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<PhotoCamera sx={{ fontSize: '13px !important' }} />}
                                                        onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                        sx={{ fontSize: 11, py: 0.4, px: 1.2, borderRadius: '7px', textTransform: 'none', borderColor: PALETTE.border, color: PALETTE.muted, '&:hover': { borderColor: PALETTE.accent, color: PALETTE.accent, background: PALETTE.accentLight } }}
                                                    >
                                                        {form.imageUrl ? 'Change' : 'Select'}
                                                    </Button>
                                                    {form.imageUrl && (
                                                        <Button size="small" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, imageUrl: '' })); }}
                                                            sx={{ fontSize: 11, py: 0.4, px: 1.2, borderRadius: '7px', textTransform: 'none', color: PALETTE.danger, '&:hover': { background: PALETTE.dangerLight } }}>
                                                            Remove
                                                        </Button>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} ref={fileInputRef} />
                                </Box>
                            </Box>

                            {/* Core Info */}
                            <Box>
                                <Typography className="section-label" sx={{ mb: 1.5 }}>Core Information</Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                                    <TextField
                                        className="adm-field"
                                        label="Product Name *"
                                        size="small"
                                        fullWidth
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />

                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 96px', gap: 1.5, alignItems: 'start' }}>
                                        <TextField
                                            className="adm-field"
                                            label="Price *"
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            inputProps={{ min: 0, step: 0.5 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography sx={{ fontSize: 13, color: PALETTE.muted, fontWeight: 600, lineHeight: 1 }}>₹</Typography>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <FormControl className="adm-select" size="small" fullWidth>
                                            <InputLabel>Unit</InputLabel>
                                            <Select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} label="Unit">
                                                {UNITS.map(u => <MenuItem key={u} value={u} sx={{ fontSize: 13 }}>{u}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <FormControl className="adm-select" size="small" fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={form.cat}
                                            onChange={e => setForm({ ...form, cat: e.target.value })}
                                            label="Category"
                                            renderValue={(val) => (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography sx={{ fontSize: 15, lineHeight: 1 }}>{CAT_META[val]?.icon}</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{CAT_META[val]?.label}</Typography>
                                                </Box>
                                            )}
                                        >
                                            {categories.map(c => (
                                                <MenuItem key={c} value={c}>
                                                    <Box display="flex" alignItems="center" gap={1.5} width="100%">
                                                        <Typography sx={{ fontSize: 16 }}>{CAT_META[c]?.icon}</Typography>
                                                        <Typography sx={{ fontSize: 13, flex: 1, textTransform: 'capitalize' }}>{CAT_META[c]?.label}</Typography>
                                                        {catCounts[c] > 0 && <Typography sx={{ fontSize: 11, color: PALETTE.muted, background: PALETTE.mutedLight, px: 1, py: 0.2, borderRadius: 4 }}>{catCounts[c]}</Typography>}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Auto-SKU notice */}
                            <Box sx={{
                                background: PALETTE.accentLight,
                                border: `1px solid ${PALETTE.accentMid}33`,
                                borderRadius: '10px',
                                px: 2, py: 1.25,
                                display: 'flex', alignItems: 'center', gap: 1,
                            }}>
                                <QrCode2 sx={{ fontSize: 16, color: PALETTE.accentMid }} />
                                <Typography sx={{ fontSize: 11, color: PALETTE.accent, fontWeight: 500, lineHeight: 1.4 }}>
                                    A unique SKU and QR code will be <strong>auto-generated</strong> when you save this product.
                                </Typography>
                            </Box>

                        </Box>

                        {/* Form Footer */}
                        <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${PALETTE.border}`, background: PALETTE.panel, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                            {editingId && (
                                <Button className="adm-btn-ghost" onClick={resetForm}>Cancel</Button>
                            )}
                            <Button type="submit" className="adm-btn-primary" disableElevation>
                                {editingId ? 'Save Changes' : '+ Add to Catalog'}
                            </Button>
                        </Box>
                    </Box>

                    {/* ── RIGHT PANEL: CATALOG ── */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: PALETTE.surface }}>
                        {/* Catalog Header */}
                        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${PALETTE.border}`, background: PALETTE.panel }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: PALETTE.text }}>Product Catalog</Typography>
                                    <span className="stats-pill">{filtered.length} / {allProducts.length}</span>
                                </Box>
                            </Box>
                            <Box display="flex" gap={1.5} alignItems="center">
                                <TextField
                                    className="search-bar adm-field"
                                    size="small"
                                    placeholder="Search by name or SKU…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    sx={{ flex: 1 }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: PALETTE.muted }} /></InputAdornment>
                                    }}
                                />
                                <FormControl className="adm-select" size="small" sx={{ minWidth: 140 }}>
                                    <Select
                                        value={filterCat}
                                        onChange={e => setFilterCat(e.target.value)}
                                        displayEmpty
                                        renderValue={(val) => val === 'all' ? (
                                            <Box display="flex" alignItems="center" gap={0.8}>
                                                <FilterList sx={{ fontSize: 14, color: PALETTE.muted }} />
                                                <Typography sx={{ fontSize: 12, color: PALETTE.muted }}>All Categories</Typography>
                                            </Box>
                                        ) : (
                                            <Box display="flex" alignItems="center" gap={0.8}>
                                                <Typography sx={{ fontSize: 14 }}>{CAT_META[val]?.icon}</Typography>
                                                <Typography sx={{ fontSize: 12, textTransform: 'capitalize' }}>{CAT_META[val]?.label}</Typography>
                                            </Box>
                                        )}
                                    >
                                        <MenuItem value="all"><Typography sx={{ fontSize: 13, color: PALETTE.muted }}>All Categories</Typography></MenuItem>
                                        <Divider />
                                        {categories.map(c => (
                                            <MenuItem key={c} value={c}>
                                                <Box display="flex" alignItems="center" gap={1} width="100%">
                                                    <Typography sx={{ fontSize: 15 }}>{CAT_META[c]?.icon}</Typography>
                                                    <Typography sx={{ fontSize: 13, flex: 1, textTransform: 'capitalize' }}>{CAT_META[c]?.label}</Typography>
                                                    {catCounts[c] > 0 && <Typography sx={{ fontSize: 10, color: PALETTE.muted, background: PALETTE.mutedLight, px: 0.8, borderRadius: 3 }}>{catCounts[c]}</Typography>}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        {/* Category quick-filters */}
                        <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${PALETTE.border}`, display: 'flex', gap: 0.75, flexWrap: 'wrap', background: PALETTE.panel }}>
                            {[{ key: 'all', label: 'All', count: allProducts.length }, ...categories.map(c => ({ key: c, label: CAT_META[c]?.label, count: catCounts[c] }))].map(({ key, label, count }) => (
                                <Chip
                                    key={key}
                                    label={`${key !== 'all' ? CAT_META[key]?.icon + ' ' : ''}${label} ${count}`}
                                    size="small"
                                    onClick={() => setFilterCat(key)}
                                    sx={{
                                        height: 24, fontSize: 11,
                                        fontWeight: filterCat === key ? 700 : 500,
                                        cursor: 'pointer',
                                        background: filterCat === key ? PALETTE.accentLight : PALETTE.surface,
                                        color: filterCat === key ? PALETTE.accent : PALETTE.muted,
                                        border: `1px solid ${filterCat === key ? PALETTE.accentMid : PALETTE.border}`,
                                        borderRadius: '8px', transition: 'all 0.15s',
                                        '&:hover': { background: PALETTE.accentLight, color: PALETTE.accent }
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Product List */}
                        <Box className="scrollbar-thin" sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                            {filtered.length === 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 1 }}>
                                    <Typography sx={{ fontSize: 36 }}>🗂️</Typography>
                                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: PALETTE.text }}>No products found</Typography>
                                    <Typography sx={{ fontSize: 12, color: PALETTE.textSub }}>
                                        {search ? 'Try a different search term' : 'Add your first product using the form'}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {filtered.map((p, i) => {
                                        const meta = CAT_META[p.cat] || CAT_META.other;
                                        const isEditing = editingId === p._id;
                                        return (
                                            <Box
                                                key={p.id || p._id || i}
                                                className={`prod-row animate-in ${isEditing ? 'editing' : ''}`}
                                                sx={{
                                                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                                                    background: PALETTE.panel,
                                                    border: `1px solid ${isEditing ? PALETTE.accentMid : PALETTE.border}`,
                                                    animationDelay: `${i * 20}ms`
                                                }}
                                                onClick={() => handleEdit(p)}
                                            >
                                                {/* Avatar */}
                                                <Box sx={{
                                                    width: 48, height: 48, borderRadius: '12px',
                                                    background: meta.bg, border: `1px solid ${meta.color}22`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    overflow: 'hidden', flexShrink: 0
                                                }}>
                                                    {p.imageUrl ? (
                                                        <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Typography sx={{ fontSize: 22 }}>{meta.icon}</Typography>
                                                    )}
                                                </Box>

                                                {/* Details */}
                                                <Box flex={1} minWidth={0}>
                                                    <Box display="flex" alignItems="center" gap={0.75} mb={0.25} flexWrap="wrap">
                                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: PALETTE.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {p.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
                                                        <Chip
                                                            className="cat-chip"
                                                            label={`${meta.icon} ${meta.label}`}
                                                            size="small"
                                                            sx={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33` }}
                                                        />
                                                        {p.sku && (
                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                <Typography className="adm-mono" sx={{ fontSize: 10, color: PALETTE.muted, background: PALETTE.mutedLight, px: 0.8, py: 0.2, borderRadius: '5px' }}>
                                                                    {p.sku}
                                                                </Typography>
                                                                <Tooltip title="QR Code · Download · Print" arrow>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={e => { e.stopPropagation(); setQrProduct(p); }}
                                                                        sx={{ width: 20, height: 20, borderRadius: '5px', color: PALETTE.accentMid, p: 0, border: `1px solid ${PALETTE.accentMid}44`, background: PALETTE.accentLight, '&:hover': { background: PALETTE.accent, color: 'white', border: `1px solid ${PALETTE.accent}` } }}
                                                                    >
                                                                        <QrCode2 sx={{ fontSize: 13 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Price */}
                                                <Box textAlign="right" flexShrink={0}>
                                                    <Typography className="adm-mono" sx={{ fontSize: 14, fontWeight: 700, color: PALETTE.text }}>
                                                        ₹{parseFloat(p.price).toFixed(2)}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 10, color: PALETTE.textSub }}>per {p.unit}</Typography>
                                                </Box>

                                                {/* Actions */}
                                                <Box display="flex" gap={0.5} flexShrink={0} onClick={e => e.stopPropagation()}>
                                                    <Tooltip title="Edit" arrow>
                                                        <IconButton size="small" onClick={() => handleEdit(p)} sx={{ width: 30, height: 30, borderRadius: '8px', color: isEditing ? PALETTE.accent : PALETTE.muted, background: isEditing ? PALETTE.accentLight : 'transparent', '&:hover': { background: PALETTE.accentLight, color: PALETTE.accent } }}>
                                                            <Edit sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete" arrow>
                                                        <IconButton size="small" onClick={() => handleDelete(p)} sx={{ width: 30, height: 30, borderRadius: '8px', color: PALETTE.muted, '&:hover': { background: PALETTE.dangerLight, color: PALETTE.danger } }}>
                                                            <Delete sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>

                        {/* Footer */}
                        <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${PALETTE.border}`, background: PALETTE.panel, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: 11, color: PALETTE.textSub }}>
                                Click any product to edit · Click <QrCode2 sx={{ fontSize: 12, verticalAlign: 'middle', color: PALETTE.accentMid }} /> to view QR
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: PALETTE.muted, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircle sx={{ fontSize: 12, color: PALETTE.success }} />
                                {allProducts.length} product{allProducts.length !== 1 ? 's' : ''} in catalog
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {qrProduct && (
                <QRModal
                    product={qrProduct}
                    onClose={() => setQrProduct(null)}
                    onToast={onToast}
                />
            )}
        </>
    );
}