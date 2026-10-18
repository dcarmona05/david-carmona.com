'use client';

import { useRef, useState } from 'react';

export default function HeroVideo({ src, poster }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover object-top"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-accent flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {muted ? (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
            <path d="m16 9 5 6m0-6-5 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
            <path d="M18 6a9 9 0 0 1 0 12" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  );
}
