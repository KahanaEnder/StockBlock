export const PlaceHolders = {
    MECAMBLOCK: 'MecamBlock',
    LOGO: '/images/mecamblocklogo.jpg',
    ICON: '/images/icon_mecamblock.png',
    NOAUTH: '[Layout] Firebase no respondió a tiempo. Mostrando app sin auth.',
    ADMIN: 'Administrador',
    EMAIL: 'Email',
    PASSWORD: 'Contraseña',
    ENTER_EMAIL: 'Ingresa tu email',
    ENTER_PASSWORD: 'Ingresa tu contraseña',
    LOGIN: 'Iniciar Sesión',
    LOGIN_SUCCESS: 'Iniciando Sesión...',
    ACCESS_D: 'Acceso Denegado',
    PH: 'No tienes permiso para acceder a esta página o la sesión expiró.',
    LOADING: 'Cargando...',
} as const;
export type PlaceHolderKey = keyof typeof PlaceHolders;