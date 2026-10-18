import Link from 'next/link';
import Reveal from '@/components/Reveal';
import VideoDemo from '@/components/VideoDemo';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import RoleResponsibilities from '@/components/RoleResponsibilities';
import { getWorkBySlug, getNextWork } from '@/lib/work';

const item = getWorkBySlug('otto-for-contact-center');

export function generateMetadata() {
  return { title: item.title };
}

function Tag({ color, children }) {
  const colorClass = { lime: 'text-accent2', cyan: 'text-accent3', neutral: 'text-white/50' }[color];
  return <span className={`text-[10px] font-mono uppercase tracking-wide ${colorClass}`}>{children}</span>;
}

function FlowStep({ who, color, title, children }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 min-w-[180px] shrink-0">
      <Tag color={color}>{who}</Tag>
      <p className="mt-1.5 font-display text-white">{title}</p>
      <p className="mt-1 text-sm text-white/50 leading-snug">{children}</p>
    </div>
  );
}

function SourceStat({ value, children, source }) {
  return (
    <div className="rounded-lg border border-white/10 p-6">
      <p className="font-display text-4xl text-accent2">{value}</p>
      <p className="mt-2 text-white/70 leading-snug">{children}</p>
      <p className="mt-3 text-xs text-white/35">{source}</p>
    </div>
  );
}

