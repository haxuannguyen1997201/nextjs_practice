const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_TTL_SECONDS = 60 * 60 * 24;

interface SessionPayload {
  role: string;
  exp: number;
}

function getSessionSecret(): string | null {
  const value = process.env.SESSION_SECRET;
  if (!value) return null;

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function sign(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return new Uint8Array(signature);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function createSessionToken(role: string): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const payload: SessionPayload = {
    role: String(role ?? '').trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const payloadPart = toBase64Url(encodedPayload);
  const signaturePart = toBase64Url(await sign(payloadPart, secret));

  return `${payloadPart}.${signaturePart}`;
}

export async function verifySessionToken(token: string): Promise<{ role: string } | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = String(token ?? '').split('.');
  if (parts.length !== 2) return null;

  const [payloadPart, signaturePart] = parts;
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = await sign(payloadPart, secret);

  let tokenSignature: Uint8Array;
  try {
    tokenSignature = fromBase64Url(signaturePart);
  } catch {
    return null;
  }

  if (!constantTimeEqual(tokenSignature, expectedSignature)) return null;

  try {
    const payloadText = decoder.decode(fromBase64Url(payloadPart));
    const payload = JSON.parse(payloadText) as Partial<SessionPayload>;
    if (typeof payload.exp !== 'number') return null;
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;

    return { role: String(payload.role ?? '').trim().toLowerCase() };
  } catch {
    return null;
  }
}
