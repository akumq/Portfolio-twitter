import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import Image from 'next/image';
import { MediaType } from '@prisma/client';

interface Media {
  id: string;
  url: string;
  type: MediaType;
  alt?: string;
  isMain: boolean;
  thumbnail?: {
    id: string;
    url: string;
  };
}

interface ThreadMediaProps {
  imageUrl?: string | null;
  medias: Media[];
  onMediaClick: (index: number) => void;
  videoTimestamps?: Record<string, number>;
  onVideoTimeUpdate?: (mediaId: string, time: number) => void;
  videoStates?: Record<string, { isPlaying: boolean; currentTime: number }>;
  onVideoStateChange?: (mediaId: string, state: { isPlaying: boolean; currentTime: number }) => void;
  isModalOpen?: boolean;
}

export default function ThreadMedia({ 
  imageUrl, 
  medias, 
  onMediaClick,
  videoTimestamps = {},
  onVideoTimeUpdate,
  videoStates = {},
  onVideoStateChange,
  isModalOpen = false
}: ThreadMediaProps) {
  const totalMedias = (imageUrl ? 1 : 0) + medias.filter(m => !m.isMain).length;

  const renderMedia = (media: Media, index: number) => {
    const isVideo = media.type === 'VIDEO';
    const isGif = media.type === 'GIF';
    const aspectRatio = totalMedias === 1 ? 'aspect-video' : 'aspect-square';

    if (isVideo) {
      if (isModalOpen && media.thumbnail) {
        return (
          <div className="relative aspect-video">
            <Image
              src={media.thumbnail.url}
              alt={media.alt || ''}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        );
      }

      const videoState = videoStates[media.id] || { isPlaying: false, currentTime: 0 };
      return (
        <div 
          className={`relative w-full ${aspectRatio}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Ne pas ouvrir le modal lors du clic sur la vidéo
          }}
        >
          <VideoPlayer
            src={media.url}
            poster={media.thumbnail?.url}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            title={media.alt || `Vidéo ${index + 1}`}
            currentTime={videoTimestamps[media.id] || 0}
            onTimeUpdate={(time) => onVideoTimeUpdate?.(media.id, time)}
            onMediaClick={() => onMediaClick(index)} // Ouvre le modal seulement lors du clic sur le bouton plein écran
            isPlaying={videoState.isPlaying}
            onPlayingChange={(isPlaying) => 
              onVideoStateChange?.(media.id, { ...videoState, isPlaying })
            }
          />
          <button 
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMediaClick(index);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>
      );
    }

    if (media.type === 'AUDIO') {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-lg" onClick={(e) => e.stopPropagation()}>
          <audio
            src={media.url}
            controls
            className="w-4/5"
            title={media.alt || `Audio ${index + 1}`}
          />
        </div>
      );
    }

    // Pour les GIFs, utiliser Next Image
    if (isGif) {
      return (
        <div className={`relative w-full ${aspectRatio}`}>
          <Image
            src={media.url}
            alt={media.alt || `GIF ${index + 1}`}
            fill
            className="object-cover rounded-lg"
            unoptimized
          />
        </div>
      );
    }

    // Pour les images statiques, utiliser Next Image
    return (
      <div className={`relative w-full ${aspectRatio}`}>
        <Image 
          src={media.url}
          alt={media.alt || `Image ${index + 1}`}
          fill
          className="object-cover rounded-lg"
          unoptimized
        />
      </div>
    );
  };

  if (!imageUrl && medias.length === 0) return null;

  return (
    <div className="mt-2 px-4" onClick={(e) => e.stopPropagation()}>
      <div className={`grid ${
        totalMedias === 1 ? 'grid-cols-1' :
        totalMedias === 2 ? 'grid-cols-2' :
        totalMedias === 3 ? 'grid-cols-2' :
        totalMedias >= 4 ? 'grid-cols-2' : ''
      } gap-0.5 overflow-hidden rounded-2xl`}>
        {imageUrl && (
          <div 
            className={`relative cursor-pointer ${
              totalMedias === 1 ? 'aspect-video' :
              totalMedias === 2 ? 'aspect-square' :
              totalMedias === 3 ? 'row-span-2' : 'aspect-square'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMediaClick(0);
            }}
          >
            <Image 
              src={imageUrl}
              alt="Image principale"
              fill
              className="object-cover hover:opacity-90 transition-opacity rounded-lg"
              unoptimized
            />
          </div>
        )}
        {medias.filter(m => !m.isMain).map((media, index) => {
          const isLast = index === medias.length - 1;
          const showOverlay = isLast && medias.length > 4;

          return (
            <div 
              key={media.id}
              className={`relative cursor-pointer ${
                totalMedias === 3 && !imageUrl && index === 0 ? 'row-span-2' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMediaClick(index);
              }}
            >
              {renderMedia(media, index)}
              {showOverlay && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white text-xl font-bold">+{medias.length - 4}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 