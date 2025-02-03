import React, { Suspense } from 'react';
import Navigations from '../Components/Navigations/Navigations'
import Profile from '../Components/Navigations/Profile'
import SideBar from '../Components/Navigations/SideBar'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'
import MessageHistory from '../Components/Contact/MessageHistory'
import ContactForm from '@/app/Components/Contact/ContactForm'

// Composant conteneur pour le contenu principal
const MainContent = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Me contacter</h1>
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <ContactForm />
      </Suspense>
    </div>
  );
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-row max-w-7xl mx-auto">
      {/* Barre latérale - responsive */}
      <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
        <Suspense fallback={<div>Chargement de la navigation...</div>}>
          <Navigations />
        </Suspense>
        <Suspense fallback={<div>Chargement du profil...</div>}>
          <Profile />
        </Suspense>
      </SideBar>

      {/* Section principale - responsive */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-[72px] md:ml-[88px] lg:ml-0">
        <Suspense fallback={<div>Chargement de l&apos;historique...</div>}>
          <MessageHistory />
        </Suspense>
        <Suspense fallback={<div>Chargement du formulaire...</div>}>
          <MainContent />
        </Suspense>
      </section>

      {/* Section suggestions - responsive */}
      <Suggestions className="fixed right-0 lg:right-auto lg:relative hidden lg:flex lg:w-[350px] xl:w-[400px] h-screen">
        <Suspense fallback={<div>Chargement des contacts...</div>}>
          <Contact />
        </Suspense>
        <Suspense fallback={<div>Chargement des réseaux...</div>}>
          <ReseauxList />
        </Suspense>
        <Suspense fallback={<div>Chargement des langages...</div>}>
          <LanguageList />
        </Suspense>
      </Suggestions>
    </main>
  );
}