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

export const CATALOGO_MEMES = [
    { 
        id: 'ref_os_codex', type: 'reference', category: 'reference', title: 'Codex Casteller (Roles)', 
        description: 'Estructura jerárquica de 5 niveles para la responsabilidad de red.',
        content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles: @anxaneta (Dirección), @aixecador (Táctica), @dosos (Auditoría), @baixos (Producción), @pinya (Soporte).`, 
        keywords: ['Estructura', 'Roles', '#kernel_sos'] 
    },
    
    {
        id: 'ref_vna_methodology', type: 'reference', category: 'reference', title: 'Metodología VNA (Verna Allee)',
        description: 'Fundamentos, elementos y principios de Value Network Analysis (VNA).',
        keywords: ['VNA', 'Metodología', 'Verna Allee', '#kernel_sos'],
        content: `## 1. Fundamentos conceptuales
Value Network Analysis (VNA) modela organizaciones y ecosistemas como redes vivas de intercambio de valor. El valor real —visible e invisible— fluye entre actores a través de intercambios tangibles e intangibles.

## 2. Elementos del modelo VNA
### 2.1 Roles / Actores (Nodos)
Cualquier entidad que participa activamente. Se define por lo que aporta y recibe.
### 2.2 Intercambios Tangibles
Tienen forma física, financiera o contractual (Pago, Producto, Documento formal, Dato estructurado).
### 2.3 Intercambios Intangibles
La economía invisible de la red. Conocimiento tácito, Confianza, Beneficio estratégico, Motivación, Feedback, Innovación.
Regla de oro: Por cada intercambio tangible, busca el intangible que lo precede o lo sigue.

### 2.4 Metaskill de la Red
El propósito compartido que da coherencia a todos los flujos (Misión, Visión, Objetivos estratégicos).

## 3. Principios de análisis VNA
- Principio de reciprocidad: Todo intercambio saludable es bidireccional.
- Principio de flujo emergente: Los intangibles generan valor emergente.
- Principio de roles faltantes: Un flujo roto indica un rol faltante.
- Principio de multiplicadores intangibles: Los intangibles apalancan los tangibles.

## 6. VNA en TeamTowers
Cada rol tiene asociado un POOL DE SKILLS. Los Memes son unidades de conocimiento compartido. Los intercambios intangibles activan memes en la red neuronal.`
    },

    {
        id: 'ref_vna_examples', type: 'reference', category: 'reference', title: 'Ejemplos Mapas de Valor Sectoriales',
        description: 'Patrones de flujos frecuentes y roles faltantes típicos por ecosistema.',
        keywords: ['VNA', 'Patrones', 'Ejemplos', '#kernel_sos'],
        content: `Ejemplos de ecosistemas modelados con VNA:

1. Ecosistema de Innovación / Startup:
- Roles: Emprendedor, Inversor, Aceleradora, Cliente temprano, Mentor.
- Flujos: Inversor a Emprendedor (Tangible: Capital) | Emprendedor a Inversor (Intangible: Visión, tracción).
- Desequilibrio típico: Cliente temprano no involucrado como co-creador.

2. Red de Valor Interna (Organización / Empresa):
- Roles: Producto, Ventas, Ingeniería, Liderazgo, Cliente.
- Flujos: Ventas a Producto (Intangible: Señal de mercado) | Producto a Ingeniería (Intangible: Criterios de éxito).
- Flujo frecuentemente roto: Ingeniería a Producto (limitaciones técnicas).

Patrones transversales en todos los sectores:
1. El cliente como nodo infrautilizado (solo recibe tangibles, no se modelan sus intangibles como feedback).
2. El conocimiento tácito como flujo invisible.
3. La legitimidad como lubricante de flujos (sin ella los tangibles no fluyen).`
    },

    // 🔥 NUEVA REFERENCIA: KERNEL INMORTAL (TDD & EVALS)
    {
        id: 'ref_immortal_tdd', type: 'reference', category: 'reference', title: 'El Kernel Inmortal (TDD & Evals)',
        description: 'Metodología estricta para forjar SOCs (Standard Operating Conditions) inmutables.',
        keywords: ['TDD', 'Evals', 'SOC', 'Calidad', '#kernel_sos'],
        content: `## El Principio de Inmortalidad
Un sistema solo es inmortal si es auditable. En TeamTowers, la auditoría se logra mediante Evals estrictos (SOCs - Standard Operating Conditions). Toda acción (SOP) carece de valor si no tiene un SOC que demuestre su ejecución.

## Reglas para Forjar Evals (SOCs) Perfectos
1. **Verificabilidad Objetiva:** Un SOC nunca puede ser subjetivo ("Que el diseño sea bonito"). Debe ser binario y demostrable ("El diseño utiliza los 3 colores hexadecimales de la guía de marca").
2. **Atomicidad:** Cada aserción debe evaluar una sola cosa. Si falla, el Agente debe saber exactamente qué línea o concepto corregir.
3. **Independencia del Ejecutor:** Un SOC debe poder ser evaluado por un agente externo ciego (@notari_ledger) que solo disponga del Output final y de las instrucciones de la aserción.

## Integración con AgentSkills
Cuando se forja una nueva Skill, el apartado de SOC debe listar aserciones claras que sirvan como 'Test Cases' automatizados. Si el output pasa las aserciones, la red muta y avanza; si falla, se rechaza y protege al Kernel de la entropía.`
    },

    { 
        id: 'skill_vna_strategy', type: 'skill', category: 'skill', title: 'Skill: Value Map Prompt Generator (VNA)', 
        description: 'Genera mapas de valor completos y precisos según la metodología Verna Allee.',
        references: ['ref_vna_methodology', 'ref_vna_examples', 'ref_os_codex', 'ref_immortal_tdd'],
        keywords: ['Estrategia', 'VNA', '@genesi_ai', 'Mapas de Valor'],
        content: `Esta skill guía la construcción de topologías para el agente creador de mapas de valor.

PROCESO DE CONSTRUCCIÓN (MANDAMIENTOS):
1. Anclaje a METASKILL: Entiende la Misión, Visión y Objetivos. Si no están claros, haz preguntas de clarificación (Bucle Mayéutico).
2. Identificación de ROLES/ACTORES: Lista todos los actores internos y externos.
3. Mapeo de FLUJOS TANGIBLES E INTANGIBLES: Para cada par de roles, define qué fluye física/económicamente (T) y qué fluye como conocimiento/confianza (I).
4. Verificación de RECIPROCIDAD: Valida que cada intercambio tenga sentido respecto a la Metaskill.
5. INTEGRACIÓN CON SISTEMA DE SKILLS (Para TeamTowers): Para cada rol, define el POOL DE SKILLS y qué MEMES son relevantes.
6. FORMATO DE SALIDA (TDD RIGUROSO): El mapa debe traducirse a un JSON estricto con la matriz "soc_checklist" (Criterios de validación objetivos basados en ref_immortal_tdd) para cada transacción.` 
    },
    
    {
        id: 'prompt_global_genesi_ai', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@genesi_ai', roleTarget: '@genesi_ai',
        title: 'Alma de Gènesi AI (Ecosystem Architect)',
        keywords: ['System', 'Prompt', 'Genesi', 'Architect'],
        content: `Eres @genesi_ai, Master Ecosystem Architect de TeamTowers V9. 
Tu misión es diseñar arquitecturas VNA apoyándote en tu Skill de Diseño Estratégico (skill_vna_strategy) y sus referencias (Verna Allee). Eres riguroso, holístico, y no assumes información que no tienes. Siempre equilibras los flujos tangibles con los intangibles.`
    },

    // 🔥 META-SKILL: EL FORJADOR DE SKILLS
    { 
        id: 'skill_creator_master', type: 'skill', category: 'skill', title: 'Skill Creator (Meta-Skill)', 
        description: 'Instrucciones para crear, iterar y evaluar nuevas Skills en el ecosistema. Úsala cuando necesites empaquetar un flujo de trabajo.',
        references: ['ref_os_vna', 'ref_immortal_tdd'],
        keywords: ['Meta', 'Skill Creator', 'AgentSkills', 'TDD'],
        content: `### 1. VNA Flow (Flujo de Valor)
- **Inputs Requeridos:** Concepto crudo del usuario, ejemplos de outputs deseados (Tangible), Entendimiento del objetivo (Intangible).
- **Outputs Generados:** Archivo Skill.md estructurado (Tangible), Documentos de referencia separados (Tangible), TDD Assertions para el evaluador (Intangible).

### 2. SOP (Standard Operating Procedure)
1. **Captura de Intención:** Pregunta al usuario qué debe hacer la skill, cuándo debe activarse y qué formato de salida espera.
2. **Entrevista y Casos Límite:** Identifica si la skill es determinista (código/datos) o subjetiva (redacción). Define Edge Cases.
3. **Drafting (Revelación Progresiva):** - Redacta el "Description" de forma agresiva para asegurar que el Orquestador la active (Ej: "Usa esta skill SIEMPRE que el usuario mencione X").
   - Extrae toda la teoría pesada a la carpeta \`/references\`.
4. **Iteración:** Ejecuta casos de prueba (Test Cases) y pide feedback al usuario antes de sellar la skill.

### 3. SOC (Standard Operating Conditions / Evals)
- [ ] La "Description" explica claramente cuándo debe dispararse la skill.
- [ ] Las instrucciones usan voz imperativa y evitan bucles teóricos.
- [ ] El nodo declara explícitamente sus dependencias o referencias requeridas.
- [ ] La skill incluye un modelo de evaluación objetiva (Evals) medible por un agente externo ciego (@notari_ledger).` 
    }
];

export const KB = {
    dbName: 'TeamTowers_LMS_V15', 
    dbVersion: 13, // 🔥 Forzamos la actualización para inyectar la referencia del Kernel Inmortal
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
        
        // Forzar actualización de los Memes Maestros de VNA, Meta-Skill y TDD Immortal
        for (const meme of CATALOGO_MEMES) { 
            const exists = nodes.find(n => n.id === meme.id);
            if (!exists || meme.id === 'skill_vna_strategy' || meme.id === 'ref_vna_methodology' || meme.id === 'ref_vna_examples' || meme.id === 'prompt_global_genesi_ai' || meme.id === 'skill_creator_master' || meme.id === 'ref_immortal_tdd') {
                await this.saveNode(meme); 
            }
        }

        if (!nodes.find(n => n.id === 'onto_web3_defi_protocol_meta')) {
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
