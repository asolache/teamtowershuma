// =============================================================================
// TEAMTOWERS SOS V10 — VnaCalibrator.js
// [#TEAMTOWERS_V10_ANTIGRAVITY_KERNEL]
// Ruta: /ia/dev/js/core/VnaCalibrator.js
//
// Agente de calibración conversacional para generar VNAs de alta calidad.
// Detecta el nivel de zoom (Macro/Meso/Micro/Nano), pide contexto mínimo
// necesario en bloques de 2-3 preguntas, y genera el prompt maestro
// que @agent_genesis_architect usa para construir el mapa.
// =============================================================================

import { Orchestrator } from './Orchestrator.js';
import { KB }           from './kb.js';
import { store }        from './store.js';

// ── Niveles de zoom VNA ────────────────────────────────────────────────────────
export const VNA_ZOOM = {
    MACRO: 'macro',   // Ecosistema completo (industria, mercado, sociedad)
    MESO:  'meso',    // Organización / empresa / proyecto
    MICRO: 'micro',   // Equipo / proceso / flujo interno
    NANO:  'nano'     // Persona / rol individual / tarea
};

// ── Configuración por zoom ─────────────────────────────────────────────────────
const ZOOM_CONFIG = {
    macro: {
        label:          'Macro — Ecosistema',
        icon:           '🌐',
        maxNodes:       20,
        maxFlows:       40,
        levelIds:       ['@anxaneta', '@aixecador', '@dosos', '@baixos', '@pinya'],
        roleTypes:      ['organization', 'process', 'resource'],
        description:    'Mapa de industria, mercado o sociedad. Roles son organizaciones o sectores.',
        exampleRoles:   ['Proveedor externo', 'Regulador', 'Mercado objetivo', 'Ecosistema partner'],
        flowGranularity:'alta — flujos estratégicos, no operativos'
    },
    meso: {
        label:          'Meso — Organización',
        icon:           '🏢',
        maxNodes:       15,
        maxFlows:       30,
        levelIds:       ['@anxaneta', '@aixecador', '@dosos', '@baixos', '@pinya'],
        roleTypes:      ['human', 'organization', 'process', 'agent'],
        description:    'Mapa de empresa, organización o proyecto. Roles son departamentos, equipos o personas clave.',
        exampleRoles:   ['CEO', 'Equipo Producto', 'Cliente', 'Proveedor', 'Agente IA'],
        flowGranularity:'media — flujos de proceso y decisión'
    },
    micro: {
        label:          'Micro — Equipo / Proceso',
        icon:           '⚙️',
        maxNodes:       12,
        maxFlows:       25,
        levelIds:       ['@anxaneta', '@aixecador', '@dosos', '@baixos', '@pinya'],
        roleTypes:      ['human', 'process', 'agent', 'resource'],
        description:    'Mapa de equipo, flujo de trabajo o proceso específico. Roles son personas o pasos.',
        exampleRoles:   ['Developer', 'QA', 'PM', 'Cliente interno', 'Sistema CI/CD'],
        flowGranularity:'alta — flujos operativos, entregables concretos'
    },
    nano: {
        label:          'Nano — Rol / Tarea',
        icon:           '🔬',
        maxNodes:       8,
        maxFlows:       15,
        levelIds:       ['@anxaneta', '@aixecador', '@dosos'],
        roleTypes:      ['human', 'agent', 'resource'],
        description:    'Mapa de una persona, rol individual o tarea específica. Alta granularidad.',
        exampleRoles:   ['Yo', 'Mi herramienta', 'Mi cliente directo', 'Mi manager'],
        flowGranularity:'muy alta — entregables granulares, flujos diarios'
    }
};

