'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LockedForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/work-unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error('Incorrect password.');
      }

      const next = searchParams.get('next') || '/work';
      window.location.href = next;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
        Projects are under development
      </h1>
      <p className="mt-3 text-white/60 max-w-md">
        This section is being rebuilt. Enter the password to preview it.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="flex-1 rounded-md bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          placeholder="Password"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-black font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Checking…' : 'Unlock'}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
    </div>
  );
}

export default function LockedPage() {
  return (
    <Suspense fallback={null}>
      <LockedForm />
    </Suspense>
  );
}
