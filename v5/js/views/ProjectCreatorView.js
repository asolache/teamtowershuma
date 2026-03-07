// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciador de Redes IA | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                .creator-container { display: flex; height: 100vh; width: 100%; overflow: hidden; }
                
                /* PANEL IZQUIERDO: INPUT */
                .prompt-panel {
                    width: 40%; padding: 3rem; display: flex; flex-direction: column; justify-content: center;
                    border-right: 1px solid var(--glass-border);
                    background: linear-gradient(135deg, #121216 0%, #0a0a0c 100%);
                    z-index: 10;
                }
                .prompt-panel h1 { font-size: 2.8rem; margin-bottom: 1rem; color: var(--accent-blue); letter-spacing: -1px; }
                .prompt-panel p { color: var(--text-muted); margin-bottom: 2rem; font-size: 1.05rem; line-height: 1.6; }

                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: block; font-size: 0.75rem; color: var(--accent-blue); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; }
                
                .form-control-tt {
                    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
                    color: white; padding: 12px; border-radius: 8px; font-family: inherit; outline: none;
                    transition: border-color 0.3s;
                }
                .form-control-tt:focus { border-color: var(--accent-blue); background: rgba(255,255,255,0.05); }

                .chat-box { padding: 1rem; border: 1px solid var(--glass-border); position: relative; overflow: hidden; }
                .chat-box textarea {
                    width: 100%; height: 100px; background: transparent; border: none;
                    color: var(--text-main); font-size: 1rem; resize: none; outline: none; margin-bottom: 0.5rem;
                }

                /* PANEL DERECHO: RESULTADO */
                .ontology-panel {
                    width: 60%; padding: 4rem; overflow-y: auto;
                    background: radial-gradient(circle at 0% 0%, #1a1a24 0%, var(--bg-base) 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                #loadingState { display: none; text-align: center; margin-top: 15%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

                #resultState { display: none; width: 100%; max-width: 700px; flex-direction: column; gap: 1rem; }
                
                /* TARJETAS DE ROL DINÁMICAS */
                .role-card {
                    padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
                    border: 1px solid var(--glass-border); border-radius: 12px;
                    opacity: 0; transform: translateY(20px); animation: slideIn 0.5s forwards;
                }
                @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }

                .role-info h3 { font-size: 1.1rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 10px; }
                .role-info p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
                .role-stats { text-align: right; min-width: 100px; }
                .role-stats .mult { font-size: 1.4rem; font-weight: bold; font-family: monospace; }
                .role-stats .fmv { font-size: 0.75rem; color: var(--accent-green); font-family: monospace; }

                .archetype-selector { display: flex; gap: 10px; margin-bottom: 2rem; }
                .arch-btn { 
                    flex: 1; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
                    border-radius: 6px; color: var(--text-muted); cursor: pointer; font-size: 0.8rem; transition: all 0.3s;
                }
                .arch-btn.active { border-color: var(--accent-blue); color: white; background: rgba(0, 176, 255, 0.1); }

                @media (max-width: 1024px) {
                    .creator-container { flex-direction: column; overflow-y: auto; }
                    .prompt-panel, .ontology-panel { width: 100%; height: auto; }
                }
            </style>

            <header style="position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem 2rem; z-index: 100; pointer-events: none;">
                <a href="/v5/" class="btn btn-outline" data-link style="font-size: 0.8rem; pointer-events: auto;">&larr; Abortar Misión</a>
            </header>

            <div class="creator-container">
                <div class="prompt-panel">
                    <h1>Instanciar Red</h1>
                    <p>Define la visión. El Kernel v6.1 aplicará <i>First Principles</i> para proyectar tu estructura de Castell inmutable.</p>
                    
                    <div class="input-group">
                        <label>Nombre del Proyecto</label>
                        <input type="text" id="projName" class="form-control-tt" placeholder="Ej: NeoHealth DAO">
                    </div>

                    <div class="input-group">
                        <label>Arquetipo Económico</label>
                        <div class="archetype-selector">
                            <button class="arch-btn active" data-arch="startup">STARTUP (x2.0)</button>
                            <button class="arch-btn" data-arch="dao">DAO (x1.5)</button>
                            <button class="arch-btn" data-arch="corporate">CORP (x1.0)</button>
                        </div>
                    </div>

                    <div class="glass-panel chat-box">
                        <label style="font-size: 0.7rem; color: var(--accent-blue); font-weight: bold;">OBJETIVO DE LA RED</label>
                        <textarea id="aiPromptInput" placeholder="Describe qué quieres construir..."></textarea>
                        <button id="btnGenerate" class="btn btn-primary" style="width: 100%;">
                            <span>✨</span> PROYECTAR ONTOLOGÍA
                        </button>
                    </div>
                </div>

                <div class="ontology-panel">
                    <div id="loadingState">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
                        <h2 style="color: var(--accent-blue);">Sincronizando con la IA...</h2>
                        <p style="color: var(--text-muted); margin-top: 10px;">Calculando roles del Castell, multiplicadores y entregables.</p>
                    </div>

                    <div id="resultState">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                            <div>
                                <h2 style="color: white; font-size: 1.5rem;">Estructura Proyectada</h2>
                                <p style="color: var(--accent-green); font-size: 0.8rem; font-family: monospace;">MODELO: SLICING PIE v2.4</p>
                            </div>
                            <div id="displayArch" class="badge">STARTUP</div>
                        </div>
                        
                        <div id="rolesContainer" style="display: flex; flex-direction: column; gap: 10px;"></div>

                        <div style="margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <button id="btnSealKernel" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; box-shadow: 0 0 30px rgba(0, 176, 255, 0.3);">
                                SELLAR EN EL KERNEL Y EMPEZAR &rarr;
                            </button>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">Al sellar, se creará un bloque inmutable en tu base de datos local.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const btnGenerate = document.getElementById('btnGenerate');
        const btnSeal = document.getElementById('btnSealKernel');
        const inputPrompt = document.getElementById('aiPromptInput');
        const inputName = document.getElementById('projName');
        const loadingState = document.getElementById('loadingState');
        const resultState = document.getElementById('resultState');
        const rolesContainer = document.getElementById('rolesContainer');
        
        let selectedArch = 'startup';

        // Lógica de Selección de Arquetipo
        document.querySelectorAll('.arch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.arch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedArch = btn.dataset.arch;
                document.getElementById('displayArch').innerText = selectedArch.toUpperCase();
            });
        });

        if(btnGenerate) {
            btnGenerate.addEventListener('click', () => {
                const prompt = inputPrompt.value.trim();
                const name = inputName.value.trim();

                if(!prompt || !name) {
                    alert("Comandante, asigne un nombre y un objetivo a la red.");
                    return;
                }
                
                loadingState.style.display = 'block';
                resultState.style.display = 'none';
                btnGenerate.disabled = true;

                // SIMULACIÓN DE IA GENERANDO LA ONTOLOGÍA
                setTimeout(() => {
                    loadingState.style.display = 'none';
                    resultState.style.display = 'flex';
                    btnGenerate.disabled = false;
                    btnGenerate.innerHTML = "<span>✨</span> RECALIBRAR";

                    this.renderGeneratedRoles(prompt);
                }, 1800);
            });
        }

        // ACCIÓN FINAL: GUARDAR EN STORE
        btnSeal.addEventListener('click', () => {
            const finalName = inputName.value.trim();
            const projectId = 'proj-' + Date.now();

            // 1. Inyectamos en el Kernel Real (store.js)
            store.dispatch({
                type: 'ADD_PROJECT',
                payload: {
                    id: projectId,
                    nombre: finalName,
                    sector: 'software', // Por defecto para la demo
                    archetype: selectedArch,
                    prompt: inputPrompt.value.trim()
                }
            });

            // 2. Navegamos al Mapa (VNA) para ver la red creada
            // Usamos el router del sistema para ir a /v5/map
            window.location.href = '/v5/map'; 
        });
    }

    renderGeneratedRoles(prompt) {
        const rolesContainer = document.getElementById('rolesContainer');
        rolesContainer.innerHTML = '';

        // Definición de Roles del Castell (Ontología Base)
        const levels = [
            { id: '@anxaneta', name: 'Visionario / CEO', mult: 'x3.0', fmv: '70€/h', color: 'var(--role-anxaneta)' },
            { id: '@aixecador', name: 'Orquestador / PM', mult: 'x2.0', fmv: '55€/h', color: 'var(--role-aixecador)' },
            { id: '@dosos', name: 'Auditor de Valor', mult: 'x1.5', fmv: '45€/h', color: 'var(--role-dosos)' },
            { id: '@baixos', name: 'Constructor Core', mult: 'x1.0', fmv: '40€/h', color: 'var(--role-baixos)' },
            { id: '@pinya', name: 'Soporte de Red', mult: 'x1.0', fmv: '30€/h', color: 'var(--role-pinya)' }
        ];

        levels.forEach((l, i) => {
            const card = document.createElement('div');
            card.className = 'glass-panel role-card';
            card.style.animationDelay = `${i * 0.1}s`;
            card.innerHTML = `
                <div class="role-info">
                    <h3><span class="badge" style="color: ${l.color}; border-color: ${l.color};">${l.id}</span> ${l.name}</h3>
                    <p>Responsable de adaptar la visión de "${prompt.substring(0, 30)}..." a este nivel de la torre.</p>
                </div>
                <div class="role-stats">
                    <div class="mult">${l.mult}</div>
                    <div class="fmv">FMV: ${l.fmv}</div>
                </div>
            `;
            rolesContainer.appendChild(card);
        });
    }
}
