// v5/js/views/ProjectCreatorView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

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
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* NUEVA ARQUITECTURA DEL SIDEBAR */
                .sidebar { width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid rgba(255,255,255,0.05); padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 10; flex-shrink: 0; overflow-y: auto;}
                .side-section { margin-bottom: 1rem; }
                .side-link { padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: #888; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .side-link.active { background: rgba(0, 176, 255, 0.1); color: #00b0ff; font-weight: bold; border-left: 3px solid #00b0ff; }
                
                /* Footer del Sidebar (Sistema) */
                .sidebar-footer { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; }
                .user-status { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.05);}
                .user-status .name { color: white; font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;}
                .btn-logout { background: transparent; border: none; color: #ff5252; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; }
                .btn-logout:hover { transform: scale(1.2); }

                /* Workspace Central */
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; }
                
                /* WIZARD CONTAINER */
                .wizard-card { background: #121216; border: 1px solid #222; border-radius: 16px; width: 100%; max-width: 800px; padding: 3rem; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);}
                .wizard-header { text-align: center; margin-bottom: 3rem; }
                .wizard-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                .wizard-header p { color: #888; margin-top: 10px; }
                
                .step-indicator { display: flex; justify-content: center; gap: 10px; margin-bottom: 2rem; }
                .dot { width: 12px; height: 12px; border-radius: 50%; background: #333; transition: all 0.3s; }
                .dot.active { background: #00b0ff; box-shadow: 0 0 10px #00b0ff; transform: scale(1.2); }

                /* FORMS */
                .form-group { margin-bottom: 1.5rem; }
                .form-label { display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .form-control { width: 100%; background: #050505; border: 1px solid #333; color: white; padding: 12px 15px; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; }
                .form-control:focus { border-color: #00b0ff; outline: none; }

                /* STEP 2: ROLES DINÁMICOS */
                .role-draft-list { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 2rem; max-height: 400px; overflow-y: auto; padding-right: 10px;}
                .role-draft-item { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; }
                .role-inputs { display: flex; gap: 10px; flex: 1; align-items: center; }
                .role-inputs input { background: transparent; border: none; color: white; font-size: 1rem; border-bottom: 1px solid #333; padding: 5px; width: 100%; }
                .role-inputs input:focus { border-bottom-color: #00b0ff; outline: none; }
                .role-inputs .fmv-input { width: 80px; text-align: center; color: #00e676; font-family: monospace; }
                .btn-del-role { background: transparent; border: none; color: #ff5252; cursor: pointer; font-size: 1.2rem; padding: 5px; }

                .actions { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); }
                .btn { padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: all 0.2s; border: none; }
                .btn-primary { background: #00b0ff; color: white; }
                .btn-primary:hover { background: #0091ea; transform: translateY(-2px); }
                .btn-outline { background: transparent; border: 1px solid #555; color: white; }
                .btn-outline:hover { background: rgba(255,255,255,0.05); }
                .btn-success { background: #00e676; color: black; box-shadow: 0 10px 20px rgba(0, 230, 118, 0.2); }
                .btn-success:hover { background: #00c853; transform: translateY(-2px); }

                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .sidebar { width: 100%; padding: 1rem; flex-direction: row; overflow-x: auto; flex-wrap: nowrap; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .sidebar-footer { margin-top: 0; border-top: none; padding-top: 0; display: flex; gap: 10px; align-items: center; }
                    .role-inputs { flex-direction: column; align-items: flex-start; }
                }
            </style>

            <div class="app-layout">
                <aside class="sidebar">
                    <div style="font-weight: bold; font-family: monospace; color: white; margin-bottom: 2rem; font-size: 1.2rem; flex-shrink: 0;">🗼 TeamTowers</div>
                    
                    <div class="side-section">
                        <a href="/v5/" class="side-link" data-link>🏠 Inicio</a>
                        <a href="/v5/network" class="side-link" data-link>🌐 Explorar DAOs</a>
                        <a href="/v5/create" class="side-link active" data-link>➕ Crear Red</a>
                    </div>
                    
                    <div class="sidebar-footer">
                        <a href="#" class="side-link" style="font-size: 0.8rem;">📚 Documentación (Docs)</a>
                        <a href="#" class="side-link" style="font-size: 0.8rem;">⚙️ Configuración Global</a>
                        
                        <div class="user-status" id="authStatusContainer">
                            </div>
                    </div>
                </aside>

                <main class="workspace">
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
                                <label class="form-label">Nombre de la Red</label>
                                <input type="text" id="inpName" class="form-control" placeholder="Ej: Proyecto Apollo V2">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Ontología Semántica (Sector)</label>
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
                                <label class="form-label">Arquetipo de Gobernanza</label>
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
                            <div class="wizard-header">
                                <h1>Modelado de Nodos</h1>
                                <p>La IA ha pre-cargado la estructura base de tu sector. Edita, añade o elimina roles antes de lanzar.</p>
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
            inpArch: document.getElementById('inpArch'),
            authStatus: document.getElementById('authStatusContainer')
        };

        this.renderAuthStatus();

        // NAVEGACIÓN DEL WIZARD
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

        // AÑADIR ROL MANUAL EN DRAFT
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

        // LANZAR PROYECTO FINAL
        this.dom.btnLaunch.addEventListener('click', () => this.finalizeProject());
    }

    // --- NUEVA LÓGICA DE LOGIN/LOGOUT EN EL SIDEBAR ---
    renderAuthStatus() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        if (activeUserId && activeUserId !== 'ecosystem-admin') {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            const name = user ? user.name : activeUserId;
            
            this.dom.authStatus.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 24px; background: #00b0ff; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: black; font-weight: bold; font-size: 0.7rem;">${name.charAt(0).toUpperCase()}</div>
                    <div class="name" title="${name}">${name}</div>
                </div>
                <button class="btn-logout" id="btnLogout" title="Cerrar Sesión / Cambiar Usuario">⏻</button>
            `;
            
            document.getElementById('btnLogout').addEventListener('click', () => {
                // Hacemos logout bajando la sesión al admin por defecto
                store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
                window.location.href = '/v5/team'; // Redirigimos a tripulación para que se vuelva a loguear
            });
        } else {
            this.dom.authStatus.innerHTML = `
                <a href="/v5/team" data-link style="color: #00e676; text-decoration: none; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 5px; width: 100%; justify-content: center;">
                    👤 Iniciar Sesión
                </a>
            `;
        }
    }

    // --- LÓGICA DEL INSTANCIADOR DINÁMICO ---
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
        const colors = { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' };

        this.draftRoles.forEach((role, index) => {
            const color = colors[role.levelId] || '#fff';
            const row = document.createElement('div');
            row.className = 'role-draft-item';
            
            row.innerHTML = `
                <div class="role-inputs">
                    <span style="color: ${color}; font-weight: bold; width: 90px; font-size: 0.8rem;">${role.levelId}</span>
                    <input type="text" value="${role.name}" class="inp-role-name" data-idx="${index}" title="Nombre del Rol">
                    <div style="display:flex; align-items:center; gap: 5px;">
                        <span style="color: #888; font-size: 0.7rem;">FMV:</span>
                        <input type="number" value="${role.fmv}" class="fmv-input inp-role-fmv" data-idx="${index}" title="Valor de Mercado €/h">
                        <span style="color: #888; font-size: 0.7rem;">€/h</span>
                    </div>
                </div>
                <button class="btn-del-role" data-idx="${index}" title="Eliminar Rol">×</button>
            `;
            this.dom.container.appendChild(row);
        });

        // Listeners de edición en tiempo real
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
            customRoles: this.draftRoles // Le pasamos los roles editados
        };

        store.dispatch({ type: 'ADD_PROJECT', payload });
        
        // Redirigimos al mapa VNA de la nueva red
        window.location.href = '/v5/map';
    }
}
