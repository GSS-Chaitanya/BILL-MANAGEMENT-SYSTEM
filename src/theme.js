import { createTheme } from '@mui/material/styles';

export const getTheme = (isDark) =>
    createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: {
                main: '#6366f1',
                light: '#818cf8',
                dark: '#4f46e5',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#f59e0b',
                light: '#fbbf24',
                dark: '#d97706',
            },
            success: {
                main: '#10b981',
                light: '#34d399',
                dark: '#059669',
            },
            error: {
                main: '#ef4444',
                light: '#f87171',
                dark: '#dc2626',
            },
            warning: {
                main: '#f59e0b',
                light: '#fbbf24',
                dark: '#d97706',
            },
            info: {
                main: '#06b6d4',
                light: '#22d3ee',
                dark: '#0891b2',
            },
            background: {
                default: isDark ? '#0a0e1a' : '#f0f2f8',
                paper: isDark ? '#141828' : '#ffffff',
            },
            text: {
                primary: isDark ? '#eef2ff' : '#1a1e2e',
                secondary: isDark ? '#8b95b3' : '#5a6478',
            },
            divider: isDark ? 'rgba(139, 149, 179, 0.10)' : 'rgba(0, 0, 0, 0.06)',
        },
        typography: {
            fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h4: { fontWeight: 700, letterSpacing: '-0.5px' },
            h5: { fontWeight: 700, letterSpacing: '-0.3px' },
            h6: { fontWeight: 600, letterSpacing: '-0.2px' },
            subtitle1: { fontWeight: 500 },
            subtitle2: { fontWeight: 600 },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
            borderRadius: 14,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    '*': {
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark
                            ? '#2a3150 transparent'
                            : '#c8cfe0 transparent',
                    },
                    '*::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '*::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '*::-webkit-scrollbar-thumb': {
                        borderRadius: '10px',
                        background: isDark ? '#2a3150' : '#c8cfe0',
                    },
                    '*::-webkit-scrollbar-thumb:hover': {
                        background: isDark ? '#3b4770' : '#a0acbf',
                    },
                    '::selection': {
                        background: 'rgba(99, 102, 241, 0.3)',
                        color: isDark ? '#eef2ff' : '#1a1e2e',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        padding: '8px 22px',
                        fontSize: '0.875rem',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:active': {
                            transform: 'scale(0.97)',
                        },
                    },
                    containedPrimary: {
                        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
                            boxShadow: '0 6px 24px rgba(99, 102, 241, 0.5)',
                            transform: 'translateY(-1px)',
                        },
                    },
                    outlinedPrimary: {
                        borderWidth: '1.5px',
                        '&:hover': {
                            borderWidth: '1.5px',
                            background: 'rgba(99, 102, 241, 0.06)',
                            transform: 'translateY(-1px)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 18,
                        boxShadow: isDark
                            ? '0 4px 24px rgba(0, 0, 0, 0.35)'
                            : '0 2px 20px rgba(0, 0, 0, 0.05)',
                        border: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0, 0, 0, 0.04)'}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backdropFilter: isDark ? 'blur(12px)' : 'none',
                        background: isDark
                            ? 'linear-gradient(145deg, rgba(20, 24, 40, 0.95), rgba(20, 24, 40, 0.85))'
                            : '#ffffff',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 22,
                        boxShadow: isDark
                            ? '0 24px 80px rgba(0, 0, 0, 0.6)'
                            : '0 24px 80px rgba(0, 0, 0, 0.12)',
                        border: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.1)' : 'rgba(0, 0, 0, 0.04)'}`,
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 500,
                        borderRadius: 10,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                            transition: 'all 0.25s ease',
                            '&.Mui-focused': {
                                boxShadow: `0 0 0 3px ${isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.12)'}`,
                            },
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backdropFilter: 'blur(16px) saturate(180%)',
                        backgroundColor: isDark
                            ? 'rgba(10, 14, 26, 0.80)'
                            : 'rgba(240, 242, 248, 0.80)',
                        borderBottom: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
                    },
                },
            },
            MuiBottomNavigation: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark
                            ? 'rgba(20, 24, 40, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderTop: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.08)',
                        },
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        borderRadius: 10,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '6px 14px',
                        backdropFilter: 'blur(8px)',
                        background: isDark
                            ? 'rgba(30, 35, 55, 0.95)'
                            : 'rgba(26, 30, 46, 0.92)',
                    },
                },
            },
            MuiListItem: {
                styleOverrides: {
                    root: {
                        transition: 'background-color 0.2s ease',
                    },
                },
            },
        },
    });
