'use client';

import React, { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import DesktopNav from '../Components/Navigations/DesktopNav'
import Suggestions from '../Components/Suggestions/Suggestions'
import Contact from '../Components/Suggestions/Contact'
import LanguageList from '../Components/Suggestions/Language/LanguageList'
import ReseauxList from '../Components/Suggestions/Reseaux/ReseauxList'
import ContactModal from '../Components/Contact/ContactModal'
import MessageHistory from '../Components/Contact/MessageHistory'

// Composant conteneur pour le contenu principal
const MainContent = () => {
  const { status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isAuthenticated = status === 'authenticated';

  const refreshMessages = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Rafraîchir l'historique des messages après avoir fermé la modal
    refreshMessages();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Me contacter</h1>
      

      
      <div className="p-6 rounded-xl shadow-sm mb-8 text-center border border-border_color">
        <h2 className="text-xl font-semibold mb-3">Vous avez une question ?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          N&apos;hésitez pas à me contacter pour discuter de vos projets ou pour toute autre question.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-text_highlight text-white px-6 py-3 rounded-full font-bold hover:bg-text_highlight/90 transition-colors text-lg shadow-md"
        >
          Me contacter
        </button>
      </div>

      <ContactModal isOpen={isModalOpen} onClose={handleCloseModal} />

            {/* Historique des messages pour les utilisateurs connectés */}
            {isAuthenticated && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Mes messages précédents</h2>
            <button 
              onClick={refreshMessages}
              className="text-text_highlight hover:underline"
            >
              Rafraîchir
            </button>
          </div>
          <MessageHistory key={refreshKey} />
        </div>
      )}
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