import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    defaultUnit: string | null;
    category: Category;
}

interface Expense {
    id: number;
    date: string;
    subcategoryId: number;
    subcategory: Subcategory;
    quantity: number;
    unit: string;
    amount: number;
    paymentMethod: string;
    notes: string | null;
}

export const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        subcategoryId: '',
        quantity: '',
        unit: '',
        amount: '',
        paymentMethod: 'Cash',
        notes: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expRes, catRes] = await Promise.all([
                apiClient('/expenses'),
                apiClient('/categories')
            ]);
            setExpenses(expRes);

            const allSubs = catRes.flatMap((c: any) =>
                c.subcategories.map((s: any) => ({ ...s, category: { id: c.id, name: c.name } }))
            );
            setSubcategories(allSubs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subId = e.target.value;
        const sub = subcategories.find(s => s.id === Number(subId));
        setFormData({
            ...formData,
            subcategoryId: subId,
            unit: sub?.defaultUnit || formData.unit,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient('/expenses', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            setShowAddForm(false);
            // Reset form
            setFormData({
                ...formData,
                subcategoryId: '',
                quantity: '',
                amount: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            alert('Failed to save expense');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this expense?')) return;
        try {
            await apiClient(`/expenses/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            alert('Failed to delete expense');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Expense Tracking</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-1" /> Record Expense
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium mb-4 dark:text-gray-200">New Expense</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item (Subcategory)</label>
                            <select
                                required
                                value={formData.subcategoryId}
                                onChange={handleSubcategoryChange}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="" disabled>Select Item</option>
                                {subcategories.map(s => (
                                    <option key={s.id} value={s.id}>{s.category.name} - {s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (TZS)</label>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                            <select
                                required
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                <option value="Cash">Cash</option>
                                <option value="M-Pesa">M-Pesa</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 shadow-sm">
                                Save Expense
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 dark:text-gray-400">Loading expenses...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty/Unit</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount (TZS)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {expenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {format(new Date(exp.date), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                                                {exp.subcategory.category.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {exp.subcategory.name}
                                            {exp.notes && <p className="text-xs text-gray-400 font-normal mt-0.5">{exp.notes}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                                            {exp.quantity} {exp.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                                            {exp.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {exp.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleDelete(exp.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <Trash2 className="w-5 h-5 ml-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No expenses recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
