// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Auditoría Competencial Fractal (A2A)

// ============================================================================
// 1. GENOMA ONTOLÓGICO FRACTAL (VNA)
// ============================================================================
export const CATALOGO_MEMES = [
    // --- CORE OS (Leyes Inmutables de la Matriz) ---
    { id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis', content: `Un ecosistema es una red de creación de valor. Todo entregable viaja por tuberías y se audita mediante SOCs.`, keywords: ['VNA', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_os_codex_casteller', type: 'meme', category: 'core_os', title: 'OS: Codex Casteller (Topología de Roles)', content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles de responsabilidad:
1. @anxaneta: Cúspide. Dirección, visión estratégica y máximo riesgo.
2. @aixecador: Táctica. Conecta la visión con la estructura.
3. @dosos: Auditoría y validación. Sostiene el peso del control de calidad.
4. @baixos: Producción core. El motor de ejecución tangible.
5. @pinya: Base comunitaria. Soporte e infraestructura.`, keywords: ['Estructura', 'Roles', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_os_slicing_pie', type: 'meme', category: 'core_os', title: 'OS: Slicing Pie (Ledger)', content: `Regla de Equidad: El capital se distribuye según el FMV multiplicado por un factor de riesgo. Solo las tareas validadas generan Slices.`, keywords: ['Ledger', 'Equity', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },

    // --- SKILLS Y GUARDIANES BASE ---
    { id: 'meme_skill_lvl_baixos', type: 'meme', category: 'skill', title: 'Nivel: @baixos (Producción)', content: `Ejecución técnica pura, trabajo de campo, desarrollo de producto. Foco: Alta cadencia, Força pura.`, keywords: ['Producción'], broader: 'meme_os_codex_casteller', related: [] },
    { id: 'meme_skill_lvl_dosos', type: 'meme', category: 'skill', title: 'Nivel: @dosos (Auditoría)', content: `Control de calidad (QA), evaluación de riesgos, revisión por pares. Foco: Seny y Equilibrio.`, keywords: ['Auditoría'], broader: 'meme_os_codex_casteller', related: [] },
    { id: 'meme_soc_code_quality', type: 'meme', category: 'soc', title: 'SOC: Calidad W3C / Clean Code', content: `CRITERIOS ESTRICTOS: 1. Sin 'Magic Numbers'. 2. Funciones < 20 líneas. 3. Respetar DRY y SOLID.`, keywords: ['SOC', 'Clean Code'], broader: 'root_quality_assurance', related: [] },

    // --- META-PROMPT DE GÈNESI (ACTUALIZADO CUALITATIVO) ---
    {
        id: 'prompt_global_genesi_ai',
        type: 'prompt_a2a',
        category: 'meta_prompt',
        targetId: '@genesi_ai',
        roleTarget: '@genesi_ai',
        title: 'Alma de Gènesi AI (Ecosystem Architect)',
        content: `Eres @genesi_ai, Master Ecosystem Architect de TeamTowers V15.5. Diseña una arquitectura VNA devolviendo EXCLUSIVAMENTE un objeto JSON estricto. Cero charla. Cero markdown.

MANDAMIENTOS DE ARQUITECTURA (CUALITATIVA):
1. Flujo de Valor: Modela las tuberías estrictamente necesarias para materializar la visión. Prioriza la calidad y el sentido común.
2. Roles Aumentados (Era IA): Diseña los roles asumiendo que las tareas mecánicas, repetitivas y de recolección de datos las hace la Inteligencia Artificial. Los humanos deben asumir la estrategia, la creatividad y la auditoría (Seny).
3. Secuencia Lógica (DAG): Usa las 5 ERAS (Kickoff, Growth, Scale, Harvest, Cierre). Las tareas de Growth en adelante DEBEN tener "depends_on" apuntando a IDs de transacciones anteriores.
4. Auditoría SOC: Cada transacción DEBE tener SOCs (Criterios de Éxito) estrictos y medibles. ¿Cómo audita @notari_ledger que este SOP se ha cumplido?

ESTRUCTURA JSON EXACTA REQUERIDA:
{
  "presentacion": "El manifiesto del proyecto...",
  "tags": ["Tech", "Blockchain"],
  "new_memes": [
    { "id": "meme_skill_x", "category": "skill", "title": "Nombre Skill", "content": "..." }
  ],
  "roles": [
    { "levelId": "@anxaneta", "name": "CEO / Estratega", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "..." }
  ],
  "transactions": [
    { 
      "id": "tx_1", "phase": "Kickoff", "step_order": 1, "depends_on": [],
      "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "intangible", 
      "template": "...", "horas": 5,
      "required_skills": ["meme_skill_x"],
      "soc_checklist": [{ "text": "..." }, { "text": "..." }]
    }
  ]
}
REGLA DE ORO: Respeta los "levelIds" del Codex Casteller (@anxaneta, @aixecador, @dosos, @baixos, @pinya).`,
        keywords: ['System', 'Prompt', 'Genesi', 'Architect']
    }
];

// ============================================================================
// 3. MOTOR DE INDEXACIÓN Y ALQUIMIA (IndexedDB)
// ============================================================================
export const KB = {
    dbName: 'TeamTowers_LMS_V15', 
    dbVersion: 5, // 🔥 Upgrade para re-seed de arquitectura V15.5
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
        
        // Inyectar el Core si no existe
        if (!nodes.find(n => n.id === 'meme_os_codex_casteller')) {
            for (const meme of CATALOGO_MEMES) { 
                if (!nodes.find(n => n.id === meme.id)) {
                    await this.saveNode(meme); 
                }
            }
        }

        // Inyectar la Ontología Nativa si está vacía
        if (nodes.filter(n => n.type === 'ontology').length === 0) {
            for (const [sectorKey, sectorData] of Object.entries(NATIVE_ONTOLOGY)) {
                await this.saveNode({ id: `onto_${sectorKey}_meta`, type: 'ontology', sector: sectorKey, sectorLabel: sectorData.label, roleTarget: 'Global', title: `Sector: ${sectorData.label}`, content: sectorData.meta });
                for (const [levelKey, roleData] of Object.entries(sectorData.roles)) {
                    const contentStr = `Rol: ${roleData.name} (${levelKey}). Guardian requerido: ${roleData.guardian}. FMV Base: €${roleData.fmv}/h.`;
                    await this.saveNode({ 
                        id: `onto_${sectorKey}_${levelKey.replace('@','')}`, 
                        type: 'ontology', sector: sectorKey, roleTarget: levelKey, 
                        title: `Arquetipo: ${roleData.name}`, content: contentStr, 
                        core_flows: roleData.core_flows 
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
                type: node.type || 'custom'
            };
            
            // Si keywords es un string, lo convertimos en Array para indexarlo bien
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
                
                // Filtrado en memoria
                if (filters.projectId) nodes = nodes.filter(n => n.projectId === filters.projectId || n.projectId === 'global');
                if (filters.type) nodes = nodes.filter(n => n.type === filters.type);
                if (filters.targetId) nodes = nodes.filter(n => n.targetId === filters.targetId || n.targetId === 'global');
                if (filters.broader) nodes = nodes.filter(n => n.broader === filters.broader);
                
                resolve(nodes);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    // ============================================================================
    // 4. NEXUS COGNITIVO A2A (Extracción de Memoria para el LLM)
    // ============================================================================
    
    // El Nexus escanea el Ecosistema y devuelve SOLO lo que el agente necesita saber HOY.
    async getAgentBrainGraph(projectId, agentId, storeState) {
        await this.init();
        const allNodes = await this.getAllNodes();
        
        // 1. Memoria Universal (Kernel SOS)
        const kernelMemes = allNodes.filter(n => n.keywords && n.keywords.includes('#kernel_sos'));
        
        // 2. Identidad Core del Agente
        const agentPrompt = allNodes.find(n => n.type === 'prompt_a2a' && n.targetId === agentId);
        const agentMemes = allNodes.filter(n => n.type === 'meme' && n.keywords && n.keywords.includes(agentId));
        
        // 3. Memoria Situacional (El Ecosistema actual)
        let projectContext = null;
        if (projectId && storeState) {
            const project = storeState.projects.find(p => p.id === projectId);
            if (project) {
                // Filtramos las tareas (Work Orders) asignadas a este agente en este proyecto
                const agentTasks = (project.work_orders || []).filter(w => w.assigneeId === agentId && w.status !== 'consolidated');
                
                // Filtramos los roles que existen en este mapa
                const projectRoles = project.roles || [];
                
                projectContext = {
                    name: project.nombre,
                    vision: project.vision || 'No definida.',
                    roles: projectRoles,
                    activeTasks: agentTasks,
                    flows: project.vna_flows || []
                };
            }
        }

        return {
            agentId: agentId,
            systemPrompt: agentPrompt ? agentPrompt.content : `Eres ${agentId}, un agente de IA operando en TeamTowers.`,
            kernelMemes: kernelMemes,
            agentMemes: agentMemes,
            ecosystemContext: projectContext
        };
    },

    // Esta función ensambla el Prompt Dinámico que se enviará al proveedor de IA (OpenAI/Anthropic/DeepSeek)
    async getDynamicContextPrompt(projectId, agentId, storeState) {
        const brain = await this.getAgentBrainGraph(projectId, agentId, storeState);
        
        let prompt = `=====================================\n`;
        prompt += `IDENTIDAD (SYSTEM)\n`;
        prompt += `=====================================\n`;
        prompt += `${brain.systemPrompt}\n\n`;

        prompt += `=====================================\n`;
        prompt += `REGLAS UNIVERSALES (KERNEL VNA)\n`;
        prompt += `=====================================\n`;
        brain.kernelMemes.forEach(m => {
            prompt += `- [${m.title}]: ${m.content}\n`;
        });
        prompt += `\n`;

        if (brain.agentMemes.length > 0) {
            prompt += `=====================================\n`;
            prompt += `MEMORIA HEREDADA (MEMES ASIGNADOS)\n`;
            prompt += `=====================================\n`;
            brain.agentMemes.forEach(m => {
                prompt += `- [${m.category}] ${m.title}: ${m.content}\n`;
            });
            prompt += `\n`;
        }

        if (brain.ecosystemContext) {
            prompt += `=====================================\n`;
            prompt += `CONTEXTO DEL ECOSISTEMA (TIEMPO REAL)\n`;
            prompt += `=====================================\n`;
            prompt += `Estás operando en el proyecto: ${brain.ecosystemContext.name}\n`;
            prompt += `Visión: ${brain.ecosystemContext.vision}\n`;
            
            if (brain.ecosystemContext.roles.length > 0) {
                prompt += `Roles existentes en el mapa: ${brain.ecosystemContext.roles.map(r => r.name).join(', ')}.\n`;
            }
            
            if (brain.ecosystemContext.activeTasks.length > 0) {
                prompt += `ATENCIÓN: Tienes ${brain.ecosystemContext.activeTasks.length} Work Orders pendientes de ejecutar o auditar.\n`;
            }
        }

        return prompt;
    }
};