// ── Bloques de calibración (preguntas agrupadas por tema) ──────────────────────
// Orden: Zoom → Metaskill → Contexto → Roles → Granularidad
const CALIBRATION_BLOCKS = [

    // BLOQUE 0 — Zoom (solo si no se ha detectado aún)
    {
        id:       'zoom',
        topic:    'Nivel de zoom del mapa',
        required: true,
        detect:   (ctx) => ctx.zoom == null,
        questions: [
            {
                id:   'zoom_level',
                text: '¿A qué nivel quieres mapear el sistema?',
                hint: 'Macro = industria/mercado · Meso = empresa/proyecto · Micro = equipo/proceso · Nano = persona/tarea',
                type: 'select',
                options: Object.entries(ZOOM_CONFIG).map(([k,v]) => ({ value:k, label:`${v.icon} ${v.label}`, desc:v.description }))
            },
            {
                id:   'zoom_boundary',
                text: '¿Cuál es el límite del sistema? (¿qué queda dentro y qué queda fuera del mapa?)',
                hint: 'Ej: "Solo el equipo de producto, no ventas" o "Toda la cadena de valor incluyendo distribuidores"',
                type: 'text'
            }
        ]
    },

    // BLOQUE 1 — Metaskill (obligatorio)
    {
        id:       'metaskill',
        topic:    'Propósito de la red',
        required: true,
        detect:   (ctx) => !ctx.mission,
        questions: [
            {
                id:   'mission',
                text: '¿Cuál es la misión de esta red? (para qué existe, en presente)',
                hint: 'Ej: "Desarrollar software de gestión para PYMEs del sector textil"',
                type: 'text'
            },
            {
                id:   'vision_or_goal',
                text: '¿Cuál es el objetivo principal que quieres conseguir con este mapa?',
                hint: 'Ej: "Detectar cuellos de botella" o "Diseñar el equipo ideal" o "Validar el modelo de negocio"',
                type: 'text'
            }
        ]
    },

    // BLOQUE 2 — Contexto del ecosistema
    {
        id:       'context',
        topic:    'Contexto del ecosistema',
        required: true,
        detect:   (ctx) => !ctx.sector || !ctx.maturity,
        questions: [
            {
                id:   'sector',
                text: '¿En qué sector o industria opera esta red?',
                hint: 'Ej: "EdTech", "Construcción", "Servicios digitales", "Salud", "Comunidad de práctica"',
                type: 'text'
            },
            {
                id:   'maturity',
                text: '¿En qué fase está el sistema?',
                hint: '',
                type: 'select',
                options: [
                    { value: 'ideation',  label: '💡 Idea / Validación', desc: 'El sistema aún no existe o está en boceto' },
                    { value: 'startup',   label: '🚀 Arranque',         desc: 'Funciona pero con mucha incertidumbre' },
                    { value: 'growth',    label: '📈 Crecimiento',      desc: 'Opera y escala activamente' },
                    { value: 'mature',    label: '🏛️ Maduro',           desc: 'Estable, buscando optimización o transformación' },
                    { value: 'pivot',     label: '🔄 Pivot / Cambio',   desc: 'Transformándose o reinventándose' }
                ]
            }
        ]
    },

    // BLOQUE 3 — Roles conocidos (opcional pero enriquecedor)
    {
        id:       'roles',
        topic:    'Actores de la red',
        required: false,
        detect:   (ctx) => !ctx.knownRoles && !ctx.rolesSkipped,
        questions: [
            {
                id:   'known_roles',
                text: '¿Hay roles o actores que ya sabes que participan? (separa por comas, o escribe "no sé")',
                hint: 'Ej: "Cliente, Proveedor, Equipo interno, Regulador" — o deja que el agente los detecte.',
                type: 'text'
            },
            {
                id:   'focal_role',
                text: '¿Hay un rol focal (el protagonista del mapa, desde cuya perspectiva se analiza)?',
                hint: 'Ej: "Desde la perspectiva del cliente" o "Centrado en el equipo de desarrollo"',
                type: 'text'
            }
        ]
    },

    // BLOQUE 4 — Granularidad y output (solo si el zoom es micro o nano)
    {
        id:       'granularity',
        topic:    'Granularidad y entregables',
        required: false,
        detect:   (ctx) => ['micro','nano'].includes(ctx.zoom) && !ctx.granularitySet,
        questions: [
            {
                id:   'time_horizon',
                text: '¿El mapa representa un ciclo de tiempo específico?',
                hint: 'Ej: "Un sprint de 2 semanas", "Un día de trabajo", "Todo el proyecto", "Sin límite temporal"',
                type: 'text'
            },
            {
                id:   'deliverable_detail',
                text: '¿Qué nivel de detalle quieres en los entregables de cada flujo?',
                type: 'select',
                options: [
                    { value: 'high',   label: '🔬 Alto — cada entregable concreto y medible' },
                    { value: 'medium', label: '📊 Medio — flujos principales, sin detallar cada paso' },
                    { value: 'low',    label: '🗺️ Bajo — solo flujos estratégicos y clave' }
                ]
            }
        ]
    }
];

