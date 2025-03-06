'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  title: string;
  icon: string;
  description?: string;
}

export default function CategoryEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    title: '',
    icon: '',
    description: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Effacer la notification après 3 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Charger les catégories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skill-categories');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories');
      }
      const data = await response.json();
      setCategories(data);
      setError('');
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.title || !newCategory.icon) {
      setNotification({ message: 'Veuillez remplir tous les champs obligatoires', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/skill-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la catégorie');
      }

      setNotification({ message: 'Catégorie ajoutée avec succès', type: 'success' });
      setNewCategory({
        name: '',
        title: '',
        icon: '',
        description: '',
      });
      setIsAdding(false);
      fetchCategories();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    if (!editingCategory.name || !editingCategory.title || !editingCategory.icon) {
      setNotification({ message: 'Veuillez remplir tous les champs obligatoires', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/skill-categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la catégorie');
      }

      setNotification({ message: 'Catégorie mise à jour avec succès', type: 'success' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/skill-categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.skillsCount > 0) {
          setNotification({ 
            message: `Cette catégorie est utilisée par ${errorData.skillsCount} compétence(s) et ne peut pas être supprimée`,
            type: 'error'
          });
          return;
        }
        throw new Error(errorData.error || 'Erreur lors de la suppression de la catégorie');
      }

      setNotification({ message: 'Catégorie supprimée avec succès', type: 'success' });
      fetchCategories();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error' 
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Catégories de Compétences</h2>
      
      {notification && (
        <div className={`flex items-center p-4 mb-4 ${
          notification.type === 'success' 
            ? 'bg-green-900/30 text-green-200' 
            : 'bg-red-900/30 text-red-200'
        } rounded-lg`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {notification.type === 'success' 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            }
          </svg>
          <span>{notification.message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 mb-4 bg-red-900/30 text-red-200 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Liste des catégories */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-700/50">
                    {editingCategory?.id === category.id ? (
                      // Mode édition
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateCategory}
                              className="text-green-400 hover:text-green-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Mode affichage
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bouton d'ajout */}
          <div className="mt-6">
            {isAdding ? (
              <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                <h3 className="text-lg font-medium mb-4">Ajouter une catégorie</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                      placeholder="Nom de la catégorie"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-text_highlight rounded-lg text-white hover:bg-text_highlight/90 focus:outline-none"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setIsAdding(false);
                        setNewCategory({ name: '' });
                      }}
                      className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 focus:outline-none"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center px-4 py-2 bg-text_highlight rounded-lg text-white hover:bg-text_highlight/90 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une catégorie
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}