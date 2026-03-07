// v5/js/views/ProjectCreatorView.js

export default class ProjectCreatorView {
    constructor() {
        document.title = "Creador de Proyectos IA | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                /* Estilos Scoped para el Creador */
                .creator-container {
                    display: flex;
                    height: 100vh;
                    width: 100%;
                }
                
                .prompt-panel {
                    width: 40%; padding: 3rem; display: flex; flex-direction: column; justify-content: center;
                    border-right: 1px solid var(--glass-border);
                    background: linear-gradient(90deg, #121216, transparent);
                }
                .prompt-panel h1 { font-size: 2.5rem; margin-bottom: 1rem; color: var(--accent-blue); }
                .prompt-panel p { color: var(--text-muted); margin-bottom: 2rem; font-size: 1.1rem; }

                .chat-box { padding: 1rem; margin-bottom: 1rem; }
                .chat-box textarea {
                    width: 100%; height: 120px; background: transparent; border: none;
                    color: var(--text-main); font-size: 1.1rem; resize: none; outline: none; margin-bottom: 1rem;
                }
                .chat-box textarea::placeholder { color: #555; }

                .ontology-panel {
                    width: 60%; padding: 3rem; overflow-y: auto;
                    background: radial-gradient(circle at center, #1a1a24, var(--bg-base));
                    display: flex; flex-direction: column;
                }

                #loadingState { display: none; text-align: center; color: var(--accent-blue); margin-top: 20%; font-size: 1.2rem; }
                #resultState { display: none; flex-direction: column; gap: 1rem; }
                
                .role-card {
                    padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
                    opacity: 0; transform: translateX(20px); animation: slideIn 0.5s forwards;
                }
                @keyframes slideIn { to { opacity: 1; transform: translateX(0); } }

                .role-info h3 { font-size: 1.2rem; margin-bottom: 0.3rem; display: flex; align-items: center; gap: 10px; }
                .role-info p { font-size: 0.85rem; color: var(--text-muted); max-width: 400px; }
                .role-stats { text-align: right; }
                .role-stats .mult { font-size: 1.5rem; font-weight: bold; color: var(--text-main); }
                .role-stats .fmv { font-size: 0.85rem; color: var(--accent-green); }

                /* Responsividad para móviles */
                @media (max-width: 768px) {
                    .creator-container { flex-direction: column; height: auto; }
                    .prompt-panel { width: 100%; border-right: none; border-bottom: 1px solid var(--glass-border); padding: 2rem 1rem; }
                    .ontology-panel { width: 100%; padding: 2rem 1rem; }
                }
            </style>

            <header style="position: absolute; top: 0; left: 0; width: 100%; padding: 1rem 2rem; z-index: 10;">
                <a href="/" class="btn btn-outline" data-link style="font-size: 0.8rem;">&larr; Volver al Inicio</a>
            </header>

            <div class="creator-container">
                <div class="prompt-panel">
                    <h1>Instancia tu Red</h1>
                    <p>¿Qué quieres construir hoy? Nuestro motor IA diseñará la estructura organizativa perfecta basada en Slicing Pie y metodologías ágiles.</p>
                    
                    <div class="glass-panel chat-box">
                        <textarea id="aiPromptInput" placeholder="Ej: Queremos crear una app de salud mental comunitaria basada en IA y terapeutas voluntarios..."></textarea>
                        <button id="btnGenerate" class="btn btn-primary" style="width: 100%;">
                            <span>✨</span> Generar Ontología DAO
                        </button>
                    </div>
                </div>

                <div class="ontology-panel">
                    <div id="loadingState">
                        <p>🧠 Aplicando First Principles...</p>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 10px;">Calculando roles, multiplicadores de riesgo y entregables base.</p>
                    </div>

                    <div id="resultState">
                        <h2 style="margin-bottom: 1rem; color: var(--text-muted);">Estructura Proyectada (El Castell)</h2>
                        
                        <div class="glass-panel role-card" style="animation-delay: 0.1s;">
                            <div class="role-info">
                                <h3><span class="badge" style="color: var(--role-anxaneta); border: 1px solid var(--role-anxaneta);">@anxaneta</span> Visionario Clínico</h3>
                                <p>Define la estrategia médica y el modelo de negocio. Vela por la ética y el encaje con los pacientes.</p>
                            </div>
                            <div class="role-stats">
                                <div class="mult">x3.0</div>
                                <div class="fmv">FMV: 60€/h</div>
                            </div>
                        </div>

                        <div class="glass-panel role-card" style="animation-delay: 0.2s;">
                            <div class="role-info">
                                <h3><span class="badge" style="color: var(--role-dosos); border: 1px solid var(--role-dosos);">@dosos</span> Auditor Psicológico</h3>
                                <p>Revisa la seguridad de los prompts de la IA y el impacto en la salud mental de los usuarios.</p>
                            </div>
                            <div class="role-stats">
                                <div class="mult">x1.5</div>
                                <div class="fmv">FMV: 45€/h</div>
                            </div>
                        </div>

                        <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
                            <a href="/project" class="btn btn-primary" data-link>Sellar en el Kernel y Empezar &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Lógica JavaScript de la vista (Interacciones)
    executeViewScript() {
        const btnGenerate = document.getElementById('btnGenerate');
        const input = document.getElementById('aiPromptInput');
        const loadingState = document.getElementById('loadingState');
        const resultState = document.getElementById('resultState');

        if(btnGenerate) {
            btnGenerate.addEventListener('click', () => {
                if(!input.value.trim()) {
                    alert("Comandante, escribe una idea para la IA primero.");
                    return;
                }
                
                // 1. Mostrar estado de carga
                loadingState.style.display = 'block';
                resultState.style.display = 'none';
                btnGenerate.disabled = true;
                btnGenerate.innerHTML = "Calculando...";

                // 2. Simular el retraso de la red / llamada a la IA (1.5 segundos)
                setTimeout(() => {
                    loadingState.style.display = 'none';
                    resultState.style.display = 'flex';
                    btnGenerate.disabled = false;
                    btnGenerate.innerHTML = "<span>✨</span> Regenerar";
                }, 1500);
            });
        }
    }
}
