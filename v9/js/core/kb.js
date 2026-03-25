// v9/js/core/kb.js
export const NATIVE_ONTOLOGY = {
    "tech_saas_platform": { label: "🦉 SaaS & Data Platforms", meta: "Ecosistema orientado a la lógica y escalabilidad B2B.", roles: {} },
    "web3_defi_protocol": { label: "🏴‍☠️ Web3 & Protocolos DAO", meta: "Ecosistema Trustless. Prioridad en auditoría on-chain.", roles: {} },
    "creative_design_agency": { label: "🎨 Agencia Creativa & Diseño", meta: "Ecosistema enfocado en la estética y materialización de ideas.", roles: {} },
    "blank_canvas": { label: "🌌 Lienzo en Blanco (Inferencia IA Pura)", meta: "Sin roles predefinidos. El Arquitecto IA deducirá la topología exacta desde cero.", roles: {} }
};

const GLOBAL_AIS_ONTOLOGY = [
    { id: '@cap_de_colla', title: 'Arquetipo: Cap de Colla', content: 'Orquestador maestro. Asignas tareas, conectas a los agentes y aseguras que el Castell se levante en armonía y seny.' },
    { id: '@genesi_ai', title: 'Arquetipo: Gènesi', content: 'Creador de mundos. Generas topologías VNA desde cero, infiriendo el modelo de negocio ideal y sus intercambios atemporales.' },
    { id: '@notari_ledger', title: 'Arquetipo: Notari', content: 'Juez imparcial. Evalúas estrictamente los SOCs (Evals).' },
    { id: '@seny_analyst', title: 'Arquetipo: Seny', content: 'Destilador de datos y benchmark. Analiza los evals.json y genera insights cualitativos.' },
    { id: '@mestre_escola', title: 'Arquetipo: Mestre d\'Escola', content: 'Guardián del Árbol de Habilidades. Ejecuta Deep Research y formatea Skills.' }
];

