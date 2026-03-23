// v9/js/components/SemanticElement.js

export class SemanticKnowledgeCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['data-title', 'data-category', 'data-content', 'data-jsonld', 'data-id'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const id = this.getAttribute('data-id') || `node_${Date.now()}`;
        const title = this.getAttribute('data-title') || 'Unidad de Conocimiento';
        const category = this.getAttribute('data-category') || 'MEME W3C';
        const content = this.getAttribute('data-content') || '';
        const jsonld = this.getAttribute('data-jsonld') || '{}';

        // Paleta de colores cuántica alineada con el Meta-Grafo 3D
        let catColor = '#888888';
        if (category === 'core_os') catColor = '#ffffff';
        else if (category === 'project_core') catColor = '#00b0ff';
        else if (category === 'evergreen') catColor = '#ffd700';
        else if (category === 'prompt_a2a') catColor = '#e040fb';
        else if (category === 'SOP') catColor = '#ff9100';
        else if (category === 'skill') catColor = '#00e676';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.95));
                    border: 1px solid rgba(255,255,255,0.05);
                    border-left: 3px solid ${catColor};
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.3);
                    backdrop-filter: blur(10px);
                    transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s, border-color 0.2s;
                    font-family: var(--font-main, system-ui, sans-serif);
                }
                :host(:hover) {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    border-color: ${catColor};
                }
                .meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .cat-badge {
                    background: rgba(255,255,255,0.05);
                    color: ${catColor};
                    font-family: var(--font-mono, monospace);
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    padding: 4px 8px;
                    border-radius: 6px;
                    letter-spacing: 1px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                h3 {
                    color: white;
                    margin: 0 0 10px 0;
                    font-size: 1.1rem;
                    font-weight: 900;
                    line-height: 1.3;
                    letter-spacing: -0.5px;
                }
                p {
                    color: #bbb;
                    font-size: 0.85rem;
                    line-height: 1.5;
                    margin: 0;
                    font-family: 'Georgia', serif;
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .actions {
                    margin-top: 15px;
                    padding-top: 12px;
                    border-top: 1px dashed rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                .btn-gtd {
                    background: transparent;
                    border: 1px solid #555;
                    color: #ccc;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-gtd:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border-color: white;
                }
                .btn-gtd.primary {
                    border-color: ${catColor};
                    color: ${catColor};
                    background: rgba(255,255,255,0.02);
                }
                .btn-gtd.primary:hover {
                    background: ${catColor};
                    color: #000;
                }
                .ai-only { display: none; }
            </style>
            
            <div class="meta">
                <span class="cat-badge">${category}</span>
                <span style="font-size:1rem; opacity:0.7;">🧬</span>
            </div>
            <h3>${title}</h3>
            <p>${content}</p>
            
            <div class="actions">
                <button class="btn-gtd" id="btnInspect">🔎 Inspeccionar</button>
                ${category === 'SOP' ? `<button class="btn-gtd primary" id="btnExecute">▶ Ejecutar (GTD)</button>` : ''}
            </div>
            
            <script type="application/ld+json" class="ai-only" id="jsonld-data">
                ${jsonld}
            </script>
        `;

        // Eventos GTD Orientados a la Acción
        const btnInspect = this.shadowRoot.getElementById('btnInspect');
        if (btnInspect) {
            btnInspect.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('semantic-action', {
                    detail: { action: 'inspect', id, category },
                    bubbles: true,
                    composed: true
                }));
            });
        }

        const btnExecute = this.shadowRoot.getElementById('btnExecute');
        if (btnExecute) {
            btnExecute.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('semantic-action', {
                    detail: { action: 'execute', id, category },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }

    // Interfaz pública para que Orchestrator.js lea el DOM
    getSemanticData() {
        try {
            const scriptTag = this.shadowRoot.getElementById('jsonld-data');
            return JSON.parse(scriptTag.textContent);
        } catch(e) {
            console.warn("[Antigravity] Fallo al extraer JSON-LD del SemanticElement", e);
            return null;
        }
    }
}

// Inyección en el registro de Web Components
if (!customElements.get('semantic-knowledge-card')) {
    customElements.define('semantic-knowledge-card', SemanticKnowledgeCard);
}
