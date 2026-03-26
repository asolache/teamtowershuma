// v9/js/components/SkillExplorer.js
import { KB } from '../core/kb.js';

export class SkillExplorer {
    constructor(mountPointId) {
        this.container = document.getElementById(mountPointId);
        this.allNodes = [];
    }

    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="lms-controls-row">
                <div class="filters-bar" id="lmsFilters">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="skill">🎒 Skills</button>
                    <button class="filter-btn" data-filter="reference">📚 References</button>
                    <button class="filter-btn" data-filter="eval">📋 Evals</button>
                    <button class="filter-btn" data-filter="script">⚡ Scripts</button>
                </div>
                
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn-deep-research" id="btnNewNode" style="background:transparent; border-color:var(--accent-green); color:var(--accent-green);">
                        <span style="font-size:1.2rem;">➕</span> Forjar Nodo
                    </button>
                    <button class="btn-deep-research" id="btnOpenResearch">
                        <span style="font-size:1.2rem;">🧠</span> Deep Research (IA)
                    </button>
                </div>
            </div>

            <div class="dropzone-area" id="skillDropzone">
                <span style="font-size:1.5rem;">📥</span>
                <span style="font-weight:bold;">Arrastra aquí un paquete (.skill o .zip) para inyectar su estructura en el Padrón.</span>
            </div>

            <div class="lms-grid" id="lmsGrid">
                <div class="empty-lms">Cargando Memoria Profunda...</div>
            </div>
        `;

        this.dom = {
            grid: this.container.querySelector('#lmsGrid'),
            filters: this.container.querySelector('#lmsFilters'),
            dropzone: this.container.querySelector('#skillDropzone'),
            btnNewNode: this.container.querySelector('#btnNewNode'),
            btnOpenResearch: this.container.querySelector('#btnOpenResearch')
        };

        await this.loadData();
        this.setupFilters();
        this.setupEvents();
    }

    async loadData() {
        try {
            await KB.init();
            this.allNodes = await KB.getAllNodes();
            const activeFilter = this.dom.filters.querySelector('.active')?.dataset.filter || 'all';
            this.renderNodes(activeFilter);
        } catch (error) {
            this.dom.grid.innerHTML = `<div class="empty-lms">⚠️ Error crítico leyendo IndexedDB.</div>`;
        }
    }

    renderNodes(filterCategory) {
        let nodesToRender = this.allNodes;
        if (filterCategory !== 'all') {
            nodesToRender = this.allNodes.filter(n => n.category === filterCategory || n.type === filterCategory);
        }
        nodesToRender.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

        if (nodesToRender.length === 0) {
            this.dom.grid.innerHTML = `<div class="empty-lms"><div style="font-size: 3rem; margin-bottom: 10px;">🕳️</div><h3>Vacío Cognitivo</h3></div>`;
            return;
        }

        this.dom.grid.innerHTML = nodesToRender.map(node => {
            const safeCat = node.type === 'prompt_a2a' ? 'prompt_a2a' : (node.category || 'MEME');
            const tags = (node.keywords && Array.isArray(node.keywords)) ? node.keywords : [];
            let tagsHtml = tags.slice(0, 3).map(t => `<span class="meme-tag">#${t}</span>`).join('');
            const safeId = node.id.replace(/"/g, '&quot;');
            
            const refCount = (node.references && Array.isArray(node.references)) ? node.references.length : 0;
            const evalsCount = (node.evals && Array.isArray(node.evals)) ? node.evals.length : 0;
            const scriptsCount = (node.scripts && Array.isArray(node.scripts)) ? node.scripts.length : 0;

            let countsHtml = '';
            if (refCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-blue);">📚 ${refCount}</span>`;
            if (evalsCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-orange);">📋 ${evalsCount}</span>`;
            if (scriptsCount > 0) countsHtml += `<span class="meme-tag" style="color:var(--accent-green);">⚡ ${scriptsCount}</span>`;

            return `
                <div class="meme-card" data-id="${safeId}">
                    <div class="meme-category ${safeCat}">${safeCat}</div>
                    <h4 class="meme-title">${node.title || 'Sin Título'}</h4>
                    ${node.description ? `<div style="color:var(--accent-blue); font-size:0.75rem; font-weight:bold; margin-bottom:5px;">${node.description}</div>` : ''}
                    <div class="meme-content">${node.content || ''}</div>
                    <div class="meme-footer">
                        <span class="meme-tag" style="color:var(--accent-purple);">✏️ Editar</span>
                        ${countsHtml}
                        ${tagsHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Disparamos un evento global cuando se hace clic en una tarjeta, para que el Orquestador abra el Modal
        this.dom.grid.querySelectorAll('.meme-card').forEach(card => {
            card.addEventListener('click', (e) => {
                window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: e.currentTarget.dataset.id } }));
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

    setupEvents() {
        // Evento para Forjar Nuevo Nodo
        this.dom.btnNewNode.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: null } }));
        });

        // Evento para abrir Deep Research
        this.dom.btnOpenResearch.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('open-research-modal'));
        });

        // Drag & Drop visual
        const dropzone = this.dom.dropzone;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false));
        ['dragenter', 'dragover'].forEach(eventName => dropzone.addEventListener(eventName, () => dropzone.classList.add('drag-over'), false));
        ['dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, () => dropzone.classList.remove('drag-over'), false));

        dropzone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) {
                dropzone.innerHTML = "⏳ Desempaquetando Archivo...";
                // Delegamos la lógica del ZIP al orquestador principal o a un PackageEngine
                window.dispatchEvent(new CustomEvent('process-skill-file', { detail: { file, dropzone } }));
            }
        });
    }
}
