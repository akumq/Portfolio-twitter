'use client';

import React from 'react';
import Image from 'next/image';

type ThreadHeaderProps = {
  title: string;
  ownerAvatar: string;
  types: string[];
  languages: { name: string }[];
  githubUrl?: string | null;
};

const PROJECT_TYPE_LABELS = {
  WEB_APP: 'Application Web',
  MOBILE_APP: 'Application Mobile',
  DESKTOP_APP: 'Application Bureau',
  DATA_SCIENCE: 'Science des Données',
  MACHINE_LEARNING: 'Intelligence Artificielle',
  DIGITAL_IMAGING: 'Imagerie Numérique',
  GAME: 'Jeu Vidéo',
  API: 'API',
  LIBRARY: 'Bibliothèque',
  CLI: 'Application Console',
  OTHER: 'Autre'
} as const;

export default function ThreadHeader({ title, ownerAvatar, types = [], languages = [], githubUrl }: ThreadHeaderProps) {
  const displayTitle = githubUrl ? githubUrl.split('/').pop() : title;

  return (
    <div className="flex items-start gap-3">
      {ownerAvatar && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={ownerAvatar}
            alt="Avatar"
            width={40}
            height={40}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            unoptimized
          />
        </div>
      )}
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="font-bold text-gray-200 truncate group-hover:underline">
            {displayTitle}
          </h2>
          {githubUrl && (
            <a 
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-500 hover:text-gray-400">
                <path
                  fill="currentColor"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </a>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-1">
          {types.map((type) => (
            <span
              key={type}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400"
            >
              {PROJECT_TYPE_LABELS[type as keyof typeof PROJECT_TYPE_LABELS]}
            </span>
          ))}
          {languages.map((lang) => (
            <span
              key={lang.name}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-400"
            >
              {lang.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 