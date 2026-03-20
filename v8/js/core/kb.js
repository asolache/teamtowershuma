// v8/js/core/kb.js
// Motor de Memoria Profunda (IndexedDB) y Auditoría Competencial Fractal (A2A)

// ============================================================================
// 1. GENOMA ONTOLÓGICO FRACTAL (VNA) - LOS 12 ARQUETIPOS DEL PANTEÓN
// ============================================================================
export const NATIVE_ONTOLOGY = {
    // 1. EL SABIO (Apol·lo) - Lógica y Datos
    "tech_saas_platform": {
        label: "🦉 SaaS & Data Platforms", meta: "Ecosistema orientado a la lógica, analítica de datos y escalabilidad de software B2B.",
        roles: {
            "@anxaneta": { name: "CEO / Visionario", multiplier: 3.0, fmv: 60, guardian: "sage", core_flows: ['flow_bmc_creation'] },
            "@aixecador": { name: "CPO / Product Lead", multiplier: 2.0, fmv: 50, guardian: "explorer", core_flows: ['flow_prd_definition'] },
            "@dosos": { name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45, guardian: "ruler", core_flows: ['flow_sys_arch'] },
            "@baixos": { name: "Desarrollador Fullstack", multiplier: 1.2, fmv: 40, guardian: "creator", core_flows: ['flow_tdd_implementation'] },
            "@pinya": { name: "Data/QA Support", multiplier: 1.0, fmv: 30, guardian: "everyman", core_flows: ['flow_e2e_testing'] }
        }
    },
    // 2. EL REBELDE (Hades/Eris) - Descentralización
    "web3_defi_protocol": {
        label: "🏴‍☠️ Web3 & Protocolos DAO", meta: "Ecosistema Trustless. Prioridad en auditoría on-chain, tokenomics y disrupción del status quo.",
        roles: {
            "@anxaneta": { name: "Protocol Architect", multiplier: 3.0, fmv: 70, guardian: "outlaw", core_flows: ['flow_tokenomics'] },
            "@aixecador": { name: "Governance Facilitator", multiplier: 2.0, fmv: 50, guardian: "sage", core_flows: ['flow_bip_creation'] },
            "@dosos": { name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65, guardian: "ruler", core_flows: ['flow_sc_audit'] },
            "@baixos": { name: "Solidity Engineer", multiplier: 1.2, fmv: 55, guardian: "creator", core_flows: ['flow_sc_dev'] },
            "@pinya": { name: "Node Operator", multiplier: 1.0, fmv: 35, guardian: "everyman", core_flows: ['flow_node_setup'] }
        }
    },
    // 3. EL CREADOR (Hefest) - Diseño y Agencias
    "creative_design_agency": {
        label: "🎨 Agencia Creativa & Diseño", meta: "Ecosistema enfocado en la estética, la innovación visual y la materialización de ideas.",
        roles: {
            "@anxaneta": { name: "Director Creativo", multiplier: 3.0, fmv: 65, guardian: "creator", core_flows: ['flow_creative_direction'] },
            "@aixecador": { name: "Art Director", multiplier: 2.0, fmv: 50, guardian: "magician", core_flows: ['flow_moodboard'] },
            "@dosos": { name: "Design Reviewer", multiplier: 1.5, fmv: 40, guardian: "sage", core_flows: ['flow_design_audit'] },
            "@baixos": { name: "UI/UX & Motion Designer", multiplier: 1.2, fmv: 35, guardian: "lover", core_flows: ['flow_asset_production'] },
            "@pinya": { name: "Copywriter / Asset Manager", multiplier: 1.0, fmv: 25, guardian: "everyman", core_flows: ['flow_copy_creation'] }
        }
    },
    // 4. EL CUIDADOR (Hestia) - Salud y ONGs
    "health_ngo_platform": {
        label: "❤️ HealthTech & Impacto Social", meta: "Ecosistema centrado en el cuidado humano, la sostenibilidad y el impacto social positivo.",
        roles: {
            "@anxaneta": { name: "Impact Director", multiplier: 3.0, fmv: 55, guardian: "caregiver", core_flows: ['flow_impact_strategy'] },
            "@aixecador": { name: "Program Manager", multiplier: 2.0, fmv: 45, guardian: "ruler", core_flows: ['flow_program_design'] },
            "@dosos": { name: "Ethics & Compliance", multiplier: 1.5, fmv: 50, guardian: "sage", core_flows: ['flow_ethics_audit'] },
            "@baixos": { name: "Health/Social Specialist", multiplier: 1.2, fmv: 35, guardian: "innocent", core_flows: ['flow_field_execution'] },
            "@pinya": { name: "Community Care", multiplier: 1.0, fmv: 25, guardian: "lover", core_flows: ['flow_support_care'] }
        }
    },
    // 5. EL GOBERNANTE (Zeus) - Finanzas y Corporativo
    "fintech_corp_erp": {
        label: "👑 FinTech & Corporate ERP", meta: "Ecosistema de alta jerarquía, control de riesgos, cumplimiento normativo y estabilidad financiera.",
        roles: {
            "@anxaneta": { name: "CEO / CFO", multiplier: 3.0, fmv: 80, guardian: "ruler", core_flows: ['flow_financial_strategy'] },
            "@aixecador": { name: "VP of Engineering", multiplier: 2.0, fmv: 65, guardian: "sage", core_flows: ['flow_architecture_corp'] },
            "@dosos": { name: "Risk & Compliance Auditor", multiplier: 1.5, fmv: 60, guardian: "hero", core_flows: ['flow_compliance_audit'] },
            "@baixos": { name: "Backend Core Dev", multiplier: 1.2, fmv: 50, guardian: "creator", core_flows: ['flow_core_dev'] },
            "@pinya": { name: "SysOps & Security", multiplier: 1.0, fmv: 40, guardian: "outlaw", core_flows: ['flow_sysops_maintenance'] }
        }
    },
    // 6. EL BUFÓN (Dionís) - Entretenimiento y Gaming
    "gaming_media_studio": {
        label: "🃏 Gaming Studio & Media", meta: "Ecosistema diseñado para el engagement, la diversión, la viralidad y el entretenimiento puro.",
        roles: {
            "@anxaneta": { name: "Game Director / Showrunner", multiplier: 3.0, fmv: 70, guardian: "jester", core_flows: ['flow_game_design'] },
            "@aixecador": { name: "Lead Producer", multiplier: 2.0, fmv: 55, guardian: "ruler", core_flows: ['flow_production_pipeline'] },
            "@dosos": { name: "Playtester Lead", multiplier: 1.5, fmv: 35, guardian: "explorer", core_flows: ['flow_qa_playtest'] },
            "@baixos": { name: "Unity/Unreal Dev & 3D", multiplier: 1.2, fmv: 45, guardian: "creator", core_flows: ['flow_asset_integration'] },
            "@pinya": { name: "Community Manager", multiplier: 1.0, fmv: 25, guardian: "lover", core_flows: ['flow_community_engagement'] }
        }
    },
    // 7. EL CIUDADANO (Demèter) - Retail y E-commerce
    "ecommerce_b2c_retail": {
        label: "🤝 E-commerce & Retail B2C", meta: "Ecosistema orientado a la accesibilidad, volumen de ventas, logística y satisfacción del usuario medio.",
        roles: {
            "@anxaneta": { name: "E-commerce Director", multiplier: 3.0, fmv: 55, guardian: "everyman", core_flows: ['flow_sales_strategy'] },
            "@aixecador": { name: "Supply Chain Manager", multiplier: 2.0, fmv: 45, guardian: "ruler", core_flows: ['flow_logistics_setup'] },
            "@dosos": { name: "CX Auditor", multiplier: 1.5, fmv: 35, guardian: "caregiver", core_flows: ['flow_cx_audit'] },
            "@baixos": { name: "Store Manager / Dev", multiplier: 1.2, fmv: 30, guardian: "creator", core_flows: ['flow_store_ops'] },
            "@pinya": { name: "Customer Support", multiplier: 1.0, fmv: 20, guardian: "innocent", core_flows: ['flow_ticket_resolution'] }
        }
    },
    // 8. EL AMANTE (Afrodita) - Branding y Estilo de Vida
    "branding_pr_lifestyle": {
        label: "🔥 Branding, PR & Lifestyle", meta: "Ecosistema centrado en la conexión emocional, relaciones públicas, estética y construcción de marca.",
        roles: {
            "@anxaneta": { name: "Chief Brand Officer", multiplier: 3.0, fmv: 65, guardian: "lover", core_flows: ['flow_brand_identity'] },
            "@aixecador": { name: "PR & Comms Lead", multiplier: 2.0, fmv: 50, guardian: "magician", core_flows: ['flow_pr_campaign'] },
            "@dosos": { name: "Brand Guardian", multiplier: 1.5, fmv: 40, guardian: "sage", core_flows: ['flow_brand_audit'] },
            "@baixos": { name: "Content Creator", multiplier: 1.2, fmv: 35, guardian: "creator", core_flows: ['flow_content_production'] },
            "@pinya": { name: "Social Media Exec", multiplier: 1.0, fmv: 25, guardian: "jester", core_flows: ['flow_social_publishing'] }
        }
    },
    // 9. EL HÉROE (Atenea/Ares) - Ciberseguridad y DevOps
    "cybersec_devops_infra": {
        label: "⚔️ Ciberseguridad & DevOps", meta: "Ecosistema de alta tensión, defensa perimetral, infraestructura crítica y resolución de crisis.",
        roles: {
            "@anxaneta": { name: "CISO / Head of Sec", multiplier: 3.0, fmv: 85, guardian: "hero", core_flows: ['flow_security_strategy'] },
            "@aixecador": { name: "Lead SecOps Engineer", multiplier: 2.0, fmv: 70, guardian: "ruler", core_flows: ['flow_secops_pipeline'] },
            "@dosos": { name: "Red Team / Pentester", multiplier: 1.5, fmv: 65, guardian: "outlaw", core_flows: ['flow_pentesting'] },
            "@baixos": { name: "DevOps & Blue Team", multiplier: 1.2, fmv: 55, guardian: "creator", core_flows: ['flow_infra_deployment'] },
            "@pinya": { name: "SOC Analyst L1", multiplier: 1.0, fmv: 35, guardian: "sage", core_flows: ['flow_log_monitoring'] }
        }
    },
    // 10. EL MAGO (Hermes) - DeepTech e Inteligencia Artificial
    "deeptech_ai_algorithms": {
        label: "✨ IA, DeepTech & Algoritmia", meta: "Ecosistema transformacional. Foco en investigación matemática, machine learning y modelos predictivos.",
        roles: {
            "@anxaneta": { name: "AI Chief Scientist", multiplier: 3.0, fmv: 90, guardian: "magician", core_flows: ['flow_model_architecture'] },
            "@aixecador": { name: "Lead Data Engineer", multiplier: 2.0, fmv: 70, guardian: "sage", core_flows: ['flow_data_pipeline'] },
            "@dosos": { name: "Ethics & QA Auditor", multiplier: 1.5, fmv: 60, guardian: "caregiver", core_flows: ['flow_bias_audit'] },
            "@baixos": { name: "ML Researcher", multiplier: 1.2, fmv: 55, guardian: "creator", core_flows: ['flow_model_training'] },
            "@pinya": { name: "MLOps Support", multiplier: 1.0, fmv: 40, guardian: "everyman", core_flows: ['flow_gpu_provisioning'] }
        }
    },
    // 11. EL INOCENTE (Perséfone) - EdTech y Educación
    "edtech_learning_platform": {
        label: "🕊️ EdTech & Educación", meta: "Ecosistema enfocado en el crecimiento personal, la transparencia, la accesibilidad y la pedagogía.",
        roles: {
            "@anxaneta": { name: "Chief Learning Officer", multiplier: 3.0, fmv: 50, guardian: "innocent", core_flows: ['flow_pedagogy_strategy'] },
            "@aixecador": { name: "Head of Curriculum", multiplier: 2.0, fmv: 40, guardian: "sage", core_flows: ['flow_curriculum_design'] },
            "@dosos": { name: "Academic Auditor", multiplier: 1.5, fmv: 35, guardian: "ruler", core_flows: ['flow_academic_review'] },
            "@baixos": { name: "Instructional Designer", multiplier: 1.2, fmv: 30, guardian: "creator", core_flows: ['flow_course_production'] },
            "@pinya": { name: "Student Success Rep", multiplier: 1.0, fmv: 20, guardian: "caregiver", core_flows: ['flow_student_support'] }
        }
    },
    // 12. EL EXPLORADOR (Posidó) - TravelTech y R&D Ventures
    "traveltech_rnd_ventures": {
        label: "🧭 TravelTech & R&D Ventures", meta: "Ecosistema diseñado para romper fronteras, logística global, viajes e innovación abierta.",
        roles: {
            "@anxaneta": { name: "Venture Lead / Explorer", multiplier: 3.0, fmv: 65, guardian: "explorer", core_flows: ['flow_market_discovery'] },
            "@aixecador": { name: "Operations Director", multiplier: 2.0, fmv: 55, guardian: "ruler", core_flows: ['flow_ops_deployment'] },
            "@dosos": { name: "Risk & Viability Assessor", multiplier: 1.5, fmv: 45, guardian: "sage", core_flows: ['flow_viability_audit'] },
            "@baixos": { name: "R&D Developer", multiplier: 1.2, fmv: 40, guardian: "creator", core_flows: ['flow_prototype_build'] },
            "@pinya": { name: "Field Researcher", multiplier: 1.0, fmv: 30, guardian: "hero", core_flows: ['flow_data_collection'] }
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
// 2. CATÁLOGO FRACTAL (Memes del Kernel y Almas A2A)
// ============================================================================
export const CATALOGO_MEMES = [
    { id: 'meme_os_vna', type: 'meme', category: 'core_os', title: 'OS: Value Network Analysis', content: `Un ecosistema es una red de creación de valor. Todo entregable (Output) viaja por tuberías y se audita mediante SOCs. Ninguna acción sin valor demostrable debe ser procesada.`, keywords: ['VNA', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_os_codex_casteller', type: 'meme', category: 'core_os', title: 'OS: Codex Casteller (Topología de Roles)', content: `MANDAMIENTO ESTRUCTURAL: Toda red VNA debe dividirse en 5 niveles de responsabilidad:
1. @anxaneta: Cúspide. Dirección, visión estratégica y máximo riesgo.
2. @aixecador: Táctica. Conecta la visión con la estructura.
3. @dosos: Auditoría y validación. Sostiene el peso del control de calidad.
4. @baixos: Producción core. El motor de ejecución tangible.
5. @pinya: Base comunitaria. Soporte e infraestructura.`, keywords: ['Estructura', 'Roles', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_os_slicing_pie', type: 'meme', category: 'core_os', title: 'OS: Slicing Pie (Ledger)', content: `Regla de Equidad: El capital se distribuye según el FMV multiplicado por un factor de riesgo. Solo las tareas validadas generan Slices.`, keywords: ['Ledger', 'Equity', '#kernel_sos'], broader: 'root_ecosystem_laws', related: [] },
    { id: 'meme_skill_lvl_baixos', type: 'meme', category: 'skill', title: 'Nivel: @baixos (Producción)', content: `Ejecución técnica pura, trabajo de campo, desarrollo de producto. Foco: Alta cadencia, Força pura.`, keywords: ['Producción'], broader: 'meme_os_codex_casteller', related: [] },
    { id: 'meme_skill_lvl_dosos', type: 'meme', category: 'skill', title: 'Nivel: @dosos (Auditoría)', content: `Control de calidad (QA), evaluación de riesgos, revisión por pares. Foco: Seny y Equilibrio.`, keywords: ['Auditoría'], broader: 'meme_os_codex_casteller', related: [] },
    { id: 'meme_soc_code_quality', type: 'meme', category: 'soc', title: 'SOC: Calidad W3C / Clean Code', content: `CRITERIOS ESTRICTOS: 1. Sin 'Magic Numbers'. 2. Funciones < 20 líneas. 3. Respetar DRY y SOLID. 4. Cero fallos de Linting.`, keywords: ['SOC', 'Clean Code'], broader: 'root_quality_assurance', related: [] },
    
    {
        id: 'prompt_global_genesi_ai', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@genesi_ai', roleTarget: '@genesi_ai',
        title: 'Alma de Gènesi AI (Ecosystem Architect)',
        keywords: ['System', 'Prompt', 'Genesi', 'Architect'],
        content: `Eres @genesi_ai, Master Ecosystem Architect de TeamTowers V15.5. 
Tu misión es diseñar arquitecturas VNA (Value Network Analysis) y debatir sobre la topología del ecosistema.
MANDAMIENTOS:
1. Analiza las tuberías de valor de forma crítica. Si ves una dependencia rota (un cuello de botella), señálalo.
2. Aboga siempre por la automatización: las tareas mecánicas deben recaer en la IA, las de estrategia humana en los niveles @anxaneta y @aixecador.
3. Sé conciso, técnico y directo. Utiliza metáforas arquitectónicas o cibernéticas. No uses saludos cordiales ni te despidas, ve al grano de la eficiencia del sistema.`
    },
    {
        id: 'prompt_global_notari_ledger', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@notari_ledger', roleTarget: '@notari_ledger',
        title: 'Alma del Notari Ledger (Auditor de Equidad)',
        keywords: ['System', 'Prompt', 'Notari', 'Ledger', 'Auditor'],
        content: `Eres @notari_ledger, el Juez Imparcial y Auditor del Slicing Pie en TeamTowers.
Tu misión es auditar la tabla de capitalización (Cap Table), calcular diluciones y velar por la equidad matemática del sistema.
MANDAMIENTOS:
1. La justicia es ciega y matemática. Mide el valor estrictamente por la fórmula: Horas × Fair Market Value (FMV) × Multiplicador de Riesgo.
2. Si un usuario te pregunta por asignaciones de Slices, cálcula el % de participación de forma exacta usando los datos del JSON de contexto.
3. Si un entregable no cumple los SOCs (Criterios de Auditoría), debes recomendar una MERMA (penalización) en el multiplicador.
4. Habla con tono solemne, legal, riguroso y numérico. Cita siempre cifras concretas del Ledger en tus respuestas.`
    },
    {
        id: 'prompt_global_cap_de_colla', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@cap_de_colla', roleTarget: '@cap_de_colla',
        title: 'Alma del Cap de Colla (Orquestador PULL)',
        keywords: ['System', 'Prompt', 'CapDeColla', 'Kanban', 'Manager'],
        content: `Eres @cap_de_colla, el Orquestador Maestro del Mercado PULL (Kanban) de TeamTowers.
Tu misión es asegurar que el "Castell" (el proyecto) se levanta a un ritmo constante, detectando cuellos de botella y alineando el talento.
MANDAMIENTOS:
1. Analiza las Work Orders (Oportunidades). Si hay muchas tareas atascadas en "En Progreso" o "Auditoría", da la alarma por falta de fluidez.
2. Recomienda qué perfiles (Sillas) deberían atacar qué tareas según el momento del sprint.
3. Fomenta el sistema PULL: los nodos no reciben órdenes, "toman" (pull) el trabajo que resuena con su Ikigai y sus Skills.
4. Tu tono es motivador pero firme, como el director de una orquesta de alto rendimiento. Usa lenguaje casteller (hacer pinya, cargar el castillo, seny y força).`
    },
    {
        id: 'prompt_global_mestre_escola', type: 'prompt_a2a', category: 'meta_prompt', targetId: '@mestre_escola', roleTarget: '@mestre_escola',
        title: 'Alma del Mestre d\'Escola (Guardián del LMS)',
        keywords: ['System', 'Prompt', 'Mestre', 'LMS', 'W3C'],
        content: `Eres @mestre_escola, el Bibliotecario Académico y Guardián del Knowledge Base de TeamTowers.
Tu misión es investigar, destilar conocimiento complejo y convertirlo en Memes interoperables (SOPs, SOCs, Skills) alineados con estándares W3C e ISO.
MANDAMIENTOS:
1. Cuando se te consulte sobre un concepto, no des respuestas vagas. Estructura tu respuesta en formatos claros (Pasos 1-2-3 para SOPs, Listas de verificación rigurosas para SOCs).
2. Usa lenguaje puramente académico, estructurado e instruccional.
3. Tu objetivo es que cualquier concepto que expliques pueda ser copiado, pegado y convertido directamente en una regla inmutable del sistema.`
    }
];

// ============================================================================
// 3. MOTOR DE INDEXACIÓN Y ALQUIMIA (IndexedDB)
// ============================================================================
export const KB = {
    dbName: 'TeamTowers_LMS_V15', 
    dbVersion: 7, // 🔥 Subimos a 7 para inyectar los 12 Genomas Maestros
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
        
        if (!nodes.find(n => n.id === 'meme_os_codex_casteller')) {
            for (const meme of CATALOGO_MEMES) { 
                if (!nodes.find(n => n.id === meme.id)) {
                    await this.saveNode(meme); 
                }
            }
        }

        // Sembrar Ontología (Genomas) si no existe la versión web3
        if (!nodes.find(n => n.id === 'onto_web3_defi_protocol_meta')) {
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
                if (filters.broader) nodes = nodes.filter(n => n.broader === filters.broader);
                
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
                    core_flows: roleData.core_flows || []
                };
            });
        });
        return sectors;
    },

    async getAgentBrainGraph(projectId, agentId, storeState) {
        await this.init();
        const allNodes = await this.getAllNodes();
        
        const kernelMemes = allNodes.filter(n => n.keywords && n.keywords.includes('#kernel_sos'));
        const agentPrompt = allNodes.find(n => n.type === 'prompt_a2a' && n.targetId === agentId);
        const agentMemes = allNodes.filter(n => n.type === 'meme' && n.keywords && n.keywords.includes(agentId));
        
        let projectContext = null;
        if (projectId && storeState) {
            const project = storeState.projects.find(p => p.id === projectId);
            if (project) {
                const agentTasks = (project.work_orders || []).filter(w => w.assigneeId === agentId && w.status !== 'consolidated');
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
