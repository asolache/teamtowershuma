// v5/js/views/FocusView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 

export default class FocusView {
    constructor() {
        document.title = "Deep Work | TeamTowers";
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isRunning = false;
        this.activeTx = null;
        this.mode = 'stopwatch'; // 'stopwatch', 'pomodoro_25', 'pomodoro_50'
        this.targetSeconds = 0;
        this.startTime = null; 
        
        // Frases estoicas/zen para inspirar el trabajo profundo
        this.focusTips = [
            "Concéntrate en la tarea presente como si fuera la última. — M. Aurelio",
            "El valor fluye donde la atención se enfoca.",
            "Una tarea terminada es un paso más hacia tu soberanía.",
            "La calidad del trabajo de hoy es el patrimonio del mañana.",
            "Trabajo profundo: Sin distracciones. Solo ejecución."
        ];
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #050505; font-family: var(--font-main); }
                
                /* Workspace sin scroll para que parezca una app nativa inmersiva */
                .workspace { flex: 1; display: flex; flex-direction: column; position: relative; background: radial-gradient(circle at center, #111116 0%, #050505 100%); overflow: hidden; }
                
                /* =========================================================
                   FOCUS TOP BAR (Custom Inmersivo)
                   ========================================================= */
                .focus-top-bar {
                    display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;
                    background: rgba(10, 10, 14, 0.95); border-bottom: 1px solid rgba(224, 64, 251, 0.2);
                    backdrop-filter: blur(10px); z-index: 1000; flex-shrink: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                
                .focus-selector-wrapper { flex: 1; margin: 0 15px; position: relative; }
                .omni-selector { 
                    width: 100%; background: rgba(224, 64, 251, 0.1); border: 1px solid var(--accent-purple); color: white; 
                    padding: 8px 15px; border-radius: 20px; font-family: var(--font-mono); font-size: 0.85rem; 
                    outline: none; cursor: pointer; text-align: center; appearance: none; font-weight: bold;
                    text-overflow: ellipsis; white-space: nowrap; overflow: hidden; transition: all 0.2s;
                }
                .omni-selector:focus { border-color: var(--accent-orange); box-shadow: 0 0 10px rgba(255, 171, 64, 0.3); }
                .omni-selector option { background: #111; color: white; }
                
                /* Flechita custom para el select */
                .focus-selector-wrapper::after {
                    content: '▼'; position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
                    color: var(--accent-purple); font-size: 0.6rem; pointer-events: none;
                }

                .mob-user { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: var(--accent-purple); color: white; border-radius: 50%; font-weight: bold; text-decoration: none; font-size: 0.9rem; flex-shrink: 0;}

                /* =========================================================
                   CONTENEDOR CENTRAL
                   ========================================================= */
                .focus-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; position: relative; z-index: 10; padding: 1rem 2rem;}

                .empty-state { text-align: center; color: var(--text-muted); display: none; flex-direction: column; align-items: center; gap: 1rem; z-index: 5;}
                
                .task-context { text-align: center; width: 100%; max-width: 600px; animation: fadeIn 0.5s ease-out; }
                .task-badge { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: inline-block; font-family: var(--font-mono);}
                .task-title { font-size: 1.8rem; color: white; margin: 0 auto; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); line-height: 1.2; word-break: break-word;}
                .focus-tip { margin-top: 10px; font-size: 0.8rem; color: #888; font-style: italic; background: rgba(255,255,255,0.02); padding: 8px 15px; border-radius: 8px; border-left: 2px solid var(--accent-purple); display: inline-block;}

                .rhythm-selector { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 25px; border: 1px solid #222;}
                .btn-rhythm { background: transparent; border: none; color: #aaa; padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
                .btn-rhythm:hover { color: white; }
                .btn-rhythm.active { background: rgba(0, 230, 118, 0.15); color: var(--accent-green); font-weight: bold; border: 1px solid rgba(0, 230, 118, 0.3);}

                /* =========================================================
                   TIMER SVG & TOMATO 🍅
                   ========================================================= */
                .timer-wrapper { position: relative; width: 280px; height: 280px; display: flex; justify-content: center; align-items: center; z-index: 2; margin: 10px 0;}
                .timer-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
                .timer-circle-bg { fill: none; stroke: rgba(255,255,255,0.03); stroke-width: 8; }
                .timer-circle-progress { fill: none; stroke: var(--accent-green); stroke-width: 8; stroke-dasharray: 942; stroke-dashoffset: 0; transition: stroke-dashoffset 1s linear; stroke-linecap: round; filter: drop-shadow(0 0 10px rgba(0,230,118,0.5));}
                
                .timer-container { position: relative; display: flex; justify-content: center; align-items: center; flex-direction: column; }
                
                .pomodoro-icon { font-size: 2rem; margin-bottom: 5px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); transition: all 0.3s;}
                .pomodoro-icon.ticking { animation: tickTock 1s infinite alternate ease-in-out; filter: drop-shadow(0 0 15px rgba(255, 82, 82, 0.8)); }
                
                .time-display { font-size: 4rem; font-weight: 900; font-family: var(--font-mono); color: white; letter-spacing: -2px; z-index: 3; line-height: 1; text-shadow: 0 4px 15px rgba(0,0,0,0.8);}
                .time-display span { font-size: 2rem; color: #555; vertical-align: baseline; padding: 0 2px;}
                .time-label { color: var(--accent-green); font-family: var(--font-mono); font-size: 0.75rem; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;}

                /* CONTROLS */
                .controls { display: flex; gap: 1.5rem; z-index: 2; align-items: center; justify-content: center;}
                .btn-circle { width: 65px; height: 65px; border-radius: 50%; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; transition: transform 0.2s, background 0.3s; }
                .btn-play { background: white; color: black; box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2); }
                .btn-play:hover { transform: scale(1.05); background: #eee; }
                .btn-pause { background: #222; color: white; border: 1px solid #444; }
                .btn-pause:hover { background: #333; }
                .btn-stop { background: rgba(255, 82, 82, 0.1); color: var(--accent-red); border: 1px solid var(--accent-red); display: none; }
                .btn-stop:hover { background: var(--accent-red); color: white; box-shadow: 0 10px 20px rgba(255, 82, 82, 0.3); }
                
                .btn-direct { background: transparent; border: 1px dashed rgba(255,255,255,0.2); color: #ccc; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 0.8rem;}
                .btn-direct:hover { background: rgba(255,255,255,0.05); border-color: white; color: white; }

                /* MODAL DE REPORTE */
                .report-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .report-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: var(--border-radius-lg); width: 100%; max-width: 450px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; box-sizing: border-box;}
                .report-card h2 { color: white; margin-top: 0; font-size: 1.6rem; }
                .form-group { margin-bottom: 1.2rem; text-align: left; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 6px; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 10px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.95rem; transition: border-color 0.2s; box-sizing: border-box; outline:none;}
                .form-control:focus { border-color: var(--accent-green); box-shadow: 0 0 10px rgba(0, 230, 118, 0.1);}

                .glow-bg { position: absolute; width: 800px; height: 800px; background: radial-gradient(circle, rgba(224, 64, 251, 0.05) 0%, transparent 60%); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0; transition: opacity 1s, background 1s; pointer-events: none;}
                .glow-bg.running { opacity: 1; animation: pulseGlow 4s infinite alternate; }
                
                @keyframes pulseGlow { 0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5;} 100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1;} }
                @keyframes tickTock { 0% { transform: scale(1) rotate(-5deg); } 100% { transform: scale(1.1) rotate(5deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* RESPONSIVE MOBILE TIGHT FIT */
                @media (max-width: 768px) {
                    .focus-container { justify-content: space-between; padding: 1rem 0; padding-bottom: 70px; /* offset bottom nav */}
                    .timer-wrapper { width: 250px; height: 250px; margin: 0; }
                    .time-display { font-size: 3.5rem; }
                    .task-title { font-size: 1.5rem; }
                    .task-context { margin-bottom: 10px; }
                    .rhythm-selector { margin-bottom: 10px; }
                    .focus-top-bar { padding: 10px 15px; }
                    .report-card { padding: 1.5rem; width: 95%; max-height: 90vh; overflow-y: auto;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/focus')}

                <main class="workspace">
                    <div class="glow-bg" id="glowBg"></div>
                    
                    <header class="focus-top-bar">
                        <a href="/v5/" data-link class="mob-brand">🗼</a>
                        
                        <div class="focus-selector-wrapper" id="omniContainer">
                            <select id="omniSelector" class="omni-selector">
                                <option value="" disabled selected>🎯 Selecciona entregable...</option>
                            </select>
                        </div>

                        <a href="/v5/profile" data-link class="mob-user" title="Mi Perfil">
                            ${user?.name.charAt(0).toUpperCase() || '?'}
                        </a>
                    </header>

                    <div class="focus-container">
                        
                        <div class="empty-state" id="emptyState">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">☕</div>
                            <h2 style="color: white; font-size: 2rem; margin: 0;">Escritorio Limpio.</h2>
                            <p style="color: var(--text-muted);">Ve al Kanban, haz PULL de un entregable y vuelve aquí para entrar en Flow.</p>
                            <a href="/v5/project" data-link style="background: white; color: black; margin-top: 1rem; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-size: 1rem; font-weight: bold; transition: transform 0.2s;">Ir al Kanban</a>
                        </div>

                        <div id="workState" style="display: none; flex-direction: column; align-items: center; width: 100%; height: 100%; justify-content: space-evenly;">
                            
                            <div class="task-context">
                                <div class="task-badge" id="taskType">--</div>
                                <h1 class="task-title" id="taskName">Selecciona una tarea arriba</h1>
                                <div class="focus-tip" id="focusTip">"El valor fluye donde la atención se enfoca."</div>
                            </div>

                            <div class="rhythm-selector">
                                <button class="btn-rhythm active" data-rhythm="stopwatch" title="Cronómetro progresivo">♾️ Libre</button>
                                <button class="btn-rhythm" data-rhythm="pomodoro_25" title="25m Trabajo / 5m Descanso">🍅 Sprint 25m</button>
                                <button class="btn-rhythm" data-rhythm="pomodoro_50" title="50m Trabajo / 10m Descanso">🌊 Flow 50m</button>
                            </div>

                            <div class="timer-wrapper">
                                <svg class="timer-svg" viewBox="0 0 320 320">
                                    <circle class="timer-circle-bg" cx="160" cy="160" r="150"></circle>
                                    <circle class="timer-circle-progress" id="timerProgress" cx="160" cy="160" r="150"></circle>
                                </svg>
                                <div class="timer-container">
                                    <div class="pomodoro-icon" id="pomodoroIcon">🍅</div>
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
                                <button class="btn" id="btnSubmitReport" style="background: var(--accent-blue); color: black; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; flex: 2; transition: transform 0.2s;">📤 Reportar trabajo</button>
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

        this.dom = {
            emptyState: document.getElementById('emptyState'),
            workState: document.getElementById('workState'),
            taskName: document.getElementById('taskName'),
            taskType: document.getElementById('taskType'),
            focusTip: document.getElementById('focusTip'),
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
            inpRealHours: document.getElementById('inpRealHours'),
            inpProof: document.getElementById('inpProof'),
            inpComment: document.getElementById('inpComment'),
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnCancel: document.getElementById('btnCancelReport'),
            omniContainer: document.getElementById('omniContainer'),
            omniSelector: document.getElementById('omniSelector')
        };

        // 1. RECOPILAR TODAS LAS TAREAS (OMNI-RED)
        let allMyTasks = [];
        
        state.projects.forEach(p => {
            if (p.transactions) {
                let tasks = p.transactions.filter(tx => tx.status === 'pinged' && tx.assigneeId === activeUserId);
                
                if(tasks.length === 0 && state.session.role === 'ecosystem-owner') {
                    tasks = p.transactions.filter(tx => tx.status === 'pinged');
                }
                
                tasks.forEach(tx => {
                    const roleFrom = p.roles.find(r => r.id === tx.from);
                    allMyTasks.push({ ...tx, projectId: p.id, projectName: p.nombre, roleName: roleFrom ? roleFrom.name : 'Nodo' });
                });
            }
        });

        allMyTasks.sort((a, b) => a.projectName.localeCompare(b.projectName));

        if (allMyTasks.length === 0) {
            this.dom.emptyState.style.display = 'flex';
        } else {
            this.dom.workState.style.display = 'flex';
            this.dom.omniContainer.style.display = 'flex';
            
            // Llenar Selector con formato truncado Project > Role > Task
            let selectHtml = `<option value="" disabled>🎯 Selecciona entregable...</option>`;
            allMyTasks.forEach(t => {
                const pNameShort = t.projectName.length > 15 ? t.projectName.substring(0, 15) + '...' : t.projectName;
                selectHtml += `<option value="${t.hash}">${pNameShort} > ${t.roleName} > ${t.entregable}</option>`;
            });
            this.dom.omniSelector.innerHTML = selectHtml;

            // LÓGICA DE PERSISTENCIA V8.5
            const cachedTxHash = localStorage.getItem('tt_active_pomodoro_tx');
            if (cachedTxHash && allMyTasks.find(t => t.hash === cachedTxHash)) {
                this.activeTx = allMyTasks.find(t => t.hash === cachedTxHash);
                this.dom.omniSelector.value = this.activeTx.hash;
            } else {
                this.activeTx = allMyTasks[0];
                this.dom.omniSelector.value = this.activeTx.hash;
            }

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
                this.activeTx = allMyTasks.find(t => t.hash === e.target.value);
                const cache = localStorage.getItem(`tt_focus_${this.activeTx.hash}_elapsed`);
                this.secondsElapsed = cache ? parseInt(cache, 10) : 0;
                this.setupTaskData();
                this.updateDisplay();
            });
        }
    }

    setupTaskData() {
        if (!this.activeTx) return;
        this.dom.taskName.innerText = this.activeTx.entregable;
        this.dom.taskType.innerText = this.activeTx.tipo === 'tangible' ? '🟢 Tangible' : '🟣 Intangible';
        
        // Random Tip
        const randomTip = this.focusTips[Math.floor(Math.random() * this.focusTips.length)];
        this.dom.focusTip.innerText = randomTip;
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
        if (this.isRunning || !this.activeTx) return;
        this.isRunning = true;
        this.startTime = Date.now();
        
        this.dom.btnPlay.style.display = 'none';
        this.dom.btnDirectReport.style.display = 'none'; 
        this.dom.btnPause.style.display = 'flex';
        this.dom.btnStop.style.display = 'flex';
        
        this.dom.glowBg.classList.add('running');
        this.dom.pomodoroIcon.classList.add('ticking');

        localStorage.setItem('tt_active_pomodoro_tx', this.activeTx.hash);
        localStorage.setItem(`tt_focus_${this.activeTx.hash}_running`, 'true');

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
                    alert("🔔 ¡Sesión completada! Es hora de un descanso. Reporta el progreso para asegurar tus Slices.");
                    this.openReportModal(true);
                }
            }
            
            localStorage.setItem(`tt_focus_${this.activeTx.hash}_elapsed`, this.secondsElapsed);
            localStorage.setItem(`tt_focus_${this.activeTx.hash}_start`, now);
            
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
        window.dispatchEvent(new Event('pomodoro_tick'));
    }
}
