import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
    Chip, CircularProgress, Paper, TextField, Select, MenuItem,
    FormControl, InputLabel, Button, Table, TableHead, TableBody,
    TableRow, TableCell, Collapse, Pagination, useTheme
} from '@mui/material';
import { Close, Print, ExpandMore, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { Chart } from 'chart.js/auto';
import { fetchBills, deleteBill as apiDeleteBill } from '../../services/api.js';
import { pad } from '../../utils/format.js';
import { buildBillHTML, printViaIframe } from '../../utils/print.js';

const HIST_PER_PAGE = 15;
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = (d) => { try { const [y, m, dd] = d.split('-'); return `${dd}/${m}`; } catch { return d; } };
const fmtDateTime = (ts) => new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AnalyticsModal({ onClose }) {
    const [section, setSection] = useState('overview');
    const [range, setRange] = useState(7);
    const [allBills, setAllBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const charts = useRef({});
    const theme = useTheme();

    useEffect(() => {
        fetchBills()
            .then(bills => { setAllBills(bills); setLoading(false); })
            .catch(() => setLoading(false));
        return () => destroyCharts();
    }, []);

    function destroyCharts() {
        Object.values(charts.current).forEach(c => { try { c.destroy(); } catch (e) { } });
        charts.current = {};
    }

    const filtered = allBills.filter(b => {
        if (range === 'all') return true;
        return b.date >= Date.now() - range * 86400000;
    });

    const isDark = theme.palette.mode === 'dark';
    Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
    Chart.defaults.borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

    const sections = [
        { key: 'overview', label: '📈 Overview' },
        { key: 'sales', label: '💰 Sales' },
        { key: 'products', label: '📦 Products' },
        { key: 'customers', label: '👥 Customers' },
        { key: 'history', label: '🕐 History' },
    ];

    return (
        <Dialog open onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { height: '90vh' } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>📊 Analytics</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {['7', '30', '90', '365', 'all'].map(r => (
                                <Chip
                                    key={r} size="small"
                                    label={r === 'all' ? 'All' : r === '7' ? '7D' : r === '30' ? '30D' : r === '90' ? '90D' : '1Y'}
                                    variant={range === (r === 'all' ? 'all' : parseInt(r)) ? 'filled' : 'outlined'}
                                    color={range === (r === 'all' ? 'all' : parseInt(r)) ? 'primary' : 'default'}
                                    onClick={() => setRange(r === 'all' ? 'all' : parseInt(r))}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>
                        <IconButton size="small" onClick={() => window.print()}><Print fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={onClose}><Close /></IconButton>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {sections.map(s => (
                        <Chip
                            key={s.key} label={s.label} size="small"
                            variant={section === s.key ? 'filled' : 'outlined'}
                            color={section === s.key ? 'primary' : 'default'}
                            onClick={() => { destroyCharts(); setSection(s.key); }}
                            sx={{ cursor: 'pointer', fontWeight: section === s.key ? 600 : 400 }}
                        />
                    ))}
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2, overflow: 'auto' }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>Loading analytics…</Typography>
                    </Box>
                ) : (
                    <>
                        {section === 'overview' && <OverviewSection bills={filtered} allBills={allBills} range={range} charts={charts} />}
                        {section === 'sales' && <SalesSection bills={filtered} charts={charts} />}
                        {section === 'products' && <ProductsSection bills={filtered} charts={charts} />}
                        {section === 'customers' && <CustomersSection bills={filtered} charts={charts} />}
                        {section === 'history' && <HistorySection allBills={allBills} setAllBills={setAllBills} />}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ── KPI Card ──
function KpiCard({ label, value, sub, color, trend }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2, borderRadius: 3, flex: '1 1 160px', minWidth: 140,
                border: '1px solid', borderColor: 'divider',
                borderLeft: `4px solid ${color}`,
            }}
        >
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, my: 0.5 }}>{value}</Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
            {trend !== undefined && trend !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {trend >= 0 ? <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} /> : <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />}
                    <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                        {Math.abs(trend).toFixed(1)}%
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}

function KpiRow({ kpis }) {
    return (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </Box>
    );
}

function ChartCard({ title, wide, tall, short, children, headerExtra }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                gridColumn: wide ? '1 / -1' : undefined,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
                {headerExtra}
            </Box>
            <Box sx={{ height: tall ? 300 : short ? 180 : 220, position: 'relative' }}>
                {children}
            </Box>
        </Paper>
    );
}

function chartOpts(prefix = '₹') {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: c => ` ${prefix === '₹' ? '₹' + c.parsed.y?.toLocaleString('en-IN') : c.parsed.y + ' Bills'}` } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
            y: { ticks: { font: { size: 10 }, callback: v => prefix === '₹' ? '₹' + v.toLocaleString('en-IN') : v }, grid: { color: 'rgba(0,0,0,0.04)' } }
        }
    };
}

