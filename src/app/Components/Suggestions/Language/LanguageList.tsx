'use client';

import React, { useEffect, useState } from 'react';
import LanguageItem from './LanguageItem';
import Link from 'next/link';

interface LanguageStats {
  language: string;
  count: number;
  tendance: string;
}

function LanguageList() {
  const [languages, setLanguages] = useState<LanguageStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages/stats');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des langages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (loading) {
    return (
      <div className="bg-background border border-border_color rounded-xl p-4 m-4 animate-pulse">
        <div className="h-6 bg-secondary/20 rounded w-1/3 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2 mb-2">
            <div className="h-12 bg-secondary/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-background border border-border_color rounded-xl p-4 m-4">
      <h2 className="text-xl font-bold mb-4">Technologies</h2>
      <div className="space-y-2">
        {languages.map(({ language, count, tendance }) => (
          <LanguageItem
            key={language}
            tendance={tendance}
            language={language}
            nbProjet={count}
          />
        ))}
      </div>
      <Link 
        href="/filters" 
        className="block p-4 text-text_highlight hover:text-white transition-colors"
      >
        Voir toutes les technologies
      </Link>
    </div>
  );
}

export default LanguageList;