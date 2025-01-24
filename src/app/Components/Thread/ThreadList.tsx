import React from 'react'

function ThreadList({children, className} : {children: React.ReactNode, className?: string}) {
  return (
    <div className={`bg-background relative basis-2/3 ${className}`} >
      {children}
    </div>
  )
}

export default ThreadList