function EmptyState() {
    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>📊</Typography>
            <Typography color="text.secondary">Save some bills to see analytics</Typography>
        </Box>
    );
}

// ── OVERVIEW ──
function OverviewSection({ bills, allBills, range, charts }) {
    const canvases = useRef({});
    const total = bills.reduce((s, b) => s + b.total, 0);
    const count = bills.length;
    const avg = count ? total / count : 0;
    const gstCol = bills.reduce((s, b) => s + b.gst, 0);
    const pSet = new Set(); bills.forEach(b => b.items.forEach(i => pSet.add(i.id)));

    const prev = allBills.filter(b => {
        if (range === 'all') return false;
        return b.date >= Date.now() - range * 2 * 86400000 && b.date < Date.now() - range * 86400000;
    });
    const prevTotal = prev.reduce((s, b) => s + b.total, 0);
    const trendPct = prevTotal ? ((total - prevTotal) / prevTotal * 100) : null;

    const dayMap = {};
    bills.forEach(b => { dayMap[b.dateStr] = (dayMap[b.dateStr] || 0) + b.total; });
    const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    useEffect(() => {
        if (canvases.current.revenue) {
            const sorted = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0]));
            if (sorted.length) {
                charts.current.revenue = new Chart(canvases.current.revenue, {
                    type: 'line',
                    data: { labels: sorted.map(([d]) => fmtDate(d)), datasets: [{ data: sorted.map(([, v]) => +v.toFixed(2)), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 2.5, pointRadius: 3, fill: true, tension: 0.35 }] },
                    options: chartOpts('₹')
                });
            }
        }
        const hrs = Array(24).fill(0);
        bills.forEach(b => { hrs[b.hour] = (hrs[b.hour] || 0) + b.total; });
        const hrLabels = Array.from({ length: 24 }, (_, i) => i === 0 ? '12am' : i < 12 ? i + 'am' : i === 12 ? '12pm' : (i - 12) + 'pm');
        if (canvases.current.hourly) {
            const peak = hrs.indexOf(Math.max(...hrs));
            charts.current.hourly = new Chart(canvases.current.hourly, {
                type: 'bar', data: { labels: hrLabels, datasets: [{ data: hrs, backgroundColor: hrs.map((_, i) => i === peak ? '#f59e0b' : 'rgba(245,158,11,0.4)'), borderRadius: 3 }] },
                options: chartOpts('₹')
            });
        }
        const wvals = Array(7).fill(0); bills.forEach(b => { wvals[b.weekday] = (wvals[b.weekday] || 0) + b.total; });
        if (canvases.current.weekday) {
            charts.current.weekday = new Chart(canvases.current.weekday, {
                type: 'bar', data: { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], datasets: [{ data: wvals, backgroundColor: wvals.map((_, i) => i === 0 || i === 6 ? 'rgba(239,68,68,0.7)' : 'rgba(99,102,241,0.55)'), borderRadius: 4 }] },
                options: chartOpts('₹')
            });
        }
        const catM = {}; bills.forEach(b => b.items.forEach(i => { catM[i.cat] = (catM[i.cat] || 0) + i.total; }));
        const catLabels = Object.keys(catM), catData = catLabels.map(k => +catM[k].toFixed(2));
        const catColors = { hardware: '#6366f1', electrical: '#f59e0b', plumbing: '#06b6d4', custom: '#10b981' };
        if (canvases.current.cat && catLabels.length) {
            charts.current.cat = new Chart(canvases.current.cat, {
                type: 'doughnut', data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: catLabels.map(l => catColors[l] || '#999'), borderWidth: 2, borderColor: 'transparent' }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } } }
            });
        }
        return () => { Object.values(charts.current).forEach(c => { try { c.destroy(); } catch (e) { } }); charts.current = {}; };
    }, [bills]);

    if (!bills.length) return <EmptyState />;

    return (
        <Box>
            <KpiRow kpis={[
                { label: 'Total Revenue', value: '₹' + fmt(total), sub: count + ' bills', color: '#10b981', trend: trendPct },
                { label: 'Avg Bill Value', value: '₹' + fmt(avg), sub: 'per transaction', color: '#6366f1' },
                { label: 'GST Collected', value: '₹' + fmt(gstCol), sub: 'collected', color: '#f59e0b' },
                { label: 'Best Day', value: '₹' + fmt(bestDay ? bestDay[1] : 0), sub: bestDay ? fmtDate(bestDay[0]) : '—', color: '#8b5cf6' },
                { label: 'Products Sold', value: pSet.size, sub: 'unique items', color: '#ef4444' },
            ]} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <ChartCard title="Revenue Trend" wide>
                    <canvas ref={el => canvases.current.revenue = el} />
                </ChartCard>
                <ChartCard title="Sales by Hour" short>
                    <canvas ref={el => canvases.current.hourly = el} />
                </ChartCard>
                <ChartCard title="Sales by Weekday" short>
                    <canvas ref={el => canvases.current.weekday = el} />
                </ChartCard>
                <ChartCard title="Category Split">
                    <canvas ref={el => canvases.current.cat = el} />
                </ChartCard>
            </Box>
        </Box>
    );
}

