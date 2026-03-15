// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Auditoría Competencial Fractal (A2A)

// 1. GENOMA ONTOLÓGICO: Mapeo de Roles, Entregables y Guardianes Ideales por Sector
export const NATIVE_ONTOLOGY = {
    "tech_saas_platform": {
        label: "💻 Software & SaaS",
        meta: "Ecosistema orientado al ciclo de vida del software, escalabilidad y reducción de deuda técnica.",
        roles: {
            "@anxaneta": { name: "CEO / Visionario", multiplier: 3.0, fmv: 60, guardian: "ruler", standard_deliverables: [{ name: "Business Model Canvas", estimatedHours: 8, tipo: "intangible" }, { name: "Pitch Deck para Inversores", estimatedHours: 12, tipo: "tangible" }] },
            "@aixecador": { name: "CPO / Product Lead", multiplier: 2.0, fmv: 50, guardian: "creator", standard_deliverables: [{ name: "Product Requirements (PRD)", estimatedHours: 10, tipo: "tangible" }, { name: "User Story Mapping", estimatedHours: 8, tipo: "tangible" }] },
            "@dosos": { name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45, guardian: "sage", standard_deliverables: [{ name: "Diseño de Arquitectura Cloud", estimatedHours: 20, tipo: "tangible" }, { name: "Auditoría de Vulnerabilidades", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Desarrollador Frontend/Backend", multiplier: 1.2, fmv: 40, guardian: "hephaestus", standard_deliverables: [{ name: "Código Core / API", estimatedHours: 25, tipo: "tangible" }, { name: "Unit Tests Suite", estimatedHours: 8, tipo: "tangible" }] },
            "@pinya": { name: "QA Tester / Soporte IT", multiplier: 1.0, fmv: 30, guardian: "caregiver", standard_deliverables: [{ name: "Pruebas Manuales E2E", estimatedHours: 10, tipo: "tangible" }, { name: "Documentación de Ayuda", estimatedHours: 8, tipo: "tangible" }] }
        }
    },
    "web3_defi_protocol": {
        label: "🌐 Web3 & Protocolos DAO",
        meta: "Ecosistema Trustless. Máxima prioridad en la auditoría on-chain, tokenomics y descentralización.",
        roles: {
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "magician", standard_deliverables: [{ name: "Diseño de Tokenomics", estimatedHours: 20, tipo: "tangible" }, { name: "Whitepaper Core", estimatedHours: 15, tipo: "tangible" }] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, guardian: "ruler", standard_deliverables: [{ name: "Redacción de Propuestas (BIPs)", estimatedHours: 10, tipo: "tangible" }, { name: "Configuración de Snapshot", estimatedHours: 5, tipo: "tangible" }] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, guardian: "sage", standard_deliverables: [{ name: "Reporte de Auditoría Formal", estimatedHours: 25, tipo: "tangible" }, { name: "Simulación de Exploits", estimatedHours: 15, tipo: "tangible" }] },
            "@baixos": { name: "Solidity / Rust Engineer", multiplier: 1.2, fmv: 55, guardian: "hephaestus", standard_deliverables: [{ name: "Código de Smart Contracts", estimatedHours: 30, tipo: "tangible" }, { name: "Integración de Oráculos", estimatedHours: 12, tipo: "tangible" }] },
            "@pinya": { name: "Node Operator / Liquidity", multiplier: 1.0, fmv: 35, guardian: "everyman", standard_deliverables: [{ name: "Setup de Nodos Validadores", estimatedHours: 10, tipo: "tangible" }, { name: "Provisión de Liquidez (LP)", estimatedHours: 5, tipo: "tangible" }] }
        }
    },
    "digital_media_growth": {
        label: "📢 Agencia de Marketing & Media",
        meta: "Ecosistema orientado a maximizar el ROI, ROAS, captación de atención y persuasión de masas.",
        roles: {
            "@anxaneta": { name: "Growth Director / CMO", multiplier: 3.0, fmv: 55, guardian: "explorer", standard_deliverables: [{ name: "Estrategia de Posicionamiento", estimatedHours: 12, tipo: "intangible" }, { name: "Arquitectura del Funnel", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Campaign Manager", multiplier: 2.0, fmv: 45, standard_deliverables: [{ name: "Calendario Editorial (Gantt)", estimatedHours: 5, tipo: "tangible" }, { name: "Setup Técnico de Ads", estimatedHours: 12, tipo: "tangible" }] },
            "@dosos": { name: "Data Analyst / CRO", multiplier: 1.5, fmv: 45, guardian: "sage", standard_deliverables: [{ name: "Dashboard de KPIs", estimatedHours: 8, tipo: "tangible" }, { name: "Reporte de Tests A/B", estimatedHours: 6, tipo: "tangible" }] },
            "@baixos": { name: "Content Creator / Copywriter", multiplier: 1.2, fmv: 35, guardian: "lover", standard_deliverables: [{ name: "Producción de Video Hero", estimatedHours: 15, tipo: "tangible" }, { name: "Copywriting de Landing Page", estimatedHours: 8, tipo: "tangible" }] },
            "@pinya": { name: "Community Manager", multiplier: 1.0, fmv: 25, guardian: "jester", standard_deliverables: [{ name: "Programación de Posts", estimatedHours: 6, tipo: "tangible" }, { name: "Reporte de Sentimiento", estimatedHours: 4, tipo: "tangible" }] }
        }
    },
    "agile_consulting_b2b": {
        label: "💼 Consultoría Ágil B2B",
        meta: "Ecosistema de servicios profesionales B2B. Entrega de valor intelectual, mitigación de riesgos y lenguaje corporativo.",
        roles: {
            "@anxaneta": { name: "Partner / Rainmaker", multiplier: 3.0, fmv: 80, guardian: "ruler", standard_deliverables: [{ name: "Propuesta Comercial (RFP)", estimatedHours: 12, tipo: "tangible" }, { name: "Cierre de Cuentas", estimatedHours: 10, tipo: "intangible" }] },
            "@aixecador": { name: "Engagement Manager", multiplier: 2.0, fmv: 60, guardian: "hero", standard_deliverables: [{ name: "Plan de Proyecto (SOW)", estimatedHours: 8, tipo: "tangible" }, { name: "Alineación de Expectativas", estimatedHours: 10, tipo: "intangible" }] },
            "@dosos": { name: "Quality & Risk Reviewer", multiplier: 1.5, fmv: 55, guardian: "sage", standard_deliverables: [{ name: "Auditoría de Entregable Final", estimatedHours: 8, tipo: "tangible" }, { name: "Matriz de Mitigación de Riesgos", estimatedHours: 5, tipo: "tangible" }] },
            "@baixos": { name: "Subject Matter Expert (SME)", multiplier: 1.2, fmv: 50, guardian: "creator", standard_deliverables: [{ name: "Diseño de Framework Customizado", estimatedHours: 20, tipo: "tangible" }, { name: "Análisis Profundo de Datos", estimatedHours: 15, tipo: "tangible" }] },
            "@pinya": { name: "Research Analyst", multiplier: 1.0, fmv: 30, guardian: "innocent", standard_deliverables: [{ name: "Scraping y Limpieza de Datos", estimatedHours: 12, tipo: "tangible" }, { name: "Formateo Profesional de Decks", estimatedHours: 8, tipo: "tangible" }] }
        }
    },
    "healthtech_ai": {
        label: "⚕️ HealthTech & MedAI",
        meta: "Ecosistema de salud digital. Prioridad en ética médica, compliance (HIPAA/GDPR), y soporte empático.",
        roles: {
            "@anxaneta": { name: "Director Médico / Ethics Lead", multiplier: 3.0, fmv: 70, guardian: "sage", standard_deliverables: [{ name: "Marco Ético de IA Médica", estimatedHours: 12, tipo: "tangible" }, { name: "Aprobación de Protocolos", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Coordinador Clínico / Ops", multiplier: 2.0, fmv: 55, guardian: "ruler", standard_deliverables: [{ name: "Diseño de Flujo de Pacientes", estimatedHours: 10, tipo: "tangible" }, { name: "Setup Telemedicina", estimatedHours: 15, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Sesgos (AI Bias)", multiplier: 1.5, fmv: 50, guardian: "magician", standard_deliverables: [{ name: "Reporte de Análisis de Sesgos", estimatedHours: 15, tipo: "tangible" }, { name: "Auditoría de Compliance (HIPAA)", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Ingeniero IA Clínica", multiplier: 1.2, fmv: 45, guardian: "hephaestus", standard_deliverables: [{ name: "Finetuning de Modelo LLM", estimatedHours: 25, tipo: "tangible" }, { name: "Curación de Datasets Médicos", estimatedHours: 20, tipo: "tangible" }] },
            "@pinya": { name: "Human in the Loop (Operador)", multiplier: 1.0, fmv: 35, guardian: "caregiver", standard_deliverables: [{ name: "Resolución de Casos Sintéticos", estimatedHours: 10, tipo: "tangible" }, { name: "Soporte Empático a Pacientes", estimatedHours: 15, tipo: "intangible" }] }
        }
    },
    "deeptech_hardware": {
        label: "⚙️ DeepTech & Robótica",
        meta: "Ecosistema de hardware avanzado. Enfoque en ciencia dura, patentes, viabilidad física y manufactura.",
        roles: {
            "@anxaneta": { name: "Chief Scientific Officer", multiplier: 3.0, fmv: 75, guardian: "creator", standard_deliverables: [{ name: "Borrador de Patente Core", estimatedHours: 25, tipo: "tangible" }, { name: "Roadmap Tecnológico", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Supply Chain Lead", multiplier: 2.0, fmv: 55, guardian: "explorer", standard_deliverables: [{ name: "BOM Optimizado", estimatedHours: 12, tipo: "tangible" }, { name: "Cierre de Contrato Manufactura", estimatedHours: 15, tipo: "intangible" }] },
            "@dosos": { name: "Hardware QA & Certifications", multiplier: 1.5, fmv: 50, guardian: "sage", standard_deliverables: [{ name: "Informe de Stress Test Físico", estimatedHours: 15, tipo: "tangible" }, { name: "Dossier de Certificación CE", estimatedHours: 20, tipo: "tangible" }] },
            "@baixos": { name: "Mechatronics Engineer", multiplier: 1.2, fmv: 50, guardian: "hephaestus", standard_deliverables: [{ name: "Diseño CAD 3D", estimatedHours: 25, tipo: "tangible" }, { name: "Firmware Base", estimatedHours: 30, tipo: "tangible" }] },
            "@pinya": { name: "Assembly Tech", multiplier: 1.0, fmv: 30, guardian: "everyman", standard_deliverables: [{ name: "Ensamblaje de Prototipo Funcional", estimatedHours: 15, tipo: "tangible" }, { name: "Mantenimiento de Taller", estimatedHours: 5, tipo: "intangible" }] }
        }
    },
    "ecommerce_d2c": {
        label: "🛒 E-Commerce & D2C",
        meta: "Ecosistema de comercio directo al consumidor. Optimización de márgenes, logística e inventario.",
        roles: {
            "@anxaneta": { name: "Brand Director", multiplier: 3.0, fmv: 50, guardian: "creator", standard_deliverables: [{ name: "Brand Book y Visuales", estimatedHours: 15, tipo: "tangible" }, { name: "Modelo Financiero P&L", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "E-commerce Ops", multiplier: 2.0, fmv: 40, guardian: "ruler", standard_deliverables: [{ name: "Optimización UX Shopify", estimatedHours: 20, tipo: "tangible" }, { name: "Lanzamiento de Stock", estimatedHours: 8, tipo: "intangible" }] },
            "@dosos": { name: "Inventory Auditor", multiplier: 1.5, fmv: 35, guardian: "sage", standard_deliverables: [{ name: "Auditoría de Stock", estimatedHours: 8, tipo: "tangible" }, { name: "Reporte de Devoluciones", estimatedHours: 5, tipo: "tangible" }] },
            "@baixos": { name: "Performance Marketer", multiplier: 1.2, fmv: 35, guardian: "hero", standard_deliverables: [{ name: "Campañas ROAS (Ads)", estimatedHours: 10, tipo: "tangible" }, { name: "Automatización de Email", estimatedHours: 6, tipo: "tangible" }] },
            "@pinya": { name: "Pick, Pack & Support", multiplier: 1.0, fmv: 20, guardian: "caregiver", standard_deliverables: [{ name: "Logística de Pick & Pack", estimatedHours: 20, tipo: "tangible" }, { name: "Resolución de Tickets CS", estimatedHours: 10, tipo: "intangible" }] }
        }
    },
    "edtech_community": {
        label: "🎓 EdTech & Comunidades",
        meta: "Ecosistema de retención comunitaria y educación. Basado en engagement y aprendizaje colectivo.",
        roles: {
            "@anxaneta": { name: "Chief Learning Officer", multiplier: 3.0, fmv: 55, guardian: "sage", standard_deliverables: [{ name: "Modelo Académico (Pedagogía)", estimatedHours: 15, tipo: "tangible" }, { name: "Alineación de Resultados", estimatedHours: 5, tipo: "intangible" }] },
            "@aixecador": { name: "Cohort Manager", multiplier: 2.0, fmv: 45, guardian: "ruler", standard_deliverables: [{ name: "Syllabus y Calendario", estimatedHours: 12, tipo: "tangible" }, { name: "Onboarding de Estudiantes", estimatedHours: 4, tipo: "intangible" }] },
            "@dosos": { name: "Student Success Auditor", multiplier: 1.5, fmv: 40, guardian: "magician", standard_deliverables: [{ name: "Reporte de Churn y Engagement", estimatedHours: 6, tipo: "tangible" }, { name: "Análisis de Calidad del Curso", estimatedHours: 8, tipo: "tangible" }] },
            "@baixos": { name: "Instructional Designer", multiplier: 1.2, fmv: 35, guardian: "creator", standard_deliverables: [{ name: "Creación de Material Interactivo", estimatedHours: 25, tipo: "tangible" }, { name: "Grabación/Edición de Módulos", estimatedHours: 15, tipo: "tangible" }] },
            "@pinya": { name: "Tutor Comunitario", multiplier: 1.0, fmv: 25, guardian: "caregiver", standard_deliverables: [{ name: "Tutoría 1-1", estimatedHours: 15, tipo: "intangible" }, { name: "Dinamización de Foros", estimatedHours: 10, tipo: "intangible" }] }
        }
    },
    "impact_dao_ngo": {
        label: "🌍 ONG & Impacto Social",
        meta: "Ecosistema de Bienes Públicos. Transparencia radical, trazabilidad de grants y trabajo de campo.",
        roles: {
            "@anxaneta": { name: "Director de Impacto", multiplier: 2.0, fmv: 45, guardian: "creator", standard_deliverables: [{ name: "Teoría del Cambio", estimatedHours: 15, tipo: "tangible" }, { name: "Aplicación a Grants Internacionales", estimatedHours: 20, tipo: "tangible" }] },
            "@aixecador": { name: "Coordinador de Terreno", multiplier: 1.5, fmv: 35, guardian: "hero", standard_deliverables: [{ name: "Ruta Logística", estimatedHours: 10, tipo: "tangible" }, { name: "Plan de Seguridad", estimatedHours: 6, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Transparencia", multiplier: 1.2, fmv: 35, guardian: "sage", standard_deliverables: [{ name: "Impact Report (Público)", estimatedHours: 15, tipo: "tangible" }, { name: "Trazabilidad de Fondos On-chain", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Especialista Local", multiplier: 1.0, fmv: 30, guardian: "explorer", standard_deliverables: [{ name: "Despliegue de Infraestructura Local", estimatedHours: 20, tipo: "tangible" }, { name: "Talleres Comunitarios", estimatedHours: 12, tipo: "intangible" }] },
            "@pinya": { name: "Voluntario Core", multiplier: 1.0, fmv: 15, guardian: "caregiver", standard_deliverables: [{ name: "Reparto de Suministros", estimatedHours: 20, tipo: "tangible" }, { name: "Cuidados Básicos", estimatedHours: 15, tipo: "intangible" }] }
        }
    }
};

// 2. EL CATÁLOGO DE MEMES W3C (Incluyendo Arquetipos de Proyecto)
const CATALOGO_MEMES = [
    // --- MEMES DE CORE OS ---
    {
        id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis',
        content: `Un ecosistema es una red de creación de valor. Convierte activos intangibles (conocimiento, reputación) en valor negociable. Los entregables viajan por tuberías y se auditan mediante SOCs.`,
        keywords: ['VNA', 'Value Conversion', 'SOP'], broader: 'root_ecosystem_laws', related: ['meme_os_pantheon']
    },
    {
        id: 'meme_os_pantheon', type: 'meme', category: 'core_os', title: 'OS: Pantheon Work (Guardianes)',
        content: `Las organizaciones requieren 'Autoridades Intangibles'. Guardianes: Zeus (Estructura), Hera (Cuidado), Poseidón (Exploración), Demeter (Acogida), Ares (Acción), Atenea (Estrategia), Apolo (Análisis), Artemisa (Foco), Hermes (Transición), Hefesto (Forja), Afrodita (Estética), Dionisio (Socialización).`,
        keywords: ['Arquetipos', 'Guardianes', 'Psicología'], broader: 'root_ecosystem_laws', related: ['meme_os_vna']
    },
    // --- MEMES DE ARQUETIPO ORGANIZACIONAL ---
    {
        id: 'meme_arch_startup', type: 'meme', category: 'core_os', title: 'Arquetipo: 🚀 Startup (Agilidad)',
        content: `Mentalidad "Move Fast, Break Things". Prioriza el Time-to-Market, la iteración rápida (Lean) y la supervivencia financiera. Las SOPs deben ser pragmáticas, no burocráticas.`,
        keywords: ['Lean', 'Agile', 'Velocidad', 'Iteración'], broader: 'root_organizational_design', related: []
    },
    {
        id: 'meme_arch_dao', type: 'meme', category: 'core_os', title: 'Arquetipo: 🤖 DAO (Descentralizada)',
        content: `Mentalidad "Code is Law". Las decisiones y el tesoro se gestionan on-chain. La confianza se basa en protocolos auditables, propuestas de gobernanza (BIPs) y validación criptográfica descentralizada.`,
        keywords: ['Web3', 'Descentralización', 'Trustless'], broader: 'root_organizational_design', related: []
    },
    {
        id: 'meme_arch_sos', type: 'meme', category: 'core_os', title: 'Arquetipo: 🆘 S.O.S (Comunidad TeamTowers)',
        content: `Ecosistema cooperativo Slicing Pie. Valoramos la "Força, Equilibri, Valor i Seny". Todo trabajo es transparente y se capitaliza equitativamente mediante Ledger de triple entrada. Nadie manda, la red orquesta.`,
        keywords: ['Slicing Pie', 'Cooperativismo', 'Transparencia'], broader: 'root_organizational_design', related: []
    },
    // --- MEMES DE SKILLS ---
    {
        id: 'meme_skill_tdd', type: 'meme', category: 'skill', title: 'Skill: Test-Driven Development (TDD)',
        content: `Eres un fundamentalista del TDD. Ciclo estricto: RED (falla) -> GREEN (pasa) -> REFACTOR (optimiza).`,
        keywords: ['TDD', 'Unit Testing', 'Auditoría'], broader: 'root_engineering', related: []
    },
    {
        id: 'meme_skill_copywriting', type: 'meme', category: 'skill', title: 'Skill: Copywriting Persuasivo',
        content: `Dominas la psicología del consumidor. Usas frameworks AIDA y PAS. Textos orientados a la conversión.`,
        keywords: ['Copywriting', 'Marketing', 'Conversión'], broader: 'root_growth_marketing', related: []
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V10', // V10: Matriz de Competencias Activa
    dbVersion: 1,
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
                if (!db.objectStoreNames.contains('nodes')) {
                    const store = db.createObjectStore('nodes', { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false }); 
                    store.createIndex('projectId', 'projectId', { unique: false });
                    store.createIndex('targetId', 'targetId', { unique: false }); 
                }
            };
        });
    },

    async seedDatabaseIfNeeded() {
        const nodes = await this.getAllNodes();
        
        if (nodes.filter(n => n.type === 'meme').length === 0) {
            console.log("🧬 [KB] Sembrando Catálogo de Memes y Arquetipos Organizacionales...");
            for (const meme of CATALOGO_MEMES) { await this.saveNode(meme); }
        }

        if (nodes.filter(n => n.type === 'ontology').length === 0) {
            console.log("🌱 [KB] Sembrando Matriz de Competencias Ontológicas...");
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Ecosistema: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ id: `onto_${sectorKey}_${levelKey.replace('@','')}`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: levelKey, title: `Arquetipo: ${roleData.name}`, content: contentStr, deliverables: roleData.standard_deliverables });
                }
            }
        }
    },

    async saveDocument(doc) { return this.saveNode(doc); },
    async getAllDocuments(projectId = null) { return this.getAllNodes({ projectId }); },

    async saveNode(node) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['nodes'], 'readwrite');
            const store = transaction.objectStore('nodes');
            
            const semanticNode = {
                ...node,
                id: node.id || 'node_' + Date.now(),
                lastUpdated: Date.now(),
                projectId: node.projectId || 'global',
                targetId: node.targetId || 'global',
                type: node.type || 'custom',
                jsonLd: {
                    "@context": "https://schema.org",
                    "@type": "DefinedTerm",
                    "name": node.title,
                    "description": node.content,
                    "inDefinedTermSet": "TeamTowers_Ontology",
                    "keywords": node.keywords ? node.keywords.join(', ') : "",
                    "broader": node.broader || null,
                    "relatedLink": node.related || []
                }
            };

            const request = store.put(semanticNode);
            request.onsuccess = () => resolve(semanticNode);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAllNodes(filters = {}) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['nodes'], 'readonly');
            const store = transaction.objectStore('nodes');
            const request = store.getAll();

            request.onsuccess = () => {
                let nodes = request.result || [];
                if (filters.projectId) nodes = nodes.filter(n => n.projectId === filters.projectId || n.projectId === 'global');
                if (filters.type) nodes = nodes.filter(n => n.type === filters.type);
                if (filters.targetId) nodes = nodes.filter(n => n.targetId === filters.targetId || n.targetId === 'global');
                resolve(nodes);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAvailableSectors() {
        const sectors = {};
        Object.entries(NATIVE_ONTOLOGY).forEach(([sectorKey, sectorData]) => {
            sectors[sectorKey] = { label: sectorData.label, roles: {} };
            Object.entries(sectorData.roles).forEach(([levelKey, roleData]) => {
                sectors[sectorKey].roles[levelKey] = {
                    name: roleData.name, guardian: roleData.guardian,
                    content: `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV: €${roleData.fmv}/h.`,
                    deliverables: roleData.standard_deliverables || []
                };
            });
        });
        return sectors;
    },

    // ============================================================================
    // MOTOR DE AUDITORÍA COMPETENCIAL (SCAFFOLDING IA)
    // Analiza las carencias del equipo humano y asigna IAs Nativas para tapar huecos.
    // ============================================================================
    auditEcosystemCompetencies(projectData, globalUsers) {
        const gapReport = { missingLevels: [], missingGuardians: [], aiAgentsToInject: [] };
        
        // 1. Qué competencias requiere el diseño del Castell
        const requiredLevels = projectData.roles.map(r => r.levelId);
        const requiredGuardians = projectData.roles.map(r => r.guardian || 'everyman');

        // 2. Qué competencias cubren los Humanos actuales en la Colla
        const humanMembers = projectData.usuarios.filter(u => !u.id.startsWith('@'));
        const coveredLevels = [];
        const coveredGuardians = [];

        humanMembers.forEach(member => {
            const globalProfile = globalUsers.find(gu => gu.id === member.id)?.profile || {};
            if (globalProfile.structural_affinity) coveredLevels.push(...globalProfile.structural_affinity);
            if (globalProfile.guardian_authority) coveredGuardians.push(...globalProfile.guardian_authority);
        });

        // 3. Identificar Gaps (Zonas de Desarrollo Próximo no cubiertas)
        requiredLevels.forEach(reqLvl => {
            if (!coveredLevels.includes(reqLvl) && !gapReport.missingLevels.includes(reqLvl)) {
                gapReport.missingLevels.push(reqLvl);
            }
        });
        requiredGuardians.forEach(reqGuard => {
            if (!coveredGuardians.includes(reqGuard) && !gapReport.missingGuardians.includes(reqGuard)) {
                gapReport.missingGuardians.push(reqGuard);
            }
        });

        // 4. Mapeo de Agentes Nativos para tapar las fugas de competencia
        const AI_MAPPING = {
            '@anxaneta': '@genesi_ai',
            '@aixecador': '@aixecador_pm',
            '@dosos': '@notari_ledger', // O @seny_analyst dependiendo del contexto
            '@baixos': '@forca_worker',
            '@pinya': '@dharma_coach'
        };

        gapReport.missingLevels.forEach(missingLvl => {
            const aiToInject = AI_MAPPING[missingLvl];
            if (aiToInject && !gapReport.aiAgentsToInject.includes(aiToInject)) {
                // Verificar que no esté ya en el proyecto
                if (!projectData.usuarios.find(u => u.id === aiToInject)) {
                    gapReport.aiAgentsToInject.push(aiToInject);
                }
            }
        });

        // Siempre garantizamos que el orquestador esté presente
        if (!projectData.usuarios.find(u => u.id === '@cap_de_colla')) {
            gapReport.aiAgentsToInject.push('@cap_de_colla');
        }

        return gapReport;
    },

    async getAgentBrainGraph(projectId, roleObj, projectVision) {
        await this.init();
        const allNodes = await this.getAllNodes({ projectId });
        
        // Extraemos el arquetipo de proyecto para inyectarlo en el OS (Startup, DAO, etc)
        const projData = store.getState().projects.find(p => p.id === projectId);
        const projArchetype = projData ? projData.archetype : 'startup';
        
        const osMemes = allNodes.filter(n => n.type === 'meme' && n.category === 'core_os');
        const specificPrompts = allNodes.filter(n => n.targetId === roleObj.id && (n.type === 'prompt_a2a' || n.type === 'ontology'));
        const attachedMemes = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'meme');
        const memories = allNodes.filter(n => (n.type === 'manual' || n.type === 'memory') && n.roleTarget === roleObj.levelId);

        return {
            id: roleObj.id, name: roleObj.name, level: roleObj.levelId,
            guardian: roleObj.guardian || 'everyman',
            archetype: projArchetype,
            mission: projectVision,
            branches: [
                { name: "🌐 Core OS & Arquetipo", nodes: osMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) },
                { name: "🧬 ADN (Instrucciones A2A)", nodes: specificPrompts.map(p => ({ id: p.id, title: p.title || p.jsonLd?.name, content: p.content })) },
                { name: "🎒 Skills (Memes Inyectados)", nodes: attachedMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) },
                { name: "📚 Memoria Episódica (LMS)", nodes: memories.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) }
            ]
        };
    },

    async getAgentContextFlattened(projectId, roleObj, projectVision) {
        const tree = await this.getAgentBrainGraph(projectId, roleObj, projectVision);
        
        let flatContext = `
            Eres un Agente Autónomo operando en TeamTowers V9.
            Misión del Proyecto: ${tree.mission}
            Arquetipo de la Red: ${tree.archetype}
            Tu Silla: ${tree.name} (${tree.level})
            Tu Guardián (Alma de Audtoría): ${tree.guardian}

            [SISTEMA OPERATIVO Y CULTURA]
            ${tree.branches[0].nodes.map(n => n.content).join('\n')}

            [ADN: TUS FUNCIONES ESPECÍFICAS]
            ${tree.branches[1].nodes.map(n => n.content).join('\n')}

            [SKILLS: MEMES ACTIVOS]
            ${tree.branches[2].nodes.map(n => n.content).join('\n')}

            [CASOS DE ÉXITO PASADOS]
            ${tree.branches[3].nodes.map(n => n.content).join('\n')}
        `;
        return flatContext.replace(/\s+/g, ' ').trim();
    }
};
