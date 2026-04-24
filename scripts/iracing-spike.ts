/**
 * iRacing Data API spike — minimal smoketest.
 *
 * Kör: `bun run spike:iracing`
 * Kräver IRACING_EMAIL + IRACING_PASSWORD i .env.
 *
 * Mål: verifiera att vi kan autentisera och hämta data från members-ng.iracing.com.
 */
import crypto from 'node:crypto';

const BASE = 'https://members-ng.iracing.com';

function encodePassword(password: string, email: string): string {
  return crypto.createHash('sha256').update(password + email.toLowerCase()).digest('base64');
}

async function authenticate(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: encodePassword(password, email) }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Auth HTTP ${res.status}: ${JSON.stringify(body)}`);
  }
  if (body.authcode === 0) {
    throw new Error(`Auth rejected: ${JSON.stringify(body)}`);
  }

  const setCookies = res.headers.getSetCookie();
  if (!setCookies.length) throw new Error('Inga cookies returnerades från /auth');

  return setCookies.map((c) => c.split(';')[0]).join('; ');
}

async function fetchJson(url: string, cookie: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Cookie: cookie } });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function main(): Promise<void> {
  const email = process.env.IRACING_EMAIL;
  const password = process.env.IRACING_PASSWORD;

  if (!email || !password) {
    console.error('Saknar IRACING_EMAIL eller IRACING_PASSWORD (lägg i .env)');
    process.exit(1);
  }

  console.log(`Autentiserar som ${email}...`);
  const cookie = await authenticate(email, password);
  console.log('OK — autentiserad');

  console.log('\nGET /data/member/info...');
  const info = await fetchJson(`${BASE}/data/member/info`, cookie);
  console.log(JSON.stringify(info, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
