// =============================================================================
// TEAMTOWERS SOS V10.1 — QUEEN SWARM
// Ruta: ia/dev/js/core/QueenSwarm.js
// Arquitectura Colmena Castellera · 5 niveles · TDD inverso · 4 APIs paralelas
// La Reina genera VNAs con evals primero, luego roles, luego entregables
// =============================================================================

import { KB }          from './kb.js';
import { store }       from './store.js';
import { Orchestrator } from './Orchestrator.js';
import { EvalEngine }  from './EvalEngine.js';

// ── Skills del Kernel (SKILL.md de cada nivel) ───────────────────────────────

const QUEEN_SKILLS = {

    // ── NIVEL 0: La Reina (Cap de Colla · Master Architect) ──────
    reina: {
        id:       'skill_reina_cap_de_colla',
        type:     'skill',
        category: 'core.architecture',
        title:    'La Reina · Cap de Colla · Master Architect',
        description: 'Orquestadora suprema del enjambre SOS. Define el ecosistema macro, crea castells ad-hoc y garantiza la coherencia del flujo de valor completo.',
        content: `# SKILL: La Reina · Cap de Colla

## MISIÓN
Definir, coordinar y garantizar la calidad de TODOS los flujos de valor del ecosistema SOS.
Cada petición que llega se convierte en una Work Order que la Reina enruta al nivel casteller correcto.

## ARQUITECTURA DE DECISIÓN
1. ¿La petición requiere visión estratégica? → Cap de Canalla (Anxaneta/Aixecador)
2. ¿Requiere diseño táctico de flujos? → Cap de Troncs (Dosos)
3. ¿Requiere configuración de workers? → Cap de Pinya
4. ¿Es ejecución unitaria? → Worker directo
5. ¿Requiere validación del kernel? → Guardianes

## PROTOCOLO TDD INVERSO PARA VNA
Al crear cualquier VNA, siempre en este orden:
1. EVALS PRIMERO: ¿Qué debe demostrar cada entregable?
2. ROLES: ¿Quién puede pasar esos evals?
3. TRANSACCIONES: ¿Qué flujos conectan los roles?
4. CONFLICTOS: ¿Hay dependencias circulares o solapamientos?
5. LANDING: ¿Cómo se vende este flujo de valor?

## SOCs DE LA REINA
- [ ] Cada WO generada tiene al menos 2 SOCs verificables
- [ ] Cada castle tiene roles con transacciones definidas
- [ ] El VNA tiene coherencia entre niveles castellers
- [ ] Los evals están ordenados de nivel 0 (pinya) a nivel 4 (anxaneta)
- [ ] El tiempo de generación completa < 5 minutos`,
        keywords: ['reina', 'cap_de_colla', 'master_architect', 'orquestadora', 'kernel']
    },

    // ── NIVEL 1: Cap de Canalla (Anxaneta + Aixecador · Visión) ──
    canalla: {
        id:       'skill_cap_de_canalla',
        type:     'skill',
        category: 'core.architecture',
        title:    'Cap de Canalla · Visión Estratégica · Anxaneta/Aixecador',
        description: 'Define proyectos con visión estratégica. Crea mapas de valor, objetivos medibles y modelo de negocio. Está arriba — ve el horizonte completo.',
        content: `# SKILL: Cap de Canalla · Visión Estratégica

## MISIÓN
Definir el QUÉ y el PARA QUÉ de cada proyecto. Traducir visión en VNA accionable.
El Cap de Canalla está en la cúspide del castell porque ve más lejos.

## RESPONSABILIDADES
- Definir misión, visión y objetivos medibles del proyecto
- Crear el mapa de valor inicial (VNA) con roles y flujos
- Definir el modelo de negocio y pricing basado en slices
- Identificar los flujos de valor más críticos (los que generan ingresos)
- Generar la landing page como síntesis del flujo de valor

## METODOLOGÍAS DE REFERENCIA
- Value Network Analysis (Verna Allee) para modelar flujos
- Slicing Pie para el modelo de equidad
- Jobs To Be Done para definir propuesta de valor
- OKRs para objetivos medibles

## SOCs DEL CAP DE CANALLA
- [ ] El VNA tiene al menos un flujo que genera ingreso directo
- [ ] Los objetivos son SMART (específicos, medibles, alcanzables, relevantes, temporales)
- [ ] El modelo de negocio tiene pricing definido en horas × FMV × multiplicador
- [ ] La landing page responde: ¿Qué? ¿Para quién? ¿Cuánto? ¿Cómo empezar?
- [ ] Hay un flujo crítico identificado como "primer ingreso"`,
        keywords: ['canalla', 'vision', 'estrategia', 'anxaneta', 'aixecador', 'vna', 'modelo_negocio']
    },

    // ── NIVEL 2: Cap de Troncs (Dosos · Táctica y Flujos) ────────
    troncs: {
        id:       'skill_cap_de_troncs',
        type:     'skill',
        category: 'core.execution',
        title:    'Cap de Troncs · Gestión Táctica · Dosos',
        description: 'Experto táctico. Gestiona el VNA en detalle, diseña Work Orders para los workers, y mantiene el Kanban automatizado. Define SOCs concretos para cada entregable.',
        content: `# SKILL: Cap de Troncs · Gestión Táctica

## MISIÓN
Traducir la visión estratégica en Work Orders ejecutables.
Gestionar el Kanban automáticamente. Garantizar que cada WO tiene SOCs claros y verificables.

## RESPONSABILIDADES
- Descomponer flujos VNA en Work Orders unitarias (tamaño ≤ 4096 tokens output)
- Asignar cada WO al nivel casteller correcto (worker, pinya, dosos)
- Definir SOCs concretos y verificables para cada entregable
- Detectar dependencias entre WOs y ordenarlas (paralelas vs secuenciales)
- Auditar calidad de entregables contra SOCs definidos
- Gestionar el Kanban: theoretical → pinged → reported → consolidated

## PROTOCOLO DE DISEÑO DE WO
1. Identificar el entregable concreto (sustantivo + criterio de calidad)
2. Estimar horas de ejecución (honesto, no optimista)
3. Definir 2-3 SOCs verificables por cualquier auditor
4. Identificar dependencias: ¿qué WOs deben completarse antes?
5. Asignar nivel de automatización: auto / review_first / human_only

## SOCs DEL CAP DE TRONCS
- [ ] Cada WO tiene entregable definido con formato de output obligatorio
- [ ] Los SOCs son verificables sin ambigüedad por un tercero
- [ ] Las dependencias entre WOs están mapeadas y sin ciclos
- [ ] El Kanban refleja el estado real del flujo de valor
- [ ] El tiempo estimado × FMV × multiplicador ≥ coste IA de generación`,
        keywords: ['troncs', 'tactica', 'dosos', 'work_orders', 'kanban', 'socs', 'entregables']
    },

    // ── NIVEL 3: Cap de Pinya (Configurador de Workers) ──────────
    pinya: {
        id:       'skill_cap_de_pinya',
        type:     'skill',
        category: 'core.execution',
        title:    'Cap de Pinya · Configurador de Workers · Antigravity',
        description: 'Configura el AGENT.md de cada worker con las skills exactas para su WO. Optimiza tokens al máximo. La pinya sostiene todo — si falla aquí, cae el castell.',
        content: `# SKILL: Cap de Pinya · Configurador de Workers

## MISIÓN
Para cada Work Order, generar el AGENT.md más eficiente posible.
Mínimo contexto, máxima calidad. Antigravity puro.

## PRINCIPIO ANTIGRAVITY DE TOKENS
El AGENT.md de un worker debe contener SOLO:
1. Misión en 1 frase (≤ 15 palabras)
2. Skills en versión Antigravity (referencias a KB, no texto completo)
3. SOCs del entregable (2-3 máximo, verificables)
4. Formato de output obligatorio (JSON schema o plantilla)
5. URL canónica para contexto completo si se requiere

## PROTOCOLO DE CONFIGURACIÓN
Para cada WO recibida del Cap de Troncs:
1. Identificar las skills necesarias (mínimas, no todas las disponibles)
2. Compilar versión Antigravity de cada skill (SkillAntigravity.getOrCompile)
3. Construir AGENT.md con estructura mínima
4. Verificar que el contexto total ≤ 2048 tokens
5. Asignar al worker correcto según disponibilidad

## GESTIÓN DE PARALELISMO
- WOs independientes: ejecutar en paralelo (hasta 4 APIs simultáneas)
- WOs con dependencias: ejecutar en secuencia
- WOs críticas: siempre review_first independientemente del nivel

## SOCs DEL CAP DE PINYA
- [ ] El AGENT.md generado tiene ≤ 2048 tokens de contexto
- [ ] Las skills están en versión Antigravity (no texto completo)
- [ ] El worker puede ejecutar la WO sin contexto adicional
- [ ] El formato de output es JSON schema verificable
- [ ] El coste estimado de la WO está dentro del presupuesto del proyecto`,
        keywords: ['pinya', 'configurador', 'workers', 'antigravity', 'tokens', 'agent_md', 'paralelismo']
    },

    // ── GUARDIANES DEL KERNEL ─────────────────────────────────────
    guardian_codex: {
        id:       'skill_guardian_codex_sos',
        type:     'skill',
        category: 'core.culture',
        title:    'Guardián del Codex SOS',
        description: 'Garantiza que todos los agentes y entregables siguen el Codex SOS V10. Auditor de calidad transversal del enjambre.',
        content: `# SKILL: Guardián del Codex SOS

## MISIÓN
Garantizar la integridad arquitectónica de todo el enjambre.
Ningún agente puede entregar un artefacto que viole el Codex SOS.

## REGLAS ABSOLUTAS A VERIFICAR
- Zero localStorage directo (siempre via KB.js)
- Estado Redux inmutable (nunca mutación directa de store.state)
- Slices siempre .toFixed(3)
- KB.saveNode() siempre requiere {id}
- Eventos con prefijo sos:
- JSON-LD @context: teamtowers.io/sos/v10/vna
- Imports solo via Orchestrator.callLLM()

## SOCs DEL GUARDIÁN
- [ ] El artefacto no muta el estado directamente
- [ ] Todos los KB operations son async/await
- [ ] Los eventos usan prefijo sos:
- [ ] No hay hardcode de colores (siempre CSS variables)
- [ ] El código pasa el TestsView sin KERNEL PANIC`,
        keywords: ['guardian', 'codex', 'calidad', 'auditoria', 'tdd', 'kernel']
    },

    guardian_vna: {
        id:       'skill_guardian_vna_slicing',
        type:     'skill',
        category: 'core.economy',
        title:    'Guardián VNA & Slicing Pie',
        description: 'Garantiza la coherencia de los mapas de valor y la correcta aplicación del modelo Slicing Pie en todos los proyectos.',
        content: `# SKILL: Guardián VNA & Slicing Pie

## MISIÓN
Garantizar que todos los flujos de valor son coherentes y que la economía del proyecto
es justa, transparente y auditable.

## RESPONSABILIDADES VNA
- Verificar que cada rol tiene al menos una transacción entrante y saliente
- Detectar roles aislados (sin flujo de valor)
- Validar que los exchanges tienen SOCs verificables
- Garantizar coherencia entre niveles castellers

## RESPONSABILIDADES SLICING PIE
- Verificar precisión decimal .toFixed(3) en todos los slices
- Auditar que cada WO completada genera slices correctamente
- Detectar desequilibrios en el cap table (un solo actor > 80%)
- Registrar inyecciones de capital con multiplicador x4.0 FIAT

## SOCs DEL GUARDIÁN
- [ ] Ningún rol en el VNA tiene 0 transacciones
- [ ] Los slices están calculados con precisión .toFixed(3)
- [ ] El cap table no tiene concentración > 80% en un actor
- [ ] Cada WO consolidada tiene entrada en el ledger`,
        keywords: ['guardian', 'vna', 'slicing_pie', 'economia', 'auditoria', 'flujos']
    }
};

