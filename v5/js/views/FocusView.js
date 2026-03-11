// v5/js/views/FocusView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js'; // INYECCIÓN COMPONENTE UNIVERSAL

export default class FocusView {
    constructor() {
        document.title = "Deep Work | TeamTowers";
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isRunning = false;
        this.activeTx = null;
        this.mode = 'stopwatch'; // 'stopwatch', 'pomodoro_25', 'pomodoro_50'
        this.targetSeconds = 0;
        this.startTime = null; // Para persistencia real
        
        // Frases estoicas/zen para inspirar el trabajo profundo
        this.focusTips = [
            "Concéntrate en la tarea presente como si fuera la última de tu vida. — Marco Aurelio",
            "El valor fluye donde la atención se enfoca.",
            "Una tarea terminada es un paso más hacia tu soberanía.",
            "La calidad del trabajo de hoy es el patrimonio del mañana.",
            "Trabajo profundo: Sin distracciones, sin excusas. Solo ejecución."
        ];
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        let activeProjectId = localStorage.getItem('tt_active_project') || (userProjects.length > 0 ? userProjects[userProjects.length - 1].id : null);
        let project = state.projects.find(p => p.id === activeProjectId);

        // Header Universal (Configuración limpia para Focus)
        const headerConfig = {
            title: "Focus",
            subtitle: "State",
            tagline: "Aísla tu atención. Convierte tiempo en Slices."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #050505; font-family: var(--font-main); }
                
                /* FIX V8.5: Limpiamos padding extra para centrar el reloj perfectamente */
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative; scroll-behavior: smooth; background: radial-gradient(circle at center, #111116 0%, #050505 100%); }
                
                .focus-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; z-index: 10;}

                /* OMNI SELECTOR PREMIUM */
                .omni-container { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.6); padding: 8px 20px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); display: none; margin-bottom: 2rem;}
                .omni-label { color: var(--accent-blue); font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .omni-selector { background: transparent; border: none; border-bottom: 1px dashed rgba(255,255,255,0.3); color: white; padding: 5px 0; font-family: var(--font-mono); font-size: 0.9rem; outline: none; cursor: pointer; max-width: 400px; text-overflow: ellipsis; transition: all 0.2s;}
                .omni-selector:hover { border-color: var(--accent-blue); }
                .omni-selector option { background: #111; color: white; }

                .empty-state { text-align: center; color: var(--text-muted); display: none; flex-direction: column; align-items: center; gap: 1rem; z-index: 5;}
                
                /* TASK CONTEXT (MAGIA VISUAL) */
                .task-context { text-align: center; margin-bottom: 2rem; z-index: 2; animation: fadeIn 0.5s ease-out; width: 100%; max-width: 600px; padding: 0 1rem; box-sizing: border-box;}
                .task-badge { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; font-family: var(--font-mono);}
                .task-title { font-size: 2.2rem; color: white; margin: 0 auto; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); line-height: 1.2; word-break: break-word;}
                .task-role { color: #888; font-size: 0.85rem; margin-top: 15px; font-family: var(--font-mono); display: flex; align-items: center; justify-content: center; gap: 10px;}
                
                /* FOCUS TIP */
                .focus-tip { margin-top: 15px; font-size: 0.85rem; color: #888; font-style: italic; background: rgba(255,255,255,0.02); padding: 10px 20px; border-radius: 8px; border-left: 2px solid var(--accent-purple);}

                /* RHYTHM TABS */
                .rhythm-selector { display: flex; gap: 10px; margin-bottom: 2rem; z-index: 2; flex-wrap: wrap; justify-content: center; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 25px; border: 1px solid #222;}
                .btn-rhythm { background: transparent; border: none; color: #aaa; padding: 8px 20px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
                .btn-rhythm:hover { color: white; }
                .btn-rhythm.active { background: rgba(0, 230, 118, 0.15); color: var(--accent-green); font-weight: bold;}

                /* TIMER SVG */
                .timer-wrapper { position: relative; width: 320px; height: 320px; display: flex; justify-content: center; align-items: center; z-index: 2; margin-bottom: 2rem;}
                .timer-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
                .timer-circle-bg { fill: none; stroke: rgba(255,255,255,0.03); stroke-width: 8; }
                .timer-circle-progress { fill: none; stroke: var(--accent-green); stroke-width: 8; stroke-dasharray: 942; stroke-dashoffset: 0; transition: stroke-dashoffset 1s linear; stroke-linecap: round; filter: drop-shadow(0 0 10px rgba(0,230,118,0.5));}
                
                .timer-container { position: relative; display: flex; justify-content: center; align-items: center; flex-direction: column; }
                .time-display { font-size: 5rem; font-weight: 800; font-family: var(--font-mono); color: white; letter-spacing: -2px; z-index: 3; line-height: 1;}
                .time-display span { font-size: 2.5rem; color: #444; vertical-align: middle; padding: 0 2px;}
                .time-label { color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;}

                /* CONTROLS */
                .controls { display: flex; gap: 1.5rem; z-index: 2; align-items: center; justify-content: center;}
                .btn-circle { width: 70px; height: 70px; border-radius: 50%; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 1.8rem; transition: transform 0.2s, background 0.3s; }
                .btn-play { background: white; color: black; box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2); }
                .btn-play:hover { transform: scale(1.05); background: #eee; }
                .btn-pause { background: #222; color: white; border: 1px solid #444; }
                .btn-pause:hover { background: #333; }
                .btn-stop { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px solid var(--accent-red); display: none; }
                .btn-stop:hover { background: var(--accent-red); color: white; box-shadow: 0 10px 20px rgba(255, 82, 82, 0.3); }
                
                .btn-direct { background: transparent; border: 1px dashed rgba(255,255,255,0.2); color: #ccc; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; margin-top: 2rem;}
                .btn-direct:hover { background: rgba(255,255,255,0.05); border-color: white; color: white; }

                .daily-yield { position: absolute; bottom: 2rem; left: 3rem; display: flex; gap: 2rem; background: rgba(0,0,0,0.6); padding: 1rem 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); z-index: 10; backdrop-filter: blur(10px);}
                .yield-stat { display: flex; flex-direction: column; align-items: center; }
                .yield-val { font-size: 1.2rem; font-weight: bold; color: white; font-family: var(--font-mono);}
                .yield-lbl { font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px;}

                /* MODAL DE REPORTE */
                .report-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .report-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 3rem; border-radius: var(--border-radius-lg); width: 100%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box;}
                .report-card h2 { color: white; margin-top: 0; font-size: 1.8rem; }
                .form-group { margin-bottom: 1.5rem; text-align: left; }
                .form-group label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-green); outline: none; box-shadow: 0 0 10px rgba(0, 230, 118, 0.1);}

                .glow-bg { position: absolute; width: 800px; height: 800px; background: radial-gradient(circle, rgba(0, 230, 118, 0.05) 0%, transparent 60%); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0; transition: opacity 1s, background 1s; pointer-events: none;}
                .glow-bg.running { opacity: 1; animation: pulseGlow 4s infinite alternate; }
                
                @keyframes pulseGlow { 0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5;} 100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1;} }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (FIELD APP)
                   ========================================================= */
                @media (max-width: 768px) {
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    
                    .omni-container { flex-direction: column; align-items: stretch; width: 100%; border-radius: 12px; padding: 15px;}
                    .omni-selector { width: 100%; max-width: 100%;}
                    .omni-label { display: block; font-size:0.7rem; color:#888;} /* Lo mostramos arriba en móvil */

                    .timer-wrapper { width: 260px; height: 260px; }
                    .time-display { font-size: 3.5rem; }
                    .task-title { font-size: 1.6rem; }
                    
                    .daily-yield { bottom: 90px; left: 1rem; right: 1rem; width: auto; justify-content: space-around; padding: 1rem;}
                    .report-card { padding: 2rem 1.5rem; width: 95%; max-width: 100%;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/focus')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div class="glow-bg" id="glowBg"></div>
                    
                    <div class="focus-container">
                        <div class="omni-container" id="omniContainer">
                            <span class="omni-label">Cambiando Foco:</span>
                            <select id="omniSelector" class="omni-selector"></select>
                        </div>

                        <div class="empty-state" id="emptyState">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">☕</div>
                            <h2 style="color: white; font-size: 2rem; margin: 0;">Nada en tu escritorio.</h2>
                            <p style="color: var(--text-muted);">Ve al Kanban, haz PULL de una tarea teórica y vuelve aquí para entrar en Flow.</p>
                            <a href="/v5/project" data-link style="background: white; color: black; margin-top: 1rem; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 1rem; font-weight: bold; transition: transform 0.2s;">Ir al Kanban</a>
                        </div>

                        <div id="workState" style="display: none; flex-direction: column; align-items: center; width: 100%;">
                            
                            <div class="task-context">
                                <div class="task-badge" id="taskType">--</div>
                                <h1 class="task-title" id="taskName">Cargando Entregable...</h1>
                                <div class="task-role">
                                    <span>Operando como:</span> <span id="taskRole" style="color: #fff; font-weight: bold; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.1);">--</span>
                                </div>
                                <div class="focus-tip" id="focusTip">"El valor fluye donde la atención se enfoca."</div>
                            </div>

                            <div class="rhythm-selector">
                                <button class="btn-rhythm active" data-rhythm="stopwatch" title="Cronómetro progresivo">♾️ Cronómetro</button>
                                <button class="btn-rhythm" data-rhythm="pomodoro_25" title="25m Trabajo / 5m Descanso">🍅 Sprint 25m</button>
                                <button class="btn-rhythm" data-rhythm="pomodoro_50" title="50m Trabajo / 10m Descanso">🌊 Flow 50m</button>
                            </div>

                            <div class="timer-wrapper">
                                <svg class="timer-svg" viewBox="0 0 320 320">
                                    <circle class="timer-circle-bg" cx="160" cy="160" r="150"></circle>
                                    <circle class="timer-circle-progress" id="timerProgress" cx="160" cy="160" r="150"></circle>
                                </svg>
                                <div class="timer-container">
                                    <div class="time-display" id="timeDisplay">00<span>:</span>00<span>:</span>00</div>
                                    <div class="time-label" id="timeLabel">FOCUS</div>
                                </div>
                            </div>

                            <div class="controls">
                                <button class="btn-circle btn-pause" id="btnPause" title="Pausar Reloj" style="display: none;">⏸</button>
                                <button class="btn-circle btn-play" id="btnPlay" title="Iniciar Deep Work">▶</button>
                                <button class="btn-circle btn-stop" id="btnStop" title="Terminar y Reportar">⏹</button>
                            </div>
                            
                            <button class="btn-direct" id="btnDirectReport">📝 Introducir horas manuales</button>
                        </div>
                    </div>

                    <div class="daily-yield desktop-only" id="dailyYield" style="display:none;">
                        <div class="yield-stat">
                            <span class="yield-val" id="dyHours" style="color: var(--accent-blue);">0.0h</span>
                            <span class="yield-lbl">Hoy</span>
                        </div>
                        <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
                        <div class="yield-stat">
                            <span class="yield-val" id="dySlices" style="color: var(--accent-green);">0</span>
                            <span class="yield-lbl">Slices (Est.)</span>
                        </div>
                    </div>

                    <div class="report-modal" id="reportModal">
                        <div class="report-card">
                            <h2>Consolidar Esfuerzo (PoW)</h2>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Envía el <i>Proof of Work</i> para que el Auditor valide la inyección en el Ledger.</p>
                            
                            <div class="form-group">
                                <label style="color: var(--accent-blue);">Tiempo Real Invertido (Horas ej: 1.5, 0.25)</label>
                                <input type="number" step="0.1" id="inpRealHours" class="form-control" value="0.0">
                            </div>
                            
                            <div class="form-group">
                                <label>Enlace al Entregable (Figma, GitHub, Docs...)</label>
                                <input type="text" id="inpProof" class="form-control" placeholder="https://...">
                            </div>

                            <div class="form-group">
                                <label>Comentarios para el Auditor (Opcional)</label>
                                <textarea id="inpComment" class="form-control" rows="2" placeholder="Notas sobre el desarrollo..."></textarea>
                            </div>

                            <div style="display: flex; justify-content: space-between; margin-top: 2rem; gap: 10px;">
                                <button class="btn" id="btnCancelReport" style="background: transparent; border: 1px solid var(--glass-border); color: white; padding: 12px 20px; border-radius: 8px; cursor: pointer; flex: 1;">Cancelar</button>
                                <button class="btn" id="btnSubmitReport" style="background: var(--accent-blue); color: black; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; flex: 2; transition: transform 0.2s;">📤 Firmar Trabajo</button>
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
            emptyState: document.getElementById('emptyState'),
            workState: document.getElementById('workState'),
            taskName: document.getElementById('taskName'),
            taskRole: document.getElementById('taskRole'),
            taskType: document.getElementById('taskType'),
            focusTip: document.getElementById('focusTip'),
            timeDisplay: document.getElementById('timeDisplay'),
            timeLabel: document.getElementById('timeLabel'),
            timerProgress: document.getElementById('timerProgress'),
            glowBg: document.getElementById('glowBg'),
            btnPlay: document.getElementById('btnPlay'),
            btnPause: document.getElementById('btnPause'),
            btnStop: document.getElementById('btnStop'),
            btnDirectReport: document.getElementById('btnDirectReport'),
            modal: document.getElementById('reportModal'),
            inpRealHours: document.getElementById('inpRealHours'),
            inpProof: document.getElementById('inpProof'),
            inpComment: document.getElementById('inpComment'),
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnCancel: document.getElementById('btnCancelReport'),
            omniContainer: document.getElementById('omniContainer'),
            omniSelector: document.getElementById('omniSelector'),
            dailyYield: document.getElementById('dailyYield'),
            dyHours: document.getElementById('dyHours'),
            dySlices: document.getElementById('dySlices')
        };

        // 1. RECOPILAR TODAS LAS TAREAS (OMNI-RED)
        let allMyTasks = [];
        
        state.projects.forEach(p => {
            if (p.transactions) {
                let tasks = p.transactions.filter(tx => tx.status === 'pinged' && tx.assigneeId === activeUserId);
                
                if(tasks.length === 0 && state.session.role === 'ecosystem-owner') {
                    // El owner puede ver tareas para reportarlas si están huérfanas o quiere probar
                    tasks = p.transactions.filter(tx => tx.status === 'pinged');
                }
                
                tasks.forEach(tx => {
                    allMyTasks.push({ ...tx, projectId: p.id, projectName: p.nombre });
                });
            }
        });

        allMyTasks.sort((a, b) => a.projectName.localeCompare(b.projectName));

        if (allMyTasks.length === 0) {
            this.dom.emptyState.style.display = 'flex';
        } else {
            this.dom.workState.style.display = 'flex';
            if (window.innerWidth > 768) this.dom.dailyYield.style.display = 'flex'; // Oculto en móvil
            
            let activeProjectId = localStorage.getItem('tt_active_project');
            if(activeProjectId) {
                const projTasks = allMyTasks.filter(t => t.projectId === activeProjectId);
                this.activeTx = projTasks.length > 0 ? projTasks[0] : allMyTasks[0];
            } else {
                this.activeTx = allMyTasks[0];
            }
            
            // Mostrar selector solo si hay más de 1 tarea
            if (allMyTasks.length > 1) {
                this.dom.omniContainer.style.display = 'flex';
                this.dom.omniSelector.innerHTML = allMyTasks.map((t) => 
                    `<option value="${t.hash}" data-pid="${t.projectId}" ${t.hash===this.activeTx.hash?'selected':''}>${t.entregable} (${t.projectName})</option>`
                ).join('');
            }

            // RECUPERAR ESTADO DE PERSISTENCIA (FIX V8.5)
            const cachedTime = localStorage.getItem(`tt_focus_${this.activeTx.hash}_elapsed`);
            const cachedStart = localStorage.getItem(`tt_focus_${this.activeTx.hash}_start`);
            const cachedRunning = localStorage.getItem(`tt_focus_${this.activeTx.hash}_running`);
            const cachedMode = localStorage.getItem(`tt_focus_${this.activeTx.hash}_mode`);

            if (cachedMode) {
                this.mode = cachedMode;
                document.querySelectorAll('.btn-rhythm').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.rhythm === cachedMode) b.classList.add('active');
                });
            }

            if (cachedTime) this.secondsElapsed = parseInt(cachedTime, 10);
            
            // Si el reloj quedó corriendo mientras cerraba la app, calculamos el tiempo perdido
            if (cachedRunning === 'true' && cachedStart) {
                const now = Date.now();
                const diffSeconds = Math.floor((now - parseInt(cachedStart, 10)) / 1000);
                this.secondsElapsed += diffSeconds;
                this.startTimer(); // Lo reanudamos visualmente
            }

            this.setupTaskData(state);
            this.setupTimerControls();
            this.calculateGlobalDailyYield(state, activeUserId);
            this.updateDisplay();

            this.dom.omniSelector.addEventListener('change', (e) => {
                this.pauseTimer();
                this.activeTx = allMyTasks.find(t => t.hash === e.target.value);
                
                const cache = localStorage.getItem(`tt_focus_${this.activeTx.hash}_elapsed`);
                this.secondsElapsed = cache ? parseInt(cache, 10) : 0;
                
                this.setupTaskData(state);
                this.updateDisplay();
            });
        }
    }

    setupTaskData(state) {
        const project = state.projects.find(p => p.id === this.activeTx.projectId);
        
        this.dom.taskName.innerText = this.activeTx.entregable;
        this.dom.taskType.innerText = this.activeTx.tipo === 'tangible' ? '🟢 Entregable Tangible' : '🟣 Entregable Intangible';
        
        const roleFrom = project.roles.find(r => r.id === this.activeTx.from);
        if (roleFrom) {
            this.dom.taskRole.innerText = `${roleFrom.levelId} - ${roleFrom.name}`;
            const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
            this.dom.taskRole.style.color = colors[roleFrom.levelId] || 'white';
        }

        // Random Focus Tip
        const randomTip = this.focusTips[Math.floor(Math.random() * this.focusTips.length)];
        this.dom.focusTip.innerText = randomTip;
    }

    calculateGlobalDailyYield(state, userId) {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let todayHours = 0;
        let todaySlices = 0;

        state.projects.forEach(p => {
            if (p.ledger) {
                const userBlocks = p.ledger.filter(l => l.userId === userId && l.timestamp >= today.getTime());
                userBlocks.forEach(b => {
                    todayHours += b.horas || 0;
                    todaySlices += b.valorCongelado || 0;
                });
            }
        });

        this.dom.dyHours.innerText = todayHours.toFixed(1) + 'h';
        this.dom.dySlices.innerText = Math.round(todaySlices).toLocaleString();
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
                localStorage.setItem(`tt_focus_${this.activeTx.hash}_mode`, this.mode);

                if (this.mode === 'pomodoro_25') this.targetSeconds = 25 * 60;
                else if (this.mode === 'pomodoro_50') this.targetSeconds = 50 * 60;
                else this.targetSeconds = 0;
                
                this.secondsElapsed = 0; 
                this.updateDisplay();
            });
        });
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        
        this.dom.btnPlay.style.display = 'none';
        this.dom.btnDirectReport.style.display = 'none'; 
        this.dom.btnPause.style.display = 'flex';
        this.dom.btnStop.style.display = 'flex';
        this.dom.glowBg.classList.add('running');

        // Persistencia para que los navbars externos sepan que hay un pomodoro
        localStorage.setItem('tt_active_pomodoro_tx', this.activeTx.hash);
        localStorage.setItem(`tt_focus_${this.activeTx.hash}_running`, 'true');

        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const tickDiff = Math.floor((now - this.startTime) / 1000);
            this.startTime = now; // Reset para el proximo tick

            if (this.mode === 'stopwatch') {
                this.secondsElapsed += tickDiff;
            } else {
                if (this.targetSeconds > 0) this.targetSeconds -= tickDiff;
                if (this.targetSeconds <= 0) {
                    this.pauseTimer();
                    this.targetSeconds = 0;
                    alert("🔔 ¡Sesión completada! Es hora de un descanso. Reporta el progreso para asegurar tus Slices.");
                    this.openReportModal(true);
                }
            }
            
            // Guardado hiper-frecuente para evitar perdida de tiempo si se cierra la pestaña
            localStorage.setItem(`tt_focus_${this.activeTx.hash}_elapsed`, this.secondsElapsed);
            localStorage.setItem(`tt_focus_${this.activeTx.hash}_start`, now);
            
            this.updateDisplay();
            this.dispatchNavSyncEvent(); // Avisar al DOM de que el reloj late
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.glowBg.classList.remove('running');
        
        localStorage.setItem(`tt_focus_${this.activeTx.hash}_running`, 'false');
        localStorage.removeItem('tt_active_pomodoro_tx');
        this.dispatchNavSyncEvent();
    }

    openReportModal(fromTimer) {
        this.pauseTimer();
        
        if (fromTimer) {
            let workedSecs = this.mode === 'stopwatch' ? this.secondsElapsed : ((this.mode === 'pomodoro_25' ? 25*60 : 50*60) - this.targetSeconds);
            const hoursCalc = (workedSecs / 3600).toFixed(2);
            this.dom.inpRealHours.value = hoursCalc > 0.01 ? hoursCalc : 0.1; 
        } else {
            this.dom.inpRealHours.value = this.activeTx.horas || 1.0; 
        }

        this.dom.modal.style.display = 'flex';
    }

    submitReport() {
        const finalHours = parseFloat(this.dom.inpRealHours.value) || 0;
        if (finalHours <= 0) return alert("⚠️ Debes introducir un tiempo válido (ej. 0.5, 1.2, etc.)");
        
        store.dispatch({
            type: 'REPORT_TRANSACTION',
            payload: {
                projectId: this.activeTx.projectId,
                txHash: this.activeTx.hash,
                realHours: finalHours, 
                proofLink: this.dom.inpProof.value,
                comentario: this.dom.inpComment.value
            }
        }).then(() => {
            // Limpieza total del cache al consolidar
            localStorage.removeItem(`tt_focus_${this.activeTx.hash}_elapsed`);
            localStorage.removeItem(`tt_focus_${this.activeTx.hash}_start`);
            localStorage.removeItem(`tt_focus_${this.activeTx.hash}_running`);
            localStorage.removeItem('tt_active_pomodoro_tx');
            this.dispatchNavSyncEvent();
            
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
        // Lanza un evento global para que BottomNav y Sidebar actualicen el icono del tomate
        window.dispatchEvent(new Event('pomodoro_tick'));
    }
}
