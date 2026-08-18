import Link from 'next/link';
import CaseStudyCard from '@/components/CaseStudyCard';
import Reveal from '@/components/Reveal';
import HeroDoodle from '@/components/HeroDoodle';
import TopoBackground from '@/components/TopoBackground';
import { siteConfig } from '@/lib/site';
import { work } from '@/lib/work';

export default function HomePage() {
  return (
    <div>
      <TopoBackground />
      <Reveal>
        <section className="relative">
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 xl:w-[28rem] xl:h-[28rem]">
            <HeroDoodle />
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.1] tracking-tight text-white">
            {siteConfig.name}
          </h1>
          <p className="mt-2 text-lg text-white/60">{siteConfig.role}</p>
          <p className="mt-6 max-w-xl text-white/70 leading-relaxed">
            I design systems and products for complex, enterprise-scale
            software — turning fragmented experiences into something coherent,
            usable, and fast to build on. I care about the details that make
            software feel considered, not just functional.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block bg-accent text-black font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform"
          >
            Get in touch
          </Link>
        </section>
      </Reveal>

      <section className="mt-20">
        <Reveal>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-white">Featured Work</h2>
            <Link href="/work" className="text-sm text-white/60 hover:text-accent transition-colors">
              View all &rarr;
            </Link>
          </div>
        </Reveal>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {work.slice(0, 6).map((item, i) => (
            <Reveal key={item.slug} delay={i * 0.06}>
              <CaseStudyCard item={item} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
