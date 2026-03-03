import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Dashboard = () => {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const [overview, setOverview] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [overviewData, comparisonData] = await Promise.all([
                apiClient(`/analytics/monthly-overview?month=${selectedMonth}&year=${selectedYear}`),
                apiClient(`/analytics/comparison?month=${selectedMonth}&year=${selectedYear}`)
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
    }, [selectedMonth, selectedYear]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

    return (
        <div className="space-y-6 pb-20">
            {/* Header controls */}
            <div className="flex justify-between items-center gap-2">
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="flex-1 rounded-xl bg-gray-800 border-gray-700 text-white font-medium p-3 shadow-sm focus:ring-primary-500"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                </select>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="flex-1 rounded-xl bg-gray-800 border-gray-700 text-white font-medium p-3 shadow-sm focus:ring-primary-500"
                >
                    {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {loading || !overview || !comparison ? (
                <div className="space-y-4">
                    {/* Skeleton Cards */}
                    <div className="bg-gray-800 rounded-2xl h-32 animate-pulse border border-gray-700"></div>
                    <div className="bg-gray-800 rounded-2xl h-32 animate-pulse border border-gray-700"></div>
                    <div className="bg-gray-800 rounded-2xl h-64 animate-pulse border border-gray-700"></div>
                    <div className="bg-gray-800 rounded-2xl h-64 animate-pulse border border-gray-700"></div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 relative overflow-hidden">
                            <div className="flex items-center justify-between z-10 relative">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spend</p>
                                    <p className="text-3xl font-bold text-white tracking-tight">
                                        TZS {overview.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl border border-primary-500/20">
                                    <DollarSign className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl"></div>
                        </div>

                        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 relative overflow-hidden">
                            <div className="flex items-center justify-between z-10 relative">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">M/M Change</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-white tracking-tight">
                                            {comparison.percentChange.toFixed(1)}%
                                        </p>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 font-medium">
                                        Prev: TZS {comparison.prevTotal.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl border ${comparison.trend === 'increase'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                    }`}
                                >
                                    {comparison.trend === 'increase' ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 gap-4 mt-6">
                        {/* Pie Chart */}
                        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Spend by Category</h2>
                            <div className="h-64">
                                {overview.categorySpend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={overview.categorySpend}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {overview.categorySpend.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(val: any) => `TZS ${Number(val).toLocaleString()}`}
                                                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC', borderRadius: '12px' }}
                                                itemStyle={{ color: '#F8FAFC' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data available</div>
                                )}
                            </div>
                        </div>

                        {/* Top 5 Expensive Subcategories */}
                        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-5">Top Expenses</h2>
                            <div className="space-y-4">
                                {overview.topSubcategories && overview.topSubcategories.length > 0 ? (
                                    overview.topSubcategories.map((item: any, index: number) => (
                                        <div key={item.name} className="flex items-center">
                                            <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-700 text-primary-400 flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-end mb-1">
                                                    <p className="text-sm font-medium text-white truncate pr-2">{item.name}</p>
                                                    <p className="text-sm font-bold text-primary-400 whitespace-nowrap">
                                                        {item.amount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-700/50">
                                                    <div
                                                        className="bg-primary-500 h-full transition-all duration-500 ease-out"
                                                        style={{ width: `${Math.max(5, (item.amount / overview.topSubcategories[0].amount) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-500 text-sm">
                                        No spending data available.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subcategory Intelligence Stacked Cards */}
                        <div className="mt-2 space-y-3">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 px-1">Detailed Breakdown</h2>
                            {overview.subcategoryInsights.sort((a: any, b: any) => b.spent - a.spent).map((item: any) => (
                                <div key={item.name} className="bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-700 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-bold text-gray-100">{item.name}</h3>
                                        <span className="text-sm font-bold text-white">TZS {item.spent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                        <div className="flex gap-3">
                                            <span>Qty: {item.quantity}</span>
                                            <span>Freq: {item.frequency}x</span>
                                        </div>
                                        <span>Avg: TZS {item.avgCostPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}/u</span>
                                    </div>
                                </div>
                            ))}
                            {overview.subcategoryInsights.length === 0 && (
                                <div className="text-center py-6 text-gray-500 text-sm bg-gray-800 rounded-2xl border border-gray-700">
                                    No detailed breakdown available.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
