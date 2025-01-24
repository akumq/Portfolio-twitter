import React from 'react'

function ReseauxList({children} : {children: React.ReactNode}) { 
  return (
    <div className="bg-background border border-border_color rounded-xl p-2 m-2 mt-4">{/* Réseaux */}
        <h2 className="text-xl p-2 font-extrabold ">Réseaux</h2>
        {children}
    </div>
  )
}

export default ReseauxList