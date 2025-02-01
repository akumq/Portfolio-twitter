import React from 'react'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import ThreadContent from './ThreadContent'

export default async function CommentList({ threadId }: { threadId: number }) {
  const comments = await prisma.comment.findMany({
    where: {
      threadId: threadId
    },
    include: {
      author: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (comments.length === 0) {
    return (
      <p className="text-center text-text_highlight py-4">
        Aucun commentaire pour le moment
      </p>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-background p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            {comment.author.image ? (
              <Image
                src={comment.author.image}
                alt={comment.author.name || 'Avatar'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-600 rounded-full" />
            )}
            <div>
              <p className="font-medium">{comment.author.name}</p>
              <p className="text-sm text-text_highlight">
                {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <ThreadContent content={comment.content} maxLength={200} />
        </div>
      ))}
    </div>
  );
} 