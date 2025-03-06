'use client';

import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Thread, Language, ProjectType, Media } from '@prisma/client';
import Image from 'next/image';
import { useMediaUrl } from '@/hooks/useMediaUrl';
import CategoryEditor from '@/app/Components/Admin/CategoryEditor';
import SkillEditor from '@/app/Components/Admin/SkillEditor';
import LanguageEditor from '@/app/Components/Admin/LanguageEditor';
import { Octokit } from '@octokit/rest';

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
  const [activeSection, setActiveSection] = useState<'threads' | 'users' | 'languages' | 'comments' | 'medias' | 'skills' | 'categories' | 'projectTypes'>('threads');
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
  const [isDetectingLanguages, setIsDetectingLanguages] = useState(false);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [newProjectType, setNewProjectType] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/');
    }
  }, [status, router, session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, threadsRes, languagesRes, mediasRes, projectTypesRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/threads'),
          fetch('/api/languages'),
          fetch('/api/medias'),
          fetch('/api/project-types')
        ]);

        if (usersRes.ok && threadsRes.ok && languagesRes.ok && mediasRes.ok && projectTypesRes.ok) {
          const [userData, threadsData, languagesData, mediasData, projectTypesData] = await Promise.all([
            usersRes.json(),
            threadsRes.json(),
            languagesRes.json(),
            mediasRes.json(),
            projectTypesRes.json()
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
          setProjectTypes(projectTypesData);
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
          title: newThread.title,
          content: newThread.content,
          github: newThread.github,
          types: newThread.types,
          languageIds: newThread.selectedLanguages
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

  const detectLanguages = async () => {
    if (!newThread.github) {
      alert('Veuillez d\'abord entrer une URL GitHub');
      return;
    }

    setIsDetectingLanguages(true);
    try {
      const octokit = new Octokit({
        auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
      });

      // Extraire owner/repo de l'URL GitHub
      const githubUrl = newThread.github.trim();
      const urlMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      
      if (!urlMatch) {
        throw new Error('URL GitHub invalide. Format attendu: https://github.com/owner/repo');
      }

      const [, owner, repo] = urlMatch;

      // Récupérer les langages du dépôt
      const { data: repoLanguages } = await octokit.repos.listLanguages({ owner, repo });
      const languageNames = Object.keys(repoLanguages);

      if (languageNames.length === 0) {
        throw new Error('Aucun langage détecté dans ce dépôt.');
      }

      // Récupérer tous les langages existants
      const response = await fetch('/api/languages');
      const existingLanguages = await response.json();
      const existingLanguageNames = existingLanguages.map((lang: Language) => lang.name);

      // Identifier les nouveaux langages
      const newLanguageNames = languageNames.filter(name => !existingLanguageNames.includes(name));

      // Créer les nouveaux langages
      await Promise.all(
        newLanguageNames.map(async (name) => {
          try {
            const response = await fetch('/api/languages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name })
            });
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error(`Erreur lors de la création du langage ${name}:`, error);
            return null;
          }
        })
      );

      // Mettre à jour la liste des langages
      const updatedLanguagesResponse = await fetch('/api/languages');
      const updatedLanguages = await updatedLanguagesResponse.json();
      setLanguages(updatedLanguages);

      // Sélectionner les langages détectés
      const detectedLanguageIds = updatedLanguages
        .filter((lang: Language) => languageNames.includes(lang.name))
        .map((lang: Language) => lang.id);

      setNewThread(prev => ({
        ...prev,
        selectedLanguages: detectedLanguageIds
      }));

      const message = newLanguageNames.length > 0 
        ? `${detectedLanguageIds.length} langage(s) détecté(s) dont ${newLanguageNames.length} nouveau(x) !`
        : `${detectedLanguageIds.length} langage(s) détecté(s) !`;
      
      alert(message);

    } catch (error) {
      console.error('Erreur lors de la détection des langages:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la détection des langages');
    } finally {
      setIsDetectingLanguages(false);
    }
  };

  const handleAddProjectType = async () => {
    if (!newProjectType.trim()) {
      alert('Veuillez entrer un nom pour le type de projet');
      return;
    }

    if (!Object.values(ProjectType).includes(newProjectType as ProjectType)) {
      alert('Type de projet non valide. Les types disponibles sont: ' + Object.values(ProjectType).join(', '));
      return;
    }

    try {
      const response = await fetch('/api/project-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newProjectType }),
      });

      if (response.ok) {
        const projectTypesRes = await fetch('/api/project-types');
        if (projectTypesRes.ok) {
          const projectTypesData = await projectTypesRes.json();
          setProjectTypes(projectTypesData);
        }
        setNewProjectType('');
        alert('Type de projet ajouté avec succès !');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'ajout du type de projet');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du type de projet:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteProjectType = async (type: ProjectType) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le type de projet "${type}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/project-types/${encodeURIComponent(type)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjectTypes(projectTypes.filter(t => t !== type));
        alert('Type de projet supprimé avec succès !');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression du type de projet');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du type de projet:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
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
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <header className="py-6 border-b border-gray-800 mb-8">
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
        <nav className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveSection('threads')}
            className={`px-4 py-2 font-medium ${activeSection === 'threads' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Threads
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`px-4 py-2 font-medium ${activeSection === 'users' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveSection('languages')}
            className={`px-4 py-2 font-medium ${activeSection === 'languages' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Langages
          </button>
          <button
            onClick={() => setActiveSection('skills')}
            className={`px-4 py-2 font-medium ${activeSection === 'skills' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Compétences
          </button>
          <button
            onClick={() => setActiveSection('categories')}
            className={`px-4 py-2 font-medium ${activeSection === 'categories' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Catégories
          </button>
          <button
            onClick={() => setActiveSection('medias')}
            className={`px-4 py-2 font-medium ${activeSection === 'medias' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Médias
          </button>
          <button
            onClick={() => setActiveSection('projectTypes')}
            className={`px-4 py-2 font-medium ${activeSection === 'projectTypes' ? 'text-text_highlight border-b-2 border-text_highlight' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Types de projet
          </button>
        </nav>

        {/* Contenu principal */}
        <div className="space-y-8">
          {activeSection === 'threads' && (
            <div className="space-y-8">
              {/* Formulaire de création */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-bold mb-4">Nouveau Thread</h2>
                <form onSubmit={handleThreadSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Titre"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                    required
                  />

                  <textarea
                    placeholder="Contenu"
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight resize-none"
                    required
                  />

                  {/* Sélection des langages */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Langages</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-700 rounded-lg">
                      {languages.map((language) => (
                        <div key={language.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`language-${language.id}`}
                            checked={newThread.selectedLanguages.includes(language.id)}
                            onChange={() => {
                              const isSelected = newThread.selectedLanguages.includes(language.id);
                              setNewThread({
                                ...newThread,
                                selectedLanguages: isSelected
                                  ? newThread.selectedLanguages.filter(id => id !== language.id)
                                  : [...newThread.selectedLanguages, language.id]
                              });
                            }}
                            className="mr-2 h-4 w-4 rounded bg-gray-900 border-gray-700 text-text_highlight focus:ring-text_highlight"
                          />
                          <label htmlFor={`language-${language.id}`} className="text-sm cursor-pointer">
                            {language.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sélection des types de projet */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Types de projet</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-700 rounded-lg">
                      {projectTypes.map((type) => (
                        <div key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`type-${type}`}
                            checked={newThread.types.includes(type)}
                            onChange={() => {
                              const isSelected = newThread.types.includes(type);
                              setNewThread({
                                ...newThread,
                                types: isSelected
                                  ? newThread.types.filter(t => t !== type)
                                  : [...newThread.types, type]
                              });
                            }}
                            className="mr-2 h-4 w-4 rounded bg-gray-900 border-gray-700 text-text_highlight focus:ring-text_highlight"
                          />
                          <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section médias */}
                  <div>
                    <h3 className="font-medium mb-2">Médias</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="w-full cursor-pointer">
                          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg hover:bg-gray-700/20 transition-colors">
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
                              <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-700">
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
                                className="mt-2 w-full px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-text_highlight"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="url"
                      placeholder="Lien GitHub (optionnel)"
                      value={newThread.github || ''}
                      onChange={(e) => setNewThread({ ...newThread, github: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                    />
                    {newThread.github && (
                      <button
                        type="button"
                        onClick={detectLanguages}
                        disabled={isDetectingLanguages}
                        className="mt-2 w-full px-4 py-2 bg-text_highlight/20 text-text_highlight rounded-lg font-medium hover:bg-text_highlight/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDetectingLanguages ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Détection en cours...
                          </span>
                        ) : (
                          'Détecter les langages'
                        )}
                      </button>
                    )}
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
                  <div key={thread.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
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
                          className="px-2 py-0.5 bg-gray-700 rounded-full text-xs"
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
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
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
            <div className="space-y-6">
              <LanguageEditor />
            </div>
          )}

          {activeSection === 'comments' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-lg font-bold mb-4">Gestion des Commentaires</h2>
              <p className="text-gray-400">Cette fonctionnalité sera bientôt disponible.</p>
            </div>
          )}

          {activeSection === 'medias' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Gestion des Médias</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map((media) => (
                  <div key={media.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="mb-3">
                      <MediaItem media={media} />
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={media.alt || ''}
                        onChange={(e) => updateMediaAltText(media.id, e.target.value)}
                        placeholder="Description du média"
                        className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-text_highlight"
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

          {activeSection === 'skills' && (
            <div className="space-y-6">
              <SkillEditor />
            </div>
          )}

          {activeSection === 'categories' && (
            <div className="space-y-6">
              <CategoryEditor />
            </div>
          )}

          {activeSection === 'projectTypes' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-2xl font-bold mb-6">Gestion des types de projet</h2>
                
                {/* Formulaire d'ajout de type de projet */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau type de projet</h3>
                  <div className="flex gap-2">
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-900 rounded-lg border border-gray-700 focus:outline-none focus:border-text_highlight"
                    >
                      <option value="">Sélectionnez un type...</option>
                      {Object.values(ProjectType)
                        .filter(type => !projectTypes.includes(type))
                        .map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))
                      }
                    </select>
                    <button
                      onClick={handleAddProjectType}
                      className="px-4 py-2 bg-text_highlight rounded-lg font-bold hover:bg-text_highlight/90 transition-colors disabled:opacity-50"
                      disabled={!newProjectType}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                
                {/* Liste des types de projet */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Types de projet existants</h3>
                  {projectTypes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {projectTypes.map((type) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                          <span>{type}</span>
                          <button
                            onClick={() => handleDeleteProjectType(type)}
                            className="p-1 text-red-500 hover:text-red-400"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Aucun type de projet disponible.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}