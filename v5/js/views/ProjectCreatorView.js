// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Instanciador Dinámico | TeamTowers";
        this.currentStep = 1;
        this.draftRoles = [];
        this.selectedSector = '';
    }

    async getHtml() {
        return `
            <style>
                /* Estilos locales ultra-específicos para el Wizard que no están en el master.css */
                .wizard-workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
                .wizard-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; max-width: 800px; padding: 3rem; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
                .wizard-header { text-align: center; margin-bottom: 2rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                .wizard-header p { color: var(--text-muted); margin-top: 10px; }
                
                .step-indicator { display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: #333; transition: all 0.3s; }
                .dot.active { background: var(--accent-blue); box-shadow: 0 0 10px var(--accent-blue); transform: scale(1.2); }

                .educational-legend { background: rgba(0, 176, 255, 0.05); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: var(--border-radius-sm); padding: 15px; margin-bottom: 2rem; font-size: 0.8rem; color: #ccc; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .legend-item { display: flex; align-items: flex-start; gap: 8px; }
                .legend-item span { font-weight: bold; }

                .role-draft-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; max-height: 400px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px 15px; border-radius: var(--border-radius-sm); gap: 15px;}
                
                .role-inputs { display: flex; gap: 15px; flex: 1; align-items: center; }
                .inp-role-level { background: #050505; border: 1px solid #333; border-radius: 6px; padding: 6px; font-size: 0.75rem; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .inp-role-level:focus { border-color: var(--accent-blue); }
                .inp-role-level option { background: var(--bg-panel); color: white; }

                .role-inputs input { background: transparent; border: none; color: white; font-size: 1rem; border-bottom: 1px solid #333; padding: 5px; flex: 1; min-width: 150px;}
                .role-inputs input:focus { border-bottom-color: var(--accent-blue); outline: none; }
                .role-inputs .fmv-input { width: 70px; min-width: 70px; text-align: center; color: var(--accent-green); font-family: var(--font-mono); }
                
                .btn-del-role { background: transparent; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.2rem; padding: 5px; transition: transform 0.2s; }
                .btn-del-role:hover { transform: scale(1.2); }

                .actions { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--glass-border); }

                @media (max-width: 768px) {
                    .wizard-workspace { padding: 1rem; }
                    .wizard-card { padding: 1.5rem; }
                    .role-draft-item { flex-direction: column; align-items: stretch; }
                    .role-inputs { flex-direction: column; align-items: stretch; }
                    .btn-del-role { align-self: flex-end; }
                    .educational-legend { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/create')}

                <main class="wizard-workspace">
                    <div class="wizard-card">
                        <div class="step-indicator">
                            <div class="dot active" id="dot1"></div>
                            <div class="dot" id="dot2"></div>
                        </div>

                        <div id="step1">
                            <div class="wizard-header">
                                <h1>Instanciar Red</h1>
                                <p>Define los parámetros maestros de tu nuevo Castell.</p>
                            </div>
                            
                            <div class="form-group">
                                <label>Nombre de la Red</label>
                                <input type="text" id="inpName" class="form-control" placeholder="Ej: Proyecto Apollo V2">
                            </div>

                            <div class="form-group">
                                <label>Ontología Semántica (Sector)</label>
                                <select id="inpSector" class="form-control">
                                    <option value="tech_saas_platform">💻 Software & SaaS</option>
                                    <option value="web3_defi_protocol">⛓️ Web3 & Protocolo DeFi</option>
                                    <option value="digital_media_growth">📢 Digital Media & Growth</option>
                                    <option value="healthtech_ai">🏥 HealthTech & IA Clínica</option>
                                    <option value="deeptech_hardware">🤖 DeepTech & Hardware</option>
                                    <option value="ecommerce_d2c">📦 E-Commerce & D2C</option>
                                    <option value="agile_consulting_b2b">👔 Agencia / Consultoría B2B</option>
                                    <option value="edtech_community">🎓 EdTech & Academia</option>
                                    <option value="impact_dao_ngo">🌍 Impacto Social / ONG</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Arquetipo de Gobernanza</label>
                                <select id="inpArch" class="form-control">
                                    <option value="startup">🚀 Startup Ágil (Alta variabilidad)</option>
                                    <option value="dao">🌐 DAO (Descentralizada y transparente)</option>
                                    <option value="corporate">🏢 Corporativa (Estructura rígida)</option>
                                </select>
                            </div>

                            <div class="actions" style="justify-content: flex-end;">
                                <button class="btn btn-primary" id="btnNext">Siguiente: Modelar Nodos &rarr;</button>
                            </div>
                        </div>

                        <div id="step2" style="display: none;">
                            <div class="wizard-header" style="margin-bottom: 1.5rem;">
                                <h1>Modelado de Nodos</h1>
                                <p>Reubica y edita la estructura sugerida por la IA antes de desplegar.</p>
                            </div>

                            <div class="educational-legend">
                                <div class="legend-item"><span style="color:var(--accent-red);">👑 @anxaneta:</span> Dirección y Visión (Riesgo x3)</div>
                                <div class="legend-item"><span style="color:#ff4081;">🧭 @aixecador:</span> Coordinación y PM (Riesgo x2)</div>
                                <div class="legend-item"><span style="color:var(--accent-purple);">👁️ @dosos:</span> Auditoría y QA (Riesgo x1.5)</div>
                                <div class="legend-item"><span style="color:var(--accent-indigo);">⚙️ @baixos:</span> Especialista / Core (Riesgo x1.2)</div>
                                <div class="legend-item"><span style="color:var(--accent-blue);">🤝 @pinya:</span> Operaciones / Base (Riesgo x1)</div>
                            </div>

                            <div class="role-draft-list" id="draftRolesContainer">
                                </div>
                            
                            <button class="btn btn-outline" id="btnAddCustomRole" style="width: 100%; margin-bottom: 2rem; border-style: dashed;">+ Añadir Nodo Personalizado</button>

                            <div class="actions">
                                <button class="btn btn-outline" id="btnBack">&larr; Volver</button>
                                <button class="btn btn-success" id="btnLaunch">🚀 Lanzar Castell Inmutable</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        this.dom = {
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            dot1: document.getElementById('dot1'),
            dot2: document.getElementById('dot2'),
            btnNext: document.getElementById('btnNext'),
            btnBack: document.getElementById('btnBack'),
            btnLaunch: document.getElementById('btnLaunch'),
            btnAddCustom: document.getElementById('btnAddCustomRole'),
            container: document.getElementById('draftRolesContainer'),
            inpName: document.getElementById('inpName'),
            inpSector: document.getElementById('inpSector'),
            inpArch: document.getElementById('inpArch')
        };

        this.dom.btnNext.addEventListener('click', () => {
            if (!this.dom.inpName.value.trim()) return alert("El nombre es obligatorio.");
            this.selectedSector = this.dom.inpSector.value;
            this.loadDraftRolesFromOntology();
            
            this.dom.step1.style.display = 'none';
            this.dom.step2.style.display = 'block';
            this.dom.dot1.classList.remove('active');
            this.dom.dot2.classList.add('active');
        });

        this.dom.btnBack.addEventListener('click', () => {
            this.dom.step2.style.display = 'none';
            this.dom.step1.style.display = 'block';
            this.dom.dot2.classList.remove('active');
            this.dom.dot1.classList.add('active');
        });

        this.dom.btnAddCustom.addEventListener('click', () => {
            this.draftRoles.push({
                id: 'draft_' + Math.random().toString(36).substr(2, 9),
                levelId: '@baixos',
                name: 'Nuevo Nodo Técnico',
                fmv: 40,
                multiplier: 1.2
            });
            this.renderDraftRoles();
        });

        this.dom.btnLaunch.addEventListener('click', () => this.finalizeProject());
    }

    loadDraftRolesFromOntology() {
        const sectorData = GLOBAL_ONTOLOGY[this.selectedSector];
        this.draftRoles = [];
        
        if (sectorData) {
            Object.keys(sectorData).forEach(level => {
                this.draftRoles.push({
                    id: 'draft_' + Math.random().toString(36).substr(2, 9),
                    levelId: level,
                    name: sectorData[level].name,
                    fmv: sectorData[level].fmv || 50,
                    multiplier: sectorData[level].multiplier || 1.0
                });
            });
        }
        this.renderDraftRoles();
    }

    renderDraftRoles() {
        this.dom.container.innerHTML = '';
        
        // Colores enlazados a nuestras variables CSS globales
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        
        const levels = [
            { id: '@anxaneta', label: '@anxaneta (Dirección)' },
            { id: '@aixecador', label: '@aixecador (Coordinación)' },
            { id: '@dosos', label: '@dosos (Auditoría)' },
            { id: '@baixos', label: '@baixos (Técnico)' },
            { id: '@pinya', label: '@pinya (Base)' }
        ];

        this.draftRoles.forEach((role, index) => {
            const color = colors[role.levelId] || '#fff';
            const row = document.createElement('div');
            row.className = 'role-draft-item';
            
            let selectHtml = `<select class="inp-role-level" data-idx="${index}" style="color: ${color}; border-color: ${color};">`;
            levels.forEach(l => {
                selectHtml += `<option value="${l.id}" ${role.levelId === l.id ? 'selected' : ''}>${l.label}</option>`;
            });
            selectHtml += `</select>`;

            row.innerHTML = `
                <div class="role-inputs">
                    ${selectHtml}
                    <input type="text" value="${role.name}" class="inp-role-name" data-idx="${index}" title="Nombre del Rol">
                    <div style="display:flex; align-items:center; gap: 5px;">
                        <span style="color: var(--text-muted); font-size: 0.7rem;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}" title="Valor de Mercado €/h">
                        <span style="color: var(--text-muted); font-size: 0.7rem;">€/h</span>
                    </div>
                </div>
                <button class="btn-del-role" data-idx="${index}" title="Eliminar Rol">×</button>
            `;
            this.dom.container.appendChild(row);
        });

        // Listeners de edición
        this.dom.container.querySelectorAll('.inp-role-level').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const idx = e.target.dataset.idx;
                const newLevel = e.target.value;
                this.draftRoles[idx].levelId = newLevel;
                
                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                this.draftRoles[idx].multiplier = multipliers[newLevel];
                
                this.renderDraftRoles();
            });
        });
        this.dom.container.querySelectorAll('.inp-role-name').forEach(inp => {
            inp.addEventListener('input', (e) => this.draftRoles[e.target.dataset.idx].name = e.target.value);
        });
        this.dom.container.querySelectorAll('.inp-role-fmv').forEach(inp => {
            inp.addEventListener('input', (e) => this.draftRoles[e.target.dataset.idx].fmv = parseFloat(e.target.value) || 0);
        });
        this.dom.container.querySelectorAll('.btn-del-role').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.draftRoles.splice(e.target.dataset.idx, 1);
                this.renderDraftRoles();
            });
        });
    }

    finalizeProject() {
        const payload = {
            id: 'proj_' + Math.random().toString(36).substr(2, 9),
            nombre: this.dom.inpName.value.trim(),
            sector: this.selectedSector,
            archetype: this.dom.inpArch.value,
            customRoles: this.draftRoles 
        };

        store.dispatch({ type: 'ADD_PROJECT', payload });
        window.location.href = '/v5/map';
    }
}
