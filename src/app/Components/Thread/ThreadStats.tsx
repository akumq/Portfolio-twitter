'use client';

import React from 'react';

type ThreadStatsProps = {
  commits: number;
  watchers: number;
  stars?: number;
};

export default function ThreadStats({ commits, watchers, stars = 0 }: ThreadStatsProps) {
  return (
    <div className="flex items-center justify-start gap-6 px-4 py-2 text-text_secondary">
      <button className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
        <div className="flex items-center justify-center w-9 h-9 rounded-full group-hover:bg-blue-500/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="text-sm">{commits}</span>
      </button>
      
      <button className="flex items-center gap-2 group hover:text-pink-500 transition-colors">
        <div className="flex items-center justify-center w-9 h-9 rounded-full group-hover:bg-pink-500/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <span className="text-sm">{stars}</span>
      </button>
      
      <button className="flex items-center gap-2 group hover:text-green-500 transition-colors">
        <div className="flex items-center justify-center w-9 h-9 rounded-full group-hover:bg-green-500/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <span className="text-sm">{watchers}</span>
      </button>
    </div>
  );
} 