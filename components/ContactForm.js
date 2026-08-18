'use client';

import { useState } from 'react';

const initialForm = { name: '', email: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('sent');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-white/10 p-6">
        <p className="text-white/80">
          Thanks for reaching out — I'll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-accent hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm text-white/60 mb-1.5">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-white/60 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-white/60 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full rounded-md bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
          placeholder="What's on your mind?"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-accent">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-accent text-black font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
