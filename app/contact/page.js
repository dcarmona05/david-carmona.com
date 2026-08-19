import Reveal from '@/components/Reveal';
import ContactForm from '@/components/ContactForm';
import CalEmbed from '@/components/CalEmbed';
import TopoBackground from '@/components/TopoBackground';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch about a project, a role, or just to talk design.',
};

export default function ContactPage() {
  return (
    <div>
      <TopoBackground />
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
