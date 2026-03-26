// v9/js/core/seed.js
export const CoreSeed = {
    async inject(KB) {
        const check = await KB.getNode('skill_vna_architect');
        if (check) return; 

        console.log("🌱 [Antigravity Kernel] Inyectando Códice A2A (Alta Densidad Cognitiva)...");

        // 🔥 TEORÍA ULTRA-COMPRIMIDA (SOLO CARGADA SI SE REQUIERE)
        const coreRefs = [
            {
                id: 'ref_vna_core', type: 'reference', category: 'core.architecture', projectId: 'global', targetId: 'global',
                title: 'VNA Matrix Rules', keywords: ['#theory', '#vna'],
                content: `[VNA_AXIOMS]\n1. Nodos = Roles (Capital humano/IA).\n2. Enlaces = Txs (PULL). Nodo B pide a Nodo A.\n3. Tangible = Entregable (Código, Docs). Intangible = Status (Aprobación, Confianza).\n4. SlicingPie = Esfuerzo * FMV * Multiplicador_Riesgo.\n5. Cero Eras: Diseño estacionario y fractal.`
            },
            {
                id: 'ref_tdd_matrix', type: 'reference', category: 'core.economy', projectId: 'global', targetId: 'global',
                title: 'TDD Audit Protocol', keywords: ['#theory', '#audit'],
                content: `[TDD_AXIOMS]\n1. Carga de prueba: El ejecutor aporta evidencia.\n2. Inferencia Cero: Si no se ve, no existe (False).\n3. SOC Binario: 1 (Pasa) | 0 (Falla).\n4. Fallo = Bloqueo de Slices. Retorno al worker.`
            },
            {
                id: 'ref_antigravity_css', type: 'reference', category: 'core.execution', projectId: 'global', targetId: 'global',
                title: 'Antigravity UI/UX Specs', keywords: ['#theory', '#ui'],
                content: `[UI_AXIOMS]\n1. Frameworks=0 (No React, No Tailwind).\n2. DOM: Semántico HTML5.\n3. Layout: CSS Grid auto-fit.\n4. Paleta: var(--bg-dark), var(--bg-panel), var(--accent-blue/green/purple/orange/red).\n5. Glass: rgba(20,20,25,0.8), backdrop-filter:blur(15px), border:1px solid var(--glass-border).`
            }
        ];

        // 🔥 SKILLS EJECUTABLES (AGENT-TO-AGENT)
        const coreSkills = [
            // ==========================================
            // 🌌 CORE: ARCHITECTURE
            // ==========================================
            {
                id: 'skill_vna_architect', type: 'skill', category: 'core.architecture', projectId: 'global', targetId: 'global',
                title: 'Arquitecto VNA (Value Network Analysis)', description: 'Generador de Topologías JSON-LD.', keywords: ['#vna', '#genesis'], references: ['ref_vna_core'],
                content: `
[VNA_NODE]
IN: {vision, sector, archetype} -> OUT: {JSON_Topology} | METRIC: NodeDensity

[SOP]
1. Parse(vision). IF ambiguity > 20% -> YIELD {isReady: false, questions: [...]}. HALT.
2. MAP Roles: Assign {levelId, guardian, FMV, SlicingMultiplier}.
3. MAP Txs: Connect Roles (PULL logic). Define {template, horas, SOC_Array}.
4. RETURN JSON. Cero texto adicional.

[SOC]
- isJSON(output) === true
- nodes.length >= 3
- txs.every(hasSoc) === true
                `.trim()
            },
            
            // ==========================================
            // ⚖️ CORE: ECONOMY & LAW
            // ==========================================
            {
                id: 'skill_slicing_pie_notary', type: 'skill', category: 'core.economy', projectId: 'global', targetId: 'global',
                title: 'Notaría TDD (Slicing Pie)', description: 'Auditor binario de SOCs.', keywords: ['#tdd', '#audit'], references: ['ref_tdd_matrix'],
                content: `
[VNA_NODE]
IN: {ProofOfWork, SOC_Checklist} -> OUT: {JSON_Eval} | METRIC: Strictness

[SOP]
1. EVALUATE PoW AGAINST SOC_Checklist.
2. IF explicit_proof(SOC[n]) === false -> SOC[n] = false.
3. EMOTION = 0. INFERENCE = 0.
4. RETURN { "soc_id_1": boolean, "soc_id_2": boolean }.

[SOC]
- output.keys === input.soc_keys
- isDeterministic === true
                `.trim()
            },
            {
                id: 'skill_legal_drafting', type: 'skill', category: 'core.economy', projectId: 'global', targetId: 'global',
                title: 'Pacto de Socios (Smart Contract)', description: 'Redacta legal docs vía Cap Table.', keywords: ['#legal', '#dao'], references: [],
                content: `
[VNA_NODE]
IN: {CapTable, Roles} -> OUT: {Markdown_Contract} | METRIC: LegalSolidity

[SOP]
1. EXTRACT(Percentages) from CapTable.
2. DRAFT(GoodLeaver/BadLeaver_Clauses) tied to Ledger ID.
3. DRAFT(Governance) == Proportional_to_Slices.
4. RETURN Markdown.

[SOC]
- math.sum(percentages) === 100
- output.includes('Slicing Pie') === true
                `.trim()
            },
            {
                id: 'skill_vault_monetization', type: 'skill', category: 'core.economy', projectId: 'global', targetId: 'global',
                title: 'Bóvedas de Liquidez (Stripe/Web3)', description: 'Generador de JS para Checkouts y Splitters.', keywords: ['#monetization', '#web3'], references: [],
                content: `
[VNA_NODE]
IN: {ProjectId, ConfigEco} -> OUT: {JS_Vault_Module} | METRIC: Security

[SOP]
1. DEFINE class TreasuryVault.
2. METHOD payWithCrypto(): TRY eth_requestAccounts. SEND tx to SplitterContract. CATCH -> yield error.
3. METHOD payWithFiat(): FETCH /api/checkout WITH application_fee (Protocol Margin).
4. RETURN raw JS.

[SOC]
- js.includes('window.ethereum') === true
- secrets.hardcoded === false
                `.trim()
            },

            // ==========================================
            // 🧠 CORE: COGNITION & KNOWLEDGE
            // ==========================================
            {
                id: 'skill_ikigai_ontologist', type: 'skill', category: 'core.cognition', projectId: 'global', targetId: 'global',
                title: 'Matriz Ikigai', description: 'Perfilador de Nodos (Human/AI).', keywords: ['#ikigai', '#dharma'], references: [],
                content: `
[VNA_NODE]
IN: {SBT_History, Draft_Interests} -> OUT: {JSON_Ikigai, ActionPlan} | METRIC: Clarity

[SOP]
1. EXTRACT(Vocacion) FROM SBT_History (Horas minadas).
2. EXTRACT(Pasion) FROM Draft_Interests.
3. MAP(Mision/Profesion) TO Network_Needs.
4. RETURN JSON: {pasion, mision, profesion, vocacion, tags[]}.

[SOC]
- json.keys.includes('pasion') === true
- tags.length >= 3
                `.trim()
            },
            {
                id: 'skill_crafter_master', type: 'skill', category: 'core.cognition', projectId: 'global', targetId: 'global',
                title: 'Skill Forger (A2A Standard)', description: 'Empaquetador de conocimiento (AgentSkills).', keywords: ['#skills', '#dry'], references: ['ref_vna_core'],
                content: `
[VNA_NODE]
IN: {Raw_Concept} -> OUT: {JSON_Skill} | METRIC: CompressionRatio

[SOP]
1. EXTRACT(Theory) -> MOVE TO reference_docs[].
2. DRAFT(SOP) -> Imperative, A2A syntax, zero fluff.
3. DRAFT(SOC) -> Binary assertions.
4. RETURN {title, description, content(SOP+SOC), keywords, reference_docs}.

[SOC]
- output.content.includes('Theory') === false
- output.reference_docs.type === Array
                `.trim()
            },
            {
                id: 'skill_prompt_synthesizer', type: 'skill', category: 'core.cognition', projectId: 'global', targetId: 'global',
                title: 'Prompt Mutator', description: 'Inyecta tools en AGENT.md.', keywords: ['#prompting', '#mcp'], references: [],
                content: `
[VNA_NODE]
IN: {Current_AGENT.md, New_Tool_Docs} -> OUT: {Updated_AGENT.md} | METRIC: ContextPreservation

[SOP]
1. PARSE(Current_AGENT.md) -> Preserve Core Identity.
2. APPEND "## MCP Tools".
3. SYNTHESIZE(New_Tool_Docs) -> Add "WHEN to use" & "HOW to use" in 2 lines.
4. RETURN Raw Markdown.

[SOC]
- output.includes(Core_Identity) === true
- text.length < (input.length + 300)
                `.trim()
            },

            // ==========================================
            // ⚡ CORE: EXECUTION
            // ==========================================
            {
                id: 'skill_ui_component_forge', type: 'skill', category: 'core.execution', projectId: 'global', targetId: 'global',
                title: 'Antigravity UI/UX (Web Deployer)', description: 'Generador de WebComponents puros.', keywords: ['#ui', '#frontend'], references: ['ref_antigravity_css'],
                content: `
[VNA_NODE]
IN: {Specs, Branding} -> OUT: {JSON_Component} | METRIC: RenderSpeed

[SOP]
1. BUILD HTML5. CSS Grid auto-fit.
2. INJECT CSS variables (var(--bg-dark), etc).
3. APPLY Glassmorphism.
4. NO REACT. NO TAILWIND.
5. RETURN JSON: { "type": "web_component", "html": "...", "css": "...", "js": "..." }.

[SOC]
- output.css.includes('var(') === true
- output.html.includes('class=') === true
                `.trim()
            }
        ];

        // Inyección masiva iterativa
        for (const ref of coreRefs) await KB.saveNode(ref);
        for (const skill of coreSkills) await KB.saveNode(skill);
        
        console.log("🌳 [Antigravity Kernel] Códice A2A Universal inyectado y acoplado.");
    }
};
