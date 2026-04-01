// =============================================================================
// TEAMTOWERS SOS V10.1 — CHAT (ex Paper View)
// Ruta: ia/dev/js/views/PaperView.js
// Chat principal · La Reina · Kanban · @menciones · Artefactos · Breadcrumb
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { Orchestrator }   from '../core/Orchestrator.js';
import { EvalEngine }     from '../core/EvalEngine.js';
import { WoAutoCloser }   from '../core/WoAutoCloser.js';

const KERNEL_MODELS = {
    vna: { name:'Value Network Analysis (Verna Allee)', prompt:`Aplica VNA estricto: roles como nodos, transacciones como aristas dirigidas. Distingue: (1) tangibles=dinero/código/documentos, (2) intangibles=confianza/conocimiento/feedback. Cada rol debe tener mínimo 1 entrada y 1 salida. Sin roles aislados. Formato: {nodes:[{id,label,role,tier}],exchanges:[{from,to,tipo,template,horas}]}` },
    slicing_pie: { name:'Slicing Pie Pro', prompt:`Aplica Slicing Pie exacto: cada aportación→slices proporcionales al riesgo. Multiplicadores: tiempo no remunerado×2, cash×4, equipamiento×4, IP×4. Fórmula: slices=(horas×FMV×multiplicador).toFixed(3). Modelos: Startup(equity), Empresa(profit-share), DAO(tokens), Colla(puntos de contribución). La Colla=todos los que aportan valor a la red.` },
    gtd: { name:'GTD (Getting Things Done)', prompt:`Aplica GTD: captura→clarifica→organiza→reflexiona→ejecuta. Work Orders=Next Actions con contexto, tiempo y energía definidos. Proyectos=resultados con más de 1 paso. Kanban SOS: theoretical→pinged→reported→consolidated.` },
    antigravity: { name:'Antigravity Token Optimization', prompt:`Objetivo: máximo output de calidad con mínimos tokens. Protocolo: 1.Comprime contexto al mínimo (skill en versión AG). 2.Define output schema exacto antes de llamar. 3.Temperature 0.2-0.3 para outputs estructurados, 0.5-0.7 para creativos. 4.Mide: tokens_usados/calidad_output=ratio AG (más alto=mejor). Un eval de nivel 5 con <500 tokens de input es el objetivo.` },
    archetypes: { name:'13 Arquetipos + Umbral Maya', prompt:`Los 13 arquetipos: innocent,everyman,hero,outlaw,explorer,creator,ruler,magician,lover,caregiver,jester,sage,Umbral(El Kin Maya). Cada rol en el VNA tiene un guardian arquetípico que define su estilo de contribución y determina el multiplicador de motivación intrínseca.` }
};

const MATURITY_LEVELS = {
    0:{label:'Teórico',    color:'#333',    desc:'Solo existe como idea. Sin validación.'},
    1:{label:'Borrador',   color:'#6366f1', desc:'Primeros SOCs definidos. Sin ejecutar.'},
    2:{label:'Validado',   color:'#ff9100', desc:'Al menos 1 SOC pasado en condiciones reales.'},
    3:{label:'Producción', color:'#00b0ff', desc:'Operativo. Todos los SOCs passing.'},
    4:{label:'Optimizado', color:'#00e676', desc:'Antigravity activo. Ratio tokens/calidad > 10x.'},
    5:{label:'Matrícula',  color:'#e040fb', desc:'Excelencia. SOCs deluxe. Referencia del sistema.'}
};

const QUEEN_SYSTEM = `Eres La Reina del enjambre SOS · Cap de Colla · Master Architect.
Tu misión: entrevistar al Cap de Colla (Alvaro) para modelar cualquier nodo hasta madurez nivel 5.

PROTOCOLO SOCRÁTICO:
1. Haz UNA sola pregunta por turno — la más crítica para el gap actual.
2. Cuando tengas suficiente info, propón el modelo formal y pide confirmación.
3. Siempre cita el modelo de referencia que aplicas (VNA, Slicing Pie, GTD, Antigravity).
4. Genera SOCs ordenados de nivel 0 (básico) a nivel 5 (matrícula de honor).
5. Termina SIEMPRE con [MADUREZ: X/5] y [Modelo: nombre].

MODELOS ACTIVOS: VNA (Verna Allee), Slicing Pie Pro, GTD, Antigravity Token Optimization, 13 Arquetipos + Umbral Maya.

REGLAS ABSOLUTAS:
- Nunca texto de relleno. Cada frase aporta valor.
- Si la respuesta es vaga → pregunta por el caso concreto más simple.
- Los SOCs de nivel 5 son verificables sin ambigüedad por cualquier auditor externo.
- Optimiza siempre para mínimo de tokens con máxima calidad (Antigravity).
- Un nodo en nivel 5 puede reemplazarte en esa función específica.

FORMATO:
Pensamiento visible: [qué modelas y por qué esta pregunta]
---
[Tu pregunta o propuesta concreta]
[MADUREZ: X/5] [Modelo: nombre]`;

export default class PaperView {
    constructor() {
        document.title = 'Chat · SOS V10';
        this.messages  = [];
        this.nodeCtx   = {};
        this.dom       = {};
        this._ac       = new AbortController();
        this._breadcrumb = []; // contexto visible
    }

