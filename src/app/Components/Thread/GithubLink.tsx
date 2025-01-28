'use client';

import React from 'react';

interface GithubLinkProps {
    href: string;
    username: string;
}

export default function GithubLink({ href, username }: GithubLinkProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
    };

    return (
        <button 
            onClick={handleClick}
            className="text-sm text-text_highlight opacity-50 hover:opacity-100 transition-opacity"
        >
            @{username}
        </button>
    );
} 