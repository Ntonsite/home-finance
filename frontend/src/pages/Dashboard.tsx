import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Dashboard Analytics</h1>
                <div className="flex space-x-4">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border focus:ring-primary-500"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border focus:ring-primary-500"
                    >
                        {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading || !overview || !comparison ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spend (Exclude Rent)</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        TZS {overview.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full">
                                    <DollarSign className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">vs Last Month</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {comparison.percentChange.toFixed(1)}%
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${comparison.trend === 'increase' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'}`}>
                                    {comparison.trend === 'increase' ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Prev: TZS {comparison.prevTotal.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spend by Category</h2>
                            <div className="h-72">
                                {overview.categorySpend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={overview.categorySpend}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {overview.categorySpend.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(val: any) => `TZS ${Number(val).toLocaleString()}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                                )}
                            </div>
                        </div>

                        {/* Spending By User Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Spend by User</h2>
                            <div className="h-72">
                                {overview.userSpend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={overview.userSpend}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="amount"
                                            >
                                                {overview.userSpend.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(val: any) => `TZS ${Number(val).toLocaleString()}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                                )}
                            </div>
                        </div>

                        {/* Line Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Spend Trend</h2>
                            <div className="h-72">
                                {overview.dailyTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={overview.dailyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                            <XAxis dataKey="date" tickFormatter={(v) => v.split('-')[2]} stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                            <RechartsTooltip formatter={(val: any) => `TZS ${Number(val).toLocaleString()}`} labelFormatter={(l) => `Date: ${l}`} />
                                            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Insights and Top Subcategories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Subcategory Intelligence Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Subcategory Intelligence</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subcategory</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchases</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Qty</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Cost/Unit (TZS)</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Spend (TZS)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {overview.subcategoryInsights.sort((a: any, b: any) => b.spent - a.spent).map((item: any) => (
                                            <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{item.frequency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{item.avgCostPerUnit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{item.spent.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {overview.subcategoryInsights.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    No subcategory spending data for this month.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top 5 Expensive Subcategories */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Top 5 Expensive Subcategories</h2>
                            </div>
                            <div className="p-6">
                                {overview.topSubcategories && overview.topSubcategories.length > 0 ? (
                                    <div className="space-y-4">
                                        {overview.topSubcategories.map((item: any, index: number) => (
                                            <div key={item.name} className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm mr-4 shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                                                        <div
                                                            className="bg-primary-600 h-1.5 rounded-full"
                                                            style={{ width: `${Math.max(5, (item.amount / overview.topSubcategories[0].amount) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="ml-4 text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                    TZS {item.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No spending data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