// =============================================================================
// VnaCalibratorEngine — Motor de calibración conversacional
// =============================================================================
export class VnaCalibratorEngine {

    constructor() {
        this.context     = {};      // Contexto acumulado de la conversación
        this.blocksDone  = new Set();
        this.isCalibrated= false;
    }

    // ── Reset para nuevo mapa ──────────────────────────────────────────────────
    reset() {
        this.context     = {};
        this.blocksDone  = new Set();
        this.isCalibrated= false;
    }

    // ── Detectar zoom desde descripción libre del usuario ─────────────────────
    detectZoomFromText(text) {
        const lower = text.toLowerCase();

        // Señales Nano
        if (/\b(yo |mi día|mi rutina|mi tarea|rol individual|una persona)\b/.test(lower)) return VNA_ZOOM.NANO;

        // Señales Macro
        if (/\b(industria|mercado|sector|sociedad|país|economia|ecosistema global)\b/.test(lower)) return VNA_ZOOM.MACRO;

        // Señales Micro
        if (/\b(equipo|proceso|sprint|flujo de trabajo|pipeline|workflow|departamento)\b/.test(lower)) return VNA_ZOOM.MICRO;

        // Default: Meso (empresa/proyecto)
        return VNA_ZOOM.MESO;
    }

    // ── Enriquecer contexto desde descripción libre ────────────────────────────
    enrichFromDescription(description) {
        if (!description) return;
        this.context.rawDescription = description;

        // Auto-detectar zoom si no se ha especificado
        if (!this.context.zoom) {
            this.context.zoom = this.detectZoomFromText(description);
        }

        // Auto-detectar sector básico
        const lower = description.toLowerCase();
        if (!this.context.sector) {
            if (/\b(software|tech|digital|app|saas|ia|ai)\b/.test(lower))  this.context.sector = 'technology';
            if (/\b(educaci|aprendiz|formaci|curso|escuela)\b/.test(lower)) this.context.sector = 'education';
            if (/\b(salud|medic|hospital|clínica|health)\b/.test(lower))    this.context.sector = 'health';
            if (/\b(construcci|inmobiliari|arquitectura)\b/.test(lower))    this.context.sector = 'construction';
        }
    }

    // ── Obtener el siguiente bloque de preguntas necesario ────────────────────
    getNextBlock() {
        for (const block of CALIBRATION_BLOCKS) {
            if (this.blocksDone.has(block.id)) continue;
            if (block.detect(this.context)) {
                return block;
            }
        }
        return null; // Calibración completa
    }

    // ── Procesar respuestas de un bloque ──────────────────────────────────────
    applyBlockAnswers(blockId, answers) {
        Object.assign(this.context, answers);
        this.blocksDone.add(blockId);

        // Post-procesado especial por bloque
        if (blockId === 'zoom') {
            // Si respondieron "no sé" en known_roles, marcarlo
            if (answers.known_roles?.toLowerCase().includes('no s')) {
                this.context.rolesSkipped = true;
            }
        }
        if (blockId === 'roles') {
            if (answers.known_roles) {
                this.context.knownRoles = answers.known_roles
                    .split(',')
                    .map(r => r.trim())
                    .filter(r => r && !r.toLowerCase().includes('no s'));
            }
            this.context.granularitySet = true; // evitar bloque granularidad si ya hay roles
        }
        if (blockId === 'granularity') {
            this.context.granularitySet = true;
        }

        // Verificar si está completo
        const next = this.getNextBlock();
        if (!next) this.isCalibrated = true;
    }

