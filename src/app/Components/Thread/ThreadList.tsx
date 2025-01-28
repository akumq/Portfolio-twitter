import React from 'react'
import prisma from '@/lib/prisma';
import ThreadItem from './ThreadItem';
async function ThreadList({className} : {className?: string}) {
  const threads = await prisma.thread.findMany();
  console.log(threads);
  return (
    <div className={`bg-background relative basis-2/3 ${className}`} >
      {threads.map((thread) => (
        <ThreadItem id={thread.id} />
      ))}
    </div>
  )
}

export default ThreadList