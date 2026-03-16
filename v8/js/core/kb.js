// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Auditoría Competencial Fractal (A2A)

// 1. GENOMA ONTOLÓGICO FRACTAL (VNA)
export const NATIVE_ONTOLOGY = {
    "tech_saas_platform": {
        label: "💻 Software & SaaS", meta: "Ecosistema orientado al ciclo de vida del software, escalabilidad y reducción de deuda técnica.",
        roles: {
            "@anxaneta": { name: "CEO / Visionario", multiplier: 3.0, fmv: 60, guardian: "ruler", core_flows: ['flow_bmc_creation'] },
            "@aixecador": { name: "CPO / Product Lead", multiplier: 2.0, fmv: 50, guardian: "creator", core_flows: ['flow_prd_definition'] },
            "@dosos": { name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45, guardian: "sage", core_flows: ['flow_sec_audit', 'flow_sys_arch'] },
            "@baixos": { name: "Desarrollador Fullstack", multiplier: 1.2, fmv: 40, guardian: "hephaestus", core_flows: ['flow_tdd_implementation'] },
            "@pinya": { name: "QA / Soporte IT", multiplier: 1.0, fmv: 30, guardian: "caregiver", core_flows: ['flow_e2e_testing'] }
        }
    },
    "web3_defi_protocol": {
        label: "🌐 Web3 & Protocolos DAO", meta: "Ecosistema Trustless. Prioridad en auditoría on-chain y tokenomics.",
        roles: {
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "magician", core_flows: ['flow_tokenomics'] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, guardian: "ruler", core_flows: ['flow_bip_creation'] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, guardian: "sage", core_flows: ['flow_sc_audit'] },
            "@baixos": { name: "Solidity Engineer", multiplier: 1.2, fmv: 55, guardian: "hephaestus", core_flows: ['flow_sc_dev'] },
            "@pinya": { name: "Node Operator", multiplier: 1.0, fmv: 35, guardian: "everyman", core_flows: ['flow_node_setup'] }
        }
    }
    // (Añadiremos los demás sectores cuando estandaricemos los flujos)
};

const GLOBAL_AIS_ONTOLOGY = [
    { id: '@cap_de_colla', title: 'Arquetipo: Cap de Colla', content: 'Orquestador maestro. Asignas tareas, conectas a los agentes y aseguras que el Castell se levante en armonía y seny. Tienes visión total del proyecto y los Gaps de competencias.' },
    { id: '@genesi_ai', title: 'Arquetipo: Gènesi', content: 'Creador de mundos. Generas las topologías VNA de 5 fases, anclas competencias y plasmas la visión inicial del ecosistema en Sprints ejecutables.' },
    { id: '@notari_ledger', title: 'Arquetipo: Notari', content: 'Juez imparcial. Evalúas estrictamente los SOCs. Si hay una falla, aplicas una MERMA al multiplicador FMV. Otorga XP para subir niveles de Skill.' },
    { id: '@seny_analyst', title: 'Arquetipo: Seny', content: 'Sintetizador de Memoria Zero-Noise. Destilas la experiencia de la red en keywords y resúmenes de 1 línea.' },
    { id: '@dharma_coach', title: 'Arquetipo: Dharma', content: 'Guía Ikigai. Alinear el talento humano con las necesidades de la red mediante los arquetipos de Pantheon.' },
    { id: '@forca_worker', title: 'Arquetipo: Força', content: 'Fuerza bruta algorítmica. Ejecutas cualquier SOP que se te asigne: código, redacción, análisis.' },
    { id: '@mestre_escola', title: 'Arquetipo: Mestre d\'Escola', content: 'Guardián del Árbol de Habilidades. Gobiernas y defines los estándares para los niveles Bronce, Plata y Oro.' }
];

