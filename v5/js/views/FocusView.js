// v5/js/views/FocusView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; // INYECCIÓN V8.0

export default class FocusView {
    constructor() {
        document.title = "Deep Work | TeamTowers";
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isRunning = false;
        this.activeTx = null;
        this.mode = 'stopwatch'; // 'stopwatch', 'pomodoro_25', 'pomodoro_50'
        this.targetSeconds = 0;
    }

    async getHtml() {
        // Datos para el Mobile Top Bar
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: var(--font-main); }
                
                .focus-workspace { 
                    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    background: radial-gradient(circle at center, #16161e 0%, #050505 100%);
                    position: relative; overflow: hidden;
                }

                /* =========================================================
                   MOBILE TOP BAR (DRY V8.0)
                   ========================================================= */
                .mobile-top-bar {
                    display: none; justify-content: space-between; align-items: center; padding: 15px 20px;
                    background: rgba(10, 10, 14, 0.95); border-bottom: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px); position: absolute; top: 0; left: 0; width: 100%; z-index: 1000; box-sizing: border-box;
                }
                .mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                .mob-project-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--accent-blue); padding: 5px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; outline: none; max-width: 150px; }
                .mob-user { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: var(--accent-purple); color: white; border-radius: 50%; font-weight: bold; text-decoration: none; font-size: 0.9rem; }

                /* TOP NAV FOCUS (Desktop/iPad) */
                .top-nav-focus { position: absolute; top: 0; left: 0; width: 100%; padding: 2rem; display: flex; justify-content: space-between; align-items: center; z-index: 10; flex-wrap: wrap; gap: 15px; box-sizing: border-box;}
                
                .omni-container { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.6); padding: 8px 20px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); display: none;}
                .omni-label { color: var(--accent-blue); font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .omni-selector { background: transparent; border: none; border-bottom: 1px dashed rgba(255,255,255,0.3); color: white; padding: 5px 0; font-family: var(--font-mono); font-size: 0.9rem; outline: none; cursor: pointer; max-width: 350px; text-overflow: ellipsis; transition: all 0.2s;}
                .omni-selector:hover { border-color: var(--accent-blue); }
                .omni-selector option { background: #111; color: white; }

                .empty-state { text-align: center; color: var(--text-muted); display: none; flex-direction: column; align-items: center; gap: 1rem; z-index: 5;}
                
                /* TASK CONTEXT */
                .task-context { text-align: center; margin-bottom: 2rem; z-index: 2; animation: fadeIn 0.5s ease-out; width: 100%; padding: 0 1rem; box-sizing: border-box;}
                .task-badge { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; font-family: var(--font-mono);}
                .task-title { font-size: 2.2rem; color: white; margin: 0 auto; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); max-width: 600px; line-height: 1.2; word-break: break-word;}
                .task-role { color: #888; font-size: 1rem; margin-top: 10px; font-family: var(--font-mono); display: flex; align-items: center; justify-content: center; gap: 10px;}

                .rhythm-selector { display: flex; gap: 10px; margin-bottom: 2rem; z-index: 2; flex-wrap: wrap; justify-content: center;}
                .btn-rhythm { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #aaa; padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
                .btn-rhythm.active { background: rgba(0, 230, 118, 0.15); color: var(--accent-green); border-color: var(--accent-green); font-weight: bold;}

                /* TIMER SVG */
                .timer-wrapper { position: relative; width: 320px; height: 320px; display: flex; justify-content: center; align-items: center; z-index: 2; margin-bottom: 2rem;}
                .timer-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
                .timer-circle-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 8; }
                .timer-circle-progress { fill: none; stroke: var(--accent-green); stroke-width: 8; stroke-dasharray: 942; stroke-dashoffset: 0; transition: stroke-dashoffset 1s linear; stroke-linecap: round; }
                
                .timer-container { position: relative; display: flex; justify-content: center; align-items: center; flex-direction: column; }
                .time-display { font-size: 5rem; font-weight: 800; font-family: var(--font-mono); color: white; letter-spacing: -2px; z-index: 3; line-height: 1;}
                .time-display span { font-size: 2rem; color: #555; }
                .time-label { color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;}

                /* CONTROLS */
                .controls { display: flex; gap: 1.5rem; z-index: 2; align-items: center; justify-content: center;}
                .btn-circle { width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; transition: transform 0.2s, background 0.3s; }
                .btn-play { background: white; color: black; box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2); }
                .btn-play:hover { transform: scale(1.1); background: #eee; }
                .btn-pause { background: #333; color: white; }
                .btn-pause:hover { background: #444; }
                .btn-stop { background: var(--accent-red); color: white; display: none; }
                .btn-stop:hover { background: #ff1744; box-shadow: 0 10px 20px rgba(255, 82, 82, 0.3); }
                
                .btn-direct { background: transparent; border: 1px dashed rgba(255,255,255,0.2); color: #ccc; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; margin-top: 2rem;}
                .btn-direct:hover { background: rgba(255,255,255,0.05); border-color: white; color: white; }

                .daily-yield { position: absolute; bottom: 2rem; display: flex; gap: 2rem; background: rgba(0,0,0,0.6); padding: 1rem 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); z-index: 10; backdrop-filter: blur(10px);}
                .yield-stat { display: flex; flex-direction: column; align-items: center; }
                .yield-val { font-size: 1.2rem; font-weight: bold; color: white; font-family: var(--font-mono);}
                .yield-lbl { font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px;}

                /* MODAL DE REPORTE */
                .report-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .report-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 3rem; border-radius: var(--border-radius-lg); width: 100%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box;}
                .report-card h2 { color: white; margin-top: 0; font-size: 1.8rem; }
                .form-group { margin-bottom: 1.5rem; text-align: left; }
                .form-group label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-green); outline: none; box-shadow: 0 0 10px rgba(0, 230, 118, 0.1);}

                .glow-bg { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, transparent 70%); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0; transition: opacity 1s, background 1s; pointer-events: none;}
                .glow-bg.running { opacity: 1; animation: pulseGlow 4s infinite alternate; }
                
                @keyframes pulseGlow { 0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5;} 100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1;} }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (FIELD APP)
                   ========================================================= */
                @media (max-width: 768px) {
                    .focus-workspace { padding-bottom: 70px; } /* Evita pisar BottomNav */
                    
                    /* Oculta barra nativa focus y muestra Top Bar Universal */
                    .top-nav-focus { display: none !important; }
                    .mobile-top-bar { display: flex; }
                    
                    .omni-container { 
                        display: flex !important; /* Fuerza mostrarlo pero relocalizado */
                        position: absolute; 
                        top: 80px; 
                        left: 50%; 
                        transform: translateX(-50%);
                        width: 90%; 
                        justify-content: center;
                    }
                    .omni-label { display: none; } /* Mucho texto para movil */

                    .timer-wrapper { width: 250px; height: 250px; }
                    .time-display { font-size: 3.5rem; }
                    .task-title { font-size: 1.5rem; }
                    
                    .daily-yield { bottom: 90px; padding: 0.8rem 1.5rem; gap: 1rem; width: 90%; justify-content: space-around;}
                    .report-card { padding: 2rem 1.5rem; width: 95%; max-width: 100%;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/focus')}

                <main class="focus-workspace">
                    <div class="glow-bg" id="glowBg"></div>
                    
                    <header class="mobile-top-bar">
                        <a href="/v5/" data-link class="mob-brand">🗼</a>
                        
                        <select class="mob-project-select" id="mobProjectSelect">
                            ${userProjects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                        </select>

                        <a href="/v5/profile" data-link class="mob-user" title="Mi Perfil">
                            ${state.globalUsers.find(u => u.id === activeUserId)?.name.charAt(0).toUpperCase() || '?'}
                        </a>
                    </header>

                    <div class="top-nav-focus">
                        <div style="color: #555; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; letter-spacing: 1px;">KERNEL // FLOW STATE</div>
                    </div>

                    <div class="omni-container" id="omniContainer">
                        <span class="omni-label">▶ Selecciona Entregable:</span>
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
                            <div class="task-role">Silla actual: <span id="taskRole" style="color: #fff; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.1);">--</span></div>
                        </div>

                        <div class="rhythm-selector">
                            <button class="btn-rhythm active" data-rhythm="stopwatch" title="Cronómetro libre">♾️ Libre</button>
                            <button class="btn-rhythm" data-rhythm="pomodoro_25" title="25m Trabajo / 5m Descanso">🍅 Sprint (25m)</button>
                            <button class="btn-rhythm" data-rhythm="pomodoro_50" title="50m Trabajo / 10m Descanso">🌊 Flow (50m)</button>
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
                        
                        <button class="btn-direct" id="btnDirectReport">📝 Ingresar horas manuales</button>
                    </div>

                    <div class="daily-yield" id="dailyYield" style="display:none;">
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

        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        // --- MOBILE TOP BAR LOGIC ---
        let activeProjectId = localStorage.getItem('tt_active_project') || (state.projects.length > 0 ? state.projects[state.projects.length - 1].id : null);
        const mobSelect = document.getElementById('mobProjectSelect');
        if (mobSelect && activeProjectId) {
            mobSelect.value = activeProjectId;
            mobSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                window.location.reload(); 
            });
        }

        this.dom = {
            emptyState: document.getElementById('emptyState'),
            workState: document.getElementById('workState'),
            taskName: document.getElementById('taskName'),
            taskRole: document.getElementById('taskRole'),
            taskType: document.getElementById('taskType'),
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

        // 1. RECOPILAR TODAS LAS TAREAS DE TODOS LOS PROYECTOS (OMNI-RED)
        let allMyTasks = [];
        
        state.projects.forEach(p => {
            if (p.transactions) {
                let tasks = p.transactions.filter(tx => tx.status === 'pinged' && tx.assigneeId === activeUserId);
                
                // Fallback para Owner si no tiene tareas propias
                if(tasks.length === 0 && state.session.role === 'ecosystem-owner' && p.id === state.projects[state.projects.length-1].id) {
                    tasks = p.transactions.filter(tx => tx.status === 'pinged');
                }
                
                tasks.forEach(tx => {
                    allMyTasks.push({ ...tx, projectId: p.id, projectName: p.nombre });
                });
            }
        });

        // Ordenar alfabéticamente
        allMyTasks.sort((a, b) => a.projectName.localeCompare(b.projectName));

        if (allMyTasks.length === 0) {
            this.dom.emptyState.style.display = 'flex';
        } else {
            this.dom.workState.style.display = 'flex';
            this.dom.dailyYield.style.display = 'flex';
            
            // Si hay tareas y estamos en un proyecto específico por localStorage, intentamos poner una de ese proyecto primero
            if(activeProjectId) {
                const projTasks = allMyTasks.filter(t => t.projectId === activeProjectId);
                if (projTasks.length > 0) {
                    this.activeTx = projTasks[0];
                } else {
                    this.activeTx = allMyTasks[0];
                }
            } else {
                this.activeTx = allMyTasks[0];
            }
            
            this.dom.omniContainer.style.display = 'flex';
            
            // Evitamos añadir style inline a omniContainer si estamos en móvil para que mande el CSS de la Media Query
            if (window.innerWidth <= 768) {
                this.dom.omniContainer.style.display = 'flex'; 
            }

            this.dom.omniSelector.innerHTML = allMyTasks.map((t) => 
                `<option value="${t.hash}" data-pid="${t.projectId}" ${t.hash===this.activeTx.hash?'selected':''}>${t.entregable} (${t.projectName})</option>`
            ).join('');
            
            const cachedTime = localStorage.getItem(`tt_focus_${this.activeTx.hash}`);
            if (cachedTime) this.secondsElapsed = parseInt(cachedTime, 10);

            this.setupTaskData(state);
            this.setupTimerControls();
            this.calculateGlobalDailyYield(state, activeUserId);
            this.updateDisplay();

            this.dom.omniSelector.addEventListener('change', (e) => {
                this.pauseTimer();
                this.activeTx = allMyTasks.find(t => t.hash === e.target.value);
                const cache = localStorage.getItem(`tt_focus_${this.activeTx.hash}`);
                this.secondsElapsed = cache ? parseInt(cache, 10) : 0;
                this.setupTaskData(state);
                this.updateDisplay();
            });
        }
    }

    setupTaskData(state) {
        const project = state.projects.find(p => p.id === this.activeTx.projectId);
        
        this.dom.taskName.innerText = this.activeTx.entregable;
        this.dom.taskType.innerText = `[${this.activeTx.tipo}] PoW Requerido`;
        
        const roleFrom = project.roles.find(r => r.id === this.activeTx.from);
        if (roleFrom) {
            this.dom.taskRole.innerText = `${roleFrom.levelId} - ${roleFrom.name}`;
            const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
            this.dom.taskRole.style.color = colors[roleFrom.levelId] || 'white';
        }
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
        this.dom.btnPlay.style.display = 'none';
        this.dom.btnDirectReport.style.display = 'none'; 
        this.dom.btnPause.style.display = 'flex';
        this.dom.btnStop.style.display = 'flex';
        this.dom.glowBg.classList.add('running');

        this.timerInterval = setInterval(() => {
            if (this.mode === 'stopwatch') {
                this.secondsElapsed++;
            } else {
                if (this.targetSeconds > 0) this.targetSeconds--;
                if (this.targetSeconds <= 0) {
                    this.pauseTimer();
                    alert("¡Sesión completada! Es hora de un descanso. ¿Reportamos el progreso?");
                }
            }
            
            localStorage.setItem(`tt_focus_${this.activeTx.hash}`, this.mode === 'stopwatch' ? this.secondsElapsed : (this.activeTx.horas*3600 - this.targetSeconds));
            
            this.updateDisplay();
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.glowBg.classList.remove('running');
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
            localStorage.removeItem(`tt_focus_${this.activeTx.hash}`);
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
            this.dom.timeLabel.innerText = "SPRINT";
        } else {
            this.dom.timerProgress.style.strokeDashoffset = 0;
            this.dom.timerProgress.style.stroke = 'rgba(255,255,255,0.2)';
            this.dom.timeLabel.innerText = "DEEP WORK";
        }
    }
}