    // ── Skip de bloque opcional ────────────────────────────────────────────────
    skipBlock(blockId) {
        this.blocksDone.add(blockId);
        if (blockId === 'roles') {
            this.context.rolesSkipped = true;
            this.context.knownRoles   = [];
        }
        if (blockId === 'granularity') {
            this.context.granularitySet = true;
            this.context.deliverable_detail = 'medium';
        }
        const next = this.getNextBlock();
        if (!next) this.isCalibrated = true;
    }

    // ── Estado de progreso ────────────────────────────────────────────────────
    getProgress() {
        const required  = CALIBRATION_BLOCKS.filter(b => b.required);
        const doneReq   = required.filter(b => this.blocksDone.has(b.id));
        return {
            pct:      Math.round((doneReq.length / required.length) * 100),
            done:     doneReq.length,
            total:    required.length,
            zoom:     this.context.zoom,
            zoomCfg:  this.context.zoom ? ZOOM_CONFIG[this.context.zoom] : null
        };
    }

    // ── Generar el prompt maestro para @agent_genesis_architect ───────────────
    buildMasterPrompt() {
        if (!this.isCalibrated && !this.context.mission) {
            throw new Error('[VnaCalibrator] Calibración incompleta — falta metaskill mínima.');
        }

        const zoom    = this.context.zoom    || 'meso';
        const cfg     = ZOOM_CONFIG[zoom];
        const mission = this.context.mission || this.context.rawDescription || '';
        const goal    = this.context.vision_or_goal || 'Construir un mapa de valor claro y accionable';
        const sector  = this.context.sector  || 'general';
        const maturity= this.context.maturity || 'growth';
        const boundary= this.context.zoom_boundary || 'El sistema descrito por el usuario';
        const knownRoles = (this.context.knownRoles || []).join(', ') || 'Detectar desde el contexto';
        const focalRole  = this.context.focal_role || null;
        const timeHorizon= this.context.time_horizon || 'Sin límite temporal específico';
        const detailLevel= this.context.deliverable_detail || 'medium';

        const maturityLabels = {
            ideation: 'Idea / Validación', startup: 'Arranque', growth: 'Crecimiento',
            mature: 'Maduro', pivot: 'Pivot / Cambio'
        };

        return `[IDENTIDAD DEL AGENTE]
Eres @agent_genesis_architect, experto en Value Network Analysis (VNA) según Verna Allee.
Tu misión es construir el mapa de valor inicial con máxima calidad y mínima ambigüedad.
Opera con Glass-Box: cada decisión de diseño debe ser explicable y auditable.
Motor: claude-sonnet-4-20250514 (SOS V10 Antigravity Kernel).

[NIVEL DE ZOOM — ${cfg.icon} ${cfg.label.toUpperCase()}]
Zoom seleccionado: ${zoom}
Descripción del zoom: ${cfg.description}
Límite del sistema: ${boundary}
Tipos de roles aplicables: ${cfg.roleTypes.join(', ')}
Granularidad de flujos: ${cfg.flowGranularity}
Máximo de nodos recomendado: ${cfg.maxNodes}
Máximo de flujos recomendado: ${cfg.maxFlows}
Niveles castell disponibles: ${cfg.levelIds.join(', ')}
${focalRole ? ("Rol focal (perspectiva central del mapa): " + focalRole) : ""}

[METASKILL DE ESTA RED]
Misión: ${mission}
Objetivo del mapa: ${goal}
Sector / industria: ${sector}
Fase del sistema: ${maturityLabels[maturity] || maturity}
Horizonte temporal: ${timeHorizon}

[CONTEXTO ADICIONAL]
${this.context.rawDescription ? ("Descripción libre del usuario:\n\"" + this.context.rawDescription + "\"") : ""}

[ROLES / ACTORES]
Roles ya identificados por el usuario: ${knownRoles}
${this.context.rolesSkipped ? 'El usuario no identificó roles previos — detectar desde el contexto.' : ''}

[INSTRUCCIONES DE CONSTRUCCIÓN — SEGUIR EN ORDEN]

1. ROLES (vna_nodes):
   - Identifica todos los roles/actores relevantes para el nivel ${zoom}
   - Asigna \`role\`: ${cfg.roleTypes.map(function(r){ return '"' + r + '"'; }).join(' | ')}
   - Asigna \`levelId\` según jerarquía castell:
     * @anxaneta = cúspide (decisores estratégicos, visión, C-level)
     * @aixecador = segundo nivel (coordinadores, managers, líderes)
     * @dosos = tercer nivel (ejecutores senior, especialistas)
     * @baixos = cuarto nivel (ejecutores base, operativos)
     * @pinya = base (soporte, recursos externos, proveedores, clientes masivos)
   - Añade una \`description\` breve y funcional (no de cargo, de función en la red)
   - Si el usuario dio roles, úsalos; si hay roles clave faltantes, AÑÁDELOS marcándolos como sugeridos

2. FLUJOS (vna_flows) — REGLA DE ORO VNA:
   - Por cada relación entre roles, define PRIMERO el tangible, LUEGO busca el intangible que lo precede o sigue
   - \`type\`: "tangible" (bien/servicio/pago/dato) | "intangible" (conocimiento/confianza/feedback/reconocimiento)
   - \`category\`: "payment" | "service" | "knowledge" | "trust" | "feedback"
   - \`label\`: entregable concreto, MÁXIMO 28 caracteres (se trunca en el mapa SVG)
   - \`sequence_order\`: orden lógico del flujo en el proceso (1, 2, 3...)
   - Respeta el principio de reciprocidad: si A→B, buscar B→A (aunque sea intangible)

3. VALIDACIÓN DE SALUD:
   - Detecta roles aislados (sin flujos) → añade flujos o elimina el rol
   - Detecta cuellos de botella (>40% flujos concentrados en un nodo)
   - Detecta flujos unidireccionales sin retorno → propone el flujo faltante
   - Calcula health_score (0.0-1.0):
     * 1.0 = red perfectamente equilibrada y alineada a metaskill
     * Descuenta 0.15 por rol aislado, 0.10 por cuello de botella, 0.08 por flujo sin retorno

4. ROLES FALTANTES:
   - Si detectas un gap en el flujo (algo que debería existir pero no hay actor que lo sostenga),
     propón el rol faltante con \`suggested: true\`

5. SÍNTESIS NARRATIVA:
   - Escribe 2-3 frases explicando cómo la red cumple (o no) su misión
   - Identifica los flujos más críticos (los que, si se rompen, colapsa la red)

[RESTRICCIONES CRÍTICAS]
- Labels de flujos: MÁXIMO 28 caracteres (se truncan en el SVG)
- No inventar roles sin evidencia en el contexto
- levelId SIEMPRE en el array válido: [@anxaneta, @aixecador, @dosos, @baixos, @pinya]
- Si falta información crítica para el zoom ${zoom}, PREGUNTAR antes de asumir
- health_score entre 0.000 y 1.000 con 3 decimales

[FORMATO DE OUTPUT — JSON-LD V10 OBLIGATORIO]
Devuelve ÚNICAMENTE este JSON, sin markdown, sin texto adicional:
{
  "@context": "https://teamtowers.io/sos/v10/vna",
  "@type": "SosArtifact",
  "artifactType": "vna_map",
  "agentId": "@agent_genesis_architect",
  "zoom": "${zoom}",
  "timestamp": "<ISO-8601>",
  "payload": {
    "nodes": [
      {
        "id": "role-<slug>",
        "label": "<nombre rol, máx 20 chars>",
        "role": "<human|agent|process|organization|resource>",
        "levelId": "<@anxaneta|@aixecador|@dosos|@baixos|@pinya>",
        "description": "<función en la red, 1 frase>",
        "suggested": false
      }
    ],
    "exchanges": [
      {
        "id": "flow-<NNN>",
        "from": "role-<slug>",
        "to": "role-<slug>",
        "type": "<tangible|intangible>",
        "category": "<payment|service|knowledge|trust|feedback>",
        "label": "<entregable, máx 28 chars>",
        "sequence_order": 1,
        "entregable": "<descripción extendida del entregable>"
      }
    ],
    "meta": {
      "mission": "${mission.substring(0, 120)}",
      "goal": "${goal.substring(0, 120)}",
      "zoom": "${zoom}",
      "sector": "${sector}",
      "health_score": 0.000,
      "isolated_roles": [],
      "bottlenecks": [],
      "missing_flows": [],
      "critical_flows": [],
      "narrative": "<síntesis de 2-3 frases>",
      "suggested_roles": []
    }
  }
}`;
    }
}

