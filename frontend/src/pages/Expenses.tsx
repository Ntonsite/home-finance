import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Plus, Trash2, Calendar, Tag, Receipt } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);
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
            setError(null);
            const [expRes, catRes] = await Promise.all([
                apiClient('/expenses'),
                apiClient('/categories')
            ]);
            setExpenses(expRes);

            const allSubs = catRes.flatMap((c: any) =>
                c.subcategories.map((s: any) => ({ ...s, category: { id: c.id, name: c.name } }))
            );
            setSubcategories(allSubs);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load expenses');
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
                body: JSON.stringify({
                    ...formData,
                    quantity: Number(formData.quantity),
                    amount: Number(formData.amount)
                }),
            });
            setShowAddForm(false);
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
        <div className="space-y-4 pb-20 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-100">Transactions</h1>
            </div>

            {showAddForm && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-100">Add Expense</h2>
                        <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-200">
                            Close
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Item Category</label>
                            <select
                                required
                                value={formData.subcategoryId}
                                onChange={handleSubcategoryChange}
                                className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                            >
                                <option value="" disabled>Select Item Segment</option>
                                {subcategories.map(s => (
                                    <option key={s.id} value={s.id}>{s.category.name} - {s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Qty</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Unit</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Amount (TZS)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500">TZS</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="block w-full pl-12 rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 font-semibold text-lg"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Payment Method</label>
                            <select
                                required
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                            >
                                <option value="Cash">Cash</option>
                                <option value="M-Pesa">M-Pesa</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Notes (Optional)</label>
                            <input
                                type="text"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any details..."
                                className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3"
                            />
                        </div>
                        <button type="submit" className="w-full bg-primary-600 active:bg-primary-700 text-white px-6 py-4 rounded-xl shadow-lg font-bold transition-transform active:scale-95 mt-2">
                            Save Transaction
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-800 rounded-2xl p-4 animate-pulse flex justify-between items-center shadow-md border border-gray-800/50">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-700 rounded w-24"></div>
                                <div className="h-3 bg-gray-700 rounded w-32"></div>
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="h-5 bg-gray-700 rounded w-20 ml-auto"></div>
                                <div className="h-3 bg-gray-700 rounded w-12 ml-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-10 bg-gray-800 rounded-2xl border border-gray-700">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={fetchData} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 active:bg-gray-600 transition-colors">
                        Retry
                    </button>
                </div>
            ) : expenses.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700 shadow-md">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-200">No Transactions</h3>
                    <p className="text-sm text-gray-500 mt-1">Tap the + button to record an expense</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {expenses.map((exp) => (
                        <div key={exp.id} className="bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-700 flex flex-col gap-3 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-gray-900 text-primary-400 rounded-xl mt-0.5 border border-gray-800">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-100">{exp.subcategory.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                                            <span className="font-medium text-primary-400/90">{exp.subcategory.category.name}</span>
                                            <span>&bull;</span>
                                            <span>{exp.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-bold text-gray-100">
                                        {exp.amount.toLocaleString()} <span className="text-xs text-gray-500 font-normal">TZS</span>
                                    </div>
                                    <div className="mt-1 text-xs font-medium text-gray-400">
                                        {exp.quantity} {exp.unit}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-gray-700/50 mt-1">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {format(new Date(exp.date), 'MMM dd, yyyy')}
                                </div>

                                <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="p-1.5 text-red-400/80 hover:text-red-300 bg-red-900/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!showAddForm && (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="fixed bottom-20 right-6 w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_0_rgba(60,130,107,0.39)] hover:bg-primary-500 active:scale-90 transition-all z-40"
                    aria-label="Add Expense"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};
