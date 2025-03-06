'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectType, Media } from '@prisma/client';
import Image from 'next/image';

interface Language {
  id: number;
  name: string;
}

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Thread {
  id: number;
  title: string;
  content: string;
  github?: string;
  types: ProjectType[];
  languages: Language[];
  medias: MediaWithThumbnail[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditThreadPage({ params }: PageProps) {
  const { data: session, status } = useSession() as {
    data: Session | null,
    status: "loading" | "authenticated" | "unauthenticated"
  };
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    github: '',
    types: [] as ProjectType[],
    selectedLanguages: [] as number[]
  });
  const [medias, setMedias] = useState<MediaPreview[]>([]);
  const [existingMedias, setExistingMedias] = useState<MediaWithThumbnail[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/');
    }
  }, [status, router, session]);

  useEffect(() => {
    return () => {
      medias.forEach(media => URL.revokeObjectURL(media.preview));
    };
  }, [medias]);

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const resolvedParams = await params;
        setThreadId(resolvedParams.id);
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
      }
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    const fetchThread = async () => {
      if (!threadId) return;
      
      try {
        const response = await fetch(`/api/threads/${threadId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Thread data:', data);
          console.log('Media data:', data.medias);
          
          setFormData({
            title: data.title,
            content: data.content,
            github: data.github || '',
            types: data.types,
            selectedLanguages: data.languages.map((l: Language) => l.id)
          });
          setExistingMedias(data.medias || []);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du thread:', error);
      }
    };

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

    if (status === 'authenticated' && session?.user?.isAdmin && threadId) {
      Promise.all([fetchThread(), fetchLanguages()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    }
  }, [status, session, threadId]);

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

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(medias[index].preview);
    const newMedias = [...medias];
    newMedias.splice(index, 1);
    setMedias(newMedias);
  };

  const removeExistingMedia = async (mediaId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;
    
    try {
      const response = await fetch(`/api/medias/${mediaId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setExistingMedias(prev => prev.filter(media => media.id !== mediaId));
      } else {
        alert('Erreur lors de la suppression du média');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du média:', error);
      alert('Erreur lors de la suppression du média');
    }
  };

  const updateMediaAlt = (index: number, alt: string) => {
    const newMedias = [...medias];
    newMedias[index].alt = alt;
    setMedias(newMedias);
  };

  const updateExistingMediaAlt = async (mediaId: string, newAlt: string) => {
    try {
      const response = await fetch(`/api/medias/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alt: newAlt }),
      });
      
      if (response.ok) {
        setExistingMedias(prev => prev.map(media => 
          media.id === mediaId ? { ...media, alt: newAlt } : media
        ));
      } else {
        alert('Erreur lors de la mise à jour de la description');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la description:', error);
      alert('Erreur lors de la mise à jour de la description');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId) return;

    try {
      // Mettre à jour le thread
      const threadResponse = await fetch(`/api/threads/${threadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languageIds: formData.selectedLanguages
        }),
      });

      if (!threadResponse.ok) {
        throw new Error('Erreur lors de la mise à jour du thread');
      }

      // Uploader les nouveaux médias si nécessaire
      if (medias.length > 0) {
        for (const media of medias) {
          const formData = new FormData();
          formData.append('file', media.file);
          formData.append('threadId', threadId);
          formData.append('alt', media.alt || '');
          
          if (media.thumbnailFile) {
            formData.append('thumbnail', media.thumbnailFile);
          }
          
          const mediaResponse = await fetch('/api/medias/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!mediaResponse.ok) {
            console.error('Erreur lors de l\'upload du média');
          }
        }
      }

      alert('Thread mis à jour avec succès !');
      router.push('/admin');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thread:', error);
      alert('Une erreur est survenue lors de la mise à jour du thread.');
    }
  };

  function MediaItem({ media }: { media: MediaWithThumbnail }) {
    const mediaUrl = media.fileName.startsWith('http') 
      ? media.fileName 
      : `/uploads/${media.fileName}`;
    
    const thumbnailUrl = media.thumbnail?.fileName
      ? `/uploads/${media.thumbnail.fileName}`
      : null;

    return (
      <div className="relative w-full h-full">
        {media.type.startsWith('image/') ? (
          <div className="relative w-full h-full">
            <Image
              src={mediaUrl}
              alt={media.alt || ''}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized={media.fileName.startsWith('http')}
            />
          </div>
        ) : media.type.startsWith('video/') ? (
          <div className="relative w-full h-full">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={media.alt || ''}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
              <span className="text-white text-xs px-2 py-1 bg-black bg-opacity-50 rounded">Vidéo</span>
            </div>
          </div>
        ) : media.type.startsWith('audio/') ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-text_highlight"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 max-w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Modifier un thread</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            Retour
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700 w-full overflow-hidden">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Contenu</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 h-40 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Lien GitHub (optionnel)</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
            />
          </div>

          <div className="mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <label className="block mb-2 text-sm font-medium">Types de projet</label>
            <div className="flex flex-wrap gap-2 min-w-max">
              {Object.values(ProjectType).map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.types.includes(type)}
                    onChange={(e) => {
                      const types = e.target.checked
                        ? [...formData.types, type]
                        : formData.types.filter(t => t !== type);
                      setFormData({ ...formData, types });
                    }}
                    className="sr-only peer"
                  />
                  <span className="px-3 py-1 rounded-full text-sm border border-gray-700 peer-checked:bg-text_highlight peer-checked:border-text_highlight cursor-pointer transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <label className="block mb-2 text-sm font-medium">Langages</label>
            <div className="flex flex-wrap gap-2 min-w-max">
              {languages.map((lang) => (
                <label key={lang.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.selectedLanguages.includes(lang.id)}
                    onChange={(e) => {
                      const selectedLanguages = e.target.checked
                        ? [...formData.selectedLanguages, lang.id]
                        : formData.selectedLanguages.filter(id => id !== lang.id);
                      setFormData({ ...formData, selectedLanguages });
                    }}
                    className="sr-only peer"
                  />
                  <span className="px-3 py-1 rounded-full text-sm border border-gray-700 peer-checked:bg-text_highlight peer-checked:border-text_highlight cursor-pointer transition-colors">
                    {lang.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Médias existants */}
          {existingMedias.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Médias existants</h3>
              <div 
                className="relative w-full rounded-xl overflow-hidden"
                style={{
                  height: existingMedias.length === 1 ? '380px' : '380px',
                  display: 'grid',
                  gridTemplateColumns: 
                    existingMedias.length === 1 ? '1fr' :
                    existingMedias.length === 2 ? '1fr 1fr' :
                    existingMedias.length === 3 ? '1fr 1fr' :
                    existingMedias.length === 4 ? '1fr 1fr' : 
                    'repeat(3, 1fr)',
                  gridTemplateRows: 
                    existingMedias.length === 1 ? '1fr' :
                    existingMedias.length === 3 ? '1fr 1fr' :
                    existingMedias.length === 4 ? '1fr 1fr' : 
                    '1fr',
                  gridAutoFlow: 'dense',
                  gap: '4px',
                }}
              >
                {existingMedias.map((media, index) => {
                  // Appliquer un style spécifique pour chaque média en fonction de leur nombre et position
                  let gridColumn = '';
                  let gridRow = '';
                  
                  if (existingMedias.length === 3) {
                    // Pour 3 médias : grande image à gauche, 2 plus petites à droite
                    if (index === 0) {
                      gridColumn = '1';
                      gridRow = '1 / span 2';
                    } else {
                      gridColumn = '2';
                      gridRow = index === 1 ? '1' : '2';
                    }
                  } else if (existingMedias.length > 4) {
                    // Limiter l'affichage à 4 médias maximum
                    if (index >= 4) return null;
                  }
                  
                  // Bordures arrondies en fonction de la position dans la grille
                  let borderRadius = '';
                  if (existingMedias.length === 1) {
                    borderRadius = '12px';
                  } else if (existingMedias.length === 2) {
                    borderRadius = index === 0 ? '12px 0 0 12px' : '0 12px 12px 0';
                  } else if (existingMedias.length === 3) {
                    if (index === 0) {
                      borderRadius = '12px 0 0 12px';
                    } else if (index === 1) {
                      borderRadius = '0 12px 0 0';
                    } else {
                      borderRadius = '0 0 12px 0';
                    }
                  } else if (existingMedias.length === 4) {
                    if (index === 0) {
                      borderRadius = '12px 0 0 0';
                    } else if (index === 1) {
                      borderRadius = '0 12px 0 0';
                    } else if (index === 2) {
                      borderRadius = '0 0 0 12px';
                    } else {
                      borderRadius = '0 0 12px 0';
                    }
                  }
                  
                  return (
                    <div 
                      key={media.id} 
                      className="relative group overflow-hidden"
                      style={{
                        gridColumn,
                        gridRow,
                        borderRadius,
                      }}
                    >
                      <div className="w-full h-full bg-gray-900">
                        <MediaItem media={media} />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeExistingMedia(media.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      <input
                        type="text"
                        placeholder="Description"
                        value={media.alt || ''}
                        onChange={(e) => updateExistingMediaAlt(media.id, e.target.value)}
                        className="absolute bottom-0 left-0 right-0 px-2 py-1 text-sm bg-gray-900/80 border-t border-gray-700 focus:outline-none focus:border-text_highlight z-10"
                      />
                      
                      {/* Indicateur de nombre supplémentaire pour le 4ème média si plus de 4 */}
                      {index === 3 && existingMedias.length > 4 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                          <span className="text-white text-2xl font-bold">+{existingMedias.length - 4}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nouveaux médias */}
          {medias.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Nouveaux médias à ajouter</h3>
              <div 
                className="relative w-full rounded-xl overflow-hidden"
                style={{
                  height: medias.length === 1 ? '380px' : '380px',
                  display: 'grid',
                  gridTemplateColumns: 
                    medias.length === 1 ? '1fr' :
                    medias.length === 2 ? '1fr 1fr' :
                    medias.length === 3 ? '1fr 1fr' :
                    medias.length === 4 ? '1fr 1fr' : 
                    'repeat(3, 1fr)',
                  gridTemplateRows: 
                    medias.length === 1 ? '1fr' :
                    medias.length === 3 ? '1fr 1fr' :
                    medias.length === 4 ? '1fr 1fr' : 
                    '1fr',
                  gridAutoFlow: 'dense',
                  gap: '4px',
                }}
              >
                {medias.map((media, index) => {
                  // Appliquer un style spécifique pour chaque média en fonction de leur nombre et position
                  let gridColumn = '';
                  let gridRow = '';
                  
                  if (medias.length === 3) {
                    // Pour 3 médias : grande image à gauche, 2 plus petites à droite
                    if (index === 0) {
                      gridColumn = '1';
                      gridRow = '1 / span 2';
                    } else {
                      gridColumn = '2';
                      gridRow = index === 1 ? '1' : '2';
                    }
                  } else if (medias.length > 4) {
                    // Limiter l'affichage à 4 médias maximum
                    if (index >= 4) return null;
                  }
                  
                  // Bordures arrondies en fonction de la position dans la grille
                  let borderRadius = '';
                  if (medias.length === 1) {
                    borderRadius = '12px';
                  } else if (medias.length === 2) {
                    borderRadius = index === 0 ? '12px 0 0 12px' : '0 12px 12px 0';
                  } else if (medias.length === 3) {
                    if (index === 0) {
                      borderRadius = '12px 0 0 12px';
                    } else if (index === 1) {
                      borderRadius = '0 12px 0 0';
                    } else {
                      borderRadius = '0 0 12px 0';
                    }
                  } else if (medias.length === 4) {
                    if (index === 0) {
                      borderRadius = '12px 0 0 0';
                    } else if (index === 1) {
                      borderRadius = '0 12px 0 0';
                    } else if (index === 2) {
                      borderRadius = '0 0 0 12px';
                    } else {
                      borderRadius = '0 0 12px 0';
                    }
                  }
                  
                  return (
                    <div 
                      key={index}
                      className="relative group overflow-hidden"
                      style={{
                        gridColumn,
                        gridRow,
                        borderRadius,
                      }}
                    >
                      <div className="w-full h-full bg-gray-900">
                        {media.file.type.startsWith('image/') ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={media.preview}
                              alt={`Aperçu ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : media.file.type.startsWith('video/') ? (
                          <div className="relative w-full h-full">
                            <video
                              src={media.preview}
                              className="absolute inset-0 w-full h-full object-cover"
                              muted
                              onLoadedMetadata={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.currentTime = 1; // Pour la miniature
                              }}
                            />
                          </div>
                        ) : media.file.type.startsWith('audio/') ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                        className="absolute bottom-0 left-0 right-0 px-2 py-1 text-sm bg-gray-900/80 border-t border-gray-700 focus:outline-none focus:border-text_highlight z-10"
                      />
                      
                      {/* Indicateur de nombre supplémentaire pour le 4ème média si plus de 4 */}
                      {index === 3 && medias.length > 4 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                          <span className="text-white text-2xl font-bold">+{medias.length - 4}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload de nouveaux médias */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Ajouter des médias</label>
            <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-4 md:p-6 text-center cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleMediaUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,video/*,audio/*"
              />
              <svg className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-400">Cliquez ou glissez-déposez des fichiers ici</p>
              <p className="text-xs text-gray-500">Images, vidéos, audio</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 md:px-6 py-2 bg-text_highlight rounded-lg font-bold hover:bg-text_highlight/90 transition-colors"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 