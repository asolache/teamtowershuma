// tt-map-controls.js - Controles unificados para mapas de valor
class TTMapControls extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mapElement = null;
    }

    static get observedAttributes() {
        return ['map-id', 'views', 'filters'];
    }

    connectedCallback() {
        this.render();
        this.attachEvents();
    }

    attributeChangedCallback() {
        this.render();
        this.attachEvents();
    }

    render() {
        const mapId = this.getAttribute('map-id');
        const views = this.getAttribute('views')?.split(',') || ['roles', 'users'];
        const hasFilters = this.hasAttribute('filters');

        this.shadowRoot.innerHTML = `
            <style>
                .map-controls {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    align-items: center;
                    padding: 15px 20px;
                    background: #f8fafc;
                    border-radius: 50px;
                    margin-bottom: 20px;
                }
                .view-toggle {
                    display: flex;
                    gap: 5px;
                    background: #e2e8f0;
                    padding: 4px;
                    border-radius: 40px;
                }
                .view-option {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    background: transparent;
                    transition: all 0.2s;
                }
                .view-option.active {
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .filter-select {
                    padding: 8px 16px;
                    border: 1px solid #cbd5e1;
                    border-radius: 30px;
                    background: white;
                    font-size: 13px;
                    min-width: 140px;
                }
                .action-btn {
                    padding: 8px 16px;
                    border: 1px solid #cbd5e1;
                    border-radius: 30px;
                    background: white;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    margin-left: auto;
                }
                .action-btn:hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                }
                @media (max-width: 768px) {
                    .map-controls {
                        flex-direction: column;
                        align-items: stretch;
                        border-radius: 16px;
                    }
                    .action-btn {
                        margin-left: 0;
                    }
                }
            </style>
            <div class="map-controls">
                <div class="view-toggle">
                    ${views.map(view => `
                        <button class="view-option ${view === 'roles' ? 'active' : ''}" 
                                data-view="${view}">
                            ${view === 'roles' ? '👥 Roles' : '🧑 Usuarios'}
                        </button>
                    `).join('')}
                </div>

                ${hasFilters ? `
                    <select class="filter-select" id="type-filter">
                        <option value="all">🌐 Todos los tipos</option>
                        <option value="tangible">🔷 Tangibles</option>
                        <option value="intangible">💭 Intangibles</option>
                    </select>

                    <select class="filter-select" id="project-filter">
                        <option value="all">📁 Todos los proyectos</option>
                    </select>
                ` : ''}

                <button class="action-btn" id="center-btn">🔍 Centrar</button>
                <button class="action-btn" id="export-btn">📸 Exportar</button>
            </div>
        `;
    }

    attachEvents() {
        const mapId = this.getAttribute('map-id');
        this.mapElement = document.getElementById(mapId);

        if (!this.mapElement) return;

        // Cambio de vista
        this.shadowRoot.querySelectorAll('.view-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.shadowRoot.querySelectorAll('.view-option').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.dataset.view;
                this.mapElement.setAttribute('view', view);
            });
        });

        // Botón centrar
        this.shadowRoot.getElementById('center-btn')?.addEventListener('click', () => {
            if (this.mapElement.center) {
                this.mapElement.center();
            } else {
                // Simular doble click
                const event = new MouseEvent('dblclick');
                this.mapElement.shadowRoot.querySelector('canvas').dispatchEvent(event);
            }
        });

        // Botón exportar
        this.shadowRoot.getElementById('export-btn')?.addEventListener('click', () => {
            const canvas = this.mapElement.shadowRoot.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = `value-map-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL();
                link.click();
            }
        });

        // Filtros (si existen)
        const typeFilter = this.shadowRoot.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                // Aquí iría la lógica de filtrado
                console.log('Filtrar por tipo:', e.target.value);
            });
        }
    }
}

customElements.define('tt-map-controls', TTMapControls);