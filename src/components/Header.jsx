import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, IconButton, Avatar, Box, Menu, MenuItem,
    Tooltip, ListItemIcon, ListItemText, Divider, Chip
} from '@mui/material';
import {
    DarkMode, LightMode, Logout, Settings, Analytics, ReceiptLong,
    Inventory, Add, Keyboard, Inventory2, Business, KeyboardArrowDown
} from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { fireAuth } from '../firebase.js';
import { useBill } from '../store/BillContext.jsx';
import { pad } from '../utils/format.js';

/* ─── Injected styles ────────────────────────────────────────────── */
const HEADER_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap');

.hdr-root * { font-family: 'Roboto', sans-serif !important; }

@keyframes hdr-slide-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes hdr-pulse-badge {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  50%       { box-shadow: 0 0 0 5px rgba(99,102,241,0); }
}
@keyframes hdr-logo-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.hdr-root { animation: hdr-slide-in 0.4s ease both; }

/* ── Pill action buttons ── */
.hdr-action-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 8px;
  border: none; cursor: pointer; background: transparent;
  font-size: 12px; font-weight: 500; letter-spacing: 0.01em;
  transition: background 0.18s ease, color 0.18s ease, transform 0.15s ease;
  position: relative; white-space: nowrap;
}
.hdr-action-pill:hover { transform: translateY(-1px); }
.hdr-action-pill svg { font-size: 15px !important; transition: transform 0.2s ease; }
.hdr-action-pill:hover svg { transform: scale(1.15); }

/* ── Group label ── */
.hdr-group-label {
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; opacity: 0.45; padding: 0 4px 4px;
  display: block;
}

/* ── Menu items ── */
.hdr-menu-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border: none; background: none;
  cursor: pointer; width: 100%; text-align: left;
  border-radius: 8px; transition: background 0.15s;
  font-size: 13.5px; font-weight: 500;
}

/* ── Avatar ring pulse when hovering ── */
.hdr-avatar-btn:hover .hdr-avatar-ring {
  animation: hdr-pulse-badge 1.2s ease infinite;
}

/* ── Invoice badge ── */
.hdr-inv-badge {
  animation: hdr-pulse-badge 3s ease-in-out infinite;
}

