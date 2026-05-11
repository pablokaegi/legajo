import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { verifyPin } from '$lib/server/services/auth.js';
import { encodeSession } from '$lib/server/session.js';
import type { Actions } from './$types';

// ─── Rate limiter (persiste a través de HMR con globalThis) ──────────────────
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const LOCK_MS = LOCK_MINUTES * 60 * 1000;

interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

const _global = globalThis as typeof globalThis & { __legajoAttempts?: Map<string, AttemptRecord> };
const attempts: Map<string, AttemptRecord> = _global.__legajoAttempts ?? (_global.__legajoAttempts = new Map());

function getRateLimit(email: string): { blocked: boolean; retryInSec: number } {
  const now = Date.now();
  for (const [key, val] of attempts) {
    if (now > val.lockedUntil) attempts.delete(key);
  }
  const record = attempts.get(email);
  if (!record) return { blocked: false, retryInSec: 0 };
  if (now < record.lockedUntil) {
    return { blocked: true, retryInSec: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  return { blocked: false, retryInSec: 0 };
}

function recordFailedAttempt(email: string) {
  const now = Date.now();
  const existing = attempts.get(email);
  if (!existing || now > existing.lockedUntil) {
    attempts.set(email, { count: 1, lockedUntil: now + LOCK_MS * 0.1 });
    return;
  }
  existing.count += 1;
  existing.lockedUntil = existing.count >= MAX_ATTEMPTS ? now + LOCK_MS : now + LOCK_MS * 0.1;
}

// ─── Validación ───────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  pin: z.string().min(6, 'PIN mínimo 6 dígitos').max(8, 'PIN máximo 8 dígitos').regex(/^\d+$/, 'El PIN solo puede contener números')
});

export const actions: Actions = {
  login: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const raw = {
      email: formData.get('email'),
      pin: formData.get('pin')
    };

    const parsed = LoginSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return fail(400, {
        error: Object.values(errors).flat()[0] ?? 'Datos inválidos',
        email: String(raw.email ?? '')
      });
    }

    const email = parsed.data.email.toLowerCase();

    // ─── Rate limiting ────────────────────────────────────────────────────
    const { blocked, retryInSec } = getRateLimit(email);
    if (blocked) {
      const mins = Math.ceil(retryInSec / 60);
      return fail(429, {
        error: `Demasiados intentos. Esperá ${mins} minuto${mins > 1 ? 's' : ''}.`,
        email: parsed.data.email
      });
    }

    const docente = await verifyPin(email, parsed.data.pin);
    if (!docente) {
      recordFailedAttempt(email);
      const record = attempts.get(email);
      const remaining = Math.max(0, MAX_ATTEMPTS - (record?.count ?? 0));
      return fail(401, {
        error: `Email o PIN incorrecto. Intentos restantes: ${remaining}.`,
        email: parsed.data.email
      });
    }

    // Login exitoso → limpiar contador
    attempts.delete(email);

    const sessionValue = encodeSession(docente);
    cookies.set('legajo_session', sessionValue, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8
    });

    const redirectTo = url.searchParams.get('redirect') ?? '/';
    redirect(303, redirectTo);
  },

  logout: async ({ cookies }) => {
    cookies.delete('legajo_session', { path: '/' });
    redirect(303, '/auth');
  }
};
