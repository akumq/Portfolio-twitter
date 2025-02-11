import { ProjectType } from '@prisma/client';
import { Suspense } from 'react';
import ThreadList from "./Components/Thread/ThreadList";
import ReseauxList from "./Components/Suggestions/Reseaux/ReseauxList";
import LanguageList from "./Components/Suggestions/Language/LanguageList";
import Suggestions from "./Components/Suggestions/Suggestions";
import Contact from "./Components/Suggestions/Contact";
import DesktopNav from "./Components/Navigations/DesktopNav";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const languageFilter = params.language as string;
  const typeFilter = params.type as ProjectType | undefined;

  return (
    <main className="flex min-h-screen bg-background flex-row max-w-7xl mx-auto">
      {/* Barre latérale - masquée sur mobile */}
      <Suspense fallback={<div className="hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen bg-background animate-pulse" />}>
        <DesktopNav />
      </Suspense>

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 border-x border-border_color p-0 m-0 min-w-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 pb-20 sm:pb-0 mt-14 sm:mt-0">
        <Suspense fallback={
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-secondary rounded-lg mb-2" />
                <div className="h-24 bg-secondary rounded-lg" />
              </div>
            ))}
          </div>
        }>
          <ThreadList 
            language={languageFilter} 
            type={typeFilter}
            className="mw-0 w-full max-w-[600px]"
          />
        </Suspense>
      </section>

      {/* Section suggestions - masquée sur mobile */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Suspense fallback={<div className="h-32 bg-background animate-pulse rounded-xl m-4" />}>
          <Contact />
        </Suspense>
        <Suspense fallback={<div className="h-32 bg-background animate-pulse rounded-xl m-4" />}>
          <ReseauxList />
        </Suspense>
        <Suspense fallback={<div className="h-48 bg-background animate-pulse rounded-xl m-4" />}>
          <LanguageList />
        </Suspense>
      </Suggestions>
    </main>
  );
}
