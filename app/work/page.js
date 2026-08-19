import CaseStudyCard from '@/components/CaseStudyCard';
import Reveal from '@/components/Reveal';
import { work } from '@/lib/work';

export const metadata = {
  title: 'Work',
  description: 'A selection of design systems, product design, and design operations projects.',
};

export default function WorkPage() {
  return (
    <div>
      <Reveal>
        <h1 className="font-display font-bold text-3xl text-white">Work</h1>
        <p className="mt-3 text-white/60 max-w-xl">
          A selection of projects spanning design systems, product design, and design operations.
        </p>
      </Reveal>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {work.map((item, i) => (
          <Reveal key={item.slug} delay={i * 0.06}>
            <CaseStudyCard item={item} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
