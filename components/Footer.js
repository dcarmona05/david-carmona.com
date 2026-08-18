import { siteConfig } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
        <div className="flex gap-6">
          <a href={siteConfig.github} className="hover:text-accent transition-colors">GitHub</a>
          <a href={siteConfig.linkedin} className="hover:text-accent transition-colors">LinkedIn</a>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-accent transition-colors">Email</a>
        </div>
      </div>
    </footer>
  );
}
