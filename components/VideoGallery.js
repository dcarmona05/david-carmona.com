export default function VideoGallery({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {videos.map((video, i) => (
        <a
          key={i}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-lg border border-white/10 overflow-hidden hover:border-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div className="relative aspect-video bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnail}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-accent transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white translate-x-[1px]">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          </div>
          <p className="px-4 py-3 text-sm text-white/70 group-hover:text-white transition-colors">
            {video.title}
          </p>
        </a>
      ))}
    </div>
  );
}
