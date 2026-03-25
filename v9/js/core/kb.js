// v9/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) con Arquitectura AgentSkills y Referencias Reusables

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
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "outlaw", core_skills: ['skill_tokenomics_design'] }
        }
    },
    "creative_design_agency": {
        label: "🎨 Agencia Creativa & Diseño", meta: "Ecosistema enfocado en la estética, la innovación visual y la materialización de ideas.",
        roles: {
            "@anxaneta": { name: "Director Creativo", multiplier: 3.0, fmv: 65, guardian: "creator", core_skills: ['skill_creative_direction'] }
        }
    },
    "blank_canvas": {
        label: "🌌 Lienzo en Blanco (Inferencia IA Pura)", meta: "Sin roles predefinidos. El Arquitecto IA deducirá la topología exacta desde cero basándose en la Visión Fundacional.",
        roles: {}
    }
};

const GLOBAL_AIS_ONTOLOGY = [
    { id: '@cap_de_colla', title: 'Arquetipo: Cap de Colla', content: 'Orquestador maestro. Asignas tareas, conectas a los agentes y aseguras que el Castell se levante en armonía y seny.' },
    { id: '@genesi_ai', title: 'Arquetipo: Gènesi', content: 'Creador de mundos. Generas topologías VNA desde cero, sin restricciones, infiriendo el modelo de negocio ideal.' },
    { id: '@notari_ledger', title: 'Arquetipo: Notari', content: 'Juez imparcial. Evalúas estrictamente los SOCs (Evals). Si falla, aplicas una MERMA.' },
    { id: '@seny_analyst', title: 'Arquetipo: Seny', content: 'Destilador de datos y benchmark. Analiza los evals.json y genera insights cualitativos.' },
    { id: '@mestre_escola', title: 'Arquetipo: Mestre d\'Escola', content: 'Guardián del Árbol de Habilidades. Ejecuta Deep Research y formatea Skills.' }
];

