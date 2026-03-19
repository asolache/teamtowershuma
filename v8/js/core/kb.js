// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Auditoría Competencial Fractal (A2A)

// ============================================================================
// 1. GENOMA ONTOLÓGICO FRACTAL (VNA)
// ============================================================================
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
// 2. CATÁLOGO FRACTAL (Memes del Kernel)
// ============================================================================
export const CATALOGO_MEMES = [
    // --- CORE OS (Leyes Inmutables de la Matriz) ---
    { id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis', content: `Un ecosistema es una red de creación de valor. Todo entregable (Output) viaja por tuberías y se audita mediante SOCs. Ninguna acción sin valor demostrable debe ser procesada.`, keywords: ['VNA', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_os_codex_casteller', type: 'meme', category: 'core_os', title: 'OS: Codex Casteller (Topología de Roles)', content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles de responsabilidad:
1. @anxaneta: Cúspide. Dirección, visión estratégica y máximo riesgo.
2. @aixecador: Táctica. Conecta la visión con la estructura.
3. @dosos: Auditoría y validación. Sostiene el peso del control de calidad.
4. @baixos: Producción core. El motor de ejecución tangible.
5. @pinya: Base comunitaria. Soporte e infraestructura.`, keywords: ['Estructura', 'Roles', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_os_slicing_pie', type: 'meme', category: 'core_os', title: 'OS: Slicing Pie (Ledger)', content: `Regla de Equidad: El capital se distribuye según el Fair Market Value (FMV) multiplicado por un factor de riesgo. Solo las tareas que superan sus SOCs generan "Slices" en el Ledger inmutable.`, keywords: ['Ledger', 'Equity', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },

    // --- SKILLS Y GUARDIANES BASE ---
    { id: 'meme_skill_lvl_baixos', type: 'meme', category: 'skill', title: 'Nivel: @baixos (Producción)', content: `Ejecución técnica pura, trabajo de campo, desarrollo de producto. Foco: Alta cadencia, Força pura.`, keywords: ['Producción'], broader: 'meme_os_codex_casteller', related: [] },
    { id: 'meme_skill_lvl_dosos', type: 'meme', category: 'skill', title: 'Nivel: @dosos (Auditoría)', content: `Control de calidad (QA), evaluación de riesgos, revisión por pares. Foco: Seny y Equilibrio.`, keywords: ['Auditoría'], broader: 'meme_os_codex_casteller', related: [] },
    { id: 'meme_soc_code_quality', type: 'meme', category: 'soc', title: 'SOC: Calidad W3C / Clean Code', content: `CRITERIOS ESTRICTOS: 1. Sin 'Magic Numbers'. 2. Funciones < 20 líneas. 3. Respetar DRY y SOLID. 4. Cero fallos de Linting.`, keywords: ['SOC', 'Clean Code'], broader: 'root_quality_assurance', related: [] },

    // --- FLUJOS DE METODOLOGÍA (SOPs Nativos) ---
    {
        id: 'flow_tdd_implementation',
        type: 'methodology_flow',
        category: 'engineering',
        title: 'Flujo VNA: Test-Driven Development (TDD)',
        description: 'Implementación estricta de RED-GREEN-REFACTOR entre un productor y un auditor.',
        version: '1.0',
        transactions: [
            { id: 'tx_tdd_1', step: 1, from: '@baixos', to: '@baixos', tipo: 'tangible', entregable: 'Tests Unitarios (Failing)', sop: 'Escribir tests que definan el comportamiento esperado antes de escribir código.', socs: ['Tests fallan por razones correctas', 'Cobertura de Edge cases'] },
            { id: 'tx_tdd_2', step: 2, from: '@baixos', to: '@dosos', tipo: 'tangible', depends_on: ['tx_tdd_1'], entregable: 'Código de Producción + Refactor', sop: 'Escribir código mínimo para pasar el test y refactorizar.', socs: ['Todos los tests pasan (Green)', 'Complejidad ciclomática reducida'] },
            { id: 'tx_tdd_3', step: 3, from: '@dosos', to: '@baixos', tipo: 'intangible', depends_on: ['tx_tdd_2'], entregable: 'Code Review & Merge', sop: 'Auditar el PR asegurando Clean Code.', socs: ['Sin vulnerabilidades', 'Aprobado y Merged'] }
        ]
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