// ── SALES ──
function SalesSection({ bills, charts }) {
    const canvases = useRef({});
    const total = bills.reduce((s, b) => s + b.total, 0);
    const gstT = bills.reduce((s, b) => s + b.gst, 0);
    const discB = bills.filter(b => b.discount > 0).length;
    const avgDisc = discB ? bills.filter(b => b.discount > 0).reduce((s, b) => s + b.discount, 0) / discB : 0;
    const uniqueDays = new Set(bills.map(b => b.dateStr)).size;

    useEffect(() => {
        const dayMap = {}; bills.forEach(b => { dayMap[b.dateStr] = (dayMap[b.dateStr] || 0) + b.total; });
        const sorted = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0]));
        if (sorted.length && canvases.current.ma) {
            const rawData = sorted.map(([, v]) => +v.toFixed(2));
            const ma = rawData.map((_, i) => { const sl = rawData.slice(Math.max(0, i - 6), i + 1); return +(sl.reduce((s, v) => s + v, 0) / sl.length).toFixed(2); });
            charts.current.ma = new Chart(canvases.current.ma, {
                type: 'line', data: {
                    labels: sorted.map(([d]) => fmtDate(d)), datasets: [
                        { label: 'Daily', data: rawData, borderColor: 'rgba(99,102,241,0.5)', backgroundColor: 'rgba(99,102,241,0.06)', borderWidth: 1.5, fill: true, tension: 0.2, pointRadius: 2 },
                        { label: '7-Day MA', data: ma, borderColor: '#10b981', borderWidth: 2.5, fill: false, tension: 0.4, pointRadius: 0 }
                    ]
                },
                options: { ...chartOpts('₹'), plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } } }
            });
        }
        if (canvases.current.disc) {
            const ranges = ['0%', '1-5%', '6-10%', '11-20%', '>20%'], counts = [0, 0, 0, 0, 0];
            bills.forEach(b => { const d = b.discount || 0; if (d === 0) counts[0]++; else if (d <= 5) counts[1]++; else if (d <= 10) counts[2]++; else if (d <= 20) counts[3]++; else counts[4]++; });
            charts.current.disc = new Chart(canvases.current.disc, {
                type: 'pie', data: { labels: ranges, datasets: [{ data: counts, backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ef4444'], borderWidth: 2, borderColor: 'transparent' }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } } } }
            });
        }
        return () => { Object.values(charts.current).forEach(c => { try { c.destroy(); } catch (e) { } }); charts.current = {}; };
    }, [bills]);

    if (!bills.length) return <EmptyState />;
    return (
        <Box>
            <KpiRow kpis={[
                { label: 'Net Revenue', value: '₹' + fmt(total), sub: 'after discounts', color: '#10b981' },
                { label: 'GST Collected', value: '₹' + fmt(gstT), color: '#f59e0b' },
                { label: 'Bills w/ Discount', value: discB, sub: `avg ${avgDisc.toFixed(1)}% off`, color: '#6366f1' },
                { label: 'Daily Avg', value: '₹' + fmt(bills.length ? total / Math.max(1, uniqueDays) : 0), sub: 'revenue/day', color: '#8b5cf6' },
                { label: 'Items/Bill', value: (bills.length ? (bills.reduce((s, b) => s + b.items.reduce((a, i) => a + i.qty, 0), 0) / bills.length).toFixed(1) : 0), sub: 'avg qty', color: '#ef4444' },
            ]} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <ChartCard title="Revenue with 7-Day Moving Average" wide tall>
                    <canvas ref={el => canvases.current.ma = el} />
                </ChartCard>
                <ChartCard title="Discount Distribution">
                    <canvas ref={el => canvases.current.disc = el} />
                </ChartCard>
            </Box>
        </Box>
    );
}

