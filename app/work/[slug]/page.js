import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/Reveal';
import AbstractVisual from '@/components/AbstractVisual';
import ProcessSteps from '@/components/ProcessSteps';
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

        <div className={`relative mt-6 aspect-[16/8] rounded-lg overflow-hidden bg-gradient-to-br ${item.accent}`}>
          <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden="true">
            <defs>
              <pattern id={`dots-${item.slug}`} width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${item.slug})`} />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span className="absolute top-4 left-4 text-xs uppercase tracking-wide text-white/80 bg-black/30 rounded-full px-3 py-1">
            {item.company} &middot; {item.category}
          </span>

          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              {item.title}
            </h1>
            <p className="mt-1 text-white/70">{item.role} &middot; {item.timeline}</p>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">
          {item.description}
        </p>
      </Reveal>

      {item.overview && (
        <Reveal delay={0.05}>
          <section className="mt-16 grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="font-display text-xl text-white">Overview</h2>
              <p className="mt-3 text-white/70 leading-relaxed">{item.overview}</p>
            </div>
            <AbstractVisual category={item.category} />
          </section>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">Approach</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
            The general process behind this kind of work — specifics vary by project.
          </p>
          <div className="mt-6">
            <ProcessSteps />
          </div>
        </section>
      </Reveal>

      {item.outcome && (
        <Reveal delay={0.15}>
          <section className="mt-16">
            <h2 className="font-display text-xl text-white">Outputs &amp; Impact</h2>
            <blockquote className="mt-4 max-w-2xl border-l-2 border-accent pl-6">
              <p className="font-display text-xl sm:text-2xl text-white leading-snug">
                {item.outcome}
              </p>
            </blockquote>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.2}>
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
