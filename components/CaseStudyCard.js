import Link from 'next/link';

function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm -rotate-6 ${className}`}
    >
      {children}
    </span>
  );
}

// `viewCount`/`isMostViewed` are optional — real, live data from
// lib/projectViews.js (see WorkGrid.js), never a fabricated/decorative
// number. A card simply shows neither until that data actually exists.
export default function CaseStudyCard({ item, viewCount, isMostViewed }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group block rounded-2xl border border-border/10 overflow-hidden hover:border-border/30 hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className={`relative aspect-[4/3] overflow-hidden flex items-end p-4 ${item.heroImage ? 'bg-black' : `bg-gradient-to-br ${item.accent}`}`}>
        {item.heroImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {item.heroImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        )}

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {/* text-black is intentional/literal here, not text-accent-ink — these
              badges sit on the always-bright "-bright" decorative tokens
              (constant across themes), not the theme-varying accent tokens
              accent-ink was designed for, so they need a fixed contrast color. */}
          {item.isNew && <Badge className="bg-accent2-bright text-black">&#10024; New</Badge>}
          {isMostViewed && <Badge className="bg-accent-bright text-white">&#128293; Most viewed</Badge>}
        </div>

        {typeof viewCount === 'number' && viewCount > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] text-white/90">
            {viewCount.toLocaleString()} view{viewCount === 1 ? '' : 's'}
          </span>
        )}

        <span className="relative text-white/80 text-xs uppercase tracking-wide">
          {item.company} &middot; {item.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display font-medium text-lg text-fg group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-fg/60 leading-relaxed">{item.description}</p>
      </div>
    </Link>
  );
}
