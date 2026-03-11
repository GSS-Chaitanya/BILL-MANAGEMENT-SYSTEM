import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Badge, Box, useTheme } from '@mui/material';
import {
    Storefront, Receipt, AddBox, Analytics
} from '@mui/icons-material';

export default function MobileNav({ activeTab, onSwitchTab, onOpenCustom, onOpenAnalytics, cartCount }) {
    const value = activeTab === 'catalog' ? 0 : activeTab === 'bill' ? 1 : -1;
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 12,
                left: 12,
                right: 12,
                zIndex: 1200,
                borderRadius: '20px',
                overflow: 'hidden',
                border: `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0, 0, 0, 0.04)'}`,
                boxShadow: isDark
                    ? '0 8px 40px rgba(0, 0, 0, 0.5)'
                    : '0 8px 40px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(16px) saturate(180%)',
                background: isDark
                    ? 'rgba(20, 24, 40, 0.92)'
                    : 'rgba(255, 255, 255, 0.92)',
            }}
            elevation={0}
        >
            <BottomNavigation
                value={value}
                onChange={(_, newVal) => {
                    if (newVal === 0) onSwitchTab('catalog');
                    else if (newVal === 1) onSwitchTab('bill');
                    else if (newVal === 2) onOpenCustom();
                    else if (newVal === 3) onOpenAnalytics();
                }}
                showLabels
                sx={{
                    height: 68,
                    borderRadius: '20px',
                    background: 'transparent',
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 'auto',
                        py: 1,
                        transition: 'all 0.25s ease',
                        borderRadius: 3,
                        mx: 0.5,
                        '&.Mui-selected': {
                            color: 'primary.main',
                            '& .MuiSvgIcon-root': {
                                transform: 'scale(1.15)',
                            },
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                                fontSize: '0.68rem',
                            },
                        },
                        '& .MuiSvgIcon-root': {
                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                    },
                }}
            >
                <BottomNavigationAction label="Catalog" icon={<Storefront />} />
                <BottomNavigationAction
                    label="Bill"
                    icon={
                        <Badge
                            badgeContent={cartCount}
                            color="primary"
                            max={99}
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    minWidth: 18,
                                    height: 18,
                                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                                },
                            }}
                        >
                            <Receipt />
                        </Badge>
                    }
                />
                <BottomNavigationAction label="Add Item" icon={<AddBox />} />
                <BottomNavigationAction label="Analytics" icon={<Analytics />} />
            </BottomNavigation>
        </Paper>
    );
}
