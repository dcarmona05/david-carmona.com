import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { work, getWorkBySlug, getNextWork } from '@/lib/work';

export function generateStaticParams() {
  return work.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }) {
  const item = getWorkBySlug(params.slug);
  if (!item) return {};
  return { title: item.title };
}

export default function CaseStudyPage({ params }) {
  const item = getWorkBySlug(params.slug);
  if (!item) notFound();

  const next = getNextWork(item.slug);

  return (
    <div>
      <Reveal>
        <Link href="/work" className="text-sm text-white/60 hover:text-accent transition-colors">
          &larr; All work
        </Link>

        <div className={`mt-6 aspect-[16/7] rounded-lg bg-gradient-to-br ${item.accent}`} />

        <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-white/50 uppercase tracking-wide">
          <span>{item.company}</span>
          <span>&middot;</span>
          <span>{item.category}</span>
          <span>&middot;</span>
          <span>{item.timeline}</span>
        </div>

        <h1 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-white">
          {item.title}
        </h1>

        <p className="mt-2 text-white/50">{item.role}</p>

        <p className="mt-6 max-w-2xl text-lg text-white/70 leading-relaxed">
          {item.description}
        </p>
      </Reveal>

      {item.overview && (
        <Reveal delay={0.05}>
          <section className="mt-16">
            <h2 className="font-display text-xl text-white">Overview</h2>
            <p className="mt-3 max-w-2xl text-white/70 leading-relaxed">{item.overview}</p>
          </section>
        </Reveal>
      )}

      {item.outcome && (
        <Reveal delay={0.1}>
          <section className="mt-12">
            <h2 className="font-display text-xl text-white">Outcome</h2>
            <p className="mt-3 max-w-2xl text-white/70 leading-relaxed">{item.outcome}</p>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.15}>
        <div className="mt-20 pt-8 border-t border-white/10 flex items-baseline justify-between">
          <span className="text-sm text-white/40">Next project</span>
          <Link
            href={`/work/${next.slug}`}
            className="font-display text-white hover:text-accent transition-colors"
          >
            {next.title} &rarr;
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
