import { Fragment } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import HeroVideo from '@/components/HeroVideo';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import RoleResponsibilities from '@/components/RoleResponsibilities';
import { getWorkBySlug, getNextWork } from '@/lib/work';

const item = getWorkBySlug('otto-for-contact-center');

export function generateMetadata() {
  return { title: item.title };
}

function Tag({ color, children }) {
  const colorClass = { lime: 'text-accent2', cyan: 'text-accent3', neutral: 'text-fg/50' }[color];
  return <span className={`text-[10px] font-mono uppercase tracking-wide ${colorClass}`}>{children}</span>;
}

const LANES = [
  { key: 'customer', label: 'Customer', dot: 'bg-accent2' },
  { key: 'banker', label: 'Banker', dot: 'bg-fg' },
  { key: 'otto', label: 'Otto', dot: 'bg-accent3' },
];

const CALL_STEPS = [
  { lane: 'customer', title: 'Stop payment' },
  { lane: 'otto', title: 'Intent' },
  { lane: 'banker', title: 'Greet & verify' },
  { lane: 'otto', title: 'Identity' },
  { lane: 'banker', title: 'Check details' },
  { lane: 'customer', title: '"My paycheck?"' },
  { lane: 'otto', title: 'Recommended action' },
  { lane: 'banker', title: 'Answer deposit' },
];