// ── PRODUCTS ──
function ProductsSection({ bills, charts }) {
    const canvases = useRef({});
    const [prodMode, setProdMode] = useState('revenue');
    const revMap = {}, qtyMap = {}, catMap = {};
    bills.forEach(b => b.items.forEach(i => { revMap[i.name] = (revMap[i.name] || 0) + i.total; qtyMap[i.name] = (qtyMap[i.name] || 0) + i.qty; catMap[i.name] = i.cat; }));
    const useMap = prodMode === 'revenue' ? revMap : qtyMap;
    const sorted = Object.entries(useMap).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const maxVal = sorted.length ? sorted[0][1] : 1;
    const catColors = { hardware: '#6366f1', electrical: '#f59e0b', plumbing: '#06b6d4', custom: '#10b981' };

    useEffect(() => {
        const m = {}; bills.forEach(b => b.items.forEach(i => { m[i.cat] = (m[i.cat] || 0) + i.total; }));
        const labels = Object.keys(m), data = labels.map(k => +m[k].toFixed(2));
        if (canvases.current.catBar && labels.length) {
            charts.current.catBar = new Chart(canvases.current.catBar, {
                type: 'bar', data: { labels, datasets: [{ label: '₹ Revenue', data, backgroundColor: labels.map(l => catColors[l] || '#999'), borderRadius: 5 }] },
                options: { ...chartOpts('₹'), indexAxis: 'y' }
            });
        }
        return () => { Object.values(charts.current).forEach(c => { try { c.destroy(); } catch (e) { } }); charts.current = {}; };
    }, [bills, prodMode]);

    if (!bills.length) return <EmptyState />;
    return (
        <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <ChartCard
                    title="Top Products" wide
                    headerExtra={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip label="Revenue" size="small" variant={prodMode === 'revenue' ? 'filled' : 'outlined'} color={prodMode === 'revenue' ? 'primary' : 'default'} onClick={() => setProdMode('revenue')} sx={{ cursor: 'pointer' }} />
                            <Chip label="Quantity" size="small" variant={prodMode === 'qty' ? 'filled' : 'outlined'} color={prodMode === 'qty' ? 'primary' : 'default'} onClick={() => setProdMode('qty')} sx={{ cursor: 'pointer' }} />
                        </Box>
                    }
                >
                    <Box sx={{ overflow: 'auto', height: '100%' }}>
                        {sorted.map(([name, val], i) => {
                            const cat = catMap[name] || 'custom';
                            const pct = (val / maxVal * 100);
                            const displayVal = prodMode === 'revenue' ? '₹' + fmt(val) : val + ' units';
                            return (
                                <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                                    <Typography variant="caption" sx={{ width: 24, textAlign: 'right', color: 'text.secondary' }}>{i + 1}</Typography>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" noWrap fontWeight={500}>{name}</Typography>
                                        <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.25 }}>
                                            <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: catColors[cat] || '#999', borderRadius: 3, transition: 'width 0.3s' }} />
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" fontWeight={600} sx={{ minWidth: 70, textAlign: 'right' }}>{displayVal}</Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </ChartCard>
                <ChartCard title="Revenue by Category">
                    <canvas ref={el => canvases.current.catBar = el} />
                </ChartCard>
            </Box>
        </Box>
    );
}