export const CATALOGO_MEMES = [
    { id: 'ref_os_codex', type: 'reference', category: 'reference', title: 'Codex Casteller (Roles)', description: 'Estructura jerárquica de 5 niveles para la responsabilidad de red.', content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles: @anxaneta (Dirección), @aixecador (Táctica), @dosos (Auditoría), @baixos (Producción), @pinya (Soporte).`, keywords: ['Estructura', 'Roles', '#kernel_sos'] },
    { id: 'ref_immortal_tdd', type: 'reference', category: 'reference', title: 'El Kernel Inmortal (TDD & Evals)', description: 'Metodología estricta para forjar SOCs inmutables.', keywords: ['TDD', 'Evals', 'SOC', 'Calidad', '#kernel_sos'], content: `Toda Skill debe tener aserciones (SOCs) objetivas, binarias y medibles para auditar su éxito sin intervención humana subjetiva.` },
    { id: 'ref_vna_methodology', type: 'reference', category: 'reference', title: 'Metodología VNA (Verna Allee)', description: 'Fundamentos de Value Network Analysis.', keywords: ['VNA', 'Metodología', '#kernel_sos'], content: `Modelado de organizaciones como redes vivas. Todo intercambio tangible debe estar sustentado por un intercambio intangible (conocimiento, confianza, feedback).` },

    // 🔥 LA SKILL DE GÈNESI (Formato AgentSkills Anthropic - Sin Eras)
    { 
        id: 'skill_vna_strategy', type: 'skill', category: 'skill', title: 'Skill: Value Map Prompt Generator (VNA)', 
        description: 'USA ESTA SKILL SIEMPRE que el usuario mencione "crear proyecto", "topología", "VNA" o instanciar un ecosistema. Deduce modelos de negocio, mapea flujos atemporales y crea aserciones SOC rigurosas.',
        references: ['ref_os_codex', 'ref_immortal_tdd', 'ref_vna_methodology'],
        keywords: ['Estrategia', 'VNA', '@genesi_ai', 'AgentSkills'],
        content: `### 1. VNA Flow
- **Inputs Requeridos:** Sector, Tipo de Organización, Visión y Objetivos (Si falta info, haz PREGUNTAS PREVIAS).
- **Outputs Generados:** Topología JSON estricta (Roles estructurados, matriz de intercambios tangibles/intangibles continuos, SOCs objetivos).

### 2. SOP (Standard Operating Procedure)
1. **Research de Arquetipos:** Basado en el sector del usuario, infiere los roles reales necesarios (ej: si es educación, crea "Instructor", "Alumno", "Validador"). Asigna cada rol a un nivel del Codex Casteller (@anxaneta a @pinya).
2. **Mapeo Topológico Libre (Atemporal):** NO dividas el proyecto en fases o eras cronológicas. Modela el ecosistema en su estado de funcionamiento ideal. ¿Cómo interactúan los nodos continuamente?
3. **Equilibrio T/I:** Por cada flujo de valor Tangible (T) que crees, asegúrate de mapear el flujo Intangible (I) de retorno (feedback, confianza, datos).
4. **Desarrollo de SOCs:** Cada flujo debe tener "soc_checklists". Escríbelos como aserciones (Evals) medibles, objetivas y binarias (True/False) compatibles con evaluaciones de sistema.

### 3. SOC (Evals internos de la Skill)
- [ ] La red generada tiene al menos 5 roles interconectados.
- [ ] No existen nodos aislados (todo rol tiene un flujo de entrada y uno de salida).
- [ ] Los SOCs generados para las transacciones no contienen lenguaje subjetivo (ej. prohibido usar "que sea bonito" o "adecuado").` 
    },
    
    {
        id: 'prompt_global_genesi_ai', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@genesi_ai', roleTarget: '@genesi_ai',
        title: 'Alma de Gènesi AI (Ecosystem Architect)',
        keywords: ['System', 'Prompt', 'Genesi', 'Architect'],
        content: `Eres @genesi_ai, Master Ecosystem Architect de TeamTowers V9. Tu misión es diseñar arquitecturas VNA atemporales apoyándote en tu Skill de Diseño Estratégico (skill_vna_strategy).`
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V15', 
    dbVersion: 15, // 🔥 Subimos versión para inyectar la nueva mente de Gènesi
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
            };
        });
    },

    async seedDatabaseIfNeeded() {
        const nodes = await this.getAllNodes();
        for (const meme of CATALOGO_MEMES) { 
            const exists = nodes.find(n => n.id === meme.id);
            if (!exists || meme.id === 'skill_vna_strategy' || meme.id === 'prompt_global_genesi_ai') {
                await this.saveNode(meme); 
            }
        }
        if (!nodes.find(n => n.id === 'onto_blank_canvas_meta')) {
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Sector: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ id: `onto_${sectorKey}_${levelKey.replace('@','')}`, type: 'ontology', sector: sectorKey, roleTarget: levelKey, title: `Arquetipo: ${roleData.name}`, content: contentStr, core_skills: roleData.core_skills || [] });
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
            const request = this.db.transaction(['nodes'], 'readonly').objectStore('nodes').get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },
    async saveNode(node) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const semanticNode = { ...node, id: node.id || 'node_' + Date.now(), lastUpdated: Date.now(), projectId: node.projectId || 'global', targetId: node.targetId || 'global', type: node.type || 'custom', description: node.description || '', references: node.references || [], dependencies: node.dependencies || [] };
            if (semanticNode.keywords && typeof semanticNode.keywords === 'string') semanticNode.keywords = semanticNode.keywords.split(',').map(k => k.trim());
            const request = this.db.transaction(['nodes'], 'readwrite').objectStore('nodes').put(semanticNode);
            request.onsuccess = () => resolve(semanticNode);
            request.onerror = (e) => reject(e.target.error);
        });
    },
    async getAllNodes(filters = {}) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(['nodes'], 'readonly').objectStore('nodes').getAll();
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
            const request = this.db.transaction(['nodes'], 'readwrite').objectStore('nodes').delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    },
    async getAvailableSectors() {
        const sectors = {};
        Object.entries(NATIVE_ONTOLOGY).forEach(([sectorKey, sectorData]) => {
            sectors[sectorKey] = { label: sectorData.label, roles: {} };
            Object.entries(sectorData.roles).forEach(([levelKey, roleData]) => {
                sectors[sectorKey].roles[levelKey] = { name: roleData.name, guardian: roleData.guardian, content: `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`, core_skills: roleData.core_skills || [] };
            });
        });
        return sectors;
    },
    async getAgentBrainGraph(projectId, agentId, storeState) {
        await this.init();
        const allNodes = await this.getAllNodes();
        const agentPrompt = allNodes.find(n => n.type === 'prompt_a2a' && n.targetId === agentId);
        const agentSkillsAndMemes = allNodes.filter(n => (n.type === 'skill' || n.type === 'meme') && n.keywords && n.keywords.includes(agentId));
        
        const activeReferences = [];
        agentSkillsAndMemes.forEach(node => {
            if (node.references && Array.isArray(node.references)) {
                node.references.forEach(refId => {
                    const refNode = allNodes.find(n => n.id === refId);
                    if (refNode && !activeReferences.find(r => r.id === refId)) activeReferences.push(refNode);
                });
            }
        });
        
        let projectContext = null;
        if (projectId && storeState) {
            const project = storeState.projects.find(p => p.id === projectId);
            if (project) {
                const agentTasks = (project.work_orders || []).filter(w => w.assigneeId === agentId && w.status !== 'consolidated');
                projectContext = { name: project.nombre, vision: project.vision || 'No definida.', roles: project.roles || [], activeTasks: agentTasks, flows: project.vna_flows || [] };
            }
        }

        return { agentId, systemPrompt: agentPrompt ? agentPrompt.content : `Eres ${agentId}.`, skills: agentSkillsAndMemes, references: activeReferences, ecosystemContext: projectContext };
    },
    async getDynamicContextPrompt(projectId, agentId, storeState) {
        const brain = await this.getAgentBrainGraph(projectId, agentId, storeState);
        let prompt = `=====================================\nIDENTIDAD (SYSTEM)\n=====================================\n${brain.systemPrompt}\n\n`;
        if (brain.references.length > 0) { prompt += `=====================================\nLIBRERÍA DE REFERENCIAS (W3C / VNA)\n=====================================\n`; brain.references.forEach(r => { prompt += `- [REF: ${r.title}]: ${r.content}\n`; }); prompt += `\n`; }
        if (brain.skills.length > 0) { prompt += `=====================================\nCAPACIDADES (AGENT SKILLS)\n=====================================\n`; brain.skills.forEach(s => { prompt += `- [SKILL: ${s.title}]: ${s.content}\n`; }); prompt += `\n`; }
        return prompt;
    }
};
