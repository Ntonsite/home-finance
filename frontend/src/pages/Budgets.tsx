import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Save, Wallet } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Budget {
    id: number;
    categoryId: number;
    amount: number;
    category: Category;
}

export const Budgets = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const [editAmounts, setEditAmounts] = useState<Record<number, string>>({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catsRes, budgetsRes] = await Promise.all([
                apiClient('/categories'),
                apiClient(`/budgets?month=${selectedMonth}&year=${selectedYear}`)
            ]);
            setCategories(catsRes);

            // Initialize edit amounts
            const amounts: Record<number, string> = {};
            budgetsRes.forEach((b: Budget) => {
                amounts[b.categoryId] = b.amount.toString();
            });
            setEditAmounts(amounts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const handleSaveBudget = async (categoryId: number) => {
        const amountStr = editAmounts[categoryId];
        if (!amountStr) return;

        try {
            await apiClient('/budgets', {
                method: 'POST',
                body: JSON.stringify({
                    month: selectedMonth,
                    year: selectedYear,
                    categoryId,
                    amount: parseFloat(amountStr)
                })
            });
            alert('Budget saved');
            fetchData();
        } catch (err) {
            alert('Failed to save budget');
        }
    };

    return (
        <div className="space-y-4 pb-24">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Budgets</h1>

            <div className="flex justify-between items-center gap-2 mb-6">
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

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-800 rounded-2xl h-24 animate-pulse border border-gray-800/50"></div>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700 shadow-md">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-200">No Categories Found</h3>
                    <p className="text-sm text-gray-500 mt-1">Add categories first to set budgets</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-sm flex flex-col gap-3">
                            <h3 className="font-bold text-gray-200">{cat.name}</h3>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">TZS</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={editAmounts[cat.id] || ''}
                                        onChange={(e) => setEditAmounts({ ...editAmounts, [cat.id]: e.target.value })}
                                        placeholder="0"
                                        className="block w-full pl-12 rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3 font-semibold"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSaveBudget(cat.id)}
                                    className="p-3 bg-primary-600/10 text-primary-400 border border-primary-500/20 hover:bg-primary-600/20 active:bg-primary-600/30 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                                    title="Save Budget"
                                >
                                    <Save className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
