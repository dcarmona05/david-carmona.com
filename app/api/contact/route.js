export async function POST(request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return Response.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

  if (!apiKey || !to) {
    console.error('Contact form submitted but RESEND_API_KEY or CONTACT_TO_EMAIL is not set.');
    return Response.json(
      { error: 'Contact form is not configured yet. Please email directly instead.' },
      { status: 503 }
    );
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error('Resend error:', data);
    return Response.json({ error: 'Failed to send message.' }, { status: 502 });
  }

  return Response.json({ ok: true });
}
