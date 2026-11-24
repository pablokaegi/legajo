import { json } from '@sveltejs/kit';

// src/routes/api/health/+server.ts
var GET = () => {
	return json({
		status: "ok",
		uptimeSeconds: Math.floor(process.uptime()),
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
};

export { GET };
//# sourceMappingURL=_server.ts-uFkw4bQg.js.map