function Swimlane() {
  const gridCols = `76px repeat(${CALL_STEPS.length}, minmax(96px, 1fr))`;
  return (
    <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid gap-x-2 gap-y-3 min-w-[860px]" style={{ gridTemplateColumns: gridCols }}>
        {LANES.map((lane) => (
          <Fragment key={lane.key}>
            <div className="flex items-center gap-2 py-3">
              <span className={`w-2 h-2 rounded-full ${lane.dot} shrink-0`} />
              <span className="text-[10px] font-mono uppercase tracking-wide text-fg/50">{lane.label}</span>
            </div>
            {CALL_STEPS.map((step, i) => (
              <div key={`${lane.key}-${i}`} className="border-t border-border/10 py-3 flex items-center">
                {step.lane === lane.key && (
                  <div
                    className={`w-full rounded-md border px-2.5 py-2 ${
                      lane.key === 'otto' ? 'border-accent3/30 bg-accent3/5' : 'border-border/10 bg-surface/[0.03]'
                    }`}
                  >
                    <p className="text-xs font-display text-fg leading-snug">{step.title}</p>
                  </div>
                )}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function SourceStat({ value, children, source }) {
  return (
    <div className="rounded-lg border border-border/10 p-6">
      <p className="font-display text-4xl text-accent2">{value}</p>
      <p className="mt-2 text-fg/70 leading-snug">{children}</p>
      <p className="mt-3 text-xs text-fg/35">{source}</p>
    </div>
  );
}

export default function OttoCaseStudyPage() {
  const next = getNextWork(item.slug);

  return (
    <div>
      <Reveal>
        <Link href="/work" className="text-sm text-fg/60 hover:text-accent transition-colors">
          &larr; All work
        </Link>

        <div className="relative mt-6 aspect-[16/8] rounded-lg overflow-hidden bg-black">
          <HeroVideo src={item.videoUrl} poster={item.heroImage} />
        </div>
        <p className="mt-2 text-xs text-fg/35">
          A 2:30 concept film of the experience, written and directed for ServiceNow&apos;s VP and
          Director-level Design and Product leadership.
        </p>

        <div className="mt-6">
          <span className="text-xs uppercase tracking-wide text-fg/50 bg-surface/5 rounded-full px-3 py-1">
            {item.company} &middot; {item.category}
          </span>
          <h1 className="mt-4 font-display font-bold text-3xl sm:text-4xl text-fg">{item.title}</h1>
          <p className="mt-1 text-fg/70">{item.role} &middot; {item.timeline}</p>
        </div>

        <p className="mt-6 max-w-2xl text-lg text-fg/70 leading-relaxed">{item.description}</p>
      </Reveal>

      <Reveal delay={0.04}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">My Role &amp; Responsibilities</h2>
          <div className="mt-6 max-w-2xl">
            <RoleResponsibilities role={item.role} responsibilities={item.responsibilities} />
          </div>
        </section>
      </Reveal>

      {/* Who it's for */}
      <Reveal delay={0.06}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">Who This Is For</h2>
          <p className="mt-2 text-sm text-fg/40 max-w-2xl">
            The demo scenario&apos;s persona, used to walk through the experience end-to-end.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-start gap-6 rounded-lg border border-border/10 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/work/otto-contact-center/samantha-avatar.png"
              alt="Samantha Lee, the banker persona"
              className="w-28 h-28 rounded-full object-cover shrink-0 bg-surface/5"
            />
            <div className="flex-1">
              <p className="font-display text-lg text-fg">Samantha Lee</p>
              <p className="text-sm text-fg/50">Banker, Alectri Bank</p>
              <p className="mt-3 text-fg/70 leading-relaxed">
                A contact-center banker who takes live customer calls all day. Mid-call, she has to
                listen to the customer, verify who they are, pull up account history, follow
                compliance steps like step-up authentication, and write up what happened &mdash; while
                the conversation keeps moving. Otto is designed to keep pace with her, not the other
                way around.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* What it is */}
      <Reveal delay={0.07}>
        <section className="mt-20 pt-10 border-t border-border/10 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-fg">What It Is</h2>
            <p className="mt-3 text-fg/70 leading-relaxed">{item.overview}</p>
            <div className="mt-6 rounded-lg border border-border/10 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/work/otto-contact-center/details-captured.png"
                alt="Otto filling in stop-payment details live on the call, with a delayed-deposit alert in Customer 360"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              'Real-time call-script suggestions that keep pace with what the customer is saying',
              'Identity verification, confirmed from what the customer says out loud',
              'Step-up authentication (one-time passcode or app approval) before anything moves',
              'A Customer 360 view: history, accounts, and a live transcript, one click away',
              'An AI-drafted call summary and coaching notes the banker edits and confirms',
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border/10 p-4">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent2 shrink-0" />
                <span className="text-fg/70 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* Why we built it */}
      <Reveal delay={0.08}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">Why We Built It</h2>
          <p className="mt-2 text-sm text-fg/40 max-w-2xl">
            Most AI copilots bolt onto an existing, form-first workspace as one more card. A live call
            doesn&apos;t work that way.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/10 p-5">
              <Tag color="neutral">Omni-channel today</Tag>
              <p className="mt-2 text-fg/70 leading-relaxed">
                The AI is one card among forms, tabs, and channels &mdash; something the banker has to
                remember to check.
              </p>
            </div>
            <div className="rounded-lg border border-accent3/30 bg-accent3/5 p-5">
              <Tag color="cyan">Live call &middot; this study</Tag>
              <p className="mt-2 text-fg/70 leading-relaxed">
                Otto leads the main column &mdash; what to say next, right in the flow the banker is
                already reading.
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-fg/40 italic">
            Built for a call that moves in real time: the banker reads one place while talking.
          </p>
        </section>
      </Reveal>

      {/* One conversation, four tracks at once */}
      <Reveal delay={0.09}>
        <section className="mt-16">
          <h3 className="font-display text-xl font-semibold text-fg">One Conversation, Four Tracks at Once</h3>
          <p className="mt-2 text-sm text-fg/40 max-w-2xl">
            Customer, Otto, and the banker are all moving at the same time &mdash; and the customer
            doesn&apos;t follow a script.
          </p>
          <div className="mt-6">
            <Swimlane />
          </div>
          <p className="mt-3 text-sm text-fg/40 italic">
            Customers don&apos;t follow a script. Success depends on how well Otto reacts.
          </p>
        </section>
      </Reveal>

      {/* Same call without Otto */}
      <Reveal delay={0.1}>
        <section className="mt-16 rounded-lg border border-border/10 p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold text-fg">The Same Call, Without Otto</h3>
          <p className="mt-3 text-fg/70 leading-relaxed">
            Walking the same scenario without Otto takes more screens and more holds: the banker
            switches between a profile, accounts, check search, deposits, and a policy doc by hand,
            putting the customer on hold twice along the way. With Otto, the call wraps in roughly
            the time it takes to get through the stop-payment request once.
          </p>
          <p className="mt-3 text-sm text-fg/40 italic">
            More screens, more holds, a longer call. The banker carries every track alone. (Illustrative
            walkthrough comparison, not a measured study result.)
          </p>
        </section>
      </Reveal>

      {/* Why this matters - external research */}
      <Reveal delay={0.11}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">Why This Matters</h2>
          <p className="mt-2 text-sm text-fg/40 max-w-2xl">
            Independent research on generative AI assistance in customer-facing roles &mdash; the
            broader case this design direction responds to, not a measured result of this prototype.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <SourceStat value="55%" source="Source: ServiceNow Newsroom, BT Group Now Assist pilot, 300 agents, June 2024">
              less time writing case summaries
            </SourceStat>
            <SourceStat value="~25%" source={'Source: Brynjolfsson, Li & Raymond, "Generative AI at Work," NBER WP 31161, 2023'}>
              fewer requests to speak to a manager
            </SourceStat>
            <SourceStat value="2 mo." source={'Source: Brynjolfsson, Li & Raymond, "Generative AI at Work," NBER WP 31161, 2023'}>
              for new agents to perform like six-month veterans
            </SourceStat>
          </div>
        </section>
      </Reveal>

      {/* How it's built */}
      <Reveal delay={0.12}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">How It&apos;s Built</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-border/15 px-4 py-1.5 text-fg/70">LLM <span className="text-fg/35">thinks</span></span>
            <span className="text-fg/25">&rarr;</span>
            <span className="rounded-full border border-border/15 px-4 py-1.5 text-fg/70">ElevenLabs <span className="text-fg/35">speaks</span></span>
            <span className="text-fg/25">&rarr;</span>
            <span className="rounded-full border border-accent3/40 bg-accent3/5 px-4 py-1.5 text-fg">Otto <span className="text-fg/35">guides</span></span>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-fg/60 max-w-2xl">
            <li>&middot; Lit web components + Vite, on ServiceNow&apos;s Horizon 2.0 design tokens and components</li>
            <li>&middot; An LLM plays the customer on a live call and drafts the banker&apos;s call-script suggestions</li>
            <li>&middot; ElevenLabs voices the simulated customer; the banker&apos;s own mic runs on the browser&apos;s native Web Speech API</li>
            <li>&middot; Falls back to a scripted, deterministic call automatically if no AI keys are configured</li>
          </ul>
          <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-xl">
            <div className="rounded-lg border border-border/10 p-5">
              <p className="font-display text-3xl text-accent2">1</p>
              <p className="mt-1 text-sm text-fg/60">designer + AI, no engineers</p>
            </div>
            <div className="rounded-lg border border-border/10 p-5">
              <p className="font-display text-3xl text-accent2">1000+</p>
              <p className="mt-1 text-sm text-fg/60">changes to the prototype</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* What we learned */}
      <Reveal delay={0.13}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">What We Learned From the Study</h2>
          <p className="mt-2 text-sm text-fg/40 max-w-2xl">
            Real findings from banker research sessions run on this prototype over Zoom.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border/10 p-5">
              <Tag color="lime">01</Tag>
              <p className="mt-2 font-display text-fg">Listen, talk, read</p>
              <p className="mt-2 text-sm text-fg/60 leading-relaxed">
                Bankers listen first. Anything they have to read mid-call gets missed, so Otto has to
                be brief and show up where they&apos;re already looking.
              </p>
            </div>
            <div className="rounded-lg border border-border/10 p-5">
              <Tag color="lime">02</Tag>
              <p className="mt-2 font-display text-fg">Timing</p>
              <p className="mt-2 text-sm text-fg/60 leading-relaxed">
                Otto helps when it&apos;s a step ahead. When the customer got there first, the
                suggestion felt backwards and bankers went their own way.
              </p>
            </div>
            <div className="rounded-lg border border-border/10 p-5">
              <Tag color="lime">03</Tag>
              <p className="mt-2 font-display text-fg">Off-script moments</p>
              <p className="mt-2 text-sm text-fg/60 leading-relaxed">
                Bankers go off script, often for good reasons. Otto has to follow them, not pull them
                back.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-fg/40 italic">
            Next: we changed the prototype after each session. We&apos;re now testing the same help in chat.
          </p>
        </section>
      </Reveal>

      {/* Where it lives */}
      <Reveal delay={0.14}>
        <section className="mt-20 rounded-lg border border-border/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-fg">Where It Lives, and Why</h2>
          <p className="mt-3 text-fg/70 leading-relaxed">
            Otto for Contact Center is a desktop experience, not a mobile one. A banker on a live call
            needs the transcript, the call script, and the Customer 360 view open at once on a wide
            screen, with a free hand on the keyboard while the other holds the conversation &mdash; a
            phone-sized screen can&apos;t hold that much at a glance. The research sessions ran the
            same way bankers actually work: at a desk, over Zoom, screen-sharing a full browser window.
          </p>
        </section>
      </Reveal>

      {/* Product Walkthrough */}
      <Reveal delay={0.15}>
        <section className="mt-20 pt-10 border-t border-border/10">
          <h2 className="font-display text-2xl font-bold text-fg">Product Walkthrough</h2>
          <p className="mt-2 text-sm text-fg/40 max-w-2xl">Real screens from the working prototype.</p>
          <div className="mt-6">
            <ScreenshotGallery screenshots={item.screenshots} />
          </div>
        </section>
      </Reveal>

      {item.outcome && (
        <Reveal delay={0.16}>
          <section className="mt-20 pt-10 border-t border-border/10">
            <h2 className="font-display text-2xl font-bold text-fg">Outputs &amp; Impact</h2>
            <blockquote className="mt-4 max-w-2xl border-l-2 border-accent pl-6">
              <p className="font-display text-xl sm:text-2xl text-fg leading-snug">{item.outcome}</p>
            </blockquote>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.2}>
        <div className="mt-20 pt-8 border-t border-border/10 flex items-baseline justify-between">
          <span className="text-sm text-fg/40">Next project</span>
          <Link href={`/work/${next.slug}`} className="font-display text-fg hover:text-accent transition-colors">
            {next.title} &rarr;
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