// 2. NUEVO CATÁLOGO FRACTAL (Memes + Flujos de Metodología VNA)
export const CATALOGO_MEMES = [
    // --- CORE OS ---
    { id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis', content: `Un ecosistema es una red de creación de valor. Todo entregable viaja por tuberías y se audita mediante SOCs.`, keywords: ['VNA', 'Value Conversion'], broader: 'root_ecosystem_laws', related: ['meme_os_pantheon'] },
    
    // --- SKILLS Y GUARDIANES (Resumidos para mantener tu base) ---
    { id: 'meme_skill_lvl_baixos', type: 'meme', category: 'skill', title: 'Nivel: @baixos (Producción)', content: `Ejecución técnica pura, trabajo de campo, desarrollo de producto.`, keywords: ['Producción'], broader: 'root_castell_levels', related: [] },
    { id: 'meme_skill_lvl_dosos', type: 'meme', category: 'skill', title: 'Nivel: @dosos (Auditoría)', content: `Control de calidad (QA), evaluación de riesgos, revisión por pares.`, keywords: ['Auditoría'], broader: 'root_castell_levels', related: [] },
    { id: 'meme_soc_code_quality', type: 'meme', category: 'soc', title: 'SOC: Calidad de Código (Clean Code)', content: `AUDITORÍA: 1. Sin 'Magic Numbers'. 2. Funciones < 20 líneas. 3. Cobertura >80%.`, keywords: ['SOC', 'Clean Code'], broader: 'root_quality_assurance', related: [] },

    // 🔥 NUEVO: FLUJOS DE METODOLOGÍA (La semilla de los 100 Roles Clave)
    {
        id: 'flow_tdd_implementation',
        type: 'methodology_flow',
        category: 'engineering',
        title: 'Flujo VNA: Test-Driven Development (TDD)',
        description: 'Implementación estricta de RED-GREEN-REFACTOR entre un productor y un auditor.',
        version: '1.0',
        transactions: [
            {
                id: 'tx_tdd_1', step: 1, from: '@baixos', to: '@baixos', tipo: 'tangible',
                entregable: 'Tests Unitarios (Failing)',
                sop: 'Escribir tests que definan el comportamiento esperado antes de escribir código de producción.',
                socs: ['Tests fallan por razones correctas', 'Cobertura de casos límite (Edge cases)']
            },
            {
                id: 'tx_tdd_2', step: 2, from: '@baixos', to: '@dosos', tipo: 'tangible', depends_on: ['tx_tdd_1'],
                entregable: 'Código de Producción + Refactor (PR)',
                sop: 'Escribir código mínimo para pasar el test. Refactorizar respetando DRY y SOLID. Abrir Pull Request.',
                socs: ['Todos los tests pasan (Green)', 'Complejidad ciclomática reducida']
            },
            {
                id: 'tx_tdd_3', step: 3, from: '@dosos', to: '@baixos', tipo: 'intangible', depends_on: ['tx_tdd_2'],
                entregable: 'Code Review & Merge',
                sop: 'Auditar el PR asegurando que el código cumple Clean Code y no rompe tests de regresión.',
                socs: ['Sin vulnerabilidades obvias', 'Aprobado y Merged a main']
            }
        ]
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V12', // Subimos versión por el cambio de esquema
    dbVersion: 2,
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
                    // Nuevo índice para rastrear la evolución (forks)
                    store.createIndex('forkedFrom', 'forkedFrom', { unique: false }); 
                }
            };
        });
    },

    async seedDatabaseIfNeeded() {
        const nodes = await this.getAllNodes();
        
        if (nodes.filter(n => n.type === 'meme' || n.type === 'methodology_flow').length === 0) {
            for (const meme of CATALOGO_MEMES) { await this.saveNode(meme); }
        }

        if (nodes.filter(n => n.type === 'ontology').length === 0) {
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Ecosistema: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    // Ahora guardamos la referencia a los flujos core en lugar de simples entregables
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ 
                        id: `onto_${sectorKey}_${levelKey.replace('@','')}`, 
                        type: 'ontology', sector: sectorKey, roleTarget: levelKey, 
                        title: `Arquetipo Local: ${roleData.name}`, content: contentStr, 
                        core_flows: roleData.core_flows 
                    });
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
                forkedFrom: node.forkedFrom || null, // Clave para la trazabilidad de mutaciones
                jsonLd: {
                    "@context": "https://schema.org", "@type": "DefinedTerm",
                    "name": node.title, "description": node.content || node.description, "inDefinedTermSet": "TeamTowers_Ontology",
                    "keywords": node.keywords ? (Array.isArray(node.keywords) ? node.keywords.join(', ') : node.keywords) : "",
                    "broader": node.broader || null, "relatedLink": node.related || [],
                    "sprintId": node.sprintId || null 
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
                if (filters.forkedFrom) nodes = nodes.filter(n => n.forkedFrom === filters.forkedFrom);
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
                    core_flows: roleData.core_flows || [] 
                };
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
        let autoSkills = [];
        let methodologyFlows = [];
        
        if (roleObj.isGlobalAi) {
            defaultDna = allNodes.filter(n => n.type === 'ontology' && n.roleTarget === roleObj.id);
        } else {
            const sectorData = allNodes.find(n => n.id === `onto_${projectId}_meta`) || allNodes.find(n => n.type === 'ontology' && n.id.includes(roleObj.levelId.replace('@','')));
            if(sectorData) {
                const sectorPrefix = sectorData.sector || 'general';
                const roleOntologyNode = allNodes.find(n => n.type === 'ontology' && n.roleTarget === roleObj.levelId && (n.sector === sectorPrefix || n.sector === 'global'));
                
                if (roleOntologyNode) {
                    defaultDna.push(roleOntologyNode);
                    
                    // Extraer los flujos VNA nativos del rol
                    if (roleOntologyNode.core_flows) {
                        roleOntologyNode.core_flows.forEach(flowId => {
                            const flowNode = allNodes.find(n => n.id === flowId && n.type === 'methodology_flow');
                            if (flowNode) methodologyFlows.push(flowNode);
                        });
                    }
                }
            }
        }
        
        const customPrompts = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'prompt_a2a');
        const finalDna = [...defaultDna, ...customPrompts];

        const attachedMemes = allNodes.filter(n => n.targetId === roleObj.id && n.type === 'meme');
        const finalSkillsAndSocs = [...autoSkills, ...attachedMemes];

        const memories = allNodes.filter(n => (n.type === 'manual' || n.type === 'memory') && n.roleTarget === roleObj.levelId);

        return {
            id: roleObj.id, name: roleObj.name, level: roleObj.levelId, guardian: roleObj.guardian || 'everyman', archetype: archetype, mission: projectVision,
            branches: [
                { name: "🌐 Core OS & Arquetipo", nodes: osMemes.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content, isNative: true })) },
                { name: "🧬 ADN (Ontología)", nodes: finalDna.map(p => ({ id: p.id, title: p.title || p.jsonLd?.name, content: p.content, isNative: true, originalNode: p })) },
                // NUEVA RAMA: Flujos de Metodología VNA procesables por el agente
                { name: "🔄 Flujos VNA (SOPs)", nodes: methodologyFlows.map(f => ({ id: f.id, title: f.title, content: JSON.stringify(f.transactions, null, 2), isNative: true })) },
                { name: "🎒 Skills & SOCs", nodes: finalSkillsAndSocs.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content, isNative: m.isNative })) },
                { name: "📚 Memoria LMS", nodes: memories.map(m => ({ id: m.id, title: m.title || m.jsonLd?.name, content: m.content })) }
            ]
        };
    },

    async getAgentContextFlattened(projectId, roleObj, projectVision, archetype = 'startup') {
        const tree = await this.getAgentBrainGraph(projectId, roleObj, projectVision, archetype);
        let flatContext = `Eres un Agente en TeamTowers V9.\nMisión: ${tree.mission}\nArquetipo: ${tree.archetype}\nSilla: ${tree.name} (${tree.level})\nGuardián: ${tree.guardian}\n\n[OS]\n${tree.branches[0].nodes.map(n => n.content).join('\n')}\n\n[ADN]\n${tree.branches[1].nodes.map(n => n.content).join('\n')}\n\n[FLUJOS METODOLÓGICOS VNA]\n${tree.branches[2].nodes.map(n => n.content).join('\n')}\n\n[SKILLS/SOCs]\n${tree.branches[3].nodes.map(n => n.content).join('\n')}\n\n[MEMORIA]\n${tree.branches[4].nodes.map(n => n.content).join('\n')}`;
        return flatContext.replace(/\s+/g, ' ').trim();
    }
};
