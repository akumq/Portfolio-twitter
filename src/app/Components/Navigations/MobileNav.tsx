'use client'

import React, { useState } from 'react'
import { SessionProvider, useSession, signIn } from 'next-auth/react'
import Image from 'next/image'
import Navigations from './Navigations'
import Profile from './Profile'

function MobileNavContent() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <>
      {/* En-tête mobile fixe */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-sm border-b border-border_color z-30 flex items-center px-4 sm:hidden">
        {session ? (
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3"
          >
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={`Photo de profil de ${session.user.name}`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="bg-slate-600 rounded-full w-8 h-8" />
            )}
            <span className="font-bold">
              {session.user?.name || 'Utilisateur'}
            </span>
          </button>
        ) : (
          <button 
            onClick={() => signIn('github')}
            className="flex items-center gap-3"
          >
            <div className="bg-slate-600 rounded-full w-8 h-8" />
            <span className="font-bold">Se connecter</span>
          </button>
        )}
      </div>

      {/* Bouton menu burger pour mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-text_highlight rounded-full shadow-lg sm:hidden"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Overlay sombre quand le menu est ouvert */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu latéral mobile */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-background border-r border-border_color transform transition-transform duration-300 ease-in-out z-50 sm:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* En-tête du menu */}
          
          <div className="flex-1 overflow-y-auto">
            <Navigations />
          </div>
          <Profile />
        </div>
      </div>
    </>
  )
}

export default function MobileNav() {
  return (
    <SessionProvider>
      <MobileNavContent />
    </SessionProvider>
  )
} 