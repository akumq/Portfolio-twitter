'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
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

interface MediaRendererProps {
  media: Media;
  videoState?: { isPlaying: boolean; currentTime: number };
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  isInModal?: boolean;
}

function MediaRenderer({ 
  media, 
  videoState = { isPlaying: false, currentTime: 0 },
  currentTime = 0,
  onTimeUpdate,
  onPlayingChange,
  isInModal = false
}: MediaRendererProps) {
  const mediaUrl = useMediaUrl(media.fileName);
  const thumbnailUrl = useMediaUrl(media.thumbnail?.fileName);

  switch (media.type) {
    case 'VIDEO':
      return (
        <VideoPlayer
          src={mediaUrl || ''}
          poster={thumbnailUrl}
          className="max-h-[90vh] w-auto mx-auto"
          title={media.alt || `Vidéo ${media.id}`}
          currentTime={currentTime}
          onTimeUpdate={onTimeUpdate}
          isPlaying={videoState.isPlaying}
          onPlayingChange={onPlayingChange}
          isInModal={isInModal}
        />
      );
    case 'AUDIO':
      return (
        <audio
          src={mediaUrl || ''}
          controls
          className="w-full max-w-xl mx-auto"
          title={media.alt || `Audio ${media.id}`}
        />
      );
    default: // IMAGE ou GIF
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {mediaUrl ? (
            media.type === 'GIF' ? (
              <Image
                src={mediaUrl}
                alt={media.alt || `GIF ${media.id}`}
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto object-contain"
                unoptimized
              />
            ) : (
              <Image 
                src={mediaUrl}
                alt={media.alt || `Image ${media.id}`}
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto object-contain"
                unoptimized
              />
            )
          ) : (
            <div className="flex items-center justify-center bg-gray-800 rounded-lg p-8">
              <span className="text-gray-400">Image non disponible</span>
            </div>
          )}
        </div>
      );
  }
}

function ThumbnailRenderer({ media }: { media: Media }) {
  const mediaUrl = useMediaUrl(media.fileName);
  const thumbnailUrl = useMediaUrl(media.thumbnail?.fileName);
  const displayUrl = media.type === 'VIDEO' ? thumbnailUrl : mediaUrl;

  return displayUrl ? (
    <Image
      src={displayUrl}
      alt={media.alt || `Miniature`}
      fill
      className="object-cover rounded"
      unoptimized
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded">
      <span className="text-gray-400 text-xs">Non disponible</span>
    </div>
  );
}

interface MediaModalProps {
  medias: Media[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  videoTimestamps?: Record<string, number>;
  onVideoTimeUpdate?: (mediaId: string, time: number) => void;
  videoStates?: Record<string, { isPlaying: boolean; currentTime: number }>;
  onVideoStateChange?: (mediaId: string, state: { isPlaying: boolean; currentTime: number }) => void;
}

export default function MediaModal({
  medias,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  videoTimestamps = {},
  onVideoTimeUpdate,
  videoStates = {},
  onVideoStateChange
}: MediaModalProps) {
  if (!isOpen) return null;

  const currentMedia = medias[currentIndex];
  const videoState = videoStates[currentMedia.id];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
        onClick={onClose}
      >
        {/* Navigation */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 space-y-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            disabled={currentIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 space-y-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            disabled={currentIndex === medias.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main content */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <MediaRenderer
            media={currentMedia}
            videoState={videoState}
            currentTime={videoTimestamps[currentMedia.id] || 0}
            onTimeUpdate={(time) => onVideoTimeUpdate?.(currentMedia.id, time)}
            onPlayingChange={(isPlaying) => 
              onVideoStateChange?.(currentMedia.id, { 
                ...(videoState || { isPlaying: false, currentTime: 0 }), 
                isPlaying 
              })
            }
            isInModal={true}
          />
        </div>

        {/* Thumbnails */}
        <div className="overflow-x-auto p-2 flex gap-2 bg-black/50 md:hidden">
          {medias.map((media, index) => (
            <button
              key={media.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (index !== currentIndex) {
                  if (index > currentIndex) onNext();
                  else onPrevious();
                }
              }}
              className={`flex-shrink-0 w-16 h-16 relative ${
                index === currentIndex ? 'ring-2 ring-white' : ''
              }`}
            >
              <ThumbnailRenderer media={media} />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 