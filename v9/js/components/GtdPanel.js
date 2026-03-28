// v9/js/components/GtdPanel.js
import { store } from '../core/store.js';

export class GtdPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.pomodoroInterval = null;
        this.pomodoroSeconds = 0;
        this.isPomodoroRunning = false;
        this.activeTx = null;
        this.activeProjectId = null;
        this.currentChatId = null; // Para inyección de PoW
    }

    connectedCallback() {
        this.render();
        this.setupListeners();
        // Escucha eventos globales para inyectar evidencias desde el chat
        window.addEventListener('inject-evidence', this.handleInjectEvidence.bind(this));
    }

    disconnectedCallback() {
        this.stopPomodoro();
        window.removeEventListener('inject-evidence', this.handleInjectEvidence.bind(this));
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; max-width: 900px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                .gtd-mode-panel { display: flex; flex-direction: column; gap: 20px;}
                .pomodoro-panel { background: linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95)); border: 1px solid var(--accent-orange, #ff9100); border-radius: 24px; padding: 2rem; text-align: center; box-shadow: 0 15px 35px rgba(255,171,64,0.15), inset 0 0 20px rgba(255,171,64,0.05); transition: 0.3s;}
                .pomodoro-panel.running { border-color: var(--accent-green, #00e676); box-shadow: 0 15px 35px rgba(0,230,118,0.2), inset 0 0 30px rgba(0,230,118,0.1); animation: breathe 4s infinite;}
                .timer-display { font-size: 5rem; font-weight: 900; font-family: monospace; color: white; margin: 0.5rem 0; text-shadow: 0 5px 15px rgba(0,0,0,0.8); font-variant-numeric: tabular-nums;}
                .pomodoro-panel.running .timer-display { color: var(--accent-green, #00e676); }
                .timer-controls { display: flex; justify-content: center; gap: 15px; margin-top: 1rem;}
                .btn-timer { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; width: 60px; height: 60px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center;}
                .btn-timer:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
                .btn-timer.play { border-color: var(--accent-green, #00e676); color: var(--accent-green, #00e676); }
                .btn-timer.pause { border-color: var(--accent-orange, #ff9100); color: var(--accent-orange, #ff9100); display:none;}

                .task-context-panel { background: rgba(15,15,20,0.9); border: 1px solid #333; border-left: 4px solid var(--accent-green, #00e676); padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .task-context-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
                .task-context-title { font-size: 1.3rem; color: white; font-weight: 900; margin: 0; }
                .task-context-desc { font-size: 0.95rem; color: #ccc; line-height: 1.5; font-style: italic; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;}
                
                .pow-section { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
                .pow-input-group { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 5px; }
                .pow-input-group label { font-size: 0.75rem; color: var(--accent-green, #00e676); text-transform: uppercase; font-weight: bold; }
                .pow-input { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 12px; border-radius: 8px; font-family: inherit; outline:none; transition: 0.3s; box-sizing: border-box;}
                .pow-input:focus { border-color: var(--accent-green, #00e676); box-shadow: inset 0 0 10px rgba(0,230,118,0.1); }
                .pow-input.mono { font-family: monospace; font-weight: bold; color: var(--accent-orange, #ff9100); }

                .soc-checklist-box { margin-top: 15px; }
                .soc-checklist-box label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; }
                .soc-item-check { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid #333; margin-bottom: 5px; transition: 0.2s;}
                .soc-item-check input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green, #00e676); margin-top: 2px; }
                .soc-item-check span { color: #ddd; font-size: 0.9rem; line-height: 1.4; }

                .editor-wrapper { position: relative; width: 100%; background: rgba(10,10,15,0.8); border: 1px solid #444; border-radius: 16px; padding: 20px; box-sizing: border-box; transition: 0.3s;}
                .editor-wrapper:focus-within { border-color: var(--accent-purple, #e040fb); box-shadow: 0 0 20px rgba(224,64,251,0.1);}
                .semantic-editor { width: 100%; min-height: 35vh; background: transparent; border: none; color: #e0e0e0; font-family: 'Georgia', serif; font-size: 1.15rem; line-height: 1.6; outline: none;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-green, #00e676), #00b0ff); color: black; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 230, 118, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 230, 118, 0.5); filter: brightness(1.2);}
                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange, #ff9100); color: var(--accent-orange, #ff9100); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange, #ff9100); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                @keyframes breathe { 0% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } 50% { box-shadow: 0 15px 35px rgba(0,230,118,0.3), inset 0 0 40px rgba(0,230,118,0.15); } 100% { box-shadow: 0 15px 35px rgba(0,230,118,0.1), inset 0 0 20px rgba(0,230,118,0.05); } }
            </style>

            <div class="gtd-mode-panel" id="gtdModePanel" style="display:none;">
                <div class="pomodoro-panel" id="pomoPanel">
                    <div style="color: #888; font-size: 0.85rem; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Tiempo de Foco Activo</div>
                    <div class="timer-display" id="timeDisplay">00:00:00</div>
                    <div style="font-family: monospace; color: #888; font-size: 0.8rem;">El tiempo se inyectará en el Slicing Pie al sellar.</div>
                    <div class="timer-controls">
                        <button class="btn-timer play" id="btnPlay">▶</button>
                        <button class="btn-timer pause" id="btnPause">⏸</button>
                    </div>
                </div>
                
                <div id="taskContextPanel" class="task-context-panel">
                    <div class="task-context-header">
                        <div>
                            <h2 id="taskTitle" class="task-context-title">Tarea</h2>
                            <div id="taskRole" style="color:var(--accent-blue, #00b0ff); font-family:monospace; font-size:0.85rem; margin-top:5px; font-weight:bold;"></div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#888; font-size:0.75rem; text-transform:uppercase; font-weight:bold;">Estado</div>
                            <div id="taskStatus" style="color:var(--accent-orange, #ff9100); font-family:monospace; font-weight:bold;"></div>
                        </div>
                    </div>
                    <div id="taskDesc" class="task-context-desc"></div>
                    <div id="taskSocsContainer" class="soc-checklist-box"></div>
                    
                    <div class="pow-section">
                        <div class="pow-input-group" style="flex:2;">
                            <label>🔗 Enlace al Entregable</label>
                            <input type="text" id="inpPowLink" class="pow-input" placeholder="URL interna del Córtex...">
                        </div>
                        <div class="pow-input-group" style="flex:1;">
                            <label>⏱ Tiempo Imputado (H)</label>
                            <input type="number" step="0.01" id="inpPowHours" class="pow-input mono" readonly>
                        </div>
                    </div>
                </div>
                
                <div class="editor-wrapper" id="editorWrapper">
                    <label id="editorLabel" style="font-size:0.75rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:5px; display:block;">Proof of Work (Reporte)</label>
                    <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="Documenta tu Proof of Work aquí..."><p><br></p></div>
                </div>
            </div>

            <div class="action-bar-fixed" id="gtdActionBar" style="display:none;">
                <button class="btn-action-draft" id="btnSaveTaskDraft">💾 Guardar Borrador</button>
                <button class="btn-action-pow" id="btnSubmitReport">🚀 Sellar Proof of Work</button>
            </div>
        `;

        this.dom = {
            panel: this.shadowRoot.getElementById('gtdModePanel'),
            actionBar: this.shadowRoot.getElementById('gtdActionBar'),
            pomoPanel: this.shadowRoot.getElementById('pomoPanel'),
            timeDisplay: this.shadowRoot.getElementById('timeDisplay'),
            btnPlay: this.shadowRoot.getElementById('btnPlay'),
            btnPause: this.shadowRoot.getElementById('btnPause'),
            taskTitle: this.shadowRoot.getElementById('taskTitle'),
            taskRole: this.shadowRoot.getElementById('taskRole'),
            taskStatus: this.shadowRoot.getElementById('taskStatus'),
            taskDesc: this.shadowRoot.getElementById('taskDesc'),
            taskSocs: this.shadowRoot.getElementById('taskSocsContainer'),
            inpPowLink: this.shadowRoot.getElementById('inpPowLink'),
            inpPowHours: this.shadowRoot.getElementById('inpPowHours'),
            editor: this.shadowRoot.getElementById('semanticEditor'),
            btnSubmit: this.shadowRoot.getElementById('btnSubmitReport'),
            btnSaveDraft: this.shadowRoot.getElementById('btnSaveTaskDraft')
        };
    }

    setupListeners() {
        this.dom.btnPlay.addEventListener('click', () => {
            if (this.isPomodoroRunning) return;
            this.isPomodoroRunning = true;
            this.dom.btnPlay.style.display = 'none';
            this.dom.btnPause.style.display = 'flex';
            this.dom.pomoPanel.classList.add('running');
            this.pomodoroInterval = setInterval(() => {
                this.pomodoroSeconds++;
                this.updatePomodoroDisplay();
            }, 1000);
        });

        this.dom.btnPause.addEventListener('click', () => this.stopPomodoro());
        this.dom.btnSubmit.addEventListener('click', () => this.reportDeliverable());
        this.dom.btnSaveDraft.addEventListener('click', () => this.saveTaskDraft());
    }

    stopPomodoro() {
        if (!this.isPomodoroRunning) return;
        this.isPomodoroRunning = false;
        this.dom.btnPlay.style.display = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.pomoPanel.classList.remove('running');
        clearInterval(this.pomodoroInterval);
    }

    updatePomodoroDisplay() {
        const hrs = Math.floor(this.pomodoroSeconds / 3600);
        const mins = Math.floor((this.pomodoroSeconds % 3600) / 60);
        const secs = this.pomodoroSeconds % 60;
        this.dom.timeDisplay.innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (this.pomodoroSeconds > 0) this.dom.inpPowHours.value = (this.pomodoroSeconds / 3600).toFixed(3); 
    }

    // Método público para inyectar datos desde la vista padre
    loadTask(txData, projectId, chatId = null) {
        this.activeTx = txData;
        this.activeProjectId = projectId;
        this.currentChatId = chatId;

        if (!this.activeTx) {
            this.dom.panel.style.display = 'none';
            this.dom.actionBar.style.display = 'none';
            this.stopPomodoro();
            return;
        }

        this.dom.panel.style.display = 'flex';
        this.dom.actionBar.style.display = 'flex';

        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        const isLegacy = !this.activeTx.flowId;
        const parentFlow = isLegacy ? this.activeTx : (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
        
        this.dom.taskTitle.innerText = parentFlow ? (parentFlow.template || parentFlow.entregable || this.activeTx.comentario) : 'Work Order';
        const roleTo = p.roles.find(r => r.id === (parentFlow ? parentFlow.to : this.activeTx.to));
        this.dom.taskRole.innerText = roleTo ? `${roleTo.levelId} - ${roleTo.name}` : '@ecosistema';
        this.dom.taskStatus.innerText = this.activeTx.status === 'pinged' ? 'EN CURSO' : this.activeTx.status.toUpperCase();
        this.dom.taskDesc.innerHTML = (this.activeTx.comentario || parentFlow?.comentario || 'Completa la tarea y sella la evidencia.').replace(/\n/g, '<br>');

        const socs = this.activeTx.soc_checklist && this.activeTx.soc_checklist.length > 0 ? this.activeTx.soc_checklist : (parentFlow?.soc_checklist || []);
        if (socs.length > 0) {
            this.dom.taskSocs.innerHTML = '<label>Criterios de Aceptación (SOCs):</label>' + socs.map(soc => `
                <div class="soc-item-check">
                    <input type="checkbox" id="${soc.id}" ${soc.isChecked ? 'checked' : ''}>
                    <span>${soc.text}</span>
                </div>
            `).join('');
        } else {
            this.dom.taskSocs.innerHTML = '<div style="color:#666; font-style:italic; font-size:0.85rem;">No hay SOCs asociados.</div>';
        }

        this.dom.inpPowLink.value = this.activeTx.draftLink || this.activeTx.proofLink || '';
        
        const savedHours = this.activeTx.draftHours || this.activeTx.realHours || 0;
        if (savedHours > 0) {
            this.pomodoroSeconds = Math.floor(savedHours * 3600);
            this.updatePomodoroDisplay();
            this.dom.inpPowHours.value = savedHours.toFixed(3);
        } else {
            this.pomodoroSeconds = 0;
            this.updatePomodoroDisplay();
            this.dom.inpPowHours.value = (parentFlow?.estimatedHours || parentFlow?.horas || 1); 
        }

        this.dom.editor.innerHTML = this.activeTx.draftContent || '<p><br></p>';
        
        if (this.activeTx.status === 'pinged') {
            this.dom.btnSubmit.style.display = 'block';
            this.dom.btnSaveDraft.style.display = 'block';
            this.dom.btnPlay.style.display = 'flex';
            this.dom.editor.contentEditable = "true";
            this.dom.inpPowLink.disabled = false;
        } else {
            this.dom.btnSubmit.style.display = 'none';
            this.dom.btnSaveDraft.style.display = 'none';
            this.dom.btnPlay.style.display = 'none';
            this.dom.inpPowLink.disabled = true;
            this.dom.taskSocs.querySelectorAll('input').forEach(i => i.disabled = true);
            this.dom.editor.contentEditable = "false";
        }
    }

    handleInjectEvidence(e) {
        if (!this.activeTx) return;
        
        const data = e.detail;
        if (!data || !data.text) return;

        let htmlToInject = `<blockquote><b>Evidencia Generada por IA:</b><br>${data.text.replace(/\n/g, '<br>')}</blockquote>`;
        if (data.artifactData) {
            htmlToInject += `<pre style="background:rgba(0,0,0,0.8); border:1px solid #444; color:#00e676; padding:10px; border-radius:8px; font-family:monospace; font-size:0.8rem; overflow-x:auto;"><code>${JSON.stringify(data.artifactData, null, 2)}</code></pre>`;
        }

        this.dom.editor.innerHTML += htmlToInject;
        if(this.currentChatId && e.detail.msgId) {
            this.dom.inpPowLink.value = `tt://swarm-memory/${this.currentChatId}#${e.detail.msgId}`;
        }
        
        this.dom.taskSocs.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        
        // Dispara evento para que el padre pueda mostrar un Toast o Alert si quiere
        this.dispatchEvent(new CustomEvent('evidence-injected', { bubbles: true, composed: true }));
    }

    async saveTaskDraft() {
        if (!this.activeTx || !this.activeProjectId) return;
        this.dom.btnSaveDraft.disabled = true; this.dom.btnSaveDraft.innerText = "⏳...";

        const link = this.dom.inpPowLink.value.trim();
        const hours = parseFloat(this.dom.inpPowHours.value) || 0;
        const htmlContent = this.dom.editor.innerHTML.trim();
        
        const socs = [];
        this.dom.taskSocs.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            socs.push({ id: cb.id, text: cb.nextElementSibling.innerText, isChecked: cb.checked });
        });

        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if(!p) return;

        const isLegacy = !this.activeTx.flowId;
        const listType = isLegacy ? 'transactions' : 'work_orders';
        const hashTarget = this.activeTx.hash || this.activeTx.id;

        const updatedList = p[listType].map(w => {
            if ((w.hash || w.id) === hashTarget) {
                return { ...w, draftLink: link, draftHours: hours, draftContent: htmlContent, soc_checklist: socs.length > 0 ? socs : w.soc_checklist };
            }
            return w;
        });

        await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.activeProjectId, updates: { [listType]: updatedList } } });

        setTimeout(() => {
            this.dom.btnSaveDraft.disabled = false;
            this.dom.btnSaveDraft.innerText = "💾 Guardar Borrador";
        }, 500);
    }

    async reportDeliverable() {
        if (!this.activeTx || !this.activeProjectId) return;
        this.stopPomodoro();

        const link = this.dom.inpPowLink.value.trim();
        let hoursToReport = this.pomodoroSeconds > 0 ? (this.pomodoroSeconds / 3600) : parseFloat(this.dom.inpPowHours.value);
        if (isNaN(hoursToReport) || hoursToReport <= 0) hoursToReport = 1; 
        hoursToReport = parseFloat(hoursToReport.toFixed(3)); 

        const htmlContent = this.dom.editor.innerHTML.trim();
        if (!link && htmlContent === '<p><br></p>') return alert("⚠️ Adjunta enlace o escribe el PoW.");

        if (confirm(`¿Sellar Work Order con ${hoursToReport}h? Pasará a Auditoría TDD.`)) {
            this.dom.btnSubmit.disabled = true; this.dom.btnSubmit.innerText = '🚀...';
            
            const isLegacy = !this.activeTx.flowId;
            const payloadKey = isLegacy ? 'txHash' : 'woHash';
            const targetHash = this.activeTx.hash || this.activeTx.id;

            await store.dispatch({
                type: 'REPORT_WORK_ORDER',
                payload: { projectId: this.activeProjectId, [payloadKey]: targetHash, realHours: hoursToReport, comentario: htmlContent, proofLink: link }
            });

            // Dispara evento para que el padre maneje la navegación o el alert
            this.dispatchEvent(new CustomEvent('pow-submitted', { bubbles: true, composed: true }));
        }
    }
}
customElements.define('gtd-panel', GtdPanel);
