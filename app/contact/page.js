import Reveal from '@/components/Reveal';
import ContactForm from '@/components/ContactForm';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div>
      <Reveal>
        <h1 className="font-display font-bold text-3xl text-white">Contact</h1>
        <p className="mt-3 text-white/60 max-w-xl leading-relaxed">
          Have a project, a role, or just want to talk design? Send a message
          and I'll get back to you.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 max-w-lg">
          <ContactForm />
        </div>
      </Reveal>
    </div>
  );
}
