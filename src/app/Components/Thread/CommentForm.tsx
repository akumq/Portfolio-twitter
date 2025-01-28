'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface CommentFormProps {
  threadId: number;
  onSuccess?: () => void;
}

export default function CommentForm({ threadId, onSuccess }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          threadId
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du commentaire');
      }

      setContent('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-background/50 p-4 rounded-lg text-center">
        <p className="text-text_highlight">Connectez-vous pour ajouter un commentaire</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre commentaire..."
          className="w-full p-3 bg-background rounded-lg border border-border_color focus:outline-none focus:ring-2 focus:ring-text_highlight resize-none"
          rows={3}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-text_highlight text-white rounded-lg hover:bg-text_highlight/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi...' : 'Commenter'}
        </button>
      </div>
    </form>
  );
} 