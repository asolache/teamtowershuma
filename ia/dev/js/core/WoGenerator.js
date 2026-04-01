// =============================================================================
// TEAMTOWERS SOS V10.1 — WO GENERATOR
// Ruta: /ia/dev/js/core/WoGenerator.js
// Extrae Work Orders tangibles e intangibles de un VnaNetwork JSON-LD.
// V10.1: hereda sequence_order, depends_on y can_start_immediately del VNA secuenciado.
// Nuevos métodos: nextExecutable(), execution_layers en summary().
// Regla: Zero mutación directa de store. Solo devuelve arrays de WOs.
// =============================================================================

// ─── TIPOS DE AUTOMATION ─────────────────────────────────────────────────────
// full_auto   → WO se crea y asigna a agente IA sin confirmación humana
// review_first → WO se crea en estado 'pending_review', humano confirma
// human_only  → WO se crea sin asignar, requiere asignación manual

// ─── MAPA: categoría VNA → tipo de WO ────────────────────────────────────────
const TANGIBLE_CATEGORIES = new Set([
    'payment', 'deliverable', 'resource', 'service'
]);
const INTANGIBLE_CATEGORIES = new Set([
    'knowledge', 'trust', 'feedback', 'collaboration'
]);

// Categorías que puede ejecutar un agente IA sin supervisión humana
const AI_EXECUTABLE_CATEGORIES = new Set([
    'deliverable', 'service', 'knowledge', 'resource'
]);

// ─── AGENTES CORE DEL SWARM ───────────────────────────────────────────────────
const SWARM_AGENTS = {
    'deliverable':     '@agent_web_deployer',
    'service':         '@agent_skill_crafter',
    'knowledge':       '@agent_synaptic_weaver',
    'payment':         '@agent_token_economist',
    'feedback':        '@agent_prompt_synthesizer',
    'collaboration':   '@agent_genesis_architect',
    'resource':        '@agent_codex_developer',
    'trust':           '@bard_narrator'
};

// =============================================================================
//  WoGenerator — clase estática, zero instanciación necesaria
// =============================================================================
export class WoGenerator {

