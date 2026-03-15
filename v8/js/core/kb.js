// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Compilador de Grafos Meméticos W3C (A2A)

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
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "magician", standard_deliverables: [{ name: "Diseño de Tokenomics", estimatedHours: 20, tipo: "tangible" }] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, guardian: "ruler", standard_deliverables: [{ name: "Redacción de Propuestas (BIPs)", estimatedHours: 10, tipo: "tangible" }] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, guardian: "sage", standard_deliverables: [{ name: "Reporte de Auditoría Formal", estimatedHours: 25, tipo: "tangible" }] },
            "@baixos": { name: "Solidity / Rust Engineer", multiplier: 1.2, fmv: 55, guardian: "hephaestus", standard_deliverables: [{ name: "Código de Smart Contracts", estimatedHours: 30, tipo: "tangible" }] },
            "@pinya": { name: "Node Operator / Liquidity", multiplier: 1.0, fmv: 35, guardian: "everyman", standard_deliverables: [{ name: "Setup de Nodos Validadores", estimatedHours: 10, tipo: "tangible" }] }
        }
    },
    "impact_dao_ngo": {
        label: "🌍 ONG & Impacto Social",
        meta: "Ecosistema de Bienes Públicos. Transparencia radical, trazabilidad de grants y trabajo de campo.",
        roles: {
            "@anxaneta": { name: "Director de Impacto", multiplier: 2.0, fmv: 45, guardian: "creator", standard_deliverables: [{ name: "Teoría del Cambio", estimatedHours: 15, tipo: "tangible" }] },
            "@aixecador": { name: "Coordinador de Terreno", multiplier: 1.5, fmv: 35, guardian: "hero", standard_deliverables: [{ name: "Ruta Logística", estimatedHours: 10, tipo: "tangible" }] },
            "@dosos": { name: "Auditor de Transparencia", multiplier: 1.2, fmv: 35, guardian: "sage", standard_deliverables: [{ name: "Impact Report (Público)", estimatedHours: 15, tipo: "tangible" }] },
            "@baixos": { name: "Especialista Local", multiplier: 1.0, fmv: 30, guardian: "explorer", standard_deliverables: [{ name: "Despliegue de Infraestructura", estimatedHours: 20, tipo: "tangible" }] },
            "@pinya": { name: "Voluntario Core", multiplier: 1.0, fmv: 15, guardian: "caregiver", standard_deliverables: [{ name: "Reparto de Suministros", estimatedHours: 20, tipo: "tangible" }] }
        }
    }
};

const GLOBAL_AIS_ONTOLOGY = [
    { id: '@cap_de_colla', title: 'Arquetipo: Cap de Colla', content: 'Orquestador maestro. Eres el líder de la red, asignas tareas, conectas a los agentes y aseguras que el Castell se levante en armonía y seny.' },
    { id: '@genesi_ai', title: 'Arquetipo: Gènesi', content: 'Creador de mundos. Generas las topologías VNA, distribuyes roles y plasmas la visión inicial del ecosistema en Sprints ejecutables.' },
    { id: '@notari_ledger', title: 'Arquetipo: Notari', content: 'Juez imparcial y criptográfico. Evalúas estrictamente los SOCs (Checklists) de cualquier entregable. Si hay una falla, rechazas. Si pasa, sellas en el Ledger.' },
    { id: '@seny_analyst', title: 'Arquetipo: Seny', content: 'Analista de redes. Tu objetivo es encontrar ineficiencias en el flujo de valor y detectar qué nodo está bloqueando el ecosistema.' },
    { id: '@dharma_coach', title: 'Arquetipo: Dharma', content: 'Guía humano. Tu misión es alinear el talento humano con las necesidades de la red mediante los arquetipos de Pantheon, fomentando el Ikigai.' },
    { id: '@forca_worker', title: 'Arquetipo: Força', content: 'Fuerza bruta algorítmica. Ejecutas cualquier SOP que se te asigne: código, redacción, análisis de datos. Iteras hasta el éxito.' }
];

