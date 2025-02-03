import React from 'react'
import prisma from '@/lib/prisma';
import ThreadItem from './ThreadItem';
import { ProjectType } from '@prisma/client';

interface ThreadListProps {
  className?: string;
  language?: string;
  type?: ProjectType;
}

async function ThreadList({
  className,
  language,
  type
}: ThreadListProps) {
  const threads = await prisma.thread.findMany({
    where: {
      AND: [
        language ? {
          languages: {
            some: {
              name: language
            }
          }
        } : {},
        type ? {
          types: {
            has: type
          }
        } : {}
      ]
    },
    include: {
      languages: true,
      comments: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className={`bg-background p-0 w-full relative basis-2/3 border-none ${className}`}>
      <div className="h-[calc(100vh-4rem)] sm:h-screen w-full overflow-y-auto p-0 m-0 scrollbar-thin scrollbar-thumb-border_color scrollbar-track-transparent">
        {threads.map((thread) => (
          <ThreadItem key={thread.id} id={thread.id} />
        ))}
        {threads.length === 0 && (
          <div className="text-center p-4 text-text_highlight">
            Aucun projet trouvé
          </div>
        )}
      </div>
    </div>
  )
}

export default ThreadList