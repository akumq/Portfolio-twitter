'use client';

import React from 'react';

type GithubDescriptionProps = {
  description: string;
};

export default function GithubDescription({ description }: GithubDescriptionProps) {
  return (
    <div className="bg-background border border-border_color rounded-xl p-4">
      <h3 className="font-semibold mb-2">Description</h3>
      <p className="text-text_highlight">{description}</p>
    </div>
  );
} 