// =============================================================================
// VnaCalibrator — UI Component de calibración conversacional
// Se monta dentro de la textarea de ValueMapView
// =============================================================================
export class VnaCalibrator {

    constructor(containerId, { onCalibrated, onDescriptionReady } = {}) {
        this.container          = document.getElementById(containerId);
        this.onCalibrated       = onCalibrated;       // cb(context, masterPrompt)
        this.onDescriptionReady = onDescriptionReady; // cb(description) — para el btn Mapear simple
        this.engine             = new VnaCalibratorEngine();
        this._mode              = 'idle'; // 'idle' | 'calibrating' | 'done'
    }

    // ── Iniciar calibración desde descripción libre ───────────────────────────
    async startFromDescription(description) {
        this.engine.reset();
        this.engine.enrichFromDescription(description);
        this._mode = 'calibrating';
        this._renderNextBlock();
    }

    // ── Calibración express: si la descripción es suficientemente rica, ───────
    // saltar directamente al prompt sin preguntar.
    async quickCalibrate(description) {
        this.engine.reset();
        this.engine.enrichFromDescription(description);

        // Si tenemos misión y zoom detectado, construir directamente
        if (description.length > 80 && this.engine.context.zoom) {
            this.engine.context.mission = description;
            this.engine.blocksDone.add('zoom');
            this.engine.blocksDone.add('metaskill');
            this.engine.blocksDone.add('roles');
            this.engine.blocksDone.add('granularity');
            this.engine.isCalibrated = true;

            const prompt = this.engine.buildMasterPrompt();
            if (this.onCalibrated) this.onCalibrated(this.engine.context, prompt);
            return { calibrated: true, context: this.engine.context, prompt };
        }

        // Descripción corta → preguntar
        this._mode = 'calibrating';
        this._renderNextBlock();
        return { calibrated: false };
    }

