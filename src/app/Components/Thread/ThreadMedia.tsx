import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import Image from 'next/image';
import { MediaType } from '@prisma/client';
import { useMediaUrl } from '@/hooks/useMediaUrl';

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
}

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
  onMediaClick: (index: number) => Promise<void>;
  videoTimestamps?: Record<string, number>;
  onVideoTimeUpdate?: (mediaId: string, time: number) => Promise<void>;
  videoStates?: Record<string, VideoState>;
  onVideoStateChange?: (mediaId: string, state: VideoState) => Promise<void>;
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

  const renderMediaInfo = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {isVideo && (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                </svg>
                <span>Vidéo</span>
              </div>
            )}
            {isGif && (
              <div className="flex items-center gap-2">
                <span className="font-medium">GIF</span>
              </div>
            )}
            {media.alt && (
              <span className="text-sm opacity-90">{media.alt}</span>
            )}
          </div>
          <div className="text-sm font-medium">
            {index + 1}
          </div>
        </div>
      </div>
    );
  };

  if (isVideo && !isModalOpen) {
    const videoState = videoStates[media.id] || { isPlaying: false, currentTime: 0 };
    return (
      <div className="relative w-full h-full">
        <VideoPlayer
          src={mediaUrl || ''}
          poster={thumbnailUrl}
          className="absolute inset-0 w-full h-full object-cover"
          title={media.alt || `Vidéo ${index + 1}`}
          currentTime={videoTimestamps[media.id] || 0}
          onTimeUpdate={async (time: number) => onVideoTimeUpdate?.(media.id, time)}
          onMediaClick={async () => onMediaClick(index)}
          isPlaying={videoState.isPlaying}
          onPlayingChange={async (isPlaying: boolean) => 
            onVideoStateChange?.(media.id, { ...videoState, isPlaying })
          }
          isInModal={false}
        />
        <button 
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={async (e) => {
            e.stopPropagation();
            await onMediaClick(index);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
      </div>
    );
  }

  if (isVideo) {
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
        {renderMediaInfo()}
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
        {renderMediaInfo()}
      </div>
    );
  }

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
        {renderMediaInfo()}
      </div>
    );
  }

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
      {renderMediaInfo()}
    </div>
  );
}

interface VideoThumbnailProps {
  media: Media;
  index: number;
}

