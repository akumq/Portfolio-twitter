'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ThreadContentProps {
  content: string;
  maxLength?: number;
  threadId: number;
  imageUrl?: string | null;
}

export default function ThreadContent({ content, maxLength, threadId, imageUrl }: ThreadContentProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedContent = maxLength && !isExpanded 
    ? content.slice(0, maxLength) + (content.length > maxLength ? '...' : '')
    : content;

  useEffect(() => {
    const loadImages = async () => {
      const response = await fetch(`/api/images?threadId=${threadId}`);
      const data = await response.json();
      setImages(data.images.map((img: { id: string }) => `/api/images/${img.id}`));
    };
    loadImages();
  }, [threadId]);

  return (
    <div className="px-4 py-2">
      <p className="text-sm text-text_secondary whitespace-pre-wrap break-words">
        {displayedContent}
        {maxLength && content.length > maxLength && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-text_highlight ml-2 hover:underline"
          >
            Lire plus
          </button>
        )}
      </p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {imageUrl && (
          <Image 
            src={imageUrl}
            alt="Image principale"
            width={600}
            height={400}
            className="rounded-lg object-cover h-48 w-full col-span-2"
            loader={({ src }) => src}
          />
        )}
        {images.map((url, index) => (
          <Image 
            key={index}
            src={url}
            alt={`Image ${index + 1}`}
            width={600}
            height={400}
            className="rounded-lg object-cover h-48 w-full"
            loader={({ src }) => src}
          />
        ))}
      </div>
    </div>
  );
} 