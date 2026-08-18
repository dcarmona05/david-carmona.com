import Link from 'next/link';
import Reveal from '@/components/Reveal';
import PhotoFrame from '@/components/PhotoFrame';
import { siteConfig } from '@/lib/site';
import { experience, skills } from '@/lib/experience';

export const metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div>
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start gap-10">
          <PhotoFrame src="/profile.jpg" alt={siteConfig.name} />
          <div>
            <h1 className="font-display font-bold text-3xl text-white">About</h1>
            <p className="mt-4 max-w-xl text-white/70 leading-relaxed">
              I'm a Principal Designer who has spent two decades turning
              complex, fragmented software into products people can actually
              reason about. Most recently that's meant leading design systems
              and AI-assisted workflows at enterprise scale — first at
              LinkedIn for over a decade, and now at ServiceNow.
            </p>
            <p className="mt-4 max-w-xl text-white/70 leading-relaxed">
              I care about the gap between "it technically works" and "it
              feels considered" — the details of interaction, motion, and
              language that make software trustworthy rather than just
              functional. Outside of product work, I sit on the board of the
              Monterey Peninsula Ballet Theatre, helping with marketing and
              communications.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={siteConfig.resumeUrl}
                className="inline-block bg-accent text-black font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform"
              >
                Resume
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center text-white/70 hover:text-accent transition-colors"
              >
                Get in touch &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl text-white">Experience</h2>
        </Reveal>
        <div className="mt-8 space-y-8">
          {experience.map((job, i) => (
            <Reveal key={`${job.company}-${job.timeline}`} delay={i * 0.05}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-white/10 pb-6">
                <div>
                  <h3 className="font-display font-medium text-lg text-white">
                    {job.role}
                    <span className="text-white/50"> &middot; {job.company}</span>
                  </h3>
                  <p className="mt-2 text-white/60 max-w-xl leading-relaxed">
                    {job.description}
                  </p>
                </div>
                <span className="mt-2 sm:mt-0 sm:ml-8 shrink-0 text-sm text-white/40 whitespace-nowrap">
                  {job.timeline}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl text-white">Skills</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-sm text-white/70 border border-white/15 rounded-full px-4 py-1.5"
              >
                {skill}
              </span>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
