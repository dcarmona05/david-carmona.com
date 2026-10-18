export default function ScreenshotGallery({ screenshots }) {
  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {screenshots.map((shot, i) => (
        <figure
          key={i}
          className="rounded-lg border border-white/10 overflow-hidden bg-white/[0.02] hover:border-white/25 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot.src} alt={shot.alt} className="w-full h-auto" loading="lazy" />
          <figcaption className="px-4 py-3 text-sm text-white/50 border-t border-white/10">
            {shot.caption || shot.alt}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
