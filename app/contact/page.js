import Reveal from '@/components/Reveal';
import ContactForm from '@/components/ContactForm';
import CalEmbed from '@/components/CalEmbed';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div>
      <Reveal>
        <h1 className="font-display font-bold text-3xl text-white">Contact</h1>
        <p className="mt-3 text-white/60 max-w-xl leading-relaxed">
          Have a project, a role, or just want to talk design? Send a message,
          or grab time directly on my calendar.
        </p>
      </Reveal>

      <div className="mt-10 grid lg:grid-cols-2 gap-10">
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.15}>
          <CalEmbed />
        </Reveal>
      </div>
    </div>
  );
}
