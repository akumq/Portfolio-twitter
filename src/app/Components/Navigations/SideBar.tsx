import React from 'react'

function SideBar({children, className} : {children: React.ReactNode, className?: string}) {
  return (
    <div className={`bg-background relative flex flex-col basis-1/3 p-1 ${className}`}>
        {children}
    </div>
  )
}

export default SideBar