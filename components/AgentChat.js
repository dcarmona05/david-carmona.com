'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { siteConfig } from '@/lib/site';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Hi! Ask me anything about ${siteConfig.name}'s background, experience, or skills.`,
};

function ChatHeader({ onMinimize, onExpand, onClose, isFull }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
      <span className="font-display font-medium text-white text-sm">Ask about {siteConfig.name}</span>
      <div className="flex items-center gap-3">
        {!isFull && onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Expand to full screen"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onMinimize}
          className="text-white/40 hover:text-white transition-colors"
          aria-label={isFull ? 'Dock chat' : 'Minimize chat'}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
            <path d="M5 12h14" />
          </svg>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function ChatBody({ messages, loading, scrollRef }) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
    >
      {messages.map((m, i) => (
        <div
          key={i}
          className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
            m.role === 'user' ? 'bg-accent text-black ml-auto' : 'bg-white/5 text-white/80'
          }`}
        >
          {m.content}
        </div>
      ))}
      {loading && (
        <div className="max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm bg-white/5 text-white/40">Thinking…</div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}

function ChatInput({ input, setInput, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/10 p-3 shrink-0">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question…"
        className="flex-1 bg-white/5 border border-white/15 rounded-md px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="bg-accent text-black text-sm font-medium px-3.5 py-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
}

export default function AgentChat() {
  const [view, setView] = useState('closed');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (view !== 'full') return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setView('docked');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m !== WELCOME_MESSAGE)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: data.error || 'Something went wrong.' }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {view === 'closed' && (
          <motion.button
            key="closed"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => setView('docked')}
            className="flex items-center gap-2 bg-accent text-black font-medium pl-4 pr-5 py-3 rounded-full shadow-lg hover:scale-[1.03] transition-transform"
          >
            <span className="w-2 h-2 rounded-full bg-black/70" />
            Ask me anything
          </motion.button>
        )}

        {view === 'docked' && (
          <motion.div
            key="docked"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="w-[360px] h-[500px] bg-[#0A0A0A] border border-white/15 rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            <ChatHeader
              onExpand={() => setView('full')}
              onMinimize={() => setView('closed')}
            />
            <ChatBody messages={messages} loading={loading} scrollRef={scrollRef} />
            <ChatInput input={input} setInput={setInput} onSubmit={sendMessage} loading={loading} />
          </motion.div>
        )}

        {view === 'full' && (
          <motion.div
            key="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0A0A0A] flex flex-col z-50"
          >
            <ChatHeader
              isFull
              onMinimize={() => setView('docked')}
              onClose={() => setView('closed')}
            />
            <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col overflow-hidden">
              <ChatBody messages={messages} loading={loading} scrollRef={scrollRef} />
              <ChatInput input={input} setInput={setInput} onSubmit={sendMessage} loading={loading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
