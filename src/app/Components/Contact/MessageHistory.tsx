'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';

interface Message {
  id: number;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export default function MessageHistory() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchMessages();
    }
  }, [session]);

  const fetchMessages = () => {
    setLoading(true);
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des messages:', error);
        setLoading(false);
      });
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-500">Connectez-vous pour voir vos messages</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-border_color rounded-xl p-4">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Aucun message envoyé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          className="border border-border_color rounded-xl p-4 hover:bg-secondary/5 transition-colors"
        >
          <div className="flex items-start gap-3">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Avatar'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold truncate">{session.user?.name}</span>
                <span className="text-gray-500 text-sm">
                  {format(new Date(message.createdAt), 'dd MMM', { locale: fr })}
                </span>
                {message.read && (
                  <span className="text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <h3 className="font-medium mb-1">{message.subject}</h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 