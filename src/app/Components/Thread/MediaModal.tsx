'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
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

  const renderMedia = (media: Media) => {
    switch (media.type) {
      case 'VIDEO':
        const videoState = videoStates[media.id] || { isPlaying: false, currentTime: 0 };
        return (
          <VideoPlayer
            src={media.url}
            poster={media.thumbnail?.url}
            className="max-h-[90vh] w-auto mx-auto"
            title={media.alt || `Vidéo ${media.id}`}
            currentTime={videoTimestamps[media.id] || 0}
            onTimeUpdate={(time) => onVideoTimeUpdate?.(media.id, time)}
            isPlaying={videoState.isPlaying}
            onPlayingChange={(isPlaying) => 
              onVideoStateChange?.(media.id, { ...videoState, isPlaying })
            }
          />
        );
      case 'AUDIO':
        return (
          <audio
            src={media.url}
            controls
            className="w-full max-w-xl mx-auto"
            title={media.alt || `Audio ${media.id}`}
          />
        );
      default: // IMAGE ou GIF
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {media.type === 'GIF' ? (
              <Image
                src={media.url}
                alt={media.alt || `GIF ${media.id}`}
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto object-contain"
                unoptimized
              />
            ) : (
              <Image 
                src={media.url}
                alt={media.alt || `Image ${media.id}`}
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto object-contain"
                unoptimized
              />
            )}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex flex-col"
        onClick={onClose}
      >
        {/* Barre de navigation supérieure */}
        <div className="flex justify-between items-center p-4 text-white">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm">
            {currentIndex + 1} / {medias.length}
          </span>
          <div className="w-10" /> {/* Espaceur pour centrer le compteur */}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 relative flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          {/* Bouton précédent */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Média actuel */}
          <motion.div
            key={currentMedia.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full flex items-center justify-center"
          >
            {renderMedia(currentMedia)}
          </motion.div>

          {/* Bouton suivant */}
          {currentIndex < medias.length - 1 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Miniatures en bas sur mobile */}
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
              {media.type === 'VIDEO' ? (
                <Image
                  src={media.thumbnail?.url || ''}
                  alt={media.alt || `Miniature ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded"
                  unoptimized
                />
              ) : (
                <Image
                  src={media.url}
                  alt={media.alt || `Miniature ${index + 1}`}
                  fill
                  className="object-cover rounded"
                  unoptimized
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 