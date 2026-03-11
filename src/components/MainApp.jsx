import React, { useState, useEffect, useCallback } from 'react';
import { Box, Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header.jsx';
import MobileNav from './MobileNav.jsx';
import CatalogPanel from './catalog/CatalogPanel.jsx';
import BillPanel from './bill/BillPanel.jsx';
import AdminDashboardModal from './admin/AdminDashboardModal.jsx';
import AddCustomItemModal from './modals/AddCustomItemModal.jsx';
import AnalyticsModal from './modals/AnalyticsModal.jsx';
import RecentBillsPanel from './modals/RecentBillsPanel.jsx';
import SettingsModal from './modals/SettingsModal.jsx';
import KeyboardShortcutsModal from './modals/KeyboardShortcutsModal.jsx';
import InventoryDashboardModal from './inventory/InventoryDashboardModal.jsx';
import SuppliersModal from './inventory/SuppliersModal.jsx';
import StockInwardModal from './inventory/StockInwardModal.jsx';
import { useBill } from '../store/BillContext.jsx';
import { fetchBills } from '../services/api.js';

export default function MainApp({ currentUser, onLogout, isDark, toggleTheme }) {
    const { state, dispatch } = useBill();
    const [activeTab, setActiveTab] = useState('catalog');
    const [modal, setModal] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    function showToast(msg, severity = 'info') {
        setToast({ open: true, message: msg, severity });
    }

    // Sync invNum with saved bills on mount
    useEffect(() => {
        fetchBills()
            .then(all => {
                if (all.length) {
                    const maxSaved = Math.max(...all.map(b => b.invNum || 0));
                    const next = maxSaved + 1;
                    if (next > state.invNum) dispatch({ type: 'SET_INV_NUM', payload: next });
                }
            })
            .catch(() => {});
    }, [dispatch]);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKey(e) {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'n' || e.key === 'N') { e.preventDefault(); dispatch({ type: 'CLEAR_BILL' }); showToast('New bill started'); }
                if (e.key === 'f' || e.key === 'F') { e.preventDefault(); document.getElementById('search')?.focus(); }
            }
            if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); setModal('shortcuts'); }
            if (e.key === 'Escape') setModal(null);
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [dispatch]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Header
                currentUser={currentUser}
                onLogout={onLogout}
                isDark={isDark}
                toggleTheme={toggleTheme}
                onOpenProductMgr={() => setModal('admin')}
                onOpenCustom={() => setModal('addCustom')}
                onOpenAnalytics={() => setModal('analytics')}
                onOpenRecent={() => setModal('recent')}
                onOpenSettings={() => setModal('settings')}
                onOpenShortcuts={() => setModal('shortcuts')}
                onOpenInventory={() => setModal('inventory')}
                onOpenSuppliers={() => setModal('suppliers')}
            />

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    p: { xs: 1, sm: 2 },
                    maxWidth: 1400,
                    mx: 'auto',
                    pb: isMobile ? '80px' : 2,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        display: isMobile ? (activeTab === 'catalog' ? 'block' : 'none') : 'block',
                        minWidth: 0,
                    }}
                >
                    <CatalogPanel />
                </Box>
                <Box
                    sx={{
                        width: isMobile ? '100%' : 420,
                        flexShrink: 0,
                        display: isMobile ? (activeTab === 'bill' ? 'block' : 'none') : 'block',
                    }}
                >
                    <BillPanel onToast={showToast} />
                </Box>
            </Box>

            {isMobile && (
                <MobileNav
                    activeTab={activeTab}
                    onSwitchTab={setActiveTab}
                    onOpenCustom={() => setModal('addCustom')}
                    onOpenAnalytics={() => setModal('analytics')}
                    cartCount={state.cart.reduce((s, c) => s + c.qty, 0)}
                />
            )}

            {/* Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast(t => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ mb: isMobile ? 8 : 0 }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast(t => ({ ...t, open: false }))}
                    sx={{ borderRadius: 2, fontWeight: 500 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>

            {/* Modals */}
            {modal === 'admin' && <AdminDashboardModal onClose={() => setModal(null)} onToast={showToast} />}
            {modal === 'addCustom' && <AddCustomItemModal onClose={() => setModal(null)} onToast={showToast} />}
            {modal === 'analytics' && <AnalyticsModal onClose={() => setModal(null)} />}
            {modal === 'recent' && <RecentBillsPanel onClose={() => setModal(null)} onToast={showToast} />}
            {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} onToast={showToast} />}
            {modal === 'shortcuts' && <KeyboardShortcutsModal onClose={() => setModal(null)} />}
            {modal === 'inventory' && <InventoryDashboardModal onClose={() => setModal(null)} onOpenStockInward={() => setModal('stockInward')} />}
            {modal === 'suppliers' && <SuppliersModal onClose={() => setModal(null)} onToast={showToast} />}
            {modal === 'stockInward' && <StockInwardModal onClose={() => setModal('inventory')} onToast={showToast} />}
        </Box>
    );
}
