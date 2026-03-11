import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, CircularProgress, Fade, InputAdornment, IconButton } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import {
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, updateProfile
} from 'firebase/auth';
import { fireAuth } from '../firebase.js';

/* ─── Design tokens ──────────────────────────────────────────────── */
const C = {
    bg:           '#080B14',
    bgGrad:       'radial-gradient(ellipse at 60% 0%, #0f1535 0%, #080B14 55%)',
    glass:        'rgba(13,17,35,0.82)',
    glassBorder:  'rgba(99,102,241,0.18)',
    leftPanel:    'linear-gradient(160deg, #3730a3 0%, #4f46e5 40%, #6366f1 70%, #818cf8 100%)',
    fieldBg:      'rgba(255,255,255,0.04)',
    fieldBorder:  'rgba(255,255,255,0.1)',
    fieldHover:   'rgba(99,102,241,0.35)',
    fieldFocus:   '#6366f1',
    accent:       '#6366f1',
    accentGlow:   'rgba(99,102,241,0.22)',
    accentLight:  '#818cf8',
    accentSoft:   'rgba(99,102,241,0.1)',
    text:         '#f0f2ff',
    textSub:      'rgba(200,205,240,0.6)',
    textMuted:    'rgba(150,160,200,0.35)',
    success:      '#34d399',
    successBg:    'rgba(52,211,153,0.08)',
    successBdr:   'rgba(52,211,153,0.2)',
    danger:       '#f87171',
    dangerBg:     'rgba(248,113,113,0.08)',
    dangerBdr:    'rgba(248,113,113,0.2)',
    divider:      'rgba(99,102,241,0.12)',
    white:        '#ffffff',
};

