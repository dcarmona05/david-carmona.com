import Link from 'next/link';

export default function CaseStudyCard({ item }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group block rounded-lg border border-white/10 overflow-hidden hover:border-white/30 hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
        <span className="relative text-white/80 text-xs uppercase tracking-wide">
          {item.company} &middot; {item.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display font-medium text-lg text-white group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-white/60 leading-relaxed">{item.description}</p>
      </div>
    </Link>
  );
}
