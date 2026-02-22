// tt-filter-bar.js - Web Component para filtros (SIN acceso a store)
class TTFilterBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.filters = [];
        this.values = {};
    }

    static get observedAttributes() {
        return ['filters'];
    }

    connectedCallback() {
        this.parseFilters();
        this.render();
        this.attachEvents();
    }

    attributeChangedCallback() {
        this.parseFilters();
        this.render();
        this.attachEvents();
    }

    parseFilters() {
        try {
            if (this.hasAttribute('filters')) {
                this.filters = JSON.parse(this.getAttribute('filters'));
            }
        } catch (e) {
            console.error('Error parsing filters', e);
        }
    }

    attachEvents() {
        // Eventos para selects y inputs
        this.shadowRoot.querySelectorAll('select, input').forEach(el => {
            el.addEventListener('change', (e) => {
                const key = e.target.dataset.key;
                this.values[key] = e.target.value;
                
                // Emitir evento con los filtros actuales
                this.dispatchEvent(new CustomEvent('filter-change', {
                    bubbles: true,
                    composed: true,
                    detail: { ...this.values }
                }));
            });

            if (el.type === 'search') {
                el.addEventListener('input', this.debounce((e) => {
                    const key = e.target.dataset.key;
                    this.values[key] = e.target.value;
                    
                    this.dispatchEvent(new CustomEvent('filter-change', {
                        bubbles: true,
                        composed: true,
                        detail: { ...this.values }
                    }));
                }, 300));
            }
        });

        // Botón limpiar
        this.shadowRoot.querySelector('.filter-clear')?.addEventListener('click', () => {
            this.values = {};
            this.render();
            
            this.dispatchEvent(new CustomEvent('filter-clear', {
                bubbles: true,
                composed: true
            }));
        });
    }

    render() {
        let html = `
            <style>
                .filter-bar {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    align-items: flex-end;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 16px;
                    margin-bottom: 20px;
                }
                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    min-width: 150px;
                }
                .filter-group label {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 500;
                }
                .filter-select, .filter-input {
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    font-size: 13px;
                }
                .filter-select:focus, .filter-input:focus {
                    outline: none;
                    border-color: #2563eb;
                }
                .filter-clear {
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #dc2626;
                    color: #dc2626;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    margin-left: auto;
                }
                .filter-clear:hover {
                    background: #dc2626;
                    color: white;
                }
                @media (max-width: 768px) {
                    .filter-bar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .filter-clear {
                        margin-left: 0;
                    }
                }
            </style>
            <div class="filter-bar">
        `;

        this.filters.forEach(filter => {
            const currentValue = this.values[filter.key] || '';
            
            switch(filter.type) {
                case 'select':
                    html += `
                        <div class="filter-group">
                            <label>${filter.label}</label>
                            <select class="filter-select" data-key="${filter.key}">
                                <option value="all">Todos</option>
                                ${filter.options.map(opt => 
                                    `<option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>${opt.label}</option>`
                                ).join('')}
                            </select>
                        </div>
                    `;
                    break;
                    
                case 'search':
                    html += `
                        <div class="filter-group">
                            <label>${filter.label}</label>
                            <input type="search" class="filter-input" data-key="${filter.key}" 
                                   placeholder="${filter.placeholder || 'Buscar...'}" 
                                   value="${currentValue}">
                        </div>
                    `;
                    break;
                    
                case 'date':
                    html += `
                        <div class="filter-group">
                            <label>${filter.label}</label>
                            <input type="date" class="filter-input" data-key="${filter.key}" 
                                   value="${currentValue}">
                        </div>
                    `;
                    break;
            }
        });

        html += `
                <button class="filter-clear">Limpiar</button>
            </div>
        `;

        this.shadowRoot.innerHTML = html;
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Métodos públicos
    setValues(newValues) {
        this.values = { ...this.values, ...newValues };
        this.render();
    }

    getValues() {
        return { ...this.values };
    }

    reset() {
        this.values = {};
        this.render();
    }
}

customElements.define('tt-filter-bar', TTFilterBar);