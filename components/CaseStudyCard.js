import Link from 'next/link';

export default function CaseStudyCard({ item }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="group block rounded-lg border border-white/10 overflow-hidden hover:border-white/30 hover:-translate-y-1 transition-all duration-200"
    >
      <div className={`aspect-[4/3] bg-gradient-to-br ${item.accent} flex items-end p-4`}>
        <span className="text-white/80 text-xs uppercase tracking-wide">
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
