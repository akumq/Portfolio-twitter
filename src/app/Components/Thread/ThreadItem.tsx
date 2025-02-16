'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MediaType } from '@prisma/client';

const ThreadHeader = dynamic(() => import('./ThreadHeader'), {
  loading: () => <div className="animate-pulse bg-secondary h-24 rounded-lg" />
});

const ThreadContent = dynamic(() => import('./ThreadContent'), {
  loading: () => <div className="animate-pulse bg-secondary h-32 rounded-lg" />
});

const ThreadMedia = dynamic(() => import('./ThreadMedia'), {
  loading: () => <div className="animate-pulse bg-secondary h-32 rounded-lg" />
});

const MediaModal = dynamic(() => import('./MediaModal'), {
  loading: () => null
});

const ThreadStats = dynamic(() => import('./ThreadStats'), {
  loading: () => <div className="animate-pulse bg-secondary h-8 rounded-lg" />
});

interface Media {
  id: string;
  url: string | null;
  type: MediaType;
  alt?: string | null;
  isMain: boolean;
  thumbnail?: {
    id: string;
    url: string | null;
  } | null;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  github: string | null;
  types: string[];
  languages: {
    id: number;
    name: string;
  }[];
  medias?: Media[];
}

interface ThreadItemProps {
  id: number;
  initialData?: Thread;
}

export default function ThreadItem({ id, initialData }: ThreadItemProps) {
  const [thread, setThread] = useState<Thread | null>(initialData || null);
  const [githubStats, setGithubStats] = useState({
    commits: 0,
    watchers: 0,
    stars: 0,
    ownerAvatar: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [videoTimestamps, setVideoTimestamps] = useState<Record<string, number>>({});
  const [videoStates, setVideoStates] = useState<Record<string, { isPlaying: boolean; currentTime: number }>>({});

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const response = await fetch(`/api/threads/${id}`);
        const data = await response.json();
        setThread(data);
      } catch (error) {
        console.error('Erreur lors de la récupération du thread:', error);
      }
    };

    if (!initialData) {
      fetchThread();
    }
  }, [id, initialData]);

  useEffect(() => {
    const fetchGithubStats = async (githubUrl: string) => {
      try {
        const response = await fetch(`/api/github/stats?url=${encodeURIComponent(githubUrl)}`);
        const data = await response.json();
        setGithubStats(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des stats GitHub:', error);
      }
    };

    if (thread?.github) {
      fetchGithubStats(thread.github);
    }
  }, [thread?.github]);

  if (!thread) return null;

  const processedMedias = thread.medias?.filter((media: Media) => media.url !== null).map((media: Media) => ({
    ...media,
    url: media.url!,
    alt: media.alt || undefined,
    thumbnail: media.thumbnail ? {
      ...media.thumbnail,
      url: media.thumbnail.url || ''
    } : undefined
  })) || [];

  const handleMediaClick = (index: number) => {
    setCurrentMediaIndex(index);
    setModalOpen(true);
    
    // Si c'est une vidéo, on la démarre automatiquement
    const media = allMedias[index];
    if (media.type === 'VIDEO') {
      handleVideoStateChange(media.id, {
        isPlaying: true,
        currentTime: videoTimestamps[media.id] || 0
      });
    }
  };

  const handleNext = () => {
    // Arrêter la vidéo actuelle si c'est une vidéo
    const currentMedia = allMedias[currentMediaIndex];
    if (currentMedia.type === 'VIDEO') {
      handleVideoStateChange(currentMedia.id, {
        isPlaying: false,
        currentTime: videoTimestamps[currentMedia.id] || 0
      });
    }

    // Passer à la suivante
    const nextIndex = currentMediaIndex < processedMedias.length - 1 ? currentMediaIndex + 1 : currentMediaIndex;
    setCurrentMediaIndex(nextIndex);

    // Démarrer la nouvelle vidéo si c'en est une
    const nextMedia = allMedias[nextIndex];
    if (nextMedia.type === 'VIDEO') {
      handleVideoStateChange(nextMedia.id, {
        isPlaying: true,
        currentTime: videoTimestamps[nextMedia.id] || 0
      });
    }
  };

  const handlePrevious = () => {
    // Arrêter la vidéo actuelle si c'est une vidéo
    const currentMedia = allMedias[currentMediaIndex];
    if (currentMedia.type === 'VIDEO') {
      handleVideoStateChange(currentMedia.id, {
        isPlaying: false,
        currentTime: videoTimestamps[currentMedia.id] || 0
      });
    }

    // Passer à la précédente
    const prevIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : currentMediaIndex;
    setCurrentMediaIndex(prevIndex);

    // Démarrer la nouvelle vidéo si c'en est une
    const prevMedia = allMedias[prevIndex];
    if (prevMedia.type === 'VIDEO') {
      handleVideoStateChange(prevMedia.id, {
        isPlaying: true,
        currentTime: videoTimestamps[prevMedia.id] || 0
      });
    }
  };

  // Combiner l'image principale avec les autres médias pour le modal
  const allMedias = thread.imageUrl 
    ? [{ id: 'main', url: thread.imageUrl, type: 'IMAGE' as const, isMain: true }, ...processedMedias]
    : processedMedias;

  const handleVideoStateChange = (mediaId: string, state: { isPlaying: boolean; currentTime: number }) => {
    setVideoStates(prev => ({
      ...prev,
      [mediaId]: state
    }));
  };

  const handleVideoTimeUpdate = (mediaId: string, time: number) => {
    setVideoTimestamps(prev => ({
      ...prev,
      [mediaId]: time
    }));
  };

  return (
    <article className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
      <div className="flex gap-3 px-4 py-3">
        <div className="flex-grow min-w-0">
          <div className="mb-2">
            <ThreadHeader 
              title={thread.title}
              ownerAvatar={githubStats.ownerAvatar}
              types={thread.types}
              languages={thread.languages}
              githubUrl={thread.github}
            />
          </div>

          <Link href={`/thread/${thread.id}`}>
            <ThreadContent
              content={thread.content}
              maxLength={280}
              threadId={thread.id}
              imageUrl={thread.imageUrl}
            />
          </Link>

          <div onClick={(e) => e.stopPropagation()}>
            <ThreadMedia
              imageUrl={thread.imageUrl}
              medias={processedMedias}
              onMediaClick={handleMediaClick}
              videoTimestamps={videoTimestamps}
              onVideoTimeUpdate={handleVideoTimeUpdate}
              videoStates={videoStates}
              onVideoStateChange={handleVideoStateChange}
            />
          </div>
          
          <div className="mt-3">
            <ThreadStats
              commits={githubStats.commits}
              watchers={githubStats.watchers}
              stars={githubStats.stars}
            />
          </div>
        </div>
      </div>

      <MediaModal
        medias={allMedias}
        currentIndex={currentMediaIndex}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          // Arrêter la vidéo actuelle si c'en est une
          const currentMedia = allMedias[currentMediaIndex];
          if (currentMedia.type === 'VIDEO') {
            handleVideoStateChange(currentMedia.id, {
              isPlaying: false,
              currentTime: videoTimestamps[currentMedia.id] || 0
            });
          }
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
        videoTimestamps={videoTimestamps}
        onVideoTimeUpdate={handleVideoTimeUpdate}
        videoStates={videoStates}
        onVideoStateChange={handleVideoStateChange}
      />
    </article>
  );
}