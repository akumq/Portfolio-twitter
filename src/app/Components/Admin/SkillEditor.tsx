'use client';

import { useState, useEffect, useCallback } from 'react';

interface Skill {
  id: number;
  name: string;
  description?: string;
  formation?: string;
  level?: number;
  categoryId: number;
  category?: Category;
  threads?: Thread[];
  image?: string | null;
}

interface Category {
  id: number;
  name: string;
  title: string;
}

interface Thread {
  id: number;
  title: string;
  programmingLanguages?: string[];
}

export default function SkillEditor() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 1, image: null, categoryId: 0 });
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedThreads, setSelectedThreads] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Effacer la notification après 3 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [skillsRes, categoriesRes, threadsRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/categories'),
        fetch('/api/threads')
      ]);

      if (skillsRes.ok && categoriesRes.ok && threadsRes.ok) {
        const [skillsData, categoriesData, threadsData] = await Promise.all([
          skillsRes.json(),
          categoriesRes.json(),
          threadsRes.json()
        ]);

        setSkills(skillsData);
        setCategories(categoriesData);
        setThreads(threadsData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddSkill = async () => {
    if (!newSkill.name || !newSkill.categoryId) {
      setNotification({ message: 'Veuillez remplir tous les champs obligatoires', type: 'error' });
      return;
    }

    try {
      const skillData = {
        ...newSkill,
        threadIds: selectedThreads
      };

      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la compétence');
      }

      setNotification({ message: 'Compétence ajoutée avec succès', type: 'success' });
      setNewSkill({
        name: '',
        level: 1,
        image: null,
        categoryId: categories.length > 0 ? categories[0].id : 0,
      });
      setSelectedThreads([]);
      setIsAdding(false);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;
    
    if (!editingSkill.name || !editingSkill.categoryId) {
      setNotification({ message: 'Veuillez remplir tous les champs obligatoires', type: 'error' });
      return;
    }

    try {
      const skillData = {
        ...editingSkill,
        description: editingSkill.description || '',
        formation: editingSkill.formation || '',
        threadIds: selectedThreads
      };

      const response = await fetch(`/api/skills/${editingSkill.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la compétence');
      }

      setNotification({ message: 'Compétence mise à jour avec succès', type: 'success' });
      setEditingSkill(null);
      setSelectedThreads([]);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la compétence');
      }

      setNotification({ message: 'Compétence supprimée avec succès', type: 'success' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  // Préparer l'édition d'une compétence
  const startEditing = (skill: Skill) => {
    setEditingSkill(skill);
    setSelectedThreads(skill.threads?.map(t => t.id) || []);
  };

  // Gérer la sélection des projets
  const toggleThreadSelection = (id: number) => {
    if (selectedThreads.includes(id)) {
      setSelectedThreads(selectedThreads.filter(threadId => threadId !== id));
    } else {
      setSelectedThreads([...selectedThreads, id]);
    }
  };

  const getCategoryTitle = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.title || 'Inconnue';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Compétences</h2>
      
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
          {/* Liste des compétences */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Projets associés</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-700/50">
                    {editingSkill?.id === skill.id ? (
                      // Mode édition
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                            value={editingSkill.name}
                            onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                            value={editingSkill.level || 1}
                            onChange={(e) => setEditingSkill({ ...editingSkill, level: parseInt(e.target.value) })}
                          >
                            <option value={1}>Débutant</option>
                            <option value={2}>Intermédiaire</option>
                            <option value={3}>Avancé</option>
                            <option value={4}>Expert</option>
                            <option value={5}>Maître</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                            value={editingSkill.categoryId}
                            onChange={(e) => setEditingSkill({ ...editingSkill, categoryId: parseInt(e.target.value) })}
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-h-40 overflow-y-auto">
                            {threads.map(thread => (
                              <div key={thread.id} className="flex items-center mb-2">
                                <input
                                  type="checkbox"
                                  id={`edit-thread-${thread.id}`}
                                  checked={selectedThreads.includes(thread.id)}
                                  onChange={() => toggleThreadSelection(thread.id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`edit-thread-${thread.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                  {thread.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateSkill}
                              className="text-green-400 hover:text-green-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setEditingSkill(null);
                                setSelectedThreads([]);
                              }}
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
                        <td className="px-6 py-4 whitespace-nowrap">{skill.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {skill.level === 1 && 'Débutant'}
                          {skill.level === 2 && 'Intermédiaire'}
                          {skill.level === 3 && 'Avancé'}
                          {skill.level === 4 && 'Expert'}
                          {skill.level === 5 && 'Maître'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getCategoryTitle(skill.categoryId)}</td>
                        <td className="px-6 py-4">
                          <div className="max-h-40 overflow-y-auto">
                            {skill.threads && skill.threads.length > 0 ? (
                              <ul className="list-disc list-inside text-sm">
                                {skill.threads.map(thread => (
                                  <li key={thread.id}>{thread.title}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">Aucun projet associé</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(skill)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
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

          {/* Formulaire d'ajout */}
          {isAdding ? (
            <div className="mt-6 bg-gray-900 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-medium mb-4">Ajouter une nouvelle compétence</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Nom*
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                    placeholder="Nom de la compétence"
                  />
                </div>
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-1">
                    Niveau*
                  </label>
                  <select
                    id="level"
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                  >
                    <option value={1}>Débutant</option>
                    <option value={2}>Intermédiaire</option>
                    <option value={3}>Avancé</option>
                    <option value={4}>Expert</option>
                    <option value={5}>Maître</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                    Catégorie*
                  </label>
                  <select
                    id="category"
                    value={newSkill.categoryId}
                    onChange={(e) => setNewSkill({ ...newSkill, categoryId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Projets associés
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-700 rounded-md">
                  {threads.map(thread => (
                    <div key={thread.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`new-thread-${thread.id}`}
                        checked={selectedThreads.includes(thread.id)}
                        onChange={() => toggleThreadSelection(thread.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`new-thread-${thread.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        {thread.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewSkill({
                      name: '',
                      level: 1,
                      image: null,
                      categoryId: categories[0]?.id || 0,
                    });
                    setSelectedThreads([]);
                  }}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 focus:outline-none"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-text_highlight rounded-lg text-white hover:bg-text_highlight/90 focus:outline-none"
                >
                  Ajouter
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center px-4 py-2 bg-text_highlight rounded-lg text-white hover:bg-text_highlight/90 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une compétence
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}