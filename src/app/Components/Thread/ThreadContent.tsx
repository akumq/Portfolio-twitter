'use client';

import React from 'react';
import Image from 'next/image';

interface ThreadContentProps {
  content: string;
  imageUrl?: string | null;
  maxLength?: number;
}

export default function ThreadContent({ content, imageUrl, maxLength }: ThreadContentProps) {
  const truncatedContent = maxLength && content.length > maxLength 
    ? `${content.slice(0, maxLength)}...`
    : content;

  return (
    <div className="px-4 py-2">
      <p className="text-sm text-text_secondary whitespace-pre-wrap break-words">
        {truncatedContent}
      </p>
      {imageUrl && (
        <div className="mt-3 relative w-full h-64">
          <Image 
            src={imageUrl}
            alt="Aperçu du projet"
            fill
            className="rounded-lg object-cover"
          />
        </div>
      )}
    </div>
  );
} 