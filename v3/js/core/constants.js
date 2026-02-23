// /v3/js/core/constants.js
// Constantes globales del sistema TeamTowers v3.5 (VNA & Plantillas Ready)

export const SECTORES = [
    { id: 'tecnologia', nombre: '1. Tecnología, Software e IA' },
    { id: 'salud', nombre: '2. Salud, Biotech y Bienestar' },
    { id: 'turismo', nombre: '3. Turismo, Viajes y Hostelería' },
    { id: 'fintech', nombre: '4. Fintech y Servicios Financieros' },
    { id: 'comercio', nombre: '5. Comercio Electrónico y Distribución' },
    { id: 'educacion', nombre: '6. Educación y Edtech' },
    { id: 'energia', nombre: '7. Energía, Sostenibilidad y Cleantech' },
    { id: 'construccion', nombre: '8. Construcción, Inmobiliario y Proptech' },
    { id: 'servicios', nombre: '9. Servicios Profesionales y Consultoría B2B' },
    { id: 'publico', nombre: '10. Sector Público y Tercer Sector' } // Añadido según estrategia v3.5
];

export const SECTORES_ID = SECTORES.map(s => s.id);
export const SECTORES_MAP = Object.fromEntries(SECTORES.map(s => [s.id, s.nombre]));
export const SECTOR_DEFAULT = 'tecnologia';

// ==========================================
// EL "TRONC" COMÚN (Roles y Entregables Universales)
// ==========================================
export const TRONCO_COMUN = [
    {
        id: "@ceo_director",
        nombre: "CEO / Director",
        multiplier: 2.0,
        color: "#1e293b",
        entregables: [
            { id: "e-okr", nombre: "Definición de OKRs", uv_base: 1000, tipo_valor: "tangible", tags: ["estrategia", "planificacion"] },
            { id: "e-vision", nombre: "Reunión Estratégica", uv_base: 500, tipo_valor: "intangible", tags: ["alineacion", "resolucion-bloqueos"] }
        ]
    },
    {
        id: "@manager_coordinador",
        nombre: "Manager / Coordinador",
        multiplier: 1.5,
        color: "#3b82f6",
        entregables: [
            { id: "e-orden", nombre: "Orden de Trabajo", uv_base: 300, tipo_valor: "tangible", tags: ["operaciones", "asignacion"] },
            { id: "e-onboarding", nombre: "Onboarding de Equipo", uv_base: 600, tipo_valor: "intangible", tags: ["cultura", "formacion"] }
        ]
    },
    {
        id: "@tecnico_developer",
        nombre: "Técnico / Ejecutor",
        multiplier: 1.2,
        color: "#10b981",
        entregables: [
            { id: "e-tarea", nombre: "Entrega de Tarea / Feature", uv_base: 500, tipo_valor: "tangible", tags: ["produccion", "core"] },
            { id: "e-qa", nombre: "Revisión de Calidad (QA/Peer)", uv_base: 250, tipo_valor: "intangible", tags: ["calidad", "mentoria"] }
        ]
    },
    {
        id: "@marketing_ventas",
        nombre: "Ventas / Marketing",
        multiplier: 1.5,
        color: "#f59e0b",
        entregables: [
            { id: "e-lead", nombre: "Lead Cualificado (SQL)", uv_base: 400, tipo_valor: "tangible", tags: ["crecimiento", "clientes"] },
            { id: "e-demo", nombre: "Demo / Reunión Comercial", uv_base: 300, tipo_valor: "intangible", tags: ["relaciones", "pitch"] }
        ]
    },
    {
        id: "@finanzas_admin",
        nombre: "Finanzas / Admin",
        multiplier: 1.2,
        color: "#8b5cf6",
        entregables: [
            { id: "e-cierre", nombre: "Cierre Contable / Facturación", uv_base: 600, tipo_valor: "tangible", tags: ["liquidez", "compliance"] },
            { id: "e-soporte", nombre: "Soporte Administrativo", uv_base: 200, tipo_valor: "intangible", tags: ["operaciones", "resolucion-dudas"] }
        ]
    }
];

// ==========================================
// LAS "RAMAS" (Inyecciones Específicas por Sector)
// ==========================================
export const PLANTILLAS_SECTOR = {
    'salud': [
        {
            id: "@director_clinico", nombre: "Director Clínico", multiplier: 2.5, color: "#ef4444",
            entregables: [
                { id: "e-protocolo", nombre: "Aprobación de Protocolo", uv_base: 1500, tipo_valor: "tangible", tags: ["salud", "compliance"] },
                { id: "e-diagnostico", nombre: "Segunda Opinión Médica", uv_base: 800, tipo_valor: "intangible", tags: ["salud", "mentoria"] }
            ]
        }
    ],
    'fintech': [
        {
            id: "@risk_analyst", nombre: "Analista de Riesgos", multiplier: 1.8, color: "#059669",
            entregables: [
                { id: "e-auditoria", nombre: "Auditoría de Riesgo", uv_base: 1200, tipo_valor: "tangible", tags: ["finanzas", "seguridad"] }
            ]
        }
    ]
    // Nota: El resto de sectores se irán rellenando según necesite @super-z para las demos.
};

// Fallback global para compatibilidad
window.APP_CONSTANTS = {
    SECTORES,
    SECTORES_ID,
    SECTORES_MAP,
    SECTOR_DEFAULT,
    TRONCO_COMUN,
    PLANTILLAS_SECTOR
};

console.log('✅ constants.js cargado (ES6 & Plantillas Ready)');
