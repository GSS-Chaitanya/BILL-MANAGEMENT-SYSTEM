import { useState, useEffect } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('sh_theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('sh_theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark(d => !d);

    return { isDark, toggleTheme };
}
