import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import SideBar from '@/app/Components/Navigations/SideBar';
import Navigations from '@/app/Components/Navigations/Navigations';
import Profile from '@/app/Components/Navigations/Profile';
import ActiveFilters from '@/app/Components/Filters/ActiveFilters';
import Suggestions from '../Components/Suggestions/Suggestions';
import Contact from '../Components/Suggestions/Contact';
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList';
import { ProjectType } from '@prisma/client';
import ThreadList from '../Components/Thread/ThreadList';

type SearchParams = { [key: string]: string | string[] | undefined };

interface FiltersProps {
  searchParams: Promise<SearchParams>;
}

export default async function FiltersPage({ searchParams }: FiltersProps) {
  const resolvedParams = await searchParams;
  const language = typeof resolvedParams.language === 'string' ? resolvedParams.language : undefined;
  const rawType = typeof resolvedParams.type === 'string' ? resolvedParams.type : undefined;
  const type = rawType as ProjectType | undefined;

  // Récupérer tous les langages utilisés avec leur nombre de projets
  const languages = await prisma.language.findMany({
    select: {
      name: true,
      _count: {
        select: {
          threads: true
        }
      }
    },
    orderBy: {
      threads: {
        _count: 'desc'
      }
    }
  });

  // Récupérer tous les types de projets utilisés avec leur nombre
  const threads = await prisma.thread.findMany({
    select: {
      types: true
    }
  });

  // Compter manuellement les occurrences de chaque type
  const typeCount = threads.reduce((acc: { [key in ProjectType]?: number }, thread) => {
    thread.types.forEach(type => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {});

  // Convertir en format attendu par le composant
  const projectTypes = Object.entries(typeCount).map(([type, count]) => ({
    type: type as ProjectType,
    _count: count
  }));

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - responsive */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - responsive */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-[72px] md:ml-[88px] lg:ml-0 h-screen overflow-hidden">
        <div className="w-full max-w-[600px] mx-auto h-full flex flex-col">
          {/* En-tête fixe */}
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border_color p-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Technologies</h1>
            </div>
          </div>

          {/* Filtres actifs */}
          {(language || type) && (
            <ActiveFilters 
              languages={languages.map(l => ({ name: l.name, count: l._count.threads }))}
              projectTypes={projectTypes}
              selectedLanguage={language}
              selectedType={type}
            />
          )}

          {/* Liste des langages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border_color scrollbar-track-transparent">
            <div className="divide-y divide-border_color">
              {languages.map((language) => (
                <Link 
                  key={language.name} 
                  href={`/filters?language=${language.name}`}
                  className="block p-4 hover:bg-secondary/5 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-text_secondary">Tendance dans les projets</p>
                      <h3 className="font-bold mt-0.5">#{language.name}</h3>
                      <p className="text-sm text-text_secondary mt-1">
                        {language._count.threads} projet{language._count.threads > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button className="p-2 hover:bg-text_highlight/10 hover:text-text_highlight rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Liste des threads filtrés */}
            {(language || type) && (
              <ThreadList language={language} type={type} />
            )}
          </div>
        </div>
      </section>

      {/* Section suggestions - responsive */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Contact />
        <ReseauxList />
      </Suggestions>
    </main>
  );
} 