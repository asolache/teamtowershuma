// =============================================================================
// TEAMTOWERS SOS V10 — SKILL EXPLORER
// Ruta: ia/dev/js/components/SkillExplorer.js
// Explorador del KB — lista, filtra y abre nodos de conocimiento
// =============================================================================

import { KB } from '../core/kb.js';

export class SkillExplorer {

    constructor(mountPointId) {
        this.container = document.getElementById(mountPointId);
        this.allNodes  = [];
        this.dom       = {};
    }

    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
        <style>
            .lms-controls-row  { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:10px; }
            .filters-bar       { display:flex; gap:6px; background:rgba(0,0,0,0.5); padding:8px; border-radius:12px; border:1px solid var(--glass-border); overflow-x:auto; scrollbar-width:none; }
            .filters-bar::-webkit-scrollbar { display:none; }
            .filter-btn        { background:transparent; border:1px solid #444; color:#888; padding:7px 14px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s; white-space:nowrap; font-family:var(--font-mono); font-size:0.78rem; }
            .filter-btn:hover  { border-color:var(--accent-indigo,#6366f1); color:white; }
            .filter-btn.active { background:rgba(99,102,241,0.1); border-color:var(--accent-indigo,#6366f1); color:var(--accent-indigo,#6366f1); }

            .btn-deep-research       { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(224,64,251,0.1)); border:1px solid rgba(99,102,241,0.3); color:var(--accent-indigo,#6366f1); padding:8px 14px; border-radius:10px; font-weight:bold; cursor:pointer; transition:0.2s; display:flex; align-items:center; gap:6px; font-size:0.82rem; }
            .btn-deep-research:hover { background:var(--accent-indigo,#6366f1); color:white; box-shadow:0 0 20px rgba(99,102,241,0.3); }

            .dropzone-area       { border:2px dashed rgba(99,102,241,0.3); border-radius:14px; padding:1.25rem 1.5rem; display:flex; align-items:center; gap:1rem; color:#555; font-size:0.85rem; cursor:pointer; transition:0.3s; margin-bottom:1.5rem; }
            .dropzone-area:hover { border-color:var(--accent-indigo,#6366f1); color:#aaa; background:rgba(99,102,241,0.03); }
            .dropzone-area.drag-over { border-color:var(--accent-green); background:rgba(0,230,118,0.05); color:var(--accent-green); }

            .lms-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:1.25rem; }
            .empty-lms { grid-column:1/-1; text-align:center; padding:3.5rem 2rem; color:#555; border:1px dashed #333; border-radius:14px; }

            .meme-card { background:rgba(255,255,255,0.02); border:1px solid #333; border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:8px; transition:0.3s; position:relative; overflow:hidden; cursor:pointer; }
            .meme-card:hover { border-color:var(--accent-purple); background:rgba(224,64,251,0.04); transform:translateY(-3px); box-shadow:0 8px 25px rgba(224,64,251,0.1); }

            .meme-category            { position:absolute; top:0; right:0; padding:4px 12px; border-radius:0 0 0 10px; font-size:0.68rem; font-family:var(--font-mono); font-weight:bold; border-left:1px solid; border-bottom:1px solid; background:rgba(224,64,251,0.1); color:var(--accent-purple); border-color:rgba(224,64,251,0.3); }
            .meme-category.skill      { background:rgba(0,230,118,0.1);   color:var(--accent-green);          border-color:rgba(0,230,118,0.3); }
            .meme-category.reference  { background:rgba(0,176,255,0.1);   color:var(--accent-blue,#00b0ff);   border-color:rgba(0,176,255,0.3); }
            .meme-category.script     { background:rgba(255,82,82,0.1);   color:var(--accent-red);            border-color:rgba(255,82,82,0.3); }
            .meme-category.eval       { background:rgba(255,171,64,0.1);  color:var(--accent-orange);         border-color:rgba(255,171,64,0.3); }
            .meme-category.prompt_a2a { background:rgba(99,102,241,0.1);  color:var(--accent-indigo,#6366f1); border-color:rgba(99,102,241,0.3); }

            .meme-title   { font-size:1rem; color:white; margin:8px 0 0 0; font-weight:900; padding-right:60px; }
            .meme-content { color:#888; font-size:0.85rem; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
            .meme-footer  { margin-top:auto; padding-top:12px; border-top:1px dashed #333; display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
            .meme-tag     { background:rgba(0,0,0,0.6); color:#888; font-size:0.68rem; padding:2px 7px; border-radius:4px; font-family:var(--font-mono); }
        </style>

        <div class="lms-controls-row">
            <div class="filters-bar" id="lmsFilters">
                <button class="filter-btn active" data-filter="all">Todos</button>
                <button class="filter-btn" data-filter="skill">🎒 Skills</button>
                <button class="filter-btn" data-filter="reference">📚 References</button>
                <button class="filter-btn" data-filter="eval">📋 Evals</button>
                <button class="filter-btn" data-filter="script">⚡ Scripts</button>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-deep-research" id="btnNewNode" style="border-color:var(--accent-green); color:var(--accent-green);">
                    <span>➕</span> Forjar Nodo
                </button>
                <button class="btn-deep-research" id="btnOpenResearch">
                    <span>🧠</span> Deep Research (IA)
                </button>
            </div>
        </div>

        <div class="dropzone-area" id="skillDropzone">
            <span style="font-size:1.4rem;">📥</span>
            <span style="font-weight:bold;">Arrastra aquí un paquete <code>.skill</code> o <code>.zip</code> para inyectar su estructura en el Padrón.</span>
        </div>

        <div class="lms-grid" id="lmsGrid">
            <div class="empty-lms">
                <div style="font-size:3rem; margin-bottom:10px;">🧠</div>
                Cargando Memoria Profunda…
            </div>
        </div>`;

        this.dom = {
            grid:           this.container.querySelector('#lmsGrid'),
            filters:        this.container.querySelector('#lmsFilters'),
            dropzone:       this.container.querySelector('#skillDropzone'),
            btnNewNode:     this.container.querySelector('#btnNewNode'),
            btnOpenResearch: this.container.querySelector('#btnOpenResearch')
        };

        await this.loadData();
        this._setupFilters();
        this._setupEvents();
    }

    async loadData() {
        try {
            await KB.init();
            this.allNodes = await KB.getAllNodes();
            const active  = this.dom.filters?.querySelector('.active')?.dataset.filter || 'all';
            this._renderNodes(active);
        } catch (err) {
            if (this.dom.grid) {
                this.dom.grid.innerHTML = `<div class="empty-lms">⚠️ Error leyendo IndexedDB: ${err.message}</div>`;
            }
        }
    }

    _renderNodes(filterCategory) {
        let nodes = this.allNodes;
        if (filterCategory !== 'all') {
            nodes = nodes.filter(n => n.category === filterCategory || n.type === filterCategory);
        }
        nodes.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

        if (nodes.length === 0) {
            this.dom.grid.innerHTML = `
                <div class="empty-lms">
                    <div style="font-size:3rem; margin-bottom:10px;">🕳️</div>
                    <h3 style="color:#555; margin:0;">Vacío Cognitivo</h3>
                    <p style="color:#444; margin-top:8px; font-size:0.85rem;">No hay nodos de tipo "${filterCategory}" en el KB.</p>
                </div>`;
            return;
        }

        this.dom.grid.innerHTML = nodes.map(node => {
            const safeCat    = node.type === 'prompt_a2a' ? 'prompt_a2a' : (node.category || 'MEME');
            const safeId     = node.id.replace(/"/g, '&quot;');
            const tags       = Array.isArray(node.keywords) ? node.keywords : [];
            const tagsHtml   = tags.slice(0, 3).map(t => `<span class="meme-tag">#${t}</span>`).join('');

            const refCount     = node.references?.length || 0;
            const evalsCount   = node.evals?.length || 0;
            const scriptsCount = node.scripts?.length || 0;
            let countsHtml     = '';
            if (refCount     > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-blue,#00b0ff);">📚 ${refCount}</span>`;
            if (evalsCount   > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-orange);">📋 ${evalsCount}</span>`;
            if (scriptsCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-green);">⚡ ${scriptsCount}</span>`;

            return `
            <div class="meme-card" data-id="${safeId}">
                <div class="meme-category ${safeCat}">${safeCat}</div>
                <h4 class="meme-title">${node.title || 'Sin Título'}</h4>
                ${node.description ? `<div style="color:var(--accent-indigo,#6366f1); font-size:0.75rem; font-weight:bold;">${node.description}</div>` : ''}
                <div class="meme-content">${node.content || ''}</div>
                <div class="meme-footer">
                    <span class="meme-tag" style="color:var(--accent-purple);">✏️ Editar</span>
                    ${countsHtml}
                    ${tagsHtml}
                </div>
            </div>`;
        }).join('');

        this.dom.grid.querySelectorAll('.meme-card').forEach(card => {
            card.addEventListener('click', (e) => {
                window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: e.currentTarget.dataset.id } }));
            });
        });
    }

    _setupFilters() {
        this.dom.filters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dom.filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this._renderNodes(e.currentTarget.dataset.filter);
            });
        });
    }

    _setupEvents() {
        this.dom.btnNewNode?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: null } }));
        });

        this.dom.btnOpenResearch?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-research-modal'));
        });

        // Drag & Drop
        const dz = this.dom.dropzone;
        ['dragenter','dragover','dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
        ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, () => dz.classList.add('drag-over')));
        ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('drag-over')));

        dz.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) {
                dz.innerHTML = '⏳ Desempaquetando archivo…';
                window.dispatchEvent(new CustomEvent('process-skill-file', { detail: { file, dropzone: dz } }));
            }
        });
    }
}
