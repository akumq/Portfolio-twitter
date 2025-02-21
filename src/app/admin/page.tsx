'use client';

import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Thread, Language, ProjectType, Media } from '@prisma/client';
import Image from 'next/image';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface MediaPreview {
  file: File;
  preview: string;
  alt?: string;
  thumbnailFile?: File | null;
}

interface MediaWithThumbnail extends Media {
  thumbnail?: {
    fileName: string;
  } | null;
}

interface MediaItemProps {
  media: MediaWithThumbnail;
  aspectRatio?: string;
}

function MediaItem({ media, aspectRatio = 'aspect-video' }: MediaItemProps) {
  const mediaUrl = useMediaUrl(media.fileName);
  const thumbnailUrl = useMediaUrl(media.thumbnail?.fileName || '');
  const isVideo = media.type === 'VIDEO';
  const isGif = media.type === 'GIF';

  if (!mediaUrl) {
    return (
      <div className={`relative w-full ${aspectRatio} bg-gray-800 rounded-lg flex items-center justify-center`}>
        <span className="text-gray-400">Média non disponible</span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className={`relative w-full ${aspectRatio}`}>
        <video
          src={mediaUrl}
          poster={thumbnailUrl || undefined}
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          controls
        />
      </div>
    );
  }

  if (media.type === 'AUDIO') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <audio
          src={mediaUrl}
          controls
          className="w-4/5"
        />
      </div>
    );
  }

  // Pour les GIFs, utiliser Next Image
  if (isGif) {
    return (
      <div className={`relative w-full ${aspectRatio}`}>
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={media.alt || ''}
            fill
            className="object-cover rounded-lg"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
            <span className="text-gray-400">GIF non disponible</span>
          </div>
        )}
      </div>
    );
  }

  // Pour les images statiques
  return (
    <div className={`relative w-full ${aspectRatio}`}>
      <Image 
        src={mediaUrl}
        alt={media.alt || ''}
        fill
        className="object-cover rounded-lg"
        unoptimized
      />
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession() as { 
    data: Session | null, 
    status: "loading" | "authenticated" | "unauthenticated" 
  };
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'threads' | 'users' | 'languages' | 'comments' | 'medias'>('threads');
  const [users, setUsers] = useState<User[]>([]);
  const [threads, setThreads] = useState<(Thread & { medias: MediaWithThumbnail[] })[]>([]);
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
  const [mediaList, setMediaList] = useState<MediaWithThumbnail[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, threadsRes, languagesRes, mediasRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/threads'),
          fetch('/api/languages'),
          fetch('/api/medias')
        ]);

        if (usersRes.ok && threadsRes.ok && languagesRes.ok && mediasRes.ok) {
          const [userData, threadsData, languagesData, mediasData] = await Promise.all([
            usersRes.json(),
            threadsRes.json(),
            languagesRes.json(),
            mediasRes.json()
          ]);

          // Récupérer les médias pour chaque thread
          const threadsWithMedias = await Promise.all(threadsData.map(async (thread: Thread) => {
            const mediasRes = await fetch(`/api/medias?threadId=${thread.id}`);
            const medias = await mediasRes.json();
            return { ...thread, medias };
          }));

          setUsers(userData);
          setThreads(threadsWithMedias);
          setLanguages(languagesData);
          setMediaList(mediasData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchData();
    }
  }, [status, session]);

  useEffect(() => {
    return () => {
      medias.forEach(media => URL.revokeObjectURL(media.preview));
    };
  }, [medias]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const generateThumbnail = (file: File): Promise<File | null> => {
      return new Promise((resolve) => {
        if (!file.type.startsWith('video/')) {
          resolve(null);
          return;
        }

        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        };

        video.onloadeddata = () => {
          video.currentTime = 0;
        };

        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const thumbnailFile = new File([blob], `thumbnail-${file.name.replace(/\.[^/.]+$/, '')}.jpg`, {
                  type: 'image/jpeg'
                });
                resolve(thumbnailFile);
              } else {
                resolve(null);
              }
            }, 'image/jpeg', 0.8);
          } else {
            resolve(null);
          }
        };

        video.src = URL.createObjectURL(file);
      });
    };

    const newMedias = await Promise.all(Array.from(files).map(async file => {
      const preview = URL.createObjectURL(file);
      
      if (file.type.startsWith('video/')) {
        const thumbnailFile = await generateThumbnail(file);
        return {
          file,
          preview,
          alt: '',
          thumbnailFile
        };
      }

      return {
        file,
        preview,
        alt: ''
      };
    }));

    setMedias(prev => [...prev, ...newMedias]);
    e.target.value = '';
  };

  const handleThreadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        throw new Error('Erreur lors de la création du thread');
      }

      const threadData = await threadResponse.json();

      if (medias.length > 0) {
        for (const media of medias) {
          if (media.file.type.startsWith('video/') && media.thumbnailFile) {
            // D'abord uploader la miniature
            const thumbnailFormData = new FormData();
            thumbnailFormData.append('file', media.thumbnailFile);
            if (media.alt) thumbnailFormData.append('alt', media.alt);
            thumbnailFormData.append('threadId', threadData.id);
            thumbnailFormData.append('isThumbnail', 'true');

            const thumbnailResponse = await fetch('/api/medias/upload', {
              method: 'POST',
              body: thumbnailFormData
            });

            if (!thumbnailResponse.ok) {
              const error = await thumbnailResponse.json();
              throw new Error(error.error || 'Erreur lors de l\'upload de la miniature');
            }

            const thumbnailData = await thumbnailResponse.json();

            // Ensuite uploader la vidéo avec la référence à la miniature
            const videoFormData = new FormData();
            videoFormData.append('file', media.file);
            if (media.alt) videoFormData.append('alt', media.alt);
            videoFormData.append('threadId', threadData.id);
            videoFormData.append('thumbnailId', thumbnailData.id);

            const mediaResponse = await fetch('/api/medias/upload', {
              method: 'POST',
              body: videoFormData
            });

            if (!mediaResponse.ok) {
              const error = await mediaResponse.json();
              throw new Error(error.error || 'Erreur lors de l\'upload de la vidéo');
            }
          } else {
            // Pour les autres types de médias
            const formData = new FormData();
            formData.append('file', media.file);
            if (media.alt) formData.append('alt', media.alt);
            formData.append('threadId', threadData.id);

            const mediaResponse = await fetch('/api/medias/upload', {
              method: 'POST',
              body: formData
            });

            if (!mediaResponse.ok) {
              const error = await mediaResponse.json();
              throw new Error(error.error || 'Erreur lors de l\'upload du média');
            }
          }
        }
      }

      setNewThread({
        title: '',
        content: '',
        github: '',
        types: [],
        selectedLanguages: []
      });
      setMedias([]);
      
      const threadsRes = await fetch('/api/threads');
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

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
      console.error('Erreur:', error);
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
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la suppression du thread.');
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

  const updateMediaAltText = async (mediaId: string, newAlt: string) => {
    try {
      const response = await fetch(`/api/medias/${mediaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alt: newAlt }),
      });

      if (response.ok) {
        setMediaList(prev => prev.map(media => 
          media.id === mediaId ? { ...media, alt: newAlt } : media
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du média:', error);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
      const response = await fetch(`/api/medias/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMediaList(prev => prev.filter(media => media.id !== mediaId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du média:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-text_highlight"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <header className="py-6 border-b border-border_color mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Administration</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{session?.user?.email}</span>
              <button onClick={() => router.push('/')} className="text-text_highlight hover:underline">
                Retour au site
              </button>
            </div>
          </div>
        </header>

        {/* Navigation entre sections */}
        <nav className="mb-8">
          <div className="flex gap-4">
            {(['threads', 'users', 'languages', 'comments', 'medias'] as const).map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-lg transition-colors
                  ${activeSection === section 
                    ? 'bg-text_highlight text-white' 
                    : 'bg-secondary/10 text-gray-400 hover:bg-secondary/20'
                  }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        {/* Contenu principal */}
        <div className="space-y-8">
          {activeSection === 'threads' && (
            <div className="space-y-8">
              {/* Formulaire de création */}
              <div className="bg-secondary/5 rounded-lg border border-border_color p-6">
                <h2 className="text-lg font-bold mb-4">Nouveau Thread</h2>
                <form onSubmit={handleThreadSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Titre"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary/10 rounded-lg border border-border_color focus:outline-none focus:border-text_highlight"
                    required
                  />

                  <textarea
                    placeholder="Contenu"
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-secondary/10 rounded-lg border border-border_color focus:outline-none focus:border-text_highlight resize-none"
                    required
                  />

                  <input
                    type="url"
                    placeholder="Lien GitHub (optionnel)"
                    value={newThread.github || ''}
                    onChange={(e) => setNewThread({ ...newThread, github: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary/10 rounded-lg border border-border_color focus:outline-none focus:border-text_highlight"
                  />

                  <div>
                    <h3 className="font-medium mb-2">Types de Projet</h3>
                    <div className="flex flex-wrap gap-2">
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
                            className="sr-only peer"
                          />
                          <span className="px-3 py-1 rounded-full text-sm border border-border_color peer-checked:bg-text_highlight peer-checked:border-text_highlight cursor-pointer transition-colors">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Langages</h3>
                    <div className="flex flex-wrap gap-2">
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
                            className="sr-only peer"
                          />
                          <span className="px-3 py-1 rounded-full text-sm border border-border_color peer-checked:bg-text_highlight peer-checked:border-text_highlight cursor-pointer transition-colors">
                            {lang.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section médias */}
                  <div>
                    <h3 className="font-medium mb-2">Médias</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="w-full cursor-pointer">
                          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-border_color border-dashed rounded-lg hover:bg-secondary/5 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-gray-400">
                                <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                              </p>
                              <p className="text-xs text-gray-400">
                                Images, vidéos ou fichiers audio
                              </p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,video/*,audio/*"
                              multiple
                              onChange={handleMediaUpload}
                            />
                          </div>
                        </label>
                      </div>

                      {medias.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {medias.map((media, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video relative rounded-lg overflow-hidden bg-secondary/20">
                                {media.file.type.startsWith('video/') ? (
                                  <video
                                    src={media.preview}
                                    className="w-full h-full object-cover"
                                    onLoadedMetadata={(e) => {
                                      const video = e.target as HTMLVideoElement;
                                      video.currentTime = 1; // Pour la miniature
                                    }}
                                  />
                                ) : media.file.type.startsWith('audio/') ? (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                  </div>
                                ) : (
                                  <Image
                                    src={media.preview}
                                    alt={`Aperçu ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    width={300}
                                    height={200}
                                  />
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>

                              <input
                                type="text"
                                placeholder="Description du média"
                                value={media.alt || ''}
                                onChange={(e) => updateMediaAlt(index, e.target.value)}
                                className="mt-2 w-full px-2 py-1 text-sm bg-secondary/10 border border-border_color rounded focus:outline-none focus:border-text_highlight"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-text_highlight rounded-lg font-bold hover:bg-text_highlight/90 transition-colors"
                  >
                    Créer
                  </button>
                </form>
              </div>

              {/* Liste des threads */}
              <div className="grid gap-4 md:grid-cols-2">
                {threads.map((thread) => (
                  <div key={thread.id} className="bg-secondary/5 rounded-lg border border-border_color p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{thread.title}</h3>
                        <p className="text-sm text-gray-400">
                          Créé le {new Date(thread.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/threads/${thread.id}`)}
                          className="px-3 py-1 bg-text_highlight/20 text-text_highlight rounded hover:bg-text_highlight/30 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteThread(thread.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {thread.types.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-0.5 bg-secondary/20 rounded-full text-xs"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-300 line-clamp-2 mb-4">{thread.content}</p>

                    {thread.medias && thread.medias.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {thread.medias.map((media) => (
                          <div key={media.id} className="relative">
                            <MediaItem media={media} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="bg-secondary/5 rounded-lg border border-border_color overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border_color">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${user.isAdmin ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                          {user.isAdmin ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            user.isAdmin
                              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                              : 'bg-text_highlight/20 text-text_highlight hover:bg-text_highlight/30'
                          }`}
                        >
                          {user.isAdmin ? 'Rétrograder' : 'Promouvoir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'languages' && (
            <div className="bg-secondary/5 rounded-lg border border-border_color p-6">
              <h2 className="text-lg font-bold mb-4">Gestion des Langages</h2>
              <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible.</p>
            </div>
          )}

          {activeSection === 'comments' && (
            <div className="bg-secondary/5 rounded-lg border border-border_color p-6">
              <h2 className="text-lg font-bold mb-4">Gestion des Commentaires</h2>
              <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible.</p>
            </div>
          )}

          {activeSection === 'medias' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Gestion des Médias</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map((media) => (
                  <div key={media.id} className="bg-secondary/5 rounded-lg border border-border_color p-4">
                    <div className="mb-3">
                      <MediaItem media={media} />
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={media.alt || ''}
                        onChange={(e) => updateMediaAltText(media.id, e.target.value)}
                        placeholder="Description du média"
                        className="w-full px-2 py-1 text-sm bg-secondary/10 border border-border_color rounded focus:outline-none focus:border-text_highlight"
                      />

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">
                          {new Date(media.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="px-2 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 