function VideoThumbnail({ media, index }: VideoThumbnailProps) {
  const thumbnailUrl = useMediaUrl(media.thumbnail?.fileName);

  return (
    <div className="relative w-full h-full">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={media.alt || `Vidéo ${index}`}
          fill
          className="object-cover"
          sizes="100px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <span className="text-gray-400">Miniature non disponible</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-black/50 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

interface ThreadMediaProps {
  imageUrl?: string | null;
  medias: Media[];
  onMediaClick: (index: number) => Promise<void>;
  videoTimestamps?: Record<string, number>;
  onVideoTimeUpdate?: (mediaId: string, time: number) => Promise<void>;
  videoStates?: Record<string, VideoState>;
  onVideoStateChange?: (mediaId: string, state: VideoState) => Promise<void>;
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
  const filteredMedias = medias.filter(m => !m.isThumbnail);
  const totalMedias = (imageUrl ? 1 : 0) + filteredMedias.length;

  if (totalMedias === 0) return null;

  type BorderRadius = 'rounded-xl' | 'rounded-l-xl' | 'rounded-r-xl' | 'rounded-tl-xl' | 'rounded-tr-xl' | 'rounded-bl-xl' | 'rounded-br-xl';
  
  const getBorderRadius = (index: number, total: number): BorderRadius => {
    if (total === 1) return 'rounded-xl';
    if (total === 2) return index === 0 ? 'rounded-l-xl' : 'rounded-r-xl';
    if (total === 3) {
      if (index === 0) return 'rounded-l-xl';
      if (index === 1) return 'rounded-tr-xl';
      return 'rounded-br-xl';
    }
    if (total >= 4) {
      if (index === 0) return 'rounded-tl-xl';
      if (index === 1) return 'rounded-tr-xl';
      if (index === 2) return 'rounded-bl-xl';
      return 'rounded-br-xl';
    }
    return 'rounded-xl';
  };

  const handleMediaClick = async (e: React.MouseEvent, index: number): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    await onMediaClick(index);
  };

  return (
    <div className="mt-4">
      <div 
        className={`relative w-full rounded-xl overflow-hidden`}
        style={{
          height: '380px',
          display: 'grid',
          gridTemplateColumns: 
            totalMedias === 1 ? '1fr' :
            totalMedias === 2 ? '1fr 1fr' :
            totalMedias === 3 ? '1.5fr 1fr' :
            '1fr 1fr',
          gridTemplateRows: 
            totalMedias === 1 ? '1fr' :
            totalMedias === 2 ? '1fr' :
            totalMedias === 3 ? '1fr 1fr' :
            '1fr 1fr',
          gap: '4px',
        }}
      >
        {totalMedias === 3 ? (
          <>
            {/* Premier média (grand à gauche) */}
            <div 
              key={filteredMedias[0]?.id || 'image'}
              className={`relative cursor-pointer overflow-hidden ${getBorderRadius(0, totalMedias)}`}
              style={{ gridColumn: '1', gridRow: '1 / span 2' }}
              onClick={async (e) => handleMediaClick(e, 0)}
            >
              {imageUrl ? (
                <div className="relative w-full h-full bg-gray-900">
                  <Image
                    src={imageUrl}
                    alt="Image principale"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : filteredMedias[0] && (
                <MediaItem
                  media={filteredMedias[0]}
                  index={0}
                  aspectRatio="aspect-[3/4]"
                  isModalOpen={isModalOpen}
                  onMediaClick={onMediaClick}
                  videoTimestamps={videoTimestamps}
                  onVideoTimeUpdate={onVideoTimeUpdate}
                  videoStates={videoStates}
                  onVideoStateChange={onVideoStateChange}
                />
              )}
            </div>

            {/* Deuxième et troisième médias (empilés à droite) */}
            {filteredMedias.slice(imageUrl ? 0 : 1, imageUrl ? 2 : 3).map((media, index) => {
              const actualIndex = imageUrl ? index : index + 1;
              const position = index === 0 ? 1 : 2;
              
              return (
                <div 
                  key={media.id}
                  className={`relative cursor-pointer overflow-hidden ${getBorderRadius(position, totalMedias)}`}
                  style={{ 
                    gridColumn: '2', 
                    gridRow: position === 1 ? '1' : '2'
                  }}
                  onClick={async (e) => handleMediaClick(e, actualIndex)}
                >
                  <MediaItem
                    media={media}
                    index={actualIndex}
                    aspectRatio="aspect-[4/3]"
                    isModalOpen={isModalOpen}
                    onMediaClick={onMediaClick}
                    videoTimestamps={videoTimestamps}
                    onVideoTimeUpdate={onVideoTimeUpdate}
                    videoStates={videoStates}
                    onVideoStateChange={onVideoStateChange}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* Affichage de l'image principale si elle existe */}
            {imageUrl && (
              <div 
                className={`relative cursor-pointer overflow-hidden ${getBorderRadius(0, Math.min(4, totalMedias))}`}
                style={{ 
                  gridColumn: '1',
                  gridRow: '1'
                }}
                onClick={async (e) => handleMediaClick(e, 0)}
              >
                <div className="relative w-full h-full bg-gray-900">
                  <Image
                    src={imageUrl}
                    alt="Image principale"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Affichage des médias pour 1, 2 ou 4+ */}
            {filteredMedias.slice(0, 4).map((media, index) => {
              const actualIndex = imageUrl ? index + 1 : index;
              const isLast = index === Math.min(3, filteredMedias.length - 1);
              const showOverlay = isLast && filteredMedias.length > 4;
              const remainingMedias = filteredMedias.length - 4;
              const previewMedias = filteredMedias.slice(4, Math.min(8, filteredMedias.length));
              
              const gridPosition = imageUrl ? index + 1 : index;
              const displayedTotal = Math.min(4, totalMedias);

              return (
                <div 
                  key={media.id}
                  className={`relative cursor-pointer overflow-hidden ${getBorderRadius(gridPosition, displayedTotal)}`}
                  style={{ 
                    gridColumn: index % 2 === 0 ? '1' : '2',
                    gridRow: index < 2 ? '1' : '2'
                  }}
                  onClick={async (e) => handleMediaClick(e, actualIndex)}
                >
                  <MediaItem
                    media={media}
                    index={actualIndex}
                    aspectRatio="aspect-video"
                    isModalOpen={isModalOpen}
                    onMediaClick={onMediaClick}
                    videoTimestamps={videoTimestamps}
                    onVideoTimeUpdate={onVideoTimeUpdate}
                    videoStates={videoStates}
                    onVideoStateChange={onVideoStateChange}
                  />
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
                      <div className="relative w-full h-full">
                        {(() => {
                          const remainingCount = Math.min(4, previewMedias.length);
                          return (
                            <div 
                              className="w-full h-full p-2"
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 
                                  remainingCount === 1 ? '1fr' :
                                  remainingCount === 2 ? '1fr 1fr' :
                                  remainingCount === 3 ? '1.5fr 1fr' :
                                  '1fr 1fr',
                                gridTemplateRows: 
                                  remainingCount === 1 ? '1fr' :
                                  remainingCount === 2 ? '1fr' :
                                  remainingCount === 3 ? '1fr 1fr' :
                                  '1fr 1fr',
                                gap: '2px',
                              }}
                            >
                              {remainingCount === 3 ? (
                                <>
                                  {/* Premier média restant (grand à gauche) */}
                                  <div 
                                    className="relative cursor-pointer"
                                    style={{ gridColumn: '1', gridRow: '1 / span 2' }}
                                  >
                                    {media.type === 'VIDEO' ? (
                                      <VideoThumbnail media={previewMedias[0]} index={4} />
                                    ) : (
                                      <MediaItem
                                        media={previewMedias[0]}
                                        index={4}
                                        aspectRatio="aspect-[3/4]"
                                        isModalOpen={false}
                                        onMediaClick={onMediaClick}
                                        videoTimestamps={videoTimestamps}
                                        onVideoTimeUpdate={onVideoTimeUpdate}
                                        videoStates={videoStates}
                                        onVideoStateChange={onVideoStateChange}
                                      />
                                    )}
                                  </div>

                                  {/* Deuxième et troisième médias restants (empilés à droite) */}
                                  {previewMedias.slice(1, 3).map((media, idx) => (
                                    <div 
                                      key={media.id}
                                      className="relative cursor-pointer"
                                      style={{ 
                                        gridColumn: '2',
                                        gridRow: idx === 0 ? '1' : '2'
                                      }}
                                    >
                                      {media.type === 'VIDEO' ? (
                                        <VideoThumbnail media={media} index={idx + 5} />
                                      ) : (
                                        <MediaItem
                                          media={media}
                                          index={idx + 5}
                                          aspectRatio="aspect-[4/3]"
                                          isModalOpen={false}
                                          onMediaClick={onMediaClick}
                                          videoTimestamps={videoTimestamps}
                                          onVideoTimeUpdate={onVideoTimeUpdate}
                                          videoStates={videoStates}
                                          onVideoStateChange={onVideoStateChange}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </>
                              ) : (
                                previewMedias.slice(0, 4).map((media, idx) => (
                                  <div 
                                    key={media.id}
                                    className="relative cursor-pointer"
                                    style={{ 
                                      gridColumn: remainingCount === 1 ? '1' :
                                                 remainingCount === 2 ? (idx === 0 ? '1' : '2') :
                                                 idx % 2 === 0 ? '1' : '2',
                                      gridRow: idx < 2 ? '1' : '2'
                                    }}
                                  >
                                    {media.type === 'VIDEO' ? (
                                      <VideoThumbnail media={media} index={idx + 4} />
                                    ) : (
                                      <MediaItem
                                        media={media}
                                        index={idx + 4}
                                        aspectRatio={remainingCount <= 2 ? "aspect-[4/3]" : "aspect-video"}
                                        isModalOpen={false}
                                        onMediaClick={onMediaClick}
                                        videoTimestamps={videoTimestamps}
                                        onVideoTimeUpdate={onVideoTimeUpdate}
                                        videoStates={videoStates}
                                        onVideoStateChange={onVideoStateChange}
                                      />
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          );
                        })()}
                        <div 
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                          onClick={async (e) => handleMediaClick(e, 4)}
                        >
                          <span className="text-white text-3xl font-bold">
                            +{remainingMedias}
                          </span>
                        </div>
                      </div>
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