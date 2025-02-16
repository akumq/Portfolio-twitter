'use client';

import React, { useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  title?: string;
}

export default function VideoPlayer({ src, className, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      controls
      title={title}
      poster={src.replace(/\.[^/.]+$/, '_thumb.jpg')}
    />
  );
} 