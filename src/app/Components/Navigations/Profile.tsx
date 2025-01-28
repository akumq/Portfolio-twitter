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
      <div className="basis-2/12">
        <button 
          onClick={() => signIn('github')}
          className="flex items-center space-x-2 hover:bg-slate-600/10 rounded-full p-4"
        >
          <div className="bg-slate-600 rounded-full size-11"></div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">Se connecter</span>
            <span className="text-sm text-gray-500">avec GitHub</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="basis-2/12">
      <button 
        onClick={handleSignOut}
        className="rounded-full flex flex-row hover:bg-slate-600/10"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={`Photo de profil de ${session.user.name}`}
            width={44}
            height={44}
            className="rounded-full m-5"
          />
        ) : (
          <div className="bg-slate-600 rounded-full size-11 m-5"></div>
        )}
        <div className="flex flex-col self-center">
          <h2 className="text-xl pb-2 font-bold">{session.user?.name || 'Utilisateur'}</h2>
          <p>Développeur</p>
        </div>
      </button>
    </div>
  )
}

export default Profile