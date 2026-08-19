export async function POST(request) {
  const { password } = await request.json();
  const correct = process.env.WORK_PREVIEW_PASSWORD;

  if (!correct || password !== correct) {
    return Response.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const cookie = `work_unlocked=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`;

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}