    // ── Render del bloque de preguntas activo ─────────────────────────────────
    _renderNextBlock() {
        if (!this.container) return;
        const block = this.engine.getNextBlock();

        if (!block) {
            // Calibración completa
            this._mode = 'done';
            this._renderDone();
            return;
        }

        const progress = this.engine.getProgress();
        const zoomCfg  = progress.zoomCfg;

        // Renderizar bloque con preguntas
        this.container.innerHTML = `
            <div class="cal-wrap">
                <div class="cal-header">
                    <div class="cal-topic">
                        ${zoomCfg ? `<span class="cal-zoom-badge">${zoomCfg.icon} ${zoomCfg.label}</span>` : ''}
                        <span class="cal-block-title">${block.topic}</span>
                    </div>
                    <div class="cal-progress">
                        <div class="cal-progress-bar" style="width:${progress.pct}%"></div>
                    </div>
                </div>

                <div class="cal-questions" id="calQuestions">
                    ${block.questions.map((q, i) => this._renderQuestion(q, i)).join('')}
                </div>

                <div class="cal-actions">
                    <button class="cal-btn-next" id="calBtnNext">
                        ${this.engine.getNextBlock()?.id === block.id ? 'Continuar →' : 'Siguiente bloque →'}
                    </button>
                    ${!block.required ? `<button class="cal-btn-skip" id="calBtnSkip">Omitir</button>` : ''}
                </div>
            </div>

            <style>
                .cal-wrap { padding:1rem; display:flex; flex-direction:column; gap:0.75rem; }
                .cal-header { display:flex; flex-direction:column; gap:6px; }
                .cal-topic { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
                .cal-zoom-badge { font-size:0.65rem; background:rgba(99,102,241,0.1); color:var(--accent-indigo);
                    border:1px solid rgba(99,102,241,0.25); border-radius:20px; padding:2px 8px; font-weight:900;
                    font-family:var(--font-mono); }
                .cal-block-title { font-size:0.7rem; font-weight:900; color:#555; text-transform:uppercase;
                    letter-spacing:1px; }
                .cal-progress { height:2px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden; }
                .cal-progress-bar { height:100%; background:var(--accent-indigo); transition:width 0.4s; }
                .cal-questions { display:flex; flex-direction:column; gap:0.75rem; }
                .cal-q-wrap { display:flex; flex-direction:column; gap:5px; }
                .cal-q-label { font-size:0.78rem; font-weight:700; color:white; line-height:1.4; }
                .cal-q-hint { font-size:0.68rem; color:#444; font-style:italic; }
                .cal-input { width:100%; background:rgba(0,0,0,0.4); border:1px solid #2a2a2a; color:white;
                    padding:9px 12px; border-radius:8px; font-family:var(--font-base); font-size:0.82rem;
                    outline:none; transition:border-color 0.2s; box-sizing:border-box; }
                .cal-input:focus { border-color:rgba(99,102,241,0.4); }
                .cal-select-grid { display:flex; flex-direction:column; gap:5px; }
                .cal-opt { display:flex; align-items:flex-start; gap:8px; padding:8px 10px; border-radius:8px;
                    border:1px solid rgba(255,255,255,0.06); cursor:pointer; transition:0.15s; }
                .cal-opt:hover { border-color:rgba(99,102,241,0.3); background:rgba(99,102,241,0.04); }
                .cal-opt input[type=radio] { margin-top:2px; accent-color:var(--accent-indigo); flex-shrink:0; }
                .cal-opt-label { font-size:0.78rem; font-weight:700; color:white; }
                .cal-opt-desc { font-size:0.68rem; color:#555; margin-top:1px; }
                .cal-actions { display:flex; gap:8px; margin-top:4px; }
                .cal-btn-next { flex:1; padding:10px; border-radius:8px; font-weight:900; font-size:0.82rem;
                    cursor:pointer; border:none; background:linear-gradient(135deg,rgba(224,64,251,0.7),rgba(99,102,241,0.7));
                    color:white; transition:0.2s; }
                .cal-btn-next:hover { transform:translateY(-1px); filter:brightness(1.1); }
                .cal-btn-skip { padding:10px 14px; border-radius:8px; font-weight:700; font-size:0.75rem;
                    cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:transparent; color:#555;
                    transition:0.2s; }
                .cal-btn-skip:hover { color:#888; }
            </style>
        `;

        // Events
        this.container.querySelector('#calBtnNext')?.addEventListener('click', () => {
            this._collectAndAdvance(block);
        });
        this.container.querySelector('#calBtnSkip')?.addEventListener('click', () => {
            this.engine.skipBlock(block.id);
            this._renderNextBlock();
        });
    }

