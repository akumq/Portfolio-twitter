'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Language {
  id: number;
  name: string;
  image?: string;
  usage?: number; // Nombre de projets qui utilisent ce langage
}

interface Thread {
  id: number;
  title: string;
  languages: { id: number; name: string }[];
}

export default function LanguageEditor() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [newLanguage, setNewLanguage] = useState<Partial<Language>>({
    name: '',
    image: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Effacer la notification après 3 secondes
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Charger les langages et les threads
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [languagesRes, threadsRes] = await Promise.all([
        fetch('/api/languages'),
        fetch('/api/threads')
      ]);

      if (!languagesRes.ok || !threadsRes.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const [languagesData, threadsData] = await Promise.all([
        languagesRes.json(),
        threadsRes.json()
      ]);

      // Calculer l'utilisation de chaque langage
      const languagesWithUsage = languagesData.map((language: Language) => {
        const usage = threadsData.filter((thread: Thread) => 
          thread.languages && thread.languages.some(lang => lang.id === language.id)
        ).length;
        return { ...language, usage };
      });

      setLanguages(languagesWithUsage);
      setThreads(threadsData);
      setError('');
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({ message: 'Veuillez sélectionner une image valide', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEditing && editingLanguage) {
        setEditingLanguage({ ...editingLanguage, image: base64String });
      } else {
        setNewLanguage({ ...newLanguage, image: base64String });
      }
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.name) {
      setNotification({ message: 'Le nom du langage est requis', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newLanguage.name,
          image: newLanguage.image || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du langage');
      }

      setNotification({ message: 'Langage ajouté avec succès', type: 'success' });
      setNewLanguage({
        name: '',
        image: ''
      });
      setImagePreview(null);
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

  const handleUpdateLanguage = async () => {
    if (!editingLanguage) return;
    
    if (!editingLanguage.name) {
      setNotification({ message: 'Le nom du langage est requis', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/languages/${editingLanguage.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: editingLanguage.name,
          image: editingLanguage.image
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du langage');
      }

      setNotification({ message: 'Langage mis à jour avec succès', type: 'success' });
      setEditingLanguage(null);
      setImagePreview(null);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  const handleDeleteLanguage = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce langage ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/languages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setNotification({ 
          message: errorData.error || 'Ce langage est utilisé et ne peut pas être supprimé',
          type: 'error'
        });
        return;
      }

      setNotification({ message: 'Langage supprimé avec succès', type: 'success' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  // Filtrage des langages
  const filteredLanguages = languages
    .filter(language => 
      language.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(language => {
      if (usageFilter === 'all') return true;
      if (usageFilter === 'used') return language.usage && language.usage > 0;
      if (usageFilter === 'unused') return !language.usage || language.usage === 0;
      return true;
    });

  // Récupérer les projets qui utilisent un langage
  const getLanguageProjects = (languageId: number) => {
    return threads.filter(thread => 
      thread.languages && thread.languages.some(lang => lang.id === languageId)
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Langages de Programmation</h2>
      
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
          {/* Filtres et recherche */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight text-white"
                placeholder="Rechercher un langage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setUsageFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  usageFilter === 'all'
                    ? 'bg-text_highlight text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setUsageFilter('used')}
                className={`px-3 py-1 rounded-full text-sm ${
                  usageFilter === 'used'
                    ? 'bg-text_highlight text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Utilisés
              </button>
              <button
                onClick={() => setUsageFilter('unused')}
                className={`px-3 py-1 rounded-full text-sm ${
                  usageFilter === 'unused'
                    ? 'bg-text_highlight text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Non utilisés
              </button>
            </div>
          </div>

          {/* Liste des langages */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Icône</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Utilisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Projets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredLanguages.map((language) => (
                  <tr key={language.id} className="hover:bg-gray-700/50">
                    {editingLanguage?.id === language.id ? (
                      // Mode édition
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative w-12 h-12">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, true)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                              {editingLanguage.image ? (
                                <Image
                                  src={editingLanguage.image}
                                  alt={editingLanguage.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                            value={editingLanguage.name}
                            onChange={(e) => setEditingLanguage({ ...editingLanguage, name: e.target.value })}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {language.usage || 0} projet{(language.usage || 0) > 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-h-40 overflow-y-auto">
                            {getLanguageProjects(language.id).length > 0 ? (
                              <ul className="list-disc list-inside text-sm">
                                {getLanguageProjects(language.id).map(thread => (
                                  <li key={thread.id}>{thread.title}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400 text-sm">Aucun projet associé</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateLanguage}
                              className="text-green-400 hover:text-green-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingLanguage(null)}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            {language.image ? (
                              <Image
                                src={language.image}
                                alt={language.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-500">
                                  {language.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{language.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            language.usage && language.usage > 0 
                              ? 'bg-green-900/30 text-green-200' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {language.usage || 0} projet{(language.usage || 0) > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-h-40 overflow-y-auto">
                            {getLanguageProjects(language.id).length > 0 ? (
                              <ul className="list-disc list-inside text-sm">
                                {getLanguageProjects(language.id).map(thread => (
                                  <li key={thread.id}>{thread.title}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-400 text-sm">Aucun projet associé</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingLanguage(language)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteLanguage(language.id)}
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
          {isAdding && (
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 mt-6">
              <h3 className="text-lg font-medium mb-4">Ajouter un langage</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      id="name"
                      value={newLanguage.name}
                      onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                      placeholder="Nom du langage"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleAddLanguage}
                    className="px-4 py-2 bg-text_highlight rounded-lg text-white hover:bg-text_highlight/90 focus:outline-none"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewLanguage({ name: '', image: '' });
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 focus:outline-none"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bouton d'ajout */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center px-4 py-2 bg-text_highlight rounded-lg text-white hover:bg-text_highlight/90 focus:outline-none mt-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un langage
            </button>
          )}
        </>
      )}
    </div>
  );
}