    // ──────────────────────────────────────────────────────────────────────────
    //  fromVnaNetwork
    //  Entrada:  VnaNetwork JSON-LD + configuración del proyecto
    //  Salida:   { workOrders: WO[], flows: VnaFlow[] }
    //
    //  WO Schema:
    //  {
    //    hash:        string  (wo_timestamp_random)
    //    flowId:      string  (exchange.id del VNA)
    //    status:      'theoretical' | 'pending_review'
    //    assigneeId:  string | null
    //    woType:      'tangible' | 'intangible' | 'hybrid'
    //    automation:  'auto' | 'hitl' | 'human'
    //    entregable:  string
    //    context:     string
    //    from:        string (node id)
    //    to:          string (node id)
    //    category:    string (VNA category)
    //    automatable: boolean
    //    estimatedHours: number
    //    sprintId:    null
    //    createdBy:   'node-claude-sonnet-v10'
    //    createdAt:   timestamp
    //  }
    // ──────────────────────────────────────────────────────────────────────────
    static fromVnaNetwork(network, projectSettings = {}) {
        if (!network?.exchanges?.length) {
            return { workOrders: [], flows: [] };
        }

        const automationLevel = projectSettings.automation_level || 'review_first';
        const workOrders      = [];
        const flows           = [];

        for (const exchange of network.exchanges) {
            const woType   = WoGenerator._classifyType(exchange);
            const autoMode = WoGenerator._classifyAutomation(exchange, automationLevel);
            const agentId  = WoGenerator._resolveAgent(exchange);
            const hours    = WoGenerator._estimateHours(exchange);
            const status   = autoMode === 'auto' ? 'theoretical' : 'pending_review';

            // Flow VNA legacy-compatible (para el Kanban renderer existente)
            const flow = {
                id:             exchange.id || `flow_${Date.now()}_${Math.random().toString(36).substr(2,4)}`,
                from:           exchange.from,
                to:             exchange.to,
                tipo:           exchange.type || 'tangible',
                entregable:     exchange.label || exchange.id,
                context:        WoGenerator._buildContext(exchange, network),
                horas:          hours,
                estimatedHours: hours,
                automatable:    exchange.automatable || false,
                category:       exchange.category    || 'deliverable',
                frequency:      exchange.frequency   || 'on-demand',
                soc_checklist:  WoGenerator._buildSocChecklist(exchange, woType)
            };
            flows.push(flow);

            // Work Order — V10.1: hereda sequence_order y depends_on del exchange secuenciado
            const exchangeDepIds = exchange.depends_on || [];
            const wo = {
                hash:                 `wo_${Date.now()}_${Math.random().toString(36).substr(2,6)}`,
                flowId:               flow.id,
                status,
                assigneeId:           (autoMode === 'auto' || autoMode === 'hitl') ? agentId : null,
                woType,
                automation:           autoMode,
                entregable:           exchange.label || exchange.id,
                context:              flow.context,
                from:                 exchange.from,
                to:                   exchange.to,
                category:             exchange.category || 'deliverable',
                automatable:          exchange.automatable || false,
                estimatedHours:       hours,
                sequence_order:       exchange.sequence_order ?? null,
                depends_on:           exchangeDepIds,     // IDs de exchange; se resuelven a hashes WO post-build
                can_start_immediately: exchangeDepIds.length === 0,
                soc_checklist:        WoGenerator._buildSocChecklist(exchange, woType),
                sprintId:             null,
                createdBy:            'node-claude-sonnet-v10',
                createdAt:            Date.now()
            };
            workOrders.push(wo);
        }

        // ── Resolver depends_on: convertir exchange IDs → WO hashes ────────────
        // Construir mapa: flowId (= exchange.id) → wo.hash
        const flowToHash = {};
        workOrders.forEach(wo => { flowToHash[wo.flowId] = wo.hash; });

        // Actualizar depends_on de cada WO con los hashes reales
        workOrders.forEach(wo => {
            wo.depends_on = (wo.depends_on || [])
                .map(depExchangeId => {
                    // El flowId de la WO dependiente = el exchange.id dependiente
                    return flowToHash[depExchangeId] || depExchangeId;
                })
                .filter(Boolean);
        });

        // ── Recalcular can_start_immediately post-resolución ─────────────────
        // Tras convertir exchange IDs → hashes reales, eliminar auto-dependencias
        // y recalcular can_start_immediately de forma consistente.
        workOrders.forEach(wo => {
            wo.depends_on = wo.depends_on.filter(h => h !== wo.hash);
            wo.can_start_immediately = wo.depends_on.length === 0;
        });

        // ── Ordenar: primero por sequence_order V10.1, luego por automation ──
        const hasSequence = workOrders.some(wo => wo.sequence_order !== null);
        if (hasSequence) {
            workOrders.sort((a, b) => {
                const sa = a.sequence_order ?? 9999;
                const sb = b.sequence_order ?? 9999;
                if (sa !== sb) return sa - sb;
                // Desempate por automation
                const order = { auto: 0, hitl: 1, human: 2 };
                return (order[a.automation] ?? 2) - (order[b.automation] ?? 2);
            });
        } else {
            // Fallback V10 original: automation order
            workOrders.sort((a, b) => {
                const order = { auto: 0, hitl: 1, human: 2 };
                return (order[a.automation] ?? 2) - (order[b.automation] ?? 2);
            });
        }

        return { workOrders, flows };
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  _classifyType — tangible | intangible | hybrid
    // ──────────────────────────────────────────────────────────────────────────
    static _classifyType(exchange) {
        const type     = exchange.type     || 'tangible';
        const category = exchange.category || 'deliverable';

        if (type === 'tangible'   && TANGIBLE_CATEGORIES.has(category))   return 'tangible';
        if (type === 'intangible' && INTANGIBLE_CATEGORIES.has(category)) return 'intangible';
        return 'hybrid';
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  _classifyAutomation — auto | hitl | human
    //  Tiene en cuenta tanto el exchange como el nivel del proyecto
    // ──────────────────────────────────────────────────────────────────────────
    static _classifyAutomation(exchange, automationLevel) {
        const category = exchange.category || 'deliverable';
        // Payment siempre requiere supervisión humana independientemente del nivel
        if (category === 'payment') return 'human';
        const canAuto  = exchange.automatable && AI_EXECUTABLE_CATEGORIES.has(category);

        if (automationLevel === 'full_auto') {
            return canAuto ? 'auto' : 'hitl';
        }
        if (automationLevel === 'review_first') {
            return canAuto ? 'hitl' : 'human';
        }
        // human_only → siempre human
        return 'human';
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  _resolveAgent — asigna agente del Swarm según categoría
    // ──────────────────────────────────────────────────────────────────────────
    static _resolveAgent(exchange) {
        const category = exchange.category || 'deliverable';
        return SWARM_AGENTS[category] || '@agent_codex_developer';
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  _estimateHours — heurística según tipo y frecuencia
    // ──────────────────────────────────────────────────────────────────────────
    static _estimateHours(exchange) {
        const category  = exchange.category  || 'deliverable';
        const frequency = exchange.frequency || 'on-demand';
        const type      = exchange.type      || 'tangible';

        const base = {
            payment:       0.5,
            deliverable:   4.0,
            resource:      2.0,
            service:       3.0,
            knowledge:     2.0,
            trust:         1.0,
            feedback:      1.5,
            collaboration: 2.0
        }[category] ?? 2.0;

        const freqMult = frequency === 'once' ? 1.5 : frequency === 'recurring' ? 1.0 : 1.2;
        const typeMult = type === 'intangible' ? 1.3 : 1.0;

        return Math.round(base * freqMult * typeMult * 10) / 10;
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  _buildContext — genera descripción contextual de la WO
    // ──────────────────────────────────────────────────────────────────────────
    static _buildContext(exchange, network) {
        const fromNode = network.nodes?.find(n => n.id === exchange.from);
        const toNode   = network.nodes?.find(n => n.id === exchange.to);
        const fromLabel = fromNode?.label || exchange.from;
        const toLabel   = toNode?.label   || exchange.to;

        const triggerText = exchange.trigger
            ? `Trigger: ${exchange.trigger}.`
            : '';
        const freqText = exchange.frequency
            ? `Frecuencia: ${exchange.frequency}.`
            : '';
        const autoText = exchange.automatable
            ? 'Automatizable.'
            : 'Requiere intervención humana.';

        return `${fromLabel} → ${toLabel}: ${exchange.label || exchange.id}. ${triggerText} ${freqText} ${autoText}`.trim();
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  _buildSocChecklist — genera SOCs mínimos según tipo de WO
    // ──────────────────────────────────────────────────────────────────────────
    static _buildSocChecklist(exchange, woType) {
        const base = [
            { id: `soc_def_${Date.now()}`,    label: 'Entregable definido con criterios claros',   isChecked: false },
            { id: `soc_recep_${Date.now()}`,  label: 'Receptor confirmado y disponible',            isChecked: false }
        ];

        if (woType === 'tangible' || woType === 'hybrid') {
            base.push({ id: `soc_proof_${Date.now()}`,  label: 'Proof of Work documentado',          isChecked: false });
            base.push({ id: `soc_audit_${Date.now()}`,  label: 'Auditado por PO o @agent_tdd_auditor', isChecked: false });
        }

        if (woType === 'intangible') {
            base.push({ id: `soc_cap_${Date.now()}`,    label: 'Conocimiento capturado en KB',        isChecked: false });
            base.push({ id: `soc_impact_${Date.now()}`, label: 'Impacto medido en la red',            isChecked: false });
        }

        if (exchange.automatable) {
            base.push({ id: `soc_exec_${Date.now()}`,   label: 'Ejecución IA verificada sin errores', isChecked: false });
        }

        return base;
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  nextExecutable — V10.1
    //  Dado el array de WOs y los hashes de WOs ya completadas,
    //  devuelve las WOs cuyas depends_on están todas satisfechas.
    //  El Orquestador llama esto en cada ronda para saber qué ejecutar.
    // ──────────────────────────────────────────────────────────────────────────
    static nextExecutable(workOrders, completedHashes = []) {
        const completed = new Set(completedHashes);
        const active    = workOrders.filter(wo =>
            wo.status !== 'consolidated' && wo.status !== 'reported'
        );

        // Candidatas normales: WOs cuyas depends_on están todas en completedHashes
        const candidates = active.filter(wo => {
            const deps = wo.depends_on || [];
            return deps.every(depHash => completed.has(depHash));
        });

        if (candidates.length > 0) {
            return candidates.sort((a, b) => (a.sequence_order ?? 9999) - (b.sequence_order ?? 9999));
        }

        // Fallback para redes con ciclos funcionales VNA: ninguna WO activa tiene
        // todas sus dependencias completadas. Devolver la capa 1 (sequence_order mínimo)
        // como ejecutables de arranque. Se devuelven con can_start_immediately=true
        // porque en la práctica son las que inician el ciclo.
        if (active.length > 0) {
            const minSeq = Math.min(...active.map(w => w.sequence_order ?? 9999));
            return active
                .filter(w => (w.sequence_order ?? 9999) === minSeq)
                .map(w => ({ ...w, can_start_immediately: true }))
                .sort((a, b) => (a.sequence_order ?? 9999) - (b.sequence_order ?? 9999));
        }

        return [];
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  summary — resumen estadístico del resultado (V10.1: + execution_layers)
    // ──────────────────────────────────────────────────────────────────────────
    static summary(workOrders) {
        const auto   = workOrders.filter(w => w.automation === 'auto').length;
        const hitl   = workOrders.filter(w => w.automation === 'hitl').length;
        const human  = workOrders.filter(w => w.automation === 'human').length;
        const tang   = workOrders.filter(w => w.woType === 'tangible').length;
        const intang = workOrders.filter(w => w.woType === 'intangible').length;
        const hybrid = workOrders.filter(w => w.woType === 'hybrid').length;
        const totalH = workOrders.reduce((s, w) => s + (w.estimatedHours || 0), 0);

        // ── execution_layers: agrupar WOs por ronda de ejecución paralela ────
        // Simula nextExecutable() iterativamente para calcular las capas
        const execution_layers = [];
        const completed = new Set();
        const pending   = [...workOrders];

        let safetyCounter = 0;
        while (pending.length > 0 && safetyCounter < 100) {
            safetyCounter++;
            const layer = pending.filter(wo => {
                const deps = wo.depends_on || [];
                return deps.every(d => completed.has(d));
            });
            if (layer.length === 0) {
                // Dependencias no resolubles (ciclos residuales) — añadir resto como última capa
                execution_layers.push(pending.map(w => w.hash));
                break;
            }
            execution_layers.push(layer.map(w => w.hash));
            layer.forEach(w => {
                completed.add(w.hash);
                const idx = pending.indexOf(w);
                if (idx > -1) pending.splice(idx, 1);
            });
        }

        return {
            total: workOrders.length,
            auto, hitl, human,
            tang, intang, hybrid,
            totalHours:      Math.round(totalH * 10) / 10,
            execution_layers,
            parallel_rounds: execution_layers.length,
            immediate_count: workOrders.filter(w => w.can_start_immediately).length
        };
    }
}
