import React from 'react'

function Suggestions({children, className} : { children: React.ReactNode, className?: string}) {
  return (
    <div className={`bg-background flex flex-col ${className}`}>
      <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  )
}

export default Suggestions