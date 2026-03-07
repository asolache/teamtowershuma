// v5/js/data/ontology.js
// 🌐 BASE DE DATOS ONTOLÓGICA v6.5 (The TeamTowers Master Dictionary)
// Diseñado con metodologías VNA, Slicing Pie y Gestión por Competencias.

export const GLOBAL_ONTOLOGY = {
    
    // 1. SOFTWARE & SAAS (Plataformas Tecnológicas y Apps)
    "tech_saas_platform": {
        "@anxaneta": { 
            name: "CEO / Visionario", multiplier: 3.0, fmv: 60,
            ai_prompt: "Estratega principal. Enfoque en la viabilidad (runway), el 'Ikigai' del producto y la cultura.", 
            standard_deliverables: [
                { name: "Business Model Canvas", estimatedHours: 8, tipo: "tangible" },
                { name: "Pitch Deck para Inversores", estimatedHours: 12, tipo: "tangible" },
                { name: "Alineación de Cultura de Ingeniería", estimatedHours: 5, tipo: "intangible" },
                { name: "Negociación de Partnerships Core", estimatedHours: 10, tipo: "intangible" }
            ] 
        },
        "@aixecador": { 
            name: "CPO / Product Lead", multiplier: 2.0, fmv: 50,
            ai_prompt: "Puente entre visión y ejecución. Metodología Agile y priorización Lean.", 
            standard_deliverables: [
                { name: "Product Requirements (PRD)", estimatedHours: 10, tipo: "tangible" },
                { name: "Roadmap y User Story Mapping", estimatedHours: 8, tipo: "tangible" },
                { name: "Resolución de Cuellos de Botella", estimatedHours: 4, tipo: "intangible" }
            ] 
        },
        "@dosos": { 
            name: "QA & DevSecOps", multiplier: 1.5, fmv: 45,
            standard_deliverables: [
                { name: "Scripts de Testing Automatizado", estimatedHours: 12, tipo: "tangible" },
                { name: "Auditoría de Vulnerabilidades", estimatedHours: 10, tipo: "tangible" },
                { name: "Feedback de Calidad de Código", estimatedHours: 4, tipo: "intangible" }
            ] 
        },
        "@baixos": { 
            name: "Tech Lead / Arquitecto", multiplier: 1.2, fmv: 40,
            standard_deliverables: [
                { name: "Desarrollo de API Core", estimatedHours: 25, tipo: "tangible" },
                { name: "Diseño de Base de Datos Escalar", estimatedHours: 10, tipo: "tangible" },
                { name: "Mentoría Técnica (Pair Programming)", estimatedHours: 6, tipo: "intangible" }
            ] 
        },
        "@pinya": { 
            name: "Desarrollador / UI Support", multiplier: 1.0, fmv: 30,
            standard_deliverables: [
                { name: "Maquetación de Componentes React", estimatedHours: 15, tipo: "tangible" },
                { name: "Resolución de Bugs (Tier 1)", estimatedHours: 8, tipo: "tangible" },
                { name: "Soporte Técnico a Usuarios", estimatedHours: 10, tipo: "intangible" }
            ] 
        }
    },

    // 2. WEB3 & DEFI (DAOs, Protocolos y Blockchain)
    "web3_defi_protocol": {
        "@anxaneta": { 
            name: "Protocol Architect", multiplier: 3.0, fmv: 70,
            standard_deliverables: [
                { name: "Diseño de Tokenomics (Math Model)", estimatedHours: 20, tipo: "tangible" },
                { name: "Whitepaper Core", estimatedHours: 15, tipo: "tangible" },
                { name: "Liderazgo de Visión Descentralizada", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Governance Facilitator", multiplier: 2.0, fmv: 50,
            standard_deliverables: [
                { name: "Redacción de Propuestas (BIPs/EIPs)", estimatedHours: 10, tipo: "tangible" },
                { name: "Configuración de Snapshot/Aragon", estimatedHours: 5, tipo: "tangible" },
                { name: "Mediación de Debates Comunitarios", estimatedHours: 12, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65,
            standard_deliverables: [
                { name: "Reporte de Auditoría Formal (PDF)", estimatedHours: 25, tipo: "tangible" },
                { name: "Simulación de Exploits (Stress Test)", estimatedHours: 15, tipo: "tangible" },
                { name: "Revisión de Seguridad Cognitiva", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Solidity / Rust Engineer", multiplier: 1.2, fmv: 55,
            standard_deliverables: [
                { name: "Código de Contratos Inteligentes", estimatedHours: 30, tipo: "tangible" },
                { name: "Integración de Oráculos (Chainlink)", estimatedHours: 12, tipo: "tangible" },
                { name: "Peer-Review de Pull Requests", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Node Operator / Liquidity", multiplier: 1.0, fmv: 35,
            standard_deliverables: [
                { name: "Setup de Nodos Validadores", estimatedHours: 10, tipo: "tangible" },
                { name: "Provisión de Liquidez (LP)", estimatedHours: 5, tipo: "tangible" },
                { name: "Evangelización en Discord/Telegram", estimatedHours: 15, tipo: "intangible" }
            ]
        }
    },

    // 3. DIGITAL MEDIA & GROWTH (Agencias, Marketing y Creadores)
    "digital_media_growth": {
        "@anxaneta": { 
            name: "Growth Director / CMO", multiplier: 3.0, fmv: 55,
            standard_deliverables: [
                { name: "Estrategia de Posicionamiento Global", estimatedHours: 12, tipo: "tangible" },
                { name: "Arquitectura del Funnel de Ventas", estimatedHours: 10, tipo: "tangible" },
                { name: "Liderazgo Creativo y Dirección de Arte", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Campaign Manager", multiplier: 2.0, fmv: 45,
            standard_deliverables: [
                { name: "Calendario Editorial (Gantt)", estimatedHours: 5, tipo: "tangible" },
                { name: "Setup Técnico de Campañas (Ads)", estimatedHours: 12, tipo: "tangible" },
                { name: "Alineación de Tiempos de Entrega", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Data Analyst / CRO", multiplier: 1.5, fmv: 45,
            standard_deliverables: [
                { name: "Dashboard de KPIs (Looker/Tableau)", estimatedHours: 8, tipo: "tangible" },
                { name: "Reporte de Experimentos A/B", estimatedHours: 6, tipo: "tangible" },
                { name: "Interpretación Psicológica de Datos", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Content Creator / Copywriter", multiplier: 1.2, fmv: 35,
            standard_deliverables: [
                { name: "Producción de Video Hero", estimatedHours: 15, tipo: "tangible" },
                { name: "Copywriting de Landing Page", estimatedHours: 8, tipo: "tangible" },
                { name: "Brainstorming de Ideas Creativas", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Community Manager", multiplier: 1.0, fmv: 25,
            standard_deliverables: [
                { name: "Programación de Posts en RRSS", estimatedHours: 6, tipo: "tangible" },
                { name: "Reporte Semanal de Sentimiento", estimatedHours: 4, tipo: "tangible" },
                { name: "Gestión de Crisis y Empatía Digital", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // 4. HEALTHTECH & AI (Salud Digital, Psicología y Bienestar)
    "healthtech_ai": {
        "@anxaneta": { 
            name: "Director Médico / Ética", multiplier: 3.0, fmv: 70,
            standard_deliverables: [
                { name: "Marco Ético Clínico (Documento)", estimatedHours: 12, tipo: "tangible" },
                { name: "Desarrollo de Alianzas Médicas", estimatedHours: 15, tipo: "intangible" },
                { name: "Aprobación de Modelo Terapéutico", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Coordinador Clínico (PM)", multiplier: 2.0, fmv: 55,
            standard_deliverables: [
                { name: "Diseño de Protocolos de Triaje", estimatedHours: 10, tipo: "tangible" },
                { name: "Mapeo de Flujos de Atención al Paciente", estimatedHours: 8, tipo: "tangible" },
                { name: "Supervisión Emocional del Equipo", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Auditor de Sesgos Clínicos IA", multiplier: 1.5, fmv: 50,
            standard_deliverables: [
                { name: "Reporte de Sesgos Algorítmicos", estimatedHours: 15, tipo: "tangible" },
                { name: "Testing de Casos Límite (Suicidio/Crisis)", estimatedHours: 12, tipo: "tangible" },
                { name: "Supervisión de Privacidad (HIPAA/GDPR)", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Ingeniero IA / Prompts", multiplier: 1.2, fmv: 45,
            standard_deliverables: [
                { name: "Finetuning de LLM Clínico", estimatedHours: 25, tipo: "tangible" },
                { name: "Diseño de Árboles de Decisión (Prompts)", estimatedHours: 15, tipo: "tangible" },
                { name: "Iteración Basada en Feedback Médico", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Terapeuta Base / Operador", multiplier: 1.0, fmv: 35,
            standard_deliverables: [
                { name: "Generación de Casos Clínicos Sintéticos", estimatedHours: 10, tipo: "tangible" },
                { name: "Atención de Derivación Humana en Crisis", estimatedHours: 15, tipo: "intangible" },
                { name: "Feedback de Empatía sobre Respuestas IA", estimatedHours: 5, tipo: "tangible" }
            ]
        }
    },

    // 5. DEEPTECH & HARDWARE (Robótica, I+D y Manufactura)
    "deeptech_hardware": {
        "@anxaneta": { 
            name: "Chief Scientific Officer (CSO)", multiplier: 3.0, fmv: 75,
            standard_deliverables: [
                { name: "Redacción de Patentes Core", estimatedHours: 25, tipo: "tangible" },
                { name: "Dirección de I+D a 5 años", estimatedHours: 10, tipo: "intangible" },
                { name: "Defensa Tecnológica ante Inversores", estimatedHours: 15, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Supply Chain & Mfg Lead", multiplier: 2.0, fmv: 55,
            standard_deliverables: [
                { name: "Bill of Materials (BOM) Optimizado", estimatedHours: 12, tipo: "tangible" },
                { name: "Contratos con Proveedores Tier 1", estimatedHours: 15, tipo: "tangible" },
                { name: "Negociación de Tiempos de Entrega", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Hardware QA / Certificaciones", multiplier: 1.5, fmv: 50,
            standard_deliverables: [
                { name: "Dossier para Certificación CE/FCC", estimatedHours: 30, tipo: "tangible" },
                { name: "Análisis de Tolerancias (Stress Test Físico)", estimatedHours: 15, tipo: "tangible" },
                { name: "Revisión de Seguridad del Operario", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Mechatronics / Firmware Eng", multiplier: 1.2, fmv: 50,
            standard_deliverables: [
                { name: "Diseños CAD (SolidWorks/Fusion)", estimatedHours: 25, tipo: "tangible" },
                { name: "Código Firmware C++ (Embedded)", estimatedHours: 20, tipo: "tangible" },
                { name: "Resolución de Problemas de Ensamblaje", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Assembly Tech / Lab Admin", multiplier: 1.0, fmv: 30,
            standard_deliverables: [
                { name: "Ensamblaje de Prototipo Alpha", estimatedHours: 15, tipo: "tangible" },
                { name: "Mantenimiento de Impresoras 3D/CNC", estimatedHours: 5, tipo: "tangible" },
                { name: "Observación Empírica del Prototipo", estimatedHours: 8, tipo: "intangible" }
            ]
        }
    },

    // 6. E-COMMERCE & D2C (Marcas Directas al Consumidor y Logística)
    "ecommerce_d2c": {
        "@anxaneta": { 
            name: "Brand & Retail Director", multiplier: 3.0, fmv: 50,
            standard_deliverables: [
                { name: "Libro de Marca (Brand Book)", estimatedHours: 15, tipo: "tangible" },
                { name: "P&L y Modelo de Precios", estimatedHours: 10, tipo: "tangible" },
                { name: "Visión de Expansión de Mercado", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "E-commerce Ops Manager", multiplier: 2.0, fmv: 40,
            standard_deliverables: [
                { name: "Configuración de Tienda (Shopify Core)", estimatedHours: 20, tipo: "tangible" },
                { name: "Estrategia de Merchandising Digital", estimatedHours: 8, tipo: "tangible" },
                { name: "Coordinación entre Almacén y Marketing", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Inventory & CX Auditor", multiplier: 1.5, fmv: 35,
            standard_deliverables: [
                { name: "Reporte de Rotación de Stock", estimatedHours: 6, tipo: "tangible" },
                { name: "Análisis de Tasas de Devolución", estimatedHours: 8, tipo: "tangible" },
                { name: "Auditoría de Experiencia de Unboxing", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Performance Marketer", multiplier: 1.2, fmv: 35,
            standard_deliverables: [
                { name: "Setup Flujos de Email (Klaviyo)", estimatedHours: 12, tipo: "tangible" },
                { name: "Optimización de Campañas (ROAS/CAC)", estimatedHours: 10, tipo: "tangible" },
                { name: "Ajuste Dinámico de Pujas", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Fulfillment & Support", multiplier: 1.0, fmv: 20,
            standard_deliverables: [
                { name: "Resolución de Tickets (Zendesk/Gorgias)", estimatedHours: 15, tipo: "tangible" },
                { name: "Empaquetado Físico (Pick & Pack)", estimatedHours: 20, tipo: "tangible" },
                { name: "Recuperación de Clientes Enojados", estimatedHours: 8, tipo: "intangible" }
            ]
        }
    },

    // 7. AGILE CONSULTING & B2B (Servicios Profesionales de Alto Valor)
    "agile_consulting_b2b": {
        "@anxaneta": { 
            name: "Partner / Rainmaker", multiplier: 3.0, fmv: 80,
            standard_deliverables: [
                { name: "Propuesta Comercial (RFP Response)", estimatedHours: 12, tipo: "tangible" },
                { name: "Cierre de Cuentas (Keynote Pitching)", estimatedHours: 10, tipo: "intangible" },
                { name: "Gestión de Relación con C-Level", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Engagement Manager", multiplier: 2.0, fmv: 60,
            standard_deliverables: [
                { name: "Plan de Proyecto (SOW & Gantt)", estimatedHours: 8, tipo: "tangible" },
                { name: "Estructuración de Entregables (Work Breakdown)", estimatedHours: 6, tipo: "tangible" },
                { name: "Alineación de Expectativas del Cliente", estimatedHours: 10, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Quality & Risk Reviewer", multiplier: 1.5, fmv: 55,
            standard_deliverables: [
                { name: "Auditoría de Entregable Final", estimatedHours: 8, tipo: "tangible" },
                { name: "Matriz de Mitigación de Riesgos", estimatedHours: 5, tipo: "tangible" },
                { name: "Peer-Review Cognitivo (Abogado del Diablo)", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Subject Matter Expert (SME)", multiplier: 1.2, fmv: 50,
            standard_deliverables: [
                { name: "Diseño de Framework Customizado", estimatedHours: 20, tipo: "tangible" },
                { name: "Análisis Profundo de Datos del Cliente", estimatedHours: 15, tipo: "tangible" },
                { name: "Transferencia de Conocimiento al Equipo", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Research Analyst", multiplier: 1.0, fmv: 30,
            standard_deliverables: [
                { name: "Scraping y Limpieza de Datos", estimatedHours: 12, tipo: "tangible" },
                { name: "Formateo Profesional de Decks (PPT)", estimatedHours: 8, tipo: "tangible" },
                { name: "Transcripción y Resumen de Entrevistas", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // 8. EDTECH & COMMUNITY (Educación, Academias y Aprendizaje)
    "edtech_community": {
        "@anxaneta": { 
            name: "Chief Learning Officer", multiplier: 3.0, fmv: 55,
            standard_deliverables: [
                { name: "Diseño del Modelo Pedagógico Core", estimatedHours: 15, tipo: "tangible" },
                { name: "Obtención de Acreditaciones Oficiales", estimatedHours: 20, tipo: "tangible" },
                { name: "Visión Educativa y Motivacional", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Program Director", multiplier: 2.0, fmv: 45,
            standard_deliverables: [
                { name: "Secuenciación del Curriculum (Syllabus)", estimatedHours: 12, tipo: "tangible" },
                { name: "Gestión de Cohortes (Cohorts Ops)", estimatedHours: 10, tipo: "tangible" },
                { name: "Orquestación de Profesores Invitados", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Student Success Auditor", multiplier: 1.5, fmv: 40,
            standard_deliverables: [
                { name: "Análisis de Tasa de Abandono (Churn)", estimatedHours: 6, tipo: "tangible" },
                { name: "Corrección de Evaluaciones Clave", estimatedHours: 15, tipo: "tangible" },
                { name: "Auditoría de Calidad de Clases", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Instructional Designer", multiplier: 1.2, fmv: 35,
            standard_deliverables: [
                { name: "Grabación y Edición de Video-Clases", estimatedHours: 25, tipo: "tangible" },
                { name: "Creación de Materiales Interactivos", estimatedHours: 15, tipo: "tangible" },
                { name: "Dinámicas de Gamificación", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Tutor / Mentor Comunitario", multiplier: 1.0, fmv: 25,
            standard_deliverables: [
                { name: "Respuestas en Foros (Discord/Slack)", estimatedHours: 12, tipo: "tangible" },
                { name: "Sesiones de Mentoría 1-on-1", estimatedHours: 15, tipo: "intangible" },
                { name: "Soporte Emocional al Estudiante", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // 9. IMPACT NGO & PUBLIC GOODS (ONGs, Fundaciones y Bienes Públicos)
    "impact_dao_ngo": {
        "@anxaneta": { 
            name: "Director de Impacto", multiplier: 2.0, fmv: 45,
            standard_deliverables: [
                { name: "Documento: Teoría del Cambio", estimatedHours: 15, tipo: "tangible" },
                { name: "Aplicación a Subvenciones (Grants)", estimatedHours: 20, tipo: "tangible" },
                { name: "Relaciones Institucionales (Lobbying)", estimatedHours: 12, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Coordinador de Terreno", multiplier: 1.5, fmv: 35,
            standard_deliverables: [
                { name: "Plan Logístico de Despliegue", estimatedHours: 10, tipo: "tangible" },
                { name: "Mapa de Ruta de Voluntarios", estimatedHours: 8, tipo: "tangible" },
                { name: "Resolución de Crisis en Terreno", estimatedHours: 10, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Evaluador de Transparencia", multiplier: 1.2, fmv: 35,
            standard_deliverables: [
                { name: "Medición de KPIs Sociales (Impact Report)", estimatedHours: 15, tipo: "tangible" },
                { name: "Auditoría de Uso de Fondos (Ledger)", estimatedHours: 10, tipo: "tangible" },
                { name: "Entrevistas de Integridad a Beneficiarios", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Especialista Técnico / Educador", multiplier: 1.0, fmv: 30,
            standard_deliverables: [
                { name: "Creación de Manuales y Kits Educativos", estimatedHours: 18, tipo: "tangible" },
                { name: "Construcción de Infraestructura Local", estimatedHours: 25, tipo: "tangible" },
                { name: "Ejecución de Talleres Locales", estimatedHours: 12, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Voluntariado Core", multiplier: 1.0, fmv: 15,
            standard_deliverables: [
                { name: "Distribución de Suministros Físicos", estimatedHours: 20, tipo: "tangible" },
                { name: "Acompañamiento Psicosocial", estimatedHours: 15, tipo: "intangible" },
                { name: "Recolección de Firmas/Datos Base", estimatedHours: 10, tipo: "tangible" }
            ]
        }
    }
};
