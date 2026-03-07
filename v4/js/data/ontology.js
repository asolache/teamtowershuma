// js/data/ontology.js
// 🌐 ONTOLOGÍA BASE (Fallback Estático)
// En el futuro, este objeto será alimentado dinámicamente por el Motor Orquestador IA.

export const GLOBAL_ONTOLOGY = {
    "startup": {
        "@anxaneta": { 
            name: "CEO / Visionario", 
            multiplier: 3.0, 
            fmv: 60,
            ai_prompt: "Eres el Estratega Principal. Tu enfoque es el 'Ikigai' del proyecto, la viabilidad financiera (runway) y la cultura organizacional. Tomas decisiones bajo First Principles.", 
            standard_deliverables: [
                { name: "Business Model Canvas & Propuesta de Valor", estimatedHours: 8, fase: 1, tipo: "intangible" },
                { name: "Pitch Deck y Narrativa", estimatedHours: 12, fase: 1, tipo: "intangible" },
                { name: "Term Sheet (Slicing Pie Setup)", estimatedHours: 5, fase: 1, tipo: "tangible" },
                { name: "Cultura y Seguridad Psicológica del Equipo", estimatedHours: 4, fase: 2, tipo: "intangible" }
            ] 
        },
        "@aixecador": { 
            name: "Product Manager (PM)", 
            multiplier: 2.0, 
            fmv: 50,
            ai_prompt: "Eres el puente entre el cielo (Visión) y la tierra (Ejecución). Aplicas metodologías Lean y Agile para priorizar el valor real sobre el perfeccionismo.", 
            standard_deliverables: [
                { name: "Product Requirements Document (PRD)", estimatedHours: 10, fase: 1, tipo: "intangible" },
                { name: "User Story Mapping (Backlog)", estimatedHours: 6, fase: 1, tipo: "tangible" },
                { name: "Plan de Sprint y Rituales Scrum", estimatedHours: 4, fase: 2, tipo: "intangible" },
                { name: "Wireframes Low-Fi (MVP)", estimatedHours: 15, fase: 2, tipo: "tangible" }
            ] 
        },
        "@dosos": { 
            name: "QA / Auditor Sistémico", 
            multiplier: 1.5, 
            fmv: 45,
            ai_prompt: "Eres el guardián de la resiliencia. Buscas fallos, sesgos cognitivos y vulnerabilidades. Aplicas el pensamiento crítico y la gestión de riesgos (Teoría del Cisne Negro).", 
            standard_deliverables: [
                { name: "Matriz de Riesgos y Mitigación", estimatedHours: 5, fase: 1, tipo: "intangible" },
                { name: "Auditoría de UX y Accesibilidad", estimatedHours: 8, fase: 3, tipo: "tangible" },
                { name: "Stress Test y Reporte de Bugs", estimatedHours: 10, fase: 3, tipo: "tangible" }
            ] 
        },
        "@baixos": { 
            name: "Tech Lead / Arquitecto", 
            multiplier: 1.2, 
            fmv: 40,
            ai_prompt: "Eres el pilar que soporta el peso técnico. Creas arquitecturas escalables, código limpio y sistemas eficientes inspirados en el diseño modular.", 
            standard_deliverables: [
                { name: "Diseño de Arquitectura y Base de Datos", estimatedHours: 8, fase: 1, tipo: "tangible" },
                { name: "Desarrollo Core API/Backend", estimatedHours: 25, fase: 2, tipo: "tangible" },
                { name: "Setup de Repositorio y CI/CD", estimatedHours: 5, fase: 2, tipo: "tangible" }
            ] 
        },
        "@pinya": { 
            name: "Desarrollador Base / Soporte", 
            multiplier: 1.0, 
            fmv: 30,
            ai_prompt: "Eres la fuerza colectiva. Te enfocas en la ejecución constante, la empatía comunitaria y el soporte mutuo (Filosofía Ubuntu: 'Soy porque nosotros somos').", 
            standard_deliverables: [
                { name: "Maquetación de Componentes UI", estimatedHours: 15, fase: 2, tipo: "tangible" },
                { name: "Escritura de Tests Unitarios", estimatedHours: 10, fase: 3, tipo: "tangible" },
                { name: "Documentación Técnica Open Source", estimatedHours: 6, fase: 3, tipo: "intangible" },
                { name: "Resolución de Bugs (Tier 1)", estimatedHours: 8, fase: 4, tipo: "tangible" }
            ] 
        }
    },
    "marketing": {
        "@anxaneta": { 
            name: "Growth Hacker / CMO", 
            multiplier: 3.0, 
            fmv: 55,
            ai_prompt: "Eres el orquestador del crecimiento. Usas psicología del comportamiento, neurociencia y análisis de datos para hackear la atención del mercado.",
            standard_deliverables: [
                { name: "Estrategia de Posicionamiento", estimatedHours: 12, fase: 1, tipo: "intangible" },
                { name: "Arquitectura del Funnel", estimatedHours: 8, fase: 2, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Campaign Manager", 
            multiplier: 2.0, 
            fmv: 45,
            ai_prompt: "Eres el estratega operativo. Traduces el mensaje macro en campañas segmentadas y medibles.",
            standard_deliverables: [
                { name: "Calendario Editorial", estimatedHours: 5, fase: 1, tipo: "tangible" },
                { name: "Setup de Campañas Ads", estimatedHours: 10, fase: 2, tipo: "tangible" }
            ]
        },
        "@dosos": { 
            name: "Analytics / CRO", 
            multiplier: 1.5, 
            fmv: 40,
            ai_prompt: "Eres la lente empírica. Basas tus decisiones en el método científico aplicado al marketing (A/B testing, significancia estadística).",
            standard_deliverables: [
                { name: "Setup de Dashboard KPIs", estimatedHours: 6, fase: 1, tipo: "tangible" },
                { name: "Análisis de Experimentos A/B", estimatedHours: 5, fase: 3, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Content Creator", 
            multiplier: 1.2, 
            fmv: 35,
            ai_prompt: "Eres el artista. Usas principios de diseño, teoría del color y narrativa (Storytelling) para crear piezas de impacto.",
            standard_deliverables: [
                { name: "Producción de Hero Video", estimatedHours: 15, fase: 2, tipo: "tangible" },
                { name: "Copywriting de Landing Page", estimatedHours: 6, fase: 2, tipo: "tangible" }
            ]
        },
        "@pinya": { 
            name: "Community Manager", 
            multiplier: 1.0, 
            fmv: 25,
            ai_prompt: "Eres el pulso humano de la marca. Gestionas comunidades aplicando sociología y resolución pacífica de conflictos.",
            standard_deliverables: [
                { name: "Programación de Redes", estimatedHours: 8, fase: 2, tipo: "tangible" },
                { name: "Reporte de Sentimiento", estimatedHours: 3, fase: 4, tipo: "intangible" }
            ]
        }
    }
};
