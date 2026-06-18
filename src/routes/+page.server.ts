import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
//Se ejecuta primero el servidor que la primera pagina

export const load: PageServerLoad = () => {
  throw redirect(307, '/login'); //Intercepta la primera +page.svelte y redirige a login
};
