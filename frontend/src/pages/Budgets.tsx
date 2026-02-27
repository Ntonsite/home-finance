import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Save } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Budget Planning</h1>
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

            {loading ? (
                <div className="text-center py-10 dark:text-gray-400">Loading budgets...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Budget Amount (TZS)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {cat.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <input
                                            type="number"
                                            value={editAmounts[cat.id] || ''}
                                            onChange={(e) => setEditAmounts({ ...editAmounts, [cat.id]: e.target.value })}
                                            placeholder="0.00"
                                            className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-1 border focus:ring-primary-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                                        <button
                                            onClick={() => handleSaveBudget(cat.id)}
                                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
                                        >
                                            <Save className="w-5 h-5 mr-1" /> Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
