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
  isThumbnail: boolean;
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
    if (!isModalOpen) {
      const videoState = videoStates[media.id] || { isPlaying: false, currentTime: 0 };
      return (
        <div 
          className="relative w-full h-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <VideoPlayer
            src={mediaUrl || ''}
            poster={thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover"
            title={media.alt || `Vidéo ${index + 1}`}
            currentTime={videoTimestamps[media.id] || 0}
            onTimeUpdate={(time) => onVideoTimeUpdate?.(media.id, time)}
            onMediaClick={() => onMediaClick(index)}
            isPlaying={videoState.isPlaying}
            onPlayingChange={(isPlaying) => 
              onVideoStateChange?.(media.id, { ...videoState, isPlaying })
            }
            isInModal={false}
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

    return (
      <div className="relative w-full h-full">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={media.alt || `Vidéo ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-gray-400">Miniature non disponible</span>
          </div>
        )}
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
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <span className="text-gray-400">GIF non disponible</span>
          </div>
        )}
      </div>
    );
  }

  // Pour les images statiques, utiliser Next Image
  return (
    <div className="relative w-full h-full">
      {mediaUrl ? (
        <Image 
          src={mediaUrl}
          alt={media.alt || `Image ${index + 1}`}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
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

// Fonction pour déterminer la mise en page de la grille
function getGridLayout(totalMedias: number): string {
  switch (totalMedias) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-2 gap-2';
    case 3:
      return 'grid-cols-[1.5fr_1fr] gap-1'; // Colonne principale plus large avec un petit gap
    default:
      return 'grid-cols-2 gap-2';
  }
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

  if (totalMedias === 0) return null;

  return (
    <div className="mt-4">
      <div className={`grid ${getGridLayout(totalMedias)} h-[400px] ${totalMedias === 3 ? 'rounded-lg overflow-hidden' : ''}`}>
        {totalMedias === 3 ? (
          <>
            {/* Élément principal à gauche sur toute la hauteur */}
            <div 
              className="relative cursor-pointer h-full aspect-[3/4]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMediaClick(0);
              }}
            >
              <MediaItem
                media={medias[0]}
                index={0}
                aspectRatio="aspect-[3/4]"
                isModalOpen={isModalOpen}
                onMediaClick={onMediaClick}
                videoTimestamps={videoTimestamps}
                onVideoTimeUpdate={onVideoTimeUpdate}
                videoStates={videoStates}
                onVideoStateChange={onVideoStateChange}
              />
            </div>

            {/* Colonne de droite avec deux éléments empilés */}
            <div className="grid grid-rows-2 gap-1 h-full">
              {medias.slice(1).map((media, index) => (
                <div 
                  key={media.id}
                  className="relative cursor-pointer h-full aspect-[4/3]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMediaClick(index + 1);
                  }}
                >
                  <MediaItem
                    media={media}
                    index={index + 1}
                    aspectRatio="aspect-[4/3]"
                    isModalOpen={isModalOpen}
                    onMediaClick={onMediaClick}
                    videoTimestamps={videoTimestamps}
                    onVideoTimeUpdate={onVideoTimeUpdate}
                    videoStates={videoStates}
                    onVideoStateChange={onVideoStateChange}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {imageUrl && (
              <div 
                className="relative cursor-pointer h-full aspect-video"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMediaClick(0);
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt="Image principale"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {medias.map((media, index) => {
              const isLast = index === medias.length - 1;
              const showOverlay = isLast && medias.length > 4;

              return (
                <div 
                  key={media.id}
                  className="relative cursor-pointer h-full aspect-video"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMediaClick(index);
                  }}
                >
                  <MediaItem
                    media={media}
                    index={index}
                    aspectRatio="aspect-video"
                    isModalOpen={isModalOpen}
                    onMediaClick={onMediaClick}
                    videoTimestamps={videoTimestamps}
                    onVideoTimeUpdate={onVideoTimeUpdate}
                    videoStates={videoStates}
                    onVideoStateChange={onVideoStateChange}
                  />
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">+{medias.length - 4}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
} 