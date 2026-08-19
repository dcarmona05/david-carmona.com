import Link from 'next/link';

export const metadata = { title: 'Page Not Found' };

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm text-accent uppercase tracking-wide">404</p>
      <h1 className="mt-3 font-display font-bold text-3xl sm:text-4xl text-white">
        Page not found
      </h1>
      <p className="mt-3 text-white/60 max-w-md">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-accent text-black font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform"
      >
        Back to home
      </Link>
    </div>
  );
}
