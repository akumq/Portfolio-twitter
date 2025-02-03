'use client'

import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Image from 'next/image'

function Profile() {
  const { data: session, status } = useSession()

  const handleSignOut = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      signOut()
    }
  }

  if (status === 'loading') {
    return (
      <div className="p-4 border-t border-border_color">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-border_color rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-border_color rounded w-24" />
            <div className="h-3 bg-border_color rounded w-16 mt-2" />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
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