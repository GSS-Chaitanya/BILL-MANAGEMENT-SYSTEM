import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { onAuthStateChanged } from 'firebase/auth';
import { fireAuth } from './firebase.js';
import { BillProvider } from './store/BillContext.jsx';
import { InventoryProvider } from './store/InventoryContext.jsx';
import { useTheme } from './hooks/useTheme.js';
import { getTheme } from './theme.js';
import SplashScreen from './components/SplashScreen.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import MainApp from './components/MainApp.jsx';

export default function App() {
    const [authState, setAuthState] = useState('loading');
    const [currentUser, setCurrentUser] = useState(null);
    const { isDark, toggleTheme } = useTheme();
    const muiTheme = useMemo(() => getTheme(isDark), [isDark]);

    useEffect(() => {
        const splashTimer = setTimeout(() => {
            if (authState === 'loading') setAuthState('splash-done');
        }, 1000);

        const unsub = onAuthStateChanged(fireAuth, (user) => {
            setCurrentUser(user);
            setAuthState(user ? 'logged-in' : 'logged-out');
        });

        return () => {
            clearTimeout(splashTimer);
            unsub();
        };
    }, []);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {authState === 'loading' ? (
                <SplashScreen />
            ) : (authState === 'logged-out' || authState === 'splash-done') ? (
                <AuthScreen onLogin={(user) => { setCurrentUser(user); setAuthState('logged-in'); }} />
            ) : (
                <BillProvider>
                    <InventoryProvider>
                        <MainApp
                            currentUser={currentUser}
                            onLogout={() => setAuthState('logged-out')}
                            isDark={isDark}
                            toggleTheme={toggleTheme}
                        />
                    </InventoryProvider>
                </BillProvider>
            )}
        </ThemeProvider>
    );
}
