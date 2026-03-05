import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Trash2, Folder, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Subcategory {
    id: number;
    name: string;
    defaultUnit: string | null;
}

interface Category {
    id: number;
    name: string;
    subcategories: Subcategory[];
}

export const Categories = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN';

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddCat, setShowAddCat] = useState(false);
    const [showAddSub, setShowAddSub] = useState(false);

    const [newCatName, setNewCatName] = useState('');
    const [newSubcatName, setNewSubcatName] = useState('');
    const [newSubcatUnit, setNewSubcatUnit] = useState('');
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiClient('/categories');
            setCategories(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            await apiClient('/categories', {
                method: 'POST',
                body: JSON.stringify({ name: newCatName }),
            });
            setNewCatName('');
            setShowAddCat(false);
            fetchCategories();
        } catch (err) {
            alert('Failed to add category');
        }
    };

    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubcatName.trim() || !selectedCatId) return;
        try {
            await apiClient('/subcategories', {
                method: 'POST',
                body: JSON.stringify({
                    name: newSubcatName,
                    categoryId: selectedCatId,
                    defaultUnit: newSubcatUnit || null,
                }),
            });
            setNewSubcatName('');
            setNewSubcatUnit('');
            setSelectedCatId(null);
            setShowAddSub(false);
            fetchCategories();
        } catch (err) {
            alert('Failed to add subcategory');
        }
    };

    const handleDeleteSubcategory = async (id: number) => {
        if (!confirm('Delete this item? It cannot be undone.')) return;
        try {
            await apiClient(`/subcategories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    return (
        <div className="space-y-4 pb-24 relative">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Segments</h1>

            {/* Floating Action Buttons - Only for Admins */}
            {isAdmin && (
                <div className="fixed bottom-20 right-6 flex flex-col gap-3 z-40">
                    <button
                        onClick={() => { setShowAddSub(!showAddSub); setShowAddCat(false); }}
                        className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 shadow-lg hover:bg-gray-600 active:scale-90 transition-all ml-auto"
                        title="Add Item"
                    >
                        <Tag className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { setShowAddCat(!showAddCat); setShowAddSub(false); }}
                        className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_0_rgba(60,130,107,0.39)] hover:bg-primary-500 active:scale-90 transition-all"
                        title="Add Category"
                    >
                        <Folder className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Quick Add Forms */}
            {isAdmin && (showAddCat || showAddSub) && (
                <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-100">
                            {showAddCat ? 'New Category' : 'New Item Segment'}
                        </h2>
                        <button onClick={() => { setShowAddCat(false); setShowAddSub(false); }} className="text-gray-400 hover:text-gray-200 text-sm">
                            Cancel
                        </button>
                    </div>

                    {showAddCat && (
                        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Utilities"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3"
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform mt-2">
                                Save Category
                            </button>
                        </form>
                    )}

                    {showAddSub && (
                        <form onSubmit={handleAddSubcategory} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Parent Category</label>
                                <select
                                    required
                                    value={selectedCatId || ''}
                                    onChange={(e) => setSelectedCatId(Number(e.target.value))}
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Electricity"
                                        value={newSubcatName}
                                        onChange={(e) => setNewSubcatName(e.target.value)}
                                        className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Default Unit</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. kWh"
                                        value={newSubcatUnit}
                                        onChange={(e) => setNewSubcatUnit(e.target.value)}
                                        className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform mt-2">
                                Save Item
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Categories List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-800 rounded-2xl h-32 animate-pulse border border-gray-800/50"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-10 bg-gray-800 rounded-2xl border border-gray-700">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={fetchCategories} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700">
                        Retry
                    </button>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700 shadow-md">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Folder className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-200">No Categories Found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAdmin ? 'Tap the + button to create a category' : 'No categories available for this household.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-sm">
                            <div className="bg-gray-900/50 px-5 py-3 border-b border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                    <h3 className="font-bold text-gray-100">{cat.name}</h3>
                                </div>
                                <span className="text-xs font-bold text-gray-500 bg-gray-900 px-2 py-1 rounded-full">
                                    {cat.subcategories.length} items
                                </span>
                            </div>
                            <div className="divide-y divide-gray-700/50">
                                {cat.subcategories.map((sub) => (
                                    <div key={sub.id} className="p-4 flex items-center justify-between active:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-900 rounded-lg border border-gray-800 text-gray-400">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-200">{sub.name}</p>
                                                {sub.defaultUnit && (
                                                    <p className="text-xs text-gray-500 font-medium">Unit: {sub.defaultUnit}</p>
                                                )}
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {cat.subcategories.length === 0 && (
                                    <div className="p-4 text-sm text-gray-500 italic text-center">
                                        No items in this category.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
