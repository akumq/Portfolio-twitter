'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectType } from '@prisma/client';
import Image from 'next/image';

interface User {
  id: number;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  image?: string;
}

interface Language {
  id: number;
  name: string;
}

interface MediaPreview {
  file: File;
  preview: string;
  alt?: string;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  github?: string;
  types: ProjectType[];
  languages: Language[];
  createdAt: string;
  imageUrl?: string;
  medias?: {
    id: string;
    url: string;
    type: string;
    alt?: string;
  }[];
  author: User;
}

export default function AdminPage() {
  const { data: session, status } = useSession() as { 
    data: Session | null, 
    status: "loading" | "authenticated" | "unauthenticated" 
  };
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [medias, setMedias] = useState<MediaPreview[]>([]);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    github: '',
    types: [] as ProjectType[],
    selectedLanguages: [] as number[]
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchUsers();
    }
  }, [status, session]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des langages:', error);
      }
    };

    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchLanguages();
    }
  }, [status, session]);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch('/api/threads');
        if (response.ok) {
          const data = await response.json();
          setThreads(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des threads:', error);
      }
    };

    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchThreads();
    }
  }, [status, session]);

  useEffect(() => {
    return () => {
      medias.forEach(media => URL.revokeObjectURL(media.preview));
    };
  }, [medias]);

  const toggleAdminStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isAdmin: !currentStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la modification des droits:', error);
    }
  };

  const handleMediaUpload = async (media: MediaPreview) => {
    const formData = new FormData();
    formData.append('file', media.file);
    if (media.alt) formData.append('alt', media.alt);

    try {
      const response = await fetch('/api/medias/upload', {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Erreur détaillée:', responseData);
        throw new Error(responseData.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    }
  };

  const removeMedia = (index: number) => {
    setMedias(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateMediaAlt = (index: number, alt: string) => {
    setMedias(prev => prev.map((media, i) => 
      i === index ? { ...media, alt } : media
    ));
  };

  const handleThreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload des médias d'abord
      if (medias.length > 0) {
        const uploadPromises = medias.map(async (media) => {
          const formData = new FormData();
          formData.append('file', media.file);
          if (media.alt) formData.append('alt', media.alt);

          const response = await fetch('/api/medias/validate', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erreur lors de la validation du média ${media.file.name}`);
          }

          return response.json();
        });

        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error('Erreur lors de la validation des médias:', error);
          alert('Erreur lors de la validation des médias. Veuillez réessayer.');
          return;
        }
      }

      // Création du thread
      const threadResponse = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newThread,
          languages: newThread.selectedLanguages
        }),
      });

      if (!threadResponse.ok) {
        const errorData = await threadResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la création du thread');
      }

      await threadResponse.json();

      // Upload final des médias avec le threadId
      if (medias.length > 0) {
        // Traiter les médias un par un pour gérer correctement les vidéos et leurs miniatures
        for (const media of medias) {
          await handleMediaUpload(media);
        }
      }

      // Réinitialisation du formulaire
      setNewThread({
        title: '',
        content: '',
        github: '',
        types: [],
        selectedLanguages: []
      });
      setMedias([]);
      alert('Thread créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du thread:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du thread.');
    }
  };

  const deleteThread = async (threadId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce thread ?')) return;

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setThreads(threads.filter(thread => thread.id !== threadId));
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du thread:', error);
      alert('Une erreur est survenue lors de la suppression du thread.');
    }
  };

  const regenerateMediaUrl = async (mediaId: string, threadId: number) => {
    try {
      const response = await fetch('/api/medias/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        // Mettre à jour l'état local
        setThreads(threads.map(thread => {
          if (thread.id === threadId) {
            return {
              ...thread,
              medias: thread.medias?.map(media => 
                media.id === mediaId ? { ...media, url } : media
              )
            };
          }
          return thread;
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la régénération de l\'URL:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">Panneau d&apos;Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Statistiques</h2>
            {/* Ajouter les statistiques ici */}
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 col-span-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Créer un Thread</h2>
            <form onSubmit={handleThreadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Titre</label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Contenu</label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Lien GitHub</label>
                <input
                  type="url"
                  value={newThread.github || ''}
                  onChange={(e) => setNewThread({ ...newThread, github: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Types de Projet</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.values(ProjectType).map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={newThread.types.includes(type)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...newThread.types, type]
                            : newThread.types.filter(t => t !== type);
                          setNewThread({ ...newThread, types });
                        }}
                        className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Langages</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <label key={lang.id} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={newThread.selectedLanguages.includes(lang.id)}
                        onChange={(e) => {
                          const selectedLanguages = e.target.checked
                            ? [...newThread.selectedLanguages, lang.id]
                            : newThread.selectedLanguages.filter(id => id !== lang.id);
                          setNewThread({ ...newThread, selectedLanguages });
                        }}
                        className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">{lang.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Médias</label>
                <div className="mt-2 space-y-4">
                  <input
                    type="file"
                    accept="image/*, video/*, audio/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        const newMedias = Array.from(files).map(file => ({
                          file,
                          preview: URL.createObjectURL(file),
                          alt: ''
                        }));
                        setMedias(prev => [...prev, ...newMedias]);
                      }
                    }}
                    className="block w-full text-sm text-gray-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700
                      file:cursor-pointer"
                  />
                  
                  {medias.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {medias.map((media, index) => (
                        <div key={index} className="relative group">
                          {media.file.type.startsWith('video/') ? (
                            <video
                              src={media.preview}
                              preload="metadata"
                              muted
                              className={`w-full h-32 object-cover rounded-lg`}
                              onLoadedMetadata={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.currentTime = 1; // Capture la première frame comme miniature
                              }}
                            />
                          ) : (
                            <Image
                              src={media.preview}
                              alt={`Aperçu ${index + 1}`}
                              width={500}
                              height={300}
                              className={`w-full h-32 object-cover rounded-lg`}
                            />
                          )}
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="bg-red-600 text-white rounded-full p-1
                                opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Description du média"
                            value={media.alt || ''}
                            onChange={(e) => updateMediaAlt(index, e.target.value)}
                            className="mt-2 w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-100"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors"
              >
                Créer le Thread
              </button>
            </form>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 col-span-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Gestion des Threads</h2>
            <div className="grid grid-cols-1 gap-6">
              {threads.map((thread) => (
                <div key={thread.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-100">{thread.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/threads/${thread.id}`)}
                          className="px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-white text-sm font-medium"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteThread(thread.id)}
                          className="px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition-colors text-white text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {thread.types.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 text-xs font-medium bg-blue-600 rounded-full text-white"
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {thread.languages.map((lang) => (
                        <span
                          key={lang.id}
                          className="px-2 py-1 text-xs font-medium bg-gray-600 rounded-full text-gray-200"
                        >
                          {lang.name}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{thread.content}</p>

                    {thread.medias && thread.medias.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Images du thread :</h4>
                        <div className="space-y-4">
                          {thread.medias.map((media) => (
                            <div 
                              key={media.id} 
                              className="bg-gray-800 rounded-lg overflow-hidden"
                            >
                              <div className="relative aspect-video">
                                <Image
                                  src={media.url}
                                  alt={media.alt || thread.title}
                                  fill
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">URL de l&apos;image :</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(media.url)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    Copier
                                  </button>
                                  <button
                                    onClick={() => regenerateMediaUrl(media.id, thread.id)}
                                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                                  >
                                    Régénérer
                                  </button>
                                </div>
                                <div className="bg-gray-900 p-2 rounded text-xs text-gray-300 font-mono break-all">
                                  {media.url}
                                </div>
                                {media.alt && (
                                  <div className="text-xs text-gray-400">
                                    Description : {media.alt}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-400">
                      Créé le {new Date(thread.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Gestion des Utilisateurs</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {user.isAdmin ? '✅' : '❌'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                          className={`px-4 py-2 rounded transition-colors ${
                            user.isAdmin
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                        >
                          {user.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Configuration</h2>
            {/* Ajouter les paramètres de configuration ici */}
          </div>
        </div>
      </div>
    </div>
  );
} 