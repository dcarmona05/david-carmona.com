import { buildSystemPrompt } from '@/lib/agentContext';

export async function POST(request) {
  const { messages } = await request.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'No messages provided.' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.error('Chat widget used but OPENAI_API_KEY is not set.');
    return Response.json(
      { error: "This assistant isn't connected yet — please reach out directly via the contact page." },
      { status: 503 }
    );
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages],
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error('OpenAI error:', data);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || "I'm not sure how to answer that.";

  return Response.json({ reply });
}
