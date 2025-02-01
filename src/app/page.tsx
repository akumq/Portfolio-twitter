import Image from "next/image";
import { ProjectType } from '@prisma/client';

import Navigations  from "./Components/Navigations/Navigations";
import Profile from "./Components/Navigations/Profile";
import ThreadList from "./Components/Thread/ThreadList";
import ReseauxList from "./Components/Suggestions/Reseaux/ReseauxList";
import ReseauxItem from "./Components/Suggestions/Reseaux/ReseauxItem";
import LanguageList from "./Components/Suggestions/Language/LanguageList";
import Suggestions from "./Components/Suggestions/Suggestions";
import Contact from "./Components/Suggestions/Contact";
import SideBar from "./Components/Navigations/SideBar";
import ActiveFilters from "./Components/Filters/ActiveFilters";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { language, type } = await searchParams;
  const languageFilter = language as string;
  const typeFilter = type as ProjectType | undefined;

  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - responsive */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Navigations />
        <Profile />
      </SideBar>

      {/* Section principale - responsive */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-[72px] md:ml-[88px] lg:ml-0">
        <ThreadList 
          language={languageFilter} 
          type={typeFilter}
          className="w-full max-w-[600px] mx-auto"
        />
      </section>

      {/* Section suggestions - responsive */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Contact />
        <LanguageList />
        <ReseauxList>
          <ReseauxItem name="linkedin" url="#" />
          <ReseauxItem name="Github" url="#" />
        </ReseauxList>
      </Suggestions>
    </main>
  );
}