export default function OttoCaseStudyPage() {
  const next = getNextWork(item.slug);

  return (
    <div>
      <Reveal>
        <Link href="/work" className="text-sm text-white/60 hover:text-accent transition-colors">
          &larr; All work
        </Link>

        <div className="relative mt-6 aspect-[16/8] rounded-lg overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.heroImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          <span className="absolute top-4 left-4 text-xs uppercase tracking-wide text-white/80 bg-black/30 rounded-full px-3 py-1">
            {item.company} &middot; {item.category}
          </span>

          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">{item.title}</h1>
            <p className="mt-1 text-white/70">{item.role} &middot; {item.timeline}</p>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-lg text-white/70 leading-relaxed">{item.description}</p>
      </Reveal>

      <Reveal delay={0.04}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">My Role &amp; Responsibilities</h2>
          <div className="mt-6 max-w-2xl">
            <RoleResponsibilities role={item.role} responsibilities={item.responsibilities} />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">Watch It In Action</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
            A 2:30 concept film of the experience, written and directed for ServiceNow&apos;s VP and
            Director-level Design and Product leadership.
          </p>
          <div className="mt-6 max-w-3xl">
            <VideoDemo videoUrl={item.videoUrl} />
          </div>
        </section>
      </Reveal>

      {/* Who it's for */}
      <Reveal delay={0.06}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">Who This Is For</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
            The demo scenario&apos;s persona, used to walk through the experience end-to-end.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-start gap-6 rounded-lg border border-white/10 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/work/otto-contact-center/samantha-avatar.png"
              alt="Samantha Lee, the banker persona"
              className="w-28 h-28 rounded-full object-cover shrink-0 bg-white/5"
            />
            <div>
              <p className="font-display text-lg text-white">Samantha Lee</p>
              <p className="text-sm text-white/50">Banker, Alectri Bank</p>
              <p className="mt-3 text-white/70 leading-relaxed max-w-xl">
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
        <section className="mt-16 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-xl text-white">What It Is</h2>
            <p className="mt-3 text-white/70 leading-relaxed">{item.overview}</p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              'Real-time call-script suggestions that keep pace with what the customer is saying',
              'Identity verification, confirmed from what the customer says out loud',
              'Step-up authentication (one-time passcode or app approval) before anything moves',
              'A Customer 360 view: history, accounts, and a live transcript, one click away',
              'An AI-drafted call summary and coaching notes the banker edits and confirms',
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-white/10 p-4">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent2 shrink-0" />
                <span className="text-white/70 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* Why we built it */}
      <Reveal delay={0.08}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">Why We Built It</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
            Most AI copilots bolt onto an existing, form-first workspace as one more card. A live call
            doesn&apos;t work that way.
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 p-5">
              <Tag color="neutral">Omni-channel today</Tag>
              <p className="mt-2 text-white/70 leading-relaxed">
                The AI is one card among forms, tabs, and channels &mdash; something the banker has to
                remember to check.
              </p>
            </div>
            <div className="rounded-lg border border-accent3/30 bg-accent3/5 p-5">
              <Tag color="cyan">Live call &middot; this study</Tag>
              <p className="mt-2 text-white/70 leading-relaxed">
                Otto leads the main column &mdash; what to say next, right in the flow the banker is
                already reading.
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/40 italic">
            Built for a call that moves in real time: the banker reads one place while talking.
          </p>
        </section>
      </Reveal>

      {/* One conversation, four tracks at once */}
      <Reveal delay={0.09}>
        <section className="mt-16">
          <h3 className="font-display text-lg text-white">One Conversation, Four Tracks at Once</h3>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
            Customer, Otto, and the banker are all moving at the same time &mdash; and the customer
            doesn&apos;t follow a script.
          </p>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            <FlowStep who="Customer" color="lime" title="Stop payment">
              Daniel calls about a check that never arrived.
            </FlowStep>
            <FlowStep who="Otto" color="cyan" title="Intent">
              Recognizes a stop-payment request.
            </FlowStep>
            <FlowStep who="Banker" color="neutral" title="Greet & verify">
              Welcomes him and asks him to verify.
            </FlowStep>
            <FlowStep who="Otto" color="cyan" title="Identity">
              Confirms who he is from what he says.
            </FlowStep>
            <FlowStep who="Banker" color="neutral" title="Check details">
              Gathers the amount, date, and check number.
            </FlowStep>
            <FlowStep who="Customer" color="lime" title={'"Also… my paycheck?"'}>
              An off-script question, mid-task.
            </FlowStep>
            <FlowStep who="Otto" color="cyan" title="Recommended action">
              Surfaces the deposit answer without taking over.
            </FlowStep>
            <FlowStep who="Banker" color="neutral" title="Answer deposit">
              Resolves the side question, then returns to the task.
            </FlowStep>
          </div>
          <p className="mt-3 text-sm text-white/40 italic">
            Customers don&apos;t follow a script. Success depends on how well Otto reacts.
          </p>
        </section>
      </Reveal>

      {/* Same call without Otto */}
      <Reveal delay={0.1}>
        <section className="mt-16 rounded-lg border border-white/10 p-6 sm:p-8">
          <h3 className="font-display text-lg text-white">The Same Call, Without Otto</h3>
          <p className="mt-3 text-white/70 leading-relaxed max-w-2xl">
            Walking the same scenario without Otto takes more screens and more holds: the banker
            switches between a profile, accounts, check search, deposits, and a policy doc by hand,
            putting the customer on hold twice along the way. With Otto, the call wraps in roughly
            the time it takes to get through the stop-payment request once.
          </p>
          <p className="mt-3 text-sm text-white/40 italic">
            More screens, more holds, a longer call. The banker carries every track alone. (Illustrative
            walkthrough comparison, not a measured study result.)
          </p>
        </section>
      </Reveal>

      {/* Why this matters - external research */}
      <Reveal delay={0.11}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">Why This Matters</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
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
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">How It&apos;s Built</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-white/15 px-4 py-1.5 text-white/70">LLM <span className="text-white/35">thinks</span></span>
            <span className="text-white/25">&rarr;</span>
            <span className="rounded-full border border-white/15 px-4 py-1.5 text-white/70">ElevenLabs <span className="text-white/35">speaks</span></span>
            <span className="text-white/25">&rarr;</span>
            <span className="rounded-full border border-accent3/40 bg-accent3/5 px-4 py-1.5 text-white">Otto <span className="text-white/35">guides</span></span>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-white/60 max-w-2xl">
            <li>&middot; Lit web components + Vite, on ServiceNow&apos;s Horizon 2.0 design tokens and components</li>
            <li>&middot; An LLM plays the customer on a live call and drafts the banker&apos;s call-script suggestions</li>
            <li>&middot; ElevenLabs voices the simulated customer; the banker&apos;s own mic runs on the browser&apos;s native Web Speech API</li>
            <li>&middot; Falls back to a scripted, deterministic call automatically if no AI keys are configured</li>
          </ul>
          <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-xl">
            <div className="rounded-lg border border-white/10 p-5">
              <p className="font-display text-3xl text-accent2">1</p>
              <p className="mt-1 text-sm text-white/60">designer + AI, no engineers</p>
            </div>
            <div className="rounded-lg border border-white/10 p-5">
              <p className="font-display text-3xl text-accent2">1000+</p>
              <p className="mt-1 text-sm text-white/60">changes to the prototype</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* What we learned */}
      <Reveal delay={0.13}>
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">What We Learned From the Study</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">
            Real findings from banker research sessions run on this prototype over Zoom.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-white/10 p-5">
              <Tag color="lime">01</Tag>
              <p className="mt-2 font-display text-white">Listen, talk, read</p>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                Bankers listen first. Anything they have to read mid-call gets missed, so Otto has to
                be brief and show up where they&apos;re already looking.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-5">
              <Tag color="lime">02</Tag>
              <p className="mt-2 font-display text-white">Timing</p>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                Otto helps when it&apos;s a step ahead. When the customer got there first, the
                suggestion felt backwards and bankers went their own way.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-5">
              <Tag color="lime">03</Tag>
              <p className="mt-2 font-display text-white">Off-script moments</p>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                Bankers go off script, often for good reasons. Otto has to follow them, not pull them
                back.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/40 italic">
            Next: we changed the prototype after each session. We&apos;re now testing the same help in chat.
          </p>
        </section>
      </Reveal>

      {/* Where it lives */}
      <Reveal delay={0.14}>
        <section className="mt-16 rounded-lg border border-white/10 p-6 sm:p-8">
          <h2 className="font-display text-xl text-white">Where It Lives, and Why</h2>
          <p className="mt-3 text-white/70 leading-relaxed max-w-2xl">
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
        <section className="mt-16">
          <h2 className="font-display text-xl text-white">Product Walkthrough</h2>
          <p className="mt-2 text-sm text-white/40 max-w-2xl">Real screens from the working prototype.</p>
          <div className="mt-6">
            <ScreenshotGallery screenshots={item.screenshots} />
          </div>
        </section>
      </Reveal>

      {item.outcome && (
        <Reveal delay={0.16}>
          <section className="mt-16">
            <h2 className="font-display text-xl text-white">Outputs &amp; Impact</h2>
            <blockquote className="mt-4 max-w-2xl border-l-2 border-accent pl-6">
              <p className="font-display text-xl sm:text-2xl text-white leading-snug">{item.outcome}</p>
            </blockquote>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.2}>
        <div className="mt-20 pt-8 border-t border-white/10 flex items-baseline justify-between">
          <span className="text-sm text-white/40">Next project</span>
          <Link href={`/work/${next.slug}`} className="font-display text-white hover:text-accent transition-colors">
            {next.title} &rarr;
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