// ── CUSTOMERS ──
function CustomersSection({ bills, charts }) {
    const canvases = useRef({});
    const custMap = {}, custCount = {};
    bills.forEach(b => { const c = b.customer || 'Walk-in'; custMap[c] = (custMap[c] || 0) + b.total; custCount[c] = (custCount[c] || 0) + 1; });
    const uniq = Object.keys(custMap).length;
    const returning = Object.values(custCount).filter(v => v > 1).length;
    const topSpender = Object.entries(custMap).sort((a, b) => b[1] - a[1])[0];

    useEffect(() => {
        const m = {}; bills.forEach(b => { m[b.billType || 'Retail'] = (m[b.billType || 'Retail'] || 0) + 1; });
        const labels = Object.keys(m), data = labels.map(k => m[k]);
        if (canvases.current.billtype && labels.length) {
            charts.current.billtype = new Chart(canvases.current.billtype, {
                type: 'doughnut', data: { labels, datasets: [{ data, backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#8b5cf6'], borderWidth: 2, borderColor: 'transparent' }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } } } }
            });
        }
        return () => { Object.values(charts.current).forEach(c => { try { c.destroy(); } catch (e) { } }); charts.current = {}; };
    }, [bills]);

    if (!bills.length) return <EmptyState />;
    const sortedCust = Object.entries(custMap).sort((a, b) => b[1] - a[1]).slice(0, 15);
    return (
        <Box>
            <KpiRow kpis={[
                { label: 'Total Customers', value: uniq, sub: 'unique names', color: '#6366f1' },
                { label: 'Return Customers', value: returning, sub: `${uniq ? ((returning / uniq * 100).toFixed(0)) : 0}% retention`, color: '#10b981' },
                { label: 'Top Customer', value: topSpender ? topSpender[0].slice(0, 12) : '—', sub: topSpender ? '₹' + fmt(topSpender[1]) : '', color: '#f59e0b' },
                { label: 'Walk-in Bills', value: bills.filter(b => b.customer === 'Walk-in' || !b.customer).length, sub: 'anonymous', color: '#8b5cf6' },
                { label: 'Avg Spend/Visit', value: '₹' + fmt(uniq ? Object.values(custMap).reduce((s, v) => s + v, 0) / bills.length : 0), color: '#ef4444' },
            ]} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Customer Leaderboard</Typography>
                    {sortedCust.map(([name, total], i) => {
                        const visits = custCount[name] || 1;
                        const medalColors = ['#f59e0b', '#94a3b8', '#d97706'];
                        return (
                            <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{
                                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: i < 3 ? medalColors[i] : 'action.hover',
                                    color: i < 3 ? '#fff' : 'text.secondary',
                                    fontSize: '0.7rem', fontWeight: 700,
                                }}>
                                    {i + 1}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={500} noWrap>{name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{visits} visit{visits !== 1 ? 's' : ''}</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={600}>₹{fmt(total)}</Typography>
                            </Box>
                        );
                    })}
                </Paper>
                <ChartCard title="Bill Type Breakdown">
                    <canvas ref={el => canvases.current.billtype = el} />
                </ChartCard>
            </Box>
        </Box>
    );
}

// ── HISTORY ──
function HistorySection({ allBills, setAllBills }) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sort, setSort] = useState('date-desc');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);

    const sorted = [...allBills].sort((a, b) => b.date - a.date);
    const fromTime = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : 0;
    const toTime = dateTo ? new Date(dateTo + 'T23:59:59').getTime() : Infinity;

    let filtered = sorted.filter(b => {
        const matchQ = !search || (b.customer || '').toLowerCase().includes(search.toLowerCase()) || String(b.invNum).includes(search) || b.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
        const matchT = !typeFilter || b.billType === typeFilter;
        const matchDate = b.date >= fromTime && b.date <= toTime;
        return matchQ && matchT && matchDate;
    });
    if (sort === 'date-asc') filtered.sort((a, b) => a.date - b.date);
    if (sort === 'total-desc') filtered.sort((a, b) => b.total - a.total);
    if (sort === 'total-asc') filtered.sort((a, b) => a.total - b.total);

    const pages = Math.ceil(filtered.length / HIST_PER_PAGE);
    const slice = filtered.slice((page - 1) * HIST_PER_PAGE, page * HIST_PER_PAGE);

    async function handleDeleteBill(bill) {
        if (!confirm('Delete this bill from history?')) return;
        try {
            await apiDeleteBill(bill._id);
            setAllBills(prev => prev.filter(b => b._id !== bill._id));
        } catch (e) { }
    }

    return (
        <Box>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    size="small" placeholder="Search customer, bill #, item…"
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    sx={{ flex: 1, minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel>Type</InputLabel>
                    <Select label="Type" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                        <MenuItem value="">All Types</MenuItem>
                        {['Retail', 'Wholesale', 'Contractor', 'Credit'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sort</InputLabel>
                    <Select label="Sort" value={sort} onChange={e => setSort(e.target.value)}>
                        <MenuItem value="date-desc">Newest First</MenuItem>
                        <MenuItem value="date-asc">Oldest First</MenuItem>
                        <MenuItem value="total-desc">Highest Amount</MenuItem>
                        <MenuItem value="total-asc">Lowest Amount</MenuItem>
                    </Select>
                </FormControl>
                <TextField size="small" type="date" label="From" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
                <TextField size="small" type="date" label="To" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
            </Box>

            {filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h3">🧾</Typography>
                    <Typography color="text.secondary">No bills found</Typography>
                </Box>
            ) : (
                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {slice.map(b => (
                                <React.Fragment key={b._id}>
                                    <TableRow hover onClick={() => setExpandedId(expandedId === b._id ? null : b._id)} sx={{ cursor: 'pointer' }}>
                                        <TableCell><Typography variant="body2" fontWeight={600}>#{pad(b.invNum)}</Typography></TableCell>
                                        <TableCell>{b.customer}</TableCell>
                                        <TableCell><Chip label={b.billType || 'Retail'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} /></TableCell>
                                        <TableCell><Typography variant="caption">{b.items.length} items · {b.items.reduce((s, i) => s + i.qty, 0)} units</Typography></TableCell>
                                        <TableCell align="right"><Typography variant="body2" fontWeight={600}>₹{fmt(b.total)}</Typography></TableCell>
                                        <TableCell><Typography variant="caption">{fmtDateTime(b.date)}</Typography></TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={e => { e.stopPropagation(); printViaIframe(buildBillHTML(b)); }}><Print sx={{ fontSize: 16 }} /></IconButton>
                                            <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleDeleteBill(b); }}><Delete sx={{ fontSize: 16 }} /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ p: 0, borderBottom: expandedId === b._id ? undefined : 'none' }}>
                                            <Collapse in={expandedId === b._id}>
                                                <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }} align="right">Qty</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }} align="right">Unit Price</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {b.items.map((item, i) => (
                                                                <TableRow key={i}>
                                                                    <TableCell>{item.name}</TableCell>
                                                                    <TableCell><Typography variant="caption" color="text.secondary">{item.sku || '—'}</Typography></TableCell>
                                                                    <TableCell><Chip label={item.cat} size="small" sx={{ height: 18, fontSize: '0.6rem' }} /></TableCell>
                                                                    <TableCell align="right">{item.qty}</TableCell>
                                                                    <TableCell align="right">₹{fmt(item.unitPrice)}</TableCell>
                                                                    <TableCell align="right"><Typography fontWeight={600}>₹{fmt(item.total)}</Typography></TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                    {b.discount > 0 && <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Discount: {b.discount}%</Typography>}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
            {pages > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">{filtered.length} bills</Typography>
                    <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} size="small" color="primary" />
                </Box>
            )}
        </Box>
    );
}
