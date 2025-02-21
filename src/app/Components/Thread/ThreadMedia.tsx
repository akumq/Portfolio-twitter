import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import Image from 'next/image';
import { MediaType } from '@prisma/client';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface Media {
  id: string;
  fileName: string;
  type: MediaType;
  alt?: string;
  thumbnail?: {
    id: string;
    fileName: string;
  };
}

interface MediaItemProps {
  media: Media;
  index: number;
  aspectRatio: string;
  isModalOpen: boolean;
  onMediaClick: (index: number) => void;
  videoTimestamps?: Record<string, number>;
  onVideoTimeUpdate?: (mediaId: string, time: number) => void;
  videoStates?: Record<string, { isPlaying: boolean; currentTime: number }>;
  onVideoStateChange?: (mediaId: string, state: { isPlaying: boolean; currentTime: number }) => void;
}

function MediaItem({
  media,
  index,
  aspectRatio,
  isModalOpen,
  onMediaClick,
  videoTimestamps = {},
  onVideoTimeUpdate,
  videoStates = {},
  onVideoStateChange
}: MediaItemProps) {
  const mediaUrl = useMediaUrl(media.fileName);
  const thumbnailUrl = useMediaUrl(media.thumbnail?.fileName);
  const isVideo = media.type === 'VIDEO';
  const isGif = media.type === 'GIF';

  if (isVideo) {
    if (isModalOpen && thumbnailUrl) {
      return (
        <div className="relative aspect-video">
          <Image
            src={thumbnailUrl}
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
          src={mediaUrl || ''}
          poster={thumbnailUrl}
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          title={media.alt || `Vidéo ${index + 1}`}
          currentTime={videoTimestamps[media.id] || 0}
          onTimeUpdate={(time) => onVideoTimeUpdate?.(media.id, time)}
          onMediaClick={() => onMediaClick(index)}
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
          src={mediaUrl || ''}
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
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={media.alt || `GIF ${index + 1}`}
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

  // Pour les images statiques, utiliser Next Image
  return (
    <div className={`relative w-full ${aspectRatio}`}>
      {mediaUrl ? (
        <Image 
          src={mediaUrl}
          alt={media.alt || `Image ${index + 1}`}
          fill
          className="object-cover rounded-lg"
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <span className="text-gray-400">Image non disponible</span>
        </div>
      )}
    </div>
  );
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
  const totalMedias = (imageUrl ? 1 : 0) + medias.length;

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
        {medias.map((media, index) => {
          const isLast = index === medias.length - 1;
          const showOverlay = isLast && medias.length > 4;
          const aspectRatio = totalMedias === 1 ? 'aspect-video' : 'aspect-square';

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
              <MediaItem
                media={media}
                index={index}
                aspectRatio={aspectRatio}
                isModalOpen={isModalOpen}
                onMediaClick={onMediaClick}
                videoTimestamps={videoTimestamps}
                onVideoTimeUpdate={onVideoTimeUpdate}
                videoStates={videoStates}
                onVideoStateChange={onVideoStateChange}
              />
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