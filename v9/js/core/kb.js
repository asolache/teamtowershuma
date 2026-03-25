// v9/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) con Arquitectura AgentSkills y Referencias Reusables

// ============================================================================
// 1. GENOMA ONTOLÓGICO FRACTAL (VNA) - LOS 12 ARQUETIPOS DEL PANTEÓN
// ============================================================================
// 🔥 EVOLUCIÓN: Los roles ahora se anclan a 'core_skills' en lugar de flujos estáticos.
export const NATIVE_ONTOLOGY = {
    "tech_saas_platform": {
        label: "🦉 SaaS & Data Platforms", meta: "Ecosistema orientado a la lógica, analítica de datos y escalabilidad de software B2B.",
        roles: {
            "@anxaneta": { name: "CEO / Visionario", multiplier: 3.0, fmv: 60, guardian: "sage", core_skills: ['skill_vna_strategy'] },
            "@aixecador": { name: "CPO / Product Lead", multiplier: 2.0, fmv: 50, guardian: "explorer", core_skills: ['skill_product_discovery'] },
            "@dosos": { name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45, guardian: "ruler", core_skills: ['skill_clean_architecture'] },
            "@baixos": { name: "Desarrollador Fullstack", multiplier: 1.2, fmv: 40, guardian: "creator", core_skills: ['skill_tdd_execution'] },
            "@pinya": { name: "Data/QA Support", multiplier: 1.0, fmv: 30, guardian: "everyman", core_skills: ['skill_qa_automation'] }
        }
    },
    "web3_defi_protocol": {
        label: "🏴‍☠️ Web3 & Protocolos DAO", meta: "Ecosistema Trustless. Prioridad en auditoría on-chain, tokenomics y disrupción del status quo.",
        roles: {
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "outlaw", core_skills: ['skill_tokenomics_design'] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, guardian: "sage", core_skills: ['skill_dao_governance'] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, guardian: "ruler", core_skills: ['skill_sc_security'] },
            "@baixos": { name: "Solidity Engineer", multiplier: 1.2, fmv: 55, guardian: "creator", core_skills: ['skill_solidity_dev'] },
            "@pinya": { name: "Node Operator", multiplier: 1.0, fmv: 35, guardian: "everyman", core_skills: ['skill_node_ops'] }
        }
    },
    "creative_design_agency": {
        label: "🎨 Agencia Creativa & Diseño", meta: "Ecosistema enfocado en la estética, la innovación visual y la materialización de ideas.",
        roles: {
            "@anxaneta": { name: "Director Creativo", multiplier: 3.0, fmv: 65, guardian: "creator", core_skills: ['skill_creative_direction'] },
            "@aixecador": { name: "Art Director", multiplier: 2.0, fmv: 50, guardian: "magician", core_skills: ['skill_visual_storytelling'] },
            "@dosos": { name: "Design Reviewer", multiplier: 1.5, fmv: 40, guardian: "sage", core_skills: ['skill_uiux_audit'] },
            "@baixos": { name: "UI/UX & Motion Designer", multiplier: 1.2, fmv: 35, guardian: "lover", core_skills: ['skill_asset_production'] },
            "@pinya": { name: "Copywriter / Asset Manager", multiplier: 1.0, fmv: 25, guardian: "everyman", core_skills: ['skill_copywriting'] }
        }
    }
    // Nota: El resto de los 12 arquetipos siguen la misma lógica estructural.
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

