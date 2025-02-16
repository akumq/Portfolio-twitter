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
}

export default function ThreadMedia({ 
  imageUrl, 
  medias, 
  onMediaClick,
  videoTimestamps = {},
  onVideoTimeUpdate,
  videoStates = {},
  onVideoStateChange
}: ThreadMediaProps) {
  const totalMedias = (imageUrl ? 1 : 0) + medias.filter(m => !m.isMain).length;

  const renderMedia = (media: Media, index: number) => {
    const isVideo = media.type === 'VIDEO';
    const isGif = media.type === 'GIF';
    const aspectRatio = totalMedias === 1 ? 'aspect-video' : 'aspect-square';

    if (isVideo) {
      const videoState = videoStates[media.id] || { isPlaying: false, currentTime: 0 };
      return (
        <div className={`relative w-full ${aspectRatio}`}>
          <VideoPlayer
            src={media.url}
            poster={media.thumbnail?.url}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            title={media.alt || `Vidéo ${index + 1}`}
            currentTime={videoTimestamps[media.id] || 0}
            onTimeUpdate={(time) => onVideoTimeUpdate?.(media.id, time)}
            onMediaClick={() => onMediaClick(imageUrl ? index + 1 : index)}
            isPlaying={videoState.isPlaying}
            onPlayingChange={(isPlaying) => 
              onVideoStateChange?.(media.id, { ...videoState, isPlaying })
            }
          />
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
                onMediaClick(imageUrl ? index + 1 : index);
              }}
            >
              {renderMedia(media, imageUrl ? index + 1 : index)}
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