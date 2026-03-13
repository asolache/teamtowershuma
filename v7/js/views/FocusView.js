// v5/js/views/FocusView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';

export default class FocusView {
    constructor() {
        document.title = "Deep Work | TeamTowers SOS";
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isRunning = false;
        this.activeTx = null;
        this.mode = 'stopwatch'; // 'stopwatch', 'pomodoro_25', 'pomodoro_50'
        this.targetSeconds = 0;
        this.startTime = null; 
        
        this.focusTips = [
            "Concéntrate en la tarea presente como si fuera la última. — M. Aurelio",
            "El valor de la red fluye hacia donde la atención se enfoca.",
            "💡 Tip: Un sprint de 50m sin interrupciones equivale a 3h de trabajo fragmentado.",
            "La calidad del código de hoy es el patrimonio inmutable de mañana.",
            "Deep Work: Sin notificaciones. Sin distracciones. Solo Proof of Work."
        ];
        this.currentTipIndex = 0;
    }

    async getHtml() {
        const state = store.getState();
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
        }

        const headerConfig = {
            title: "Deep Work",
            subtitle: project ? project.nombre : 'Sin Red',
            tagline: "Aísla tu atención, ejecuta el entregable y sella tu Proof of Work."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                
                .workspace-focus { 
                    flex: 1; display: flex; flex-direction: column; position: relative; 
                    background: radial-gradient(circle at center, #111116 0%, #050505 100%); 
                    overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth;
                    padding: 2rem 3rem; box-sizing: border-box; width: 100%;
                }
                
                /* =========================================================
                   CONTENEDOR CENTRAL DE TRABAJO
                   ========================================================= */
                .focus-container { 
                    flex: 1 0 auto; display: flex; flex-direction: column; align-items: center; 
                    justify-content: flex-start; padding: 0; padding-bottom: 2rem;
                    position: relative; z-index: 10; margin-top: -1rem; width: 100%; box-sizing: border-box;
                }

                .empty-state { text-align: center; color: var(--text-muted); display: none; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 4rem; animation: fadeIn 0.5s ease-out;}
                .btn-go-kanban { background: white; color: black; margin-top: 1rem; text-decoration: none; padding: 14px 30px; border-radius: 12px; font-size: 1rem; font-weight: 900; transition: transform 0.2s; box-shadow: 0 10px 30px rgba(255,255,255,0.1);}
                .btn-go-kanban:hover { transform: translateY(-3px); }
                
                /* EL MONOLITO DE CRISTAL (Panel Principal) */
                .task-glass-panel {
                    width: 100%; max-width: 680px; margin-top: 0;
                    background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
                    border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
                    padding: 2.5rem; display: none; flex-direction: column; align-items: center;
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
                    animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
                    position: relative; z-index: 50; 
                    transition: all 0.5s ease; box-sizing: border-box;
                }
                
                /* =========================================================
                   ZEN MODE ANIMATIONS (Inmersión Absoluta)
                   ========================================================= */
                .ph-view-header, .task-selector-box, .rhythm-selector {
                    transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
                    max-height: 200px; opacity: 1; transform-origin: top center; overflow: hidden;
                }
                .workspace-focus.zen-active .ph-view-header {
                    opacity: 0; max-height: 0; margin-bottom: 0; transform: scale(0.95); padding: 0;
                }
                .workspace-focus.zen-active .task-selector-box {
                    opacity: 0; max-height: 0; margin-bottom: 0; transform: scale(0.95); pointer-events: none;
                }
                .workspace-focus.zen-active .rhythm-selector {
                    opacity: 0; max-height: 0; margin-bottom: 0; transform: scale(0.95); pointer-events: none;
                }
                .workspace-focus.zen-active .task-glass-panel {
                    border-color: rgba(0, 230, 118, 0.3);
                    box-shadow: 0 30px 80px rgba(0, 230, 118, 0.05), inset 0 1px 0 rgba(255,255,255,0.05);
                }

                /* SELECTOR OMNIPRESENTE LUXURY */
                .task-selector-box { width: 100%; margin-bottom: 2.5rem; position: relative; z-index: 9999; }
                .task-selector-box label { display:block; font-size:0.75rem; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-weight:900; text-align:center;}
                .omni-selector { 
                    width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(224, 64, 251, 0.3); color: white; 
                    padding: 16px 45px 16px 20px; border-radius: 12px; font-family: var(--font-main); font-size: 1.05rem; 
                    outline: none; cursor: pointer; appearance: none; font-weight: 800;
                    text-overflow: ellipsis; white-space: nowrap; overflow: hidden; transition: all 0.3s;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.2); position: relative; z-index: 9999; box-sizing: border-box;
                }
                .omni-selector:focus, .omni-selector:hover { border-color: var(--accent-blue); box-shadow: inset 0 0 10px rgba(0, 176, 255, 0.1), 0 10px 20px rgba(0,176,255,0.3); background: rgba(0,0,0,0.8); }
                .omni-selector option { background: #111; color: white; padding: 10px; font-family: var(--font-mono); font-size:0.95rem;}
                .omni-selector optgroup { font-family: var(--font-main); font-weight:900; color: var(--accent-blue); background: #000; font-style: normal; padding:8px 0;}
                .task-selector-box::after {
                    content: '▼'; position: absolute; right: 20px; bottom: 18px;
                    color: var(--accent-purple); font-size: 0.8rem; pointer-events: none; z-index: 10000;
                }

                /* TITULO Y BADGES */
                .task-header { display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 2rem; gap: 15px;}
                .task-title-group { display: flex; align-items: center; gap: 15px; justify-content: center; width: 100%;}
                .task-title { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); line-height: 1.2; text-align: center; font-weight:900; word-break: break-word;}
                .btn-help-tip { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.3s; font-weight: bold; flex-shrink:0; font-size: 0.9rem;}
                .btn-help-tip:hover { background: var(--accent-blue); color: black; border-color: var(--accent-blue); transform: scale(1.1);}

                .task-meta-row { display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap:wrap;}
                .task-badge { padding: 6px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-mono);}
                .badge-tangible { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); }
                .badge-intangible { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); border: 1px solid rgba(224, 64, 251, 0.3); }
                
                .btn-direct { background: transparent; border: 1px dashed rgba(255,255,255,0.2); color: #ccc; padding: 6px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-size: 0.8rem; font-weight:bold;}
                .btn-direct:hover { background: rgba(255,255,255,0.1); border-color: white; color: white; transform: translateY(-2px);}

                .focus-tip { font-size: 0.9rem; color: var(--accent-blue); font-style: normal; background: rgba(0, 176, 255, 0.05); padding: 15px 20px; border-radius: 12px; border-left: 4px solid var(--accent-blue); display: none; width: 100%; text-align: center; margin-bottom: 2rem; line-height: 1.5; font-weight: bold; animation: fadeIn 0.3s ease-out; box-sizing: border-box;}

                /* SELECTOR DE RITMO */
                .rhythm-selector { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; background: rgba(0,0,0,0.6); padding: 6px; border-radius: 30px; border: 1px solid #333; margin-bottom: 2rem; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);}
                .btn-rhythm { background: transparent; border: none; color: #888; padding: 10px 24px; border-radius: 24px; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; font-weight:bold;}
                .btn-rhythm:hover { color: white; background: rgba(255,255,255,0.05);}
                .btn-rhythm.active { background: rgba(0, 230, 118, 0.15); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.4); box-shadow: 0 0 20px rgba(0,230,118,0.15);}

                /* =========================================================
                   TIMER SVG & TOMATO 🍅
                   ========================================================= */
                .timer-wrapper { position: relative; width: 300px; height: 300px; display: flex; justify-content: center; align-items: center; z-index: 2; margin: 0 auto 2rem auto;}
                .timer-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));}
                .timer-circle-bg { fill: rgba(0,0,0,0.3); stroke: rgba(255,255,255,0.05); stroke-width: 8; }
                .timer-circle-progress { fill: none; stroke: var(--accent-green); stroke-width: 8; stroke-dasharray: 942; stroke-dashoffset: 0; transition: stroke-dashoffset 1s linear; stroke-linecap: round; filter: drop-shadow(0 0 15px rgba(0,230,118,0.6));}
                
                .timer-container { position: relative; display: flex; justify-content: center; align-items: center; flex-direction: column; z-index: 10;}
                
                .pomodoro-icon { font-size: 2.8rem; margin-bottom: 5px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.6)); transition: all 0.3s;}
                .pomodoro-icon.ticking { animation: tickTock 1s infinite alternate ease-in-out; filter: drop-shadow(0 0 30px rgba(255, 82, 82, 1)); }
                
                .time-display { font-size: 4.5rem; font-weight: 900; font-family: var(--font-mono); color: white; letter-spacing: -3px; line-height: 1; text-shadow: 0 5px 20px rgba(0,0,0,0.8);}
                .time-display span { font-size: 2.5rem; color: #444; vertical-align: baseline; padding: 0 4px;}
                .time-label { color: var(--accent-green); font-family: var(--font-mono); font-size: 0.85rem; font-weight: 900; margin-top: 10px; text-transform: uppercase; letter-spacing: 4px; opacity:0.9;}

                /* CONTROLS */
                .controls { display: flex; gap: 2rem; z-index: 10; align-items: center; justify-content: center; margin-top: 1rem; padding-bottom: 1rem;}
                .btn-circle { width: 80px; height: 80px; border-radius: 50%; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 2rem; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .btn-play { background: white; color: black; }
                .btn-play:hover { transform: scale(1.1); background: #f0f0f0; box-shadow: 0 15px 40px rgba(255, 255, 255, 0.4);}
                .btn-pause { background: rgba(0,0,0,0.8); color: white; border: 2px solid #555; backdrop-filter: blur(5px);}
                .btn-pause:hover { background: rgba(255,255,255,0.1); border-color: white;}
                .btn-stop { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 2px solid var(--accent-red); display: none; }
                .btn-stop:hover { background: var(--accent-red); color: white; box-shadow: 0 10px 40px rgba(255, 82, 82, 0.5); transform: scale(1.1);}

                /* =========================================================
                   MODAL DE REPORTE (PoW Console)
                   ========================================================= */
                .report-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; height: 100dvh; background: rgba(0,0,0,0.9); backdrop-filter: blur(15px); display: none; justify-content: center; align-items: center; z-index: 5000; overflow-y: auto;}
                .report-card { background: var(--bg-dark); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 24px; width: 100%; max-width: 500px; box-shadow: 0 30px 60px rgba(0,0,0,0.9); animation: slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); box-sizing: border-box; border-top: 4px solid var(--accent-blue); margin: 2rem auto; max-height: 85vh; overflow-y: auto;}
                .report-card h2 { color: white; margin-top: 0; font-size: 1.8rem; font-weight:900; letter-spacing:-1px; margin-bottom: 5px;}
                
                .report-task-box { background: rgba(0, 176, 255, 0.1); border-left: 4px solid var(--accent-blue); color: white; font-weight: 900; padding: 15px; border-radius: 8px; margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.3;}

                .form-group { margin-bottom: 1.5rem; text-align: left; width: 100%;}
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 16px; border-radius: 12px; font-family: inherit; font-size: 1rem; transition: all 0.3s; box-sizing: border-box; outline:none; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2);}

                .glow-bg { position: fixed; width: 800px; height: 800px; background: radial-gradient(circle, rgba(224, 64, 251, 0.05) 0%, transparent 60%); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0; transition: opacity 1s, background 1s; pointer-events: none;}
                .glow-bg.running { opacity: 1; animation: pulseGlow 4s infinite alternate; }
                
                @keyframes pulseGlow { 0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5;} 100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1;} }
                @keyframes tickTock { 0% { transform: scale(1) rotate(-5deg); } 100% { transform: scale(1.15) rotate(5deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

                /* RESPONSIVE MOBILE FIXES */
                @media (max-width: 768px) {
                    .workspace-focus { 
                        padding: 90px 1rem 120px 1rem; /* 120px asegura que en iOS la UI llegue hasta arriba de la nav bar sin taparse */
                    } 
                    .focus-container { padding: 0; }
                    .task-glass-panel { padding: 2rem 1.5rem; border-radius: 20px;}
                    .empty-state h2 { font-size: 1.8rem; }
                    
                    .task-selector-box { margin-bottom: 2rem; }
                    .omni-selector { padding: 14px 15px; font-size: 0.95rem; border-radius: 12px;}
                    
                    .task-title { font-size: 1.6rem; }
                    .timer-wrapper { width: 240px; height: 240px; margin: 1.5rem 0; }
                    .time-display { font-size: 3.8rem; }
                    .btn-circle { width: 70px; height: 70px; font-size: 1.6rem; }
                    
                    /* Formulario Mobile Safe */
                    .report-card { padding: 2rem 1.5rem; width: 95%; max-height: 85vh; overflow-y:auto; margin: 10vh auto;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/focus')}

                <main class="workspace-focus" id="focusWorkspace">
                    <div class="glow-bg" id="glowBg"></div>
                    
                    <div id="headerWrapper" style="position:relative; z-index:100; width: 100%;">
                        ${PageHeader.getHtml(headerConfig)}
                    </div>

                    <div class="focus-container">
                        
                        <div class="empty-state" id="emptyState">
                            <div style="font-size: 5rem; margin-bottom: 0; line-height:1; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.5));">☕</div>
                            <h2 style="color:white; margin:0; font-weight:900;">Escritorio Limpio.</h2>
                            <p style="max-width: 400px; line-height:1.5;">La mente está despejada. Ve al Kanban, haz PULL de un entregable pendiente y vuelve aquí para entrar en Flow.</p>
                            <a href="/v5/project" data-link class="btn-go-kanban">Ir al Kanban (Mercado de Tareas)</a>
                        </div>

                        <div id="workState" class="task-glass-panel">
                            
                            <div class="task-selector-box" id="omniContainer">
                                <label>🎯 Entregable Activo (Workspace)</label>
                                <select id="omniSelector" class="omni-selector" title="Selecciona la tarea a ejecutar">
                                    <option value="" disabled selected>Cargando tareas...</option>
                                </select>
                            </div>
                            
                            <div class="task-header">
                                <div class="task-title-group">
                                    <h1 class="task-title" id="taskName">Cargando...</h1>
                                    <button class="btn-help-tip" id="btnShowTip" title="Inspiración y Ayuda">?</button>
                                </div>

                                <div class="focus-tip" id="focusTip"></div>

                                <div class="task-meta-row">
                                    <div class="task-badge" id="taskType">--</div>
                                    <button class="btn-direct" id="btnDirectReport" title="Saltarse el reloj y reportar horas estimadas.">📝 Ingreso Manual Rápido</button>
                                </div>
                            </div>

                            <div class="rhythm-selector">
                                <button class="btn-rhythm active" data-rhythm="stopwatch" title="Cronómetro progresivo infinito">♾️ Flujo Libre</button>
                                <button class="btn-rhythm" data-rhythm="pomodoro_25" title="25m Trabajo / 5m Descanso">🍅 Sprint (25m)</button>
                                <button class="btn-rhythm" data-rhythm="pomodoro_50" title="50m Trabajo / 10m Descanso">🌊 Deep Work (50m)</button>
                            </div>

                            <div class="timer-wrapper">
                                <svg class="timer-svg" viewBox="0 0 320 320">
                                    <circle class="timer-circle-bg" cx="160" cy="160" r="150"></circle>
                                    <circle class="timer-circle-progress" id="timerProgress" cx="160" cy="160" r="150"></circle>
                                </svg>
                                <div class="timer-container">
                                    <div class="pomodoro-icon" id="pomodoroIcon">🍅</div>
                                    <div class="time-display" id="timeDisplay">00<span>:</span>00</div>
                                    <div class="time-label" id="timeLabel">FOCUS</div>
                                </div>
                            </div>

                            <div class="controls">
                                <button class="btn-circle btn-pause" id="btnPause" title="Pausar Reloj" style="display: none;">⏸</button>
                                <button class="btn-circle btn-play" id="btnPlay" title="Iniciar Inmersión">▶</button>
                                <button class="btn-circle btn-stop" id="btnStop" title="Terminar y Sellar PoW">⏹</button>
                            </div>
                        </div>
                    </div>

                    <div class="report-modal" id="reportModal">
                        <div class="report-card">
                            <h2>Reportar Entregable</h2>
                            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height:1.5;">Sella tu Prueba de Trabajo. El auditor validará estas horas para emitir tus Slices correspondientes.</p>
                            
                            <div id="reportTaskName" class="report-task-box">🎯 Cargando Entregable...</div>
                            
                            <div class="form-group">
                                <label style="color: var(--accent-green);">Tiempo Real Invertido (Horas / Fracciones)</label>
                                <input type="number" step="0.1" id="inpRealHours" class="form-control" value="0.0" style="color:var(--accent-green); font-size:1.2rem; font-weight:bold;">
                                <div style="font-size:0.75rem; color:#888; margin-top:6px; font-family:var(--font-mono);">Ejemplo: 1.5 = 1h 30m | 0.25 = 15m</div>
                            </div>
                            
                            <div class="form-group">
                                <label>Enlace al Entregable Final</label>
                                <input type="text" id="inpProof" class="form-control" placeholder="URL de Figma, GitHub, Notion...">
                            </div>

                            <div class="form-group">
                                <label>Notas de Traspaso (Opcional)</label>
                                <textarea id="inpComment" class="form-control" rows="2" placeholder="Contexto para el receptor o el auditor..."></textarea>
                            </div>

                            <div style="display: flex; justify-content: space-between; margin-top: 2rem; gap: 15px;">
                                <button class="btn" id="btnCancelReport" style="background: transparent; border: 1px solid #555; color: white; padding: 14px 20px; border-radius: 12px; cursor: pointer; flex: 1; font-weight:bold; transition:0.2s;">Cancelar</button>
                                <button class="btn" id="btnSubmitReport" style="background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 14px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; flex: 2; transition: all 0.3s; box-shadow: 0 5px 15px rgba(0,176,255,0.3);">📤 Enviar a validar</button>
                            </div>
                        </div>
                    </div>
                </main>
                
                ${BottomNav.getHtml('/focus')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute(); 

        const state = store.getState();
        const activeUserId = state.session.activeUserId;

        this.dom = {
            workspace: document.getElementById('focusWorkspace'),
            emptyState: document.getElementById('emptyState'),
            workState: document.getElementById('workState'),
            taskName: document.getElementById('taskName'),
            taskType: document.getElementById('taskType'),
            focusTip: document.getElementById('focusTip'),
            btnShowTip: document.getElementById('btnShowTip'),
            timeDisplay: document.getElementById('timeDisplay'),
            timeLabel: document.getElementById('timeLabel'),
            timerProgress: document.getElementById('timerProgress'),
            pomodoroIcon: document.getElementById('pomodoroIcon'),
            glowBg: document.getElementById('glowBg'),
            btnPlay: document.getElementById('btnPlay'),
            btnPause: document.getElementById('btnPause'),
            btnStop: document.getElementById('btnStop'),
            btnDirectReport: document.getElementById('btnDirectReport'),
            modal: document.getElementById('reportModal'),
            reportTaskName: document.getElementById('reportTaskName'), 
            inpRealHours: document.getElementById('inpRealHours'),
            inpProof: document.getElementById('inpProof'),
            inpComment: document.getElementById('inpComment'),
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnCancel: document.getElementById('btnCancelReport'),
            omniContainer: document.getElementById('omniContainer'),
            omniSelector: document.getElementById('omniSelector')
        };

        // 1. RECOPILAR TODAS LAS TAREAS (OMNI-RED V10)
        let allMyTasks = [];
        
        state.projects.forEach(p => {
            const tasksSource = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            let tasks = tasksSource.filter(tx => tx.status === 'pinged' && tx.assigneeId === activeUserId);
            
            if(tasks.length === 0 && state.session.role === 'ecosystem-owner') {
                tasks = tasksSource.filter(tx => tx.status === 'pinged');
            }
            
            tasks.forEach(tx => {
                const roleFrom = p.roles.find(r => r.id === tx.from);
                
                // V11 FIX: Resolver el nombre real desde el flow si existe
                let resolvedName = tx.entregable || tx.template;
                if (!resolvedName && tx.flowId) {
                    const parentFlow = (p.vna_flows || []).find(f => f.id === tx.flowId);
                    if (parentFlow) resolvedName = parentFlow.template || parentFlow.entregable;
                }

                allMyTasks.push({ 
                    ...tx, 
                    projectId: p.id, 
                    projectName: p.nombre, 
                    roleName: roleFrom ? roleFrom.name : 'Nodo',
                    displayName: resolvedName || 'Work Order Anónima'
                });
            });
        });

        allMyTasks.sort((a, b) => a.projectName.localeCompare(b.projectName));

        if (allMyTasks.length === 0) {
            this.dom.emptyState.style.display = 'flex';
        } else {
            this.dom.workState.style.display = 'flex';
            
            // Llenar Selector con OptGroups
            let currentProjectName = '';
            let selectHtml = `<option value="" disabled>🎯 SELECCIONA EL ENTREGABLE...</option>`;
            
            allMyTasks.forEach(t => {
                if (t.projectName !== currentProjectName) {
                    if (currentProjectName !== '') selectHtml += `</optgroup>`;
                    selectHtml += `<optgroup label="🏰 ${t.projectName.toUpperCase()}">`;
                    currentProjectName = t.projectName;
                }
                selectHtml += `<option value="${t.id || t.hash}">${t.roleName}: ${t.displayName}</option>`;
            });
            if (currentProjectName !== '') selectHtml += `</optgroup>`;
            
            this.dom.omniSelector.innerHTML = selectHtml;

            // LÓGICA DE PERSISTENCIA V10
            const cachedTxHash = localStorage.getItem('tt_active_pomodoro_tx');
            if (cachedTxHash && allMyTasks.find(t => (t.id || t.hash) === cachedTxHash)) {
                this.activeTx = allMyTasks.find(t => (t.id || t.hash) === cachedTxHash);
                this.dom.omniSelector.value = this.activeTx.id || this.activeTx.hash;
            } else {
                this.activeTx = allMyTasks[0];
                this.dom.omniSelector.value = this.activeTx.id || this.activeTx.hash;
            }

            const activeHash = this.activeTx.id || this.activeTx.hash;
            const cachedTime = localStorage.getItem(`tt_focus_${activeHash}_elapsed`);
            const cachedStart = localStorage.getItem(`tt_focus_${activeHash}_start`);
            const cachedRunning = localStorage.getItem(`tt_focus_${activeHash}_running`);
            const cachedMode = localStorage.getItem(`tt_focus_${activeHash}_mode`);

            if (cachedMode) {
                this.mode = cachedMode;
                document.querySelectorAll('.btn-rhythm').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.rhythm === cachedMode) b.classList.add('active');
                });
            }

            if (cachedTime) this.secondsElapsed = parseInt(cachedTime, 10);
            
            if (cachedRunning === 'true' && cachedStart) {
                const now = Date.now();
                const diffSeconds = Math.floor((now - parseInt(cachedStart, 10)) / 1000);
                this.secondsElapsed += diffSeconds;
                this.setupTaskData();
                this.startTimer(); 
            } else {
                this.setupTaskData();
                this.updateDisplay();
            }

            this.setupTimerControls();

            this.dom.omniSelector.addEventListener('change', (e) => {
                this.pauseTimer();
                this.activeTx = allMyTasks.find(t => (t.id || t.hash) === e.target.value);
                const aHash = this.activeTx.id || this.activeTx.hash;
                const cache = localStorage.getItem(`tt_focus_${aHash}_elapsed`);
                this.secondsElapsed = cache ? parseInt(cache, 10) : 0;
                this.setupTaskData();
                this.updateDisplay();
            });
        }
    }

    setupTaskData() {
        if (!this.activeTx) return;
        this.dom.taskName.innerText = this.activeTx.displayName;
        
        if(this.activeTx.tipo === 'tangible') {
            this.dom.taskType.innerText = '🟢 Tangible';
            this.dom.taskType.className = 'task-badge badge-tangible';
        } else {
            this.dom.taskType.innerText = '🟣 Intangible';
            this.dom.taskType.className = 'task-badge badge-intangible';
        }

        if(this.dom.btnShowTip) {
            this.dom.btnShowTip.addEventListener('click', () => {
                this.currentTipIndex = (this.currentTipIndex + 1) % this.focusTips.length;
                this.dom.focusTip.innerText = this.focusTips[this.currentTipIndex];
                this.dom.focusTip.style.display = 'block';
            });
        }
    }

    setupTimerControls() {
        this.dom.btnPlay.addEventListener('click', () => this.startTimer());
        this.dom.btnPause.addEventListener('click', () => this.pauseTimer());
        this.dom.btnStop.addEventListener('click', () => this.openReportModal(true));
        this.dom.btnDirectReport.addEventListener('click', () => this.openReportModal(false)); 
        
        this.dom.btnCancel.addEventListener('click', () => this.dom.modal.style.display = 'none');
        this.dom.btnSubmit.addEventListener('click', () => this.submitReport());
        
        document.querySelectorAll('.btn-rhythm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.isRunning) this.pauseTimer();
                document.querySelectorAll('.btn-rhythm').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.mode = e.target.getAttribute('data-rhythm');
                const activeHash = this.activeTx.id || this.activeTx.hash;
                localStorage.setItem(`tt_focus_${activeHash}_mode`, this.mode);

                if (this.mode === 'pomodoro_25') this.targetSeconds = 25 * 60;
                else if (this.mode === 'pomodoro_50') this.targetSeconds = 50 * 60;
                else this.targetSeconds = 0;
                
                this.secondsElapsed = 0; 
                this.updateDisplay();
            });
        });
    }

    startTimer() {
        if (this.isRunning || !this.activeTx) return;
        this.isRunning = true;
        this.startTime = Date.now();
        
        this.dom.btnPlay.style.display = 'none';
        this.dom.btnDirectReport.style.display = 'none'; 
        this.dom.btnPause.style.display = 'flex';
        this.dom.btnStop.style.display = 'flex';
        
        this.dom.glowBg.classList.add('running');
        this.dom.pomodoroIcon.classList.add('ticking');

        // ZEN MODE ACTIVE
        this.dom.workspace.classList.add('zen-active');

        const activeHash = this.activeTx.id || this.activeTx.hash;
        localStorage.setItem('tt_active_pomodoro_tx', activeHash);
        localStorage.setItem(`tt_focus_${activeHash}_running`, 'true');

        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const tickDiff = Math.floor((now - this.startTime) / 1000);
            this.startTime = now; 

            if (this.mode === 'stopwatch') {
                this.secondsElapsed += tickDiff;
            } else {
                if (this.targetSeconds > 0) this.targetSeconds -= tickDiff;
                if (this.targetSeconds <= 0) {
                    this.pauseTimer();
                    this.targetSeconds = 0;
                    alert("🔔 ¡Sesión completada! Es hora de un descanso. Reporta el progreso para asegurar tu Proof of Work.");
                    this.openReportModal(true);
                }
            }
            
            localStorage.setItem(`tt_focus_${activeHash}_elapsed`, this.secondsElapsed);
            localStorage.setItem(`tt_focus_${activeHash}_start`, now);
            
            this.updateDisplay();
            this.dispatchNavSyncEvent(); 
        }, 1000);
    }

    pauseTimer() {
        if (!this.activeTx) return;
        this.isRunning = false;
        clearInterval(this.timerInterval);
        
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        
        this.dom.glowBg.classList.remove('running');
        this.dom.pomodoroIcon.classList.remove('ticking');
        
        // ZEN MODE DEACTIVE
        this.dom.workspace.classList.remove('zen-active');

        const activeHash = this.activeTx.id || this.activeTx.hash;
        localStorage.setItem(`tt_focus_${activeHash}_running`, 'false');
        localStorage.removeItem('tt_active_pomodoro_tx');
        this.dispatchNavSyncEvent();
    }

    openReportModal(fromTimer) {
        this.pauseTimer();
        
        this.dom.reportTaskName.innerText = `🎯 ${this.activeTx.displayName}`;

        if (fromTimer) {
            let workedSecs = this.mode === 'stopwatch' ? this.secondsElapsed : ((this.mode === 'pomodoro_25' ? 25*60 : 50*60) - this.targetSeconds);
            const hoursCalc = (workedSecs / 3600).toFixed(2);
            this.dom.inpRealHours.value = hoursCalc > 0.01 ? hoursCalc : 0.1; 
        } else {
            this.dom.inpRealHours.value = this.activeTx.horas || this.activeTx.estimatedHours || 1.0; 
        }

        this.dom.modal.style.display = 'flex';
    }

    submitReport() {
        const finalHours = parseFloat(this.dom.inpRealHours.value) || 0;
        if (finalHours <= 0) return alert("⚠️ Debes introducir un tiempo válido (ej. 0.5, 1.2, etc.)");
        
        const activeHash = this.activeTx.id || this.activeTx.hash;

        const state = store.getState();
        const p = state.projects.find(x => x.id === this.activeTx.projectId);
        const isV10 = p.work_orders && p.work_orders.some(w => w.id === activeHash);

        const actionType = isV10 ? 'REPORT_WORK_ORDER' : 'REPORT_TRANSACTION';
        const payloadKey = isV10 ? 'orderId' : 'txHash';

        store.dispatch({
            type: actionType,
            payload: {
                projectId: this.activeTx.projectId,
                [payloadKey]: activeHash,
                realHours: finalHours, 
                proofLink: this.dom.inpProof.value,
                comentario: this.dom.inpComment.value
            }
        }).then(() => {
            localStorage.removeItem(`tt_focus_${activeHash}_elapsed`);
            localStorage.removeItem(`tt_focus_${activeHash}_start`);
            localStorage.removeItem(`tt_focus_${activeHash}_running`);
            localStorage.removeItem('tt_active_pomodoro_tx');
            this.dispatchNavSyncEvent();
            
            localStorage.setItem('tt_active_project', this.activeTx.projectId);
            window.location.href = '/v5/project';
        });
    }

    updateDisplay() {
        let displaySecs = this.mode === 'stopwatch' ? this.secondsElapsed : this.targetSeconds;
        
        const h = Math.floor(displaySecs / 3600).toString().padStart(2, '0');
        const m = Math.floor((displaySecs % 3600) / 60).toString().padStart(2, '0');
        const s = (displaySecs % 60).toString().padStart(2, '0');
        
        if (this.mode === 'stopwatch' && h === '00') {
            this.dom.timeDisplay.innerHTML = `${m}<span>:</span>${s}`; 
        } else {
            this.dom.timeDisplay.innerHTML = `${h}<span>:</span>${m}<span>:</span>${s}`;
        }

        if (this.mode !== 'stopwatch') {
            const total = this.mode === 'pomodoro_25' ? 25 * 60 : 50 * 60;
            const percent = displaySecs / total;
            const dashoffset = 942 - (942 * percent);
            this.dom.timerProgress.style.strokeDashoffset = dashoffset;
            this.dom.timerProgress.style.stroke = 'var(--accent-green)';
            this.dom.timeLabel.innerText = "SPRINT ACTIVO";
        } else {
            this.dom.timerProgress.style.strokeDashoffset = 0;
            this.dom.timerProgress.style.stroke = 'rgba(255,255,255,0.1)';
            this.dom.timeLabel.innerText = "DEEP WORK";
        }
    }

    dispatchNavSyncEvent() {
        window.dispatchEvent(new Event('pomodoro_tick'));
    }
}