/* ── Separator line ── */
.hdr-sep {
  width: 1px; height: 22px; margin: 0 6px;
  background: rgba(150,160,200,0.15);
  flex-shrink: 0;
}
`;

/* ─── Icon button wrapper ────────────────────────────────────────── */
function ActionBtn({ icon, label, onClick, isDark, highlight = false, color }) {
    const baseColor = highlight
        ? (isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)')
        : 'transparent';
    const hoverColor = highlight
        ? (isDark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.16)')
        : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)');

    return (
        <Tooltip title={label} arrow placement="bottom">
            <button
                onClick={onClick}
                className="hdr-action-pill"
                style={{
                    background: baseColor,
                    color: color || (isDark ? 'rgba(220,225,255,0.75)' : 'rgba(30,30,60,0.65)'),
                }}
                onMouseEnter={e => e.currentTarget.style.background = hoverColor}
                onMouseLeave={e => e.currentTarget.style.background = baseColor}
            >
                {React.cloneElement(icon, { style: { fontSize: 16, color: color || 'inherit' } })}
                <span style={{ fontSize: 11.5, fontFamily: "'Roboto', sans-serif" }}>{label}</span>
            </button>
        </Tooltip>
    );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function Header({
    currentUser, onLogout, isDark, toggleTheme,
    onOpenProductMgr, onOpenCustom, onOpenAnalytics,
    onOpenRecent, onOpenSettings, onOpenShortcuts,
    onOpenInventory, onOpenSuppliers
}) {
    const { state } = useBill();
    const [anchorEl, setAnchorEl] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    async function handleLogout() {
        await signOut(fireAuth);
        onLogout();
    }

    const userInitial = (currentUser?.displayName || currentUser?.email || '?')[0].toUpperCase();
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
    const businessName = state.settings?.businessName || 'Srinivasa Hardwares';

    /* ── Dynamic colour tokens ── */
    const tk = {
        bg:         isDark ? 'rgba(10,12,24,0.92)'   : 'rgba(255,255,255,0.92)',
        border:     isDark ? 'rgba(99,102,241,0.1)'  : 'rgba(99,102,241,0.1)',
        shadow:     scrolled
            ? (isDark ? '0 4px 32px rgba(0,0,0,0.55)' : '0 4px 24px rgba(80,80,160,0.1)')
            : 'none',
        text:       isDark ? '#e8eaff' : '#1a1c2e',
        textSub:    isDark ? 'rgba(180,185,240,0.55)' : 'rgba(40,40,80,0.5)',
        accent:     '#6366f1',
        accentSoft: isDark ? 'rgba(99,102,241,0.18)'  : 'rgba(99,102,241,0.1)',
        menuBg:     isDark ? '#111420' : '#ffffff',
        menuBdr:    isDark ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.08)',
        divider:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        danger:     '#ef4444',
    };

    return (
        <>
            <style>{HEADER_STYLES}</style>

            <AppBar
                className="hdr-root"
                position="sticky"
                elevation={0}
                sx={{
                    background: tk.bg,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    borderBottom: `1px solid ${tk.border}`,
                    boxShadow: tk.shadow,
                    transition: 'box-shadow 0.3s ease, background 0.3s ease',
                    color: tk.text,
                }}
            >
                <Toolbar sx={{
                    gap: 0, px: { xs: 2, sm: 3 },
                    minHeight: { xs: 58, sm: 62 },
                    display: 'flex', alignItems: 'center',
                }}>

                    {/* ── Brand section ── */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 3, flexShrink: 0 }}>
                        {/* Logo */}
                        <Box
                            onClick={onOpenProductMgr}
                            sx={{
                                width: 36, height: 36, borderRadius: '11px', flexShrink: 0,
                                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 55%, #818cf8 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1) rotate(-6deg)',
                                    boxShadow: '0 6px 24px rgba(99,102,241,0.55)',
                                },
                                '&::after': {
                                    content: '""', position: 'absolute', inset: 0,
                                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%)',
                                },
                            }}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="white" style={{ position: 'relative', zIndex: 1 }}>
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </Box>

                        {/* Name + invoice number */}
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography sx={{
                                fontWeight: 700, fontSize: 14.5, color: tk.text,
                                letterSpacing: '-0.02em', lineHeight: 1.15,
                                fontFamily: "'Roboto', sans-serif",
                            }}>
                                {businessName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2 }}>
                                <Typography sx={{
                                    fontSize: 11, color: tk.textSub,
                                    fontFamily: "'Roboto', sans-serif", fontWeight: 400,
                                }}>
                                    Invoice
                                </Typography>
                                <Box
                                    className="hdr-inv-badge"
                                    sx={{
                                        background: tk.accentSoft,
                                        color: tk.accent,
                                        px: 0.75, py: 0.1,
                                        borderRadius: '5px',
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        fontFamily: "'Roboto', monospace",
                                        border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    #{pad(state.invNum)}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* ── Desktop action groups ── */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center', gap: 0.25, flex: 1,
                    }}>
                        {/* Catalog group */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <ActionBtn icon={<Inventory />}  label="Products"    onClick={onOpenProductMgr} isDark={isDark} />
                            <ActionBtn icon={<Add />}        label="Custom Item" onClick={onOpenCustom}     isDark={isDark} />
                        </Box>

                        <Box className="hdr-sep" />

                        {/* Inventory group */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <ActionBtn icon={<Inventory2 />} label="Inventory"  onClick={onOpenInventory} isDark={isDark} highlight color={tk.accent} />
                            <ActionBtn icon={<Business />}   label="Suppliers"  onClick={onOpenSuppliers} isDark={isDark} />
                        </Box>

                        <Box className="hdr-sep" />

                        {/* Reports group */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <ActionBtn icon={<Analytics />}    label="Analytics"     onClick={onOpenAnalytics} isDark={isDark} />
                            <ActionBtn icon={<ReceiptLong />}  label="Recent Bills"  onClick={onOpenRecent}    isDark={isDark} />
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1 }} />

                    {/* ── Right controls ── */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

                        {/* Theme toggle */}
                        <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'} arrow>
                            <IconButton
                                onClick={toggleTheme}
                                size="small"
                                sx={{
                                    borderRadius: '9px', p: 0.85,
                                    color: isDark ? '#fbbf24' : 'rgba(40,40,80,0.6)',
                                    background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(0,0,0,0.04)',
                                    border: `1px solid ${isDark ? 'rgba(251,191,36,0.15)' : 'rgba(0,0,0,0.07)'}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(0,0,0,0.08)',
                                        transform: 'rotate(20deg) scale(1.08)',
                                    },
                                }}
                            >
                                {isDark
                                    ? <LightMode sx={{ fontSize: 16, color: '#fbbf24' }} />
                                    : <DarkMode  sx={{ fontSize: 16 }} />
                                }
                            </IconButton>
                        </Tooltip>

                        {/* User account button */}
                        <Tooltip title="Account" arrow>
                            <Box
                                className="hdr-avatar-btn"
                                onClick={e => setAnchorEl(e.currentTarget)}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.8,
                                    pl: 0.75, pr: 1, py: 0.5,
                                    borderRadius: '22px', cursor: 'pointer',
                                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.14)'}`,
                                    background: isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.04)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.09)',
                                        borderColor: 'rgba(99,102,241,0.35)',
                                    },
                                }}
                            >
                                {/* Avatar with gradient ring */}
                                <Box
                                    className="hdr-avatar-ring"
                                    sx={{
                                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)',
                                        p: '1.5px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Avatar
                                        src={currentUser?.photoURL}
                                        sx={{
                                            width: 25, height: 25,
                                            bgcolor: isDark ? '#1a1e32' : '#ededfa',
                                            color: '#6366f1',
                                            fontSize: '0.68rem', fontWeight: 700,
                                        }}
                                    >
                                        {userInitial}
                                    </Avatar>
                                </Box>

                                {/* Name — hidden on small screens */}
                                <Typography sx={{
                                    display: { xs: 'none', lg: 'block' },
                                    fontSize: 12.5, fontWeight: 600, color: tk.text,
                                    fontFamily: "'Roboto', sans-serif", lineHeight: 1,
                                    maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {userName}
                                </Typography>

                                <KeyboardArrowDown sx={{ fontSize: 14, color: tk.textSub, display: { xs: 'none', lg: 'block' } }} />
                            </Box>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ── Dropdown menu ── */}
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: {
                    elevation: 0,
                    sx: {
                        minWidth: 238, mt: 1,
                        borderRadius: '14px',
                        background: tk.menuBg,
                        border: `1px solid ${tk.menuBdr}`,
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden',
                        boxShadow: isDark
                            ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)'
                            : '0 12px 40px rgba(80,80,160,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
                        '&::before': {
                            content: '""', display: 'block', position: 'absolute',
                            top: -1, right: 20, width: 10, height: 10,
                            background: tk.menuBg,
                            transform: 'translateY(-50%) rotate(45deg)',
                            borderLeft: `1px solid ${tk.menuBdr}`,
                            borderTop: `1px solid ${tk.menuBdr}`,
                            zIndex: 0,
                        },
                    },
                }}}
            >
                {/* User info header */}
                <Box sx={{
                    px: 2, pt: 2, pb: 1.5,
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(99,102,241,0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(129,140,248,0.03) 100%)',
                    borderBottom: `1px solid ${tk.divider}`,
                    position: 'relative', zIndex: 1,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #818cf8, #a78bfa)',
                            p: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Avatar
                                src={currentUser?.photoURL}
                                sx={{ width: 36, height: 36, bgcolor: isDark ? '#1a1e32' : '#ededfa', color: '#6366f1', fontSize: '0.85rem', fontWeight: 700 }}
                            >
                                {userInitial}
                            </Avatar>
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: tk.text, letterSpacing: '-0.01em', lineHeight: 1.2, fontFamily: "'Roboto', sans-serif" }}>
                                {currentUser?.displayName || 'User'}
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: tk.textSub, fontFamily: "'Roboto', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150, mt: 0.2 }}>
                                {currentUser?.email}
                            </Typography>
                        </Box>
                    </Box>
                    {/* Active pill */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 1.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                        <Typography sx={{ fontSize: 10.5, color: '#34d399', fontWeight: 600, fontFamily: "'Roboto', sans-serif", letterSpacing: '0.04em' }}>
                            Active session
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Typography sx={{ fontSize: 10, color: tk.textSub, fontFamily: "'Roboto', sans-serif" }}>
                            {businessName}
                        </Typography>
                    </Box>
                </Box>

                {/* Menu items */}
                <Box sx={{ p: 1, position: 'relative', zIndex: 1 }}>
                    {[
                        { label: 'Settings',          icon: <Settings sx={{ fontSize: 16 }} />,  action: onOpenSettings,  desc: 'Preferences & configuration' },
                        { label: 'Keyboard Shortcuts', icon: <Keyboard sx={{ fontSize: 16 }} />,  action: onOpenShortcuts, desc: 'View all hotkeys' },
                    ].map(({ label, icon, action, desc }) => (
                        <MenuItem
                            key={label}
                            onClick={() => { setAnchorEl(null); action?.(); }}
                            sx={{
                                borderRadius: '9px', py: 1.1, px: 1.5, gap: 1.25,
                                color: tk.text,
                                transition: 'background 0.15s',
                                '&:hover': { background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)' },
                            }}
                        >
                            <Box sx={{
                                width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                                background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#818cf8',
                            }}>
                                {icon}
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: tk.text, lineHeight: 1.2, fontFamily: "'Roboto', sans-serif" }}>{label}</Typography>
                                <Typography sx={{ fontSize: 10.5, color: tk.textSub, fontFamily: "'Roboto', sans-serif" }}>{desc}</Typography>
                            </Box>
                        </MenuItem>
                    ))}

                    <Divider sx={{ my: 0.75, borderColor: tk.divider }} />

                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            borderRadius: '9px', py: 1.1, px: 1.5, gap: 1.25,
                            color: tk.danger,
                            transition: 'background 0.15s',
                            '&:hover': { background: 'rgba(239,68,68,0.08)' },
                        }}
                    >
                        <Box sx={{
                            width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                            background: 'rgba(239,68,68,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Logout sx={{ fontSize: 15, color: tk.danger }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: tk.danger, lineHeight: 1.2, fontFamily: "'Roboto', sans-serif" }}>Sign Out</Typography>
                            <Typography sx={{ fontSize: 10.5, color: 'rgba(239,68,68,0.6)', fontFamily: "'Roboto', sans-serif" }}>End your session</Typography>
                        </Box>
                    </MenuItem>
                </Box>
            </Menu>
        </>
    );
}