export const PlaceHolders = {
    MECAMBLOCK: 'MecamBlock',
    LOGO: '/images/mecamblocklogo.jpg',
    ADMIN: 'Administrador',
    EMAIL: 'Email',
    PASSWORD: 'Contraseña',
    ENTER_EMAIL: 'Ingresa tu email',
    ENTER_PASSWORD: 'Ingresa tu contraseña',
    LOGIN: 'Iniciar Sesión',
    LOGIN_SUCCESS: 'Iniciando Sesión...',
} as const;
export type PlaceHolderKey = keyof typeof PlaceHolders;