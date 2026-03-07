// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciador de Redes | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                .creator-container { display: flex; height: 100vh; width: 100%; overflow: hidden; background: #0a0a0c; font-family: sans-serif; }
                
                /* PANEL IZQUIERDO: INPUT */
                .prompt-panel {
                    width: 40%; padding: 3rem; display: flex; flex-direction: column; justify-content: center;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    background: linear-gradient(135deg, #121216 0%, #0a0a0c 100%);
                    z-index: 10;
                }
                .prompt-panel h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #00b0ff; letter-spacing: -1px; }
                .prompt-panel p { color: #888; margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5; }

                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: block; font-size: 0.75rem; color: #00b0ff; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; }
                
                .form-control-tt {
                    width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    color: white; padding: 12px; border-radius: 8px; font-family: inherit; outline: none; font-size: 1rem;
                    transition: border-color 0.3s;
                }
                .form-control-tt:focus { border-color: #00b0ff; background: rgba(255,255,255,0.05); }
                .form-control-tt option { background: #121216; color: white; }

                .archetype-selector { display: flex; gap: 10px; margin-bottom: 5px; }
                .arch-btn { 
                    flex: 1; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 6px; color: #888; cursor: pointer; font-size: 0.8rem; transition: all 0.3s; font-weight: bold;
                }
                .arch-btn.active { border-color: #00e676; color: white; background: rgba(0, 230, 118, 0.1); }
                .arch-desc { font-size: 0.7rem; color: #666; margin-bottom: 1.5rem; text-align: center; height: 15px;}

                /* PANEL DERECHO: RESULTADO */
                .ontology-panel {
                    width: 60%; padding: 4rem; overflow-y: auto;
                    background: radial-gradient(circle at 0% 0%, #1a1a24 0%, #0a0a0c 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                #resultState { width: 100%; max-width: 700px; display: flex; flex-direction: column; gap: 1rem; }
                
                .role-card {
                    padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02);
                    animation: fadeIn 0.4s ease forwards;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .role-info h3 { font-size: 1.1rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 10px; color: white;}
                .role-info p { font-size: 0.85rem; color: #888; line-height: 1.4; margin: 0;}
                .role-stats { text-align: right; min-width: 100px; }
                .role-stats .mult { font-size: 1.4rem; font-weight: bold; font-family: monospace; color: white; transition: color 0.3s;}
                .role-stats .fmv { font-size: 0.75rem; color: #00e676; font-family: monospace; }

                @media (max-width: 1024px) {
                    .creator-container { flex-direction: column; overflow-y: auto; }
                    .prompt-panel, .ontology-panel { width: 100%; height: auto; border-right: none; }
                }
            </style>

            <header style="position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem 2rem; z-index: 100; pointer-events: none;">
                <a href="/v5/" class="btn btn-outline" data-link style="font-size: 0.8rem; pointer-events: auto;">&larr; Abortar Misión</a>
            </header>

            <div class="creator-container">
                <div class="prompt-panel">
                    <h1>Instanciar Red</h1>
                    <p>Configura el modelo económico (Arquetipo) y el modelo operativo (Ontología) para proyectar tu Castell.</p>
                    
                    <div class="input-group">
                        <label>Nombre del Proyecto / Red</label>
                        <input type="text" id="projName" class="form-control-tt" placeholder="Ej: NeoHealth Corp">
                    </div>

                    <div class="input-group">
                        <label>1. Arquetipo Económico (Factor Riesgo)</label>
                        <div class="archetype-selector">
                            <button class="arch-btn active" data-arch="startup" data-mult="2.0">STARTUP (x2.0)</button>
                            <button class="arch-btn" data-arch="dao" data-mult="1.5">DAO (x1.5)</button>
                            <button class="arch-btn" data-arch="corporate" data-mult="1.0">CORP (x1.0)</button>
                        </div>
                        <div id="archDesc" class="arch-desc">Alto riesgo. El equipo cobra en Slices (Equity).</div>
                    </div>

                    <div class="input-group">
                        <label>2. Ontología Operativa (Sector)</label>
                        <select id="sectorSelect" class="form-control-tt">
                            <option value="">Cargando sectores...</option>
                        </select>
                    </div>

                    <button id="btnLoadOntology" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                        <span>👁️</span> PROYECTAR ESTRUCTURA
                    </button>
                </div>

                <div class="ontology-panel">
                    <div id="resultState">
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
                            <div>
                                <h2 style="color: white; font-size: 1.5rem; margin: 0;">Estructura Proyectada</h2>
                                <p style="color: #00b0ff; font-size: 0.8rem; font-family: monospace; margin-top: 5px;">ONTOLOGÍA: <span id="displaySector" style="color: white;">--</span></p>
                            </div>
                            <div id="displayArch" class="badge" style="border-color: #00e676; color: #00e676; background: rgba(0,230,118,0.1);">STARTUP</div>
                        </div>
                        
                        <div id="rolesContainer" style="display: flex; flex-direction: column; gap: 10px;">
                            <p style="color: #666; text-align: center; margin-top: 2rem;">Selecciona una ontología y pulsa "Proyectar Estructura"</p>
                        </div>

                        <div style="margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
                            <button id="btnSealKernel" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; box-shadow: 0 0 30px rgba(0, 176, 255, 0.3); display: none;">
                                SELLAR EN EL KERNEL Y EMPEZAR &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const inputName = document.getElementById('projName');
        const sectorSelect = document.getElementById('sectorSelect');
        const btnLoad = document.getElementById('btnLoadOntology');
        const btnSeal = document.getElementById('btnSealKernel');
        const rolesContainer = document.getElementById('rolesContainer');
        const displaySector = document.getElementById('displaySector');
        const archDesc = document.getElementById('archDesc');
        
        let selectedArch = 'startup';
        let currentArchMultiplier = 2.0;
        let loadedRoles = []; // Guardamos los roles en memoria para recalcular

        // 1. Cargar opciones del Select de forma ultra-segura
        const fallbackOntology = {
            'startup_tech': { '@anxaneta': { name: 'Tech Founder' }, '@baixos': { name: 'FullStack Dev' } },
            'agencia_marketing': { '@anxaneta': { name: 'Growth Director' }, '@baixos': { name: 'Content Creator' } }
        };
        
        const sourceData = (typeof GLOBAL_ONTOLOGY !== 'undefined' && Object.keys(GLOBAL_ONTOLOGY).length > 0) ? GLOBAL_ONTOLOGY : fallbackOntology;
        
        sectorSelect.innerHTML = Object.keys(sourceData).map(sector => 
            `<option value="${sector}">${sector.replace(/_/g, ' ').toUpperCase()}</option>`
        ).join('');

        // 2. Lógica de Selección de Arquetipo con Recálculo en Vivo
        const descripciones = {
            'startup': 'Alto riesgo. El equipo invierte tiempo a cambio de Equity.',
            'dao': 'Riesgo medio. Recompensas por Bounties y Tokens de Gobernanza.',
            'corporate': 'Riesgo cero. Contratos fijos y salarios en Fiat (€/$).'
        };

        document.querySelectorAll('.arch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.arch-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                selectedArch = btn.dataset.arch;
                currentArchMultiplier = parseFloat(btn.dataset.mult);
                
                document.getElementById('displayArch').innerText = selectedArch.toUpperCase();
                archDesc.innerText = descripciones[selectedArch];

                // Si ya hay roles cargados en pantalla, actualizar sus multiplicadores visualmente
                if (loadedRoles.length > 0) {
                    this.renderRolesPreview(loadedRoles, currentArchMultiplier);
                }
            });
        });

        // 3. CARGAR ROLES DE LA ONTOLOGÍA Y PINTARLOS
        btnLoad.addEventListener('click', () => {
            const sectorElegido = sectorSelect.value;
            displaySector.innerText = sectorElegido.replace(/_/g, ' ').toUpperCase();
            
            let sectorDataObj = sourceData[sectorElegido] || {};
            loadedRoles = [];

            // Adaptar estructura del objeto
            Object.keys(sectorDataObj).forEach(levelId => {
                const r = sectorDataObj[levelId];
                // Ignoramos arrays por si acaso se cuela algo raro
                if(typeof r === 'object' && !Array.isArray(r)) {
                    loadedRoles.push({
                        levelId: levelId,
                        name: r.name || levelId,
                        baseMultiplier: r.multiplier || 1.0, // Factor de peso del ROL
                        fmv: r.fmv || 50
                    });
                }
            });

            // Fallback por si la ontología estuviera rota
            if (loadedRoles.length === 0) {
                loadedRoles = [
                    { levelId: '@anxaneta', name: 'Visionario', baseMultiplier: 3.0, fmv: 60 },
                    { levelId: '@aixecador', name: 'Orquestador', baseMultiplier: 2.0, fmv: 50 },
                    { levelId: '@dosos', name: 'Auditor', baseMultiplier: 1.5, fmv: 45 },
                    { levelId: '@baixos', name: 'Constructor', baseMultiplier: 1.0, fmv: 40 },
                    { levelId: '@pinya', name: 'Soporte', baseMultiplier: 1.0, fmv: 30 }
                ];
            }

            this.renderRolesPreview(loadedRoles, currentArchMultiplier);
            btnSeal.style.display = 'block'; // Mostrar el botón final
        });

        // 4. ACCIÓN FINAL: GUARDAR EN STORE Y VIAJAR AL MAPA
        btnSeal.addEventListener('click', () => {
            const finalName = inputName.value.trim() || 'Proyecto Sin Nombre';
            const sectorElegido = sectorSelect.value;
            const projectId = 'proj-' + Date.now();

            store.dispatch({
                type: 'ADD_PROJECT',
                payload: {
                    id: projectId,
                    nombre: finalName,
                    sector: sectorElegido, 
                    archetype: selectedArch,
                    bypassSecurity: true 
                }
            });

            window.location.href = '/v5/map'; 
        });
    }

    // Función separada para pintar para poder reutilizarla al cambiar el Arquetipo
    renderRolesPreview(roles, archMult) {
        const container = document.getElementById('rolesContainer');
        container.innerHTML = '';

        roles.forEach((r, i) => {
            const color = this.getColorForLevel(r.levelId);
            // El Multiplicador Final es la multiplicación del Peso del Rol x El Factor de Riesgo
            const finalMultiplier = (r.baseMultiplier * archMult).toFixed(1);
            
            const card = document.createElement('div');
            card.className = 'role-card';
            card.style.animationDelay = `${i * 0.1}s`;
            
            // Si el arquetipo es corporate (x1.0), se nota visualmente
            const multColor = archMult === 1.0 ? '#888' : '#00e676';

            card.innerHTML = `
                <div class="role-info">
                    <h3><span class="badge" style="color: ${color}; border-color: ${color};">${r.levelId}</span> ${r.name}</h3>
                    <p>Peso Base: x${r.baseMultiplier.toFixed(1)} | Mercado: ${r.fmv}€/h</p>
                </div>
                <div class="role-stats">
                    <div class="mult" style="color: ${multColor}">x${finalMultiplier}</div>
                    <div class="fmv" style="color: #555;">Riesgo Total</div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' };
        return colors[levelId] || '#ffffff';
    }
}
