// v8/js/components/SemanticElement.js

class SemanticKnowledgeCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const title = this.getAttribute('data-title') || 'Documento sin título';
        const role = this.getAttribute('data-role') || 'General';
        const content = this.getAttribute('data-content') || '';
        const jsonld = this.getAttribute('data-jsonld') || '{}';

        // Renderizamos el CSS, el HTML visible y el bloque <script> invisible para IAs
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9));
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.3);
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s, border-color 0.3s;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                :host(:hover) {
                    transform: translateY(-4px);
                    border-color: #00b0ff;
                }
                .meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .role-badge {
                    background: rgba(0, 176, 255, 0.1);
                    color: #00b0ff;
                    font-family: monospace;
                    font-size: 0.75rem;
                    font-weight: bold;
                    padding: 4px 8px;
                    border-radius: 8px;
                    border: 1px solid rgba(0, 176, 255, 0.3);
                }
                h3 {
                    color: white;
                    margin: 0 0 10px 0;
                    font-size: 1.2rem;
                }
                p {
                    color: #aaa;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .ai-only { display: none; }
            </style>
            
            <div class="human-view">
                <div class="meta">
                    <span class="role-badge">Destino: ${role}</span>
                    <span style="font-size:1.2rem;">📖</span>
                </div>
                <h3>${title}</h3>
                <p>${content}</p>
            </div>
            
            <script type="application/ld+json" class="ai-only">
                ${jsonld}
            </script>
        `;
    }
}

// Registramos el Web Component nativo
customElements.define('tt-knowledge-card', SemanticKnowledgeCard);
