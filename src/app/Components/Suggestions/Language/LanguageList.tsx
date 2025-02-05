import React from 'react'
import prisma from '@/lib/prisma';
import LanguageItem from './LanguageItem';
import Link from 'next/link';

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

async function LanguageList() {
  // Récupérer tous les threads avec leurs langages et types
  const threads = await prisma.thread.findMany({
    include: {
      languages: true
    },
    where: {
      github: {
        not: null
      }
    }
  });

  // Calculer les statistiques des langages avec les types de projets
  const languageStats = threads.reduce((acc: { 
    [key: string]: { 
      count: number, 
      types: { [key: string]: number }
    } 
  }, thread) => {
    thread.languages.forEach(lang => {
      if (!acc[lang.name]) {
        acc[lang.name] = { count: 0, types: {} };
      }
      acc[lang.name].count++;
      
      // Vérifier si le thread a au moins un type
      if (thread.types.length > 0) {
        const mainType = thread.types[0];
        acc[lang.name].types[mainType] = (acc[lang.name].types[mainType] || 0) + 1;
      }
    });
    return acc;
  }, {});

  // Convertir en tableau et trier par nombre de projets
  const sortedLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([language, stats]) => {
      // Trouver le type de projet le plus courant pour ce langage
      const typeEntries = Object.entries(stats.types);
      const mostCommonType = typeEntries.length > 0 
        ? typeEntries.sort(([, a], [, b]) => b - a)[0][0] 
        : 'OTHER'; // Valeur par défaut si aucun type

      return {
        language,
        count: stats.count,
        tendance: PROJECT_TYPE_LABELS[mostCommonType as keyof typeof PROJECT_TYPE_LABELS]
      };
    })
    .slice(0, 5); // Limiter à 5 langages

  return (
    <div className="bg-background border border-border_color rounded-xl p-4 m-4">
      <h2 className="text-xl font-bold mb-4">Technologies</h2>
      <div className="space-y-2">
        {sortedLanguages.map(({ language, count, tendance }) => (
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
  )
}

export default LanguageList