export const CATALOGO_MEMES = [
    { 
        id: 'ref_os_codex', type: 'reference', category: 'reference', title: 'Codex Casteller (Roles)', 
        description: 'Estructura jerárquica de 5 niveles para la responsabilidad de red.',
        content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles: @anxaneta (Dirección), @aixecador (Táctica), @dosos (Auditoría), @baixos (Producción), @pinya (Soporte).`, 
        keywords: ['Estructura', 'Roles', '#kernel_sos'] 
    },
    {
        id: 'ref_immortal_tdd', type: 'reference', category: 'reference', title: 'El Kernel Inmortal (TDD & Evals)',
        description: 'Metodología estricta para forjar SOCs (Standard Operating Conditions) inmutables.',
        keywords: ['TDD', 'Evals', 'SOC', 'Calidad', '#kernel_sos'],
        content: `## El Principio de Inmortalidad
Un sistema solo es inmortal si es auditable. La auditoría se logra mediante Evals (SOCs).
Toda Skill debe tener un directorio virtual \`/evals/evals.json\` con casos de prueba (prompts) y aserciones programáticas (evaluaciones objetivas).`
    },

    // 🔥 SKILL ACTUALIZADA: GÈNESI DESENCADENADO (VNA 2.0)
    { 
        id: 'skill_vna_strategy', type: 'skill', category: 'skill', title: 'Skill: Value Map Prompt Generator (VNA)', 
        description: 'USA ESTA SKILL SIEMPRE que el usuario mencione "crear proyecto", "topología", "VNA", "red de valor" o cuando pida instanciar un ecosistema. Incluso si no pide explícitamente un mapa, úsala para estructurar el modelo de negocio subyacente.',
        references: ['ref_os_codex', 'ref_immortal_tdd'],
        keywords: ['Estrategia', 'VNA', '@genesi_ai', 'Mapas de Valor'],
        content: `Eres el motor de creación de ecosistemas. NO estás limitado por plantillas predefinidas. Eres un creador desde cero.

INSTRUCCIONES DE CONSTRUCCIÓN:
1. DEDUCE EL SECTOR Y LOS ROLES: Lee la misión y el público objetivo. Inventa los roles (humanos o IA) EXACTOS que necesita este negocio para funcionar. No uses roles genéricos; usa nomenclatura específica del dominio. Asigna a cada rol un nivel del Codex Casteller (@anxaneta a @pinya).
2. MAPEA LA MATRIZ DE INTERCAMBIOS: Por cada par de roles, establece qué se intercambia:
   - TANGIBLES (T): Pagos, contratos, código, entregables.
   - INTANGIBLES (I): Confianza, conocimiento, feedback, reputación.
   *Asegura que haya reciprocidad (bucle cerrado).*
3. CREACIÓN DE SKILLS: Especifica el "Pool de Skills" (capacidades) necesarias para cada rol inventado.
4. BENCHMARK / EVALS (SOCs): Define 3-4 métricas cualitativas o aserciones estrictas para auditar el éxito de este ecosistema en el tiempo.` 
    },
    
    // 🔥 NUEVA META-SKILL: SKILL CREATOR (Basado en el estándar AgentSkills de Anthropic)
    { 
        id: 'skill_creator_master', type: 'skill', category: 'skill', title: 'Skill Creator (AgentSkills Standard)', 
        description: 'USAR SIEMPRE que el usuario quiera crear, editar, testear (evals) o mejorar una skill, prompt, o flujo de trabajo. Transforma ideas difusas en cápsulas de conocimiento estructuradas compatibles con Claude y TeamTowers.',
        references: ['ref_immortal_tdd'],
        keywords: ['Meta', 'Skill Creator', 'AgentSkills', 'Evals'],
        content: `### Anatomía Oficial de una Skill
Toda skill generada debe respetar esta estructura de Progressive Disclosure (Revelación Progresiva):
- \`SKILL.md\` (Requerido): El núcleo. Frontmatter YAML (name, description) + Instrucciones en Markdown (SOPs). Máximo 500 líneas. Formato imperativo.
- \`/references/\` (Opcional): Documentos teóricos profundos, guías de estilo, metodologías.
- \`/scripts/\` (Opcional): Código ejecutable.
- \`/evals/\` (Opcional): Casos de prueba (\`evals.json\`) con "prompts" de testeo y "assertions" (SOCs).

### Flujo de Trabajo del Skill Creator
1. **Captura de Intención:** Define qué hace la skill y cuál es el formato de salida esperado.
2. **Descripciones Agresivas (Pushy):** La "description" del YAML es el trigger del RAG. Hazla agresiva. Ej: "Usa esta skill SIEMPRE que el usuario mencione dashboards, datos o gráficas, aunque no lo pida explícitamente".
3. **Escritura del SKILL.md:** Usa "Theory of Mind". Explica el *por qué* de las cosas en lugar de usar "MUST" dictatoriales. Sé conciso.
4. **Draft de Evals (Test Cases):** Diseña 2-3 prompts de prueba realistas ("evals.json"). Define aserciones objetivas verificables.
5. **Multi-Archivo:** Si hay teoría extensa o ejemplos de código muy largos, sácalos del SKILL.md y referéncialos explícitamente pidiendo que se guarden en \`/references/\`.` 
    },

    {
        id: 'prompt_global_genesi_ai', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@genesi_ai', roleTarget: '@genesi_ai',
        title: 'Alma de Gènesi AI (Ecosystem Architect)',
        keywords: ['System', 'Prompt', 'Genesi', 'Architect'],
        content: `Eres @genesi_ai, Master Ecosystem Architect de TeamTowers V9. 
Tu misión es diseñar arquitecturas VNA apoyándote en tu Skill de Diseño Estratégico (skill_vna_strategy). Eres un INFERIDOR ABSOLUTO. Si el usuario te da una visión en blanco, tú deduces el ecosistema entero desde los primeros principios. Generas roles únicos, no te limitas a plantillas aburridas.`
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V15', 
    dbVersion: 14, // 🔥 Subida de versión para el nuevo Genoma (Anthropic AgentSkills + VNA Libre)
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
            if (!exists || meme.id === 'skill_vna_strategy' || meme.id === 'skill_creator_master' || meme.id === 'prompt_global_genesi_ai') {
                await this.saveNode(meme); 
            }
        }

        if (!nodes.find(n => n.id === 'onto_blank_canvas_meta')) {
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Sector: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ 
                        id: `onto_${sectorKey}_${levelKey.replace('@','')}`, 
                        type: 'ontology', sector: sectorKey, roleTarget: levelKey, 
                        title: `Arquetipo: ${roleData.name}`, content: contentStr, 
                        core_skills: roleData.core_skills || [] 
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
                description: node.description || '',
                references: node.references || [], 
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
        let prompt = `=====================================\nIDENTIDAD (SYSTEM)\n=====================================\n${brain.systemPrompt}\n\n`;
        if (brain.references.length > 0) {
            prompt += `=====================================\nLIBRERÍA DE REFERENCIAS (W3C / VNA)\n=====================================\n`;
            brain.references.forEach(r => { prompt += `- [REF: ${r.title}]: ${r.content}\n`; });
            prompt += `\n`;
        }
        if (brain.skills.length > 0) {
            prompt += `=====================================\nCAPACIDADES (AGENT SKILLS)\n=====================================\n`;
            brain.skills.forEach(s => { prompt += `- [SKILL: ${s.title}]: ${s.content}\n`; });
            prompt += `\n`;
        }
        if (brain.ecosystemContext) {
            prompt += `=====================================\nCONTEXTO DEL ECOSISTEMA (TIEMPO REAL)\n=====================================\n`;
            prompt += `Proyecto: ${brain.ecosystemContext.name}\nVisión: ${brain.ecosystemContext.vision}\n`;
            if (brain.ecosystemContext.activeTasks.length > 0) {
                prompt += `ATENCIÓN: Tienes ${brain.ecosystemContext.activeTasks.length} Work Orders pendientes.\n`;
            }
        }
        return prompt;
    }
};
