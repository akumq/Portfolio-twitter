'use client';

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation';

function LanguageItem({tendance, language, nbProjet} : {tendance: string, language: string, nbProjet: number}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentLanguage = params.get('language');
    
    if (currentLanguage === language) {
      // Si le langage est déjà sélectionné, on le désélectionne
      params.delete('language');
    } else {
      // Sinon, on l'ajoute comme filtre
      params.set('language', language);
    }
    
    router.push(`/?${params.toString()}`);
  };

  const isSelected = searchParams.get('language') === language;

  return (
    <button 
      onClick={handleClick}
      className={`flex flex-row p-2 w-full hover:bg-secondary/50 transition-colors rounded-xl ${
        isSelected ? 'bg-secondary' : ''
      }`}
    >
      <div className="flex flex-col flex-1">
        <h3 className="text-sm opacity-70">{tendance}</h3>
        <h3 className="text-xl">#{language}</h3>
        <p className="text-sm opacity-70">{nbProjet} projets</p>
      </div>
      <div className=" bg-none rounded-full m-4 p-2 flex-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </button>
  )
}

export default LanguageItem