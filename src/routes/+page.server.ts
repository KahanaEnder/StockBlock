import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {Routes} from '$lib/constants/routes'
//Se ejecuta primero el servidor que la primera pagina

export const load: PageServerLoad = () => {
  throw redirect(307, Routes.LOGIN);
};