    // ── Render de una pregunta individual ─────────────────────────────────────
    _renderQuestion(q, idx) {
        if (q.type === 'select') {
            return `
            <div class="cal-q-wrap">
                <div class="cal-q-label">${idx + 1}. ${q.text}</div>
                <div class="cal-select-grid">
                    ${q.options.map(opt => `
                    <label class="cal-opt">
                        <input type="radio" name="calQ_${q.id}" value="${opt.value}">
                        <div>
                            <div class="cal-opt-label">${opt.label}</div>
                            ${opt.desc ? `<div class="cal-opt-desc">${opt.desc}</div>` : ''}
                        </div>
                    </label>`).join('')}
                </div>
            </div>`;
        }

        return `
        <div class="cal-q-wrap">
            <div class="cal-q-label">${idx + 1}. ${q.text}</div>
            ${q.hint ? `<div class="cal-q-hint">${q.hint}</div>` : ''}
            <input type="text" class="cal-input" data-qid="${q.id}" placeholder="${q.hint || '...'}" autocomplete="off">
        </div>`;
    }

    // ── Recoger respuestas y avanzar ──────────────────────────────────────────
    _collectAndAdvance(block) {
        const answers = {};
        let allAnswered = true;

        for (const q of block.questions) {
            if (q.type === 'select') {
                const checked = this.container.querySelector(`[name="calQ_${q.id}"]:checked`);
                if (checked) answers[q.id] = checked.value;
                else if (block.required) { allAnswered = false; break; }
            } else {
                const input = this.container.querySelector(`[data-qid="${q.id}"]`);
                const val   = input?.value?.trim();
                if (val) answers[q.id] = val;
                else if (block.required && block.questions.indexOf(q) === 0) {
                    // Solo la primera pregunta de un bloque obligatorio es realmente obligatoria
                    allAnswered = false; break;
                }
            }
        }

        if (!allAnswered) {
            // Highlight inputs vacíos
            this.container.querySelectorAll('.cal-input').forEach(inp => {
                if (!inp.value.trim()) inp.style.borderColor = 'rgba(255,82,82,0.5)';
            });
            return;
        }

        this.engine.applyBlockAnswers(block.id, answers);
        this._renderNextBlock();
    }

