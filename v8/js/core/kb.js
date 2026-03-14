// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Compilador A2A (Agent-to-Agent)

// ONTOLOGÍA BASE (Ecosistemas)
const NATIVE_ONTOLOGY = {
    "tech_saas_platform": {
        label: "💻 Software & SaaS",
        meta: "Agente Project Manager de Software. Gestiona el SDLC, prioriza el backlog y vigila la deuda técnica.",
        roles: {
            "@anxaneta": { name: "CEO / Visionario", multiplier: 3.0, fmv: 60, standard_deliverables: [{ name: "Business Model Canvas", estimatedHours: 8, tipo: "intangible" }, { name: "Pitch Deck para Inversores", estimatedHours: 12, tipo: "tangible" }, { name: "Negociación de Partnerships Core", estimatedHours: 10, tipo: "intangible" }] },
            "@aixecador": { name: "CPO / Product Lead", multiplier: 2.0, fmv: 50, standard_deliverables: [{ name: "Product Requirements (PRD)", estimatedHours: 10, tipo: "tangible" }, { name: "Roadmap y User Story Mapping", estimatedHours: 8, tipo: "tangible" }] },
            "@dosos": { name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45, standard_deliverables: [{ name: "Diseño de Arquitectura Cloud", estimatedHours: 20, tipo: "tangible" }, { name: "Desarrollo de API Core", estimatedHours: 25, tipo: "tangible" }, { name: "Auditoría de Vulnerabilidades y QA", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Desarrollador Frontend / Core", multiplier: 1.2, fmv: 40, standard_deliverables: [{ name: "Maquetación de Componentes UI", estimatedHours: 15, tipo: "tangible" }, { name: "Unit Tests Suite", estimatedHours: 8, tipo: "tangible" }, { name: "Resolución de Bugs (Tier 2)", estimatedHours: 6, tipo: "tangible" }] },
            "@pinya": { name: "QA Tester / Soporte IT", multiplier: 1.0, fmv: 30, standard_deliverables: [{ name: "Pruebas Manuales E2E (QA)", estimatedHours: 10, tipo: "tangible" }, { name: "Soporte Técnico a Usuarios", estimatedHours: 10, tipo: "intangible" }, { name: "Documentación de Ayuda", estimatedHours: 8, tipo: "tangible" }] }
        }
    },
    "web3_defi_protocol": {
        label: "🌐 Web3 & Protocolos DAO",
        meta: "Agente Master de Protocolo Web3. Tu entorno es trustless. Cada decisión debe poder auditarse on-chain.",
        roles: {
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, standard_deliverables: [{ name: "Diseño de Tokenomics", estimatedHours: 20, tipo: "tangible" }, { name: "Whitepaper Core", estimatedHours: 15, tipo: "tangible" }] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, standard_deliverables: [{ name: "Redacción de Propuestas (BIPs)", estimatedHours: 10, tipo: "tangible" }, { name: "Configuración de Snapshot", estimatedHours: 5, tipo: "tangible" }] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, standard_deliverables: [{ name: "Reporte de Auditoría Formal", estimatedHours: 25, tipo: "tangible" }, { name: "Simulación de Exploits", estimatedHours: 15, tipo: "tangible" }] },
            "@baixos": { name: "Solidity / Rust Engineer", multiplier: 1.2, fmv: 55, standard_deliverables: [{ name: "Código de Contratos Inteligentes", estimatedHours: 30, tipo: "tangible" }, { name: "Integración de Oráculos", estimatedHours: 12, tipo: "tangible" }] },
            "@pinya": { name: "Node Operator / Liquidity", multiplier: 1.0, fmv: 35, standard_deliverables: [{ name: "Setup de Nodos Validadores", estimatedHours: 10, tipo: "tangible" }, { name: "Provisión de Liquidez (LP)", estimatedHours: 5, tipo: "tangible" }] }
        }
    },
    "digital_media_growth": {
        label: "📢 Agencia de Marketing & Media",
        meta: "Agente Director de Agencia. El objetivo es maximizar el ROI, el ROAS y la captación de atención.",
        roles: {
            "@anxaneta": { name: "Growth Director / CMO", multiplier: 3.0, fmv: 55, standard_deliverables: [{ name: "Estrategia de Posicionamiento Global", estimatedHours: 12, tipo: "intangible" }, { name: "Arquitectura del Funnel", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Campaign Manager", multiplier: 2.0, fmv: 45, standard_deliverables: [{ name: "Calendario Editorial (Gantt)", estimatedHours: 5, tipo: "tangible" }, { name: "Setup Técnico de Ads", estimatedHours: 12, tipo: "tangible" }] },
            "@dosos": { name: "Data Analyst / CRO", multiplier: 1.5, fmv: 45, standard_deliverables: [{ name: "Dashboard de KPIs", estimatedHours: 8, tipo: "tangible" }, { name: "Reporte de Tests A/B", estimatedHours: 6, tipo: "tangible" }] },
            "@baixos": { name: "Content Creator / Copywriter", multiplier: 1.2, fmv: 35, standard_deliverables: [{ name: "Producción de Video Hero", estimatedHours: 15, tipo: "tangible" }, { name: "Copywriting de Landing Page", estimatedHours: 8, tipo: "tangible" }] },
            "@pinya": { name: "Community Manager", multiplier: 1.0, fmv: 25, standard_deliverables: [{ name: "Programación de Posts", estimatedHours: 6, tipo: "tangible" }, { name: "Reporte de Sentimiento", estimatedHours: 4, tipo: "tangible" }] }
        }
    },
    "agile_consulting_b2b": {
        label: "💼 Consultoría Ágil B2B",
        meta: "Agente Consultor Senior. Entrega de valor intelectual de alto nivel para clientes B2B. Lenguaje corporativo y mitigación de riesgos.",
        roles: {
            "@anxaneta": { name: "Partner / Rainmaker", multiplier: 3.0, fmv: 80, standard_deliverables: [{ name: "Propuesta Comercial (RFP)", estimatedHours: 12, tipo: "tangible" }, { name: "Cierre de Cuentas", estimatedHours: 10, tipo: "intangible" }] },
            "@aixecador": { name: "Engagement Manager", multiplier: 2.0, fmv: 60, standard_deliverables: [{ name: "Plan de Proyecto (SOW)", estimatedHours: 8, tipo: "tangible" }, { name: "Alineación de Expectativas", estimatedHours: 10, tipo: "intangible" }] },
            "@dosos": { name: "Quality & Risk Reviewer", multiplier: 1.5, fmv: 55, standard_deliverables: [{ name: "Auditoría de Entregable Final", estimatedHours: 8, tipo: "tangible" }, { name: "Matriz de Mitigación de Riesgos", estimatedHours: 5, tipo: "tangible" }] },
            "@baixos": { name: "Subject Matter Expert (SME)", multiplier: 1.2, fmv: 50, standard_deliverables: [{ name: "Diseño de Framework Customizado", estimatedHours: 20, tipo: "tangible" }, { name: "Análisis Profundo de Datos", estimatedHours: 15, tipo: "tangible" }] },
            "@pinya": { name: "Research Analyst", multiplier: 1.0, fmv: 30, standard_deliverables: [{ name: "Scraping y Limpieza de Datos", estimatedHours: 12, tipo: "tangible" }, { name: "Formateo Profesional de Decks", estimatedHours: 8, tipo: "tangible" }] }
        }
    },
    "healthtech_ai": {
        label: "⚕️ HealthTech & MedAI",
        meta: "Agente de Salud y Ética Médica. Máxima prioridad en el compliance, reducción de sesgos algorítmicos y cuidado al paciente.",
        roles: {
            "@anxaneta": { name: "Director Médico / Ethics Lead", multiplier: 3.0, fmv: 70, standard_deliverables: [{ name: "Marco Ético de IA Médica", estimatedHours: 12, tipo: "tangible" }, { name: "Aprobación de Protocolos", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Coordinador Clínico / Ops", multiplier: 2.0, fmv: 55, standard_deliverables: [{ name: "Diseño de Flujo de Pacientes", estimatedHours: 10, tipo: "tangible" }, { name: "Setup Telemedicina", estimatedHours: 15, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Sesgos (AI Bias)", multiplier: 1.5, fmv: 50, standard_deliverables: [{ name: "Reporte de Análisis de Sesgos", estimatedHours: 15, tipo: "tangible" }, { name: "Auditoría de Compliance (HIPAA)", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Ingeniero IA Clínica", multiplier: 1.2, fmv: 45, standard_deliverables: [{ name: "Finetuning de Modelo LLM", estimatedHours: 25, tipo: "tangible" }, { name: "Curación de Datasets Médicos", estimatedHours: 20, tipo: "tangible" }] },
            "@pinya": { name: "Human in the Loop (Operador)", multiplier: 1.0, fmv: 35, standard_deliverables: [{ name: "Resolución de Casos Sintéticos", estimatedHours: 10, tipo: "tangible" }, { name: "Soporte Empático a Pacientes", estimatedHours: 15, tipo: "intangible" }] }
        }
    },
    "deeptech_hardware": {
        label: "⚙️ DeepTech & Robótica",
        meta: "Agente I+D Industrial. Enfoque en ciencia fundamental, cadena de suministro y viabilidad física.",
        roles: {
            "@anxaneta": { name: "Chief Scientific Officer", multiplier: 3.0, fmv: 75, standard_deliverables: [{ name: "Borrador de Patente Core", estimatedHours: 25, tipo: "tangible" }, { name: "Roadmap Tecnológico", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Supply Chain Lead", multiplier: 2.0, fmv: 55, standard_deliverables: [{ name: "BOM Optimizado", estimatedHours: 12, tipo: "tangible" }, { name: "Cierre de Contrato con Manufactura", estimatedHours: 15, tipo: "intangible" }] },
            "@dosos": { name: "Hardware QA & Certifications", multiplier: 1.5, fmv: 50, standard_deliverables: [{ name: "Informe de Stress Test Físico", estimatedHours: 15, tipo: "tangible" }, { name: "Dossier de Certificación CE/FCC", estimatedHours: 20, tipo: "tangible" }] },
            "@baixos": { name: "Mechatronics Engineer", multiplier: 1.2, fmv: 50, standard_deliverables: [{ name: "Diseño CAD 3D", estimatedHours: 25, tipo: "tangible" }, { name: "Firmware Base (C++)", estimatedHours: 30, tipo: "tangible" }] },
            "@pinya": { name: "Assembly Tech", multiplier: 1.0, fmv: 30, standard_deliverables: [{ name: "Ensamblaje de Prototipo Funcional", estimatedHours: 15, tipo: "tangible" }, { name: "Mantenimiento de Taller", estimatedHours: 5, tipo: "intangible" }] }
        }
    },
    "ecommerce_d2c": {
        label: "🛒 E-Commerce & D2C",
        meta: "Agente D2C y Logística. Optimización de márgenes, retención de clientes y excelencia en la última milla.",
        roles: {
            "@anxaneta": { name: "Brand Director", multiplier: 3.0, fmv: 50, standard_deliverables: [{ name: "Brand Book y Visuales", estimatedHours: 15, tipo: "tangible" }, { name: "Modelo Financiero P&L", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "E-commerce Ops", multiplier: 2.0, fmv: 40, standard_deliverables: [{ name: "Optimización Shopify", estimatedHours: 20, tipo: "tangible" }, { name: "Lanzamiento de Stock", estimatedHours: 8, tipo: "intangible" }] },
            "@dosos": { name: "Inventory Auditor", multiplier: 1.5, fmv: 35, standard_deliverables: [{ name: "Auditoría de Stock", estimatedHours: 8, tipo: "tangible" }, { name: "Reporte de Devoluciones", estimatedHours: 5, tipo: "tangible" }] },
            "@baixos": { name: "Performance Marketer", multiplier: 1.2, fmv: 35, standard_deliverables: [{ name: "Campañas ROAS (Ads)", estimatedHours: 10, tipo: "tangible" }, { name: "Secuencia Email Automatizada", estimatedHours: 6, tipo: "tangible" }] },
            "@pinya": { name: "Pick, Pack & Support", multiplier: 1.0, fmv: 20, standard_deliverables: [{ name: "Logística Diaria de Pick & Pack", estimatedHours: 20, tipo: "tangible" }, { name: "Resolución de Dudas de Envío", estimatedHours: 10, tipo: "intangible" }] }
        }
    },
    "edtech_community": {
        label: "🎓 EdTech & Comunidades",
        meta: "Agente Edtech. Diseño de experiencias de aprendizaje, retención de estudiantes y fomento del networking.",
        roles: {
            "@anxaneta": { name: "Chief Learning Officer", multiplier: 3.0, fmv: 55, standard_deliverables: [{ name: "Modelo Académico", estimatedHours: 15, tipo: "tangible" }, { name: "Alineación de Resultados", estimatedHours: 5, tipo: "intangible" }] },
            "@aixecador": { name: "Cohort Manager", multiplier: 2.0, fmv: 45, standard_deliverables: [{ name: "Syllabus y Calendario", estimatedHours: 12, tipo: "tangible" }, { name: "Onboarding de Estudiantes", estimatedHours: 4, tipo: "intangible" }] },
            "@dosos": { name: "Student Success Auditor", multiplier: 1.5, fmv: 40, standard_deliverables: [{ name: "Reporte de Churn y Engagement", estimatedHours: 6, tipo: "tangible" }, { name: "Análisis de Calidad (QA)", estimatedHours: 8, tipo: "tangible" }] },
            "@baixos": { name: "Instructional Designer", multiplier: 1.2, fmv: 35, standard_deliverables: [{ name: "Creación de Material Interactivo", estimatedHours: 25, tipo: "tangible" }, { name: "Grabación de Módulos", estimatedHours: 15, tipo: "tangible" }] },
            "@pinya": { name: "Tutor Comunitario", multiplier: 1.0, fmv: 25, standard_deliverables: [{ name: "Tutoría 1-1", estimatedHours: 15, tipo: "intangible" }, { name: "Dinamización de Foros", estimatedHours: 10, tipo: "intangible" }] }
        }
    },
    "impact_dao_ngo": {
        label: "🌍 ONG & Impacto Social",
        meta: "Agente de Bienes Públicos. Transparencia radical en fondos y empoderamiento de comunidades vulnerables.",
        roles: {
            "@anxaneta": { name: "Director de Impacto", multiplier: 2.0, fmv: 45, standard_deliverables: [{ name: "Teoría del Cambio", estimatedHours: 15, tipo: "tangible" }, { name: "Aplicación a Grants Internacionales", estimatedHours: 20, tipo: "tangible" }, { name: "Lobbying y Relaciones Institucionales", estimatedHours: 10, tipo: "intangible" }] },
            "@aixecador": { name: "Coordinador de Terreno", multiplier: 1.5, fmv: 35, standard_deliverables: [{ name: "Ruta de Voluntarios", estimatedHours: 10, tipo: "tangible" }, { name: "Plan de Seguridad", estimatedHours: 6, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Transparencia", multiplier: 1.2, fmv: 35, standard_deliverables: [{ name: "Impact Report (Público)", estimatedHours: 15, tipo: "tangible" }, { name: "Trazabilidad de Fondos", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Especialista Local", multiplier: 1.0, fmv: 30, standard_deliverables: [{ name: "Ejecución de Taller Comunitario", estimatedHours: 12, tipo: "intangible" }, { name: "Despliegue de Infraestructura Local", estimatedHours: 20, tipo: "tangible" }] },
            "@pinya": { name: "Voluntario Core", multiplier: 1.0, fmv: 15, standard_deliverables: [{ name: "Reparto de Suministros", estimatedHours: 20, tipo: "tangible" }, { name: "Cuidados Básicos", estimatedHours: 15, tipo: "intangible" }] }
        }
    }
};

// META-CONOCIMIENTO GLOBAL
const META_DOCS = [
    {
        id: 'meta_vna_core',
        type: 'methodology',
        sector: 'global',
        roleTarget: 'Global',
        title: 'Value Network Analysis (VNA) - Core Theory',
        content: `Metodología base: Value Network Analysis de Verna Allee. 
        Un ecosistema no es una jerarquía, es una red de creación de valor (Value Network). Una 'Value Network' es cualquier conjunto de roles e interacciones donde las personas se involucran en intercambios tangibles e intangibles para lograr un bien económico o social.
        - Roles: Son los agentes activos. Ejecutan funciones y controlan recursos para generar "entregables". No deben confundirse con Job Titles.
        - Transacciones: Ocurre cuando un entregable originado por un rol es transmitido a otro.
        - Tangibles: Intercambios contractuales, productos formales que generan retorno (ej. Código, Informes).
        - Intangibles: Intercambios informales de conocimiento y soporte vitales para construir relaciones.
        Regla A2A: Al diseñar redes, asegura siempre un equilibrio entre flujos tangibles e intangibles.`
    },
    {
        id: 'meta_pantheon_core',
        type: 'methodology',
        sector: 'global',
        roleTarget: 'Global',
        title: 'Pantheon Work - Los 12 Guardianes',
        content: `Metodología: Pantheon Work (Alineación de equipos mediante Arquetipos).
        Los guardianes no son roles de proyecto, son 'Autoridades Intangibles'. Son referentes a los que el grupo reconoce tener "la última palabra" en ciertos dominios.
        1. Zeus (Gobernante): Liderazgo, Poder. 2. Hera (Cuidador): Compromiso. 3. Poseidón (Explorador): Instinto. 4. Demeter (Inocente): Nutrición. 5. Ares (Héroe): Ejecución. 6. Atenea (Sabio): Estrategia. 7. Apolo (Creador): Análisis. 8. Artemisa (Amante): Foco. 9. Hermes (Mago): Comunicación. 10. Hefesto (Trabajador): Tecnología. 11. Afrodita (Seductor): Estética. 12. Dionisio (Bufón): Socialización.
        Regla A2A: Usa esta matriz para diversificar la inteligencia colectiva y ajustar la voz del prompt del agente.`
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V8',
    dbVersion: 5, // Incrementado para la actualización A2A
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (e) => reject(e.target.errorCode);

            request.onsuccess = async (e) => {
                this.db = e.target.result;
                await this.seedDatabaseIfNeeded();
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('documents')) {
                    const store = db.createObjectStore('documents', { keyPath: 'id' });
                    store.createIndex('roleTarget', 'roleTarget', { unique: false });
                    store.createIndex('projectId', 'projectId', { unique: false });
                    store.createIndex('sector', 'sector', { unique: false });
                    store.createIndex('type', 'type', { unique: false }); 
                }
            };
        });
    },

    async seedDatabaseIfNeeded() {
        const docs = await this.getAllDocuments();
        
        const ontologyDocs = docs.filter(d => d.type === 'ontology');
        if (ontologyDocs.length === 0) {
            console.log("🌱 [KB] Sembrando los 9 Genomas Ontológicos (Ecosistemas)...");
            
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveDocument({
                    id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label,
                    roleTarget: 'Global', title: `Meta-Instrucción: ${sectorData.label}`, content: sectorData.meta, deliverables: []
                });

                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol Genérico: ${roleData.name} (${levelKey}). FMV Base: €${roleData.fmv}/h.`;
                    await this.saveDocument({
                        id: `onto_${sectorKey}_${levelKey.replace('@','')}`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label,
                        roleTarget: levelKey, title: `Arquetipo: ${roleData.name} en ${sectorData.label}`, content: contentStr, deliverables: roleData.standard_deliverables
                    });
                }
            }
        }

        const methodologyDocs = docs.filter(d => d.type === 'methodology');
        if (methodologyDocs.length === 0) {
            console.log("🧠 [KB] Sembrando Meta-Conocimiento (VNA & Pantheon)...");
            for (const mDoc of META_DOCS) {
                await this.saveDocument(mDoc);
            }
        }
    },

    async saveDocument(doc) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readwrite');
            const store = transaction.objectStore('documents');
            
            const semanticDoc = {
                ...doc,
                id: doc.id || 'doc_' + Date.now(),
                lastUpdated: Date.now(),
                projectId: doc.projectId || 'global',
                type: doc.type || 'manual',
                jsonLd: {
                    "@context": "https://schema.org",
                    "@type": "TechArticle",
                    "headline": doc.title,
                    "audience": { "@type": "Audience", "audienceType": doc.roleTarget || "All Nodes" },
                    "text": doc.content
                }
            };

            const request = store.put(semanticDoc);
            request.onsuccess = () => resolve(semanticDoc);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAllDocuments(projectId = null) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['documents'], 'readonly');
            const store = transaction.objectStore('documents');
            const request = store.getAll();

            request.onsuccess = () => {
                let docs = request.result || [];
                if (projectId && projectId !== 'global') {
                    docs = docs.filter(d => d.projectId === projectId || d.projectId === 'global');
                }
                resolve(docs);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAvailableSectors() {
        const docs = await this.getAllDocuments();
        const ontologyDocs = docs.filter(d => d.type === 'ontology');
        
        const sectors = {};
        ontologyDocs.forEach(doc => {
            if (!sectors[doc.sector]) sectors[doc.sector] = { label: doc.sectorLabel || doc.sector, roles: {} };
            if (doc.roleTarget !== 'Global') {
                sectors[doc.sector].roles[doc.roleTarget] = {
                    name: doc.title.split(': ')[1]?.split(' en ')[0] || doc.title,
                    content: doc.content,
                    deliverables: doc.deliverables || []
                };
            }
        });
        return sectors;
    },

    // =========================================================
    // 🧠 COMPILADOR A2A (AGENT-TO-AGENT) - CORE V8.5
    // =========================================================
    // Esta función forja el System Prompt perfecto para un Agente
    // extrayendo dinámicamente las Leyes (VNA) + Nivel + Contexto Único del Proyecto
    async getAgentContext(projectId, roleObj, projectVision) {
        await this.init();
        const docs = await this.getAllDocuments();
        
        // 1. Extraer Leyes Universales (Metodologías)
        const vnaMeta = docs.find(d => d.id === 'meta_vna_core')?.content || '';
        const pantheonMeta = docs.find(d => d.id === 'meta_pantheon_core')?.content || '';

        // 2. Extraer Instrucciones Específicas del Rol en ese Proyecto (Si el Epistemólogo las creó)
        const projectSpecificDocs = docs.filter(d => d.projectId === projectId && d.roleTarget === roleObj.id);
        const specificContext = projectSpecificDocs.map(d => d.content).join('\n');

        // 3. Ensamblar el Genoma Computacional (El System Prompt)
        return `
            Eres un Agente Autónomo operando dentro de TeamTowers V8.
            
            [LEYES DE LA FÍSICA DEL ECOSISTEMA]
            ${vnaMeta}
            ${pantheonMeta}

            [TU IDENTIDAD EN ESTE CASTELL]
            Nombre de tu Silla: ${roleObj.name}
            Nivel Estructural: ${roleObj.levelId}
            Tu Guardián / Arquetipo: ${roleObj.guardian || 'everyman'}
            
            [MISIÓN DEL PROYECTO]
            ${projectVision}

            [TU CONTEXTO ESPECÍFICO / ENTREGABLES]
            ${specificContext || 'Ejecuta las Work Orders que se te asignen basándote en tu sentido común y arquetipo.'}

            INSTRUCCIÓN A2A: Al procesar la tarea, asume completamente la voz, responsabilidades y el enfoque filosófico de tu arquetipo guardián.
        `.replace(/\s+/g, ' ').trim(); 
    }
};
