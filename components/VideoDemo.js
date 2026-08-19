function getEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function VideoDemo({ videoUrl }) {
  const embedUrl = getEmbedUrl(videoUrl);

  if (embedUrl) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
        <iframe
          src={embedUrl}
          title="Project demo"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoUrl) {
    return (
      <video controls className="w-full rounded-lg border border-white/10" src={videoUrl}>
        Your browser doesn&apos;t support embedded video.
      </video>
    );
  }

  return (
    <div className="aspect-video rounded-lg border border-dashed border-white/15 flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/40 translate-x-[1px]">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <p className="text-sm text-white/40">Video demo coming soon</p>
    </div>
  );
}
