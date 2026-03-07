// v5/js/views/FocusView.js
import { store } from '../core/store.js';

export default class FocusView {
    constructor() {
        document.title = "Deep Work | TeamTowers";
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isRunning = false;
        this.activeTx = null;
    }

    async getHtml() {
        return `
            <style>
                .focus-layout { 
                    display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    height: 100vh; width: 100vw; background: radial-gradient(circle at center, #16161e 0%, #050505 100%);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden;
                    position: relative;
                }

                .top-nav { position: absolute; top: 0; left: 0; width: 100%; padding: 2rem; display: flex; justify-content: space-between; z-index: 10; }
                
                /* ESTADO VACÍO */
                .empty-state { text-align: center; color: #888; display: none; flex-direction: column; align-items: center; gap: 1rem; }
                
                /* PANEL DE TAREA */
                .task-context { text-align: center; margin-bottom: 2rem; z-index: 2; animation: fadeIn 1s ease-out; }
                .task-badge { background: rgba(0, 176, 255, 0.1); color: #00b0ff; border: 1px solid rgba(0, 176, 255, 0.3); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; }
                .task-title { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
                .task-role { color: #888; font-size: 1rem; margin-top: 10px; font-family: monospace; }

                /* EL RELOJ */
                .timer-container { 
                    position: relative; width: 350px; height: 350px; display: flex; justify-content: center; align-items: center;
                    border-radius: 50%; background: #0a0a0c; box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.05);
                    z-index: 2; transition: box-shadow 0.5s ease;
                }
                .timer-container.running { box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 0 50px rgba(0, 230, 118, 0.1), 0 0 0 2px #00e676; }
                
                .time-display { font-size: 5.5rem; font-weight: 800; font-family: monospace; color: white; letter-spacing: -2px; z-index: 3; }
                .time-display span { font-size: 2rem; color: #555; }

                /* CONTROLES */
                .controls { margin-top: 3rem; display: flex; gap: 1.5rem; z-index: 2; }
                .btn-circle { 
                    width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
                    display: flex; justify-content: center; align-items: center; font-size: 1.5rem; transition: transform 0.2s, background 0.3s;
                }
                .btn-play { background: #00e676; color: #000; box-shadow: 0 10px 20px rgba(0, 230, 118, 0.3); }
                .btn-play:hover { transform: scale(1.1); background: #00c853; }
                .btn-pause { background: #333; color: white; }
                .btn-pause:hover { background: #444; }
                .btn-stop { background: #ff5252; color: white; display: none; }
                .btn-stop:hover { background: #ff1744; box-shadow: 0 10px 20px rgba(255, 82, 82, 0.3); }

                /* MODAL DE REPORTE (Proof of Work) */
                .report-modal {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9);
                    backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 100;
                }
                .report-card { background: #121216; border: 1px solid #333; padding: 3rem; border-radius: 16px; width: 100%; max-width: 500px; }
                .report-card h2 { color: white; margin-top: 0; font-size: 1.8rem; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 8px; }
                .form-control { width: 100%; background: #050505; border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 1rem;}
                .form-control:focus { border-color: #00e676; outline: none; }

                /* ANIMACIONES DE FONDO */
                .glow-bg { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0, 230, 118, 0.05) 0%, transparent 70%); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0; transition: opacity 1s; }
                .glow-bg.running { opacity: 1; animation: pulseGlow 4s infinite alternate; }
                @keyframes pulseGlow { 0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5;} 100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1;} }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            </style>

            <div class="focus-layout">
                <div class="glow-bg" id="glowBg"></div>
                
                <div class="top-nav">
                    <a href="/v5/project" class="btn btn-outline" data-link style="border-color: #333; color: #888;">&larr; Abortar / Kanban</a>
                    <div style="color: #555; font-family: monospace; font-size: 0.8rem; align-self: center;">KERNEL v6.2 // FLOW STATE</div>
                </div>

                <div class="empty-state" id="emptyState">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">☕</div>
                    <h2 style="color: white; font-size: 2rem; margin: 0;">No tienes entregables en proceso.</h2>
                    <p style="color: #888;">Ve al Kanban, arrastra una tarea teórica a Deep Work (Hacer PULL) y vuelve aquí.</p>
                    <a href="/v5/project" class="btn btn-primary" data-link style="margin-top: 1rem;">Ir al Kanban</a>
                </div>

                <div id="workState" style="display: none; flex-direction: column; align-items: center; width: 100%;">
                    <div class="task-context">
                        <div class="task-badge" id="taskType">--</div>
                        <h1 class="task-title" id="taskName">Cargando Entregable...</h1>
                        <div class="task-role">Ejecutando rol: <span id="taskRole" style="color: #fff;">--</span></div>
                    </div>

                    <div class="timer-container" id="timerUI">
                        <div class="time-display" id="timeDisplay">00<span>:</span>00<span>:</span>00</div>
                    </div>

                    <div class="controls">
                        <button class="btn-circle btn-pause" id="btnPause" title="Pausar" style="display: none;">⏸</button>
                        <button class="btn-circle btn-play" id="btnPlay" title="Iniciar Deep Work">▶</button>
                        <button class="btn-circle btn-stop" id="btnStop" title="Terminar y Reportar">⏹</button>
                    </div>
                </div>

                <div class="report-modal" id="reportModal">
                    <div class="report-card">
                        <h2>Consolidar Esfuerzo</h2>
                        <p style="color: #888; font-size: 0.9rem; margin-bottom: 2rem;">El trabajo ha terminado. Envía el <i>Proof of Work</i> para que el Auditor valide la inyección de Slices en el Ledger.</p>
                        
                        <div class="form-group">
                            <label>Tiempo Real Invertido (Horas)</label>
                            <input type="number" step="0.1" id="inpRealHours" class="form-control" value="0.0">
                        </div>
                        
                        <div class="form-group">
                            <label>Enlace al Entregable (Figma, GitHub, Drive...)</label>
                            <input type="text" id="inpProof" class="form-control" placeholder="https://...">
                        </div>

                        <div class="form-group">
                            <label>Comentarios para el Auditor</label>
                            <textarea id="inpComment" class="form-control" rows="3" placeholder="He completado la fase 1, pero tuve problemas con..."></textarea>
                        </div>

                        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                            <button class="btn btn-outline" id="btnCancelReport" style="border-color: #333;">Cancelar</button>
                            <button class="btn btn-primary" id="btnSubmitReport" style="background: #00e676; color: black; border: none;">📤 Reportar al Kernel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        const project = state.projects[state.projects.length - 1];

        this.dom = {
            emptyState: document.getElementById('emptyState'),
            workState: document.getElementById('workState'),
            taskName: document.getElementById('taskName'),
            taskRole: document.getElementById('taskRole'),
            taskType: document.getElementById('taskType'),
            timeDisplay: document.getElementById('timeDisplay'),
            timerUI: document.getElementById('timerUI'),
            glowBg: document.getElementById('glowBg'),
            btnPlay: document.getElementById('btnPlay'),
            btnPause: document.getElementById('btnPause'),
            btnStop: document.getElementById('btnStop'),
            modal: document.getElementById('reportModal'),
            inpRealHours: document.getElementById('inpRealHours'),
            inpProof: document.getElementById('inpProof'),
            inpComment: document.getElementById('inpComment'),
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnCancel: document.getElementById('btnCancelReport')
        };

        // 1. BUSCAR UNA TAREA "PINGED" (En proceso por el usuario)
        // Por ahora pillamos la primera que esté pinged en el proyecto
        if (project && project.transactions) {
            this.activeTx = project.transactions.find(tx => tx.status === 'pinged');
        }

        if (!this.activeTx) {
            this.dom.emptyState.style.display = 'flex';
        } else {
            this.dom.workState.style.display = 'flex';
            this.setupTaskData(project);
            this.setupTimerControls();
        }
    }

    setupTaskData(project) {
        this.dom.taskName.innerText = this.activeTx.entregable;
        this.dom.taskType.innerText = `[${this.activeTx.tipo}] PoW Requerido`;
        
        const roleFrom = project.roles.find(r => r.id === this.activeTx.from);
        if (roleFrom) {
            this.dom.taskRole.innerText = `${roleFrom.levelId} - ${roleFrom.name}`;
            const color = store.getColor ? store.getColor(roleFrom.levelId) : '#00b0ff'; // Fallback
            this.dom.taskRole.style.color = color;
        }
    }

    setupTimerControls() {
        this.dom.btnPlay.addEventListener('click', () => this.startTimer());
        this.dom.btnPause.addEventListener('click', () => this.pauseTimer());
        this.dom.btnStop.addEventListener('click', () => this.openReportModal());
        
        this.dom.btnCancel.addEventListener('click', () => {
            this.dom.modal.style.display = 'none';
        });

        this.dom.btnSubmit.addEventListener('click', () => this.submitReport());
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.dom.btnPlay.style.display = 'none';
        this.dom.btnPause.style.display = 'flex';
        this.dom.btnStop.style.display = 'flex';
        this.dom.timerUI.classList.add('running');
        this.dom.glowBg.classList.add('running');

        this.timerInterval = setInterval(() => {
            this.secondsElapsed++;
            this.updateDisplay();
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.timerUI.classList.remove('running');
        this.dom.glowBg.classList.remove('running');
    }

    openReportModal() {
        this.pauseTimer();
        // Pre-calcular horas basadas en los segundos pasados (redondeando a 2 decimales)
        const hoursCalc = (this.secondsElapsed / 3600).toFixed(2);
        this.dom.inpRealHours.value = hoursCalc > 0.01 ? hoursCalc : 0.5; // Mínimo 0.5h por UI demo
        this.dom.modal.style.display = 'flex';
    }

    submitReport() {
        const pId = store.getState().projects[store.getState().projects.length - 1].id;
        
        // Disparamos la acción al Kernel (Pasa de 'pinged' a 'reported')
        store.dispatch({
            type: 'REPORT_TRANSACTION',
            payload: {
                projectId: pId,
                txHash: this.activeTx.hash,
                realHours: parseFloat(this.dom.inpRealHours.value),
                proofLink: this.dom.inpProof.value,
                comentario: this.dom.inpComment.value
            }
        });

        // Redirigir al Kanban para ver que ha pasado a la última columna
        window.location.href = '/v5/project';
    }

    updateDisplay() {
        const h = Math.floor(this.secondsElapsed / 3600).toString().padStart(2, '0');
        const m = Math.floor((this.secondsElapsed % 3600) / 60).toString().padStart(2, '0');
        const s = (this.secondsElapsed % 60).toString().padStart(2, '0');
        this.dom.timeDisplay.innerHTML = `${h}<span>:</span>${m}<span>:</span>${s}`;
    }
}
