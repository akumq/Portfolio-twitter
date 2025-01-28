import React from 'react'

import prisma from "@/prisma";
async function ThreadList({children, className} : {children: React.ReactNode, className?: string}) {
  const threads = await prisma.thread.findMany();
  return (
    <div className={`bg-background relative basis-2/3 ${className}`} >
      {children}
    </div>
  )
}

export default ThreadList