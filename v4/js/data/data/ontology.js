// js/data/ontology.js

/* * 🧬 LIBRERÍA MAESTRA DE ONTOLOGÍAS (TEAMTOWERS DNA)
 * Estructura de Castells: 
 * @anxaneta (Estrategia x3.0), @aixecador (Coordinación x2.0), 
 * @dosos (Auditoría x1.5), @baixos (Operativa Senior x1.2), @pinya (Soporte x1.0)
 */

export const GLOBAL_ONTOLOGY = {
    
    // ==========================================
    // 🚀 SECTOR 1: SOFTWARE & TECH (SaaS)
    // ==========================================
    "software": {
        nombre: "Software & Tech (SaaS)",
        roles: [
            {
                levelId: "@anxaneta", name: "Product Owner", multiplier: 3.0, fmv: 60,
                ai_prompt: "Eres un PO experto. Indicadores de conducta a auditar: 1) Visión ROI clara. 2) Especificación sin ambigüedades. 3) Foco en el problema del usuario, no solo en la técnica. Rechaza si falta contexto de negocio.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Product Requirement Doc (PRD) (PoW: Link a Notion/Doc)" },
                    { estimatedHours: 3.5, name: "Backlog Grooming & User Stories (PoW: Link a Jira/Linear)" }
                ]
            },
            {
                levelId: "@anxaneta", name: "Software Architect", multiplier: 3.0, fmv: 65,
                ai_prompt: "Eres Arquitecto de Sistemas. Indicadores a auditar: 1) Escalabilidad. 2) Seguridad por diseño. 3) Elección óptima de stack. Rechaza arquitecturas monolíticas sin justificación.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Diseño Arquitectura Cloud (PoW: Diagrama UML/Lucidchart)" },
                    { estimatedHours: 4.0, name: "Data Schema & ERD (PoW: Script SQL/Esquema BD)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Tech Lead / Scrum Master", multiplier: 2.0, fmv: 50,
                ai_prompt: "Eres Tech Lead. Indicadores a auditar: 1) Desbloqueo de equipo. 2) Ceremonias ágiles efectivas. 3) Código limpio en Code Reviews.",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Code Review Complejo (PoW: Link a Pull Request aprobada)" },
                    { estimatedHours: 2.5, name: "Facilitación Sprint Planning (PoW: Acta de Planning en Wiki)" }
                ]
            },
            {
                levelId: "@dosos", name: "QA Automation Engineer", multiplier: 1.5, fmv: 40,
                ai_prompt: "Eres QA Auto. Indicadores a auditar: 1) Cobertura de casos límite (edge cases). 2) Código de test mantenible. Rechaza tests frágiles (flaky tests).",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Suite de Tests E2E (Cypress/Playwright) (PoW: Link a Repo/Pipeline)" },
                    { estimatedHours: 3.0, name: "Test Plan Document (PoW: Hoja de Casos de Uso)" }
                ]
            },
            {
                levelId: "@baixos", name: "Fullstack Developer (Senior)", multiplier: 1.2, fmv: 45,
                ai_prompt: "Eres Dev Senior. Indicadores a auditar: 1) Arquitectura limpia (SOLID). 2) Cero deuda técnica. 3) Commits semánticos. Rechaza si rompe la build.",
                standard_deliverables: [
                    { estimatedHours: 16.0, name: "Desarrollo Feature Core Backend+Front (PoW: PR Merged en Main)" },
                    { estimatedHours: 6.0, name: "Refactor de Rendimiento (PoW: PR con métricas de mejora Vercel/Lighthouse)" }
                ]
            },
            {
                levelId: "@baixos", name: "UX/UI Product Designer", multiplier: 1.2, fmv: 45,
                ai_prompt: "Eres Diseñador UX/UI. Indicadores a auditar: 1) Consistencia con el Design System. 2) Accesibilidad. 3) Flujos sin fricción.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Prototipo Alta Fidelidad Módulo (PoW: Link a Figma File)" },
                    { estimatedHours: 5.0, name: "User Research / Entrevistas (PoW: PDF con Insights y Grabaciones)" }
                ]
            },
            {
                levelId: "@pinya", name: "Junior Dev / Bugfixer", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres Dev Junior. Indicadores a auditar: 1) Resolución exacta del ticket. 2) Código comentado. Rechaza si el bug se reproduce.",
                standard_deliverables: [
                    { estimatedHours: 2.5, name: "Resolución Bug Menor/UI (PoW: Link a Ticket cerrado + PR)" }
                ]
            },
            {
                levelId: "@pinya", name: "Soporte Técnico L1", multiplier: 1.0, fmv: 20,
                ai_prompt: "Eres Soporte L1. Indicadores a auditar: 1) Empatía con el cliente. 2) Resolución en primera llamada (FCR). 3) Documentación clara.",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Cierre de Lote de Tickets (10x) (PoW: Screenshot Zendesk/Intercom)" },
                    { estimatedHours: 3.0, name: "Artículo Base de Conocimiento (PoW: URL del Help Center)" }
                ]
            }
        ]
    },

    // ==========================================
    // 📢 SECTOR 2: AGENCIA MARKETING DIGITAL & PR
    // ==========================================
    "marketing": {
        nombre: "Marketing Digital & Growth",
        roles: [
            {
                levelId: "@anxaneta", name: "Growth Hacker / CMO", multiplier: 3.0, fmv: 55,
                ai_prompt: "Eres CMO. Indicadores: 1) CAC < LTV. 2) Estrategia omnicanal. 3) Data-driven. Rechaza planes basados en intuición sin métricas.",
                standard_deliverables: [
                    { estimatedHours: 10.0, name: "Estrategia Go-To-Market (PoW: Pitch Deck/PDF Estratégico)" },
                    { estimatedHours: 5.0, name: "Diseño Funnel de Conversión (PoW: Diagrama Funnelytics/Miro)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Account Manager", multiplier: 2.0, fmv: 40,
                ai_prompt: "Eres Account Manager. Indicadores: 1) Satisfacción del cliente. 2) Up-selling. 3) Cumplimiento de deadlines.",
                standard_deliverables: [
                    { estimatedHours: 3.0, name: "Reporte Mensual de Campaña (PoW: PDF/Looker Studio Link enviado a cliente)" },
                    { estimatedHours: 2.0, name: "Briefing de Campaña B2B (PoW: Documento Brief aprobado)" }
                ]
            },
            {
                levelId: "@dosos", name: "Data Analyst / SEO Auditor", multiplier: 1.5, fmv: 35,
                ai_prompt: "Eres SEO/Data Auditor. Indicadores: 1) Precisión en la atribución. 2) Identificación de keywords long-tail de alto valor.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Auditoría SEO Técnica & Contenido (PoW: Hoja de Cálculo Audit + Semrush)" },
                    { estimatedHours: 4.0, name: "Setup Dashboard Analítica (PoW: Link Looker Studio/GA4)" }
                ]
            },
            {
                levelId: "@baixos", name: "Performance Marketer (Ads)", multiplier: 1.2, fmv: 40,
                ai_prompt: "Eres Trafficker Senior. Indicadores: 1) Optimización de ROAS/CPA. 2) Testeo A/B riguroso. Rechaza campañas con creatividades sin trackear.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Setup & Lanzamiento Campaña Meta/Google Ads (PoW: Screenshot Campaña Activa + Link Ad Preview)" },
                    { estimatedHours: 3.0, name: "Optimización y Rotación de Anuncios (PoW: Log de cambios aplicados)" }
                ]
            },
            {
                levelId: "@baixos", name: "Copywriter Senior", multiplier: 1.2, fmv: 35,
                ai_prompt: "Eres Copywriter. Indicadores: 1) Hooks persuasivos. 2) Tono de marca perfecto. 3) Llamadas a la acción (CTA) claras.",
                standard_deliverables: [
                    { estimatedHours: 4.5, name: "Secuencia Email Marketing (5 Mails) (PoW: Documento Docs/Notion)" },
                    { estimatedHours: 6.0, name: "Copy Landing Page de Ventas (PoW: Wireframe de Copy Textual)" }
                ]
            },
            {
                levelId: "@pinya", name: "Community Manager", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres CM. Indicadores: 1) Crecimiento orgánico. 2) Respuestas < 2h. 3) Formatos en tendencia.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Calendario Editorial (1 Mes) (PoW: Link a Trello/Hoja de Cálculo)" },
                    { estimatedHours: 5.0, name: "Creación 5x Reels/TikToks Nativos (PoW: Link a carpeta Drive/Shorts)" }
                ]
            }
        ]
    },

    // ==========================================
    // ⚖️ SECTOR 3: CONSULTORÍA & LEGAL
    // ==========================================
    "consultoria": {
        nombre: "Consultoría Estratégica & Legal",
        roles: [
            {
                levelId: "@anxaneta", name: "Socio Director / Partner", multiplier: 3.0, fmv: 80,
                ai_prompt: "Eres Socio Director. Indicadores: 1) Mitigación total de riesgo legal. 2) Estrategia corporativa blindada. Rechaza consejos genéricos.",
                standard_deliverables: [
                    { estimatedHours: 15.0, name: "Estructuración Legal Corporativa / M&A (PoW: Contratos M&A firmados PDF)" },
                    { estimatedHours: 5.0, name: "Estrategia Fiscal Internacional (PoW: Memo de Consultoría VIP)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Manager de Proyecto", multiplier: 2.0, fmv: 50,
                ai_prompt: "Eres Manager. Indicadores: 1) Alineación con stakeholders. 2) Control de horas facturables. 3) Entrega impecable.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Plan de Transformación Operativa (PoW: Slide Deck de Consultoría)" },
                    { estimatedHours: 4.0, name: "Mapa de Procesos As-Is / To-Be (PoW: Diagrama BPMN/Miro)" }
                ]
            },
            {
                levelId: "@dosos", name: "Compliance Auditor", multiplier: 1.5, fmv: 45,
                ai_prompt: "Eres Auditor de Compliance. Indicadores: 1) Rigor normativo. 2) Ojo al detalle. Rechaza documentos que expongan a la empresa a multas.",
                standard_deliverables: [
                    { estimatedHours: 10.0, name: "Auditoría GDPR / ISO 27001 (PoW: Reporte de Brechas Oficial PDF)" },
                    { estimatedHours: 4.0, name: "Revisión de Contrato de Proveedores (PoW: Documento con Control de Cambios)" }
                ]
            },
            {
                levelId: "@baixos", name: "Consultor Senior", multiplier: 1.2, fmv: 40,
                ai_prompt: "Eres Consultor. Indicadores: 1) Análisis cuantitativo excelente. 2) Presentaciones 'Client-ready'.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Modelo Financiero a 3 años (PoW: Excel Financiero Dinámico)" },
                    { estimatedHours: 7.0, name: "Estudio de Mercado / Benchmarking (PoW: Informe PDF de 20+ pags)" }
                ]
            },
            {
                levelId: "@pinya", name: "Paralegal / Junior Analyst", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres Analista Junior. Indicadores: 1) Datos precisos. 2) Búsqueda exhaustiva. 3) Cero errores ortográficos.",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Redacción de NDAs / Acuerdos Básicos (PoW: Doc NDA Básico)" },
                    { estimatedHours: 5.0, name: "Data Scraping & Limpieza de Base de Datos (PoW: CSV Limpio)" }
                ]
            }
        ]
    },

    // ==========================================
    // 🎬 SECTOR 4: MEDIA & PRODUCCIÓN AUDIOVISUAL
    // ==========================================
    "media": {
        nombre: "Producción Media & Audiovisual",
        roles: [
            {
                levelId: "@anxaneta", name: "Productor Ejecutivo", multiplier: 3.0, fmv: 60,
                ai_prompt: "Eres Productor Ejecutivo. Indicadores: 1) Viabilidad financiera del proyecto. 2) Distribución. Rechaza guiones fuera de presupuesto.",
                standard_deliverables: [
                    { estimatedHours: 10.0, name: "Dossier de Venta (Pitch Deck Audiovisual) (PoW: PDF Pitch Deck)" },
                    { estimatedHours: 6.0, name: "Presupuesto Desglosado Movie Magic (PoW: Archivo/Excel de Presupuesto)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Jefe de Producción / Director", multiplier: 2.0, fmv: 50,
                ai_prompt: "Eres Director. Indicadores: 1) Visión creativa ejecutada. 2) Coordinación de equipos en set.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Guion Técnico y Storyboard (PoW: PDF Guion/Storyboard)" },
                    { estimatedHours: 5.0, name: "Plan de Rodaje / Órdenes de Trabajo (PoW: Call Sheet PDF)" }
                ]
            },
            {
                levelId: "@dosos", name: "Script Supervisor / Colorista", multiplier: 1.5, fmv: 40,
                ai_prompt: "Eres Colorista/QA. Indicadores: 1) Continuidad visual (Raccord). 2) Color matching perfecto.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Corrección de Color y Etalonaje (Davinci) (PoW: Link a Exportación en Frame.io)" },
                    { estimatedHours: 4.0, name: "Reporte de Continuidad (Script) (PoW: Hoja de Script de rodaje)" }
                ]
            },
            {
                levelId: "@baixos", name: "Editor Senior / VFX", multiplier: 1.2, fmv: 35,
                ai_prompt: "Eres Editor. Indicadores: 1) Ritmo narrativo. 2) Mezcla de audio impecable. Rechaza material mal sincronizado.",
                standard_deliverables: [
                    { estimatedHours: 16.0, name: "Montaje Final (Picture Lock) (PoW: Link a Video Privado Vimeo/Frame.io)" },
                    { estimatedHours: 8.0, name: "Composición VFX / Motion Graphics (PoW: Archivo Renderizado .mov)" }
                ]
            },
            {
                levelId: "@pinya", name: "Data Wrangler (DIT) / Asistente", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres DIT. Indicadores: 1) Cero pérdida de datos. 2) Organización obsesiva de carpetas. 3) Backups redundantes.",
                standard_deliverables: [
                    { estimatedHours: 3.5, name: "Ingesta, Backup y Proxies de Rodaje (PoW: Screenshot Árbol de Carpetas + Reporte MD5)" },
                    { estimatedHours: 4.0, name: "Búsqueda de Archivo / Stock Footage (PoW: Carpeta Drive con Clips de Stock)" }
                ]
            }
        ]
    },

    // ==========================================
    // 🛒 SECTOR 5: E-COMMERCE & LOGÍSTICA
    // ==========================================
    "ecommerce": {
        nombre: "E-commerce & Retail B2C",
        roles: [
            {
                levelId: "@anxaneta", name: "E-commerce Director", multiplier: 3.0, fmv: 55,
                ai_prompt: "Eres E-com Director. Indicadores: 1) Tasa de Conversión (CRO). 2) Gestión de Márgenes y P&L. Rechaza estrategias sin rentabilidad.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Estrategia Pricing & Q4 Promos (PoW: Documento Estratégico + Excel de Márgenes)" },
                    { estimatedHours: 4.0, name: "Auditoría CRO del Checkout (PoW: Presentación con Heatmaps e Insights)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Supply Chain Manager", multiplier: 2.0, fmv: 40,
                ai_prompt: "Eres Operations Manager. Indicadores: 1) Rotación de Stock. 2) Reducción de tiempos de entrega. 3) Negociación de fletes.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Negociación y Contrato Proveedor Logístico (PoW: Contrato/Tarifario firmado PDF)" },
                    { estimatedHours: 5.0, name: "Planificación de Restock (Otb) (PoW: Hoja de Pedido de Compra PO)" }
                ]
            },
            {
                levelId: "@dosos", name: "Auditor de Calidad (Producto/Web)", multiplier: 1.5, fmv: 30,
                ai_prompt: "Eres QA de Producto. Indicadores: 1) Descripciones precisas. 2) Enlaces rotos. 3) Cero quejas por calidad física.",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Auditoría de Fichas de Producto (SEO/Copy) (PoW: Link a Reporte de Errores Shopify/Woo)" },
                    { estimatedHours: 3.0, name: "Test de Calidad de Muestras (Hardware/Textil) (PoW: Documento de Aprobación de Muestra)" }
                ]
            },
            {
                levelId: "@baixos", name: "Media Buyer / Catalog Manager", multiplier: 1.2, fmv: 35,
                ai_prompt: "Eres Operador Senior. Indicadores: 1) ROAS de campañas de Shopping. 2) Catálogo actualizado y optimizado.",
                standard_deliverables: [
                    { estimatedHours: 5.0, name: "Creación/Actualización de 50 Fichas de Producto (PoW: Link a categoría en Web)" },
                    { estimatedHours: 6.0, name: "Campaña Google Performance Max (PoW: Screenshot Panel ROAS)" }
                ]
            },
            {
                levelId: "@pinya", name: "Customer Success / Atención L1", multiplier: 1.0, fmv: 20,
                ai_prompt: "Eres Atención al Cliente. Indicadores: 1) Tiempo de primera respuesta. 2) Resolución de disputas/devoluciones con empatía.",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Gestión de Lote de Devoluciones (20x) (PoW: Log de reembolsos emitidos en Stripe/Shopify)" },
                    { estimatedHours: 3.5, name: "Limpieza de Inbox (Email/Chat) (PoW: Screenshot Inbox a 0)" }
                ]
            }
        ]
    }
};
