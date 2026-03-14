// v8/js/views/LmsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import '../components/SemanticElement.js'; // Inicializa los Web Components

export default class LmsView {
    constructor() {
        document.title = "Cerebro LMS | TeamTowers V8";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "Cerebro Semántico (LMS)",
            subtitle: project ? project.nombre : 'Global',
            tagline: "Base de Conocimiento híbrida. Legible para Humanos, estructurada para IAs (JSON-LD).",
            actionHtml: isPO ? `<button id="btnNewDoc" class="btn-primary">➕ Redactar Directriz</button>` : ''
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; scroll-behavior: smooth; }
                
                .lms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; padding-bottom: 5rem; }
                
                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 10px 20px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2);}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4);}

                /* MODAL */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 5000; }
                .modal-content { background: var(--bg-dark); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 20px; width: 600px; max-width: 95%; box-shadow: 0 30px 60px rgba(0,0,0,0.9); border-top: 4px solid var(--accent-blue);}
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.8rem; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; }
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 14px; border-radius: 10px; font-family: inherit; font-size: 1rem; width: 100%; box-sizing: border-box; outline: none;}
                .form-control:focus { border-color: var(--accent-blue); }

                @media (max-width: 768px) {
                    .workspace { padding: 90px 1rem 120px 1rem; }
                    .lms-grid { grid-template-columns: 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/lms')}
                
                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div style="background: rgba(0,176,255,0.05); border: 1px dashed var(--accent-blue); color: #ccc; padding: 15px; border-radius: 12px; margin-bottom: 2rem; font-size: 0.9rem; line-height: 1.5;">
                        🧠 <b>Grounding para Agentes:</b> Las tarjetas inferiores son <i>Web Components</i>. Ocultan un esquema JSON-LD en el DOM. Cuando un Agente Analista revisa un entregable, primero lee estos documentos desde IndexedDB para saber qué criterios de calidad exigir.
                    </div>

                    <div class="lms-grid" id="kbGrid">
                        </div>
                </main>

                <div class="modal-overlay" id="docModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0;">Nueva Directriz (LMS)</h2>
                        
                        <div class="form-group">
                            <label>Rol Objetivo (Destinatario)</label>
                            <select id="inpDocRole" class="form-control" style="color:var(--accent-purple); font-weight:bold; font-family:monospace;">
                                <option value="Global">Global (Toda la red)</option>
                                <option value="@anxaneta">@anxaneta</option>
                                <option value="@aixecador">@aixecador</option>
                                <option value="@dosos">@dosos</option>
                                <option value="@baixos">@baixos</option>
                                <option value="@pinya">@pinya</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Título del Documento</label>
                            <input type="text" id="inpDocTitle" class="form-control" placeholder="Ej: Standard de Código Clean Architecture">
                        </div>
                        
                        <div class="form-group">
                            <label>Contenido (Instrucciones para Humanos e IA)</label>
                            <textarea id="inpDocContent" class="form-control" rows="6" placeholder="Describe los pasos, reglas de negocio o estándares esperados..."></textarea>
                        </div>

                        <div style="display:flex; justify-content:space-between; margin-top:2rem;">
                            <button class="btn-primary" style="background:transparent; border:1px solid #555;" id="btnCancelDoc">Cancelar</button>
                            <button class="btn-primary" id="btnSaveDoc">💾 Guardar en Memoria Profunda</button>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/lms')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const activeProjectId = localStorage.getItem('tt_active_project') || 'global';

        // 1. Iniciar IndexedDB
        await KB.init();
        
        // 2. Cargar Documentos
        this.renderDocuments(activeProjectId);

        // 3. Lógica del Modal
        const modal = document.getElementById('docModal');
        const btnNew = document.getElementById('btnNewDoc');
        if (btnNew) btnNew.addEventListener('click', () => modal.style.display = 'flex');
        
        document.getElementById('btnCancelDoc')?.addEventListener('click', () => modal.style.display = 'none');

        document.getElementById('btnSaveDoc')?.addEventListener('click', async () => {
            const title = document.getElementById('inpDocTitle').value.trim();
            const role = document.getElementById('inpDocRole').value;
            const content = document.getElementById('inpDocContent').value.trim();

            if (!title || !content) return alert("Título y contenido requeridos.");

            await KB.saveDocument({
                projectId: activeProjectId,
                roleTarget: role,
                title: title,
                content: content
            });

            modal.style.display = 'none';
            document.getElementById('inpDocTitle').value = '';
            document.getElementById('inpDocContent').value = '';
            
            this.renderDocuments(activeProjectId);
        });
    }

    async renderDocuments(projectId) {
        const grid = document.getElementById('kbGrid');
        if (!grid) return;

        const docs = await KB.getAllDocuments(projectId);
        
        if (docs.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; border:1px dashed #444; border-radius:16px; color:#888;">El Cerebro Semántico está vacío. Inyecta la primera directriz.</div>`;
            return;
        }

        // Inyectamos los Web Components (Doble Vista W3C)
        grid.innerHTML = docs.map(doc => {
            const jsonldString = JSON.stringify(doc.jsonLd).replace(/"/g, '&quot;');
            return `
                <tt-knowledge-card 
                    data-title="${doc.title}" 
                    data-role="${doc.roleTarget}" 
                    data-content="${doc.content}"
                    data-jsonld="${jsonldString}">
                </tt-knowledge-card>
            `;
        }).join('');
    }
}
