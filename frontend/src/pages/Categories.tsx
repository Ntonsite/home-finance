import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Plus, Trash2 } from 'lucide-react';

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [newSubcatName, setNewSubcatName] = useState('');
    const [newSubcatUnit, setNewSubcatUnit] = useState('');
    const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

    const fetchCategories = async () => {
        try {
            const data = await apiClient('/categories');
            setCategories(data);
        } catch (err) {
            console.error(err);
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
            fetchCategories();
        } catch (err) {
            alert('Failed to add subcategory');
        }
    };

    const handleDeleteSubcategory = async (id: number) => {
        if (!confirm('Delete this subcategory?')) return;
        try {
            await apiClient(`/subcategories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (err) {
            alert('Failed to delete subcategory');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Category Management</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Add New Category</h2>
                <form onSubmit={handleAddCategory} className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Category Name (e.g., Food)"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                        <Plus className="w-5 h-5 mr-1" /> Add
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Add New Subcategory</h2>
                <form onSubmit={handleAddSubcategory} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={selectedCatId || ''}
                        onChange={(e) => setSelectedCatId(Number(e.target.value))}
                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border focus:ring-primary-500"
                    >
                        <option value="" disabled>Select Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Subcategory Name"
                        value={newSubcatName}
                        onChange={(e) => setNewSubcatName(e.target.value)}
                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border focus:ring-primary-500"
                    />
                    <input
                        type="text"
                        placeholder="Default Unit (e.g., kg)"
                        value={newSubcatUnit}
                        onChange={(e) => setNewSubcatUnit(e.target.value)}
                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border focus:ring-primary-500"
                    />
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center">
                        <Plus className="w-5 h-5 mr-1" /> Add
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-10 dark:text-gray-400">Loading categories...</div>
            ) : (
                <div className="space-y-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{cat.name}</h3>
                            </div>
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {cat.subcategories.map((sub) => (
                                    <li key={sub.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{sub.name}</p>
                                            {sub.defaultUnit && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Unit: {sub.defaultUnit}</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleDeleteSubcategory(sub.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {cat.subcategories.length === 0 && (
                                    <li className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm italic">No subcategories added.</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
