import React from 'react'

function Suggestions({children, className} : { children: React.ReactNode, className?: string}) {
  return (
    <div className={`bg-background relative flex flex-col basis-1/3 ${className}`}> {/* Suggestion */}
        {children}
    </div>
  )
}

export default Suggestions