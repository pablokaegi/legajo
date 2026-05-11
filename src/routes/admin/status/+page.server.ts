import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // El estado se carga via fetch del cliente para mostrar loading state
  return {};
};
