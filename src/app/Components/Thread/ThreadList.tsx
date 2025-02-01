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
    <div className={`bg-background relative basis-2/3 ${className}`}>
      <div className="h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-border_color scrollbar-track-transparent">
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