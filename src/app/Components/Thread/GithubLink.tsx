'use client';

import React from 'react';

interface GithubLinkProps {
    href: string;
    username: string;
}

export default function GithubLink({ href, username }: GithubLinkProps) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-text_highlight opacity-50 hover:opacity-100 transition-opacity"
        >
            @{username}
        </a>
    );
} 