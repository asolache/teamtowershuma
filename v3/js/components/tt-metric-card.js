// tt-metric-card.js - Web Component para métricas (SIN acceso a store)
class TTMetricCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['value', 'label', 'color', 'icon', 'action'];
    }

    connectedCallback() {
        this.render();
        this.setupEvents();
    }

    attributeChangedCallback() {
        this.render();
    }

    setupEvents() {
        this.shadowRoot.querySelector('.card')?.addEventListener('click', () => {
            const action = this.getAttribute('action');
            if (action) {
                // Emitir evento para que el padre maneje la navegación
                this.dispatchEvent(new CustomEvent('metric-click', {
                    bubbles: true,
                    composed: true,
                    detail: { action }
                }));
            }
        });
    }

    render() {
        const value = this.getAttribute('value') || '0';
        const label = this.getAttribute('label') || 'Métrica';
        const color = this.getAttribute('color') || '#2563eb';
        const icon = this.getAttribute('icon') || '';
        const action = this.getAttribute('action');

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 16px;
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                    cursor: ${action ? 'pointer' : 'default'};
                }
                .card:hover {
                    transform: ${action ? 'translateY(-2px)' : 'none'};
                    box-shadow: ${action ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'};
                }
                .value {
                    font-size: 28px;
                    font-weight: bold;
                    color: ${color};
                    margin-bottom: 5px;
                }
                .icon {
                    margin-right: 8px;
                    font-size: 24px;
                }
                .label {
                    font-size: 12px;
                    color: #64748b;
                }
            </style>
            <div class="card">
                <div class="value">
                    ${icon ? `<span class="icon">${icon}</span>` : ''}
                    ${value}
                </div>
                <div class="label">${label}</div>
            </div>
        `;
    }

    // Método para actualizar el valor desde fuera
    setValue(newValue) {
        this.setAttribute('value', newValue);
    }
}

customElements.define('tt-metric-card', TTMetricCard);