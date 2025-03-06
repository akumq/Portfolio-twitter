'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectType } from '@prisma/client';

interface ActiveFiltersProps {
  languages: Array<{ name: string; count: number }>;
  projectTypes: Array<{ type: ProjectType; _count: number }>;
  skills?: Array<{ id: number; name: string; count: number }>;
  selectedLanguage?: string;
  selectedType?: ProjectType;
  selectedSkill?: number;
}

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

export default function ActiveFilters({ selectedLanguage, selectedType, selectedSkill, skills = [] }: ActiveFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!selectedLanguage && !selectedType && !selectedSkill) return null;

  // Trouver le nom de la compétence sélectionnée
  const selectedSkillName = selectedSkill 
    ? skills.find(skill => skill.id === selectedSkill)?.name 
    : undefined;

  return (
    <div className="bg-background border-b border-border_color">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-secondary/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-bold">Filtres actifs</h2>
            <div className="flex items-center gap-1 text-sm text-text_secondary">
              {selectedLanguage && <span>#{selectedLanguage}</span>}
              {(selectedLanguage && selectedType) || (selectedLanguage && selectedSkill) ? <span>·</span> : null}
              {selectedType && <span>{PROJECT_TYPE_LABELS[selectedType]}</span>}
              {selectedType && selectedSkill && <span>·</span>}
              {selectedSkill && <span>{selectedSkillName}</span>}
            </div>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-[calc(100vh-200px)]' : 'max-h-0'}`}>
        <div className="p-4 pt-0 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-border_color scrollbar-track-transparent">
          {selectedLanguage && (
            <Link
              href={`/filters${selectedType ? `?type=${selectedType}` : ''}${selectedSkill ? `${selectedType ? '&' : '?'}skill=${selectedSkill}` : ''}`}
              className="flex items-center justify-between w-full group hover:bg-secondary/5 p-2 rounded-lg transition-colors"
            >
              <div>
                <p className="text-sm text-text_secondary">Langage</p>
                <p className="font-medium">#{selectedLanguage}</p>
              </div>
              <div className="p-2 text-text_secondary group-hover:bg-red-500/10 group-hover:text-red-500 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </Link>
          )}
          
          {selectedType && (
            <Link
              href={`/filters${selectedLanguage ? `?language=${selectedLanguage}` : ''}${selectedSkill ? `${selectedLanguage ? '&' : '?'}skill=${selectedSkill}` : ''}`}
              className="flex items-center justify-between w-full group hover:bg-secondary/5 p-2 rounded-lg transition-colors"
            >
              <div>
                <p className="text-sm text-text_secondary">Type de projet</p>
                <p className="font-medium">{PROJECT_TYPE_LABELS[selectedType]}</p>
              </div>
              <div className="p-2 text-text_secondary group-hover:bg-red-500/10 group-hover:text-red-500 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </Link>
          )}

          {selectedSkill && (
            <Link
              href={`/filters${selectedLanguage ? `?language=${selectedLanguage}` : ''}${selectedType ? `${selectedLanguage ? '&' : '?'}type=${selectedType}` : ''}`}
              className="flex items-center justify-between w-full group hover:bg-secondary/5 p-2 rounded-lg transition-colors"
            >
              <div>
                <p className="text-sm text-text_secondary">Compétence</p>
                <p className="font-medium">{selectedSkillName}</p>
              </div>
              <div className="p-2 text-text_secondary group-hover:bg-red-500/10 group-hover:text-red-500 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 