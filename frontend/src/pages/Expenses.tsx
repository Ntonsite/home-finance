import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Plus, Trash2, Calendar, Tag, Receipt, User, Users, X } from 'lucide-react';
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
    isPersonal: boolean;
}

export const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [viewMode, setViewMode] = useState<'household' | 'personal'>('household');

    // Form State
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        subcategoryId: '',
        quantity: '',
        unit: '',
        amount: '',
        paymentMethod: 'Cash',
        notes: '',
        isPersonal: false
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const isPersonal = viewMode === 'personal';
            const [expRes, catRes] = await Promise.all([
                apiClient(`/expenses?personal=${isPersonal}`),
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
    }, [viewMode]);

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
                date: format(new Date(), 'yyyy-MM-dd'),
                subcategoryId: '',
                quantity: '',
                unit: '',
                amount: '',
                paymentMethod: 'Cash',
                notes: '',
                isPersonal: viewMode === 'personal'
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
        <div className="space-y-6 pb-24 px-4 max-w-4xl mx-auto relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold premium-gradient-text">Transactions</h1>
                    <p className="text-gray-400 text-sm">Manage your spending records</p>
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

            {showAddForm && (
                <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="premium-card w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Receipt className="text-electric-blue" /> Add Transaction
                            </h2>
                            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex flex-col justify-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPersonal}
                                            onChange={(e) => setFormData({ ...formData, isPersonal: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-700 bg-navy-900 text-electric-blue focus:ring-electric-blue"
                                        />
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-wider">Is Personal?</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Item Segment</label>
                                <select
                                    required
                                    value={formData.subcategoryId}
                                    onChange={handleSubcategoryChange}
                                    className="w-full"
                                >
                                    <option value="" disabled>Select Segment</option>
                                    {subcategories.map(s => (
                                        <option key={s.id} value={s.id}>{s.category.name} › {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        placeholder="0.0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Unit</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="pc, kg, etc"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Amount (TZS)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold text-sm">TZS</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-14 text-xl font-bold text-electric-blue"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Payment Method</label>
                                    <select
                                        required
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="M-Pesa">M-Pesa</option>
                                        <option value="Bank">Bank</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Notes</label>
                                    <input
                                        type="text"
                                        value={formData.notes || ''}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Optional details"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-electric-blue text-white px-6 py-4 rounded-xl shadow-xl font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all mt-4">
                                Confirm Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="premium-card p-4 h-24 animate-pulse"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20 premium-card">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={fetchData} className="px-6 py-2 bg-navy-900 border border-gray-700 rounded-xl text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
                        Retry Connection
                    </button>
                </div>
            ) : expenses.length === 0 ? (
                <div className="text-center py-20 premium-card">
                    <div className="w-20 h-20 bg-navy-950 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-800 shadow-inner">
                        <Receipt className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-200">Clear Trails</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">No {viewMode} transactions found for this period. Start tracking to see insights.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {expenses.map((exp) => (
                        <div key={exp.id} className="premium-card p-4 hover:border-electric-blue/30 transition-all group overflow-hidden">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-navy-950 text-electric-blue rounded-2xl border border-gray-800 transition-transform group-hover:scale-110">
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-100 uppercase tracking-tight">{exp.subcategory.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <span>{exp.subcategory.category.name}</span>
                                            <span className="text-gray-700">|</span>
                                            <span>{exp.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-black text-white">
                                        {exp.amount.toLocaleString()} <span className="text-[10px] text-gray-500 ml-0.5 font-bold">TZS</span>
                                    </div>
                                    <div className="mt-1 text-[10px] font-black text-electric-blue uppercase">
                                        {exp.quantity} {exp.unit}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-800/50 mt-4">
                                <div className="flex items-center text-[10px] font-black text-gray-500 tracking-widest uppercase">
                                    <Calendar className="w-3 h-3 mr-1.5 text-gray-600" />
                                    {format(new Date(exp.date), 'MMM dd, yyyy')}
                                </div>

                                <div className="flex gap-2">
                                    {exp.isPersonal && (
                                        <span className="px-2 py-0.5 bg-electric-blue/10 text-electric-blue border border-electric-blue/20 rounded text-[10px] font-black uppercase tracking-tighter">Personal</span>
                                    )}
                                    <button
                                        onClick={() => handleDelete(exp.id)}
                                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!showAddForm && (
                <button
                    onClick={() => {
                        setFormData(prev => ({ ...prev, isPersonal: viewMode === 'personal' }));
                        setShowAddForm(true);
                    }}
                    className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 group flex items-center gap-2"
                    aria-label="Add Transaction"
                >
                    {/* Persistent glow ring — keeps button unmissable on mobile */}
                    <span className="absolute inset-0 rounded-2xl bg-electric-blue/40 blur-md scale-110 md:hidden" />

                    <span className="relative flex items-center gap-2 bg-electric-blue text-white px-4 py-3.5 md:p-0 md:w-16 md:h-16 md:rounded-2xl rounded-xl shadow-[0_0_24px_rgba(59,130,246,0.55)] hover:shadow-[0_0_36px_rgba(59,130,246,0.85)] hover:scale-105 active:scale-90 transition-all md:justify-center">
                        <Plus className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-200 shrink-0" />
                        <span className="text-sm font-black uppercase tracking-widest md:hidden">Add</span>
                    </span>
                </button>
            )}
        </div>
    );
};
