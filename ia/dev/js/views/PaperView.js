// =============================================================================
// TEAMTOWERS SOS V10 — PAPER VIEW
// Ruta: /ia/dev/js/views/PaperView.js
// Omni-Paper: Chat IDE · GTD Panel · Contexto VNA · Artifacts polimórficos
// =============================================================================

import { store }        from '../core/store.js';
import { KB }           from '../core/kb.js';
import { Sidebar }      from '../components/Sidebar.js';
import { BottomNav }    from '../components/BottomNav.js';
import { PageHeader }   from '../components/PageHeader.js';
import { Orchestrator } from '../core/Orchestrator.js';

export default class PaperView {

    constructor() {
        document.title    = 'Omni-Paper | TeamTowers V10';
        this.activeProjectId = null;
        this.activeTx        = null;   // WO activa en modo GTD
        this.chatHistory     = [];     // Swarm Memory
        this.attachedNodes   = [];     // RAG manual
        this.currentChatId   = null;
        this.pomodoroSecs    = 0;
        this.pomodoroRunning = false;
        this.pomodoroInterval = null;
        this.sandbox         = null;   // artifact activo
        this.dom             = {};

        const params = new URLSearchParams(window.location.search);
        this._initHash = params.get('hash') || null;
    }

    // ══════════════════════════════════════════════════════════════
    //  getHtml
    // ══════════════════════════════════════════════════════════════
    async getHtml() {
        await store.init();
        const state        = store.getState();
        this.activeProjectId = localStorage.getItem('tt_active_project')
            || state.projects.at(-1)?.id || null;
        const project = state.projects.find(p => p.id === this.activeProjectId);

        if (!project) {
            return `<div class="app-layout">${Sidebar.getHtml('/paper')}
                <main class="workspace" style="justify-content:center;align-items:center;display:flex;">
                    <div class="glass-panel" style="text-align:center;max-width:400px;padding:3rem;">
                        <div style="font-size:4rem;margin-bottom:1rem;">📝</div>
                        <h2 style="color:white;margin:0 0 1rem;">Sin ecosistema</h2>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Crear ecosistema</a>
                    </div>
                </main></div>`;
        }

        // Agentes IA disponibles
        const aiUsers = state.globalUsers.filter(u => u.profile?.isAi);
        const agentOpts = aiUsers.map(u =>
            `<option value="${u.id}">🤖 ${u.name}</option>`
        ).join('') || `<option value="node-claude-sonnet-v10">🤖 Claude Sonnet V10</option>`;

        // WOs del proyecto para el selector
        const wos = project.work_orders || [];
        const woOpts = wos.filter(w => w.status !== 'theoretical').map(w => {
            const flow = (project.vna_flows || []).find(f => f.id === w.flowId) || {};
            const label = (flow.entregable || flow.template || w.comentario || w.hash || 'WO').substring(0, 45);
            return `<option value="${w.hash}">[WO] ${label}</option>`;
        }).join('');

        const headerConfig = {
            title:   'Omni-Paper',
            subtitle: project.nombre,
            tagline: 'Chat IDE · GTD · Artifacts polimórficos · Swarm Memory',
            tabs:    [],
            magicActions: [
                { id: 'new_skill',  label: 'Forjar Skill desde chat', icon: '⚡', tokens: 150 },
                { id: 'new_agent',  label: 'Diseñar Agente Vertical', icon: '🤖', tokens: 200 },
                { id: 'summarize',  label: 'Resumir sesión en KB',    icon: '📚', tokens: 80  }
            ]
        };

        return `
        <style>
            /* ── Layout ──────────────────────────────────────────── */
            .paper-layout { display:flex; flex:1; min-height:0; overflow:hidden; }

            /* ── Panel izquierdo: contexto VNA ───────────────────── */
            .paper-left { width:240px; min-width:200px; display:flex; flex-direction:column;
                border-right:1px solid var(--glass-border); background:rgba(5,5,8,0.97);
                overflow-y:auto; flex-shrink:0; }
            .pl-section { padding:0.75rem 1rem; border-bottom:1px solid rgba(255,255,255,0.04); }
            .pl-title { font-size:0.62rem; font-weight:900; color:#444; text-transform:uppercase;
                letter-spacing:1.5px; margin-bottom:0.5rem; }
            .pl-item { display:flex; align-items:center; gap:7px; padding:5px 8px; border-radius:7px;
                font-size:0.75rem; color:#888; cursor:pointer; transition:0.15s; border:1px solid transparent; }
            .pl-item:hover { background:rgba(255,255,255,0.03); color:#ccc; }
            .pl-item.active { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.2); color:var(--accent-indigo); }
            .pl-badge { font-size:0.58rem; padding:1px 5px; border-radius:3px; font-family:var(--font-mono);
                font-weight:bold; margin-left:auto; }
            .badge-tang { background:rgba(0,230,118,0.08); color:var(--accent-green); border:1px solid rgba(0,230,118,0.15); }
            .badge-int  { background:rgba(224,64,251,0.08); color:var(--accent-purple); border:1px solid rgba(224,64,251,0.15); }
            .badge-auto { background:rgba(99,102,241,0.08); color:var(--accent-indigo); border:1px solid rgba(99,102,241,0.15); }

            /* ── Panel central: Chat IDE ─────────────────────────── */
            .paper-center { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#050508; }
            .paper-breadcrumb { display:flex; align-items:center; gap:8px; padding:8px 14px;
                border-bottom:1px solid rgba(255,255,255,0.04); background:rgba(0,0,0,0.3); flex-shrink:0; }
            .bc-sel { background:rgba(0,0,0,0.5); border:1px solid #222; color:white; padding:5px 9px;
                border-radius:7px; font-size:0.78rem; outline:none; cursor:pointer; font-family:var(--font-main); }
            .bc-sel:focus { border-color:var(--accent-indigo); }

            /* Modo IDE (chat + sandbox) */
            .ide-split { flex:1; display:grid; grid-template-columns:400px 1fr; overflow:hidden; }
            .chat-panel { display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.04); overflow:hidden; }
            .chat-agent-bar { padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.04);
                background:rgba(0,0,0,0.3); flex-shrink:0; }
            .chat-agent-bar select { width:100%; background:rgba(0,0,0,0.5); border:1px solid rgba(224,64,251,0.3);
                color:var(--accent-purple); padding:7px 9px; border-radius:8px; font-weight:bold;
                outline:none; cursor:pointer; font-size:0.8rem; font-family:var(--font-main); }
            .chat-history { flex:1; padding:12px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }
            .msg-bubble { max-width:92%; padding:10px 13px; border-radius:10px; font-size:0.86rem;
                line-height:1.5; white-space:pre-wrap; word-break:break-word; }
            .msg-user { background:rgba(0,176,255,0.08); border:1px solid rgba(0,176,255,0.18);
                color:white; align-self:flex-end; border-bottom-right-radius:2px; }
            .msg-ai   { background:rgba(224,64,251,0.04); border:1px solid rgba(224,64,251,0.15);
                color:#ccc; align-self:flex-start; border-bottom-left-radius:2px; }
            .msg-artifact { border-color:var(--accent-orange)!important; color:var(--accent-orange)!important;
                cursor:pointer; }
            .msg-artifact:hover { background:rgba(255,145,0,0.06)!important; }
            .msg-telem { font-size:0.65rem; color:#555; font-family:var(--font-mono); margin-top:7px;
                padding-top:6px; border-top:1px dashed rgba(255,255,255,0.06); display:flex;
                justify-content:space-between; }
            .btn-inject-pow { display:block; width:100%; margin-top:8px; padding:5px; background:rgba(0,230,118,0.06);
                border:1px solid rgba(0,230,118,0.2); color:var(--accent-green); border-radius:5px;
                cursor:pointer; font-size:0.7rem; font-weight:bold; font-family:var(--font-mono); }
            .btn-inject-pow:hover { background:rgba(0,230,118,0.12); }

            .chat-input-area { padding:10px 12px; border-top:1px solid rgba(255,255,255,0.04);
                background:rgba(0,0,0,0.4); flex-shrink:0; display:flex; flex-direction:column; gap:7px; }
            .attach-tray { display:flex; flex-wrap:wrap; gap:4px; }
            .attach-pill { display:flex; align-items:center; gap:5px; background:rgba(0,176,255,0.07);
                border:1px solid rgba(0,176,255,0.2); color:var(--accent-blue); padding:2px 8px;
                border-radius:10px; font-size:0.68rem; font-family:var(--font-mono); font-weight:bold; }
            .attach-pill button { background:none; border:none; color:inherit; cursor:pointer; font-size:0.9rem; padding:0; line-height:1; }
            .sel-attach { background:rgba(0,0,0,0.4); border:1px solid #222; color:#777;
                padding:6px 9px; border-radius:7px; font-size:0.75rem; outline:none; cursor:pointer;
                font-family:var(--font-main); width:100%; }
            .sel-attach:focus { border-color:var(--accent-blue); color:white; }
            .chat-textarea { width:100%; background:#050508; border:1px solid #2a2a2a; color:white;
                border-radius:8px; padding:9px 11px; font-family:var(--font-main); font-size:0.86rem;
                resize:none; outline:none; transition:0.2s; box-sizing:border-box; min-height:70px; }
            .chat-textarea:focus { border-color:rgba(0,176,255,0.4); }
            .btn-send { background:linear-gradient(135deg,rgba(0,176,255,0.7),rgba(224,64,251,0.7));
                border:none; color:white; padding:9px 14px; border-radius:8px; font-weight:900;
                cursor:pointer; transition:0.2s; font-size:0.82rem; }
            .btn-send:hover:not(:disabled) { filter:brightness(1.2); transform:translateY(-1px); }
            .btn-send:disabled { opacity:0.35; cursor:not-allowed; }

            /* Sandbox */
            .sandbox-panel { background:repeating-linear-gradient(45deg,rgba(255,255,255,0.005) 0px,
                rgba(255,255,255,0.005) 8px, transparent 8px, transparent 16px), #050508;
                display:flex; flex-direction:column; overflow:hidden; }
            .sandbox-toolbar { padding:8px 12px; border-bottom:1px solid rgba(255,255,255,0.04);
                display:flex; gap:7px; align-items:center; background:rgba(0,0,0,0.4); flex-shrink:0; }
            .sb-tab { padding:4px 10px; border-radius:6px; font-size:0.72rem; font-weight:bold;
                cursor:pointer; border:1px solid rgba(255,255,255,0.06); color:#666; background:transparent; }
            .sb-tab.active { border-color:var(--accent-orange); color:var(--accent-orange); background:rgba(255,145,0,0.06); }
            .sandbox-frame { flex:1; overflow:auto; display:flex; align-items:center; justify-content:center; }
            .sandbox-empty { color:#333; text-align:center; font-family:var(--font-mono); font-size:0.85rem; }
            .artifact-code { width:100%; height:100%; background:#050508; border:none; color:#00e676;
                font-family:var(--font-mono); font-size:0.82rem; padding:1rem; outline:none; resize:none; }
            .artifact-doc  { padding:2rem; color:#ccc; font-size:0.95rem; line-height:1.7;
                max-width:720px; width:100%; }
            .artifact-doc h1,h2,h3 { color:white; }

            /* GTD Panel */
            .gtd-panel { flex:1; display:flex; flex-direction:column; overflow-y:auto; padding:1.25rem; gap:1rem; }
            .gtd-hidden { display:none!important; }
            .pomodoro-box { background:linear-gradient(145deg,rgba(20,20,25,0.9),rgba(10,10,15,0.95));
                border:1px solid var(--accent-orange); border-radius:18px; padding:1.5rem;
                text-align:center; transition:0.4s; }
            .pomodoro-box.running { border-color:var(--accent-green);
                box-shadow:0 0 30px rgba(0,230,118,0.15); animation:breathe 4s infinite; }
            .pomo-timer { font-size:3.5rem; font-weight:900; font-family:var(--font-mono); color:white;
                line-height:1; margin:0.5rem 0; font-variant-numeric:tabular-nums; }
            .pomodoro-box.running .pomo-timer { color:var(--accent-green); }
            .pomo-btns { display:flex; justify-content:center; gap:12px; margin-top:0.75rem; }
            .pomo-btn { width:50px; height:50px; border-radius:50%; background:rgba(0,0,0,0.5);
                border:1px solid #444; color:white; font-size:1.3rem; cursor:pointer; transition:0.2s;
                display:flex; align-items:center; justify-content:center; }
            .pomo-btn:hover { transform:scale(1.1); }
            .pomo-btn.play  { border-color:var(--accent-green); color:var(--accent-green); }
            .pomo-btn.pause { border-color:var(--accent-orange); color:var(--accent-orange); }

            .wo-context-box { background:rgba(10,10,15,0.9); border:1px solid #333;
                border-left:4px solid var(--accent-green); border-radius:12px; padding:1.25rem; }
            .wo-ctx-title { font-size:1.1rem; font-weight:900; color:white; margin-bottom:6px; }
            .wo-ctx-desc  { font-size:0.82rem; color:#888; line-height:1.5; font-style:italic; }

            .soc-list { display:flex; flex-direction:column; gap:5px; margin-top:0.75rem; }
            .soc-item { display:flex; align-items:flex-start; gap:8px; padding:7px 10px;
                background:rgba(255,255,255,0.02); border:1px solid #2a2a2a; border-radius:7px; }
            .soc-item input[type="checkbox"] { accent-color:var(--accent-green); margin-top:2px; flex-shrink:0; }
            .soc-item span { color:#ccc; font-size:0.82rem; line-height:1.4; }

            .pow-fields { display:grid; grid-template-columns:1fr auto; gap:10px; margin-top:0.75rem; }
            .pow-input { background:rgba(0,0,0,0.5); border:1px solid #2a2a2a; color:white;
                padding:9px 11px; border-radius:8px; font-family:var(--font-main); font-size:0.85rem;
                outline:none; transition:0.2s; width:100%; box-sizing:border-box; }
            .pow-input:focus { border-color:var(--accent-green); }
            .pow-hours { width:90px; font-family:var(--font-mono); font-weight:bold; color:var(--accent-orange); }

            .semantic-editor-wrap { background:rgba(10,10,15,0.8); border:1px solid #2a2a2a;
                border-radius:12px; padding:1rem; transition:0.2s; }
            .semantic-editor-wrap:focus-within { border-color:rgba(224,64,251,0.3); }
            .semantic-editor { min-height:160px; color:#e0e0e0; font-family:'Georgia',serif;
                font-size:0.95rem; line-height:1.6; outline:none; }
            .semantic-editor:empty::before { content:attr(data-placeholder); color:#333; font-style:italic; }

            .gtd-actions { position:sticky; bottom:0; background:rgba(5,5,8,0.97);
                border-top:1px solid rgba(255,255,255,0.04); padding:10px 0; display:flex; gap:8px; }
            .btn-draft { background:rgba(255,171,64,0.08); border:1px solid rgba(255,171,64,0.25);
                color:var(--accent-orange); padding:9px 16px; border-radius:9px; font-weight:bold;
                cursor:pointer; transition:0.2s; font-size:0.82rem; }
            .btn-seal  { background:linear-gradient(135deg,var(--accent-green),#00b341); color:black;
                padding:9px 20px; border-radius:9px; font-weight:900; cursor:pointer; transition:0.2s;
                border:none; font-size:0.82rem; }
            .btn-seal:hover  { filter:brightness(1.1); transform:translateY(-1px); }
            .btn-draft:hover { background:rgba(255,171,64,0.15); }

            /* ── Panel derecho: contexto ──────────────────────────── */
            .paper-right { width:220px; min-width:180px; display:flex; flex-direction:column;
                border-left:1px solid var(--glass-border); background:rgba(5,5,8,0.97);
                overflow-y:auto; flex-shrink:0; }

            @keyframes breathe { 0%,100%{box-shadow:0 0 15px rgba(0,230,118,0.1);}
                                  50%{box-shadow:0 0 30px rgba(0,230,118,0.25);} }
            @media (max-width:1200px) { .paper-right { display:none; } }
            @media (max-width:900px)  { .paper-left  { display:none; } .ide-split { grid-template-columns:1fr; } }
            @media (max-width:768px)  { .sandbox-panel { display:none; } }
        </style>

        <div class="app-layout" style="flex-direction:column;overflow:hidden;">
            ${Sidebar.getHtml('/paper')}
            <div style="display:flex;flex:1;min-height:0;flex-direction:column;overflow:hidden;">
                <div style="padding:1rem 1.5rem 0;flex-shrink:0;">
                    ${PageHeader.getHtml(headerConfig)}
                </div>

                <div class="paper-layout">

                    <!-- PANEL IZQUIERDO: nodos VNA del proyecto -->
                    <aside class="paper-left" id="paperLeft">
                        <div class="pl-section">
                            <div class="pl-title">Ecosistema</div>
                            <select id="selProject" class="bc-sel" style="width:100%;margin-top:4px;">
                                ${state.projects.map(p => `<option value="${p.id}" ${p.id === this.activeProjectId ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="pl-section">
                            <div class="pl-title">Work Orders activas</div>
                            <div id="leftWoList"></div>
                        </div>
                        <div class="pl-section">
                            <div class="pl-title">Skills del proyecto</div>
                            <div id="leftSkillList"></div>
                        </div>
                        <div class="pl-section">
                            <div class="pl-title">Nodos VNA</div>
                            <div id="leftVnaList"></div>
                        </div>
                    </aside>

                    <!-- PANEL CENTRAL: Chat IDE + GTD -->
                    <main class="paper-center">
                        <div class="paper-breadcrumb">
                            <span style="color:#555;font-size:0.8rem;">📝 Modo:</span>
                            <select id="modeSelector" class="bc-sel">
                                <option value="ide">🚀 Chat IDE (Sandbox)</option>
                                ${woOpts ? `<optgroup label="🎯 GTD — Work Orders">${woOpts}</optgroup>` : ''}
                            </select>
                        </div>

                        <!-- IDE MODE -->
                        <div id="ideMode" class="ide-split">
                            <!-- Chat -->
                            <div class="chat-panel">
                                <div class="chat-agent-bar">
                                    <select id="selAgent">${agentOpts}</select>
                                </div>
                                <div class="chat-history" id="chatHistory"></div>
                                <div class="chat-input-area">
                                    <div id="attachTray" class="attach-tray"></div>
                                    <select id="selAttach" class="sel-attach">
                                        <option value="">📎 Adjuntar nodo del Córtex…</option>
                                    </select>
                                    <textarea id="chatInput" class="chat-textarea" rows="3"
                                        placeholder="Escribe tu directiva al Swarm…"></textarea>
                                    <button id="btnSend" class="btn-send">🚀 Enviar Directiva</button>
                                </div>
                            </div>
                            <!-- Sandbox -->
                            <div class="sandbox-panel">
                                <div class="sandbox-toolbar">
                                    <span style="font-size:0.7rem;color:#555;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Sandbox</span>
                                    <button class="sb-tab active" data-tab="preview" id="sbTabPreview">Vista</button>
                                    <button class="sb-tab" data-tab="code"    id="sbTabCode">Código</button>
                                    <button class="sb-tab" data-tab="doc"     id="sbTabDoc">Doc</button>
                                    <div style="flex:1;"></div>
                                    <button id="btnSbSave" style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.2);color:var(--accent-green);padding:4px 10px;border-radius:6px;cursor:pointer;font-size:0.68rem;font-weight:bold;">💾 Guardar en KB</button>
                                </div>
                                <div class="sandbox-frame" id="sandboxFrame">
                                    <div class="sandbox-empty">
                                        <div style="font-size:3rem;margin-bottom:0.75rem;opacity:0.3;">⚡</div>
                                        Esperando artifact del Swarm…
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- GTD MODE -->
                        <div id="gtdMode" class="gtd-hidden">
                            <div class="gtd-panel" id="gtdPanel">

                                <!-- Pomodoro -->
                                <div class="pomodoro-box" id="pomoBox">
                                    <div style="font-size:0.72rem;color:#555;text-transform:uppercase;letter-spacing:2px;font-weight:bold;">Tiempo de Foco</div>
                                    <div class="pomo-timer" id="pomoTimer">00:00:00</div>
                                    <div style="font-size:0.65rem;color:#444;font-family:var(--font-mono);">Se inyectará en Slicing Pie al sellar</div>
                                    <div class="pomo-btns">
                                        <button class="pomo-btn play"  id="btnPomoPlay">▶</button>
                                        <button class="pomo-btn pause" id="btnPomoPause" style="display:none;">⏸</button>
                                        <button class="pomo-btn" id="btnPomoReset" style="font-size:0.9rem;">↺</button>
                                    </div>
                                </div>

                                <!-- Contexto WO -->
                                <div class="wo-context-box" id="woContextBox">
                                    <div class="wo-ctx-title" id="woCtxTitle">Work Order</div>
                                    <div style="font-size:0.7rem;color:var(--accent-indigo);font-family:var(--font-mono);margin-bottom:6px;" id="woCtxMeta"></div>
                                    <div class="wo-ctx-desc" id="woCtxDesc"></div>
                                    <div class="soc-list" id="socList"></div>
                                    <div class="pow-fields">
                                        <input type="text" id="inpPowLink" class="pow-input" placeholder="🔗 Enlace al entregable…">
                                        <input type="number" id="inpPowHours" class="pow-input pow-hours" step="0.01" placeholder="h">
                                    </div>
                                </div>

                                <!-- Editor PoW -->
                                <div class="semantic-editor-wrap">
                                    <div style="font-size:0.68rem;color:#555;text-transform:uppercase;font-weight:bold;letter-spacing:1px;margin-bottom:7px;">📝 Proof of Work</div>
                                    <div id="powEditor" class="semantic-editor" contenteditable="true"
                                        data-placeholder="Documenta aquí tu Proof of Work…"></div>
                                </div>

                                <div class="gtd-actions">
                                    <button id="btnSaveDraft" class="btn-draft">💾 Guardar borrador</button>
                                    <button id="btnSealPow"   class="btn-seal">🚀 Sellar Proof of Work</button>
                                </div>

                            </div>
                        </div>
                    </main>

                    <!-- PANEL DERECHO: artefactos recientes + agentes -->
                    <aside class="paper-right">
                        <div class="pl-section">
                            <div class="pl-title">Agentes activos</div>
                            <div id="rightAgents"></div>
                        </div>
                        <div class="pl-section">
                            <div class="pl-title">Artifacts recientes</div>
                            <div id="rightArtifacts"></div>
                        </div>
                        <div class="pl-section">
                            <div class="pl-title">Ledger IA (sesión)</div>
                            <div id="rightTelem" style="font-size:0.72rem;color:#555;font-family:var(--font-mono);">
                                <div>Tokens: <span id="rtTokens">0</span></div>
                                <div>Coste: <span id="rtCost">$0.000</span></div>
                                <div>Slices: <span id="rtSlices">0.000</span></div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
            ${BottomNav.getHtml('/paper')}
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════
    //  afterRender
    // ══════════════════════════════════════════════════════════════
    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(null, async (actionId) => {
            if (actionId === 'new_skill')  this._sendDirective('Forja una skill nueva basada en la conversación hasta ahora. Usa el formato entity_mutation.');
            if (actionId === 'new_agent')  this._sendDirective('Diseña un agente vertical para este ecosistema. Devuelve SosAgent JSON-LD.');
            if (actionId === 'summarize')  this._sendDirective('Resume los puntos clave de esta sesión en bullet points. Guárdalos como referencia en KB.');
        });

        const state   = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        this.dom = {
            selProject:   document.getElementById('selProject'),
            modeSelector: document.getElementById('modeSelector'),
            ideMode:      document.getElementById('ideMode'),
            gtdMode:      document.getElementById('gtdMode'),
            history:      document.getElementById('chatHistory'),
            chatInput:    document.getElementById('chatInput'),
            btnSend:      document.getElementById('btnSend'),
            selAgent:     document.getElementById('selAgent'),
            selAttach:    document.getElementById('selAttach'),
            attachTray:   document.getElementById('attachTray'),
            sandboxFrame: document.getElementById('sandboxFrame'),
            btnSbSave:    document.getElementById('btnSbSave'),
            pomoBox:      document.getElementById('pomoBox'),
            pomoTimer:    document.getElementById('pomoTimer'),
            btnPomoPlay:  document.getElementById('btnPomoPlay'),
            btnPomoPause: document.getElementById('btnPomoPause'),
            btnPomoReset: document.getElementById('btnPomoReset'),
            woCtxTitle:   document.getElementById('woCtxTitle'),
            woCtxMeta:    document.getElementById('woCtxMeta'),
            woCtxDesc:    document.getElementById('woCtxDesc'),
            socList:      document.getElementById('socList'),
            inpPowLink:   document.getElementById('inpPowLink'),
            inpPowHours:  document.getElementById('inpPowHours'),
            powEditor:    document.getElementById('powEditor'),
            btnSaveDraft: document.getElementById('btnSaveDraft'),
            btnSealPow:   document.getElementById('btnSealPow'),
            leftWoList:   document.getElementById('leftWoList'),
            leftSkillList:document.getElementById('leftSkillList'),
            leftVnaList:  document.getElementById('leftVnaList'),
            rightAgents:  document.getElementById('rightAgents'),
            rightArtifacts:document.getElementById('rightArtifacts'),
            rtTokens:     document.getElementById('rtTokens'),
            rtCost:       document.getElementById('rtCost'),
            rtSlices:     document.getElementById('rtSlices')
        };

        // Cargar KB para adjuntos
        await KB.init();
        const allNodes = await KB.getAllNodes();
        const attachables = allNodes.filter(n => ['reference','skill','script','prompt_a2a'].includes(n.type));
        this.dom.selAttach.innerHTML = '<option value="">📎 Adjuntar nodo del Córtex…</option>'
            + attachables.map(n => `<option value="${n.id}">[${n.type.toUpperCase()}] ${n.title || n.id}</option>`).join('');

        // Poblar paneles contextuales
        this._renderLeftPanel(project);
        this._renderRightPanel(state);

        // Cargar historial de chat
        await this._loadChatHistory(`chat_${this.activeProjectId}_ide`);

        // ── Eventos ───────────────────────────────────────────────
        this.dom.selProject.addEventListener('change', async e => {
            this.activeProjectId = e.target.value;
            localStorage.setItem('tt_active_project', this.activeProjectId);
            const p2 = store.getState().projects.find(p => p.id === this.activeProjectId);
            this._renderLeftPanel(p2);
            await this._loadChatHistory(`chat_${this.activeProjectId}_ide`);
        });

        this.dom.modeSelector.addEventListener('change', async e => {
            const val = e.target.value;
            if (val === 'ide') {
                this.activeTx = null;
                this._switchMode('ide');
                await this._loadChatHistory(`chat_${this.activeProjectId}_ide`);
            } else {
                const p2 = store.getState().projects.find(p => p.id === this.activeProjectId);
                this.activeTx = (p2.work_orders || []).find(w => w.hash === val);
                if (this.activeTx) {
                    this._switchMode('gtd');
                    this._loadGtdContext(this.activeTx, p2);
                    await this._loadChatHistory(`chat_${this.activeProjectId}_wo_${val}`);
                }
            }
        });

        this.dom.selAttach.addEventListener('change', e => {
            const id = e.target.value;
            if (!id) return;
            const node = allNodes.find(n => n.id === id);
            if (node && !this.attachedNodes.find(n => n.id === id)) {
                this.attachedNodes.push(node);
                this._renderAttachTray();
            }
            this.dom.selAttach.value = '';
        });

        this.dom.selAgent.addEventListener('change', () => {
            const name = this.dom.selAgent.options[this.dom.selAgent.selectedIndex].text;
            this._addMsg(`🔄 Enrutando a <b>${name}</b>. Contexto preservado.`, 'ai', null, true);
        });

        this.dom.btnSend.addEventListener('click', () => this._sendMessage());
        this.dom.chatInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendMessage(); }
        });

        // Sandbox tabs
        document.querySelectorAll('.sb-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sb-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._renderSandboxTab(btn.dataset.tab);
            });
        });

        this.dom.btnSbSave?.addEventListener('click', () => this._saveArtifactToKb());

        // Pomodoro
        this.dom.btnPomoPlay.addEventListener('click',  () => this._pomoStart());
        this.dom.btnPomoPause.addEventListener('click', () => this._pomoStop());
        this.dom.btnPomoReset.addEventListener('click', () => { this._pomoStop(); this.pomodoroSecs = 0; this._pomoDisplay(); });

        // GTD actions
        this.dom.btnSaveDraft.addEventListener('click', () => this._saveDraft());
        this.dom.btnSealPow.addEventListener('click',   () => this._sealPoW());

        // Evento global: inyectar evidencia desde chat en panel GTD
        window.addEventListener('paper:inject-evidence', e => {
            if (!this.activeTx) return;
            const { text, artifact } = e.detail;
            let html = `<blockquote><b>Evidencia IA:</b><br>${text.replace(/\n/g,'<br>')}</blockquote>`;
            if (artifact) html += `<pre style="background:#0a0a0a;border:1px solid #333;color:#00e676;padding:8px;border-radius:6px;font-size:0.72rem;overflow-x:auto;">${JSON.stringify(artifact,null,2)}</pre>`;
            this.dom.powEditor.innerHTML += html;
            this.dom.socList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        });

        // Inicializar desde URL hash
        if (this._initHash) {
            const opt = this.dom.modeSelector.querySelector(`option[value="${this._initHash}"]`);
            if (opt) { this.dom.modeSelector.value = this._initHash; this.dom.modeSelector.dispatchEvent(new Event('change')); }
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  Chat
    // ══════════════════════════════════════════════════════════════
    async _sendMessage() {
        const text = this.dom.chatInput.value.trim();
        if (!text) return;
        this._sendDirective(text);
    }

    async _sendDirective(text) {
        this._addMsg(text, 'user');
        this.dom.chatInput.value = '';
        this.dom.btnSend.disabled = true;
        this.dom.btnSend.innerText = '⏳ Orquestando…';

        try {
            const agentId   = this.dom.selAgent.value;
            const agentName = this.dom.selAgent.options[this.dom.selAgent.selectedIndex]?.text || agentId;
            await KB.init();
            const promptNode = await KB.getNode(`prompt_global_${agentId.replace('@','')}`);
            let systemPrompt = promptNode?.content || `Eres ${agentName}, agente del Swarm SOS V10. Opera con precisión Glass-Box.`;

            // Inyectar skills del agente
            if (promptNode?.dependencies?.length) {
                systemPrompt += '\n\nSOPs DISPONIBLES:\n';
                for (const sid of promptNode.dependencies) {
                    const sn = await KB.getNode(sid);
                    if (sn) systemPrompt += `\n--- SKILL: ${sn.title} ---\n${sn.content}\n`;
                }
            }

            // Inyectar nodos adjuntos
            if (this.attachedNodes.length) {
                systemPrompt += '\n\n[RECURSOS ADJUNTOS POR EL USUARIO]:\n';
                this.attachedNodes.forEach(n => {
                    systemPrompt += `\n--- ${n.type.toUpperCase()}: ${n.title} ---\n${n.content}\n`;
                });
            }

            systemPrompt += `\n\n[PROTOCOLO ARTIFACTS V10 — RESPONDE SIEMPRE CON JSON VÁLIDO]:
{
  "message": "Respuesta conversacional",
  "artifact": null
}

Si generas código UI: { "type": "web_component", "html": "...", "css": "...", "js": "..." }
Si generas skill:     { "type": "entity_mutation", "entity_type": "skill", "title": "...", "description": "...", "content": "...", "references": [], "evals": [], "scripts": [] }
Si generas documento: { "type": "document", "title": "...", "content": "..." }

Estado actual del sandbox: ${this.sandbox ? JSON.stringify(this.sandbox).substring(0, 200) : 'vacío'}`;

            // Construir historial
            let ctx = 'HISTORIAL:\n';
            this.chatHistory.slice(-10).forEach(m => { ctx += `[${m.role.toUpperCase()}]: ${m.content}\n`; });
            ctx += `\n[DIRECTIVA]:\n${text}`;

            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt,
                userPrompt:      ctx,
                responseFormat:  'json_object',
                temperature:     0.3
            });

            const parsed = response.content;
            this._updateTelem(response.telemetry);

            if (parsed.artifact) {
                this._addMsg(parsed.message || 'Artifact generado.', 'ai', parsed.artifact, false, response.telemetry);
                this._renderArtifact(parsed.artifact);
                this._addRightArtifact(parsed.artifact);
            } else {
                this._addMsg(parsed.message || parsed.raw || 'Entendido.', 'ai', null, false, response.telemetry);
            }

            this.attachedNodes = [];
            this._renderAttachTray();

        } catch (err) {
            this._addMsg(`⚠️ Error: ${err.message}`, 'ai');
        } finally {
            this.dom.btnSend.disabled = false;
            this.dom.btnSend.innerText = '🚀 Enviar Directiva';
        }
    }

    _addMsg(text, type, artifact = null, skipSave = false, telemetry = null) {
        const msgId = `msg_${Date.now()}`;
        const div   = document.createElement('div');
        div.className = `msg-bubble msg-${type}`;

        if (type === 'user') this.chatHistory.push({ role:'user', content: text });
        else this.chatHistory.push({ role:'assistant', content: artifact ? JSON.stringify(artifact) : text });

        let telemHtml = '';
        if (telemetry && type === 'ai') {
            const totalTk = (telemetry.tokens?.prompt_tokens || 0) + (telemetry.tokens?.completion_tokens || 0);
            const base    = ((telemetry.tokens?.prompt_tokens||0)/1e6)*3.00 + ((telemetry.tokens?.completion_tokens||0)/1e6)*15.00;
            const cost    = (base * 1.35).toFixed(4);
            telemHtml = `<div class="msg-telem"><span>⚡ ${(telemetry.latencyMs/1000).toFixed(1)}s · ${totalTk.toLocaleString()} tk</span><span style="color:var(--accent-green);">$${cost}</span></div>`;
        }

        let powBtnHtml = '';
        if (type === 'ai' && this.activeTx?.status === 'pinged') {
            powBtnHtml = `<button class="btn-inject-pow" data-id="${msgId}">📥 Inyectar como Proof of Work</button>`;
        }

        if (artifact) {
            div.classList.add('msg-artifact');
            div.innerHTML = `📦 <b>Artifact (${artifact.type})</b> — clic para ver en Sandbox${powBtnHtml}${telemHtml}`;
            div.addEventListener('click', e => {
                if (e.target.tagName === 'BUTTON') return;
                this._renderArtifact(artifact);
            });
        } else {
            div.innerHTML = text.replace(/\n/g, '<br>') + powBtnHtml + telemHtml;
        }

        div.querySelector('.btn-inject-pow')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('paper:inject-evidence', { detail: { text, artifact } }));
        });

        this.dom.history.appendChild(div);
        this.dom.history.scrollTop = this.dom.history.scrollHeight;
        if (!skipSave) this._saveChatHistory();
    }

    async _loadChatHistory(chatId) {
        this.currentChatId = chatId;
        this.chatHistory   = [];
        this.dom.history.innerHTML = '';
        await KB.init();
        const node = await KB.getNode(chatId);
        if (node?.content) {
            try {
                const hist = JSON.parse(node.content);
                hist.forEach(m => this._addMsg(m._uiText || m.content, m.role === 'user' ? 'user' : 'ai', m._uiArtifact || null, true, m._telem || null));
            } catch (_) { this._greet(); }
        } else { this._greet(); }
    }

    async _saveChatHistory() {
        if (!this.currentChatId) return;
        await KB.init();
        await KB.saveNode({ id: this.currentChatId, type:'chat_session', category:'chat',
            projectId: this.activeProjectId, targetId:'global',
            title: `Chat: ${this.currentChatId}`,
            content: JSON.stringify(this.chatHistory.map((m,i) => ({ ...m,
                _uiText: this.dom.history.children[i]?.innerText?.substring(0,300) || m.content })))
        });
    }

    _greet() {
        this.dom.history.innerHTML = `
        <div class="msg-bubble msg-ai">
            Omni-Paper V10 activo.<br><br>
            • Pide <b>código UI</b> → artifact web_component en Sandbox<br>
            • Pide una <b>skill</b> → entity_mutation sellada en KB<br>
            • Pide un <b>documento</b> → artifact document<br>
            • Adjunta nodos del Córtex para enriquecer el contexto<br><br>
            Swarm Memory activada. El contexto persiste entre sesiones.
        </div>`;
    }

    // ══════════════════════════════════════════════════════════════
    //  Sandbox
    // ══════════════════════════════════════════════════════════════
    _renderArtifact(artifact) {
        this.sandbox = artifact;
        this._renderSandboxTab(document.querySelector('.sb-tab.active')?.dataset.tab || 'preview');
    }

    _renderSandboxTab(tab) {
        const frame = this.dom.sandboxFrame;
        if (!this.sandbox) return;
        frame.innerHTML = '';

        if (tab === 'preview') {
            if (this.sandbox.type === 'web_component') {
                const iframe = document.createElement('iframe');
                iframe.style = 'width:100%;height:100%;border:none;background:white;';
                iframe.srcdoc = `<!DOCTYPE html><html><head><style>${this.sandbox.css||''}</style></head><body>${this.sandbox.html||''}<script>${this.sandbox.js||''}<\/script></body></html>`;
                frame.appendChild(iframe);
            } else if (this.sandbox.type === 'document') {
                const doc = document.createElement('div');
                doc.className = 'artifact-doc';
                doc.innerHTML = (this.sandbox.content || '').replace(/\n/g, '<br>');
                frame.appendChild(doc);
            } else {
                const pre = document.createElement('textarea');
                pre.className = 'artifact-code';
                pre.value = JSON.stringify(this.sandbox, null, 2);
                pre.readOnly = true;
                frame.appendChild(pre);
            }
        } else if (tab === 'code') {
            const ta = document.createElement('textarea');
            ta.className = 'artifact-code';
            ta.value = this.sandbox.type === 'web_component'
                ? `<!-- HTML -->\n${this.sandbox.html||''}\n\n/* CSS */\n${this.sandbox.css||''}\n\n// JS\n${this.sandbox.js||''}`
                : JSON.stringify(this.sandbox, null, 2);
            ta.readOnly = true;
            frame.appendChild(ta);
        } else if (tab === 'doc') {
            if (this.sandbox.type === 'entity_mutation') {
                const div = document.createElement('div');
                div.className = 'artifact-doc';
                div.innerHTML = `<h2>${this.sandbox.title}</h2><p>${this.sandbox.description||''}</p><pre style="font-size:0.8rem;color:#aaa;">${this.sandbox.content||''}</pre>`;
                frame.appendChild(div);
            }
        }
    }

    async _saveArtifactToKb() {
        if (!this.sandbox) return;
        await KB.init();
        const id = `artifact_${this.sandbox.type}_${Date.now()}`;
        if (this.sandbox.type === 'entity_mutation') {
            // Guardar como skill/entidad real
            await KB.saveNode({
                id, type: this.sandbox.entity_type || 'skill',
                category: this.sandbox.entity_type || 'skill',
                projectId: this.activeProjectId, targetId: 'global',
                title: this.sandbox.title, content: this.sandbox.content,
                description: this.sandbox.description || '',
                references: [], evals: [], scripts: [], keywords: ['#paper_v10']
            });
        } else {
            await KB.saveNode({ id, type: 'reference', category: 'reference',
                projectId: this.activeProjectId, targetId: 'global',
                title: `Artifact ${this.sandbox.type} — ${new Date().toLocaleDateString()}`,
                content: JSON.stringify(this.sandbox)
            });
        }
        alert(`✅ Artifact sellado en el Córtex: ${id}`);
        window.dispatchEvent(new CustomEvent('refresh-lms-data'));
    }

    // ══════════════════════════════════════════════════════════════
    //  GTD
    // ══════════════════════════════════════════════════════════════
    _switchMode(mode) {
        if (mode === 'ide') {
            this.dom.ideMode.style.display = '';
            this.dom.gtdMode.classList.add('gtd-hidden');
        } else {
            this.dom.ideMode.style.display = 'none';
            this.dom.gtdMode.classList.remove('gtd-hidden');
        }
    }

    _loadGtdContext(wo, project) {
        const flow = (project.vna_flows || []).find(f => f.id === wo.flowId) || {};
        this.dom.woCtxTitle.innerText = flow.entregable || flow.template || wo.comentario || 'Work Order';
        const roleTo = project.roles?.find(r => r.id === flow.to);
        this.dom.woCtxMeta.innerText = `${roleTo ? `${roleTo.levelId} · ${roleTo.name}` : '@ecosistema'} · ${wo.status?.toUpperCase()}`;
        this.dom.woCtxDesc.innerHTML = (wo.comentario || flow.context || 'Completa y sella la evidencia.').replace(/\n/g, '<br>');

        const socs = wo.soc_checklist?.length ? wo.soc_checklist : (flow.soc_checklist || []);
        this.dom.socList.innerHTML = socs.length
            ? socs.map(s => `<div class="soc-item"><input type="checkbox" id="${s.id}" ${s.isChecked?'checked':''}><span>${s.label || s.text}</span></div>`).join('')
            : '<div style="color:#444;font-size:0.78rem;font-style:italic;">Sin SOCs definidos.</div>';

        this.dom.inpPowLink.value   = wo.draftLink   || wo.proofLink || '';
        this.dom.inpPowHours.value  = wo.draftHours  || wo.realHours || flow.estimatedHours || flow.horas || 1;
        this.dom.powEditor.innerHTML = wo.draftContent || '<p><br></p>';

        // Inicializar pomodoro con horas guardadas
        this.pomodoroSecs = Math.floor(((wo.draftHours || 0)) * 3600);
        this._pomoDisplay();
    }

    async _saveDraft() {
        if (!this.activeTx || !this.activeProjectId) return;
        const proj = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!proj) return;
        const socs = [...this.dom.socList.querySelectorAll('.soc-item input')].map(cb => ({
            id: cb.id, label: cb.nextElementSibling.innerText, isChecked: cb.checked
        }));
        const updated = (proj.work_orders || []).map(w =>
            w.hash === this.activeTx.hash
                ? { ...w, draftLink: this.dom.inpPowLink.value, draftHours: parseFloat(this.dom.inpPowHours.value)||0,
                    draftContent: this.dom.powEditor.innerHTML, soc_checklist: socs }
                : w
        );
        await store.dispatch({ type:'UPDATE_PROJECT_INFO', payload:{ projectId: this.activeProjectId, updates:{ work_orders: updated } } });
        this.dom.btnSaveDraft.innerText = '✅ Guardado';
        setTimeout(() => this.dom.btnSaveDraft.innerText = '💾 Guardar borrador', 1500);
    }

    async _sealPoW() {
        if (!this.activeTx) return;
        this._pomoStop();
        const hours = this.pomodoroSecs > 0 ? parseFloat((this.pomodoroSecs/3600).toFixed(3)) : parseFloat(this.dom.inpPowHours.value) || 1;
        const link  = this.dom.inpPowLink.value.trim();
        const html  = this.dom.powEditor.innerHTML.trim();
        if (!link && html === '<p><br></p>') { alert('⚠️ Adjunta enlace o escribe el PoW.'); return; }
        if (!confirm(`¿Sellar con ${hours}h? Pasará a Auditoría TDD.`)) return;

        await store.dispatch({
            type:    'REPORT_WORK_ORDER',
            payload: { projectId: this.activeProjectId, woHash: this.activeTx.hash, realHours: hours, comentario: html, proofLink: link }
        });

        this.dom.btnSealPow.innerText = '✅ Sellado';
        setTimeout(() => window.navigateTo('/project'), 1200);
    }

    // ══════════════════════════════════════════════════════════════
    //  Pomodoro
    // ══════════════════════════════════════════════════════════════
    _pomoStart() {
        if (this.pomodoroRunning) return;
        this.pomodoroRunning = true;
        this.dom.btnPomoPlay.style.display  = 'none';
        this.dom.btnPomoPause.style.display = 'flex';
        this.dom.pomoBox.classList.add('running');
        this.pomodoroInterval = setInterval(() => {
            this.pomodoroSecs++;
            this._pomoDisplay();
        }, 1000);
    }

    _pomoStop() {
        if (!this.pomodoroRunning) return;
        this.pomodoroRunning = false;
        this.dom.btnPomoPlay.style.display  = 'flex';
        this.dom.btnPomoPause.style.display = 'none';
        this.dom.pomoBox.classList.remove('running');
        clearInterval(this.pomodoroInterval);
    }

    _pomoDisplay() {
        const h = Math.floor(this.pomodoroSecs / 3600).toString().padStart(2,'0');
        const m = Math.floor((this.pomodoroSecs % 3600) / 60).toString().padStart(2,'0');
        const s = (this.pomodoroSecs % 60).toString().padStart(2,'0');
        this.dom.pomoTimer.textContent = `${h}:${m}:${s}`;
        if (this.pomodoroSecs > 0) this.dom.inpPowHours.value = (this.pomodoroSecs / 3600).toFixed(3);
    }

    // ══════════════════════════════════════════════════════════════
    //  Paneles contextuales
    // ══════════════════════════════════════════════════════════════
    _renderLeftPanel(project) {
        if (!project) return;

        // WOs activas
        const wos = (project.work_orders || []).filter(w => ['pinged','theoretical'].includes(w.status));
        this.dom.leftWoList.innerHTML = wos.slice(0,6).map(w => {
            const flow = (project.vna_flows||[]).find(f=>f.id===w.flowId)||{};
            const label = (flow.entregable||flow.template||w.comentario||'WO').substring(0,30);
            const autoClass = w.automation === 'auto' ? 'badge-auto' : w.woType === 'tangible' ? 'badge-tang' : 'badge-int';
            return `<div class="pl-item" data-hash="${w.hash}" id="plwo_${w.hash}">
                <span style="font-size:0.8rem;">📋</span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</span>
                <span class="pl-badge ${autoClass}">${w.automation||'—'}</span>
            </div>`;
        }).join('') || '<div style="color:#333;font-size:0.72rem;padding:4px 0;">Sin WOs activas</div>';

        this.dom.leftWoList.querySelectorAll('.pl-item').forEach(item => {
            item.addEventListener('click', () => {
                const hash = item.dataset.hash;
                const sel  = document.getElementById('modeSelector');
                if (sel) { sel.value = hash; sel.dispatchEvent(new Event('change')); }
            });
        });

        // Skills
        const skills = project.skills || [];
        this.dom.leftSkillList.innerHTML = skills.slice(0,5).map(s =>
            `<div class="pl-item"><span>⚡</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.72rem;">${s.name||s.skillId}</span></div>`
        ).join('') || '<div style="color:#333;font-size:0.72rem;padding:4px 0;">Sin skills</div>';

        // Nodos VNA
        const vnaNodes = project.vna_nodes || [];
        this.dom.leftVnaList.innerHTML = vnaNodes.slice(0,6).map(n => {
            const roleColors = { agent:'var(--accent-indigo)', human:'var(--accent-green)', organization:'var(--accent-orange)', process:'var(--accent-purple)', resource:'var(--accent-blue)' };
            return `<div class="pl-item">
                <span style="width:6px;height:6px;border-radius:50%;background:${roleColors[n.role]||'#555'};flex-shrink:0;"></span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.72rem;">${n.label||n.id}</span>
                <span style="font-size:0.6rem;color:#444;">${n.role||'?'}</span>
            </div>`;
        }).join('') || '<div style="color:#333;font-size:0.72rem;padding:4px 0;">Sin mapa VNA. <a href="/map" data-link style="color:var(--accent-indigo);">Mapear →</a></div>';

        // Activar data-link en panel izquierdo
        this.dom.leftVnaList.querySelectorAll('[data-link]').forEach(l => {
            l.addEventListener('click', e => { e.preventDefault(); window.navigateTo(l.getAttribute('href')); });
        });
    }

    _renderRightPanel(state) {
        // Agentes activos
        const agents = state.globalUsers.filter(u => u.profile?.isAi).slice(0, 6);
        this.dom.rightAgents.innerHTML = agents.map(a =>
            `<div class="pl-item">
                <span>🤖</span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.72rem;">${a.name||a.id}</span>
            </div>`
        ).join('') || '<div style="color:#333;font-size:0.72rem;">Sin agentes</div>';

        this.dom.rightArtifacts.innerHTML = '<div style="color:#333;font-size:0.72rem;">Los artifacts aparecerán aquí</div>';
    }

    _addRightArtifact(artifact) {
        const div = document.createElement('div');
        div.className = 'pl-item';
        div.style.cursor = 'pointer';
        div.innerHTML = `<span style="font-size:0.8rem;">📦</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.68rem;">${artifact.type}: ${artifact.title||'artifact'}</span>`;
        div.addEventListener('click', () => this._renderArtifact(artifact));
        const container = this.dom.rightArtifacts;
        if (container.firstChild?.style?.color === '#333') container.innerHTML = '';
        container.prepend(div);
    }

    _renderAttachTray() {
        this.dom.attachTray.innerHTML = this.attachedNodes.map((n, i) =>
            `<div class="attach-pill">📚 ${(n.title||n.id).substring(0,20)} <button data-idx="${i}">×</button></div>`
        ).join('');
        this.dom.attachTray.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.attachedNodes.splice(parseInt(btn.dataset.idx), 1);
                this._renderAttachTray();
            });
        });
    }

    _updateTelem(t) {
        if (!t?.tokens) return;
        const cur = { tokens: parseInt(this.dom.rtTokens.textContent)||0, cost: parseFloat(this.dom.rtCost.textContent.replace('$',''))||0, slices: parseFloat(this.dom.rtSlices.textContent)||0 };
        const tk   = (t.tokens.prompt_tokens||0) + (t.tokens.completion_tokens||0);
        const base = ((t.tokens.prompt_tokens||0)/1e6)*3.00 + ((t.tokens.completion_tokens||0)/1e6)*15.00;
        const cost = base * 1.35;
        this.dom.rtTokens.textContent = (cur.tokens + tk).toLocaleString();
        this.dom.rtCost.textContent   = `$${(cur.cost + cost).toFixed(3)}`;
        this.dom.rtSlices.textContent = (cur.slices + cost * 2.0).toFixed(3);
    }

    executeViewScript() { return this.afterRender(); }
}
