import React from 'react'

function LanguageItem({tendance, language, nbProjet} : {tendance: string, language: string, nbProjet: number}) {
  return (
    <div className="flex flex-row p-2 w-full"> {/* Suggestion items */}
        <div className="flex flex-col flex-1">
            <h3 className="text-sm opacity-70">{tendance}</h3>
            <h3 className="text-xl">#{language}</h3>
            <p className="text-sm opacity-70">{nbProjet} projets</p>
        </div>
        <div className="place-content-center bg-none  rounded-full m-4 p-2 flex-none hover: bg-button/75 ">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
        </div>
    </div>
  )
}

export default LanguageItem