// v8/js/components/FocusRenderer.js
import { store } from '../core/store.js';

export class FocusRenderer {
    /**
     * @param {HTMLElement} containerEl - Contenedor HTML donde se inyectará el Focus
     * @param {Object} options - Configuración { projectId, woHash, onCompleteCallback }
     */
    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options = Object.assign({
            projectId: null,
            woHash: null,
            onCompleteCallback: () => {} // Función a ejecutar cuando se sella la tarea
        }, options);

        this.project = store.getState().projects.find(p => p.id === this.options.projectId);
        this.wo = this.project ? this.project.work_orders.find(w => w.hash === this.options.woHash) : null;
        
        this.timerInterval = null;
        this.secondsElapsed = 0;
        this.isWorking = false;
    }

    static getStyles() {
        return `
            .deepwork-widget { background: linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,0.95)); border: 1px solid var(--accent-orange); border-radius: 20px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,171,64,0.1); width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 1.5rem; position: relative; overflow: hidden; animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);}
            
            .dw-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed rgba(255,171,64,0.3); padding-bottom: 1rem;}
            .dw-title-block h3 { margin: 0; color: white; font-size: 1.4rem; font-weight: 900;}
            .dw-title-block p { margin: 5px 0 0 0; color: #888; font-size: 0.85rem;}

            .dw-timer-block { text-align: right; }
            .dw-timer { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 900; color: var(--accent-orange); line-height: 1; text-shadow: 0 0 15px rgba(255,171,64,0.4);}
            .dw-controls { display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end;}
            .btn-timer { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 5px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;}
            .btn-timer.play { border-color: var(--accent-green); color: var(--accent-green); }
            .btn-timer.play:hover { background: rgba(0,230,118,0.1); }
            .btn-timer.pause { border-color: var(--accent-red); color: var(--accent-red); }
            .btn-timer.pause:hover { background: rgba(255,82,82,0.1); }

            .dw-body { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
            
            .dw-socs { background: rgba(0,0,0,0.4); padding: 1.5rem; border-radius: 16px; border: 1px solid #333; }
            .dw-socs h4 { color: #ccc; margin: 0 0 1rem 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;}
            .soc-checklist { display: flex; flex-direction: column; gap: 10px; }
            .soc-item { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #222; transition: 0.2s;}
            .soc-item.checked { border-color: var(--accent-green); background: rgba(0,230,118,0.05); }
            .soc-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-green); margin-top: 2px; }
            .soc-item span { color: #ccc; font-size: 0.9rem; line-height: 1.4; transition: 0.2s; }
            .soc-item.checked span { color: white; }

            .dw-editor { display: flex; flex-direction: column;}
            .dw-editor h4 { color: #ccc; margin: 0 0 1rem 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;}
            .pow-textarea { flex: 1; background: rgba(0,0,0,0.6); border: 1px solid #444; border-radius: 12px; color: white; padding: 15px; font-family: monospace; font-size: 0.9rem; resize: none; outline: none; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); transition: 0.3s; min-height: 200px;}
            .pow-textarea:focus { border-color: var(--accent-orange); box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 0 15px rgba(255,171,64,0.1);}

            .dw-footer { border-top: 1px dashed rgba(255,171,64,0.3); padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;}
            .btn-seal { background: linear-gradient(135deg, #ff9100, #ff3d00); color: black; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(255,171,64,0.3); transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;}
            .btn-seal:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,171,64,0.5); filter: brightness(1.1);}
            .btn-seal:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

            .dw-pulse-bg { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,171,64,0.05) 0%, rgba(0,0,0,0) 70%); pointer-events: none; z-index: 0; animation: rotateBg 10s linear infinite; display: none;}
            .is-working .dw-pulse-bg { display: block; }

            @keyframes rotateBg { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

            @media (max-width: 768px) {
                .dw-body { grid-template-columns: 1fr; }
                .dw-header { flex-direction: column; gap: 15px; }
                .dw-timer-block { text-align: left; }
                .dw-controls { justify-content: flex-start; }
            }
        `;
    }

    render() {
        if (!this.container || !this.wo || !this.project) {
            this.container.innerHTML = `<div style="color:var(--accent-red); padding:1rem; border:1px dashed var(--accent-red); border-radius:12px;">Error: No se ha podido montar el módulo DeepWork. WO Hash inválido.</div>`;
            return;
        }

        const flow = this.project.vna_flows.find(f => f.id === this.wo.flowId) || { template: 'Tarea Independiente', tipo: 'tangible' };
        
        const socsHtml = (this.wo.soc_checklist && this.wo.soc_checklist.length > 0) ? this.wo.soc_checklist.map(soc => `
            <label class="soc-item ${soc.isChecked ? 'checked' : ''}">
                <input type="checkbox" class="dw-soc-cb" data-id="${soc.id}" ${soc.isChecked ? 'checked' : ''}>
                <span>${soc.text}</span>
            </label>
        `).join('') : '<div style="color:#666; font-style:italic;">No hay SOCs estandarizados para esta receta.</div>';

        this.container.innerHTML = `
            <div class="deepwork-widget" id="dwWidget">
                <div class="dw-pulse-bg"></div>
                
                <div class="dw-header" style="z-index: 1;">
                    <div class="dw-title-block">
                        <h3>🍅 Modo Focus: ${flow.template}</h3>
                        <p>${this.wo.comentario || 'Iniciando trabajo profundo...'}</p>
                    </div>
                    <div class="dw-timer-block">
                        <div class="dw-timer" id="dwTimerDisplay">00:00:00</div>
                        <div class="dw-controls">
                            <button class="btn-timer play" id="dwBtnPlay">▶ Flow</button>
                            <button class="btn-timer pause" id="dwBtnPause">⏸ Pausa</button>
                        </div>
                    </div>
                </div>

                <div class="dw-body" style="z-index: 1;">
                    <div class="dw-socs">
                        <h4>✅ Criterios de Auditoría (SOCs)</h4>
                        <div class="soc-checklist">
                            ${socsHtml}
                        </div>
                    </div>
                    
                    <div class="dw-editor">
                        <h4>📝 Proof of Work (Evidencia)</h4>
                        <textarea class="pow-textarea" id="dwPowInput" placeholder="Redacta tu trabajo aquí. Puede ser código, un informe, o un enlace a un PR de Github..."></textarea>
                    </div>
                </div>

                <div class="dw-footer" style="z-index: 1;">
                    <div style="font-size:0.8rem; color:#888;">Debes marcar los SOCs y adjuntar evidencia para sellar.</div>
                    <button class="btn-seal" id="dwBtnSeal" disabled>⚖️ Reportar al Notario</button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const timerDisplay = this.container.querySelector('#dwTimerDisplay');
        const btnPlay = this.container.querySelector('#dwBtnPlay');
        const btnPause = this.container.querySelector('#dwBtnPause');
        const widget = this.container.querySelector('#dwWidget');
        const powInput = this.container.querySelector('#dwPowInput');
        const btnSeal = this.container.querySelector('#dwBtnSeal');
        const checkboxes = this.container.querySelectorAll('.dw-soc-cb');

        const updateTimerDisplay = () => {
            const h = Math.floor(this.secondsElapsed / 3600).toString().padStart(2, '0');
            const m = Math.floor((this.secondsElapsed % 3600) / 60).toString().padStart(2, '0');
            const s = (this.secondsElapsed % 60).toString().padStart(2, '0');
            timerDisplay.innerText = `${h}:${m}:${s}`;
        };

        btnPlay.addEventListener('click', () => {
            if (this.isWorking) return;
            this.isWorking = true;
            widget.classList.add('is-working');
            this.timerInterval = setInterval(() => {
                this.secondsElapsed++;
                updateTimerDisplay();
            }, 1000);
        });

        btnPause.addEventListener('click', () => {
            this.isWorking = false;
            widget.classList.remove('is-working');
            clearInterval(this.timerInterval);
        });

        // Lógica de Validación para activar el botón de Sellar
        const checkValidity = () => {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            const hasText = powInput.value.trim().length > 10; // Mínimo 10 caracteres
            btnSeal.disabled = !(allChecked && hasText);
        };

        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) e.target.parentElement.classList.add('checked');
                else e.target.parentElement.classList.remove('checked');
                checkValidity();
            });
        });

        powInput.addEventListener('input', checkValidity);

        btnSeal.addEventListener('click', async () => {
            clearInterval(this.timerInterval);
            const hoursInvested = Math.max(parseFloat((this.secondsElapsed / 3600).toFixed(2)), 0.1); // Mínimo 0.1h
            
            // Actualizamos el estado local de los SOCs
            const updatedSocs = this.wo.soc_checklist.map(soc => {
                const cb = this.container.querySelector(`.dw-soc-cb[data-id="${soc.id}"]`);
                return { ...soc, isChecked: cb ? cb.checked : false };
            });

            // Acción Core: Reportar la Tarea
            await store.dispatch({
                type: 'REPORT_WORK_ORDER',
                payload: {
                    projectId: this.options.projectId,
                    woHash: this.options.woHash,
                    realHours: hoursInvested,
                    comentario: powInput.value.trim(),
                    proofLink: 'Usenet_DeepWork',
                    soc_checklist: updatedSocs // Idealmente, el action REPORT_WORK_ORDER debería aceptar actualizar SOCs, o lanzamos dos dispatch.
                }
            });

            // En este prototipo V14, si REPORT_WORK_ORDER no actualiza los SOCs, los inyectamos a la fuerza para la prueba:
            const projIdx = store.getState().projects.findIndex(p => p.id === this.options.projectId);
            const woIdx = store.getState().projects[projIdx].work_orders.findIndex(w => w.hash === this.options.woHash);
            store.getState().projects[projIdx].work_orders[woIdx].soc_checklist = updatedSocs;
            store.saveState(); // Forzamos el guardado

            this.options.onCompleteCallback(hoursInvested);
            this.container.innerHTML = ''; // Destruimos el componente
        });
    }
}
