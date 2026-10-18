export default function ScreenshotGallery({ screenshots }) {
  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {screenshots.map((shot, i) => (
        <figure key={i} className="rounded-lg border border-white/10 overflow-hidden bg-white/[0.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot.src} alt={shot.alt} className="w-full h-auto" loading="lazy" />
          {shot.caption && (
            <figcaption className="px-3 py-2 text-xs text-white/40">{shot.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
