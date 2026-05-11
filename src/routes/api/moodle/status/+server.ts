import { json } from '@sveltejs/kit';
import { moodle } from '$lib/server/moodle/client.js';
import { toMoodleErrorMessage } from '$lib/server/moodle/errors.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.docente) {
    return json({ error: 'No autorizado' }, { status: 401 });
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
      // Lista de funciones habilitadas en el token actual
      funcionesHabilitadas: info.functions.map(f => f.name).sort(),
      // Verificar cuáles de las que Legajo necesita están disponibles
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