// ── Protocolo VNA con TDD inverso ─────────────────────────────────────────────

export class QueenSwarm {

    // ── seedKernel — siembra las skills del enjambre en KB ────────
    static async seedKernel() {
        await KB.init();
        let seeded = 0;
        for (const skill of Object.values(QUEEN_SKILLS)) {
            const existing = await KB.getNode(skill.id);
            if (!existing) {
                await KB.saveNode({ ...skill, projectId: 'global', createdAt: Date.now() });
                seeded++;
            }
        }
        console.log(`[QueenSwarm] 🌱 ${seeded} skills del kernel sembradas.`);
        return seeded;
    }

    // ══════════════════════════════════════════════════════════════
    //  generateVnaWithTDD — El protocolo completo de la Reina
    //  TDD inverso: Evals → Roles → Transacciones → Conflictos → Landing
    //  Paralelismo de hasta 4 APIs simultáneas en el paso 2
    // ══════════════════════════════════════════════════════════════
    static async generateVnaWithTDD({ projectId, mission, vision, sector, onProgress }) {

        const log = (msg) => {
            console.log(`[QueenSwarm] ${msg}`);
            onProgress?.(msg);
        };

        // ── PASO 1: La Reina genera los EVALS primero (1 API) ────
        log('🌀 PASO 1/5 · La Reina define los SOCs/Evals del ecosistema…');

        const evalsResponse = await Orchestrator.callLLM({
            preferredEngine: 'anthropic',
            systemPrompt: `Eres la Reina del enjambre SOS · Cap de Colla · Master Architect.
Aplica el protocolo TDD inverso: EVALS PRIMERO.
Antes de definir roles o transacciones, define qué debe demostrar cada flujo de valor.

REGLAS DE DENSIDAD MÍNIMA (obligatorias):
- Genera MÍNIMO 3 evals por nivel casteller que exista en este ecosistema
- Cubre TODOS los niveles relevantes: pinya(0), baixos(1), dosos(2), aixecador(3), anxaneta(4)
- Incluye siempre al menos 2 evals intangibles (conocimiento, feedback, confianza)
- Total de evals: MÍNIMO 8, MÁXIMO 20

Para cada eval devuelve:
- id: identificador único
- criteria: qué debe demostrar el entregable (verificable sin ambigüedad)
- level: nivel casteller (0=pinya, 1=baixos, 2=dosos, 3=aixecador, 4=anxaneta)
- tipo: "tangible" | "intangible"
- soc: criterio de aceptación en una frase

Devuelve SOLO JSON:
{
  "evals": [
    { "id": "eval_1", "criteria": "...", "level": 0, "tipo": "tangible", "soc": "..." }
  ],
  "ecosystem_name": "...",
  "core_value": "propuesta de valor en 1 frase"
}`,
            userPrompt: `MISIÓN: ${mission}\nVISIÓN: ${vision}\nSECTOR: ${sector}`,
            responseFormat: 'json_object',
            temperature: 0.3
        });

        const { evals: evalsDraft, ecosystem_name, core_value } = evalsResponse.content;
        log(`✅ ${evalsDraft.length} evals generados. Valor central: "${core_value}"`);

        // ── PASO 2: Roles por nivel — paralelo si hay capacidad, secuencial si no ──
        log('🌀 PASO 2/5 · Cap de Canalla despliega roles por nivel…');

        const levelGroups = [
            { levels: [0, 1], label: '@pinya + @baixos',  name: 'workers'     },
            { levels: [2],    label: '@dosos',             name: 'troncs'      },
            { levels: [3],    label: '@aixecador',         name: 'canalla_low' },
            { levels: [4],    label: '@anxaneta',          name: 'canalla_top' }
        ];

        const levelEvals = levelGroups.map(g => ({
            ...g,
            evals: evalsDraft.filter(e => g.levels.includes(e.level))
        })).filter(g => g.evals.length > 0); // solo grupos con evals

        // Detectar providers disponibles para decidir paralelismo
        const availableProviders = await Orchestrator._getAvailableProviders?.().catch(() => ['anthropic']) || ['anthropic'];
        const canParallelize     = availableProviders.length >= 2;

        if (!canParallelize) {
            log(`ℹ️  Solo 1 provider disponible — ejecutando en secuencia (más lento pero seguro)`);
        } else {
            log(`⚡ ${availableProviders.length} providers — ejecutando en paralelo`);
        }

        const buildRolePrompt = async (group) => {
            if (!group.evals.length) return { group: group.name, roles: [], transactions: [] };
            const evalsCtx = group.evals.map(e =>
                `[Nivel ${e.level}] ${e.criteria} (${e.tipo}) · SOC: ${e.soc}`
            ).join('\n');
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres el Cap de Canalla del enjambre SOS.
Para los evals dados, define los roles que pueden pasarlos y las transacciones que generan los entregables.
Niveles: @pinya(0)=workers, @baixos(1)=operativos, @dosos(2)=tácticos, @aixecador(3)=estratégicos, @anxaneta(4)=visión.

REGLAS DE DENSIDAD MÍNIMA (obligatorias, sin excepción):
- Cada rol debe tener MÍNIMO 1 transacción saliente Y 1 transacción entrante
- Genera MÍNIMO 2 transacciones por rol definido
- Ningún rol puede quedar aislado (sin flujos de valor)
- Incluye siempre al menos 1 transacción intangible (feedback, conocimiento, confianza)
- Cada transacción DEBE tener soc_checklist con al menos 2 criterios verificables
- Los SOCs deben ser concretos y verificables (no genéricos)
- Los roles deben tener description descriptiva de su función real en el ecosistema
- fmv realista según sector (no todos 40)

Devuelve SOLO JSON:
{
  "roles": [{ "levelId":"@baixos","name":"...","fmv":40,"multiplier":1.2,"guardian":"everyman","description":"descripción real del rol en el ecosistema","eval_ids":["eval_1"] }],
  "transactions": [{ "fromLevel":"@baixos","toLevel":"@dosos","template":"nombre del entregable concreto","tipo":"tangible","horas":8,"eval_ids":["eval_1"],"soc_checklist":[{"text":"criterio verificable 1","isChecked":false},{"text":"criterio verificable 2","isChecked":false}] }]
}`,
                userPrompt: `MISIÓN: ${mission}\n\nEVALS A PASAR:\n${evalsCtx}`,
                responseFormat: 'json_object',
                temperature: 0.3
            });
            return { group: group.name, ...response.content };
        };

        let parallelResults;
        if (canParallelize) {
            // Paralelo — hasta 4 APIs simultáneas
            parallelResults = await Promise.allSettled(levelEvals.map(buildRolePrompt));
        } else {
            // Secuencial — 1 API, con delay entre llamadas para evitar rate limit
            parallelResults = [];
            for (const group of levelEvals) {
                try {
                    const result = await buildRolePrompt(group);
                    parallelResults.push({ status: 'fulfilled', value: result });
                    // Pequeño delay entre llamadas para no saturar el rate limit
                    await new Promise(r => setTimeout(r, 500));
                } catch (err) {
                    parallelResults.push({ status: 'rejected', reason: err });
                }
            }
        }
        const allRoles        = [];
        const allTransactions = [];

        parallelResults.forEach(r => {
            if (r.status === 'fulfilled') {
                allRoles.push(...(r.value.roles || []));
                allTransactions.push(...(r.value.transactions || []));
            }
        });

        log(`✅ ${allRoles.length} roles · ${allTransactions.length} transacciones generadas en paralelo.`);

        // ── PASO 3: Cap de Troncs detecta conflictos (1 API) ─────
        log('🌀 PASO 3/5 · Cap de Troncs auditando conflictos…');

        const conflictsResponse = await Orchestrator.callLLM({
            preferredEngine: 'anthropic',
            systemPrompt: `Eres el Cap de Troncs del enjambre SOS · Auditor táctico.
Analiza el VNA generado y detecta:
1. Roles sin transacciones (aislados)
2. Ciclos de dependencia (A→B→A)
3. Evals sin rol que los pase
4. Transacciones sin SOC definido
5. Desequilibrios de carga (un rol con demasiadas transacciones)

Devuelve SOLO JSON:
{
  "conflicts": [
    { "type": "isolated_role|circular_dep|orphan_eval|missing_soc|overloaded",
      "severity": "error|warning",
      "description": "...",
      "affected": ["role_name_or_eval_id"],
      "suggestion": "cómo resolverlo" }
  ],
  "health_score": 0.0-1.0,
  "ready_for_human_review": true|false
}`,
            userPrompt: `ROLES: ${JSON.stringify(allRoles)}\nTRANSACCIONES: ${JSON.stringify(allTransactions)}\nEVALS: ${JSON.stringify(evalsDraft)}`,
            responseFormat: 'json_object',
            temperature: 0.2
        });

        const { conflicts, health_score, ready_for_human_review } = conflictsResponse.content;
        const errors   = (conflicts || []).filter(c => c.severity === 'error');
        const warnings = (conflicts || []).filter(c => c.severity === 'warning');

        log(`✅ Auditoría: score ${health_score} · ${errors.length} errores · ${warnings.length} warnings`);

        // ── PASO 3.5: Auto-reparación de conflictos críticos ────────────────────
        // Si hay errores o roles aislados, un agente los resuelve antes de persistir
        const criticalConflicts = (conflicts || []).filter(c =>
            c.severity === 'error' ||
            c.type === 'isolated_role' ||
            c.type === 'missing_soc'
        );

        if (criticalConflicts.length > 0) {
            log(`🔧 PASO 3.5 · Auto-reparando ${criticalConflicts.length} conflictos críticos…`);
            try {
                const repairResponse = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt: `Eres el Agente Reparador del enjambre SOS.
Recibes un VNA con conflictos críticos detectados por el Cap de Troncs.
Tu misión: añadir las transacciones y SOCs que faltan para que NINGÚN rol quede aislado.

REGLAS ABSOLUTAS:
- Cada rol mencionado en "affected" debe recibir AL MENOS una transacción entrante y una saliente
- Los SOCs deben ser concretos y verificables en 1 frase
- No elimines roles ni transacciones existentes — solo AÑADE lo que falta
- Respeta el contexto del sector y misión del ecosistema

Devuelve SOLO JSON:
{
  "new_transactions": [{ "fromLevel":"@baixos","toLevel":"@dosos","template":"entregable concreto","tipo":"tangible","horas":4,"soc_checklist":[{"text":"criterio verificable","isChecked":false}] }],
  "role_soc_patches": [{ "roleName":"...","new_socs":[{"text":"criterio verificable","isChecked":false}] }]
}`,
                    userPrompt: `MISIÓN: ${mission}
SECTOR: ${sector}
CONFLICTOS A REPARAR:
${JSON.stringify(criticalConflicts, null, 2)}

ROLES ACTUALES:
${JSON.stringify(allRoles.map(r => ({ name: r.name, levelId: r.levelId })), null, 2)}

TRANSACCIONES ACTUALES:
${JSON.stringify(allTransactions.map(t => ({ from: t.fromLevel, to: t.toLevel, template: t.template })), null, 2)}`,
                    responseFormat: 'json_object',
                    temperature: 0.2
                });

                const repair = repairResponse.content;

                // Aplicar transacciones nuevas
                if (Array.isArray(repair.new_transactions)) {
                    allTransactions.push(...repair.new_transactions);
                    log(`✅ +${repair.new_transactions.length} transacciones reparadas`);
                }

                // Aplicar SOCs a roles que los tenían vacíos
                if (Array.isArray(repair.role_soc_patches)) {
                    repair.role_soc_patches.forEach(patch => {
                        const role = allRoles.find(r => r.name === patch.roleName || r.name?.includes(patch.roleName));
                        if (role && patch.new_socs) {
                            if (!role.soc_checklist) role.soc_checklist = [];
                            role.soc_checklist.push(...patch.new_socs);
                        }
                    });
                    log(`✅ SOCs aplicados a ${repair.role_soc_patches.length} roles`);
                }
            } catch (repairErr) {
                console.warn('[QueenSwarm] Auto-reparación falló:', repairErr.message);
                log(`⚠️ Auto-reparación no pudo completarse: ${repairErr.message}`);
            }
        } else {
            log('✅ Sin conflictos críticos — VNA listo para persistir.');
        }

        // ── PASO 4: Persistir en store y KB ──────────────────────
        log('🌀 PASO 4/5 · Persistiendo VNA en el ecosistema…');

        // Persistir evals en KB via EvalEngine
        const createdEvals = [];
        for (const e of evalsDraft) {
            try {
                const evalNode = await EvalEngine.createEval({
                    projectId,
                    parentId:   projectId,
                    parentType: 'project',
                    criteria:   e.criteria,
                    level:      e.level,
                    archetype:  null,
                    weight:     1.0
                });
                createdEvals.push({ ...e, evalNodeId: evalNode.id });
            } catch(_) {}
        }

        // Construir vna_nodes y vna_exchanges para el store
        const vnaNodes = allRoles.map((r, i) => ({
            id:      `vna_role_${i}_${Date.now()}`,
            label:   r.name,
            role:    r.levelId?.includes('anxaneta') || r.levelId?.includes('aixecador') ? 'human' : 'agent',
            tier:    [0,1,2,3,4].indexOf(['@pinya','@baixos','@dosos','@aixecador','@anxaneta'].indexOf(r.levelId)),
            levelId: r.levelId || '@baixos',
            fmv:     r.fmv || 40,
            multiplier: r.multiplier || 1.0,
            slices:  0.000,
            skills:  []
        }));

        const vnaExchanges = allTransactions.map((tx, i) => {
            const fromNode = vnaNodes.find(n => n.levelId === tx.fromLevel);
            const toNode   = vnaNodes.find(n => n.levelId === tx.toLevel);
            return {
                id:          `vna_ex_${i}_${Date.now()}`,
                from:        fromNode?.id || tx.fromLevel,
                to:          toNode?.id   || tx.toLevel,
                type:        tx.tipo || 'tangible',
                category:    tx.tipo === 'intangible' ? 'knowledge' : 'deliverable',
                label:       tx.template,
                trigger:     'on-demand',
                frequency:   'recurring',
                automatable: true,
                horas:       tx.horas || 8,
                soc_checklist: tx.soc_checklist || []
            };
        });

        await store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: {
                projectId,
                updates: {
                    vna_nodes:    vnaNodes,
                    vna_exchanges: vnaExchanges,
                    nombre:       ecosystem_name || 'Ecosistema SOS',
                    vna_description: mission
                }
            }
        });

        log(`✅ ${vnaNodes.length} nodos · ${vnaExchanges.length} exchanges persistidos.`);

        // ── PASO 5: Landing + modelo de negocio ──────────────────
        log('🌀 PASO 5/5 · Generando landing page y modelo de negocio…');

        const landingPrompt = {
            preferredEngine: 'anthropic',
            systemPrompt: `Eres un copywriter experto en B2B SaaS y servicios de IA.
Genera la landing page mínima viable. Devuelve SOLO JSON:
{
  "headline": "titular (≤8 palabras, beneficio claro)",
  "subheadline": "subtítulo (≤15 palabras)",
  "value_props": ["beneficio 1","beneficio 2","beneficio 3"],
  "cta_primary": "texto botón principal",
  "cta_secondary": "texto botón secundario",
  "social_proof": "prueba social",
  "pricing_hint": "indicación de precio o modelo"
}`,
            userPrompt: `ECOSISTEMA: ${ecosystem_name}\nVALOR: ${core_value}\nMISIÓN: ${mission}`,
            responseFormat: 'json_object',
            temperature: 0.5
        };

        const bizModelPrompt = {
            preferredEngine: 'anthropic',
            systemPrompt: `Eres un experto en modelos de negocio para servicios de IA.
Devuelve SOLO JSON:
{
  "model_type": "subscription|project|retainer|hybrid",
  "tiers": [{ "name":"...","price_monthly":0,"description":"...","includes":["..."] }],
  "unit_economics": { "cost_per_delivery":"...","margin_target":"...","break_even_clients":"..." },
  "first_revenue_path": "cómo conseguir el primer ingreso en < 30 días"
}`,
            userPrompt: `ROLES: ${allRoles.map(r=>r.name).join(', ')}\nFLUJOS: ${allTransactions.length}\nSECTOR: ${sector}`,
            responseFormat: 'json_object',
            temperature: 0.4
        };

        let landing, bizModel;
        if (canParallelize) {
            const [landingRes, bizModelRes] = await Promise.allSettled([
                Orchestrator.callLLM(landingPrompt),
                Orchestrator.callLLM(bizModelPrompt)
            ]);
            landing  = landingRes.status  === 'fulfilled' ? landingRes.value.content  : null;
            bizModel = bizModelRes.status === 'fulfilled' ? bizModelRes.value.content : null;
        } else {
            try { landing  = (await Orchestrator.callLLM(landingPrompt)).content;  } catch(_) {}
            await new Promise(r => setTimeout(r, 500));
            try { bizModel = (await Orchestrator.callLLM(bizModelPrompt)).content; } catch(_) {}
        }

        // Persistir landing y bizModel en KB
        if (landing) {
            await KB.saveNode({
                id:        `landing_${projectId}`,
                type:      'landing',
                category:  'core.architecture',
                projectId,
                title:     `Landing: ${ecosystem_name}`,
                content:   JSON.stringify(landing),
                keywords:  ['landing', 'mvp', projectId]
            });
        }
        if (bizModel) {
            await KB.saveNode({
                id:        `bizmodel_${projectId}`,
                type:      'business_model',
                category:  'core.economy',
                projectId,
                title:     `Modelo de negocio: ${ecosystem_name}`,
                content:   JSON.stringify(bizModel),
                keywords:  ['bizmodel', 'pricing', projectId]
            });
        }

        log(`✅ Landing y modelo de negocio generados.`);

        // ── Resultado final ───────────────────────────────────────
        return {
            ecosystem_name,
            core_value,
            evals:       createdEvals,
            roles:       allRoles,
            transactions: allTransactions,
            vnaNodes,
            vnaExchanges,
            conflicts,
            health_score,
            ready_for_human_review,
            landing,
            bizModel,
            summary: {
                evalsCount:        createdEvals.length,
                rolesCount:        allRoles.length,
                transactionsCount: allTransactions.length,
                errorsCount:       errors.length,
                warningsCount:     warnings.length,
                healthScore:       health_score,
                autoRepaired:      criticalConflicts.length,
                // Para el panel de revisión humana: solo warnings no críticos
                pendingWarnings:   warnings.filter(w => w.type !== 'isolated_role' && w.type !== 'missing_soc')
            }
        };
    }

    // ── getKernelStatus — estado del enjambre ────────────────────
    static async getKernelStatus() {
        await KB.init();
        const all    = await KB.getAllNodes();
        const skills = Object.values(QUEEN_SKILLS);
        const status = skills.map(s => ({
            id:      s.id,
            title:   s.title,
            seeded:  !!all.find(n => n.id === s.id)
        }));
        return {
            skills:    status,
            allSeeded: status.every(s => s.seeded),
            missing:   status.filter(s => !s.seeded).map(s => s.id)
        };
    }

    // ── autoRoute — la Reina decide a qué nivel va una petición ──
    static routeToLevel(request) {
        const lower = request.toLowerCase();
        if (lower.includes('visión') || lower.includes('estrategia') ||
            lower.includes('modelo de negocio') || lower.includes('landing'))
            return 'canalla';   // Cap de Canalla (anxaneta/aixecador)
        if (lower.includes('work order') || lower.includes('flujo') ||
            lower.includes('kanban') || lower.includes('soc'))
            return 'troncs';    // Cap de Troncs (dosos)
        if (lower.includes('skill') || lower.includes('agent') ||
            lower.includes('worker') || lower.includes('ejecutar'))
            return 'pinya';     // Cap de Pinya
        if (lower.includes('codex') || lower.includes('test') ||
            lower.includes('auditoria') || lower.includes('error'))
            return 'guardian';  // Guardianes del Kernel
        return 'reina';         // La Reina lo gestiona directamente
    }
}
