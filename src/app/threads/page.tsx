import { ProjectType } from '@prisma/client';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Image from 'next/image';

interface Language {
  id: number;
  name: string;
}

interface Media {
  id: string;
  url: string | null;
  alt: string | null;
  isMain: boolean;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  github: string | null;
  types: ProjectType[];
  languages: Language[];
  medias: Media[];
  createdAt: string | Date;
}

export const dynamic = 'force-dynamic';

async function getThreads(): Promise<Thread[]> {
  try {
    const threads = await prisma.thread.findMany({
      include: {
        languages: true,
        medias: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return threads;
  } catch (error) {
    console.error('Erreur lors de la récupération des threads:', error);
    return [];
  }
}

export default async function ThreadsPage() {
  const threads = await getThreads();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Mes Projets</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threads.map((thread) => {
            const mainMedia = thread.medias.find(m => m.isMain);
            
            return (
              <Link 
                href={`/threads/${thread.id}`} 
                key={thread.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {mainMedia && (
                  <div className="relative h-48">
                    <Image
                      src={mainMedia.url || '/placeholder.jpg'}
                      alt={mainMedia.alt || thread.title}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{thread.title}</h2>
                  
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {thread.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thread.types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 text-xs font-medium bg-blue-600 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {thread.languages.map((language) => (
                      <span
                        key={language.id}
                        className="px-2 py-1 text-xs font-medium bg-gray-700 rounded-full"
                      >
                        {language.name}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-400">
                    {new Date(thread.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 