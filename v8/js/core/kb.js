// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Compilador de Grafos Meméticos W3C (A2A)

export const NATIVE_ONTOLOGY = {
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

// ============================================================================
// EL CATÁLOGO DE MEMES (W3C / SKOS Semantic Taxonomy)
// ============================================================================
const CATALOGO_MEMES = [
    {
        id: 'meme_os_vna',
        type: 'meme',
        category: 'core_os',
        title: 'OS: Value Network Analysis',
        content: `Metodología base: Value Network Analysis de Verna Allee. Un ecosistema no es una jerarquía, es una red de creación de valor (Value Network). El desafío es: ¿Cómo convertimos activos intangibles como el conocimiento humano, estructuras internas, reputación y relaciones en formas negociables de valor? Toda actividad se traduce en entregables tangibles o intangibles que viajan por tuberías, los cuales deben auditarse mediante SOCs antes de consolidar el valor.`,
        keywords: ['VNA', 'Value Conversion', 'Intangibles', 'SOP', 'Tokenomics', 'Redes de Valor', 'Verna Allee'],
        broader: 'root_ecosystem_laws',
        related: ['meme_os_pantheon']
    },
    {
        id: 'meme_os_pantheon',
        type: 'meme',
        category: 'core_os',
        title: 'OS: Pantheon Work (Guardianes)',
        content: `Metodología: Pantheon Work (Intervening for Cultural Change de Neville & Dalmau). Las organizaciones se gobiernan reconociendo "Autoridades Intangibles" basadas en la dimensión arquetípica de las divinidades griegas (James Hillman, Ginette Paris). Este reconocimiento fortalece el alma y hace al sistema mentalmente más resiliente (Proclo, Pseudo Dionisio). Arquetipos: Zeus (Gobernante), Hera (Cuidador), Poseidón (Explorador), Demeter (Inocente), Ares (Héroe), Atenea (Sabio), Apolo (Creador), Artemisa (Amante), Hermes (Mago), Hefesto (Trabajador), Afrodita (Seductor), Dionisio (Bufón).`,
        keywords: ['Arquetipos', 'Cultura Organizacional', 'Guardianes', 'Psicología', 'Liderazgo Intangible', 'Resiliencia Mental', 'James Hillman'],
        broader: 'root_ecosystem_laws',
        related: ['meme_os_vna']
    },
    {
        id: 'meme_skill_tdd',
        type: 'meme',
        category: 'skill',
        title: 'Skill: Test-Driven Development (TDD)',
        content: `Eres un fundamentalista del TDD. Ciclo estricto: RED (escribe el test que falla) -> GREEN (escribe el código mínimo para pasar) -> REFACTOR (optimiza). La auditoría de código es implacable y nunca se sacrifica cobertura por velocidad.`,
        keywords: ['TDD', 'Unit Testing', 'Clean Code', 'Auditoría', 'Refactoring', 'Desarrollo de Software'],
        broader: 'root_engineering',
        related: ['meme_skill_clean_architecture']
    },
    {
        id: 'meme_skill_copywriting',
        type: 'meme',
        category: 'skill',
        title: 'Skill: Copywriting Persuasivo',
        content: `Dominas la psicología del consumidor. Usas frameworks como AIDA (Atención, Interés, Deseo, Acción) y PAS (Problema, Agitación, Solución). Produces textos directos, emocionales y orientados a la conversión.`,
        keywords: ['Copywriting', 'AIDA', 'PAS', 'Conversión', 'Psicología del Consumidor', 'Marketing', 'Storytelling'],
        broader: 'root_growth_marketing',
        related: ['meme_skill_seo']
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V9',
    dbVersion: 2, // Iteración de la arquitectura de Grafo Memético W3C
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
                // Tabla unificada de Nodos de Conocimiento (Memes, SOPs, Ontology)
                if (!db.objectStoreNames.contains('nodes')) {
                    const store = db.createObjectStore('nodes', { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false }); 
                    store.createIndex('projectId', 'projectId', { unique: false });
                    store.createIndex('targetId', 'targetId', { unique: false }); // ID del Rol o Agente al que está anclado
                }
            };
        });
    },

    async seedDatabaseIfNeeded() {
        const nodes = await this.getAllNodes();
        
        // 1. Sembrar Memes Globales
        const memes = nodes.filter(n => n.type === 'meme');
        if (memes.length === 0) {
            console.log("🧬 [KB] Sembrando Catálogo de Memes Base (W3C/SKOS)...");
            for (const meme of CATALOGO_MEMES) {
                await this.saveNode(meme);
            }
        }

        // 2. Sembrar Ontología
        const ontology = nodes.filter(n => n.type === 'ontology');
        if (ontology.length === 0) {
            console.log("🌱 [KB] Sembrando Genomas Ontológicos...");
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    await this.saveNode({
                        id: `onto_${sectorKey}_${levelKey.replace('@','')}`, 
                        type: 'ontology', 
                        sector: sectorKey, 
                        title: `Arquetipo: ${roleData.name}`, 
                        content: `Nivel: ${levelKey}. Responsable de ejecutar SOPs y garantizar el flujo de valor.`
                    });
                }
            }
        }
    },

    // ALIAS PARA RETROCOMPATIBILIDAD (Evita que store.js falle en LMS Hook)
    async saveDocument(doc) {
        return this.saveNode(doc);
    },

    async getAllDocuments(projectId = null) {
        return this.getAllNodes({ projectId });
    },

    async saveNode(node) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['nodes'], 'readwrite');
            const store = transaction.objectStore('nodes');
            
            // Integración de Estándares W3C (Schema.org / SKOS)
            const semanticNode = {
                ...node,
                id: node.id || 'node_' + Date.now(),
                lastUpdated: Date.now(),
                projectId: node.projectId || 'global',
                targetId: node.targetId || 'global', // 'global' significa catálogo libre
                type: node.type || 'custom',
                jsonLd: {
                    "@context": "https://schema.org",
                    "@type": "DefinedTerm", // Estándar W3C
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
        const nodes = await this.getAllNodes({ type: 'ontology' });
        const sectors = {};
        
        // Mapeo retrocompatible para la UI de creación
        Object.entries(NATIVE_ONTOLOGY).forEach(([sectorKey, sectorData]) => {
            sectors[sectorKey] = { label: sectorData.label, roles: {} };
            Object.entries(sectorData.roles).forEach(([levelKey, roleData]) => {
                sectors[sectorKey].roles[levelKey] = {
                    name: roleData.name,
                    content: `Rol Genérico: ${roleData.name} (${levelKey}). FMV Base: €${roleData.fmv}/h.`,
                    deliverables: roleData.standard_deliverables || []
                };
            });
        });
        return sectors;
    },

    // ============================================================================
    // GENERADOR DE GRAFO (MIND MAP) PARA EL EDITOR DE AGENTES
    // ============================================================================
    async getAgentBrainGraph(projectId, roleObj, projectVision) {
        await this.init();
        const allNodes = await this.getAllNodes({ projectId });
        
        // 1. RAMA RAÍZ: El OS (Sistemas Operativos Globales)
        const osMemes = allNodes.filter(n => n.type === 'meme' && n.category === 'core_os');
        
        // 2. RAMA ARQUETÍPICA: Configuración específica del creador para este rol (prompt_a2a u ontology)
        const specificPrompts = allNodes.filter(n => n.targetId === roleObj.id && (n.type === 'prompt_a2a' || n.type === 'ontology'));
        
        // 3. RAMA SKILLS: Memes adicionales anclados manualmente por el Arquitecto a este Rol
        const attachedMemes = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'meme');

        // 4. RAMA MEMORIA: Casos de éxito previos (LMS) donde este rol fue el protagonista (manual/memory)
        const memories = allNodes.filter(n => (n.type === 'manual' || n.type === 'memory') && n.roleTarget === roleObj.levelId);

        // Construimos la estructura de Árbol para el Mind Map
        const brainTree = {
            id: roleObj.id,
            name: roleObj.name,
            level: roleObj.levelId,
            guardian: roleObj.guardian || 'everyman',
            mission: projectVision,
            branches: [
                {
                    name: "🌐 Core OS (Leyes Físicas)",
                    nodes: osMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content }))
                },
                {
                    name: "🧬 ADN (Instrucciones A2A)",
                    nodes: specificPrompts.map(p => ({ id: p.id, title: p.title || p.jsonLd?.name, content: p.content }))
                },
                {
                    name: "🎒 Skills (Memes Inyectados)",
                    nodes: attachedMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content }))
                },
                {
                    name: "📚 Memoria Episódica (LMS)",
                    nodes: memories.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content }))
                }
            ]
        };

        return brainTree;
    },

    // Compilador final (Aplasta el árbol en texto para enviarlo a OpenAI/DeepSeek)
    async getAgentContextFlattened(projectId, roleObj, projectVision) {
        const tree = await this.getAgentBrainGraph(projectId, roleObj, projectVision);
        
        let flatContext = `
            Eres un Agente Autónomo operando dentro de TeamTowers V9.
            Misión Global del Proyecto: ${tree.mission}
            Tu Rol: ${tree.name} (${tree.level})
            Tu Guardián (Alma): ${tree.guardian}

            [SISTEMA OPERATIVO BASE]
            ${tree.branches[0].nodes.map(n => n.content).join('\n\n')}

            [TUS INSTRUCCIONES ESPECÍFICAS]
            ${tree.branches[1].nodes.map(n => n.content).join('\n\n')}

            [TUS SKILLS / MEMES ACTIVOS]
            ${tree.branches[2].nodes.map(n => n.content).join('\n\n')}

            [TU MEMORIA DE ÉXITOS PASADOS]
            ${tree.branches[3].nodes.map(n => n.content).join('\n\n')}
        `;
        return flatContext.replace(/\s+/g, ' ').trim();
    },

    // Alias necesario para ProjectView.js (Auto-Ejecución)
    async getAgentContext(projectId, roleObj, projectVision) {
        return this.getAgentContextFlattened(projectId, roleObj, projectVision);
    }
};