const CATALOGO_MEMES = [
    // --- CORE OS & ARQUETIPOS ---
    { id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis', content: `Un ecosistema es una red de creación de valor. Convierte activos intangibles en valor negociable. Todo entregable (SOP) viaja por tuberías y se audita mediante SOCs.`, keywords: ['VNA', 'Value Conversion'], broader: 'root_ecosystem_laws', related: ['meme_os_pantheon'] },
    { id: 'meme_os_pantheon', type: 'meme', category: 'core_os', title: 'OS: Pantheon Work (Guardianes)', content: `Las organizaciones se gobiernan por 'Autoridades Intangibles' (12 Guardianes). El Guardián dota de alma al agente para que aporte perspectivas únicas.`, keywords: ['Arquetipos', 'Guardianes', 'Psicología'], broader: 'root_ecosystem_laws', related: ['meme_os_vna'] },
    { id: 'meme_arch_sos', type: 'meme', category: 'core_os', title: 'Arquetipo: 🆘 S.O.S (TeamTowers)', content: `Ecosistema cooperativo Slicing Pie. Valoramos la "Força, Equilibri, Valor i Seny". El trabajo es transparente y se capitaliza equitativamente.`, keywords: ['Slicing Pie', 'Cooperativismo'], broader: 'root_organizational_design', related: [] },
    
    // --- SKILLS ---
    { id: 'meme_skill_tdd', type: 'meme', category: 'skill', title: 'Skill: Test-Driven Development (TDD)', content: `Eres un fundamentalista del TDD. Ciclo estricto: RED (falla) -> GREEN (pasa) -> REFACTOR (optimiza).`, keywords: ['TDD', 'Auditoría'], broader: 'root_engineering', related: [] },
    { id: 'meme_skill_copywriting', type: 'meme', category: 'skill', title: 'Skill: Copywriting Persuasivo', content: `Dominas la psicología del consumidor. Usas frameworks AIDA y PAS. Textos orientados a la conversión.`, keywords: ['Copywriting', 'Marketing'], broader: 'root_growth_marketing', related: [] },
    
    // --- SOCs (REGLAS Y CHECKLISTS) ---
    { id: 'meme_soc_sec_audit', type: 'meme', category: 'soc', title: 'SOC: Security Hardening', content: `CRITERIO DE AUDITORÍA: El entregable debe certificar que no existen vulnerabilidades lógicas ni de inyección de código. Todo input debe estar sanitizado.`, keywords: ['SOC', 'Security', 'Auditoría'], broader: 'root_quality_assurance', related: ['meme_skill_tdd'] },
    { id: 'meme_soc_ux_access', type: 'meme', category: 'soc', title: 'SOC: Accesibilidad W3C (AA)', content: `CRITERIO DE AUDITORÍA: La interfaz o el documento entregado debe cumplir con los estándares de accesibilidad W3C Nivel AA (contraste de color, navegación por teclado).`, keywords: ['SOC', 'Accesibilidad', 'W3C', 'UX'], broader: 'root_design', related: [] }
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
            console.log("🧬 [KB] Sembrando Catálogo de Memes, Skills y SOCs W3C...");
            for (const meme of CATALOGO_MEMES) { await this.saveNode(meme); }
        }

        if (nodes.filter(n => n.type === 'ontology').length === 0) {
            console.log("🌱 [KB] Sembrando ADNs y Ontologías Autocargables...");
            // Ontología de Sectores (Para Nodos Locales)
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Ecosistema: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol de Sistema: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. Función principal en VNA: Ejecutar y garantizar los flujos.`;
                    await this.saveNode({ id: `onto_${sectorKey}_${levelKey.replace('@','')}`, type: 'ontology', sector: sectorKey, roleTarget: levelKey, title: `Arquetipo Local: ${roleData.name}`, content: contentStr });
                }
            }
            // Ontología de la Colla (Para Nodos Globales)
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

    // LA MAGIA: Auto-herencia de ADN para que los cerebros nunca nazcan vacíos
    async getAgentBrainGraph(projectId, roleObj, projectVision, archetype = 'startup') {
        await this.init();
        const allNodes = await this.getAllNodes({ projectId });
        
        // 1. OS Global
        const osMemes = allNodes.filter(n => n.type === 'meme' && n.category === 'core_os');
        
        // 2. ADN Automático y/o Inyectado
        // Si el rol es global (ej. @genesi_ai), buscamos su ontología global.
        // Si el rol es local (ej. @baixos en SaaS), buscamos la ontología de su sector y nivel.
        let defaultDna = [];
        if (roleObj.isGlobalAi) {
            defaultDna = allNodes.filter(n => n.type === 'ontology' && n.roleTarget === roleObj.id);
        } else {
            // Buscamos el sector del proyecto local para extraer su ADN nativo
            const sectorData = allNodes.find(n => n.id === `onto_${projectId}_meta`) || allNodes.find(n => n.type === 'ontology' && n.id.includes(roleObj.levelId.replace('@','')));
            if(sectorData) {
                const sectorPrefix = sectorData.sector || 'general';
                defaultDna = allNodes.filter(n => n.type === 'ontology' && n.roleTarget === roleObj.levelId && (n.sector === sectorPrefix || n.sector === 'global'));
            }
        }
        const customPrompts = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'prompt_a2a');
        const finalDna = [...defaultDna, ...customPrompts];

        // 3. Skills y SOCs inyectados manualmente por el usuario en este agente
        const attachedMemes = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'meme');
        
        // 4. Memoria LMS
        const memories = allNodes.filter(n => (n.type === 'manual' || n.type === 'memory') && n.roleTarget === roleObj.levelId);

        return {
            id: roleObj.id, name: roleObj.name, level: roleObj.levelId,
            guardian: roleObj.guardian || 'everyman',
            archetype: archetype,
            mission: projectVision,
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
        let flatContext = `
            Eres un Agente Autónomo operando en TeamTowers V9.
            Misión del Proyecto: ${tree.mission}
            Arquetipo de la Red: ${tree.archetype}
            Tu Silla: ${tree.name} (${tree.level})
            Tu Guardián (Alma): ${tree.guardian}

            [SISTEMA OPERATIVO Y CULTURA]
            ${tree.branches[0].nodes.map(n => n.content).join('\n')}

            [ADN: TU MISIÓN ONTOLÓGICA]
            ${tree.branches[1].nodes.map(n => n.content).join('\n')}

            [SKILLS & REGLAS DE CONDUCTA]
            ${tree.branches[2].nodes.map(n => n.content).join('\n')}

            [MEMORIA DE CASOS RESUELTOS]
            ${tree.branches[3].nodes.map(n => n.content).join('\n')}
        `;
        return flatContext.replace(/\s+/g, ' ').trim();
    }
};
