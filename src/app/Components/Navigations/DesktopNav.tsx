'use client'

import React from 'react'
import { useSession, signIn } from 'next-auth/react'
import Navigations from './Navigations'
import Profile from './Profile'
import SideBar from './SideBar'

export default function DesktopNav() {
  const { data: session } = useSession()

  return (
    <SideBar className="fixed left-0 lg:left-auto lg:relative hidden sm:flex sm:w-[72px] md:w-[88px] lg:w-[275px] h-screen">
      <Navigations />
      {session ? (
        <Profile />
      ) : (
        <div className="mt-auto p-4">
          <button 
            onClick={() => signIn('github')}
            className="flex items-center space-x-3 hover:bg-slate-500/10 rounded-full p-4 w-full transition-colors"
            aria-label="Se connecter avec GitHub"
          >
            <div className="bg-slate-600 rounded-full size-10"></div>
            <span className="hidden lg:inline text-base font-bold">
              Connexion
            </span>
          </button>
        </div>
      )}
    </SideBar>
  )
} 