'use client';

import React, { useState, useEffect } from 'react';
import MediaModal from './MediaModal';
import { useRouter } from 'next/navigation';
import { MediaType } from '@prisma/client';

interface ThreadContentProps {
  content: string;
  maxLength?: number;
  threadId: number;
  imageUrl?: string | null;
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
}

interface ThreadTextProps {
  content: string;
  maxLength?: number;
  onExpand: () => void;
  isExpanded: boolean;
  threadId: number;
}

function ThreadText({ 
  content = '', 
  maxLength, 
  onExpand, 
  isExpanded, 
  threadId 
}: ThreadTextProps) {
  const router = useRouter();
  const displayedContent = maxLength && !isExpanded 
    ? content.slice(0, maxLength) + (content.length > maxLength ? '...' : '')
    : content;

  return (
    <div className="px-4 py-2">
      <p className="text-[15px] leading-5 text-gray-200 font-regular whitespace-pre-wrap break-words">
        <span 
          className="hover:text-gray-300 cursor-pointer"
          onClick={() => router.push(`/thread/${threadId}`)}
        >
          {displayedContent}
        </span>
        {maxLength && content.length > maxLength && !isExpanded && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onExpand();
            }}
            className="text-blue-500 hover:text-blue-400 ml-1 transition-colors"
          >
            Voir plus
          </button>
        )}
      </p>
    </div>
  );
}

export default function ThreadContent({ content, maxLength, threadId, imageUrl }: ThreadContentProps) {
  const [medias, setMedias] = useState<Media[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const loadMedias = async () => {
      if (!threadId) return;
      try {
        const response = await fetch(`/api/medias?threadId=${threadId}`);
        if (!response.ok) throw new Error('Erreur lors du chargement des médias');
        const data = await response.json();
        setMedias(data);
      } catch (error) {
        console.error('Erreur lors du chargement des médias:', error);
      }
    };
    loadMedias();
  }, [threadId]);

  const handleNext = () => {
    setCurrentMediaIndex((prev) => 
      prev < medias.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => 
      prev > 0 ? prev - 1 : prev
    );
  };

  // Combiner l'image principale avec les autres médias pour le modal
  const allMedias = imageUrl 
    ? [{ id: 'main', fileName: imageUrl, type: 'IMAGE' as const }, ...medias]
    : medias;

  return (
    <>
      <ThreadText 
        content={content}
        maxLength={maxLength}
        onExpand={() => setIsExpanded(true)}
        isExpanded={isExpanded}
        threadId={threadId}
      />

      <MediaModal
        medias={allMedias}
        currentIndex={currentMediaIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
} 