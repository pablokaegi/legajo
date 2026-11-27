import { error, fail, redirect } from '@sveltejs/kit';
import {
  listarUsuariosConRoles,
  crearUsuario,
  actualizarRoles,
  actualizarCursosDeRol,
  resetearPin,
  cambiarActivo,
  ROLES_GESTIONABLES,
  PIN_VALIDO,
  EMAIL_VALIDO
} from '$lib/server/services/usuarios.js';
import { registrarAccion, ipDe } from '$lib/server/services/audit.js';
import { listarCursos } from '$lib/server/services/cursos.js';
import type { RolNombre } from '$lib/server/db/schema.js';
import type { PageServerLoad, Actions } from './$types';

// Las actions no corren el layout: cada una verifica admin.
function exigirAdmin(usuario: App.Locals['usuario']): number {
  if (!usuario) throw redirect(303, '/auth');
  if (!usuario.roles.includes('admin')) error(403, 'Solo administradores.');
  return usuario.usuarioId;
}

function rolesDelForm(fd: FormData): RolNombre[] {
  const pedidos = fd.getAll('rol').map(String);
  return ROLES_GESTIONABLES.filter((r) => pedidos.includes(r));
}

export const load: PageServerLoad = async ({ locals }) => {
  const yoId = exigirAdmin(locals.usuario);
  const [usuarios, cursos] = await Promise.all([listarUsuariosConRoles(), listarCursos().catch(() => null)]);
  return {
    usuarios,
    cursos: cursos?.map((c) => ({ id: c.id, nombre: c.displayname || c.fullname })) ?? null,
    rolesDisponibles: ROLES_GESTIONABLES,
    yoId
  };
};

export const actions: Actions = {
  crear: async ({ request, locals }) => {
    const adminId = exigirAdmin(locals.usuario);
    const fd = await request.formData();
    const nombre = String(fd.get('nombre') ?? '').trim().slice(0, 100);
    const email = String(fd.get('email') ?? '').trim().toLowerCase();
    const pin = String(fd.get('pin') ?? '').trim();
    const roles = rolesDelForm(fd);
    if (!nombre) return fail(400, { error: 'Falta el nombre.' });
    if (!EMAIL_VALIDO.test(email)) return fail(400, { error: 'Email inválido.' });
    if (!PIN_VALIDO.test(pin)) return fail(400, { error: 'El PIN tiene que tener entre 6 y 8 dígitos.' });
    if (roles.length === 0) return fail(400, { error: 'Elegí al menos un rol.' });
    try {
      const id = await crearUsuario({ nombre, email, pin, roles });
      await registrarAccion({
        usuarioId: adminId, accion: 'usuario.crear', tablaDestino: 'usuarios', idDestino: id,
        payload: { email, roles }, ip: ipDe(request)
      });
    } catch (e) {
      const code = (e as { code?: string; cause?: { code?: string } })?.code ??
        (e as { cause?: { code?: string } })?.cause?.code;
      if (code === 'ER_DUP_ENTRY') return fail(400, { error: 'Ya existe una cuenta con ese email.' });
      throw e;
    }
    return { ok: `Cuenta creada para ${email}.` };
  },

  roles: async ({ request, locals }) => {
    const adminId = exigirAdmin(locals.usuario);
    const fd = await request.formData();
    const usuarioId = Number(fd.get('usuarioId'));
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: 'Usuario inválido.' });
    const roles = rolesDelForm(fd);
    if (usuarioId === adminId && !roles.includes('admin'))
      return fail(400, { error: 'No podés quitarte a vos mismo el rol de admin.' });
    const cambios = await actualizarRoles(usuarioId, roles);
    await registrarAccion({
      usuarioId: adminId, accion: 'usuario.roles', tablaDestino: 'usuarios', idDestino: usuarioId,
      payload: cambios, ip: ipDe(request)
    });
    return { ok: 'Roles actualizados.' };
  },

  cursos: async ({ request, locals }) => {
    const adminId = exigirAdmin(locals.usuario);
    const fd = await request.formData();
    const usuarioId = Number(fd.get('usuarioId'));
    const rol = fd.get('rol');
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: 'Usuario inválido.' });
    if (rol !== 'docente' && rol !== 'preceptor') return fail(400, { error: 'Rol inválido.' });
    const institucional = rol === 'preceptor' && fd.get('institucional') === '1';
    const ids = institucional ? [] : [...new Set(fd.getAll('curso').map(Number))];
    if (rol === 'preceptor' && !institucional && ids.length === 0)
      return fail(400, { error: 'Elegí algún curso o indicá expresamente acceso institucional.' });
    if (ids.length) {
      const cursos = await listarCursos().catch(() => null);
      if (cursos === null) return fail(503, { error: 'No se pudo verificar los cursos en Moodle.' });
      const disponibles = new Set(cursos.map((c) => c.id));
      if (ids.some((id) => !disponibles.has(id))) return fail(400, { error: 'Hay cursos inválidos.' });
    }
    if (!(await actualizarCursosDeRol(usuarioId, rol, ids)))
      return fail(400, { error: 'La cuenta debe tener ese rol.' });
    await registrarAccion({
      usuarioId: adminId, accion: 'usuario.cursos', tablaDestino: 'usuarios', idDestino: usuarioId,
      payload: { rol, cursos: ids, institucional }, ip: ipDe(request)
    });
    return { ok: 'Alcance actualizado.' };
  },

  pin: async ({ request, locals }) => {
    const adminId = exigirAdmin(locals.usuario);
    const fd = await request.formData();
    const usuarioId = Number(fd.get('usuarioId'));
    const pin = String(fd.get('pin') ?? '').trim();
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: 'Usuario inválido.' });
    if (!PIN_VALIDO.test(pin)) return fail(400, { error: 'El PIN tiene que tener entre 6 y 8 dígitos.' });
    await resetearPin(usuarioId, pin);
    await registrarAccion({
      usuarioId: adminId, accion: 'usuario.reset_pin', tablaDestino: 'usuarios', idDestino: usuarioId,
      ip: ipDe(request)
    });
    if (usuarioId === adminId) throw redirect(303, '/auth'); // su propia sesión se cerró
    return { ok: 'PIN actualizado. Las sesiones abiertas de esa cuenta se cerraron.' };
  },

  activo: async ({ request, locals }) => {
    const adminId = exigirAdmin(locals.usuario);
    const fd = await request.formData();
    const usuarioId = Number(fd.get('usuarioId'));
    const activo = fd.get('activo') === '1';
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) return fail(400, { error: 'Usuario inválido.' });
    if (usuarioId === adminId && !activo) return fail(400, { error: 'No podés desactivar tu propia cuenta.' });
    await cambiarActivo(usuarioId, activo);
    await registrarAccion({
      usuarioId: adminId, accion: activo ? 'usuario.activar' : 'usuario.desactivar',
      tablaDestino: 'usuarios', idDestino: usuarioId, ip: ipDe(request)
    });
    return { ok: activo ? 'Cuenta activada.' : 'Cuenta desactivada y sesiones cerradas.' };
  }
};
