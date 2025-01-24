import Image from "next/image";

import Navigations  from "./Components/Navigations/Navigations";
import Profile from "./Components/Navigations/Profile";
import ThreadList from "./Components/Thread/ThreadList";
import ReseauxList from "./Components/Suggestions/Reseaux/ReseauxList";
import ReseauxItem from "./Components/Suggestions/Reseaux/ReseauxItem";
import LanguageList from "./Components/Suggestions/Language/LanguageList";
import Suggestions from "./Components/Suggestions/Suggestions";
import Contact from "./Components/Suggestions/Contact";
import LanguageItem from "./Components/Suggestions/Language/LanguageItem";
import SideBar from "./Components/Navigations/SideBar";
import ThreadItem from "./Components/Thread/ThreadItem";

export default function Home() {
  return (
   <div className="flex flex-row place-self-center absolute inset-1 w-8/12 h-full">
    <SideBar className="fixed">
      <div className="bg-background basis-1/12"> Logo </div>{/* Logo */}
      <Navigations/>
      <Profile />
    </SideBar>
    <ThreadList className="overflow-y-auto overflow-x-clip h-full max-h-screen w-fit no-scrollbar">
      <ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem><ThreadItem></ThreadItem>
      <ThreadItem></ThreadItem>
    </ThreadList>
    <Suggestions className="fixed">
      <Contact />
      <ReseauxList>
        <ReseauxItem name="linkedin" url="#" />
        <ReseauxItem name="Github" url="#" />
      </ReseauxList>
      <LanguageList >
        <LanguageItem tendance="Tendance en dev Web" language="NextJs" nbProjet={1}/>
        <LanguageItem tendance="Tendance en dev Web" language="NextJs" nbProjet={1}/>
      </LanguageList>
    </Suggestions>
   </div>
  );
}
