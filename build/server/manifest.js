const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["imagenes/fondo/SchoolSPbyBarsrsind.png","imagenes/PNG/480px/001-studying.png","imagenes/PNG/480px/002-studying.png","imagenes/PNG/480px/003-studying.png","imagenes/PNG/480px/004-education.png","imagenes/PNG/480px/005-books.png","imagenes/PNG/480px/006-test.png","imagenes/PNG/480px/007-pencil case.png","imagenes/PNG/480px/008-maths.png","imagenes/PNG/480px/009-exam.png","imagenes/PNG/480px/010-books.png","imagenes/PNG/480px/011-book.png","imagenes/PNG/480px/012-books.png","imagenes/PNG/480px/013-book.png","imagenes/PNG/480px/014-online education.png","imagenes/PNG/480px/015-notebook.png","imagenes/PNG/480px/016-exam.png","imagenes/PNG/480px/017-maths.png","imagenes/PNG/480px/018-study.png","imagenes/PNG/480px/019-books.png","imagenes/PNG/480px/020-studying.png","imagenes/PNG/480px/attendance-mark_hires.png","imagenes/PNG/480px/batch-assign_hires.png","imagenes/PNG/480px/book-and-pencil_hires.png","imagenes/PNG/480px/book-reading_hires.png","imagenes/PNG/480px/broken-pencil_hires.png","imagenes/PNG/480px/classroom_hires.png","imagenes/PNG/480px/class_hires.png","imagenes/PNG/480px/conditionals-1_hires.png","imagenes/PNG/480px/conditionals-2_hires.png","imagenes/PNG/480px/conditionals-3_hires.png","imagenes/PNG/480px/contract_hires.png","imagenes/PNG/480px/copy-off_hires.png","imagenes/PNG/480px/course-assign_hires.png","imagenes/PNG/480px/critical-thinking_hires.png","imagenes/PNG/480px/curriculum_hires.png","imagenes/PNG/480px/diploma_hires.png","imagenes/PNG/480px/e-learning-2_hires.png","imagenes/PNG/480px/e-learning_hires.png","imagenes/PNG/480px/education_hires.png","imagenes/PNG/480px/exam_hires.png","imagenes/PNG/480px/file-2_hires.png","imagenes/PNG/480px/flashcards_hires.png","imagenes/PNG/480px/flip-chart_hires.png","imagenes/PNG/480px/flipboard_hires.png","imagenes/PNG/480px/flying-motarboard_hires.png","imagenes/PNG/480px/glossary_hires.png","imagenes/PNG/480px/gpa-calculator_hires.png","imagenes/PNG/480px/grades_hires.png","imagenes/PNG/480px/graduation-cap_hires.png","imagenes/PNG/480px/graduation-scroll_hires.png","imagenes/PNG/480px/homework_hires.png","imagenes/PNG/480px/idea-sharing_hires.png","imagenes/PNG/480px/interactive-whiteboard_hires.png","imagenes/PNG/480px/internship_hires.png","imagenes/PNG/480px/knowledge-sharing_hires.png","imagenes/PNG/480px/knowledge-transfer_hires.png","imagenes/PNG/480px/learn-information_hires.png","imagenes/PNG/480px/library_hires.png","imagenes/PNG/480px/licence_hires.png","imagenes/PNG/480px/machine-learning_hires.png","imagenes/PNG/480px/mba_hires.png","imagenes/PNG/480px/motarboard_hires.png","imagenes/PNG/480px/noticeboard_hires.png","imagenes/PNG/480px/online-group-studying_hires.png","imagenes/PNG/480px/parent-guardian_hires.png","imagenes/PNG/480px/psychology_hires.png","imagenes/PNG/480px/reading-ebook_hires.png","imagenes/PNG/480px/reading_hires.png","imagenes/PNG/480px/report-card_hires.png","imagenes/PNG/480px/school-director_hires.png","imagenes/PNG/480px/school-locker_hires.png","imagenes/PNG/480px/socrates_hires.png","imagenes/PNG/480px/student-center_hires.png","imagenes/PNG/480px/student-female_hires.png","imagenes/PNG/480px/student-male_hires.png","imagenes/PNG/480px/student-registration_hires.png","imagenes/PNG/480px/students_hires.png","imagenes/PNG/480px/Study_futuristic_element1.png","imagenes/PNG/480px/Study_futuristic_element10.png","imagenes/PNG/480px/Study_futuristic_element11.png","imagenes/PNG/480px/Study_futuristic_element12.png","imagenes/PNG/480px/Study_futuristic_element13.png","imagenes/PNG/480px/Study_futuristic_element14.png","imagenes/PNG/480px/Study_futuristic_element15.png","imagenes/PNG/480px/Study_futuristic_element16.png","imagenes/PNG/480px/Study_futuristic_element17.png","imagenes/PNG/480px/Study_futuristic_element18.png","imagenes/PNG/480px/Study_futuristic_element19.png","imagenes/PNG/480px/Study_futuristic_element2.png","imagenes/PNG/480px/Study_futuristic_element20.png","imagenes/PNG/480px/Study_futuristic_element21.png","imagenes/PNG/480px/Study_futuristic_element22.png","imagenes/PNG/480px/Study_futuristic_element23.png","imagenes/PNG/480px/Study_futuristic_element24.png","imagenes/PNG/480px/Study_futuristic_element25.png","imagenes/PNG/480px/Study_futuristic_element26.png","imagenes/PNG/480px/Study_futuristic_element27.png","imagenes/PNG/480px/Study_futuristic_element28.png","imagenes/PNG/480px/Study_futuristic_element29.png","imagenes/PNG/480px/Study_futuristic_element3.png","imagenes/PNG/480px/Study_futuristic_element30.png","imagenes/PNG/480px/Study_futuristic_element31.png","imagenes/PNG/480px/Study_futuristic_element32.png","imagenes/PNG/480px/Study_futuristic_element33.png","imagenes/PNG/480px/Study_futuristic_element34.png","imagenes/PNG/480px/Study_futuristic_element35.png","imagenes/PNG/480px/Study_futuristic_element36.png","imagenes/PNG/480px/Study_futuristic_element37.png","imagenes/PNG/480px/Study_futuristic_element38.png","imagenes/PNG/480px/Study_futuristic_element39.png","imagenes/PNG/480px/Study_futuristic_element4.png","imagenes/PNG/480px/Study_futuristic_element40.png","imagenes/PNG/480px/Study_futuristic_element5.png","imagenes/PNG/480px/Study_futuristic_element6.png","imagenes/PNG/480px/Study_futuristic_element7.png","imagenes/PNG/480px/Study_futuristic_element8.png","imagenes/PNG/480px/Study_futuristic_element9.png","imagenes/PNG/480px/teacher-hirring_hires.png","imagenes/PNG/480px/teacher_hires.png","imagenes/PNG/480px/teaching_hires.png","imagenes/PNG/480px/test-cheating_hires.png","imagenes/PNG/480px/training_hires.png","imagenes/PNG/480px/university_hires.png","logo-pds.png","manifest.json"]),
	mimeTypes: {".png":"image/png",".json":"application/json"},
	_: {
		client: {start:"_app/immutable/entry/start.DFIn_6WP.js",app:"_app/immutable/entry/app.BT94AlUk.js",imports:["_app/immutable/entry/start.DFIn_6WP.js","_app/immutable/chunks/CdpVQA3m.js","_app/immutable/chunks/DegnJ6pp.js","_app/immutable/entry/app.BT94AlUk.js","_app/immutable/chunks/DegnJ6pp.js","_app/immutable/chunks/DxxW8M2i.js","_app/immutable/chunks/DYR6MKK2.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-pyAAfgnD.js')),
			__memo(() => import('./chunks/1-lUkJVhOi.js')),
			__memo(() => import('./chunks/2-C_EVq5Dg.js')),
			__memo(() => import('./chunks/3-DmGIRekq.js')),
			__memo(() => import('./chunks/4-Ca6K1oZ_.js')),
			__memo(() => import('./chunks/5-D3EDssKv.js')),
			__memo(() => import('./chunks/6-WTQoSaL_.js')),
			__memo(() => import('./chunks/7-BA8ompF_.js')),
			__memo(() => import('./chunks/8-BMwFh9Im.js')),
			__memo(() => import('./chunks/9-Dc92yo9F.js')),
			__memo(() => import('./chunks/10-r-Wig-ZB.js')),
			__memo(() => import('./chunks/11-Cw35matW.js')),
			__memo(() => import('./chunks/12-lyEGyL_B.js')),
			__memo(() => import('./chunks/13-CHIzBEd_.js')),
			__memo(() => import('./chunks/14-8HPi3Yc_.js')),
			__memo(() => import('./chunks/15-Bpvx0uwk.js')),
			__memo(() => import('./chunks/16-DLylDu-H.js')),
			__memo(() => import('./chunks/17-rDbAaftG.js')),
			__memo(() => import('./chunks/18-DeDTk9Xk.js')),
			__memo(() => import('./chunks/19-CptwzQkk.js')),
			__memo(() => import('./chunks/20-CAyBZsxA.js')),
			__memo(() => import('./chunks/21-4lggfp-A.js')),
			__memo(() => import('./chunks/22-Dn7EZxCn.js')),
			__memo(() => import('./chunks/23-pxBWaS_9.js')),
			__memo(() => import('./chunks/24-BK2WIfpR.js')),
			__memo(() => import('./chunks/25-WK5HrQOK.js')),
			__memo(() => import('./chunks/26-Im-MGDYR.js')),
			__memo(() => import('./chunks/27-D2TDna2E.js')),
			__memo(() => import('./chunks/28-DE0WaiBi.js')),
			__memo(() => import('./chunks/29-Cb38hkMh.js')),
			__memo(() => import('./chunks/30-DqB5bL5s.js')),
			__memo(() => import('./chunks/31-DuLYB-Lj.js')),
			__memo(() => import('./chunks/32-Ba_ZmlnJ.js')),
			__memo(() => import('./chunks/33-CtSEu2T8.js')),
			__memo(() => import('./chunks/34-C-kAVU_9.js')),
			__memo(() => import('./chunks/35-Cr6oOZc0.js')),
			__memo(() => import('./chunks/36-_l3ZpWbL.js')),
			__memo(() => import('./chunks/37-Bd_FJBl4.js')),
			__memo(() => import('./chunks/38-Cs-4VoJy.js')),
			__memo(() => import('./chunks/39-Ds-RT6R7.js')),
			__memo(() => import('./chunks/40-j_GNmrBO.js')),
			__memo(() => import('./chunks/41-DUWZ47GP.js')),
			__memo(() => import('./chunks/42-Btb1qcGo.js')),
			__memo(() => import('./chunks/43-DP5gvWpS.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/conectados",
				pattern: /^\/admin\/conectados\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/logs",
				pattern: /^\/admin\/logs\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/status",
				pattern: /^\/admin\/status\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/agrupamientos",
				pattern: /^\/agrupamientos\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/agrupamientos/nueva",
				pattern: /^\/agrupamientos\/nueva\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]",
				pattern: /^\/agrupamientos\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]/estadisticas",
				pattern: /^\/agrupamientos\/([^/]+?)\/estadisticas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]/resultados",
				pattern: /^\/agrupamientos\/([^/]+?)\/resultados\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/agrupamientos/[id]/votar",
				pattern: /^\/agrupamientos\/([^/]+?)\/votar\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/api/actas",
				pattern: /^\/api\/actas\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CnRjZdPc.js'))
			},
			{
				id: "/api/actas/[id]",
				pattern: /^\/api\/actas\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Dw19VOp9.js'))
			},
			{
				id: "/api/amonestaciones",
				pattern: /^\/api\/amonestaciones\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C3m6o-xc.js'))
			},
			{
				id: "/api/bulk/observations",
				pattern: /^\/api\/bulk\/observations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Bg8bU-pv.js'))
			},
			{
				id: "/api/export",
				pattern: /^\/api\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-eW4VQAOl.js'))
			},
			{
				id: "/api/faltas",
				pattern: /^\/api\/faltas\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-CodbaENw.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-1YvK2RH3.js'))
			},
			{
				id: "/api/moodle/cursos",
				pattern: /^\/api\/moodle\/cursos\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-DGkr8HJe.js'))
			},
			{
				id: "/api/moodle/cursos/[id]/alumnos",
				pattern: /^\/api\/moodle\/cursos\/([^/]+?)\/alumnos\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Clmuprij.js'))
			},
			{
				id: "/api/moodle/cursos/[id]/alumnos/[alumnoId]/notas",
				pattern: /^\/api\/moodle\/cursos\/([^/]+?)\/alumnos\/([^/]+?)\/notas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BXu5n1eR.js'))
			},
			{
				id: "/api/moodle/status",
				pattern: /^\/api\/moodle\/status\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-tWr2ZDh4.js'))
			},
			{
				id: "/api/observaciones",
				pattern: /^\/api\/observaciones\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Cu_Xv0ui.js'))
			},
			{
				id: "/api/reincorporaciones",
				pattern: /^\/api\/reincorporaciones\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Y16lOJPs.js'))
			},
			{
				id: "/auth",
				pattern: /^\/auth\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/autorizar/[token]",
				pattern: /^\/autorizar\/([^/]+?)\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/autorizar/[token]/archivo",
				pattern: /^\/autorizar\/([^/]+?)\/archivo\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-BidWp0as.js'))
			},
			{
				id: "/cursos",
				pattern: /^\/cursos\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/cursos/[id]",
				pattern: /^\/cursos\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/cursos/[id]/alumnos/[alumnoId]/notas",
				pattern: /^\/cursos\/([^/]+?)\/alumnos\/([^/]+?)\/notas\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/institucional",
				pattern: /^\/institucional\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/institucional/efemerides",
				pattern: /^\/institucional\/efemerides\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/institucional/efemerides/nueva",
				pattern: /^\/institucional\/efemerides\/nueva\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/institucional/efemerides/[id]",
				pattern: /^\/institucional\/efemerides\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/institucional/salidas",
				pattern: /^\/institucional\/salidas\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/institucional/salidas/nueva",
				pattern: /^\/institucional\/salidas\/nueva\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/institucional/salidas/[id]",
				pattern: /^\/institucional\/salidas\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/institucional/salidas/[id]/archivo",
				pattern: /^\/institucional\/salidas\/([^/]+?)\/archivo\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4,], errors: [1,,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/observaciones/historial",
				pattern: /^\/observaciones\/historial\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/observaciones/nueva",
				pattern: /^\/observaciones\/nueva\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/preceptor",
				pattern: /^\/preceptor\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/preceptor/actas",
				pattern: /^\/preceptor\/actas\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/preceptor/actas/nueva",
				pattern: /^\/preceptor\/actas\/nueva\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/preceptor/actas/[id]",
				pattern: /^\/preceptor\/actas\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/preceptor/amonestaciones",
				pattern: /^\/preceptor\/amonestaciones\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/preceptor/amonestaciones/nueva",
				pattern: /^\/preceptor\/amonestaciones\/nueva\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/preceptor/faltas",
				pattern: /^\/preceptor\/faltas\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 38 },
				endpoint: null
			},
			{
				id: "/preceptor/faltas/nueva",
				pattern: /^\/preceptor\/faltas\/nueva\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 39 },
				endpoint: null
			},
			{
				id: "/preceptor/legajo/[alumnoId]",
				pattern: /^\/preceptor\/legajo\/([^/]+?)\/?$/,
				params: [{"name":"alumnoId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 40 },
				endpoint: null
			},
			{
				id: "/preceptor/reincorporaciones",
				pattern: /^\/preceptor\/reincorporaciones\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 41 },
				endpoint: null
			},
			{
				id: "/preceptor/reincorporaciones/nueva",
				pattern: /^\/preceptor\/reincorporaciones\/nueva\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 42 },
				endpoint: null
			},
			{
				id: "/votar/[token]",
				pattern: /^\/votar\/([^/]+?)\/?$/,
				params: [{"name":"token","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 43 },
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