    // ── Pantalla de calibración completa ──────────────────────────────────────
    _renderDone() {
        if (!this.container) return;
        const ctx    = this.engine.context;
        const cfg    = ZOOM_CONFIG[ctx.zoom || 'meso'];
        const prompt = this.engine.buildMasterPrompt();

        this.container.innerHTML = `
            <div style="padding:1rem;display:flex;flex-direction:column;gap:0.75rem;">
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:1.3rem;">${cfg.icon}</span>
                    <div>
                        <div style="font-size:0.8rem;font-weight:900;color:white;">${cfg.label}</div>
                        <div style="font-size:0.65rem;color:#555;font-family:var(--font-mono);">Calibración completa · Listo para mapear</div>
                    </div>
                </div>
                <div style="font-size:0.75rem;color:#888;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);
                    border-radius:8px;padding:10px;line-height:1.6;">
                    <b style="color:white;">Misión:</b> ${ctx.mission || ctx.rawDescription || '—'}<br>
                    ${ctx.sector ? `<b style="color:white;">Sector:</b> ${ctx.sector}<br>` : ''}
                    ${ctx.knownRoles?.length ? `<b style="color:white;">Roles base:</b> ${ctx.knownRoles.join(', ')}<br>` : ''}
                </div>
                <button id="calBtnMap" style="width:100%;padding:11px;border-radius:9px;font-weight:900;font-size:0.85rem;
                    cursor:pointer;border:none;background:linear-gradient(135deg,rgba(224,64,251,0.75),rgba(99,102,241,0.75));
                    color:white;display:flex;align-items:center;justify-content:center;gap:8px;">
                    🗺️ Generar Mapa VNA
                </button>
                <button id="calBtnReset" style="width:100%;padding:7px;border-radius:8px;font-weight:700;font-size:0.72rem;
                    cursor:pointer;border:1px solid rgba(255,255,255,0.06);background:transparent;color:#555;">
                    ↺ Recalibrar
                </button>
            </div>`;

        this.container.querySelector('#calBtnMap')?.addEventListener('click', () => {
            if (this.onCalibrated) this.onCalibrated(ctx, prompt);
        });
        this.container.querySelector('#calBtnReset')?.addEventListener('click', () => {
            this.engine.reset();
            this._mode = 'idle';
            if (this.onDescriptionReady) this.onDescriptionReady();
        });
    }

    // ── API pública ────────────────────────────────────────────────────────────
    getContext()      { return this.engine.context; }
    getMasterPrompt() { return this.engine.buildMasterPrompt(); }
    isReady()         { return this.engine.isCalibrated; }
}

// ── Singleton exportado ────────────────────────────────────────────────────────
export const VnaCalibratorGlobal = new VnaCalibratorEngine();
