import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SplashScreen() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0a0e1a 0%, #141828 30%, #1a1040 60%, #0a0e1a 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background orbs */}
            {[
                { size: 300, top: '-10%', left: '-5%', color: '#6366f1', delay: '0s', dur: '8s' },
                { size: 200, bottom: '10%', right: '-5%', color: '#818cf8', delay: '2s', dur: '10s' },
                { size: 150, top: '40%', right: '20%', color: '#a78bfa', delay: '4s', dur: '12s' },
            ].map((orb, i) => (
                <Box
                    key={i}
                    sx={{
                        position: 'absolute',
                        width: orb.size,
                        height: orb.size,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${orb.color}30 0%, transparent 70%)`,
                        filter: 'blur(60px)',
                        top: orb.top, left: orb.left, bottom: orb.bottom, right: orb.right,
                        animation: `floatOrb${i} ${orb.dur} ease-in-out infinite`,
                        animationDelay: orb.delay,
                        [`@keyframes floatOrb${i}`]: {
                            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                            '33%': { transform: 'translate(30px, -20px) scale(1.1)' },
                            '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
                        },
                    }}
                />
            ))}

            {/* Logo */}
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 40px rgba(99, 102, 241, 0.5), 0 0 80px rgba(99, 102, 241, 0.2)',
                    animation: 'logoPulse 2.5s ease-in-out infinite, logoEntry 0.8s ease-out',
                    '@keyframes logoPulse': {
                        '0%, 100%': { transform: 'scale(1)', boxShadow: '0 8px 40px rgba(99, 102, 241, 0.5)' },
                        '50%': { transform: 'scale(1.06)', boxShadow: '0 12px 50px rgba(99, 102, 241, 0.65)' },
                    },
                    '@keyframes logoEntry': {
                        '0%': { opacity: 0, transform: 'scale(0.5) rotate(-10deg)' },
                        '100%': { opacity: 1, transform: 'scale(1) rotate(0deg)' },
                    },
                    mb: 3,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </Box>

            {/* Brand */}
            <Typography
                variant="h4"
                sx={{
                    color: '#eef2ff',
                    fontWeight: 800,
                    letterSpacing: '-1px',
                    animation: 'textFadeIn 1s ease-out 0.3s both',
                    '@keyframes textFadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(16px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' },
                    },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                Srinivasa Hardwares
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: 'rgba(139, 149, 179, 0.8)',
                    mt: 0.5,
                    animation: 'textFadeIn 1s ease-out 0.5s both',
                    position: 'relative',
                    zIndex: 1,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                }}
            >
                Billing System
            </Typography>

            {/* Loading dots */}
            <Box sx={{ display: 'flex', gap: 1, mt: 4, position: 'relative', zIndex: 1 }}>
                {[0, 1, 2].map(i => (
                    <Box
                        key={i}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            animation: `dotBounce 1.4s ease-in-out infinite`,
                            animationDelay: `${i * 0.16}s`,
                            '@keyframes dotBounce': {
                                '0%, 80%, 100%': { transform: 'scale(0.4)', opacity: 0.3 },
                                '40%': { transform: 'scale(1)', opacity: 1 },
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}
