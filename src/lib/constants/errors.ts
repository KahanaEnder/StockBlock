export const Errors = {
    LOGIN_REQUIRED: 'Email y contraseña son requeridos',
    LOGIN_INVALID: 'Email o contraseña incorrectos',
} as const;
export type ErrorsKey = keyof typeof Errors;