//#region src/lib/server/agrupamientos/stats.ts
function media(nums) {
	if (nums.length === 0) return 0;
	return nums.reduce((a, b) => a + b, 0) / nums.length;
}
function mediana(nums) {
	if (nums.length === 0) return 0;
	const s = [...nums].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
/** Desviación estándar muestral (igual que statistics.stdev de Python). */
function desviacion(nums) {
	if (nums.length < 2) return 0;
	const m = media(nums);
	const varianza = nums.reduce((a, b) => a + (b - m) ** 2, 0) / (nums.length - 1);
	return Math.sqrt(varianza);
}
function redondear(n, decimales = 2) {
	const f = 10 ** decimales;
	return Math.round(n * f) / f;
}

export { media as a, desviacion as d, mediana as m, redondear as r };
//# sourceMappingURL=stats-CbU88415.js.map
