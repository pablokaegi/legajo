import { json } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.usuario) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }
  if (!locals.usuario.roles.includes('admin')) {
    return json({ error: 'Acceso restringido a administradores' }, { status: 403 });
  }

  try {
    const info = await moodle.getSiteInfo();

    return json({
      ok: true,
      sitename: info.sitename,
      siteurl: info.siteurl,
      moodleVersion: info.release,
      connectedAs: {
        userid: info.userid,
        username: info.username,
        fullname: `${info.firstname} ${info.lastname}`
      },
      funcionesHabilitadas: info.functions.map(f => f.name).sort(),
      legajoFunctions: {
        'core_webservice_get_site_info': info.functions.some(f => f.name === 'core_webservice_get_site_info'),
        'core_course_get_courses': info.functions.some(f => f.name === 'core_course_get_courses'),
        'core_enrol_get_enrolled_users': info.functions.some(f => f.name === 'core_enrol_get_enrolled_users'),
        'core_user_get_users': info.functions.some(f => f.name === 'core_user_get_users')
      }
    });
  } catch (err) {
    return json(
      { ok: false, error: toMoodleErrorMessage(err) },
      { status: 503 }
    );
  }
};
