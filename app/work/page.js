import Reveal from '@/components/Reveal';
import WorkGrid from '@/components/WorkGrid';
import PageShell from '@/components/PageShell';
import { work } from '@/lib/work';

export const metadata = {
  title: 'Work',
  description: 'A selection of design systems, product design, and design operations projects.',
};

export default function WorkPage() {
  return (
    <PageShell>
      <div>
        <Reveal>
          <h1 className="font-display font-bold text-3xl text-fg">Work</h1>
          <p className="mt-3 text-fg/60 max-w-xl text-balance">
            A selection of projects spanning design systems, product design, and design operations.
          </p>
        </Reveal>
        <div className="mt-10">
          <WorkGrid items={work} reveal />
        </div>
      </div>
    </PageShell>
  );
}
