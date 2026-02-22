// /v3/js/core/constants.js
// Constantes globales del sistema TeamTowers v3.5

const SECTORES = [
    { id: 'tecnologia', nombre: 'Tecnología, Software e IA' },
    { id: 'salud', nombre: 'Salud, Biotech y Bienestar' },
    { id: 'turismo', nombre: 'Turismo, Viajes y Hostelería' },
    { id: 'fintech', nombre: 'Fintech y Servicios Financieros' },
    { id: 'comercio', nombre: 'Comercio Electrónico y Distribución' },
    { id: 'educacion', nombre: 'Educación y Edtech' },
    { id: 'energia', nombre: 'Energía, Sostenibilidad y Cleantech' },
    { id: 'construccion', nombre: 'Construcción, Inmobiliario y Proptech' },
    { id: 'servicios', nombre: 'Servicios Profesionales y Consultoría B2B' }
];

// IDs y mapas para acceso rápido
const SECTORES_ID = SECTORES.map(s => s.id);
const SECTORES_MAP = Object.fromEntries(SECTORES.map(s => [s.id, s.nombre]));

// Sector por defecto
const SECTOR_DEFAULT = 'tecnologia';

// Exponer en el ámbito global
window.APP_CONSTANTS = {
    SECTORES,
    SECTORES_ID,
    SECTORES_MAP,
    SECTOR_DEFAULT
};
