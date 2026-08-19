import Link from 'next/link';
import Reveal from '@/components/Reveal';
import PhotoFrame from '@/components/PhotoFrame';
import TopoBackground from '@/components/TopoBackground';
import { siteConfig } from '@/lib/site';
import { experience, skills } from '@/lib/experience';
import { interviews } from '@/lib/interviews';

export const metadata = {
  title: 'About',
  description: 'Principal Designer at ServiceNow, previously LinkedIn — experience, skills, and background.',
};

export default function AboutPage() {
  return (
    <div>
      <TopoBackground />
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
                  {job.roleHistory && (
                    <p className="mt-1 text-sm text-white/40">{job.roleHistory}</p>
                  )}
                  {job.description && (
                    <p className="mt-2 text-white/60 max-w-xl leading-relaxed">
                      {job.description}
                    </p>
                  )}
                  {job.highlights && (
                    <ul className="mt-2 space-y-1.5 max-w-xl">
                      {job.highlights.map((point) => (
                        <li
                          key={point}
                          className="text-white/60 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-white/30"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="mt-2 sm:mt-0 sm:ml-8 shrink-0 text-right text-sm text-white/40 whitespace-nowrap">
                  <span className="block">{job.timeline}</span>
                  {job.location && <span className="block text-white/30">{job.location}</span>}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <h2 className="font-display text-2xl text-white">Interviews</h2>
        </Reveal>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((item, i) => (
            <Reveal key={item.url} delay={i * 0.06}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg border border-white/10 overflow-hidden hover:border-white/30 hover:-translate-y-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="relative aspect-video bg-white/5">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black translate-x-[1px]">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-medium text-white group-hover:text-accent transition-colors">
                    {item.title}
                    <span className="sr-only"> (opens in new tab)</span>
                  </h3>
                  <p className="mt-1 text-sm text-white/60">{item.show}</p>
                </div>
              </a>
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
