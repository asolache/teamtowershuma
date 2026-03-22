// v8/js/views/LmsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class LmsView {
    constructor() {
        document.title = "La Forja LMS | TeamTowers V15.6";
        this.allNodes = [];
    }

    async getHtml() {
        const headerConfig = {
            title: "La Forja (Cerebro LMS)",
            subtitle: "Conocimiento W3C",
            tagline: "Explora y edita la memoria profunda del sistema. OS Kernel, Memes, Skills y Prompts.",
            actionHtml: `<button class="ph-btn-magic" style="border-color:var(--accent-green); color:var(--accent-green);" onclick="window.location.href='/v8/paper'">+ Crear en Omni-Paper</button>`
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-lms { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; position: relative;}
                
                .filters-bar { display: flex; gap: 10px; margin-bottom: 2rem; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 12px; border: 1px solid var(--glass-border); overflow-x: auto;}
                .filter-btn { background: transparent; border: 1px solid #444; color: #888; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; white-space: nowrap; font-family: var(--font-mono); font-size: 0.8rem;}
                .filter-btn:hover { border-color: var(--accent-blue); color: white;}
                .filter-btn.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue);}

                .lms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding-bottom: 100px;}
                
                .meme-card { background: rgba(255,255,255,0.02); border: 1px solid #333; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: 0.3s; position: relative; overflow: hidden; cursor: pointer;}
                .meme-card:hover { border-color: var(--accent-purple); background: rgba(224,64,251,0.05); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224,64,251,0.1);}
                
                .meme-category { position: absolute; top: 0; right: 0; background: rgba(224,64,251,0.1); color: var(--accent-purple); padding: 5px 15px; border-radius: 0 0 0 12px; font-size: 0.7rem; font-family: var(--font-mono); font-weight: bold; border-left: 1px solid rgba(224,64,251,0.3); border-bottom: 1px solid rgba(224,64,251,0.3);}
                .meme-category.core_os { background: rgba(0,230,118,0.1); color: var(--accent-green); border-color: rgba(0,230,118,0.3);}
                .meme-category.project_core { background: rgba(0,176,255,0.1); color: var(--accent-blue); border-color: rgba(0,176,255,0.3);}
                .meme-category.prompt_a2a { background: rgba(255,171,64,0.1); color: var(--accent-orange); border-color: rgba(255,171,64,0.3);}

                .meme-title { font-size: 1.1rem; color: white; margin: 10px 0 0 0; font-weight: 900;}
                .meme-content { color: #aaa; font-size: 0.9rem; line-height: 1.5; font-family: 'Georgia', serif; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;}
                
                .meme-footer { margin-top: auto; padding-top: 15px; border-top: 1px dashed #333; display: flex; flex-wrap: wrap; gap: 5px; align-items: center;}
                .meme-tag { background: rgba(0,0,0,0.6); color: #888; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);}

                .empty-lms { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: #666; border: 1px dashed #333; border-radius: 20px;}

                /* 🔥 MODAL DE EDICIÓN W3C */
                .modal-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(5,5,8,0.8); backdrop-filter: blur(10px); z-index: 1000; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;}
                .modal-overlay.active { display: flex; opacity: 1; }
                .modal-card { background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-purple); border-radius: 20px; width: 100%; max-width: 650px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(224,64,251,0.2); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 90vh; overflow-y: auto;}
                .modal-overlay.active .modal-card { transform: translateY(0); }
                
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 1rem;}
                .modal-header h2 { margin: 0; color: white; font-size: 1.5rem; font-weight: 900;}
                .btn-close { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; transition: 0.2s;}
                .btn-close:hover { color: var(--accent-red); transform: scale(1.1);}

                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.1);}
                .form-control.textarea { min-height: 150px; resize: vertical; font-family: 'Georgia', serif; line-height: 1.6;}
                
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 2rem; border-top: 1px dashed #333; padding-top: 1.5rem;}
                .btn-modal { padding: 12px 24px; border-radius: 10px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: 0.3s; border: none;}
                .btn-save { background: var(--accent-purple); color: white; box-shadow: 0 5px 15px rgba(224,64,251,0.3);}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(224,64,251,0.5); filter: brightness(1.2);}
                .btn-danger { background: transparent; border: 1px solid var(--accent-red); color: var(--accent-red);}
                .btn-danger:hover { background: rgba(255,82,82,0.1); transform: translateY(-2px);}

                @media (max-width: 768px) {
                    .workspace-lms { padding: 90px 1rem 120px 1rem; }
                    .modal-card { padding: 1.5rem; border-radius: 16px; margin: 10px; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/lms')}
                <main class="workspace-lms">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div class="filters-bar" id="lmsFilters">
                        <button class="filter-btn active" data-filter="all">Todos los Registros</button>
                        <button class="filter-btn" data-filter="core_os">🔧 OS Kernel</button>
                        <button class="filter-btn" data-filter="project_core">🏰 Misiones</button>
                        <button class="filter-btn" data-filter="skill">🎒 Skills</button>
                        <button class="filter-btn" data-filter="prompt_a2a">🤖 Prompts AI</button>
                        <button class="filter-btn" data-filter="SOP">📜 SOPs</button>
                        <button class="filter-btn" data-filter="SOC">⚖️ SOCs</button>
                    </div>

                    <div class="lms-grid" id="lmsGrid">
                        <div class="empty-lms">Cargando Memoria Profunda...</div>
                    </div>

                    <div class="modal-overlay" id="editModal">
                        <div class="modal-card">
                            <div class="modal-header">
                                <h2>🧠 Forjar Nodo de Conocimiento</h2>
                                <button class="btn-close" id="btnCloseModal">&times;</button>
                            </div>
                            
                            <input type="hidden" id="editNodeId">
                            <input type="hidden" id="editNodeType">
                            <input type="hidden" id="editNodeProjectId">
                            
                            <div style="display:flex; gap:15px;">
                                <div class="form-group" style="flex:1;">
                                    <label>Categoría W3C</label>
                                    <input type="text" id="editNodeCat" class="form-control" placeholder="Ej: skill, SOP, RULE...">
                                </div>
                                <div class="form-group" style="flex:2;">
                                    <label>Título del Meme</label>
                                    <input type="text" id="editNodeTitle" class="form-control" placeholder="Título descriptivo">
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Contenido Cognitivo (Memoria Semántica)</label>
                                <textarea id="editNodeContent" class="form-control textarea" placeholder="Desarrollo del concepto..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Tags / Keywords (Separados por coma)</label>
                                <input type="text" id="editNodeKeywords" class="form-control" style="font-family:var(--font-mono); color:var(--accent-green);" placeholder="tag1, tag2, proyectoX">
                            </div>

                            <div class="modal-actions">
                                <button class="btn-modal btn-danger" id="btnDeleteNode">🗑️ Purgar Nodo</button>
                                <div style="flex:1;"></div>
                                <button class="btn-modal btn-save" id="btnSaveNode">💾 Sellar Mutación</button>
                            </div>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/lms')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        this.dom = {
            grid: document.getElementById('lmsGrid'),
            filters: document.getElementById('lmsFilters'),
            modal: document.getElementById('editModal'),
            btnClose: document.getElementById('btnCloseModal'),
            btnSave: document.getElementById('btnSaveNode'),
            btnDelete: document.getElementById('btnDeleteNode'),
            
            inpId: document.getElementById('editNodeId'),
            inpType: document.getElementById('editNodeType'),
            inpProjId: document.getElementById('editNodeProjectId'),
            inpCat: document.getElementById('editNodeCat'),
            inpTitle: document.getElementById('editNodeTitle'),
            inpContent: document.getElementById('editNodeContent'),
            inpKeywords: document.getElementById('editNodeKeywords')
        };

        await this.loadData();
        this.setupFilters();
        this.setupModalEvents();
    }

    async loadData() {
        try {
            await KB.init();
            this.allNodes = await KB.getAllNodes();
            // Por defecto, mostrar filtro activo actual o 'all'
            const activeFilter = this.dom.filters.querySelector('.active')?.dataset.filter || 'all';
            this.renderNodes(activeFilter);
        } catch (error) {
            console.error("Error cargando LMS:", error);
            this.dom.grid.innerHTML = `<div class="empty-lms" style="color:var(--accent-red); border-color:var(--accent-red);">⚠️ Error crítico leyendo la Base de Datos IndexedDB.</div>`;
        }
    }

    renderNodes(filterCategory) {
        let nodesToRender = this.allNodes;

        if (filterCategory !== 'all') {
            nodesToRender = this.allNodes.filter(n => n.category === filterCategory || n.type === filterCategory);
        }

        // Ordenamos: Los más nuevos primero (Fallback a ID si no hay fecha)
        nodesToRender.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

        if (nodesToRender.length === 0) {
            this.dom.grid.innerHTML = `
                <div class="empty-lms">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🕳️</div>
                    <h3>Vacío Cognitivo</h3>
                    <p>No hay Memes en esta categoría. Utiliza el <b>Omni-Paper</b> y el comando <b>/meme</b> para forjar conocimiento.</p>
                </div>
            `;
            return;
        }

        this.dom.grid.innerHTML = nodesToRender.map(node => {
            const safeCat = node.type === 'prompt_a2a' ? 'prompt_a2a' : (node.category || 'MEME');
            const tags = (node.keywords && Array.isArray(node.keywords)) ? node.keywords : [];
            
            let tagsHtml = tags.slice(0, 3).map(t => `<span class="meme-tag">#${t}</span>`).join('');
            if (tags.length > 3) tagsHtml += `<span class="meme-tag">+${tags.length - 3}</span>`;

            // Codificamos el ID para pasarlo seguro por el DOM
            const safeId = node.id.replace(/"/g, '&quot;');

            return `
                <div class="meme-card" data-id="${safeId}">
                    <div class="meme-category ${safeCat}">${safeCat}</div>
                    <h4 class="meme-title">${node.title || 'Nodo Sin Título'}</h4>
                    <div class="meme-content">${node.content || 'Sin contenido detallado.'}</div>
                    <div class="meme-footer">
                        <span class="meme-tag" style="color:var(--accent-blue);">✏️ Editar</span>
                        ${tagsHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Evento de clic en cada tarjeta para abrir el editor
        this.dom.grid.querySelectorAll('.meme-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const nodeId = e.currentTarget.dataset.id;
                this.openEditor(nodeId);
            });
        });
    }

    setupFilters() {
        const btns = this.dom.filters.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                btns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderNodes(e.target.dataset.filter);
            });
        });
    }

    // ==========================================
    // LÓGICA DEL CRUD (MODAL)
    // ==========================================
    openEditor(nodeId) {
        const node = this.allNodes.find(n => n.id === nodeId);
        if (!node) return;

        this.dom.inpId.value = node.id;
        this.dom.inpType.value = node.type || 'meme';
        this.dom.inpProjId.value = node.projectId || 'global';
        
        this.dom.inpCat.value = node.category || '';
        this.dom.inpTitle.value = node.title || '';
        this.dom.inpContent.value = node.content || '';
        
        // Convertir array de keywords a string con comas
        const tags = (node.keywords && Array.isArray(node.keywords)) ? node.keywords.join(', ') : (node.keywords || '');
        this.dom.inpKeywords.value = tags;

        // Proteger Nodos del Kernel contra borrado accidental
        const isKernel = tags.includes('#kernel_sos');
        this.dom.btnDelete.style.display = isKernel ? 'none' : 'block';

        this.dom.modal.classList.add('active');
    }

    closeEditor() {
        this.dom.modal.classList.remove('active');
    }

    setupModalEvents() {
        this.dom.btnClose.addEventListener('click', () => this.closeEditor());
        
        // Cerrar al hacer clic fuera del modal
        this.dom.modal.addEventListener('click', (e) => {
            if (e.target === this.dom.modal) this.closeEditor();
        });

        // GUARDAR NODO
        this.dom.btnSave.addEventListener('click', async () => {
            const id = this.dom.inpId.value;
            const title = this.dom.inpTitle.value.trim();
            const content = this.dom.inpContent.value.trim();
            
            if (!title || !content) return alert("Título y contenido son obligatorios.");

            // Limpiar y separar keywords
            const rawKeywords = this.dom.inpKeywords.value;
            const keywordsArray = rawKeywords.split(',').map(k => k.trim()).filter(k => k !== '');

            const updatedNode = {
                id: id,
                type: this.dom.inpType.value,
                projectId: this.dom.inpProjId.value,
                category: this.dom.inpCat.value.trim(),
                title: title,
                content: content,
                keywords: keywordsArray
            };

            this.dom.btnSave.disabled = true;
            this.dom.btnSave.innerText = "⏳ Sellando...";

            try {
                await KB.init();
                await KB.saveNode(updatedNode);
                await this.loadData(); // Recarga toda la matriz
                this.closeEditor();
            } catch (e) {
                alert(`Error al guardar en la BD: ${e.message}`);
            } finally {
                this.dom.btnSave.disabled = false;
                this.dom.btnSave.innerText = "💾 Sellar Mutación";
            }
        });

        // BORRAR NODO
        this.dom.btnDelete.addEventListener('click', async () => {
            const id = this.dom.inpId.value;
            if (!confirm("⚠️ ¿Purgar este nodo de la base de datos?\nEsta acción es irreversible y puede generar huecos en la memoria de los Agentes.")) return;

            this.dom.btnDelete.disabled = true;
            try {
                await KB.init();
                await KB.deleteNode(id);
                await this.loadData();
                this.closeEditor();
            } catch (e) {
                alert(`Error al purgar nodo: ${e.message}`);
            } finally {
                this.dom.btnDelete.disabled = false;
            }
        });
    }
}
