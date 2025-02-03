import { ProjectType } from '@prisma/client';

import Navigations  from "./Components/Navigations/Navigations";
import Profile from "./Components/Navigations/Profile";
import ThreadList from "./Components/Thread/ThreadList";
import ReseauxList from "./Components/Suggestions/Reseaux/ReseauxList";
import LanguageList from "./Components/Suggestions/Language/LanguageList";
import Suggestions from "./Components/Suggestions/Suggestions";
import Contact from "./Components/Suggestions/Contact";
import SideBar from "./Components/Navigations/SideBar";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { language, type } = await searchParams;
  const languageFilter = language as string;
  const typeFilter = type as ProjectType | undefined;

  return (
    <main className="flex min-h-screen bg-background flex-row max-w-7xl mx-auto">
      {/* Barre latérale - responsive */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - responsive */}
      <section className="flex-1 border-x border-border_color p-0 m-0 min-w-0 ml-[72px] md:ml-[88px] lg:ml-0">
        <ThreadList 
          language={languageFilter} 
          type={typeFilter}
          className="mw-0 w-full max-w-[600px] "
        />
      </section>

      {/* Section suggestions - responsive */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Contact />
        <ReseauxList />
        <LanguageList />
      </Suggestions>
    </main>
  );
}
