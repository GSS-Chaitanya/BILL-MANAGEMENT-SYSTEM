import React, { useState } from 'react';
import { Card, CardActionArea, Typography, Box, Chip, useTheme, Menu, MenuItem } from '@mui/material';
import { useBill } from '../../store/BillContext.jsx';
import { useInventory } from '../../store/InventoryContext.jsx';
import { formatCurrency } from '../../utils/format.js';

const catColors = {
    hardware: '#6366f1',
    electrical: '#f59e0b',
    plumbing: '#06b6d4',
    custom: '#10b981',
    tablets: '#ef4444',
    syrups: '#8b5cf6',
    injections: '#f97316',
    drops: '#0ea5e9',
    surgical: '#14b8a6',
};

export default function ProductCard({ product }) {
    const { dispatch, state: billState } = useBill();
    const { state: invState } = useInventory();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [anchorEl, setAnchorEl] = useState(null);
    const [justAdded, setJustAdded] = useState(false);

    const inCartQty = billState.cart.filter(c => c.id === product.id).reduce((sum, c) => sum + c.qty, 0);
    const imgSrc = product.imageUrl || billState.productImages[product.id];
    const catColor = catColors[product.cat] || '#64748b';

    // Find available batches for this product
    const productBatches = invState.batches.filter(b => b.productId?._id === product._id && b.quantity > 0);

    const triggerAddAnimation = () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 400);
    };

    const handleActionAreaClick = (event) => {
        if (productBatches.length > 0) {
            setAnchorEl(event.currentTarget);
        } else {
            dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id } });
            triggerAddAnimation();
        }
    };

    const handleBatchSelect = (batch) => {
        dispatch({
            type: 'ADD_TO_CART',
            payload: {
                productId: product.id,
                batchId: batch._id,
                customPrice: batch.sellingPrice
            }
        });
        setAnchorEl(null);
        triggerAddAnimation();
    };

    return (
        <>
            <Card
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: inCartQty > 0
                        ? `2px solid ${catColor}`
                        : `1px solid ${isDark ? 'rgba(139, 149, 179, 0.08)' : 'rgba(0, 0, 0, 0.04)'}`,
                    transform: justAdded ? 'scale(0.95)' : 'scale(1)',
                    '&:hover': {
                        transform: justAdded ? 'scale(0.95)' : 'translateY(-4px)',
                        boxShadow: isDark
                            ? `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${catColor}20`
                            : `0 12px 32px rgba(0,0,0,0.08), 0 0 0 1px ${catColor}20`,
                    },
                    // Gradient border glow effect on hover
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, transparent, ${catColor}, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                        opacity: 0.6,
                    },
                }}
            >
                <CardActionArea
                    onClick={handleActionAreaClick}
                    sx={{ p: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
                >
                    {/* Top Image portion */}
                    <Box sx={{ 
                        width: '100%', 
                        height: { xs: 120, sm: 150 }, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: imgSrc ? (isDark ? '#0f172a' : '#fff') : 'transparent',
                        background: imgSrc ? 'none' : `linear-gradient(135deg, ${catColor}18, ${catColor}08)`,
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                        overflow: 'hidden'
                    }}>
                        {imgSrc ? (
                            <Box
                                component="img"
                                src={imgSrc}
                                alt={product.name}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    p: 1.5,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    }
                                }}
                            />
                        ) : (
                            <Typography sx={{ fontSize: '3.5rem', opacity: 0.9 }}>{product.icon || '📦'}</Typography>
                        )}
                    </Box>

                    {/* Content portion */}
                    <Box sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ 
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                mb: 0.5
                            }}
                            title={product.name}
                        >
                            {product.name}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mb: 1.5 }}>
                            {productBatches.length > 0
                                ? `${productBatches.length} option${productBatches.length > 1 ? 's' : ''}`
                                : (product.sku || 'custom')}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mt: 'auto' }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{
                                    color: catColor,
                                    lineHeight: 1
                                }}
                            >
                                {formatCurrency(product.price)}
                            </Typography>
                            <Chip
                                label={product.cat}
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                    bgcolor: `${catColor}12`,
                                    color: catColor,
                                    textTransform: 'uppercase',
                                    border: `1px solid ${catColor}20`,
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Cart badge with animation */}
                    {inCartQty > 0 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                background: `linear-gradient(135deg, ${catColor}, ${catColor}dd)`,
                                color: '#fff',
                                borderRadius: '10px',
                                minWidth: 22,
                                height: 22,
                                px: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                boxShadow: `0 2px 10px ${catColor}50`,
                                animation: justAdded ? 'badgePop 0.4s ease' : 'none',
                                '@keyframes badgePop': {
                                    '0%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.3)' },
                                    '100%': { transform: 'scale(1)' },
                                },
                            }}
                        >
                            {inCartQty}
                        </Box>
                    )}
                </CardActionArea>
            </Card>

            {/* Batch Selection Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{
                    sx: {
                        minWidth: 240,
                        mt: 1,
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.2 }}>
                    <Typography variant="subtitle2" fontWeight={700}>Select Batch</Typography>
                    <Typography variant="caption" color="text.secondary">{product.name}</Typography>
                </Box>
                {productBatches.map(batch => {
                    const expiry = new Date(batch.expiryDate);
                    const isNearExpiry = expiry < new Date(new Date().setMonth(new Date().getMonth() + 3));

                    return (
                        <MenuItem
                            key={batch._id}
                            onClick={() => handleBatchSelect(batch)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                py: 1.2,
                                borderLeft: `3px solid ${isNearExpiry ? '#ef4444' : catColor}`,
                                ml: 1,
                                borderRadius: 1,
                                mb: 0.5,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight={600}>{batch.batchNumber}</Typography>
                                <Typography variant="body2" fontWeight={700} sx={{ color: catColor }}>
                                    {formatCurrency(batch.sellingPrice)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Stock: {batch.quantity}</Typography>
                                <Typography variant="caption" color={isNearExpiry ? 'error' : 'text.secondary'}>
                                    Exp: {expiry.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </Typography>
                            </Box>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
