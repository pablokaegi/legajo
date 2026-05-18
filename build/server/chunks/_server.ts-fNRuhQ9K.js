import { json } from '@sveltejs/kit';

//#region src/routes/api/health/+server.ts
var GET = () => {
	return json({
		status: "ok",
		uptimeSeconds: Math.floor(process.uptime()),
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
};

export { GET };
//# sourceMappingURL=_server.ts-fNRuhQ9K.js.map
