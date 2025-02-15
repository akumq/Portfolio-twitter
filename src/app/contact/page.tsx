import React, { Suspense } from 'react';
import DesktopNav from '../Components/Navigations/DesktopNav'
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
      {/* Barre latérale - masquée sur mobile */}
      <DesktopNav />

      {/* Section principale - adaptée pour mobile */}
      <section className="flex-1 min-w-0 border-x border-border_color ml-0 sm:ml-[72px] md:ml-[88px] lg:ml-0 mt-14 sm:mt-0">
        <div className="w-full pb-20 sm:pb-0">
          <MessageHistory />
          <MainContent />
        </div>
      </section>

      {/* Section suggestions - masquée sur mobile */}
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