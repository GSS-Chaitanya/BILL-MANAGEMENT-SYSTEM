import React, { useState, useMemo } from 'react';
import {
    Box, TextField, InputAdornment, Chip, Typography, useTheme, Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProductCard from './ProductCard.jsx';
import { useBill } from '../../store/BillContext.jsx';

const CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'hardware', label: '🔩 Hardware' },
    { key: 'electrical', label: '⚡ Electrical' },
    { key: 'plumbing', label: '🚰 Plumbing' },
    { key: 'custom', label: '📦 Custom' },
];

export default function CatalogPanel() {
    const { state, dispatch, allProds } = useBill();
    const [search, setSearch] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const filtered = useMemo(() => {
        let list = allProds();
        if (state.activeCat !== 'all') list = list.filter(p => p.cat === state.activeCat);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
        }
        return list;
    }, [allProds, state.activeCat, search]);

    return (
        <Box>
            {/* Search */}
            <TextField
                id="search"
                fullWidth
                size="small"
                placeholder="Search products by name or SKU…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon
                                fontSize="small"
                                sx={{
                                    color: searchFocused ? 'primary.main' : 'action',
                                    transition: 'color 0.3s ease',
                                }}
                            />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        bgcolor: isDark ? 'rgba(20, 24, 40, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                        ...(searchFocused && {
                            bgcolor: isDark ? 'rgba(20, 24, 40, 0.9)' : '#ffffff',
                        }),
                    },
                }}
            />

            {/* Category chips */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    mb: 2,
                }}
            >
                {CATEGORIES.map(cat => (
                    <Chip
                        key={cat.key}
                        label={cat.label}
                        variant={state.activeCat === cat.key ? 'filled' : 'outlined'}
                        color={state.activeCat === cat.key ? 'primary' : 'default'}
                        onClick={() => dispatch({ type: 'SET_ACTIVE_CAT', payload: cat.key })}
                        sx={{
                            fontWeight: state.activeCat === cat.key ? 700 : 400,
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            ...(state.activeCat === cat.key && {
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                boxShadow: '0 3px 12px rgba(99, 102, 241, 0.3)',
                            }),
                            '&:hover': {
                                transform: 'translateY(-2px)',
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Product grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                    },
                    gap: 1.5,
                }}
            >
                {filtered.map((p, index) => (
                    <Fade in key={p.id} timeout={200 + index * 40} style={{ transitionDelay: `${index * 20}ms` }}>
                        <Box>
                            <ProductCard product={p} />
                        </Box>
                    </Fade>
                ))}
            </Box>

            {filtered.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h3" sx={{ mb: 1, opacity: 0.6 }}>🔍</Typography>
                    <Typography color="text.secondary" fontWeight={500}>No products found</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Try a different search term or category
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
