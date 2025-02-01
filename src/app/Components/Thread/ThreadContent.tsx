'use client';

import React from 'react';

type ThreadContentProps = {
  content: string;
  imageUrl?: string | null;
};

export default function ThreadContent({ content, imageUrl }: ThreadContentProps) {
  return (
    <div className="px-4 py-2">
      <p className="text-sm text-text_secondary whitespace-pre-wrap break-words">
        {content}
      </p>
      {imageUrl && (
        <div className="mt-3 relative w-full h-64">
          <img 
            src={imageUrl}
            alt="Aperçu du projet"
            className="rounded-lg object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
} 