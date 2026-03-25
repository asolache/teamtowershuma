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
        return [
            'data-title', 'data-category', 'data-content', 
            'data-jsonld', 'data-id', 
            'data-refs', 'data-evals', 'data-scripts' // 🔥 Nuevos sensores AgentSkills
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const id = this.getAttribute('data-id') || `node_${Date.now()}`;
        const title = this.getAttribute('data-title') || 'Unidad de Conocimiento';
        const category = this.getAttribute('data-category') || 'MEME';
        const content = this.getAttribute('data-content') || '';
        const jsonld = this.getAttribute('data-jsonld') || '{}';

        // Captura de métricas AgentSkills
        const refsCount = parseInt(this.getAttribute('data-refs') || '0', 10);
        const evalsCount = parseInt(this.getAttribute('data-evals') || '0', 10);
        const scriptsCount = parseInt(this.getAttribute('data-scripts') || '0', 10);

        // Paleta de colores cuántica anclada al CSS Global V9
        let catColor = 'var(--glass-border)';
        let shadowColor = 'rgba(255,255,255,0.1)';
        let mainAction = '🔎 Inspeccionar';
        
        if (category === 'skill') { catColor = 'var(--accent-green)'; shadowColor = 'rgba(0,230,118,0.3)'; mainAction = '⚙️ Forjar Skill'; }
        else if (category === 'reference') { catColor = 'var(--accent-blue)'; shadowColor = 'rgba(0,176,255,0.3)'; mainAction = '📖 Leer W3C'; }
        else if (category === 'eval') { catColor = 'var(--accent-orange)'; shadowColor = 'rgba(255,171,64,0.3)'; mainAction = '⚖️ Auditar SOC'; }
        else if (category === 'script') { catColor = 'var(--accent-red)'; shadowColor = 'rgba(255,82,82,0.3)'; mainAction = '⚡ Ejecutar'; }
        else if (category === 'prompt_a2a') { catColor = 'var(--accent-purple)'; shadowColor = 'rgba(224,64,251,0.3)'; mainAction = '🧠 Ver Cerebro'; }
        else if (category === 'SOP') { catColor = '#ff9100'; shadowColor = 'rgba(255,145,0,0.3)'; mainAction = '▶ Ejecutar SOP'; }

        // Renderizado condicional de Badges AgentSkills
        let metricsHtml = '';
        if (refsCount > 0) metricsHtml += `<span class="badge ref" title="${refsCount} Referencias">📚 ${refsCount}</span>`;
        if (evalsCount > 0) metricsHtml += `<span class="badge eval" title="${evalsCount} Evals (SOCs)">📋 ${evalsCount}</span>`;
        if (scriptsCount > 0) metricsHtml += `<span class="badge script" title="${scriptsCount} Scripts Ejecutables">⚡ ${scriptsCount}</span>`;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.95));
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5);
                    backdrop-filter: blur(15px);
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                    font-family: var(--font-main, system-ui, sans-serif);
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                    height: 100%;
                }
                
                /* Borde luminoso superior (Estilo V9) */
                :host::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
                    background: ${catColor};
                    box-shadow: 0 0 15px ${shadowColor};
                    transition: 0.3s;
                }

                :host(:hover) {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.7), inset 0 0 20px ${shadowColor};
                    border-color: ${catColor};
                }

                .meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                
                .cat-badge {
                    background: rgba(255,255,255,0.03);
                    color: ${catColor};
                    font-family: var(--font-mono, monospace);
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 6px;
                    letter-spacing: 1px;
                    border: 1px solid ${catColor};
                    opacity: 0.8;
                }

                h3 {
                    color: white; margin: 0 0 10px 0; font-size: 1.15rem;
                    font-weight: 900; line-height: 1.3; letter-spacing: -0.5px;
                }
                
                p {
                    color: #aaa; font-size: 0.9rem; line-height: 1.6; margin: 0;
                    font-family: 'Georgia', serif; flex-grow: 1;
                    display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
                }

                .footer-area {
                    margin-top: 15px; padding-top: 15px;
                    border-top: 1px dashed rgba(255,255,255,0.1);
                    display: flex; flex-direction: column; gap: 12px;
                }

                .metrics-row { display: flex; gap: 8px; flex-wrap: wrap; }
                
                .badge {
                    font-family: var(--font-mono, monospace); font-size: 0.7rem; font-weight: bold;
                    padding: 3px 8px; border-radius: 6px; display: inline-block;
                }
                .badge.ref { color: var(--accent-blue); background: rgba(0,176,255,0.1); border: 1px solid rgba(0,176,255,0.3); }
                .badge.eval { color: var(--accent-orange); background: rgba(255,171,64,0.1); border: 1px solid rgba(255,171,64,0.3); }
                .badge.script { color: var(--accent-green); background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.3); }

                .actions { display: flex; justify-content: space-between; align-items: center; width: 100%;}
                
                .btn-gtd {
                    background: transparent; border: 1px solid #444; color: #ccc;
                    padding: 8px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: bold;
                    cursor: pointer; transition: 0.2s; text-transform: uppercase; letter-spacing: 0.5px;
                    width: 100%; text-align: center;
                }
                .btn-gtd:hover { background: rgba(255,255,255,0.05); color: white; border-color: white; }
                
                .btn-gtd.primary { border-color: ${catColor}; color: ${catColor}; background: rgba(0,0,0,0.3); }
                .btn-gtd.primary:hover { background: ${catColor}; color: #000; box-shadow: 0 0 15px ${shadowColor};}

                .ai-only { display: none; }
            </style>
            
            <div class="meta">
                <span class="cat-badge">${category}</span>
            </div>
            
            <h3>${title}</h3>
            <p>${content}</p>
            
            <div class="footer-area">
                ${metricsHtml ? `<div class="metrics-row">${metricsHtml}</div>` : ''}
                <div class="actions">
                    <button class="btn-gtd primary" id="btnInspect">${mainAction}</button>
                </div>
            </div>
            
            <script type="application/ld+json" class="ai-only" id="jsonld-data">
                ${jsonld}
            </script>
        `;

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
    }

    getSemanticData() {
        try {
            const scriptTag = this.shadowRoot.getElementById('jsonld-data');
            return JSON.parse(scriptTag.textContent);
        } catch(e) {
            console.warn("⚠️ [Antigravity] Fallo al extraer JSON-LD Semántico", e);
            return null;
        }
    }
}

if (!customElements.get('semantic-knowledge-card')) {
    customElements.define('semantic-knowledge-card', SemanticKnowledgeCard);
}
