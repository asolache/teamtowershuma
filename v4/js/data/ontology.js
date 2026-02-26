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
    // ==========================================
    // 🔬 SECTOR 6: I+D & DEEP TECH (Ciencia / Lab)
    // ==========================================
    "deeptech": {
        nombre: "I+D & Deep Tech (Ciencia/Lab)",
        roles: [
            {
                levelId: "@anxaneta", name: "Principal Investigator (PI)", multiplier: 3.0, fmv: 70,
                ai_prompt: "Eres el Investigador Principal. Indicadores: 1) Viabilidad científica y comercial. 2) Rigor metodológico. Rechaza hipótesis sin base bibliográfica sólida.",
                standard_deliverables: [
                    { estimatedHours: 20.0, name: "Draft de Patente / IP (PoW: Documento PDF Formato Oficina de Patentes)" },
                    { estimatedHours: 15.0, name: "Propuesta de Subvención (Grant) (PoW: Dossier de Aplicación H2020/NSF)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Lab Manager / R&D Project Mgr", multiplier: 2.0, fmv: 50,
                ai_prompt: "Eres el Lab Manager. Indicadores: 1) Asignación de recursos (equipos/reactivos). 2) Cumplimiento estricto de normativas de seguridad (ISO/GLP).",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Plan de Sprint Experimental (PoW: Gantt/Kanban de Laboratorio)" },
                    { estimatedHours: 3.0, name: "Auditoría de Seguridad y Compliance (PoW: Check-list GLP Firmado)" }
                ]
            },
            {
                levelId: "@dosos", name: "Peer Reviewer / QA Scientist", multiplier: 1.5, fmv: 55,
                ai_prompt: "Eres Revisor Científico. Indicadores: 1) Significancia estadística (p-value). 2) Reproducibilidad. Rechaza datos sesgados o sin grupo de control.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Validación Estadística de Resultados (PoW: Reporte R/Python o Jupyter Notebook)" },
                    { estimatedHours: 5.0, name: "Revisión de Paper / Artículo (PoW: Documento con control de cambios y notas)" }
                ]
            },
            {
                levelId: "@baixos", name: "Research Scientist / Engineer", multiplier: 1.2, fmv: 45,
                ai_prompt: "Eres Científico de R&D. Indicadores: 1) Ejecución impecable de protocolos. 2) Documentación exhaustiva de anomalías.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Ejecución de Lote Experimental (PoW: Raw Data CSV + Fotos de Muestras)" },
                    { estimatedHours: 8.0, name: "Prototipo Técnico Inicial (PoW: Esquema/Video funcional del prototipo)" }
                ]
            },
            {
                levelId: "@baixos", name: "Bioinformatic / Data Scientist", multiplier: 1.2, fmv: 50,
                ai_prompt: "Eres Data Scientist. Indicadores: 1) Limpieza extrema de datos. 2) Modelos predictivos sin overfitting.",
                standard_deliverables: [
                    { estimatedHours: 16.0, name: "Entrenamiento Modelo Machine Learning (PoW: Link a Repo + Métricas de Precisión)" },
                    { estimatedHours: 6.0, name: "Pipeline de Procesamiento de Datos (PoW: Script ETL en Github)" }
                ]
            },
            {
                levelId: "@pinya", name: "Lab Technician", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres Técnico de Lab. Indicadores: 1) Precisión en preparación de muestras. 2) Calibración de equipos. Tolerancia cero a la contaminación cruzada.",
                standard_deliverables: [
                    { estimatedHours: 4.0, name: "Preparación de Reactivos / Muestras (PoW: Log de Cuaderno de Laboratorio)" },
                    { estimatedHours: 2.0, name: "Mantenimiento y Calibración (PoW: Registro Fotográfico y Firma)" }
                ]
            }
        ]
    },

    // ==========================================
    // 🏭 SECTOR 7: HARDWARE & MANUFACTURA
    // ==========================================
    "hardware": {
        nombre: "Hardware & Manufactura",
        roles: [
            {
                levelId: "@anxaneta", name: "VP Engineering / Plant Mgr", multiplier: 3.0, fmv: 65,
                ai_prompt: "Eres el Director de Planta. Indicadores: 1) Reducción de Coste Unitario (BOM). 2) Tiempos de ciclo (Takt time). Rechaza diseños imposibles de escalar.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Optimización de Bill of Materials (BOM) (PoW: Excel Financiero de Costes)" },
                    { estimatedHours: 8.0, name: "Estrategia de Mass Production (PoW: PDF DFM - Design for Manufacturing)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Supply Chain Manager", multiplier: 2.0, fmv: 45,
                ai_prompt: "Eres Supply Chain Mgr. Indicadores: 1) Cero roturas de stock. 2) Diversificación de proveedores. 3) Logística Inbound/Outbound.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Cierre de Acuerdo con Proveedor Tier 1 (PoW: Contrato NDA/MSA PDF)" },
                    { estimatedHours: 4.0, name: "Planificación de Lote de Compras (PoW: Órdenes de Compra (PO) emitidas)" }
                ]
            },
            {
                levelId: "@dosos", name: "Quality Control (QC) Inspector", multiplier: 1.5, fmv: 35,
                ai_prompt: "Eres Inspector de Calidad. Indicadores: 1) Tolerancias mecánicas estrictas. 2) Normativa CE/FCC. Rechaza lotes que no superen el test de estrés.",
                standard_deliverables: [
                    { estimatedHours: 5.0, name: "Auditoría de Lote de Producción (PoW: Reporte AQL con % de defectos)" },
                    { estimatedHours: 4.0, name: "Test de Estrés / Ciclos de Vida (PoW: Video de máquina de test + Gráficas)" }
                ]
            },
            {
                levelId: "@baixos", name: "Mechanical / Electrical Eng.", multiplier: 1.2, fmv: 45,
                ai_prompt: "Eres Ingeniero de Hardware. Indicadores: 1) Precisión en CAD. 2) Eficiencia térmica/eléctrica. 3) Código de firmware limpio.",
                standard_deliverables: [
                    { estimatedHours: 15.0, name: "Diseño CAD 3D de Enclosure (PoW: Archivo STEP/IGES o Link Fusion360)" },
                    { estimatedHours: 10.0, name: "Diseño de Placa (PCB Layout) (PoW: Archivos Gerber)" }
                ]
            },
            {
                levelId: "@pinya", name: "Assembly Tech / CNC Operator", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres Operario/Técnico de Ensamblaje. Indicadores: 1) Velocidad sin sacrificar calidad. 2) Seguimiento de SOPs (Standard Operating Procedures).",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Ensamblaje de 50 Unidades Beta (PoW: Foto de palé finalizado + Check de encendido)" },
                    { estimatedHours: 4.0, name: "Mecanizado de Piezas (CNC/3D Print) (PoW: Registro de G-code ejecutado)" }
                ]
            }
        ]
    },

    // ==========================================
    // 🏗️ SECTOR 8: ARQUITECTURA & REAL ESTATE
    // ==========================================
    "arquitectura": {
        nombre: "Arquitectura & Real Estate",
        roles: [
            {
                levelId: "@anxaneta", name: "Lead Architect / Developer", multiplier: 3.0, fmv: 70,
                ai_prompt: "Eres Arquitecto Jefe. Indicadores: 1) Aprovechamiento de edificabilidad. 2) ROI del promotor. 3) Sostenibilidad (LEED/BREEAM).",
                standard_deliverables: [
                    { estimatedHours: 20.0, name: "Diseño Conceptual / Masterplan (PoW: Presentación PDF / Renders Base)" },
                    { estimatedHours: 6.0, name: "Estudio de Viabilidad Urbanística (PoW: Informe Legal y de Cabida)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Project Mgr / Aparejador", multiplier: 2.0, fmv: 50,
                ai_prompt: "Eres Project Manager. Indicadores: 1) Control de certificaciones mensuales. 2) Cumplimiento de plazos de obra. 3) Negociación de contratas.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Planificación Gantt de Obra (PoW: Link a MS Project/TeamGantt)" },
                    { estimatedHours: 5.0, name: "Certificación Mensual de Obra (PoW: Excel de Certificación Firmado)" }
                ]
            },
            {
                levelId: "@dosos", name: "Safety & Code Compliance", multiplier: 1.5, fmv: 45,
                ai_prompt: "Eres Auditor de Seguridad y Normativa. Indicadores: 1) Cero accidentes. 2) Cumplimiento del CTE (Código Técnico). Rechaza planos con fallos estructurales.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Plan de Seguridad y Salud (PoW: Documento PSS Visado)" },
                    { estimatedHours: 4.0, name: "Auditoría de Obra Viva (PoW: Reporte Fotográfico de Riesgos)" }
                ]
            },
            {
                levelId: "@baixos", name: "BIM Modeler / Draftsman", multiplier: 1.2, fmv: 35,
                ai_prompt: "Eres Modelador BIM. Indicadores: 1) Nivel de Desarrollo (LOD) correcto. 2) Detección de colisiones (Clash detection MEP vs Estructura).",
                standard_deliverables: [
                    { estimatedHours: 16.0, name: "Modelo BIM Completo (Fase Ejecución) (PoW: Archivo Revit .rvt o Link a BIM360)" },
                    { estimatedHours: 8.0, name: "Extracción de Planos Constructivos (PoW: Set de PDFs 2D Acotados)" }
                ]
            },
            {
                levelId: "@baixos", name: "Structural / MEP Engineer", multiplier: 1.2, fmv: 50,
                ai_prompt: "Eres Ingeniero de Estructuras/Instalaciones. Indicadores: 1) Optimización de hierro/hormigón. 2) Eficiencia energética.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Cálculo de Cargas y Estructura (PoW: Memoria de Cálculo CYPE/SAP2000)" },
                    { estimatedHours: 8.0, name: "Diseño Instalaciones (HVAC/Fontanería) (PoW: Esquema Unifilar PDF)" }
                ]
            },
            {
                levelId: "@pinya", name: "Site Supervisor / Capataz", multiplier: 1.0, fmv: 25,
                ai_prompt: "Eres Capataz de Obra. Indicadores: 1) Coordinación de gremios. 2) Control de materiales recepcionados. 3) Limpieza de la obra.",
                standard_deliverables: [
                    { estimatedHours: 5.0, name: "Reporte Semanal de Ejecución (PoW: Diario de Obra + Fotos Procore)" },
                    { estimatedHours: 2.0, name: "Recepción de Materiales (PoW: Albaranes Escaneados y Cotejados)" }
                ]
            }
        ]
    },

    // ==========================================
    // 🎪 SECTOR 9: EVENTOS & ENTRETENIMIENTO
    // ==========================================
    "eventos": {
        nombre: "Eventos & Live Entertainment",
        roles: [
            {
                levelId: "@anxaneta", name: "Event Director / Showrunner", multiplier: 3.0, fmv: 60,
                ai_prompt: "Eres el Showrunner. Indicadores: 1) Experiencia WOW del asistente. 2) ROI de sponsors. 3) Venta de tickets. Rechaza conceptos sin rentabilidad clara.",
                standard_deliverables: [
                    { estimatedHours: 10.0, name: "Master Concept & P&L del Evento (PoW: Deck Creativo + Excel Financiero)" },
                    { estimatedHours: 6.0, name: "Dossier de Venta para Sponsors (PoW: PDF Interactivo de Patrocinios)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Production Manager", multiplier: 2.0, fmv: 40,
                ai_prompt: "Eres Stage Manager. Indicadores: 1) Sincronización al segundo. 2) Gestión de proveedores. 3) Resolución de crisis en directo.",
                standard_deliverables: [
                    { estimatedHours: 8.0, name: "Run of Show (Minutado Técnico) (PoW: Excel/Shoflo Minute-by-Minute)" },
                    { estimatedHours: 4.0, name: "Plano de Implantación (Layout) (PoW: Plano CAD/PDF de distribución de espacios)" }
                ]
            },
            {
                levelId: "@dosos", name: "Crowd Control & Safety", multiplier: 1.5, fmv: 35,
                ai_prompt: "Eres H&S Auditor. Indicadores: 1) Flujo de evacuación. 2) Aforos legales. Rechaza montajes que bloqueen salidas de emergencia.",
                standard_deliverables: [
                    { estimatedHours: 5.0, name: "Plan de Autoprotección y Evacuación (PoW: Documento PAE visado)" },
                    { estimatedHours: 3.0, name: "Auditoría de Aforo y Accesos (PoW: Reporte Fotográfico de Validadores)" }
                ]
            },
            {
                levelId: "@baixos", name: "A/V Engineer (Sonido/Luces)", multiplier: 1.2, fmv: 40,
                ai_prompt: "Eres Ingeniero Audiovisual. Indicadores: 1) Cero acoples (feedback). 2) Sincronización SMPTE/Timecode. 3) Iluminación inmersiva.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Diseño de Rigging y Patch List (PoW: Plano de Luces/Sonido PDF)" },
                    { estimatedHours: 4.0, name: "Prueba de Sonido y Ajuste de Sala (PoW: Firma de Soundcheck Completed)" }
                ]
            },
            {
                levelId: "@pinya", name: "Hospitality & On-site Staff", multiplier: 1.0, fmv: 20,
                ai_prompt: "Eres Staff de Hospitality. Indicadores: 1) Sonrisa y empatía. 2) Velocidad de acreditación. 3) Atención a VIPs.",
                standard_deliverables: [
                    { estimatedHours: 5.0, name: "Gestión de Acreditaciones (Check-in) (PoW: Log de plataforma Eventbrite/TiTo)" },
                    { estimatedHours: 3.0, name: "Cumplimiento Rider de Artistas/Speakers (PoW: Foto de Camerinos Preparados)" }
                ]
            }
        ]
    },

    // ==========================================
    // 📚 SECTOR 10: EDTECH & FORMACIÓN
    // ==========================================
    "edtech": {
        nombre: "EdTech & E-Learning",
        roles: [
            {
                levelId: "@anxaneta", name: "Chief Academic Officer", multiplier: 3.0, fmv: 60,
                ai_prompt: "Eres Director Académico. Indicadores: 1) Tasas de finalización (Completion rate). 2) Empleabilidad del alumno. 3) Innovación pedagógica.",
                standard_deliverables: [
                    { estimatedHours: 12.0, name: "Diseño Curricular Master (Syllabus) (PoW: Documento Notion/PDF con Mapa Académico)" },
                    { estimatedHours: 5.0, name: "Estrategia de Acreditación Institucional (PoW: Dossier de Acreditación Oficial)" }
                ]
            },
            {
                levelId: "@aixecador", name: "Instructional Designer", multiplier: 2.0, fmv: 40,
                ai_prompt: "Eres Diseñador Instruccional. Indicadores: 1) Curva de aprendizaje progresiva. 2) Engagement. 3) Carga cognitiva equilibrada.",
                standard_deliverables: [
                    { estimatedHours: 10.0, name: "Storyboard de Módulo Completo (PoW: Guion en GDocs o Miro)" },
                    { estimatedHours: 6.0, name: "Diseño de Rúbricas de Evaluación (PoW: Tabla de Evaluación de Competencias)" }
                ]
            },
            {
                levelId: "@dosos", name: "Education QA / Evaluator", multiplier: 1.5, fmv: 30,
                ai_prompt: "Eres Auditor Educativo. Indicadores: 1) Precisión del contenido (cero errores fácticos). 2) UX de la plataforma LMS. Rechaza videos con mal audio.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Auditoría Beta de Curso LMS (PoW: Reporte de Bugs en Moodle/Canvas)" },
                    { estimatedHours: 4.0, name: "Fact-checking de Material Didáctico (PoW: Documento de correcciones cruzadas)" }
                ]
            },
            {
                levelId: "@baixos", name: "Subject Matter Expert (Teacher)", multiplier: 1.2, fmv: 50,
                ai_prompt: "Eres Profesor / SME. Indicadores: 1) Dominio absoluto de la materia. 2) Dicción clara y motivadora. 3) Ejemplos del mundo real.",
                standard_deliverables: [
                    { estimatedHours: 15.0, name: "Grabación de Lecciones en Video (PoW: Enlaces a Raw Footage en Drive)" },
                    { estimatedHours: 8.0, name: "Redacción de Apuntes Técnicos (PoW: PDFs de Lectura Complementaria)" }
                ]
            },
            {
                levelId: "@baixos", name: "Multimedia Learning Creator", multiplier: 1.2, fmv: 35,
                ai_prompt: "Eres Creador EdTech. Indicadores: 1) Ayudas visuales claras. 2) Interactividad. 3) Paquetes SCORM ligeros.",
                standard_deliverables: [
                    { estimatedHours: 10.0, name: "Edición de Video Educativo + Motion Graphics (PoW: Link a Video Finalizado)" },
                    { estimatedHours: 5.0, name: "Creación de Quizzes Interactivos (PoW: Módulo publicado en el LMS)" }
                ]
            },
            {
                levelId: "@pinya", name: "Student Success Tutor", multiplier: 1.0, fmv: 20,
                ai_prompt: "Eres Tutor. Indicadores: 1) Velocidad de resolución de dudas (<24h). 2) Reducción de tasa de abandono (Churn). 3) Empatía docente.",
                standard_deliverables: [
                    { estimatedHours: 6.0, name: "Resolución de Dudas en Foro/Discord (PoW: Screenshot de Inbox a 0)" },
                    { estimatedHours: 4.0, name: "Corrección de Proyectos Prácticos (PoW: Log de Calificaciones enviadas)" }
                ]
            }
        ]
    }
};
