const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["alere/icono-192.png","alere/icono-512.png","alere/manifest.json","alere/marca.webp"]),
	mimeTypes: {".png":"image/png",".json":"application/json",".webp":"image/webp"},
	_: {
		client: {start:"_app/immutable/entry/start.jcwYBcDt.js",app:"_app/immutable/entry/app.PXc-0_Au.js",imports:["_app/immutable/entry/start.jcwYBcDt.js","_app/immutable/chunks/CQufHLrz.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/entry/app.PXc-0_Au.js","_app/immutable/chunks/2gc7-r09.js","_app/immutable/chunks/BpuoJQ0d.js","_app/immutable/chunks/DymAb4Hh.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DfYokR97.js')),
			__memo(() => import('./chunks/1-D1halRuY.js')),
			__memo(() => import('./chunks/2-bD7j3t8a.js')),
			__memo(() => import('./chunks/3-BA_EAUNT.js')),
			__memo(() => import('./chunks/4-D5hpC6ze.js')),
			__memo(() => import('./chunks/5-DpZ4KMpd.js')),
			__memo(() => import('./chunks/6-i-bebcey.js')),
			__memo(() => import('./chunks/7-pGLa9cwa.js')),
			__memo(() => import('./chunks/8-CJmg5VsN.js')),
			__memo(() => import('./chunks/9-CIBOUWPm.js')),
			__memo(() => import('./chunks/10-bs5oVrof.js')),
			__memo(() => import('./chunks/11-LDnpG4Qm.js')),
			__memo(() => import('./chunks/12-BOR4uloT.js')),
			__memo(() => import('./chunks/13-BcfPt198.js')),
			__memo(() => import('./chunks/14-D7mYZSsc.js')),
			__memo(() => import('./chunks/15-B3dtdHeH.js')),
			__memo(() => import('./chunks/16-qQgO0mMF.js')),
			__memo(() => import('./chunks/17-D-3zcqPZ.js')),
			__memo(() => import('./chunks/18-BOeiJUko.js')),
			__memo(() => import('./chunks/19-CdZpUtJ1.js')),
			__memo(() => import('./chunks/20-BEAMD9Oz.js').then(function (n) { return n._; })),
			__memo(() => import('./chunks/21-Ck4EYtFr.js')),
			__memo(() => import('./chunks/22-BRnN4DLH.js')),
			__memo(() => import('./chunks/23-Bwy6KLTF.js')),
			__memo(() => import('./chunks/24-BoVsJpm2.js')),
			__memo(() => import('./chunks/25-D2oF18du.js')),
			__memo(() => import('./chunks/26-69ACQ4AA.js')),
			__memo(() => import('./chunks/27-C7gQOIpB.js')),
			__memo(() => import('./chunks/28-D8qptX0x.js')),
			__memo(() => import('./chunks/29-DHPY0O4O.js')),
			__memo(() => import('./chunks/30-CESQzTsl.js')),
			__memo(() => import('./chunks/31-D7YO8bYO.js')),
			__memo(() => import('./chunks/32-DsC7zUWN.js')),
			__memo(() => import('./chunks/33-DD5m2zWQ.js')),
			__memo(() => import('./chunks/34-2i6FAXp2.js')),
			__memo(() => import('./chunks/35-BuDFtxCT.js')),
			__memo(() => import('./chunks/36-CHp_K35c.js')),
			__memo(() => import('./chunks/37-6I3Ic52u.js')),
			__memo(() => import('./chunks/38-9BrYrnX2.js')),
			__memo(() => import('./chunks/39-UI6CAvlM.js')),
			__memo(() => import('./chunks/40-C5yFtwDb.js')),
			__memo(() => import('./chunks/41-EKmQbAhH.js')),
			__memo(() => import('./chunks/42-CLphuZr2.js')),
			__memo(() => import('./chunks/43-CBsxwPhz.js')),
			__memo(() => import('./chunks/44-B3Wdu-Ut.js')),
			__memo(() => import('./chunks/45-Diz7Lyuh.js')),
			__memo(() => import('./chunks/46-D7VS9iqA.js')),
			__memo(() => import('./chunks/47-Dm7vfrYd.js')),
			__memo(() => import('./chunks/48-B5HLmF4j.js')),
			__memo(() => import('./chunks/49-RaI4CERM.js')),
			__memo(() => import('./chunks/50-BTjxIHir.js')),
			__memo(() => import('./chunks/51-Ggyegnnz.js')),
			__memo(() => import('./chunks/52-CEcOiYry.js')),
			__memo(() => import('./chunks/53-CMXoGXWK.js')),
			__memo(() => import('./chunks/54-0RnbCExD.js')),
			__memo(() => import('./chunks/55-BSPaPMXJ.js')),
			__memo(() => import('./chunks/56-BOlKSqoQ.js')),
			__memo(() => import('./chunks/57-BS6feTcC.js')),
			__memo(() => import('./chunks/58-DoJCCV5F.js')),
			__memo(() => import('./chunks/59-DDLXGpg6.js')),
			__memo(() => import('./chunks/60-CRTMudTw.js')),
			__memo(() => import('./chunks/61-Bsc855Ct.js')),
			__memo(() => import('./chunks/62-DOtRkVMe.js')),
			__memo(() => import('./chunks/63-C06hO75q.js')),
			__memo(() => import('./chunks/64-2jP-gm9E.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/conectados",
				pattern: /^\/admin\/conectados\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/status",
				pattern: /^\/admin\/status\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/usuarios",
				pattern: /^\/admin\/usuarios\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/agrupamientos",
				pattern: /^\/agrupamientos\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/agrupamientos/curso/[cursoId]",
				pattern: /^\/agrupamientos\/curso\/([^/]+?)\/?$/,
				params: [{"name":"cursoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/agrupamientos/nueva",
				pattern: /^\/agrupamientos\/nueva\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]",
				pattern: /^\/agrupamientos\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]/estadisticas",
				pattern: /^\/agrupamientos\/([^/]+?)\/estadisticas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]/resultados",
				pattern: /^\/agrupamientos\/([^/]+?)\/resultados\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]/votar",
				pattern: /^\/agrupamientos\/([^/]+?)\/votar\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/api/actas",
				pattern: /^\/api\/actas\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CmI-GEbj.js'))
			},
			{
				id: "/api/actas/[id]",
				pattern: /^\/api\/actas\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-A0UqYWxw.js'))
			},
			{
				id: "/api/amonestaciones",
				pattern: /^\/api\/amonestaciones\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BPXDvKBG.js'))
			},
			{
				id: "/api/bulk/observations",
				pattern: /^\/api\/bulk\/observations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CX9IzWLk.js'))
			},
			{
				id: "/api/export",
				pattern: /^\/api\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BjJliRJF.js'))
			},
			{
				id: "/api/faltas",
				pattern: /^\/api\/faltas\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-PeKmnB55.js'))
			},
			{
				id: "/api/health",
				pattern: /^\/api\/health\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-fNRuhQ9K.js'))
			},
			{
				id: "/api/jobs/[id]",
				pattern: /^\/api\/jobs\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BvqlDCdb.js'))
			},
			{
				id: "/api/moodle/cursos",
				pattern: /^\/api\/moodle\/cursos\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-ti8J1uE5.js'))
			},
			{
				id: "/api/moodle/cursos/[id]/alumnos",
				pattern: /^\/api\/moodle\/cursos\/([^/]+?)\/alumnos\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BAMmvFQC.js'))
			},
			{
				id: "/api/moodle/cursos/[id]/alumnos/[alumnoId]/notas",
				pattern: /^\/api\/moodle\/cursos\/([^/]+?)\/alumnos\/([^/]+?)\/notas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Zdl01E91.js'))
			},
			{
				id: "/api/moodle/status",
				pattern: /^\/api\/moodle\/status\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DQ0-iqeb.js'))
			},
			{
				id: "/api/observaciones",
				pattern: /^\/api\/observaciones\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DDXODfAI.js'))
			},
			{
				id: "/api/reincorporaciones",
				pattern: /^\/api\/reincorporaciones\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BXpuC3NV.js'))
			},
			{
				id: "/aula/oral",
				pattern: /^\/aula\/oral\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/aula/[cursoId]",
				pattern: /^\/aula\/([^/]+?)\/?$/,
				params: [{"name":"cursoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/auth",
				pattern: /^\/auth\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/autorizar/[token]",
				pattern: /^\/autorizar\/([^/]+?)\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/autorizar/[token]/archivo",
				pattern: /^\/autorizar\/([^/]+?)\/archivo\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Ctyc70Tb.js'))
			},
			{
				id: "/cursos",
				pattern: /^\/cursos\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/cursos/[id]",
				pattern: /^\/cursos\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/cursos/[id]/alumnos/[alumnoId]/notas",
				pattern: /^\/cursos\/([^/]+?)\/alumnos\/([^/]+?)\/notas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/derivar",
				pattern: /^\/derivar\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/gabinete",
				pattern: /^\/gabinete\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/gabinete/alumno/[alumnoId]",
				pattern: /^\/gabinete\/alumno\/([^/]+?)\/?$/,
				params: [{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/gabinete/aula-ciencias",
				pattern: /^\/gabinete\/aula-ciencias\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/gabinete/casos",
				pattern: /^\/gabinete\/casos\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/gabinete/casos/[id]",
				pattern: /^\/gabinete\/casos\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/gabinete/casos/[id]/informe",
				pattern: /^\/gabinete\/casos\/([^/]+?)\/informe\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/gabinete/curso/[cursoId]",
				pattern: /^\/gabinete\/curso\/([^/]+?)\/?$/,
				params: [{"name":"cursoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/gabinete/estadisticas",
				pattern: /^\/gabinete\/estadisticas\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/gabinete/estadisticas/csv",
				pattern: /^\/gabinete\/estadisticas\/csv\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BhgPXv2J.js'))
			},
			{
				id: "/gabinete/guia",
				pattern: /^\/gabinete\/guia\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/gabinete/informe",
				pattern: /^\/gabinete\/informe\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/institucional",
				pattern: /^\/institucional\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 38 },
				endpoint: null
			},
			{
				id: "/institucional/efemerides",
				pattern: /^\/institucional\/efemerides\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 39 },
				endpoint: null
			},
			{
				id: "/institucional/efemerides/nueva",
				pattern: /^\/institucional\/efemerides\/nueva\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 40 },
				endpoint: null
			},
			{
				id: "/institucional/efemerides/[id]",
				pattern: /^\/institucional\/efemerides\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 41 },
				endpoint: null
			},
			{
				id: "/institucional/salidas",
				pattern: /^\/institucional\/salidas\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 42 },
				endpoint: null
			},
			{
				id: "/institucional/salidas/nueva",
				pattern: /^\/institucional\/salidas\/nueva\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 43 },
				endpoint: null
			},
			{
				id: "/institucional/salidas/[id]",
				pattern: /^\/institucional\/salidas\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 44 },
				endpoint: null
			},
			{
				id: "/institucional/salidas/[id]/archivo",
				pattern: /^\/institucional\/salidas\/([^/]+?)\/archivo\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 45 },
				endpoint: null
			},
			{
				id: "/laboratorio/apoyos",
				pattern: /^\/laboratorio\/apoyos\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 46 },
				endpoint: null
			},
			{
				id: "/laboratorio/apoyos/fichas",
				pattern: /^\/laboratorio\/apoyos\/fichas\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 47 },
				endpoint: null
			},
			{
				id: "/laboratorio/apoyos/libro",
				pattern: /^\/laboratorio\/apoyos\/libro\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 48 },
				endpoint: null
			},
			{
				id: "/observaciones/historial",
				pattern: /^\/observaciones\/historial\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 49 },
				endpoint: null
			},
			{
				id: "/observaciones/nueva",
				pattern: /^\/observaciones\/nueva\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 50 },
				endpoint: null
			},
			{
				id: "/pizarra",
				pattern: /^\/pizarra\/?$/,
				params: [],
				page: { layouts: [0,6,], errors: [1,,], leaf: 51 },
				endpoint: null
			},
			{
				id: "/pizarra/[cursoId]",
				pattern: /^\/pizarra\/([^/]+?)\/?$/,
				params: [{"name":"cursoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,6,], errors: [1,,], leaf: 52 },
				endpoint: null
			},
			{
				id: "/preceptor",
				pattern: /^\/preceptor\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 53 },
				endpoint: null
			},
			{
				id: "/preceptor/actas",
				pattern: /^\/preceptor\/actas\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 54 },
				endpoint: null
			},
			{
				id: "/preceptor/actas/nueva",
				pattern: /^\/preceptor\/actas\/nueva\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 55 },
				endpoint: null
			},
			{
				id: "/preceptor/actas/[id]",
				pattern: /^\/preceptor\/actas\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,7,], errors: [1,,], leaf: 56 },
				endpoint: null
			},
			{
				id: "/preceptor/amonestaciones",
				pattern: /^\/preceptor\/amonestaciones\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 57 },
				endpoint: null
			},
			{
				id: "/preceptor/amonestaciones/nueva",
				pattern: /^\/preceptor\/amonestaciones\/nueva\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 58 },
				endpoint: null
			},
			{
				id: "/preceptor/faltas",
				pattern: /^\/preceptor\/faltas\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 59 },
				endpoint: null
			},
			{
				id: "/preceptor/faltas/nueva",
				pattern: /^\/preceptor\/faltas\/nueva\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 60 },
				endpoint: null
			},
			{
				id: "/preceptor/legajo/[alumnoId]",
				pattern: /^\/preceptor\/legajo\/([^/]+?)\/?$/,
				params: [{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,7,], errors: [1,,], leaf: 61 },
				endpoint: null
			},
			{
				id: "/preceptor/reincorporaciones",
				pattern: /^\/preceptor\/reincorporaciones\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 62 },
				endpoint: null
			},
			{
				id: "/preceptor/reincorporaciones/nueva",
				pattern: /^\/preceptor\/reincorporaciones\/nueva\/?$/,
				params: [],
				page: { layouts: [0,7,], errors: [1,,], leaf: 63 },
				endpoint: null
			},
			{
				id: "/votar/[token]",
				pattern: /^\/votar\/([^/]+?)\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 64 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
