// v9/js/core/seed.js
export const CoreSeed = {
    async inject(KB) {
        const check = await KB.getNode('skill_vna_architect');
        if (check) return; 

        console.log("🌱 [Antigravity Kernel] Inyectando Códice A2A y Cerebros Base...");

        const coreRefs = [
            { id: 'ref_vna_core', type: 'reference', category: 'core.architecture', projectId: 'global', targetId: 'global', title: 'VNA Matrix Rules', keywords: ['#theory', '#vna'], content: `[VNA_AXIOMS]\n1. Nodos = Roles.\n2. Enlaces = Txs (PULL).\n3. SlicingPie = Esfuerzo * FMV * Multiplicador_Riesgo.` },
            { id: 'ref_tdd_matrix', type: 'reference', category: 'core.economy', projectId: 'global', targetId: 'global', title: 'TDD Audit Protocol', keywords: ['#theory', '#audit'], content: `[TDD_AXIOMS]\n1. Carga de prueba: El ejecutor aporta evidencia.\n2. Inferencia Cero.\n3. SOC Binario: 1 | 0.` },
            { id: 'ref_antigravity_css', type: 'reference', category: 'core.execution', projectId: 'global', targetId: 'global', title: 'Antigravity UI/UX', keywords: ['#theory', '#ui'], content: `[UI_AXIOMS]\n1. Frameworks=0.\n2. DOM: Semántico HTML5.\n3. Layout: CSS Grid auto-fit.\n4. Variables del Kernel obligatorias.` }
        ];

        const coreSkills = [
            { id: 'skill_vna_architect', type: 'skill', category: 'core.architecture', projectId: 'global', targetId: 'global', title: 'Arquitecto VNA', description: 'Generador de Topologías JSON-LD.', keywords: ['#vna', '#genesis'], references: ['ref_vna_core'], content: `[VNA_NODE]\nIN: {vision, sector, archetype} -> OUT: {JSON_Topology}\n[SOP]\n1. Parse(vision). Exige contexto si hay ambigüedad.\n2. MAP Roles y Txs PULL.\n3. RETURN JSON.` },
            { id: 'skill_slicing_pie_notary', type: 'skill', category: 'core.economy', projectId: 'global', targetId: 'global', title: 'Notaría TDD', description: 'Auditor binario de SOCs.', keywords: ['#tdd', '#audit'], references: ['ref_tdd_matrix'], content: `[VNA_NODE]\nIN: {ProofOfWork, SOC_Checklist} -> OUT: {JSON_Eval}\n[SOP]\n1. EVALUATE PoW AGAINST SOC_Checklist.\n2. RETURN { "soc_id_1": boolean } sin alucinaciones.` },
            { id: 'skill_legal_drafting', type: 'skill', category: 'core.economy', projectId: 'global', targetId: 'global', title: 'Pacto de Socios', description: 'Redacta legal docs vía Cap Table.', keywords: ['#legal', '#dao'], references: [], content: `[VNA_NODE]\nIN: {CapTable, Roles} -> OUT: {Markdown_Contract}\n[SOP]\n1. EXTRACT(Percentages).\n2. DRAFT(GoodLeaver/BadLeaver).\n3. RETURN Markdown.` },
            { id: 'skill_vault_monetization', type: 'skill', category: 'core.economy', projectId: 'global', targetId: 'global', title: 'Bóvedas de Liquidez', description: 'JS para Checkouts y Splitters.', keywords: ['#monetization', '#web3'], references: [], content: `[VNA_NODE]\nIN: {ProjectId, ConfigEco} -> OUT: {JS_Vault_Module}\n[SOP]\n1. METHOD payWithCrypto(): eth_requestAccounts -> SplitterContract.\n2. METHOD payWithFiat(): /api/checkout con application_fee.\n3. RETURN raw JS.` },
            { id: 'skill_ikigai_ontologist', type: 'skill', category: 'core.cognition', projectId: 'global', targetId: 'global', title: 'Matriz Ikigai', description: 'Perfilador de Nodos (Human/AI).', keywords: ['#ikigai', '#dharma'], references: [], content: `[VNA_NODE]\nIN: {SBT_History, Draft_Interests} -> OUT: {JSON_Ikigai}\n[SOP]\n1. Analiza horas minadas y pasiones.\n2. RETURN JSON: {pasion, mision, profesion, vocacion, tags[]}.` },
            { id: 'skill_crafter_master', type: 'skill', category: 'core.cognition', projectId: 'global', targetId: 'global', title: 'Skill Forger', description: 'Empaquetador de conocimiento.', keywords: ['#skills', '#dry'], references: ['ref_vna_core'], content: `[VNA_NODE]\nIN: {Raw_Concept} -> OUT: {JSON_Skill}\n[SOP]\n1. DRAFT(SOP) -> Imperative, A2A syntax.\n2. DRAFT(SOC) -> Binary assertions.\n3. RETURN {title, description, content(SOP+SOC), keywords, reference_docs}.` },
            { id: 'skill_prompt_synthesizer', type: 'skill', category: 'core.cognition', projectId: 'global', targetId: 'global', title: 'Prompt Mutator', description: 'Inyecta tools en AGENT.md.', keywords: ['#prompting', '#mcp'], references: [], content: `[VNA_NODE]\nIN: {Current_AGENT.md, New_Tool_Docs} -> OUT: {Updated_AGENT.md}\n[SOP]\n1. APPEND "## MCP Tools".\n2. SYNTHESIZE(New_Tool_Docs) -> Add WHEN to use & HOW to use.\n3. RETURN Raw Markdown.` },
            { id: 'skill_ui_component_forge', type: 'skill', category: 'core.execution', projectId: 'global', targetId: 'global', title: 'Antigravity UI/UX', description: 'Generador de WebComponents puros.', keywords: ['#ui', '#frontend'], references: ['ref_antigravity_css'], content: `[VNA_NODE]\nIN: {Specs, Branding} -> OUT: {JSON_Component}\n[SOP]\n1. BUILD HTML5 + CSS Grid. Cero Frameworks.\n2. INJECT CSS variables nativas.\n3. RETURN JSON: { "type": "web_component", "html": "...", "css": "...", "js": "..." }.` }
        ];

        // 🔥 CEREBROS BASE DE LOS AGENTES (AGENT.md)
        const corePrompts = [
            { id: 'prompt_global_agent_genesis_architect', type: 'prompt_a2a', category: 'meta_prompt', projectId: 'global', targetId: '@agent_genesis_architect', roleTarget: '@agent_genesis_architect', title: 'AGENT.md: Genesis Architect', content: 'Eres el Master Ecosystem Architect. Tu misión es aplicar Value Network Analysis (VNA) para diseñar topologías de red descentralizadas. Odias la ambigüedad y exiges precisión.', dependencies: ['skill_vna_architect'], keywords: ['ai_agent', '@agent_genesis_architect'] },
            { id: 'prompt_global_agent_tdd_auditor', type: 'prompt_a2a', category: 'meta_prompt', projectId: 'global', targetId: '@agent_tdd_auditor', roleTarget: '@agent_tdd_auditor', title: 'AGENT.md: TDD Auditor', content: 'Eres el Juez Inmutable del Slicing Pie. No asumes nada. Si la evidencia no demuestra el SOC explícitamente, rechazas el trabajo. Eres binario y estricto.', dependencies: ['skill_slicing_pie_notary', 'skill_legal_drafting'], keywords: ['ai_agent', '@agent_tdd_auditor'] },
            { id: 'prompt_global_agent_web_deployer', type: 'prompt_a2a', category: 'meta_prompt', projectId: 'global', targetId: '@agent_web_deployer', roleTarget: '@agent_web_deployer', title: 'AGENT.md: Web Deployer', content: 'Eres el creador de interfaces Antigravity. Tu misión es traducir diseños en componentes HTML5/CSS3/JS puros, respondiendo en el formato JSON exigido para el Sandbox.', dependencies: ['skill_ui_component_forge'], keywords: ['ai_agent', '@agent_web_deployer'] },
            { id: 'prompt_global_agent_codex_developer', type: 'prompt_a2a', category: 'meta_prompt', projectId: 'global', targetId: '@agent_codex_developer', roleTarget: '@agent_codex_developer', title: 'AGENT.md: Codex Developer', content: 'Eres el forjador de lógica de negocio y monetización. Trabajas exclusivamente con Vanilla JS y conectas interfaces con Smart Contracts o pasarelas Fiat.', dependencies: ['skill_vault_monetization'], keywords: ['ai_agent', '@agent_codex_developer'] }
        ];

        for (const ref of coreRefs) await KB.saveNode(ref);
        for (const skill of coreSkills) await KB.saveNode(skill);
        for (const prompt of corePrompts) await KB.saveNode(prompt); // Inyectar las almas
        
        console.log("🌳 [Antigravity Kernel] Cerebros de los Guardianes inyectados en la red neuronal.");
    }
};
