'use client';

import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProjectType } from '@prisma/client';

interface Language {
  id: number;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Thread {
  id: number;
  title: string;
  content: string;
  github?: string;
  types: ProjectType[];
  languages: Language[];
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

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
      router.push('/');
    }
  }, [status, router, session]);

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
          setFormData({
            title: data.title,
            content: data.content,
            github: data.github || '',
            types: data.types,
            selectedLanguages: data.languages.map((l: Language) => l.id)
          });
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
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.isAdmin && threadId) {
      fetchThread();
      fetchLanguages();
    }
  }, [status, session, threadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadId) return;

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languages: formData.selectedLanguages
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      alert('Thread mis à jour avec succès !');
      router.push('/admin');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thread:', error);
      alert('Une erreur est survenue lors de la mise à jour du thread.');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Modifier le Thread</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contenu</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-48"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GitHub</label>
            <input
              type="text"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Types</label>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(ProjectType).map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.types.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...formData.types, type]
                        : formData.types.filter(t => t !== type);
                      setFormData({ ...formData, types: newTypes });
                    }}
                    className="form-checkbox text-blue-600 bg-gray-800 border-gray-700"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Langages</label>
            <div className="grid grid-cols-3 gap-4">
              {languages.map((language) => (
                <label key={language.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.selectedLanguages.includes(language.id)}
                    onChange={(e) => {
                      const newLanguages = e.target.checked
                        ? [...formData.selectedLanguages, language.id]
                        : formData.selectedLanguages.filter(id => id !== language.id);
                      setFormData({ ...formData, selectedLanguages: newLanguages });
                    }}
                    className="form-checkbox text-blue-600 bg-gray-800 border-gray-700"
                  />
                  <span>{language.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 