'use client';

import React from 'react';

type ThreadStatsProps = {
  commits: number;
  watchers: number;
  stars?: number;
};

export default function ThreadStats({ commits = 0, watchers = 0, stars = 0 }: ThreadStatsProps) {
  const formatNumber = (num: number) => {
    return num?.toLocaleString() || '0';
  };

  return (
    <div className="flex items-center justify-between max-w-md py-1">
      <button className="group flex items-center hover:text-blue-500 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-blue-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-[18px] h-[18px] text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" className="stroke-current"/>
          </svg>
        </div>
        <span className="text-sm text-gray-500 group-hover:text-blue-500 ml-[2px]">{formatNumber(commits)}</span>
      </button>

      <button className="group flex items-center hover:text-green-500 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-green-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-[18px] h-[18px] text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="stroke-current"/>
          </svg>
        </div>
        <span className="text-sm text-gray-500 group-hover:text-green-500 ml-[2px]">{formatNumber(watchers)}</span>
      </button>

      <button className="group flex items-center hover:text-pink-500 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-pink-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-[18px] h-[18px] text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" className="stroke-current"/>
          </svg>
        </div>
        <span className="text-sm text-gray-500 group-hover:text-pink-500 ml-[2px]">{formatNumber(stars)}</span>
      </button>
    </div>
  );
} 