/* ─── Particle canvas ────────────────────────────────────────────── */
function ParticleCanvas() {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf, t = 0;
        const particles = Array.from({ length: 55 }, () => ({
            x: Math.random(), y: Math.random(),
            r: 0.5 + Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.00015,
            vy: (Math.random() - 0.5) * 0.00015,
            op: 0.1 + Math.random() * 0.45,
            phase: Math.random() * Math.PI * 2,
        }));
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);
        const draw = () => {
            const { width: w, height: h } = canvas;
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = (particles[i].x - particles[j].x) * w;
                    const dy = (particles[i].y - particles[j].y) * h;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x * w, particles[i].y * h);
                        ctx.lineTo(particles[j].x * w, particles[j].y * h);
                        ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.6; ctx.stroke();
                    }
                }
            }
            particles.forEach(p => {
                const pulse = p.op * (0.7 + 0.3 * Math.sin(t * 1.2 + p.phase));
                ctx.beginPath();
                ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(129,140,248,${pulse})`; ctx.fill();
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
                if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
            });
            t += 0.018;
            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; }
.auth-root { font-family: 'Roboto', sans-serif; }
.auth-root * { font-family: 'Roboto', sans-serif !important; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes orb1 {
  0%, 100% { transform: translate(0,0) scale(1); }
  33%       { transform: translate(30px,-20px) scale(1.1); }
  66%       { transform: translate(-15px,25px) scale(0.95); }
}
@keyframes orb2 {
  0%, 100% { transform: translate(0,0); }
  50%       { transform: translate(-25px,-15px); }
}
@keyframes progressFill { from { width: 0; } }
@keyframes tabFormIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.auth-card-enter  { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
.auth-logo-enter  { animation: scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
.auth-title-enter { animation: fadeUp 0.5s ease 0.3s both; }
.auth-form-enter  { animation: tabFormIn 0.35s ease both; }
.feat-item        { opacity: 0; animation: slideRight 0.5s ease forwards; }

/* ── Roboto MUI fields ── */
.auth-field .MuiOutlinedInput-root {
  background: ${C.fieldBg} !important;
  border-radius: 12px !important;
  height: 52px !important;
  transition: box-shadow 0.25s ease, border-color 0.25s ease !important;
}
.auth-field .MuiOutlinedInput-input {
  color: ${C.text} !important;
  font-size: 14px !important; font-weight: 400 !important;
  padding: 14px 14px 14px 0 !important;
  caret-color: ${C.accentLight} !important;
}
.auth-field .MuiOutlinedInput-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 100px rgba(13,17,40,0.95) inset !important;
  -webkit-text-fill-color: ${C.text} !important;
}
.auth-field .MuiOutlinedInput-notchedOutline {
  border-color: ${C.fieldBorder} !important; border-width: 1px !important;
  transition: border-color 0.25s !important;
}
.auth-field .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
  border-color: ${C.fieldHover} !important;
}
.auth-field .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
  border-color: ${C.fieldFocus} !important; border-width: 1.5px !important;
}
.auth-field .MuiOutlinedInput-root.Mui-focused {
  box-shadow: 0 0 0 4px ${C.accentGlow} !important;
}
.auth-field .MuiInputLabel-root {
  color: ${C.textSub} !important; font-size: 13.5px !important;
  font-weight: 400 !important;
  transform: translate(46px, 14px) scale(1) !important;
}
.auth-field .MuiInputLabel-root.MuiInputLabel-shrink {
  transform: translate(14px, -9px) scale(0.78) !important;
  color: ${C.accentLight} !important; font-weight: 500 !important;
}
.auth-field .MuiInputAdornment-positionStart { margin-right: 4px !important; }

/* ── Tabs ── */
.auth-tabs {
  display: flex; background: rgba(255,255,255,0.03);
  border-radius: 12px; padding: 4px; gap: 2px;
  border: 1px solid ${C.divider}; margin-bottom: 24px;
}
.auth-tab {
  flex: 1; padding: 9px 0; border: none; background: transparent;
  cursor: pointer; color: ${C.textSub}; font-size: 13.5px; font-weight: 500;
  border-radius: 9px; transition: all 0.2s ease; letter-spacing: 0.01em;
}
.auth-tab.active {
  color: ${C.white};
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  box-shadow: 0 2px 12px rgba(99,102,241,0.4), 0 1px 0 rgba(255,255,255,0.08) inset;
}
.auth-tab:not(.active):hover { color: ${C.text}; background: rgba(255,255,255,0.05); }

/* ── Submit btn ── */
.auth-submit {
  width: 100%; height: 52px; border: none; border-radius: 12px; cursor: pointer;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%);
  color: ${C.white}; font-size: 14.5px; font-weight: 600; letter-spacing: 0.03em;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px rgba(79,70,229,0.45), 0 1px 0 rgba(255,255,255,0.12) inset;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.auth-submit:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 8px 28px rgba(79,70,229,0.55), 0 1px 0 rgba(255,255,255,0.15) inset;
}
.auth-submit:active:not(:disabled) { transform: translateY(0); }
.auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-submit::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%);
  background-size: 200% 100%; animation: shimmer 2.8s linear infinite;
}

/* ── Google btn ── */
.auth-google {
  width: 100%; height: 50px; border: 1.5px solid ${C.fieldBorder};
  border-radius: 12px; background: transparent; cursor: pointer;
  color: ${C.text}; font-size: 13.5px; font-weight: 500;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.2s ease; letter-spacing: 0.01em;
}
.auth-google:hover:not(:disabled) {
  border-color: rgba(99,102,241,0.5);
  background: rgba(99,102,241,0.07);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.auth-google:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Forgot ── */
.auth-forgot {
  background: none; border: none; cursor: pointer;
  color: ${C.textSub}; font-size: 12.5px; font-weight: 400;
  text-align: right; padding: 0; transition: color 0.2s; letter-spacing: 0.01em;
}
.auth-forgot:hover { color: ${C.accentLight}; text-decoration: underline; }

/* ── Password strength ── */
.strength-bar { height: 3px; border-radius: 99px; background: rgba(255,255,255,0.08); overflow: hidden; margin-top: 6px; }
.strength-fill { height: 100%; border-radius: 99px; animation: progressFill 0.35s ease; transition: width 0.35s ease, background 0.35s ease; }

/* ── Alert ── */
.auth-alert {
  display: flex; align-items: flex-start; gap: 10px;
  border-radius: 11px; padding: 12px 14px; margin-bottom: 18px;
  font-size: 13px; font-weight: 400; line-height: 1.5; letter-spacing: 0.01em;
}
.auth-alert.error  { background: ${C.dangerBg};  border: 1px solid ${C.dangerBdr};  color: #fca5a5; }
.auth-alert.success { background: ${C.successBg}; border: 1px solid ${C.successBdr}; color: #6ee7b7; }

/* ── Divider ── */
.auth-divider { display: flex; align-items: center; gap: 14px; margin: 22px 0; }
.auth-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${C.divider}, transparent); }
.auth-divider-text { font-size: 11px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.08em; text-transform: uppercase; }

/* ── Trust badges ── */
.trust-badge {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px;
  border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  font-size: 10.5px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.02em; white-space: nowrap;
}

/* ── Left panel dot pattern ── */
.dot-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 24px 24px; opacity: 0.5;
}

/* ── Logo ring animation ── */
.logo-ring   { position: absolute; inset: -8px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.22); animation: pulse-ring 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite; }
.logo-ring-2 { position: absolute; inset: -8px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); animation: pulse-ring 2.4s cubic-bezier(0.2,0.6,0.4,1) 0.9s infinite; }

.scrollbar-hidden::-webkit-scrollbar { display: none; }
`;

/* ─── Helpers ────────────────────────────────────────────────────── */
function getStrength(pass) {
    if (!pass) return { score: 0, label: '', color: '' };
    let s = 0;
    if (pass.length >= 6) s++;
    if (pass.length >= 10) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    if (s <= 1) return { score: 20,  label: 'Weak',   color: '#f87171' };
    if (s === 2) return { score: 45,  label: 'Fair',   color: '#fbbf24' };
    if (s === 3) return { score: 70,  label: 'Good',   color: '#818cf8' };
    return               { score: 100, label: 'Strong', color: '#34d399' };
}

/* ─── Left decorative panel ──────────────────────────────────────── */
const FEATURES = [
    { icon: '🧾', title: 'Smart Billing',       desc: 'Generate GST invoices instantly' },
    { icon: '📦', title: 'Inventory Sync',      desc: 'Real-time stock management' },
    { icon: '📊', title: 'Business Analytics',  desc: 'Daily and monthly reports' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'End-to-end encrypted data' },
];

function LeftPanel() {
    return (
        <Box sx={{
            width: { md: 370 }, minWidth: { md: 340 }, flexShrink: 0,
            background: C.leftPanel, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            p: '52px 40px',
        }}>
            <Box className="dot-bg" />
            <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(circle at 15% 85%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            }} />

            <Box>
                {/* Brand mark */}
                <Box className="auth-logo-enter" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: '36px' }}>
                    <Box sx={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                        <Box className="logo-ring" />
                        <Box className="logo-ring-2" />
                        <Box sx={{
                            width: 52, height: 52, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)',
                            border: '1.5px solid rgba(255,255,255,0.28)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                        </Box>
                    </Box>
                    <Box className="auth-title-enter">
                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 19, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                            Srinivasa<br />Hardwares
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', mt: 0.4 }}>
                            Billing & Inventory
                        </Typography>
                    </Box>
                </Box>

                {/* Headline */}
                <Box sx={{ mb: '32px', opacity: 0, animation: 'fadeUp 0.5s ease 0.4s forwards' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.94)', fontWeight: 700, fontSize: 23, lineHeight: 1.3, letterSpacing: '-0.02em', mb: 1.2 }}>
                        Built for your<br />hardware business
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, fontWeight: 400, lineHeight: 1.7 }}>
                        Streamline billing, inventory and<br />sales — all in one place.
                    </Typography>
                </Box>

                {/* Feature rows */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {FEATURES.map((f, i) => (
                        <Box key={i} className="feat-item" sx={{ animationDelay: `${0.5 + i * 0.1}s`, display: 'flex', alignItems: 'center', gap: 1.5, py: 1.1 }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                                background: 'rgba(255,255,255,0.13)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 17,
                            }}>{f.icon}</Box>
                            <Box>
                                <Typography sx={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{f.title}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.42)', fontSize: 11.5, fontWeight: 400 }}>{f.desc}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: '36px', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    All systems operational
                </Typography>
            </Box>
        </Box>
    );
}

/* ─── Root component ─────────────────────────────────────────────── */
export default function AuthScreen({ onLogin }) {
    const [tab, setTab]               = useState(0);
    const [msg, setMsg]               = useState({ text: '', type: '' });
    const [loading, setLoading]       = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass]   = useState('');
    const [regName, setRegName]       = useState('');
    const [regEmail, setRegEmail]     = useState('');
    const [regPass, setRegPass]       = useState('');
    const [showPass, setShowPass]     = useState(false);

    const notify = (text, type = 'error') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 5000);
    };
    const switchTab = (v) => { setTab(v); setMsg({ text: '', type: '' }); setShowPass(false); };

    async function doLogin() {
        if (!loginEmail || !loginPass) { notify('Please fill in all fields'); return; }
        setLoading(true);
        try {
            const res = await signInWithEmailAndPassword(fireAuth, loginEmail, loginPass);
            onLogin(res.user);
        } catch (e) {
            notify(e.code === 'auth/invalid-credential' ? 'Invalid email or password. Please try again.' : e.message);
        } finally { setLoading(false); }
    }

    async function doRegister() {
        if (!regName || !regEmail || !regPass) { notify('Please fill in all fields'); return; }
        if (regPass.length < 6) { notify('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(fireAuth, regEmail, regPass);
            await updateProfile(res.user, { displayName: regName });
            onLogin(res.user);
        } catch (e) {
            notify(e.code === 'auth/email-already-in-use' ? 'This email is already registered.' : e.message);
        } finally { setLoading(false); }
    }

    async function doGoogle() {
        setLoading(true);
        try {
            const res = await signInWithPopup(fireAuth, new GoogleAuthProvider());
            onLogin(res.user);
        } catch (e) {
            if (e.code !== 'auth/popup-closed-by-user') notify(e.message);
        } finally { setLoading(false); }
    }

    async function doForgot() {
        const email = loginEmail || prompt('Enter your email address:');
        if (!email) return;
        try {
            await sendPasswordResetEmail(fireAuth, email);
            notify('Reset link sent — check your inbox.', 'success');
        } catch (e) { notify(e.message); }
    }

    const strength = getStrength(regPass);
    const iconSx = { fontSize: 18, color: C.textSub, opacity: 0.65 };

    return (
        <>
            <style>{STYLES}</style>
            <Box className="auth-root scrollbar-hidden" sx={{
                minHeight: '100dvh',
                background: C.bgGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', p: { xs: 0, md: 3 },
            }}>
                <ParticleCanvas />

                {/* Ambient orbs */}
                <Box sx={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 65%)', top: '-25%', right: '-5%', animation: 'orb1 14s ease-in-out infinite', pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)', bottom: '-20%', left: '10%', animation: 'orb2 18s ease-in-out infinite', pointerEvents: 'none' }} />

                {/* ── Auth card ── */}
                <Box className="auth-card-enter" sx={{
                    display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                    width: '100%', maxWidth: { md: 860 },
                    borderRadius: { xs: 0, md: '22px' }, overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.14)',
                    position: 'relative', zIndex: 1,
                    minHeight: { xs: '100dvh', md: 'auto' },
                }}>

                    {/* Left panel – desktop only */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <LeftPanel />
                    </Box>

                    {/* ── Right: form ── */}
                    <Box sx={{
                        flex: 1, background: C.glass,
                        backdropFilter: 'blur(28px) saturate(160%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        p: { xs: '36px 28px', sm: '48px 44px' },
                        overflowY: 'auto',
                        position: 'relative',
                        '&::before': {
                            content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)',
                        },
                    }}>
                        {/* Mobile brand */}
                        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3, textAlign: 'center' }}>
                            <Typography sx={{ color: C.text, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>
                                Srinivasa Hardwares
                            </Typography>
                            <Typography sx={{ color: C.textSub, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', mt: 0.3 }}>
                                Billing System
                            </Typography>
                        </Box>

                        {/* Heading */}
                        <Box sx={{ mb: '28px' }}>
                            <Typography sx={{ color: C.text, fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', lineHeight: 1.15, mb: 0.7 }}>
                                {tab === 0 ? 'Welcome back' : 'Create your account'}
                            </Typography>
                            <Typography sx={{ color: C.textSub, fontSize: 13.5, fontWeight: 400, lineHeight: 1.55 }}>
                                {tab === 0
                                    ? 'Sign in to access your billing dashboard'
                                    : 'Set up your account and get started today'}
                            </Typography>
                        </Box>

                        {/* Tabs */}
                        <Box className="auth-tabs">
                            {['Sign In', 'Register'].map((label, i) => (
                                <button key={i} className={`auth-tab ${tab === i ? 'active' : ''}`} onClick={() => switchTab(i)}>
                                    {label}
                                </button>
                            ))}
                        </Box>

                        {/* Alert */}
                        <Fade in={!!msg.text} unmountOnExit>
                            <Box className={`auth-alert ${msg.type}`}>
                                {msg.type === 'success'
                                    ? <CheckCircleIcon sx={{ fontSize: 16, color: C.success, flexShrink: 0, mt: '1px' }} />
                                    : <ErrorIcon sx={{ fontSize: 16, color: C.danger, flexShrink: 0, mt: '1px' }} />}
                                {msg.text}
                            </Box>
                        </Fade>

                        {/* ── Sign In ── */}
                        {tab === 0 && (
                            <Box className="auth-form-enter" sx={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <TextField
                                    className="auth-field" label="Email address" type="email" fullWidth
                                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)} disabled={loading}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={iconSx} /></InputAdornment> }}
                                />
                                <Box>
                                    <TextField
                                        className="auth-field" label="Password" type={showPass ? 'text' : 'password'} fullWidth
                                        value={loginPass} onChange={e => setLoginPass(e.target.value)} disabled={loading}
                                        onKeyDown={e => e.key === 'Enter' && doLogin()}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockIcon sx={iconSx} /></InputAdornment>,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setShowPass(p => !p)} edge="end"
                                                        sx={{ color: C.textSub, '&:hover': { color: C.accentLight, background: C.accentSoft } }}>
                                                        {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                        <button className="auth-forgot" onClick={doForgot} type="button">Forgot password?</button>
                                    </Box>
                                </Box>
                                <button className="auth-submit" onClick={doLogin} disabled={loading}>
                                    {loading ? <><CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.85)' }} />Signing in…</> : 'Sign In'}
                                </button>
                            </Box>
                        )}

                        {/* ── Register ── */}
                        {tab === 1 && (
                            <Box className="auth-form-enter" sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <TextField
                                    className="auth-field" label="Full name" fullWidth
                                    value={regName} onChange={e => setRegName(e.target.value)} disabled={loading}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={iconSx} /></InputAdornment> }}
                                />
                                <TextField
                                    className="auth-field" label="Email address" type="email" fullWidth
                                    value={regEmail} onChange={e => setRegEmail(e.target.value)} disabled={loading}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={iconSx} /></InputAdornment> }}
                                />
                                <Box>
                                    <TextField
                                        className="auth-field" label="Password" type={showPass ? 'text' : 'password'} fullWidth
                                        value={regPass} onChange={e => setRegPass(e.target.value)} disabled={loading}
                                        onKeyDown={e => e.key === 'Enter' && doRegister()}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockIcon sx={iconSx} /></InputAdornment>,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" onClick={() => setShowPass(p => !p)} edge="end"
                                                        sx={{ color: C.textSub, '&:hover': { color: C.accentLight, background: C.accentSoft } }}>
                                                        {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {regPass.length > 0 && (
                                        <Box sx={{ mt: 1, px: 0.25 }}>
                                            <Box className="strength-bar">
                                                <Box className="strength-fill" style={{ width: `${strength.score}%`, background: strength.color }} />
                                            </Box>
                                            <Typography sx={{ fontSize: 11, color: strength.color, mt: 0.5, fontWeight: 500 }}>
                                                {strength.label} password
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <button className="auth-submit" onClick={doRegister} disabled={loading} style={{ marginTop: 2 }}>
                                    {loading ? <><CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.85)' }} />Creating account…</> : 'Create Account'}
                                </button>
                            </Box>
                        )}

                        {/* Divider */}
                        <Box className="auth-divider">
                            <Box className="auth-divider-line" />
                            <span className="auth-divider-text">or continue with</span>
                            <Box className="auth-divider-line" />
                        </Box>

                        {/* Google */}
                        <button className="auth-google" onClick={doGoogle} disabled={loading}>
                            <GoogleIcon style={{ fontSize: 19, color: '#ea4335' }} />
                            <span>Continue with Google</span>
                        </button>

                        {/* Trust badges */}
                        <Box sx={{ mt: '20px', display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['SSL Secured', '256-bit Encrypted', 'GDPR Compliant'].map(b => (
                                <span key={b} className="trust-badge">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: C.accentLight, opacity: 0.65 }}>
                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                    </svg>
                                    {b}
                                </span>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}