'use client';

import React, { useState } from 'react';

interface ThreadContentProps {
  content: string;
  maxLength?: number;
}

export default function ThreadContent({ content, maxLength = 300 }: ThreadContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowMore = content.length > maxLength;
  const displayContent = isExpanded ? content : content.slice(0, maxLength);

  return (
    <div className="relative">
      <p className="text-lg mb-4">
        {displayContent}
        {!isExpanded && shouldShowMore && '...'}
      </p>
      
      {shouldShowMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text_highlight hover:text-white transition-colors text-sm font-medium"
        >
          {isExpanded ? 'Voir moins' : 'Voir plus'}
        </button>
      )}
    </div>
  );
} 