// ============================================================================
// 2. CATÁLOGO FRACTAL (Referencias Puras y Skills Ejecutables)
// ============================================================================
export const CATALOGO_MEMES = [
    // --- CAPA 1: REFERENCIAS (El Saber Estático y Reutilizable) ---
    { 
        id: 'ref_os_vna', type: 'reference', category: 'methodology', title: 'VNA (Value Network Analysis)', 
        description: 'Metodología de Verna Allee para mapear intercambios tangibles e intangibles.',
        content: `Un ecosistema es una red de creación de valor. Todo entregable (Output) viaja por tuberías y se audita mediante SOCs. Ninguna acción sin valor demostrable debe ser procesada.`, 
        keywords: ['VNA', '#kernel_sos'] 
    },
    { 
        id: 'ref_os_codex', type: 'reference', category: 'methodology', title: 'Codex Casteller (Roles)', 
        description: 'Estructura jerárquica de 5 niveles para la responsabilidad de red.',
        content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles: @anxaneta (Dirección), @aixecador (Táctica), @dosos (Auditoría), @baixos (Producción), @pinya (Soporte).`, 
        keywords: ['Estructura', 'Roles', '#kernel_sos'] 
    },
    { 
        id: 'ref_os_slicing_pie', type: 'reference', category: 'methodology', title: 'Slicing Pie (Ledger)', 
        description: 'Fórmula de equidad dinámica para distribución de valor.',
        content: `Regla de Equidad: El capital se distribuye según el FMV multiplicado por un factor de riesgo. Solo las tareas validadas generan Slices.`, 
        keywords: ['Ledger', 'Equity', '#kernel_sos'] 
    },

    // --- CAPA 2: SKILLS (El Saber Hacer que consume Referencias) ---
    { 
        id: 'skill_vna_strategy', type: 'skill', category: 'strategic', title: 'Diseño Estratégico VNA', 
        description: 'Capacidad para diseñar y evaluar redes de valor completas.',
        content: `Utiliza la metodología VNA para trazar mapas de valor. Identifica flujos rotos y asegura que todos los roles aporten tanto intangibles como tangibles.`, 
        references: ['ref_os_vna', 'ref_os_codex'], // 🔥 GRAVEDAD: Esta Skill depende de estas 2 referencias
        keywords: ['Estrategia', 'VNA'] 
    },
    { 
        id: 'skill_tdd_execution', type: 'skill', category: 'technical', title: 'Ejecución TDD / Clean Code', 
        description: 'Desarrollo de entregables guiado por pruebas y estándares W3C.',
        content: `CRITERIOS ESTRICTOS: 1. Sin 'Magic Numbers'. 2. Funciones < 20 líneas. 3. Respetar DRY y SOLID. 4. Cero fallos de Linting.`, 
        references: [],
        keywords: ['Producción', 'Clean Code'] 
    },
    
    // --- CAPA 3: PROMPTS DE AGENTES (Que usarán las Skills) ---
    {
        id: 'prompt_global_genesi_ai', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@genesi_ai', roleTarget: '@genesi_ai',
        title: 'Alma de Gènesi AI (Ecosystem Architect)',
        keywords: ['System', 'Prompt', 'Genesi', 'Architect'],
        content: `Eres @genesi_ai, Master Ecosystem Architect de TeamTowers V9. 
Tu misión es diseñar arquitecturas VNA apoyándote en las Skills y Referencias del LMS.
MANDAMIENTOS:
1. Analiza las tuberías de valor de forma crítica. Si ves una dependencia rota, señálalo.
2. Aboga siempre por la automatización: tareas mecánicas a la IA, estrategia a humanos.
3. Sé conciso, técnico y directo. Utiliza metáforas arquitectónicas.`
    },
    {
        id: 'prompt_global_notari_ledger', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@notari_ledger', roleTarget: '@notari_ledger',
        title: 'Alma del Notari Ledger (Auditor de Equidad)',
        keywords: ['System', 'Prompt', 'Notari', 'Ledger', 'Auditor'],
        content: `Eres @notari_ledger, el Juez Imparcial y Auditor del Slicing Pie en TeamTowers.
Tu misión es auditar la tabla de capitalización y evaluar Entregables contra sus SOCs.
MANDAMIENTOS:
1. La justicia es ciega y matemática. Mide el valor por: Horas × FMV × Multiplicador.
2. Si un entregable no cumple los SOCs, recomienda una MERMA en el multiplicador.
3. Habla con tono solemne, legal y numérico.`
    }
];

// ============================================================================
// 3. MOTOR DE INDEXACIÓN Y ALQUIMIA (IndexedDB V9)
// ============================================================================
export const KB = {
    dbName: 'TeamTowers_LMS_V15', 
    dbVersion: 9, // 🔥 Subimos a 9 para soportar el campo "references"
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
                    store.createIndex('keywords', 'keywords', { multiEntry: true, unique: false }); 
                }
                console.log(`🌌 [Antigravity] IndexedDB forjado. Versión: ${this.dbVersion} (Refs & Skills Support)`);
            };
        });
    },

    async seedDatabaseIfNeeded() {
        const nodes = await this.getAllNodes();
        
        // Inyectamos Catálogo Core si no existe
        if (!nodes.find(n => n.id === 'ref_os_codex')) {
            for (const meme of CATALOGO_MEMES) { 
                if (!nodes.find(n => n.id === meme.id)) {
                    await this.saveNode(meme); 
                }
            }
        }

        // Inyectamos Ontología VNA (Genomas)
        if (!nodes.find(n => n.id === 'onto_web3_defi_protocol_meta')) {
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Sector: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ 
                        id: `onto_${sectorKey}_${levelKey.replace('@','')}`, 
                        type: 'ontology', sector: sectorKey, roleTarget: levelKey, 
                        title: `Arquetipo: ${roleData.name}`, content: contentStr, 
                        core_skills: roleData.core_skills || [] // 🔥 Soporte nativo para Skills en la BD
                    });
                }
            }
            for (const ai of GLOBAL_AIS_ONTOLOGY) {
                await this.saveNode({ id: `onto_global_${ai.id.replace('@','')}`, type: 'ontology', sector: 'global', roleTarget: ai.id, title: ai.title, content: ai.content });
            }
        }
    },

    async getNode(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['nodes'], 'readonly');
            const store = transaction.objectStore('nodes');
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

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
                
                // AgentSkills & Reference Expansion
                description: node.description || '',
                references: node.references || [], // 🔥 Array de IDs que apunta a nodos tipo 'reference'
                dependencies: node.dependencies || [],
            };
            
            if (semanticNode.keywords && typeof semanticNode.keywords === 'string') {
                semanticNode.keywords = semanticNode.keywords.split(',').map(k => k.trim());
            }

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
                if (filters.category) nodes = nodes.filter(n => n.category === filters.category);
                
                resolve(nodes);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async deleteNode(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['nodes'], 'readwrite');
            const store = transaction.objectStore('nodes');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
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
                    content: `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`,
                    core_skills: roleData.core_skills || []
                };
            });
        });
        return sectors;
    },

    // Enrutador de Contexto Avanzado (Resolución recursiva de Referencias)
    async getAgentBrainGraph(projectId, agentId, storeState) {
        await this.init();
        const allNodes = await this.getAllNodes();
        
        const agentPrompt = allNodes.find(n => n.type === 'prompt_a2a' && n.targetId === agentId);
        const agentSkillsAndMemes = allNodes.filter(n => (n.type === 'skill' || n.type === 'meme') && n.keywords && n.keywords.includes(agentId));
        
        // 🔥 Resolutor Cuántico: Extraemos las Referencias que necesitan las Skills del agente
        const activeReferences = [];
        agentSkillsAndMemes.forEach(node => {
            if (node.references && Array.isArray(node.references)) {
                node.references.forEach(refId => {
                    const refNode = allNodes.find(n => n.id === refId);
                    if (refNode && !activeReferences.find(r => r.id === refId)) {
                        activeReferences.push(refNode);
                    }
                });
            }
        });
        
        let projectContext = null;
        if (projectId && storeState) {
            const project = storeState.projects.find(p => p.id === projectId);
            if (project) {
                const agentTasks = (project.work_orders || []).filter(w => w.assigneeId === agentId && w.status !== 'consolidated');
                projectContext = {
                    name: project.nombre, vision: project.vision || 'No definida.', roles: project.roles || [], activeTasks: agentTasks, flows: project.vna_flows || []
                };
            }
        }

        return {
            agentId: agentId,
            systemPrompt: agentPrompt ? agentPrompt.content : `Eres ${agentId}, un agente de IA operando en TeamTowers.`,
            skills: agentSkillsAndMemes,
            references: activeReferences,
            ecosystemContext: projectContext
        };
    },

    async getDynamicContextPrompt(projectId, agentId, storeState) {
        const brain = await this.getAgentBrainGraph(projectId, agentId, storeState);
        
        let prompt = `=====================================\n`;
        prompt += `IDENTIDAD (SYSTEM)\n`;
        prompt += `=====================================\n`;
        prompt += `${brain.systemPrompt}\n\n`;

        if (brain.references.length > 0) {
            prompt += `=====================================\n`;
            prompt += `LIBRERÍA DE REFERENCIAS (W3C / VNA)\n`;
            prompt += `=====================================\n`;
            brain.references.forEach(r => {
                prompt += `- [REF: ${r.title}]: ${r.content}\n`;
            });
            prompt += `\n`;
        }

        if (brain.skills.length > 0) {
            prompt += `=====================================\n`;
            prompt += `CAPACIDADES (AGENT SKILLS)\n`;
            prompt += `=====================================\n`;
            brain.skills.forEach(s => {
                prompt += `- [SKILL: ${s.title}]: ${s.content}\n`;
            });
            prompt += `\n`;
        }

        if (brain.ecosystemContext) {
            prompt += `=====================================\n`;
            prompt += `CONTEXTO DEL ECOSISTEMA (TIEMPO REAL)\n`;
            prompt += `=====================================\n`;
            prompt += `Proyecto: ${brain.ecosystemContext.name}\n`;
            prompt += `Visión: ${brain.ecosystemContext.vision}\n`;
            if (brain.ecosystemContext.activeTasks.length > 0) {
                prompt += `ATENCIÓN: Tienes ${brain.ecosystemContext.activeTasks.length} Work Orders pendientes.\n`;
            }
        }

        return prompt;
    }
};