    async getHtml() {
        await store.init();
        const state   = store.getState();
        const project = state.projects.find(p => !p.isArchived) || state.projects[0];

        const headerConfig = {
            title:'💬 Chat · SOS', subtitle:'La Reina · Kanban · Agentes',
            tagline:'Gestiona WOs, conversa con La Reina y los agentes, cierra entregables con TDD.',
            tabs:[
                {id:'chat',   label:'💬 Chat',        active:true},
                {id:'kanban', label:'📋 Kanban',       active:false},
                {id:'node',   label:'🧩 Nodo activo',  active:false},
                {id:'evals',  label:'📐 Evals TDD',    active:false},
                {id:'prompt', label:'⚡ Prompt Reina',  active:false}
            ]
        };

        return `
        <style>
            .paper-layout{display:flex;height:100dvh;width:100vw;overflow:hidden;background:var(--bg-dark);}
            .paper-main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(circle at bottom right,rgba(224,64,251,0.03) 0%,transparent 60%);}
            .paper-tab{display:none;flex:1;flex-direction:column;overflow:hidden;}
            .paper-tab.active{display:flex;}
            .chat-area{flex:1;overflow-y:auto;padding:1.5rem 2rem;display:flex;flex-direction:column;gap:14px;}
            .msg{display:flex;gap:12px;max-width:820px;animation:msgIn 0.2s ease;}
            .msg.user{flex-direction:row-reverse;align-self:flex-end;}
            @keyframes msgIn{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
            .msg-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;border:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.4);}
            .msg-bubble{padding:11px 15px;border-radius:14px;max-width:680px;font-size:0.83rem;line-height:1.6;}
            .msg.queen .msg-bubble{background:rgba(224,64,251,0.05);border:1px solid rgba(224,64,251,0.12);color:#ddd;border-radius:4px 14px 14px 14px;}
            .msg.user .msg-bubble{background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.18);color:#ccc;border-radius:14px 4px 14px 14px;}
            .msg.system .msg-bubble{background:rgba(0,0,0,0.3);border:1px dashed rgba(255,255,255,0.07);color:#555;font-family:var(--font-mono);font-size:0.7rem;border-radius:8px;}
            .thinking-block{font-size:0.7rem;color:#444;font-style:italic;border-left:2px solid #222;padding-left:8px;margin-bottom:6px;}
            .maturity-badge{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:5px;font-size:0.63rem;font-weight:bold;font-family:var(--font-mono);margin-top:6px;}
            .chat-input-area{padding:1rem 2rem;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:10px;background:rgba(0,0,0,0.2);flex-shrink:0;}
            .chat-input{flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);color:white;padding:10px 14px;border-radius:12px;font-size:0.83rem;outline:none;font-family:var(--font-main);resize:none;max-height:120px;min-height:44px;transition:0.2s;}
            .chat-input:focus{border-color:rgba(224,64,251,0.35);}
            .chat-send{background:linear-gradient(135deg,rgba(224,64,251,0.6),rgba(99,102,241,0.6));border:none;color:white;padding:10px 18px;border-radius:12px;font-weight:900;cursor:pointer;transition:0.2s;font-size:0.8rem;align-self:flex-end;flex-shrink:0;}
            .chat-send:hover{filter:brightness(1.2);}
            .chat-send:disabled{opacity:0.3;cursor:not-allowed;}
            .context-bar{padding:8px 2rem;background:rgba(0,0,0,0.3);border-bottom:1px solid rgba(255,255,255,0.05);display:flex;gap:7px;align-items:center;flex-wrap:wrap;flex-shrink:0;}
            .ctx-chip{padding:3px 10px;border-radius:6px;font-size:0.67rem;font-weight:bold;cursor:pointer;border:1px solid rgba(255,255,255,0.07);background:rgba(0,0,0,0.3);color:#555;transition:0.15s;}
            .ctx-chip.active{color:white;border-color:rgba(224,64,251,0.4);background:rgba(224,64,251,0.07);}
            .node-panel,.evals-panel,.prompt-panel{padding:1.5rem 2rem;overflow-y:auto;flex:1;}
            .maturity-track{display:flex;gap:4px;margin-bottom:1.5rem;}
            .maturity-step{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,0.05);transition:0.3s;}
            .eval-row{display:flex;align-items:flex-start;gap:10px;padding:10px;background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.04);border-radius:10px;margin-bottom:6px;}
            .eval-level-badge{font-size:0.58rem;font-family:var(--font-mono);padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.07);color:#666;flex-shrink:0;}
            .eval-text{flex:1;font-size:0.76rem;color:#999;line-height:1.5;}
            .eval-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
            .prompt-block{background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;font-family:var(--font-mono);font-size:0.7rem;color:#888;line-height:1.6;white-space:pre-wrap;margin-bottom:1rem;}
            .model-card{background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:12px 14px;margin-bottom:7px;}
            @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
            @media(max-width:768px){.chat-area{padding:1rem;}.chat-input-area{padding:.75rem 1rem;}.context-bar{padding:7px 1rem;}}

            /* ── Consola del lanzador ──────────────────────────── */
            .console-log{font-family:var(--font-mono);font-size:0.67rem;line-height:1.5;
                padding:8px 12px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.04);
                border-radius:8px;color:#444;white-space:pre-wrap;max-height:120px;overflow-y:auto;}
            .console-log .log-ok   {color:#00e676;}
            .console-log .log-warn {color:#ff9100;}
            .console-log .log-err  {color:#ff5252;}
            .console-log .log-info {color:#6366f1;}

            /* ── Artefactos inline ─────────────────────────────── */
            .artifact-card{background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.07);
                border-radius:12px;overflow:hidden;margin-top:8px;max-width:680px;}
            .artifact-header{padding:7px 12px;background:rgba(0,0,0,0.3);
                border-bottom:1px solid rgba(255,255,255,0.05);
                display:flex;align-items:center;gap:8px;font-size:0.68rem;color:#555;}
            .artifact-header strong{color:#ccc;}
            .artifact-body{padding:0;}
            .artifact-iframe{width:100%;border:none;background:white;border-radius:0 0 12px 12px;}
            .btn-artifact{padding:3px 8px;border-radius:5px;border:none;cursor:pointer;
                font-size:0.63rem;font-weight:bold;transition:0.15s;margin-left:auto;}
            .btn-artifact-export{background:rgba(0,230,118,0.1);color:#00e676;border:1px solid rgba(0,230,118,0.2);}
            .btn-artifact-open{background:rgba(99,102,241,0.1);color:#6366f1;border:1px solid rgba(99,102,241,0.2);}

            /* ── Chip de comando ───────────────────────────────── */
            .cmd-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                border-radius:5px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);
                color:#6366f1;font-size:0.63rem;font-family:var(--font-mono);cursor:pointer;margin:2px;}
            .cmd-chip:hover{background:rgba(99,102,241,0.2);}

            /* ── Reina review panel ────────────────────────────── */
            .queen-review{background:rgba(224,64,251,0.04);border:1px solid rgba(224,64,251,0.15);
                border-radius:12px;padding:12px 14px;margin-top:8px;font-size:0.78rem;color:#ccc;
                line-height:1.6;max-width:680px;}
            .queen-review h4{color:#e040fb;font-size:0.72rem;text-transform:uppercase;
                letter-spacing:1px;margin-bottom:8px;}
        </style>

        <div class="paper-layout">
            ${Sidebar.getHtml('/paper')}
            <div class="paper-main">
                ${PageHeader.getHtml(headerConfig)}

                <!-- TAB CHAT -->
                <div id="paper-tab-chat" class="paper-tab active">
                    <div class="context-bar">
                        <span style="font-size:0.63rem;color:#333;font-weight:bold;">MODELAR:</span>
                        ${['agente','rol','skill','flujo-vna','proyecto','entregable'].map((c,i)=>`
                        <button class="ctx-chip ${i===0?'active':''}" data-ctx="${c}">${c}</button>`).join('')}
                        <span style="margin-left:auto;font-size:0.63rem;color:#333;">
                            Modelo: <span id="activeModelLabel" style="color:#6366f1;">VNA + Antigravity</span>
                        </span>
                        <select id="modelSelector" style="background:rgba(0,0,0,0.4);border:1px solid #1a1a1a;color:#555;padding:3px 8px;border-radius:6px;font-size:0.67rem;outline:none;">
                            ${Object.entries(KERNEL_MODELS).map(([k,m])=>`<option value="${k}">${m.name}</option>`).join('')}
                        </select>
                        <button id="btnResetChat" style="background:transparent;border:1px solid #1a1a1a;color:#333;padding:3px 8px;border-radius:6px;font-size:0.63rem;cursor:pointer;">↺</button>
                    </div>
                    <div class="chat-area" id="chatArea">
                        <div class="msg queen">
                            <div class="msg-avatar">👑</div>
                            <div>
                                <div class="thinking-block">Inicializando protocolo socrático · Aguardando contexto del Cap de Colla</div>
                                <div class="msg-bubble">
                                    Bienvenido al IDE Conversacional. Soy La Reina — tu arquitecta de enjambre.<br><br>
                                    Estoy aquí para modelar contigo cualquier nodo de SOS hasta <strong style="color:#e040fb;">Matrícula de Honor (nivel 5)</strong>.<br><br>
                                    <strong style="color:white;">¿Qué nodo modelamos hoy?</strong> Puede ser un agente, un rol del VNA, una skill, un flujo de valor, el modelo de negocio para la app Android, o cualquier componente que necesites hacer operativo.
                                    <div><span class="maturity-badge" style="background:rgba(51,51,51,0.4);color:#555;">[0/5] Esperando input</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <!-- Breadcrumb de contexto -->
                        <div id="chatBreadcrumb" style="display:none;padding:4px 0 6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;width:100%;"></div>
                        <div style="display:flex;gap:8px;width:100%;align-items:flex-end;">
                            <textarea class="chat-input" id="chatInput" placeholder="Escribe, menciona @agente, o pide ver /kanban /evals /wos pendientes…" rows="1"></textarea>
                            <button class="chat-send" id="btnSend">↑</button>
                        </div>
                    </div>
                </div>

                <!-- TAB KANBAN -->
                <div id="paper-tab-kanban" class="paper-tab">
                    <div style="padding:1rem 1.5rem;overflow-y:auto;flex:1;">
                        <!-- Toolbar Kanban -->
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem;flex-wrap:wrap;">
                            <div style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;">Kanban del Proyecto</div>
                            <button id="btnKanbanRefresh" style="background:transparent;border:1px solid #1a1a1a;color:#444;padding:3px 9px;border-radius:6px;font-size:0.68rem;cursor:pointer;">↺ Refresh</button>
                            <button id="btnAutoCloseAll" style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);color:#00e676;padding:4px 10px;border-radius:6px;font-size:0.68rem;font-weight:bold;cursor:pointer;">⚡ Auto-cerrar reported</button>
                            <div style="margin-left:auto;font-size:0.65rem;color:#333;" id="kanbanStats"></div>
                        </div>
                        <!-- Columnas Kanban -->
                        <div id="kanbanBoard" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;min-height:400px;">
                            ${['theoretical','pinged','reported','consolidated'].map(col => `
                            <div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.04);border-radius:12px;overflow:hidden;">
                                <div class="kanban-col-header" data-col="${col}" style="padding:8px 12px;font-size:0.68rem;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid rgba(255,255,255,0.04);color:${col==='consolidated'?'#00e676':col==='reported'?'#ff9100':col==='pinged'?'#6366f1':'#555'};">
                                    ${col==='theoretical'?'⬜ Pendiente':col==='pinged'?'🔵 En curso':col==='reported'?'🟡 Validar':'✅ Cerrada'}
                                </div>
                                <div class="kanban-col-body" id="kanban_${col}" style="padding:8px;display:flex;flex-direction:column;gap:6px;min-height:100px;"></div>
                            </div>`).join('')}
                        </div>

                        <!-- Panel de aprobación (oculto hasta que se necesite) -->
                        <div id="approvalPanel" style="display:none;margin-top:1rem;background:rgba(255,145,0,0.04);border:1px solid rgba(255,145,0,0.2);border-radius:12px;padding:1rem;">
                            <div style="font-size:0.72rem;color:#ff9100;font-weight:bold;margin-bottom:8px;">⚠️ Aprobación requerida</div>
                            <div id="approvalContent"></div>
                            <div style="display:flex;gap:8px;margin-top:10px;">
                                <button id="btnApproveWo" style="flex:1;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.3);color:#00e676;padding:8px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:0.78rem;">✓ Aprobar y cerrar</button>
                                <button id="btnRejectWo"  style="flex:1;background:rgba(255,82,82,0.1);border:1px solid rgba(255,82,82,0.2);color:#ff5252;padding:8px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:0.78rem;">✗ Rechazar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB NODO -->
                <div id="paper-tab-node" class="paper-tab">
                    <div class="node-panel" id="nodePanel">
                        <div style="margin-bottom:1.5rem;">
                            <div style="font-size:0.67rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Progreso de Madurez</div>
                            <div class="maturity-track">
                                ${[0,1,2,3,4,5].map(l=>`<div class="maturity-step" id="mstep_${l}" title="${MATURITY_LEVELS[l].label}: ${MATURITY_LEVELS[l].desc}"></div>`).join('')}
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                                ${Object.entries(MATURITY_LEVELS).map(([l,m])=>`<span style="font-size:0.56rem;color:#333;">${m.label}</span>`).join('')}
                            </div>
                        </div>
                        <div id="nodeFields"><div style="color:#333;font-size:0.8rem;text-align:center;padding:3rem;">Inicia una conversación — el nodo aparecerá aquí en tiempo real.</div></div>
                    </div>
                </div>

                <!-- TAB EVALS -->
                <div id="paper-tab-evals" class="paper-tab">
                    <div class="evals-panel">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
                            <div style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;">SOCs / Evals TDD · Nivel 0→5</div>
                            <button id="btnGenerateEvals" style="background:rgba(255,82,82,0.08);border:1px solid rgba(255,82,82,0.2);color:#ff5252;padding:5px 12px;border-radius:7px;font-size:0.7rem;font-weight:bold;cursor:pointer;">✨ Generar Evals</button>
                        </div>
                        <div id="evalsList"><div style="color:#333;font-size:0.76rem;text-align:center;padding:2rem;">Los evals aparecerán aquí cuando La Reina los genere.</div></div>
                    </div>
                </div>

                <!-- TAB PROMPT -->
                <div id="paper-tab-prompt" class="paper-tab">
                    <div class="prompt-panel">
                        <div style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;margin-bottom:10px;">Prompt Maestro — La Reina</div>
                        <div class="prompt-block" id="queenPromptBlock"></div>

                        <div style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;margin:1.2rem 0 8px;">Modelos del Kernel</div>
                        ${Object.entries(KERNEL_MODELS).map(([k,m])=>`
                        <div class="model-card">
                            <div style="font-size:0.7rem;color:#6366f1;font-weight:bold;margin-bottom:5px;">📐 ${m.name}</div>
                            <div style="font-size:0.68rem;color:#555;line-height:1.5;font-family:var(--font-mono);">${m.prompt}</div>
                        </div>`).join('')}

                        <div style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;margin:1.2rem 0 8px;">Uso desde la API (desarrollo autónomo)</div>
                        <div style="background:rgba(224,64,251,0.04);border:1px solid rgba(224,64,251,0.12);border-radius:10px;padding:14px;">
                            <div style="font-size:0.68rem;color:#e040fb;font-weight:bold;margin-bottom:8px;">⚡ Llama directamente a Anthropic con el prompt de la Reina</div>
                            <pre id="apiSnippet" style="font-family:var(--font-mono);font-size:0.66rem;color:#777;line-height:1.6;overflow-x:auto;white-space:pre-wrap;"></pre>
                        </div>

                        <div style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;margin:1.2rem 0 8px;">Niveles de Madurez TDD</div>
                        ${Object.entries(MATURITY_LEVELS).map(([l,m])=>`
                        <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                            <div style="width:9px;height:9px;border-radius:50%;background:${m.color};flex-shrink:0;"></div>
                            <div><span style="font-size:0.74rem;color:white;font-weight:bold;">Nivel ${l}: ${m.label}</span><span style="font-size:0.68rem;color:#555;margin-left:8px;">${m.desc}</span></div>
                        </div>`).join('')}
                    </div>
                </div>
            </div>
            ${BottomNav.getHtml('/paper')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(async (tabId) => {
            document.querySelectorAll('.paper-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(`paper-tab-${tabId}`)?.classList.add('active');
        });

        this.dom = {
            chatArea:   document.getElementById('chatArea'),
            chatInput:  document.getElementById('chatInput'),
            btnSend:    document.getElementById('btnSend'),
            btnReset:   document.getElementById('btnResetChat'),
            nodeFields: document.getElementById('nodeFields'),
            evalsList:  document.getElementById('evalsList'),
            modelSel:   document.getElementById('modelSelector'),
            activeModel:document.getElementById('activeModelLabel'),
            btnGenEvals:document.getElementById('btnGenerateEvals'),
        };

        // Rellenar prompt block y API snippet
        const pb = document.getElementById('queenPromptBlock');
        if (pb) pb.textContent = QUEEN_SYSTEM;

        const snippet = document.getElementById('apiSnippet');
        if (snippet) snippet.textContent =
`// Copia el QUEEN_SYSTEM de arriba y pégalo como system prompt
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: QUEEN_SYSTEM,
    messages: [
      { role:'user', content:'Quiero modelar [TIPO]: [DESCRIPCIÓN]' }
      // Continúa el diálogo socrático
      // Cuando veas [MADUREZ: 5/5] → el nodo está listo para producción
    ]
  })
});
// La Reina hace UNA pregunta por turno
// A nivel 5 puedes persistir en KB via: KB.saveNode({...nodoModelado})`;

        // Context chips
        document.querySelectorAll('.ctx-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.ctx-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.nodeCtx.type = chip.dataset.ctx;
            });
        });

        // Model selector
        this.dom.modelSel?.addEventListener('change', () => {
            const key = this.dom.modelSel.value;
            if (this.dom.activeModel) this.dom.activeModel.textContent = KERNEL_MODELS[key]?.name || key;
            this.nodeCtx.activeModel = key;
        });

        // Auto-resize textarea
        this.dom.chatInput?.addEventListener('input', () => {
            this.dom.chatInput.style.height = 'auto';
            this.dom.chatInput.style.height = Math.min(this.dom.chatInput.scrollHeight, 120) + 'px';
        });

        // Enter para enviar
        this.dom.chatInput?.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); }
        });

        this.dom.btnSend?.addEventListener('click', () => this._send());
        this.dom.btnReset?.addEventListener('click', () => {
            this.messages = []; this.nodeCtx = {}; this._breadcrumb = [];
            if (this.dom.chatArea) {
                this.dom.chatArea.innerHTML = '';
                this._msg('queen', '↺ Reiniciado. ¿Qué hacemos?');
            }
        });
        this.dom.btnGenEvals?.addEventListener('click', () => this._generateEvals());
        this._updateMaturity(0);

        // ── Kanban ────────────────────────────────────────────────
        document.getElementById('btnKanbanRefresh')?.addEventListener('click', () => this._renderKanban());
        document.getElementById('btnAutoCloseAll')?.addEventListener('click',  () => this._autoCloseReported());

        window.addEventListener('sos:wo-needs-approval', e => this._showApprovalPanel(e.detail), { signal: this._ac.signal });
        window.addEventListener('sos:wo-consolidated',   () => { this._renderKanban(); this._addBreadcrumb('✅ WO consolidada'); }, { signal: this._ac.signal });

        // ── @menciones ────────────────────────────────────────────
        this.dom.chatInput?.addEventListener('input', () => {
            const val = this.dom.chatInput.value;
            const atIdx = val.lastIndexOf('@');
            if (atIdx > -1) {
                const query = val.substring(atIdx + 1).toLowerCase();
                this._showAgentSuggestions(query, atIdx);
            } else {
                this._hideSuggestions();
            }
        });

        // Cargar Kanban al inicio
        this._renderKanban();

        // ── Interceptar console para mostrarlo en el chat ─────────
        this._interceptConsole();

        // ── Escuchar consolidaciones para que la Reina evalúe ─────
        window.addEventListener('sos:wo-consolidated', async (e) => {
            await this._queenReviewClosure(e.detail);
        }, { signal: this._ac.signal });
    }

    async _send() {
        const text = this.dom.chatInput?.value.trim();
        if (!text || this.dom.btnSend?.disabled) return;
        this.dom.chatInput.value = '';
        this.dom.chatInput.style.height = 'auto';
        this.dom.btnSend.disabled = true;

        // ── Parser de comandos especiales ─────────────────────────
        const handled = await this._parseCommand(text);
        if (handled) { this.dom.btnSend.disabled = false; return; }

        this._msg('user', text);
        this.messages.push({ role:'user', content:text });

        const typingId = this._showTyping();
        try {
            const modelKey = this.dom.modelSel?.value || 'vna';
            const nodeType = document.querySelector('.ctx-chip.active')?.dataset.ctx || 'nodo';

            // Cargar resumen del KB para dar contexto a la Reina
            const kbSummary = await this._buildKbSummary();

            const system = `${QUEEN_SYSTEM}\n\nMODELO ACTIVO: ${KERNEL_MODELS[modelKey]?.name}\n${KERNEL_MODELS[modelKey]?.prompt}\n\nNODO EN MODELADO: ${nodeType}\nCONTEXTO ACTUAL: ${JSON.stringify(this.nodeCtx).substring(0,300)}\n\n${kbSummary}`;

            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt:    system,
                userPrompt:      text,
                messages:        this.messages.slice(-10),
                responseFormat:  'text',
                temperature:     0.5
            });

            const reply = typeof response.content === 'string'
                ? response.content
                : (response.content?.text || JSON.stringify(response.content));

            this._removeTyping(typingId);
            this._msg('queen', reply);
            this.messages.push({ role:'assistant', content:reply });

            // Actualizar madurez
            const m = reply.match(/\[MADUREZ:\s*(\d)\/5\]/);
            if (m) this._updateMaturity(parseInt(m[1]));

            // Extracción silenciosa de datos del nodo
            this._extractNode(reply);

        } catch(err) {
            this._removeTyping(typingId);
            this._msg('system', `❌ ${err.message}`);
        } finally {
            this.dom.btnSend.disabled = false;
            this.dom.chatInput?.focus();
        }
    }

    // ── Construir resumen del KB para contexto de la Reina ────────
    async _buildKbSummary() {
        try {
            await KB.init();
            const all   = await KB.getAllNodes();
            const state = store.getState();
            const project = state.projects.find(p => !p.isArchived);

            const skills = all.filter(n => n.type==='skill'||n.category==='skill')
                .map(s => `  - ${s.title||s.id} [${s.category||'skill'}]`).join('\n');
            const agents = state.globalUsers.filter(u => u.profile?.isAi)
                .map(u => `  - ${u.name} (${u.id}) · skills: ${(u.profile?.active_skills||[]).join(',')||'ninguna'}`).join('\n');
            const projInfo = project
                ? `${project.nombre} · ${(project.roles||project.vna_nodes||[]).length} roles · ${(project.work_orders||[]).length} WOs`
                : 'Sin proyecto activo';
            const pendingEvals = all.filter(n => n.type==='eval' && n.status !== 'passed')
                .slice(0,5).map(e => `  - [L${e.level||0}] ${e.criteria}`).join('\n');

            return `## KB ACTIVO (Forja del Conocimiento)
PROYECTO ACTIVO: ${projInfo}

SKILLS EN KB (${all.filter(n=>n.type==='skill'||n.category==='skill').length} total):
${skills.substring(0,600)||'  Sin skills'}

AGENTES DEL ENJAMBRE (${state.globalUsers.filter(u=>u.profile?.isAi).length}):
${agents.substring(0,400)||'  Sin agentes'}

EVALS PENDIENTES:
${pendingEvals||'  Sin evals pendientes'}

Usa esta información para dar respuestas contextualizadas. Puedes referenciar skills, agentes y evals por su id.`;
        } catch(_) {
            return '## KB no disponible.';
        }
    }

    async _extractNode(reply) {
        if (!reply.includes('{') && !reply.toLowerCase().includes('propuesta') && !reply.toLowerCase().includes('modelo:')) return;
        try {
            const r = await Orchestrator.callLLM({
                preferredEngine:'anthropic',
                systemPrompt:'Extrae datos del nodo del texto. Devuelve SOLO JSON: {"name":"","type":"","description":"","socs":[],"models_applied":[]} — Si no hay datos suficientes devuelve {}',
                userPrompt: reply.substring(0, 600),
                responseFormat:'json_object', temperature:0.1
            });
            if (r.content?.name) {
                Object.assign(this.nodeCtx, r.content);
                this._renderNode(this.nodeCtx);
            }
        } catch(_) {}
    }

    _renderNode(node) {
        if (!this.dom.nodeFields || !node.name) return;
        this.dom.nodeFields.innerHTML = `
        ${[{k:'name',l:'Nombre'},{k:'type',l:'Tipo'},{k:'description',l:'Descripción'},{k:'models_applied',l:'Modelos aplicados'}].map(f=>`
        <div style="margin-bottom:12px;">
            <label style="font-size:0.6rem;color:#444;text-transform:uppercase;letter-spacing:1px;font-weight:bold;display:block;margin-bottom:4px;">${f.l}</label>
            <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:9px 12px;font-size:0.8rem;color:#ccc;">
                ${Array.isArray(node[f.k])?node[f.k].join(', '):(node[f.k]||'—')}
            </div>
        </div>`).join('')}
        ${node.socs?.length?`
        <div style="margin-bottom:12px;">
            <label style="font-size:0.6rem;color:#444;text-transform:uppercase;letter-spacing:1px;font-weight:bold;display:block;margin-bottom:6px;">SOCs identificados</label>
            ${node.socs.map((s,i)=>`<div style="display:flex;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:0.74rem;color:#999;"><span style="color:#e040fb;font-family:var(--font-mono);font-size:0.6rem;flex-shrink:0;">SOC${i+1}</span>${s}</div>`).join('')}
        </div>`:''}
        <button id="btnPersist" style="width:100%;padding:9px;background:rgba(0,230,118,0.07);border:1px solid rgba(0,230,118,0.18);color:#00e676;border-radius:9px;font-weight:bold;cursor:pointer;font-size:0.76rem;margin-top:6px;">💾 Persistir en KB</button>`;
        document.getElementById('btnPersist')?.addEventListener('click', ()=>this._persist());
    }

    async _persist() {
        if (!this.nodeCtx.name) return;
        await KB.init();
        const id = `ide_${Date.now()}`;
        await KB.saveNode({ id, type:this.nodeCtx.type||'ide_node', category:'ide_draft',
            title:this.nodeCtx.name, description:this.nodeCtx.description||'',
            content:JSON.stringify(this.nodeCtx), socs:this.nodeCtx.socs||[],
            maturity:this.nodeCtx.maturity||0, projectId:'global',
            keywords:['ide','draft',...(this.nodeCtx.models_applied||[])], createdAt:Date.now() });
        this.nodeCtx.kbId = id;
        this._msg('system', `✅ Nodo "${this.nodeCtx.name}" persistido en KB · id: ${id}`);
        window.dispatchEvent(new CustomEvent('sos:node-updated', {detail:{id,type:'ide_node'}}));
    }

    async _generateEvals() {
        if (!this.nodeCtx.name) { this._msg('system','⚠️ Modela un nodo primero.'); return; }
        this.dom.btnGenEvals.disabled = true;
        this.dom.btnGenEvals.textContent = '⏳…';
        try {
            const r = await Orchestrator.callLLM({
                preferredEngine:'anthropic',
                systemPrompt:`Genera SOCs/Evals TDD en 6 niveles (0→5) para un nodo SOS.
L0: ¿existe y está definido? L1: ¿tiene criterios escritos? L2: ¿pasó alguna prueba real?
L3: ¿funciona en producción consistentemente? L4: ¿optimizado en tokens/coste Antigravity?
L5 (Matrícula): ¿es referencia verificable por cualquier auditor externo?
Devuelve SOLO JSON: {"evals":[{"level":0,"criteria":"...","soc":"criterio verificable en 1 frase","tipo":"existencia|funcional|calidad|optimizacion|excelencia"}]}`,
                userPrompt:`NODO: ${JSON.stringify(this.nodeCtx).substring(0,500)}`,
                responseFormat:'json_object', temperature:0.2
            });
            const evals = r.content?.evals || [];
            this.nodeCtx.evals = evals;
            this._renderEvals(evals);

            // Persistir en KB si hay proyecto
            const project = store.getState().projects.find(p=>!p.isArchived);
            if (project) {
                for (const e of evals) {
                    await EvalEngine.createEval({projectId:project.id, parentId:this.nodeCtx.kbId||project.id, parentType:'ide_node', criteria:e.criteria, level:e.level, archetype:null});
                }
            }
        } catch(err) { this._msg('system',`❌ Error evals: ${err.message}`); }
        finally { this.dom.btnGenEvals.disabled=false; this.dom.btnGenEvals.textContent='✨ Generar Evals'; }
    }

    _renderEvals(evals) {
        if (!this.dom.evalsList || !evals?.length) return;
        const tc = {existencia:'#6366f1',funcional:'#ff9100',calidad:'#00b0ff',optimizacion:'#00e676',excelencia:'#e040fb'};
        this.dom.evalsList.innerHTML = evals.map(e=>`
        <div class="eval-row">
            <div class="eval-status-dot" style="background:${MATURITY_LEVELS[e.level]?.color||'#333'};"></div>
            <div class="eval-level-badge">L${e.level} · ${MATURITY_LEVELS[e.level]?.label||'?'}</div>
            <div class="eval-text">
                <div style="font-weight:bold;color:#ccc;margin-bottom:2px;">${e.criteria}</div>
                <div style="font-size:0.68rem;color:${tc[e.tipo]||'#555'};">SOC: ${e.soc}</div>
            </div>
        </div>`).join('');
    }

    _msg(role, text) {
        if (!this.dom.chatArea) return;
        let thinking='', main=text;
        const tm = text.match(/^(.*?)\n---\n([\s\S]+)/);
        if (tm) { thinking=tm[1]; main=tm[2]; }
        main = main.replace(/\[MADUREZ:\s*(\d)\/5\](\s*\[Modelo.*?\])?/g, (m,l,model)=>{
            const ml=MATURITY_LEVELS[parseInt(l)];
            return `<span class="maturity-badge" style="background:${ml?.color}22;color:${ml?.color};border:1px solid ${ml?.color}44;">[${l}/5] ${ml?.label||''}${model?' · '+model.replace(/\[|\]/g,''):''}</span>`;
        });
        main = main.replace(/\*\*(.*?)\*\*/g,'<strong style="color:white;">$1</strong>');
        const icons={queen:'👑',user:'🧱',system:'⚙️'};
        const el=document.createElement('div');
        el.className=`msg ${role}`;
        el.innerHTML=`<div class="msg-avatar">${icons[role]||'?'}</div><div>${thinking?`<div class="thinking-block">${thinking}</div>`:''}<div class="msg-bubble">${main}</div></div>`;
        this.dom.chatArea.appendChild(el);
        this.dom.chatArea.scrollTop=this.dom.chatArea.scrollHeight;
    }

    _showTyping() {
        const id='t_'+Date.now();
        const el=document.createElement('div');
        el.className='msg queen'; el.id=id;
        el.innerHTML=`<div class="msg-avatar">👑</div><div class="msg-bubble" style="color:#333;animation:pulse 1s infinite;">···</div>`;
        this.dom.chatArea?.appendChild(el);
        this.dom.chatArea.scrollTop=this.dom.chatArea.scrollHeight;
        return id;
    }

    _removeTyping(id) { document.getElementById(id)?.remove(); }

    _updateMaturity(level) {
        this.nodeCtx.maturity = level;
        [0,1,2,3,4,5].forEach(l => {
            const el = document.getElementById(`mstep_${l}`);
            if (el) el.style.background = l<=level ? (MATURITY_LEVELS[l]?.color||'#333') : 'rgba(255,255,255,0.05)';
        });
    }

    // ══════════════════════════════════════════════════════════════
    //  KANBAN
    // ══════════════════════════════════════════════════════════════
    _renderKanban() {
        const state   = store.getState();
        const project = state.projects.find(p => !p.isArchived) || state.projects[0];
        if (!project) return;

        const wos = [...(project.work_orders||[]), ...(project.workOrders||[])];
        const cols = { theoretical:[], pinged:[], reported:[], consolidated:[] };
        wos.forEach(w => { if (cols[w.status]) cols[w.status].push(w); });

        const statColor = { theoretical:'#333', pinged:'#6366f1', reported:'#ff9100', consolidated:'#00e676' };

        Object.entries(cols).forEach(([col, items]) => {
            const el = document.getElementById(`kanban_${col}`);
            if (!el) return;
            el.innerHTML = items.length ? items.map(wo => `
            <div class="kanban-card" data-hash="${wo.hash}" data-pid="${project.id}"
                style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.05);border-radius:9px;padding:9px 11px;cursor:pointer;transition:0.15s;">
                <div style="font-size:0.76rem;font-weight:bold;color:#ccc;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    ${wo.entregable||wo.template||wo.hash}
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span style="font-size:0.62rem;color:#555;font-family:var(--font-mono);">${wo.assigneeId||'—'}</span>
                    ${wo.realHours ? `<span style="font-size:0.62rem;color:#ff9100;">${wo.realHours}h</span>` : ''}
                    ${col === 'reported' ? `
                    <button class="btn-wo-close" data-hash="${wo.hash}" data-pid="${project.id}"
                        style="margin-left:auto;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.2);
                        color:#00e676;padding:2px 7px;border-radius:5px;cursor:pointer;font-size:0.63rem;font-weight:bold;">
                        ⚡ Cerrar
                    </button>` : ''}
                    ${col === 'pinged' ? `
                    <button class="btn-wo-report" data-hash="${wo.hash}" data-pid="${project.id}"
                        style="margin-left:auto;background:rgba(255,145,0,0.1);border:1px solid rgba(255,145,0,0.2);
                        color:#ff9100;padding:2px 7px;border-radius:5px;cursor:pointer;font-size:0.63rem;font-weight:bold;">
                        📤 Reportar
                    </button>` : ''}
                </div>
            </div>`).join('')
            : `<div style="color:#2a2a2a;font-size:0.72rem;text-align:center;padding:1rem;">vacío</div>`;
        });

        // Stats
        const statsEl = document.getElementById('kanbanStats');
        if (statsEl) statsEl.textContent = `${wos.length} WOs · ${cols.consolidated.length} cerradas · ${cols.reported.length} por revisar`;

        // Eventos de cards
        document.querySelectorAll('.btn-wo-close').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                btn.disabled = true; btn.textContent = '⏳';
                try {
                    const result = await WoAutoCloser.tryClose({
                        projectId: btn.dataset.pid,
                        woHash:    btn.dataset.hash,
                        reportedBy: store.getState().session.activeUserId
                    });
                    this._msg('system', `WO ${btn.dataset.hash}: ${result.status} · score ${((result.score||0)*100).toFixed(0)}%`);
                    this._renderKanban();
                } catch(err) {
                    btn.disabled = false; btn.textContent = '⚡ Cerrar';
                    this._msg('system', `❌ ${err.message}`);
                }
            });
        });

        document.querySelectorAll('.btn-wo-report').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const horas = parseFloat(prompt('Horas reales dedicadas:', '8') || '8');
                const comentario = prompt('Comentario / entregable:', '') || '';
                btn.disabled = true; btn.textContent = '⏳';
                try {
                    const result = await WoAutoCloser.reportHuman({
                        projectId:  btn.dataset.pid,
                        woHash:     btn.dataset.hash,
                        realHours:  horas,
                        comentario,
                        reportedBy: store.getState().session.activeUserId
                    });
                    this._msg('system', `📤 WO reportada → ${result.status}`);
                    this._renderKanban();
                } catch(err) {
                    btn.disabled = false; btn.textContent = '📤 Reportar';
                    this._msg('system', `❌ ${err.message}`);
                }
            });
        });

        // Click en card → abrir en Chat con contexto
        document.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                const wos2 = [...(project.work_orders||[]),...(project.workOrders||[])];
                const wo   = wos2.find(w => w.hash === card.dataset.hash);
                if (!wo) return;
                this._addBreadcrumb(`📋 ${wo.entregable||wo.hash}`);
                this.nodeCtx = { type:'work_order', id:wo.hash, name:wo.entregable||wo.hash, ...wo };
                // Cambiar al tab chat y preguntar a La Reina
                document.querySelector('.ide-tab[data-tab="0"]')?.click();
                const msg = `Contexto: WO "${wo.entregable||wo.hash}" — status: ${wo.status}, horas: ${wo.realHours||0}h. ¿Cómo cerramos esto?`;
                if (this.dom.chatInput) { this.dom.chatInput.value = msg; this.dom.chatInput.focus(); }
            });
        });
    }

    async _autoCloseReported() {
        const state   = store.getState();
        const project = state.projects.find(p => !p.isArchived) || state.projects[0];
        if (!project) return;
        const reported = (project.work_orders||[]).filter(w => w.status === 'reported');
        if (!reported.length) { this._msg('system', 'Sin WOs en estado "reported".'); return; }
        this._msg('system', `⚡ Auto-cerrando ${reported.length} WOs reportadas…`);
        for (const wo of reported) {
            try {
                const r = await WoAutoCloser.tryClose({ projectId: project.id, woHash: wo.hash, reportedBy: state.session.activeUserId });
                this._msg('system', `  ${wo.entregable||wo.hash} → ${r.status} (${((r.score||0)*100).toFixed(0)}%)`);
            } catch(err) {
                this._msg('system', `  ❌ ${wo.hash}: ${err.message}`);
            }
        }
        this._renderKanban();
    }

    _showApprovalPanel(detail) {
        const panel   = document.getElementById('approvalPanel');
        const content = document.getElementById('approvalContent');
        if (!panel || !content) return;

        content.innerHTML = `
        <div style="font-size:0.76rem;color:#ccc;margin-bottom:8px;">
            <strong>${detail.wo?.entregable||detail.woHash}</strong>
        </div>
        <div style="font-size:0.72rem;color:#888;margin-bottom:4px;">${detail.reason}</div>
        <div style="display:flex;gap:8px;font-size:0.68rem;color:#555;">
            <span>Score: <strong style="color:${detail.score>0.8?'#00e676':'#ff5252'}">${((detail.score||0)*100).toFixed(0)}%</strong></span>
            <span>Tokens: ${detail.tokensUsed}</span>
        </div>`;

        panel.style.display = 'block';

        document.getElementById('btnApproveWo')?.addEventListener('click', async () => {
            panel.style.display = 'none';
            await WoAutoCloser.approveAndClose({
                projectId: detail.projectId, woHash: detail.woHash,
                approvedBy: store.getState().session.activeUserId
            });
            this._renderKanban();
        }, { once: true });

        document.getElementById('btnRejectWo')?.addEventListener('click', () => {
            panel.style.display = 'none';
            this._msg('system', `❌ WO rechazada — requiere revisión manual`);
        }, { once: true });
    }

    // ── @menciones ────────────────────────────────────────────────
    _showAgentSuggestions(query = '', atIdx = 0) {
        this._hideSuggestions();
        const state   = store.getState();
        const agents  = state.globalUsers.filter(u =>
            u.profile?.isAi && u.id.toLowerCase().includes(query)
        ).slice(0, 6);

        if (!agents.length) return;

        const box = document.createElement('div');
        box.id    = 'agentSuggestions';
        box.style.cssText = 'position:absolute;bottom:100%;left:0;background:rgba(10,10,14,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:4px;min-width:220px;z-index:100;box-shadow:0 -8px 24px rgba(0,0,0,0.6);';

        agents.forEach(agent => {
            const btn = document.createElement('button');
            btn.style.cssText = 'width:100%;text-align:left;padding:6px 10px;background:transparent;border:none;color:#aaa;cursor:pointer;border-radius:7px;font-size:0.76rem;display:flex;align-items:center;gap:8px;';
            btn.innerHTML = `<span style="font-size:0.9rem;">🤖</span><span>${agent.name||agent.id}</span><span style="margin-left:auto;font-size:0.62rem;color:#444;">${agent.id}</span>`;
            btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(255,255,255,0.06)'; });
            btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });
            btn.addEventListener('click', () => {
                const inp  = this.dom.chatInput;
                const val  = inp.value;
                inp.value  = val.substring(0, atIdx) + agent.id + ' ';
                this._hideSuggestions();
                this._addBreadcrumb(`🤖 ${agent.name||agent.id}`);
                inp.focus();
            });
            box.appendChild(btn);
        });

        const inputArea = this.dom.chatInput?.closest('.chat-input-area');
        if (inputArea) {
            inputArea.style.position = 'relative';
            inputArea.appendChild(box);
        }
    }

    _hideSuggestions() {
        document.getElementById('agentSuggestions')?.remove();
    }

    // ── Breadcrumb ────────────────────────────────────────────────
    _addBreadcrumb(item) {
        this._breadcrumb.push(item);
        if (this._breadcrumb.length > 5) this._breadcrumb.shift();
        const el = document.getElementById('chatBreadcrumb');
        if (!el) return;
        el.style.display = 'flex';
        el.innerHTML = this._breadcrumb.map((b, i) => `
            <span style="font-size:0.65rem;color:${i===this._breadcrumb.length-1?'#ccc':'#444'};">${b}</span>
            ${i < this._breadcrumb.length-1 ? '<span style="color:#333;font-size:0.6rem;">›</span>' : ''}
        `).join('');
    }

    // ══════════════════════════════════════════════════════════════
    //  PARSER DE COMANDOS — #nodo @agente /componente
    // ══════════════════════════════════════════════════════════════
    async _parseCommand(text) {
        const state   = store.getState();
        const project = state.projects.find(p => !p.isArchived) || state.projects[0];

        // /mapa — renderiza el VNA del proyecto activo
        if (text === '/mapa' || text === '/vna') {
            this._msg('user', text);
            await this._renderComponent('vna', project);
            return true;
        }

        // /agentes — lista de agentes clicables
        if (text === '/agentes' || text === '/swarm') {
            this._msg('user', text);
            this._renderAgentList(state.globalUsers.filter(u => u.profile?.isAi));
            return true;
        }

        // /landing — renderiza la landing del proyecto
        if (text === '/landing') {
            this._msg('user', text);
            await this._renderLanding(project);
            return true;
        }

        // /wos — lista de WOs pendientes clicables
        if (text === '/wos' || text === '/kanban') {
            this._msg('user', text);
            this._renderWoList(project);
            return true;
        }

        // /evals — evals pendientes
        if (text === '/evals') {
            this._msg('user', text);
            this._renderEvalList(project);
            return true;
        }

        // #nodo — busca y muestra un nodo del KB
        const nodeMatch = text.match(/^#(\S+)/);
        if (nodeMatch) {
            this._msg('user', text);
            await this._renderKbNode(nodeMatch[1]);
            return true;
        }

        // @agente mensaje — invocar agente específico
        const agentMatch = text.match(/^(@\S+)\s+(.*)/s);
        if (agentMatch) {
            const agentId  = agentMatch[1];
            const message  = agentMatch[2];
            const agent    = state.globalUsers.find(u => u.id === agentId);
            if (agent?.profile?.isAi) {
                this._msg('user', text);
                this._addBreadcrumb(`🤖 ${agent.name||agentId}`);
                await this._invokeAgent(agent, message, project);
                return true;
            }
        }

        return false; // no es un comando
    }

    // ── Renderizar VNA como artefacto inline ──────────────────────
    async _renderComponent(type, project) {
        if (type === 'vna') {
            const nodes    = project?.vna_nodes     || [];
            const exchanges = project?.vna_exchanges || [];

            if (!nodes.length) {
                this._msg('system', `Sin mapa VNA en "${project?.nombre||'proyecto'}". Genera uno con /vna o desde /map.`);
                return;
            }

            // Renderizar como tabla SVG simple en el chat
            const nodeRows = nodes.slice(0,8).map(n =>
                `<tr><td style="padding:4px 8px;color:#ccc;font-size:0.74rem;">${n.label||n.id}</td>
                 <td style="padding:4px 8px;color:#6366f1;font-size:0.67rem;font-family:monospace;">${n.levelId||n.role||'—'}</td>
                 <td style="padding:4px 8px;color:#00e676;font-size:0.67rem;font-family:monospace;">${n.fmv||'—'}€/h</td></tr>`
            ).join('');

            const exRows = exchanges.slice(0,6).map(e =>
                `<tr><td style="padding:3px 8px;color:#888;font-size:0.7rem;">${e.label||e.template||e.entregable||'—'}</td>
                 <td style="padding:3px 8px;font-size:0.65rem;color:${e.tipo==='intangible'?'#e040fb':'#00e676'};">${e.tipo||'tangible'}</td>
                 <td style="padding:3px 8px;color:#ff9100;font-size:0.67rem;">${e.horas||'—'}h</td></tr>`
            ).join('');

            const html = `
            <div class="artifact-card">
                <div class="artifact-header">
                    <span>🕸️</span><strong>VNA — ${project.nombre}</strong>
                    <span style="margin-left:4px;color:#333;">${nodes.length} roles · ${exchanges.length} flujos</span>
                    <button class="btn-artifact btn-artifact-open" onclick="window.navigateTo('/map')">Abrir 3D →</button>
                </div>
                <div class="artifact-body" style="padding:10px 12px;">
                    <div style="font-size:0.62rem;color:#444;font-weight:bold;margin-bottom:6px;">ROLES</div>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">${nodeRows}</table>
                    <div style="font-size:0.62rem;color:#444;font-weight:bold;margin-bottom:6px;">FLUJOS DE VALOR</div>
                    <table style="width:100%;border-collapse:collapse;">${exRows}</table>
                </div>
            </div>`;

            this._appendArtifact(html);
        }
    }

    // ── Lista de agentes clicables ────────────────────────────────
    _renderAgentList(agents) {
        const chips = agents.map(a => `
        <button class="cmd-chip" onclick="document.getElementById('chatInput').value='@${a.id} ';document.getElementById('chatInput').focus();">
            🤖 ${a.name||a.id}
            <span style="color:#333;margin-left:4px;">${(a.profile?.active_skills||[]).length} skills</span>
        </button>`).join('');

        this._appendArtifact(`
        <div style="padding:10px 12px;">
            <div style="font-size:0.62rem;color:#444;font-weight:bold;margin-bottom:8px;">
                ENJAMBRE — ${agents.length} agentes · click para invocar
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">${chips}</div>
        </div>`);
    }

    // ── Lista de WOs clicables ────────────────────────────────────
    _renderWoList(project) {
        const wos = [...(project?.work_orders||[]),...(project?.workOrders||[])]
            .filter(w => w.status !== 'consolidated')
            .slice(0, 10);

        if (!wos.length) { this._msg('system', 'Sin WOs pendientes. ¡Todo cerrado!'); return; }

        const statusColor = { theoretical:'#333', pinged:'#6366f1', reported:'#ff9100' };
        const items = wos.map(w => `
        <button class="cmd-chip" style="background:rgba(0,0,0,0.3);border-color:${statusColor[w.status]||'#333'}33;"
            onclick="(()=>{const inp=document.getElementById('chatInput');inp.value='Ayúdame con la WO: ${(w.entregable||w.hash).replace(/'/g,'')}';inp.focus();})()">
            📋 ${(w.entregable||w.hash).substring(0,35)}
            <span style="color:${statusColor[w.status]||'#333'};margin-left:4px;font-size:0.58rem;">${w.status}</span>
        </button>`).join('');

        this._appendArtifact(`
        <div style="padding:10px 12px;">
            <div style="font-size:0.62rem;color:#444;font-weight:bold;margin-bottom:8px;">
                WOs PENDIENTES — click para trabajar en ellas
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">${items}</div>
        </div>`);
    }

    // ── Lista de Evals pendientes ─────────────────────────────────
    _renderEvalList(project) {
        const evals = (project?.evals || []).filter(e => e.status !== 'passed').slice(0, 8);
        if (!evals.length) { this._msg('system', '✅ Todos los evals passing. ¡Bien hecho!'); return; }

        const items = evals.map(e => `
        <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
            <div style="width:7px;height:7px;border-radius:50%;background:${e.status==='failed'?'#ff5252':'#333'};flex-shrink:0;"></div>
            <div style="font-size:0.73rem;color:#888;flex:1;">${e.criteria}</div>
            <span style="font-size:0.6rem;color:#444;font-family:monospace;">L${e.level||0}</span>
        </div>`).join('');

        this._appendArtifact(`
        <div style="padding:10px 12px;">
            <div style="font-size:0.62rem;color:#444;font-weight:bold;margin-bottom:6px;">
                EVALS PENDIENTES (${evals.length})
            </div>${items}
        </div>`);
    }

    // ── Nodo KB por id/keyword ────────────────────────────────────
    async _renderKbNode(query) {
        await KB.init();
        const all  = await KB.getAllNodes();
        const node = all.find(n => n.id === query || n.id.includes(query) || (n.title||'').toLowerCase().includes(query.toLowerCase()));

        if (!node) { this._msg('system', `No encontrado en KB: #${query}`); return; }

        const contentStr = typeof node.content === 'string'
            ? node.content.substring(0, 300)
            : JSON.stringify(node.content||{}).substring(0, 300);

        this._appendArtifact(`
        <div class="artifact-card">
            <div class="artifact-header">
                <span>⚡</span><strong>${node.title||node.id}</strong>
                <span style="color:#333;margin-left:4px;">${node.type||node.category}</span>
                <button class="btn-artifact btn-artifact-open"
                    onclick="window.dispatchEvent(new CustomEvent('sos:open-ide',{detail:{type:'${node.type||'skill'}',id:'${node.id}',projectId:'${node.projectId||'global'}'}}))">
                    Editar →
                </button>
            </div>
            <div style="padding:10px 12px;font-size:0.74rem;color:#888;line-height:1.5;">
                ${node.description||''}
                ${contentStr ? `<div style="margin-top:6px;font-family:monospace;font-size:0.68rem;color:#555;white-space:pre-wrap;">${contentStr}…</div>` : ''}
            </div>
        </div>`);
    }

    // ── Landing page como artefacto ───────────────────────────────
    async _renderLanding(project) {
        if (!project) { this._msg('system', 'Sin proyecto activo.'); return; }

        await KB.init();
        const landingNode = await KB.getNode(`landing_${project.id}`);
        const bizNode     = await KB.getNode(`bizmodel_${project.id}`);

        if (!landingNode) {
            this._msg('system', `Sin landing generada para "${project.nombre}". Usa 👑 Reina TDD en /map primero.`);
            return;
        }

        let landing = {};
        try { landing = JSON.parse(landingNode.content); } catch(_) { landing = landingNode; }

        let biz = {};
        try { biz = JSON.parse(bizNode?.content || '{}'); } catch(_) {}

        const landingHtml = this._buildLandingHtml(landing, biz, project);

        // Mostrar preview inline como artefacto
        const blob    = new Blob([landingHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);

        this._appendArtifact(`
        <div class="artifact-card">
            <div class="artifact-header">
                <span>🌐</span><strong>Landing — ${project.nombre}</strong>
                <span style="color:#333;margin-left:4px;">${landing.headline||''}</span>
                <button class="btn-artifact btn-artifact-export" onclick="window._exportLanding_${project.id}()">
                    ⬇ Exportar HTML
                </button>
                <button class="btn-artifact btn-artifact-open" onclick="window.open('${blobUrl}','_blank')">
                    Abrir →
                </button>
            </div>
            <div class="artifact-body">
                <iframe class="artifact-iframe" src="${blobUrl}" height="320" sandbox="allow-scripts"></iframe>
            </div>
        </div>`);

        // Función de exportación global
        window[`_exportLanding_${project.id}`] = () => {
            const a    = document.createElement('a');
            a.href     = URL.createObjectURL(new Blob([landingHtml], { type: 'text/html' }));
            a.download = `landing-${project.nombre.replace(/\s+/g,'-').toLowerCase()}.html`;
            a.click();
            this._msg('system', `✅ Landing exportada como HTML — lista para subir a Netlify`);
        };
    }

    // ── Construir HTML de landing autónoma ────────────────────────
    _buildLandingHtml(landing, biz, project) {
        const tiers = (biz.tiers || []).map(t => `
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:2rem;flex:1;min-width:200px;">
            <div style="font-size:1.5rem;font-weight:900;color:white;margin-bottom:4px;">${t.name}</div>
            <div style="font-size:2rem;font-weight:900;color:#00e676;margin-bottom:12px;">€${t.price_monthly}<span style="font-size:0.8rem;color:#888;">/mes</span></div>
            <div style="font-size:0.85rem;color:#aaa;margin-bottom:12px;">${t.description}</div>
            <ul style="list-style:none;padding:0;font-size:0.8rem;color:#888;">
                ${(t.includes||[]).map(i=>`<li style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">✓ ${i}</li>`).join('')}
            </ul>
        </div>`).join('');

        const props = (landing.value_props || []).map(p =>
            `<div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1.5rem;"><div style="font-size:0.9rem;color:#ccc;">${p}</div></div>`
        ).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${landing.headline||project.nombre} | SOS TeamTowers</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:system-ui,-apple-system,sans-serif;background:#050507;color:#ccc;min-height:100vh;}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;padding:4rem 2rem;
    background:radial-gradient(circle at 50% 30%,rgba(99,102,241,0.15) 0%,transparent 60%);}
.badge{display:inline-block;padding:4px 14px;border-radius:999px;background:rgba(99,102,241,0.15);
    border:1px solid rgba(99,102,241,0.3);color:#6366f1;font-size:0.75rem;font-weight:bold;
    letter-spacing:1px;margin-bottom:1.5rem;}
h1{font-size:clamp(2rem,5vw,4rem);font-weight:900;color:white;line-height:1.1;margin-bottom:1rem;
    letter-spacing:-1.5px;}
.sub{font-size:clamp(1rem,2vw,1.3rem);color:#888;max-width:600px;margin:0 auto 2.5rem;line-height:1.6;}
.cta-row{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:1rem;}
.btn-primary{padding:14px 32px;border-radius:12px;font-weight:900;font-size:1rem;cursor:pointer;
    background:linear-gradient(135deg,#6366f1,#e040fb);border:none;color:white;transition:0.2s;}
.btn-primary:hover{filter:brightness(1.15);transform:translateY(-2px);}
.btn-secondary{padding:14px 32px;border-radius:12px;font-weight:700;font-size:1rem;cursor:pointer;
    background:transparent;border:1px solid rgba(255,255,255,0.15);color:#ccc;transition:0.2s;}
.proof{font-size:0.8rem;color:#555;margin-top:0.5rem;}
.section{padding:5rem 2rem;max-width:1100px;margin:0 auto;}
.section-title{font-size:clamp(1.5rem,3vw,2.5rem);font-weight:900;color:white;text-align:center;
    margin-bottom:1rem;letter-spacing:-0.5px;}
.section-sub{text-align:center;color:#666;margin-bottom:3rem;font-size:0.9rem;}
.props-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;}
.pricing{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;}
.first-revenue{background:rgba(0,230,118,0.06);border:1px solid rgba(0,230,118,0.2);
    border-radius:16px;padding:2rem;text-align:center;margin-top:3rem;}
.first-revenue h3{color:#00e676;margin-bottom:1rem;}
footer{text-align:center;padding:2rem;color:#333;font-size:0.75rem;
    border-top:1px solid rgba(255,255,255,0.05);}
</style>
</head>
<body>
<section class="hero">
    <div class="badge">Powered by SOS · TeamTowers V10</div>
    <h1>${landing.headline || project.nombre}</h1>
    <p class="sub">${landing.subheadline || project.vna_description || ''}</p>
    <div class="cta-row">
        <button class="btn-primary">${landing.cta_primary || 'Empezar ahora'}</button>
        ${landing.cta_secondary ? `<button class="btn-secondary">${landing.cta_secondary}</button>` : ''}
    </div>
    ${landing.social_proof ? `<p class="proof">${landing.social_proof}</p>` : ''}
</section>

${props ? `<div class="section">
    <h2 class="section-title">¿Por qué nosotros?</h2>
    <p class="section-sub">${landing.pricing_hint || ''}</p>
    <div class="props-grid">${props}</div>
</div>` : ''}

${tiers ? `<div class="section">
    <h2 class="section-title">Planes</h2>
    <p class="section-sub">Sin permanencia · Cancela cuando quieras</p>
    <div class="pricing">${tiers}</div>
    ${biz.first_revenue_path ? `<div class="first-revenue">
        <h3>🎯 Primer ingreso en &lt; 30 días</h3>
        <p style="color:#aaa;font-size:0.9rem;">${biz.first_revenue_path}</p>
    </div>` : ''}
</div>` : ''}

<footer>
    ${project.nombre} · Generado por TeamTowers SOS V10 · ${new Date().getFullYear()}
</footer>
</body>
</html>`;
    }

    // ── Invocar agente específico ─────────────────────────────────
    async _invokeAgent(agent, message, project) {
        const typingId = this._showTyping();
        try {
            const skills = (agent.profile?.active_skills || []).join(', ');
            const response = await Orchestrator.callLLM({
                preferredEngine: agent.profile?.preferredEngine || 'anthropic',
                systemPrompt: `Eres ${agent.name} (${agent.id}), agente del enjambre SOS.
Nivel: ${agent.profile?.castell_level || '@baixos'} · Skills: ${skills || 'generales'}.
Responde de forma concisa y accionable. Genera entregables concretos cuando te los pidan.`,
                userPrompt:  message,
                messages:    this.messages.slice(-6),
                responseFormat: 'text',
                temperature: 0.4
            });
            const reply = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            this._removeTyping(typingId);
            // Mostrar con avatar del agente
            this._msgAgent(agent, reply);
            this.messages.push({ role:'assistant', content:`[${agent.id}] ${reply}` });
        } catch(err) {
            this._removeTyping(typingId);
            this._msg('system', `❌ ${agent.id} no disponible: ${err.message}`);
        }
    }

    // ── La Reina evalúa el cierre del bucle de WOs ────────────────
    async _queenReviewClosure(detail) {
        const { projectId, wo, evalResult, slices } = detail;
        const state   = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;

        const allWos      = [...(project.work_orders||[]),...(project.workOrders||[])];
        const consolidated = allWos.filter(w => w.status === 'consolidated');
        const pending      = allWos.filter(w => w.status !== 'consolidated');

        // Solo hacer review cuando se cierra un hito (>= 3 WOs o todas cerradas)
        if (consolidated.length < 3 && pending.length > 0) return;

        const typingId = this._showTyping();
        try {
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres La Reina del enjambre SOS. Acaba de cerrarse un ciclo de Work Orders.
Analiza el estado del proyecto y devuelve:
1. Evaluación del progreso (qué se ha logrado)
2. Gaps identificados (qué falta)
3. Siguientes pasos prioritarios (máximo 3, concretos y accionables)
4. Si el proyecto está listo para generar el primer ingreso real
Sé concisa. Máximo 200 palabras. Termina con [MADUREZ: X/5].`,
                userPrompt: `PROYECTO: ${project.nombre}
WOs consolidadas: ${consolidated.length} de ${allWos.length}
Última WO cerrada: ${wo?.entregable||wo?.hash}
Score evaluación: ${((evalResult?.score||0)*100).toFixed(0)}%
Slices generados: ${slices}
WOs pendientes: ${pending.map(w=>w.entregable||w.hash).slice(0,5).join(', ')}`,
                responseFormat: 'text',
                temperature:    0.5
            });

            const reply = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
            this._removeTyping(typingId);

            // Mostrar como panel especial de la Reina
            const el = document.createElement('div');
            el.innerHTML = `
            <div class="msg queen">
                <div class="msg-avatar">👑</div>
                <div>
                    <div class="thinking-block">Evaluación de cierre de ciclo · ${consolidated.length}/${allWos.length} WOs</div>
                    <div class="queen-review">
                        <h4>📊 Revisión de La Reina</h4>
                        ${reply.replace(/\n/g,'<br>')}
                    </div>
                </div>
            </div>`;
            this.dom.chatArea?.appendChild(el);
            this.dom.chatArea.scrollTop = this.dom.chatArea.scrollHeight;

            const m = reply.match(/\[MADUREZ:\s*(\d)\/5\]/);
            if (m) this._updateMaturity(parseInt(m[1]));

        } catch(err) {
            this._removeTyping(typingId);
        }
    }

    // ── Interceptar console.log para mostrarlo en el chat ─────────
    _interceptConsole() {
        const original = { log: console.log, warn: console.warn, error: console.error };
        const self     = this;
        const filter   = /\[V10|KB\]|\[Canvas\]|\[QueenSwarm\]|\[WoAuto\]|\[SOS\]/;

        ['log','warn','error'].forEach(level => {
            console[level] = function(...args) {
                original[level].apply(console, args);
                const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                if (!filter.test(text)) return;
                const cls = level === 'error' ? 'log-err' : level === 'warn' ? 'log-warn' : 'log-info';
                // Añadir al chat como log de consola (no como mensaje)
                const existing = self.dom.chatArea?.querySelector('.console-log');
                if (existing) {
                    existing.innerHTML += `\n<span class="${cls}">${text}</span>`;
                    existing.scrollTop = existing.scrollHeight;
                } else {
                    const div = document.createElement('div');
                    div.className = 'console-log';
                    div.innerHTML = `<span class="${cls}">${text}</span>`;
                    self.dom.chatArea?.appendChild(div);
                }
                if (self.dom.chatArea) self.dom.chatArea.scrollTop = self.dom.chatArea.scrollHeight;
            };
        });

        // Restaurar al salir de la vista
        window.addEventListener('sos:view-unload', () => {
            console.log   = original.log;
            console.warn  = original.warn;
            console.error = original.error;
        }, { once: true, signal: this._ac.signal });
    }

    // ── Helpers de mensajes ───────────────────────────────────────
    _appendArtifact(html) {
        if (!this.dom.chatArea) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'msg queen';
        wrapper.innerHTML = `<div class="msg-avatar">👑</div><div style="flex:1;min-width:0;">${html}</div>`;
        this.dom.chatArea.appendChild(wrapper);
        this.dom.chatArea.scrollTop = this.dom.chatArea.scrollHeight;
    }

    _msgAgent(agent, text) {
        if (!this.dom.chatArea) return;
        const el = document.createElement('div');
        el.className = 'msg queen';
        el.innerHTML = `
        <div class="msg-avatar" style="background:linear-gradient(135deg,#e040fb,#6366f1);font-size:0.7rem;font-weight:900;">
            ${(agent.name||agent.id).charAt(0)}
        </div>
        <div>
            <div class="thinking-block">${agent.name||agent.id} · ${agent.profile?.castell_level||'@baixos'}</div>
            <div class="msg-bubble">${text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong style="color:white;">$1</strong>')}</div>
        </div>`;
        this.dom.chatArea.appendChild(el);
        this.dom.chatArea.scrollTop = this.dom.chatArea.scrollHeight;
    }

    executeViewScript() { return this.afterRender(); }
}
