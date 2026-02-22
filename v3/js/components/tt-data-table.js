// tt-data-table.js - Web Component para tablas (SIN acceso a store)
class TTDataTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = [];
        this.columns = [];
        this.currentPage = 1;
        this.pageSize = 10;
    }

    static get observedAttributes() {
        return ['data', 'columns', 'page-size'];
    }

    connectedCallback() {
        this.parseAttributes();
        this.render();
        this.setupEvents();
    }

    attributeChangedCallback() {
        this.parseAttributes();
        this.render();
        this.setupEvents();
    }

    parseAttributes() {
        try {
            if (this.hasAttribute('data')) {
                this.data = JSON.parse(this.getAttribute('data'));
            }
            if (this.hasAttribute('columns')) {
                this.columns = JSON.parse(this.getAttribute('columns'));
            }
            if (this.hasAttribute('page-size')) {
                this.pageSize = parseInt(this.getAttribute('page-size'));
            }
        } catch (e) {
            console.error('Error parsing data-table attributes', e);
        }
    }

    setupEvents() {
        // Eventos de paginación
        this.shadowRoot.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.renderRows();
                }
            });
        });

        // Eventos de filas
        this.shadowRoot.querySelectorAll('.data-row').forEach(row => {
            row.addEventListener('click', () => {
                const rowData = JSON.parse(row.dataset.row);
                this.dispatchEvent(new CustomEvent('row-click', {
                    bubbles: true,
                    composed: true,
                    detail: rowData
                }));
            });
        });
    }

    render() {
        const totalPages = Math.ceil(this.data.length / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pageData = this.data.slice(startIndex, startIndex + this.pageSize);

        this.shadowRoot.innerHTML = `
            <style>
                .table-container {
                    overflow-x: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                }
                th {
                    background: #f1f5f9;
                    padding: 12px 15px;
                    text-align: left;
                    font-weight: 600;
                    color: #1e293b;
                }
                td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .data-row {
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .data-row:hover td {
                    background: #f8fafc;
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 15px;
                }
                .page-btn {
                    padding: 6px 12px;
                    border: 1px solid #cbd5e1;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .page-btn.active {
                    background: #2563eb;
                    color: white;
                    border-color: #2563eb;
                }
                .page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${this.columns.map(col => `<th>${col.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderRows(pageData)}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(totalPages)}
        `;
    }

    renderRows(pageData) {
        return pageData.map(row => `
            <tr class="data-row" data-row='${JSON.stringify(row).replace(/'/g, "&apos;")}'>
                ${this.columns.map(col => `<td>${this.formatValue(row[col.key], col)}</td>`).join('')}
            </tr>
        `).join('');
    }

    renderPagination(totalPages) {
        if (totalPages <= 1) return '';

        let pagination = '<div class="pagination">';
        
        // Botón anterior
        pagination += `<button class="page-btn" data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>‹</button>`;
        
        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            pagination += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        // Botón siguiente
        pagination += `<button class="page-btn" data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>›</button>`;
        
        pagination += '</div>';
        return pagination;
    }

    formatValue(value, column) {
        if (value === null || value === undefined) return '-';
        if (column.type === 'date') {
            return new Date(value).toLocaleDateString();
        }
        if (column.type === 'number') {
            return value.toLocaleString();
        }
        return value.toString();
    }

    // Métodos públicos para actualizar desde fuera
    setData(newData) {
        this.setAttribute('data', JSON.stringify(newData));
    }

    setColumns(newColumns) {
        this.setAttribute('columns', JSON.stringify(newColumns));
    }
}

customElements.define('tt-data-table', TTDataTable);