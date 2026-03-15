// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Auditoría Competencial Fractal (A2A)

// 1. GENOMA ONTOLÓGICO: 9 Sectores x 5 Roles
export const NATIVE_ONTOLOGY = {
    "tech_saas_platform": {
        label: "💻 Software & SaaS", meta: "Ecosistema orientado al ciclo de vida del software, escalabilidad y reducción de deuda técnica.",
        roles: {
            "@anxaneta": { name: "CEO / Visionario", multiplier: 3.0, fmv: 60, guardian: "ruler", standard_deliverables: [{ name: "Business Model Canvas", estimatedHours: 8, tipo: "intangible" }, { name: "Pitch Deck para Inversores", estimatedHours: 12, tipo: "tangible" }] },
            "@aixecador": { name: "CPO / Product Lead", multiplier: 2.0, fmv: 50, guardian: "creator", standard_deliverables: [{ name: "Product Requirements (PRD)", estimatedHours: 10, tipo: "tangible" }, { name: "User Story Mapping", estimatedHours: 8, tipo: "intangible" }] },
            "@dosos": { name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45, guardian: "sage", standard_deliverables: [{ name: "Diseño de Arquitectura Cloud", estimatedHours: 20, tipo: "tangible" }, { name: "Auditoría de Seguridad Core", estimatedHours: 10, tipo: "intangible" }] },
            "@baixos": { name: "Desarrollador Frontend/Backend", multiplier: 1.2, fmv: 40, guardian: "hephaestus", standard_deliverables: [{ name: "Código Core / API", estimatedHours: 25, tipo: "tangible" }, { name: "Unit Tests Suite", estimatedHours: 8, tipo: "tangible" }] },
            "@pinya": { name: "QA Tester / Soporte IT", multiplier: 1.0, fmv: 30, guardian: "caregiver", standard_deliverables: [{ name: "Pruebas Manuales E2E", estimatedHours: 10, tipo: "tangible" }, { name: "Resolución de Tickets (CS)", estimatedHours: 8, tipo: "intangible" }] }
        }
    },
    "web3_defi_protocol": {
        label: "🌐 Web3 & Protocolos DAO", meta: "Ecosistema Trustless. Máxima prioridad en la auditoría on-chain, tokenomics y descentralización.",
        roles: {
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "magician", standard_deliverables: [{ name: "Diseño de Tokenomics", estimatedHours: 20, tipo: "tangible" }, { name: "Whitepaper Matemático", estimatedHours: 15, tipo: "tangible" }] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, guardian: "ruler", standard_deliverables: [{ name: "Redacción de Propuestas (BIPs)", estimatedHours: 10, tipo: "tangible" }, { name: "Moderación de Votaciones", estimatedHours: 5, tipo: "intangible" }] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, guardian: "sage", standard_deliverables: [{ name: "Reporte de Auditoría Formal", estimatedHours: 25, tipo: "tangible" }, { name: "Simulación de Exploits", estimatedHours: 15, tipo: "tangible" }] },
            "@baixos": { name: "Solidity / Rust Engineer", multiplier: 1.2, fmv: 55, guardian: "hephaestus", standard_deliverables: [{ name: "Código de Smart Contracts", estimatedHours: 30, tipo: "tangible" }, { name: "Despliegue Testnet", estimatedHours: 12, tipo: "tangible" }] },
            "@pinya": { name: "Node Operator / Liquidity", multiplier: 1.0, fmv: 35, guardian: "everyman", standard_deliverables: [{ name: "Setup de Nodos Validadores", estimatedHours: 10, tipo: "tangible" }, { name: "Provisión de Liquidez (LP)", estimatedHours: 5, tipo: "intangible" }] }
        }
    },
    "digital_media_growth": {
        label: "📢 Agencia de Marketing & Media", meta: "Ecosistema orientado a maximizar el ROI, ROAS, captación de atención y persuasión de masas.",
        roles: {
            "@anxaneta": { name: "Growth Director / CMO", multiplier: 3.0, fmv: 55, guardian: "explorer", standard_deliverables: [{ name: "Estrategia de Posicionamiento", estimatedHours: 12, tipo: "intangible" }, { name: "Arquitectura del Funnel", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Campaign Manager", multiplier: 2.0, fmv: 45, guardian: "ruler", standard_deliverables: [{ name: "Calendario Editorial (Gantt)", estimatedHours: 5, tipo: "tangible" }, { name: "Setup Técnico de Ads", estimatedHours: 12, tipo: "tangible" }] },
            "@dosos": { name: "Data Analyst / CRO", multiplier: 1.5, fmv: 45, guardian: "sage", standard_deliverables: [{ name: "Dashboard de KPIs", estimatedHours: 8, tipo: "tangible" }, { name: "Reporte de Tests A/B", estimatedHours: 6, tipo: "tangible" }] },
            "@baixos": { name: "Content Creator / Copywriter", multiplier: 1.2, fmv: 35, guardian: "lover", standard_deliverables: [{ name: "Producción de Video Hero", estimatedHours: 15, tipo: "tangible" }, { name: "Copywriting de Landing Page", estimatedHours: 8, tipo: "tangible" }] },
            "@pinya": { name: "Community Manager", multiplier: 1.0, fmv: 25, guardian: "jester", standard_deliverables: [{ name: "Programación de Posts", estimatedHours: 6, tipo: "tangible" }, { name: "Dinamización de Comunidad", estimatedHours: 8, tipo: "intangible" }] }
        }
    },
    "agile_consulting_b2b": {
        label: "💼 Consultoría Ágil B2B", meta: "Ecosistema de servicios profesionales B2B. Entrega de valor intelectual, mitigación de riesgos y lenguaje corporativo.",
        roles: {
            "@anxaneta": { name: "Partner / Rainmaker", multiplier: 3.0, fmv: 80, guardian: "ruler", standard_deliverables: [{ name: "Propuesta Comercial (RFP)", estimatedHours: 12, tipo: "tangible" }, { name: "Negociación de Contratos", estimatedHours: 10, tipo: "intangible" }] },
            "@aixecador": { name: "Engagement Manager", multiplier: 2.0, fmv: 60, guardian: "hero", standard_deliverables: [{ name: "Plan de Proyecto (SOW)", estimatedHours: 8, tipo: "tangible" }, { name: "Alineación de Expectativas", estimatedHours: 10, tipo: "intangible" }] },
            "@dosos": { name: "Quality & Risk Reviewer", multiplier: 1.5, fmv: 55, guardian: "sage", standard_deliverables: [{ name: "Auditoría de Entregable Final", estimatedHours: 8, tipo: "tangible" }, { name: "Matriz de Mitigación de Riesgos", estimatedHours: 5, tipo: "tangible" }] },
            "@baixos": { name: "Subject Matter Expert (SME)", multiplier: 1.2, fmv: 50, guardian: "creator", standard_deliverables: [{ name: "Diseño de Framework Custom", estimatedHours: 20, tipo: "tangible" }, { name: "Análisis Profundo de Datos", estimatedHours: 15, tipo: "tangible" }] },
            "@pinya": { name: "Research Analyst", multiplier: 1.0, fmv: 30, guardian: "innocent", standard_deliverables: [{ name: "Scraping y Limpieza de Datos", estimatedHours: 12, tipo: "tangible" }, { name: "Formateo Profesional de Decks", estimatedHours: 8, tipo: "tangible" }] }
        }
    },
    "healthtech_ai": {
        label: "⚕️ HealthTech & MedAI", meta: "Ecosistema de salud digital. Prioridad en ética médica, compliance (HIPAA/GDPR), y soporte empático.",
        roles: {
            "@anxaneta": { name: "Director Médico / Ethics Lead", multiplier: 3.0, fmv: 70, guardian: "sage", standard_deliverables: [{ name: "Marco Ético de IA Médica", estimatedHours: 12, tipo: "tangible" }, { name: "Aprobación de Protocolos", estimatedHours: 10, tipo: "intangible" }] },
            "@aixecador": { name: "Coordinador Clínico / Ops", multiplier: 2.0, fmv: 55, guardian: "ruler", standard_deliverables: [{ name: "Diseño de Flujo de Pacientes", estimatedHours: 10, tipo: "tangible" }, { name: "Setup Telemedicina", estimatedHours: 15, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Sesgos y Compliance", multiplier: 1.5, fmv: 50, guardian: "magician", standard_deliverables: [{ name: "Reporte de Análisis de Sesgos", estimatedHours: 15, tipo: "tangible" }, { name: "Auditoría HIPAA/GDPR", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Ingeniero IA Clínica", multiplier: 1.2, fmv: 45, guardian: "hephaestus", standard_deliverables: [{ name: "Finetuning de Modelo Médico", estimatedHours: 25, tipo: "tangible" }, { name: "Curación de Datasets", estimatedHours: 20, tipo: "tangible" }] },
            "@pinya": { name: "Soporte Paciente (Human-in-Loop)", multiplier: 1.0, fmv: 35, guardian: "caregiver", standard_deliverables: [{ name: "Soporte Empático a Pacientes", estimatedHours: 15, tipo: "intangible" }, { name: "Clasificación de Tickets Clínicos", estimatedHours: 10, tipo: "tangible" }] }
        }
    },
    "deeptech_hardware": {
        label: "⚙️ DeepTech & Robótica", meta: "Ecosistema de hardware avanzado. Enfoque en ciencia dura, patentes, viabilidad física y manufactura.",
        roles: {
            "@anxaneta": { name: "Chief Scientific Officer", multiplier: 3.0, fmv: 75, guardian: "creator", standard_deliverables: [{ name: "Borrador de Patente Core", estimatedHours: 25, tipo: "tangible" }, { name: "Roadmap Tecnológico", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "Supply Chain Lead", multiplier: 2.0, fmv: 55, guardian: "explorer", standard_deliverables: [{ name: "BOM (Bill of Materials) Optimizado", estimatedHours: 12, tipo: "tangible" }, { name: "Cierre de Contrato Manufactura", estimatedHours: 15, tipo: "intangible" }] },
            "@dosos": { name: "Hardware QA & Certifications", multiplier: 1.5, fmv: 50, guardian: "sage", standard_deliverables: [{ name: "Informe de Stress Test Físico", estimatedHours: 15, tipo: "tangible" }, { name: "Dossier de Certificación CE/FCC", estimatedHours: 20, tipo: "tangible" }] },
            "@baixos": { name: "Mechatronics Engineer", multiplier: 1.2, fmv: 50, guardian: "hephaestus", standard_deliverables: [{ name: "Diseño CAD 3D Completo", estimatedHours: 25, tipo: "tangible" }, { name: "Firmware Base Integrado", estimatedHours: 30, tipo: "tangible" }] },
            "@pinya": { name: "Assembly Technician", multiplier: 1.0, fmv: 30, guardian: "everyman", standard_deliverables: [{ name: "Ensamblaje de Prototipo Funcional", estimatedHours: 15, tipo: "tangible" }, { name: "Mantenimiento de Taller", estimatedHours: 5, tipo: "intangible" }] }
        }
    },
    "ecommerce_d2c": {
        label: "🛒 E-Commerce & D2C", meta: "Ecosistema de comercio directo al consumidor. Optimización de márgenes, logística e inventario.",
        roles: {
            "@anxaneta": { name: "Brand Director", multiplier: 3.0, fmv: 50, guardian: "creator", standard_deliverables: [{ name: "Brand Book y Visuales Core", estimatedHours: 15, tipo: "tangible" }, { name: "Modelo Financiero P&L", estimatedHours: 10, tipo: "tangible" }] },
            "@aixecador": { name: "E-commerce Ops Manager", multiplier: 2.0, fmv: 40, guardian: "ruler", standard_deliverables: [{ name: "Optimización de Tienda (Shopify)", estimatedHours: 20, tipo: "tangible" }, { name: "Lanzamiento y Sincronización de Stock", estimatedHours: 8, tipo: "intangible" }] },
            "@dosos": { name: "Inventory & QA Auditor", multiplier: 1.5, fmv: 35, guardian: "sage", standard_deliverables: [{ name: "Auditoría de Stock de Seguridad", estimatedHours: 8, tipo: "tangible" }, { name: "Reporte de Calidad de Devoluciones", estimatedHours: 5, tipo: "tangible" }] },
            "@baixos": { name: "Performance Marketer", multiplier: 1.2, fmv: 35, guardian: "hero", standard_deliverables: [{ name: "Campañas de Adquisición (ROAS)", estimatedHours: 10, tipo: "tangible" }, { name: "Automatización de Secuencia Email", estimatedHours: 6, tipo: "tangible" }] },
            "@pinya": { name: "Pick, Pack & CS", multiplier: 1.0, fmv: 20, guardian: "caregiver", standard_deliverables: [{ name: "Logística Diaria de Pick & Pack", estimatedHours: 20, tipo: "tangible" }, { name: "Resolución de Tickets de Envío", estimatedHours: 10, tipo: "intangible" }] }
        }
    },
    "edtech_community": {
        label: "🎓 EdTech & Comunidades", meta: "Ecosistema de retención comunitaria y educación. Basado en engagement y aprendizaje colectivo.",
        roles: {
            "@anxaneta": { name: "Chief Learning Officer", multiplier: 3.0, fmv: 55, guardian: "sage", standard_deliverables: [{ name: "Modelo Pedagógico y Curricular", estimatedHours: 15, tipo: "tangible" }, { name: "Alineación de Resultados de Aprendizaje", estimatedHours: 5, tipo: "intangible" }] },
            "@aixecador": { name: "Cohort Manager", multiplier: 2.0, fmv: 45, guardian: "ruler", standard_deliverables: [{ name: "Syllabus y Calendario de Cohorte", estimatedHours: 12, tipo: "tangible" }, { name: "Onboarding de Nuevos Estudiantes", estimatedHours: 8, tipo: "intangible" }] },
            "@dosos": { name: "Student Success Auditor", multiplier: 1.5, fmv: 40, guardian: "magician", standard_deliverables: [{ name: "Reporte de Churn y Engagement", estimatedHours: 6, tipo: "tangible" }, { name: "Evaluación Ciega de Tareas (QA)", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Instructional Designer", multiplier: 1.2, fmv: 35, guardian: "creator", standard_deliverables: [{ name: "Creación de Material Interactivo", estimatedHours: 25, tipo: "tangible" }, { name: "Grabación y Edición de Módulos", estimatedHours: 15, tipo: "tangible" }] },
            "@pinya": { name: "Tutor Comunitario", multiplier: 1.0, fmv: 25, guardian: "caregiver", standard_deliverables: [{ name: "Dinamización de Foros y Discord", estimatedHours: 10, tipo: "intangible" }, { name: "Tutorías 1-1 de Refuerzo", estimatedHours: 15, tipo: "intangible" }] }
        }
    },
    "impact_dao_ngo": {
        label: "🌍 ONG & Impacto Social", meta: "Ecosistema de Bienes Públicos. Transparencia radical, trazabilidad de grants y trabajo de campo.",
        roles: {
            "@anxaneta": { name: "Director de Impacto", multiplier: 2.0, fmv: 45, guardian: "creator", standard_deliverables: [{ name: "Diseño de Teoría del Cambio", estimatedHours: 15, tipo: "tangible" }, { name: "Aplicación a Grants Internacionales", estimatedHours: 20, tipo: "tangible" }] },
            "@aixecador": { name: "Coordinador de Terreno", multiplier: 1.5, fmv: 35, guardian: "hero", standard_deliverables: [{ name: "Ruta Logística y Operativa", estimatedHours: 10, tipo: "tangible" }, { name: "Plan de Seguridad y Mitigación", estimatedHours: 6, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Transparencia", multiplier: 1.2, fmv: 35, guardian: "sage", standard_deliverables: [{ name: "Impact Report (Documento Público)", estimatedHours: 15, tipo: "tangible" }, { name: "Trazabilidad de Fondos On-chain", estimatedHours: 10, tipo: "tangible" }] },
            "@baixos": { name: "Especialista Local", multiplier: 1.0, fmv: 30, guardian: "explorer", standard_deliverables: [{ name: "Despliegue de Infraestructura Local", estimatedHours: 20, tipo: "tangible" }, { name: "Ejecución de Talleres Comunitarios", estimatedHours: 12, tipo: "intangible" }] },
            "@pinya": { name: "Voluntario Core", multiplier: 1.0, fmv: 15, guardian: "caregiver", standard_deliverables: [{ name: "Reparto Físico de Suministros", estimatedHours: 20, tipo: "tangible" }, { name: "Cuidados Básicos y Acompañamiento", estimatedHours: 15, tipo: "intangible" }] }
        }
    }
};

const GLOBAL_AIS_ONTOLOGY = [
    { id: '@cap_de_colla', title: 'Arquetipo: Cap de Colla', content: 'Orquestador maestro. Asignas tareas, conectas a los agentes y aseguras que el Castell se levante en armonía y seny.' },
    { id: '@genesi_ai', title: 'Arquetipo: Gènesi', content: 'Creador de mundos. Generas las topologías VNA y plasmas la visión inicial del ecosistema en Sprints ejecutables.' },
    { id: '@notari_ledger', title: 'Arquetipo: Notari', content: 'Juez imparcial. Evalúas estrictamente los SOCs (Checklists). Si hay una falla, rechazas. Si pasa, sellas en el Ledger.' },
    { id: '@seny_analyst', title: 'Arquetipo: Seny', content: 'Analista de redes. Tu objetivo es encontrar ineficiencias en el flujo de valor.' },
    { id: '@dharma_coach', title: 'Arquetipo: Dharma', content: 'Guía Ikigai. Alinear el talento humano con las necesidades de la red mediante los arquetipos de Pantheon.' },
    { id: '@forca_worker', title: 'Arquetipo: Força', content: 'Fuerza bruta algorítmica. Ejecutas cualquier SOP que se te asigne: código, redacción, análisis.' }
];

// 2. EL CATÁLOGO DE MEMES Y SOCs DE ALTA CALIDAD
const CATALOGO_MEMES = [
    // --- CORE OS & ARQUETIPOS ---
    { id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis', content: `Un ecosistema es una red de creación de valor. Toda actividad se traduce en entregables que viajan por tuberías, auditables mediante SOCs.`, keywords: ['VNA', 'Value Conversion'], broader: 'root_ecosystem_laws', related: ['meme_os_pantheon'] },
    { id: 'meme_os_pantheon', type: 'meme', category: 'core_os', title: 'OS: Pantheon Work (Guardianes)', content: `Las organizaciones se gobiernan por 12 Guardianes arquetípicos que dotan de alma al trabajo (Zeus, Atenea, Hefesto, etc).`, keywords: ['Arquetipos', 'Guardianes'], broader: 'root_ecosystem_laws', related: ['meme_os_vna'] },
    { id: 'meme_arch_sos', type: 'meme', category: 'core_os', title: 'Arquetipo: 🆘 S.O.S (TeamTowers)', content: `Ecosistema cooperativo Slicing Pie. El trabajo es transparente y se capitaliza equitativamente sin jerarquías rígidas.`, keywords: ['Slicing Pie', 'Cooperativismo'], broader: 'root_organizational_design', related: [] },
    
    // --- SKILLS ---
    { id: 'meme_skill_tdd', type: 'meme', category: 'skill', title: 'Skill: Test-Driven Development', content: `Ciclo estricto: RED -> GREEN -> REFACTOR.`, keywords: ['TDD', 'Código'], broader: 'root_engineering', related: [] },
    { id: 'meme_skill_copywriting', type: 'meme', category: 'skill', title: 'Skill: Copywriting Persuasivo', content: `Frameworks AIDA y PAS. Textos para conversión.`, keywords: ['Copywriting', 'Marketing'], broader: 'root_growth_marketing', related: [] },
    
    // --- SOCs (REGLAS Y CHECKLISTS DE ALTA CALIDAD PARA OFFLINE SETUP) ---
    { id: 'meme_soc_code_quality', type: 'meme', category: 'soc', title: 'SOC: Calidad de Código (Clean Code)', content: `AUDITORÍA: 1. El código no tiene 'Magic Numbers'. 2. Funciones de menos de 20 líneas. 3. Cobertura de tests >80%.`, keywords: ['SOC', 'Clean Code', 'Ingeniería'], broader: 'root_quality_assurance', related: ['meme_skill_tdd'] },
    { id: 'meme_soc_ux_access', type: 'meme', category: 'soc', title: 'SOC: UX y Accesibilidad (W3C AA)', content: `AUDITORÍA: 1. Contraste de color cumple ratio 4.5:1. 2. Navegable por teclado (Tab). 3. Etiquetas ARIA presentes.`, keywords: ['SOC', 'Accesibilidad', 'Diseño'], broader: 'root_quality_assurance', related: [] },
    { id: 'meme_soc_legal_gdpr', type: 'meme', category: 'soc', title: 'SOC: Compliance Legal (GDPR)', content: `AUDITORÍA: 1. Consentimiento explícito recogido. 2. No se guardan IPs sin ofuscar. 3. Política de Privacidad enlazada.`, keywords: ['SOC', 'Legal', 'Compliance'], broader: 'root_quality_assurance', related: [] },
    { id: 'meme_soc_marketing_roas', type: 'meme', category: 'soc', title: 'SOC: Viabilidad de Campaña (ROAS)', content: `AUDITORÍA: 1. Píxeles de tracking validados. 2. Copy revisado contra sesgos. 3. CTA único y visible "Above the fold".`, keywords: ['SOC', 'Marketing', 'Ads'], broader: 'root_quality_assurance', related: ['meme_skill_copywriting'] },
    { id: 'meme_soc_hardware_qa', type: 'meme', category: 'soc', title: 'SOC: Tolerancias de Hardware', content: `AUDITORÍA: 1. BOM incluye proveedores redundantes. 2. Tolerancia térmica validada. 3. Certificación CE pre-aprobada.`, keywords: ['SOC', 'Hardware', 'Robótica'], broader: 'root_quality_assurance', related: [] }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V11', 
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
            for (const meme of CATALOGO_MEMES) { await this.saveNode(meme); }
        }

        if (nodes.filter(n => n.type === 'ontology').length === 0) {
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Ecosistema: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ id: `onto_${sectorKey}_${levelKey.replace('@','')}`, type: 'ontology', sector: sectorKey, roleTarget: levelKey, title: `Arquetipo Local: ${roleData.name}`, content: contentStr });
                }
            }
            for (const ai of GLOBAL_AIS_ONTOLOGY) {
                await this.saveNode({ id: `onto_global_${ai.id.replace('@','')}`, type: 'ontology', sector: 'global', roleTarget: ai.id, title: ai.title, content: ai.content });
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
                ...node, id: node.id || 'node_' + Date.now(), lastUpdated: Date.now(),
                projectId: node.projectId || 'global', targetId: node.targetId || 'global', type: node.type || 'custom',
                jsonLd: {
                    "@context": "https://schema.org", "@type": "DefinedTerm",
                    "name": node.title, "description": node.content, "inDefinedTermSet": "TeamTowers_Ontology",
                    "keywords": node.keywords ? node.keywords.join(', ') : "",
                    "broader": node.broader || null, "relatedLink": node.related || []
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
                sectors[sectorKey].roles[levelKey] = { name: roleData.name, guardian: roleData.guardian, content: `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV: €${roleData.fmv}/h.`, deliverables: roleData.standard_deliverables || [] };
            });
        });
        return sectors;
    },

    auditEcosystemCompetencies(projectData, globalUsers) {
        const gapReport = { missingLevels: [], missingGuardians: [], aiAgentsToInject: [] };
        const requiredLevels = projectData.roles.map(r => r.levelId);
        const requiredGuardians = projectData.roles.map(r => r.guardian || 'everyman');
        const humanMembers = projectData.usuarios.filter(u => !u.id.startsWith('@'));
        
        const coveredLevels = []; const coveredGuardians = [];
        humanMembers.forEach(member => {
            const globalProfile = globalUsers.find(gu => gu.id === member.id)?.profile || {};
            if (globalProfile.structural_affinity) coveredLevels.push(...globalProfile.structural_affinity);
            if (globalProfile.guardian_authority) coveredGuardians.push(...globalProfile.guardian_authority);
        });

        requiredLevels.forEach(reqLvl => { if (!coveredLevels.includes(reqLvl) && !gapReport.missingLevels.includes(reqLvl)) gapReport.missingLevels.push(reqLvl); });
        requiredGuardians.forEach(reqGuard => { if (!coveredGuardians.includes(reqGuard) && !gapReport.missingGuardians.includes(reqGuard)) gapReport.missingGuardians.push(reqGuard); });

        const AI_MAPPING = { '@anxaneta': '@genesi_ai', '@aixecador': '@cap_de_colla', '@dosos': '@notari_ledger', '@baixos': '@forca_worker', '@pinya': '@dharma_coach' };
        gapReport.missingLevels.forEach(missingLvl => {
            const aiToInject = AI_MAPPING[missingLvl];
            if (aiToInject && !gapReport.aiAgentsToInject.includes(aiToInject)) {
                if (!projectData.usuarios.find(u => u.id === aiToInject)) gapReport.aiAgentsToInject.push(aiToInject);
            }
        });

        if (!projectData.usuarios.find(u => u.id === '@cap_de_colla')) gapReport.aiAgentsToInject.push('@cap_de_colla');
        return gapReport;
    },

    async getAgentBrainGraph(projectId, roleObj, projectVision, archetype = 'startup') {
        await this.init();
        const allNodes = await this.getAllNodes({ projectId });
        const osMemes = allNodes.filter(n => n.type === 'meme' && n.category === 'core_os');
        
        let defaultDna = [];
        if (roleObj.isGlobalAi) {
            defaultDna = allNodes.filter(n => n.type === 'ontology' && n.roleTarget === roleObj.id);
        } else {
            const sectorData = allNodes.find(n => n.id === `onto_${projectId}_meta`) || allNodes.find(n => n.type === 'ontology' && n.id.includes(roleObj.levelId.replace('@','')));
            if(sectorData) {
                const sectorPrefix = sectorData.sector || 'general';
                defaultDna = allNodes.filter(n => n.type === 'ontology' && n.roleTarget === roleObj.levelId && (n.sector === sectorPrefix || n.sector === 'global'));
            }
        }
        const customPrompts = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'prompt_a2a');
        const finalDna = [...defaultDna, ...customPrompts];

        const attachedMemes = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'meme');
        const memories = allNodes.filter(n => (n.type === 'manual' || n.type === 'memory') && n.roleTarget === roleObj.levelId);

        return {
            id: roleObj.id, name: roleObj.name, level: roleObj.levelId, guardian: roleObj.guardian || 'everyman', archetype: archetype, mission: projectVision,
            branches: [
                { name: "🌐 Core OS & Arquetipo", nodes: osMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) },
                { name: "🧬 ADN (Ontología)", nodes: finalDna.map(p => ({ id: p.id, title: p.title || p.jsonLd?.name, content: p.content })) },
                { name: "🎒 Skills & SOCs", nodes: attachedMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) },
                { name: "📚 Memoria LMS", nodes: memories.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) }
            ]
        };
    },

    async getAgentContextFlattened(projectId, roleObj, projectVision, archetype = 'startup') {
        const tree = await this.getAgentBrainGraph(projectId, roleObj, projectVision, archetype);
        let flatContext = `Eres un Agente en TeamTowers V9.\nMisión: ${tree.mission}\nArquetipo: ${tree.archetype}\nSilla: ${tree.name} (${tree.level})\nGuardián: ${tree.guardian}\n\n[OS]\n${tree.branches[0].nodes.map(n => n.content).join('\n')}\n\n[ADN]\n${tree.branches[1].nodes.map(n => n.content).join('\n')}\n\n[SKILLS/SOCs]\n${tree.branches[2].nodes.map(n => n.content).join('\n')}\n\n[MEMORIA]\n${tree.branches[3].nodes.map(n => n.content).join('\n')}`;
        return flatContext.replace(/\s+/g, ' ').trim();
    }
};
