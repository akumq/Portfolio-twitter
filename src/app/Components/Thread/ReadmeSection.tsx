'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ReadmeSection({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const maxLength = 500;
  const shouldShowButton = content.length > maxLength;
  const displayContent = isExpanded ? content : content.slice(0, maxLength) + '...';

  return (
    <div className="bg-background border border-border_color rounded-xl p-4">
      <h3 className="font-semibold mb-4">README.md</h3>
      <div className={`prose prose-invert max-w-none ${!isExpanded && 'max-h-[300px] overflow-hidden'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {displayContent}
        </ReactMarkdown>
      </div>
      {shouldShowButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-text_highlight hover:text-white transition-colors flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              Voir moins
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
            </>
          ) : (
            <>
              Voir plus
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
} 