import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { syncLogs } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.usuario) throw redirect(303, '/auth');

  const logs = await db
    .select()
    .from(syncLogs)
    .orderBy(desc(syncLogs.createdAt))
    .limit(50);

  return { logs };
};
