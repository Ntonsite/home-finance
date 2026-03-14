import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, User, Calendar } from 'lucide-react';

export const Dashboard = () => {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [viewMode, setViewMode] = useState<'household' | 'personal'>('household');

    const [overview, setOverview] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const isPersonal = viewMode === 'personal';
            const [overviewData, comparisonData] = await Promise.all([
                apiClient(`/analytics/monthly-overview?month=${selectedMonth}&year=${selectedYear}&personal=${isPersonal}`),
                apiClient(`/analytics/comparison?month=${selectedMonth}&year=${selectedYear}&personal=${isPersonal}`)
            ]);
            setOverview(overviewData);
            setComparison(comparisonData);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [selectedMonth, selectedYear, viewMode]);

    const COLORS = ['#3b82f6', '#60a5fa', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const formatCurrency = (val: number) => `TZS ${val.toLocaleString()}`;

    return (
        <div className="space-y-6 pb-24 px-4 max-w-4xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold premium-gradient-text">Overview</h1>
                        <p className="text-gray-400 text-sm">Track your financial status</p>
                    </div>
                    <div className="flex bg-navy-900 p-1 rounded-xl border border-gray-700">
                        <button
                            onClick={() => setViewMode('household')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'household' ? 'bg-electric-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Users size={14} /> Household
                        </button>
                        <button
                            onClick={() => setViewMode('personal')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'personal' ? 'bg-electric-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <User size={14} /> Personal
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Month picker */}
                    <div className="flex-1 relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={15} />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="w-full appearance-none rounded-xl bg-navy-900 border border-gray-700 text-white font-medium py-3 pl-9 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-colors"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        {/* Custom chevron replaces hidden native arrow */}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {/* Year picker */}
                    <div className="flex-1 relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={15} />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full appearance-none rounded-xl bg-navy-900 border border-gray-700 text-white font-medium py-3 pl-9 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue transition-colors"
                        >
                            {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        {/* Custom chevron replaces hidden native arrow */}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {loading || !overview || !comparison ? (
                <div className="space-y-4">
                    <div className="premium-card h-32 animate-pulse"></div>
                    <div className="premium-card h-64 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="premium-card h-40 animate-pulse"></div>
                        <div className="premium-card h-40 animate-pulse"></div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="premium-card p-5 relative overflow-hidden group">
                            <div className="z-10 relative">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spending</p>
                                <p className="text-3xl font-bold text-white tracking-tight">
                                    {formatCurrency(overview.totalSpent)}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                                        comparison.trend === 'increase' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                        {comparison.trend === 'increase' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                        {Math.abs(comparison.percentChange).toFixed(1)}% vs Last Month
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 p-4 bg-electric-blue/10 text-electric-blue rounded-2xl border border-electric-blue/20 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="premium-card p-5 relative overflow-hidden group">
                            <div className="z-10 relative">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Previous Month</p>
                                <p className="text-3xl font-bold text-white tracking-tight">
                                    {formatCurrency(comparison.prevTotal)}
                                </p>
                                <p className="mt-4 text-xs text-gray-500 font-medium">
                                    Budget Utilization: <span className="text-white">84%</span>
                                </p>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 p-4 bg-glow-blue/10 text-glow-blue rounded-2xl border border-glow-blue/20 group-hover:scale-110 transition-transform">
                                <Calendar className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Daily Trend Chart */}
                    <div className="premium-card p-5">
                        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6 flex justify-between items-center">
                            Daily Spending Trend
                            <span className="text-[10px] bg-navy-950 px-2 py-1 rounded border border-gray-700">CURRENT MONTH</span>
                        </h2>
                        <div className="h-64 mt-4 -ml-6">
                            {overview.dailyTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={overview.dailyTrend}>
                                        <defs>
                                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis 
                                            dataKey="date" 
                                            hide 
                                        />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <RechartsTooltip
                                            contentStyle={{ 
                                                backgroundColor: '#1e3a5f', 
                                                borderColor: '#334155', 
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(val: any) => formatCurrency(Number(val))}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSpend)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data for this period</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="premium-card p-5">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Category Allocation</h2>
                            <div className="h-64">
                                {overview.categorySpend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={overview.categorySpend}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {overview.categorySpend.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(val: any) => formatCurrency(Number(val))}
                                                contentStyle={{ backgroundColor: '#1e3a5f', border: 'none', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                align="center"
                                                iconType="circle"
                                                wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data available</div>
                                )}
                            </div>
                        </div>

                        {/* Top Expenses */}
                        <div className="premium-card p-5">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-5">High Frequency Items</h2>
                            <div className="space-y-4">
                                {overview.topSubcategories && overview.topSubcategories.length > 0 ? (
                                    overview.topSubcategories.map((item: any, index: number) => (
                                        <div key={item.name} className="flex items-center">
                                            <div className="w-8 h-8 rounded-lg bg-navy-950 border border-gray-700 text-electric-blue flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-end mb-1">
                                                    <p className="text-sm font-medium text-white truncate pr-2">{item.name}</p>
                                                    <p className="text-sm font-bold text-white whitespace-nowrap">
                                                        {item.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-electric-blue h-full rounded-full"
                                                        style={{ width: `${Math.max(5, (item.amount / overview.topSubcategories[0].amount) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-500 text-sm">
                                        No metrics to display.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Insights Breakdown */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider px-1">Subcategory Intelligence</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {overview.subcategoryInsights.sort((a: any, b: any) => b.spent - a.spent).map((item: any) => (
                                <div key={item.name} className="premium-card p-4 flex flex-col gap-2 hover:border-electric-blue/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-bold text-gray-100">{item.name}</h3>
                                        <span className="text-sm font-black text-electric-blue">{formatCurrency(item.spent)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mt-1">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1 uppercase tracking-tighter"><Calendar size={10}/> {item.frequency}x FREQ</span>
                                            <span className="flex items-center gap-1 uppercase tracking-tighter"><TrendingUp size={10}/> {item.quantity} units</span>
                                        </div>
                                        <span className="bg-navy-950 px-2 py-0.5 rounded border border-gray-800">AVG: {item.avgCostPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}/u</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
