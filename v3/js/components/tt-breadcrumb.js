// tt-breadcrumb.js - Web Component para migas de pan (SIN acceso a store)
class TTBreadcrumb extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.items = [];
    }

    static get observedAttributes() {
        return ['items'];
    }

    connectedCallback() {
        this.parseItems();
        this.render();
        this.attachEvents();
    }

    attributeChangedCallback() {
        this.parseItems();
        this.render();
        this.attachEvents();
    }

    parseItems() {
        try {
            if (this.hasAttribute('items')) {
                this.items = JSON.parse(this.getAttribute('items'));
            }
        } catch (e) {
            console.error('Error parsing breadcrumb items', e);
        }
    }

    attachEvents() {
        this.shadowRoot.querySelectorAll('.item').forEach(el => {
            el.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const item = this.items[index];
                
                this.dispatchEvent(new CustomEvent('breadcrumb-click', {
                    bubbles: true,
                    composed: true,
                    detail: item
                }));
            });
        });
    }

    render() {
        if (!this.items.length) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 0;
                    font-size: 14px;
                }
                .item {
                    color: #2563eb;
                    cursor: pointer;
                }
                .item:hover {
                    text-decoration: underline;
                }
                .separator {
                    color: #94a3b8;
                }
                .current {
                    color: #1e293b;
                    font-weight: 500;
                }
            </style>
            <div class="breadcrumb">
                ${this.items.map((item, index) => {
                    const isLast = index === this.items.length - 1;
                    if (!isLast) {
                        return `
                            <span class="item" data-index="${index}">${item.label}</span>
                            <span class="separator">›</span>
                        `;
                    } else {
                        return `<span class="current">${item.label}</span>`;
                    }
                }).join('')}
            </div>
        `;
    }

    // Método público para actualizar
    setItems(newItems) {
        this.setAttribute('items', JSON.stringify(newItems));
    }
}

customElements.define('tt-breadcrumb', TTBreadcrumb);