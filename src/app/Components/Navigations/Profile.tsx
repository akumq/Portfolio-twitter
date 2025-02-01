'use client'

import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Image from 'next/image'

function Profile() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      signOut()
    }
  }

  if (!session) {
    return (
      <div className="mt-auto p-4">
        <button 
          onClick={() => signIn('github')}
          className="flex items-center space-x-3 hover:bg-slate-500/10 rounded-full p-4 w-full transition-colors"
        >
          <div className="bg-slate-600 rounded-full size-10"></div>
          <div className="hidden lg:flex lg:flex-col">
            <span className="text-xl font-bold">Se connecter</span>
            <span className="text-sm text-gray-500">avec GitHub</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="mt-auto p-4">
      <button 
        onClick={handleSignOut}
        className="flex items-center space-x-3 hover:bg-slate-500/10 rounded-full p-4 w-full transition-colors"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={`Photo de profil de ${session.user.name}`}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="bg-slate-600 rounded-full size-10"></div>
        )}
        <div className="hidden lg:flex lg:flex-col text-left">
          <span className="text-xl font-bold truncate max-w-[150px]">
            {session.user?.name || 'Utilisateur'}
          </span>
          <span className="text-sm text-gray-500">Développeur</span>
        </div>
      </button>
    </div>
  )
}

export default Profile