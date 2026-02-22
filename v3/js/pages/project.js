// /v3/js/components/tt-dynamic-form.js
// Componente para generar formularios dinámicamente a partir de una lista de requisitos

class TTDynamicForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['requisitos', 'data', 'submit-label'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        try {
            const requisitos = JSON.parse(this.getAttribute('requisitos') || '[]');
            const data = JSON.parse(this.getAttribute('data') || '{}');
            const submitLabel = this.getAttribute('submit-label') || 'Enviar';

            let html = `
                <style>
                    :host {
                        display: block;
                    }
                    .form-group {
                        margin-bottom: 1rem;
                    }
                    label {
                        display: block;
                        margin-bottom: 0.25rem;
                        font-weight: 600;
                        color: var(--tt-secondary);
                    }
                    input, textarea, select {
                        width: 100%;
                        padding: 0.5rem;
                        border: 1px solid var(--border-light);
                        border-radius: 4px;
                        font-family: inherit;
                    }
                    .requerido::after {
                        content: " *";
                        color: var(--status-forca);
                    }
                    .help-text {
                        font-size: 0.8rem;
                        color: var(--color-documentacion);
                        margin-top: 0.25rem;
                    }
                    .error {
                        color: var(--status-forca);
                        font-size: 0.8rem;
                        margin-top: 0.25rem;
                    }
                    button {
                        background: var(--tt-accent);
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s;
                    }
                    button:hover {
                        transform: translateY(-2px);
                        box-shadow: var(--shadow-tronc);
                    }
                </style>
                <form id="dynamic-form">
            `;

            requisitos.forEach((req, index) => {
                const valor = data[req.campo] || '';
                const requerido = req.required ? 'required' : '';
                const labelClass = req.required ? 'requerido' : '';

                html += `<div class="form-group">`;
                html += `<label class="${labelClass}">${req.label || req.campo}</label>`;

                switch (req.tipo) {
                    case 'textarea':
                        html += `<textarea name="${req.campo}" ${requerido} rows="3">${valor}</textarea>`;
                        break;
                    case 'select':
                        html += `<select name="${req.campo}" ${requerido}>`;
                        if (req.options && Array.isArray(req.options)) {
                            req.options.forEach(opt => {
                                const selected = opt === valor ? 'selected' : '';
                                html += `<option value="${opt}" ${selected}>${opt}</option>`;
                            });
                        }
                        html += `</select>`;
                        break;
                    case 'lista':
                        // Para lista simple, usamos textarea y luego se procesa como líneas
                        html += `<textarea name="${req.campo}" ${requerido} placeholder="Una línea por elemento">${Array.isArray(valor) ? valor.join('\n') : valor}</textarea>`;
                        break;
                    default: // text, number, etc.
                        html += `<input type="${req.tipo}" name="${req.campo}" value="${valor}" ${requerido}>`;
                }

                if (req.ayuda) {
                    html += `<div class="help-text">${req.ayuda}</div>`;
                }

                html += `</div>`;
            });

            html += `
                <button type="submit">${submitLabel}</button>
                </form>
            `;

            this.shadowRoot.innerHTML = html;

            // Manejador del submit
            this.shadowRoot.querySelector('#dynamic-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    // Para campos de tipo lista, convertir a array
                    const req = requisitos.find(r => r.campo === key);
                    if (req && req.tipo === 'lista') {
                        data[key] = value.split('\n').map(line => line.trim()).filter(line => line);
                    } else {
                        data[key] = value;
                    }
                }
                this.dispatchEvent(new CustomEvent('form-submit', { detail: data, bubbles: true }));
            });

        } catch (error) {
            console.error('Error en TTDynamicForm:', error);
            this.shadowRoot.innerHTML = `<div class="error">Error al cargar formulario</div>`;
        }
    }
}

customElements.define('tt-dynamic-form', TTDynamicForm);
console.log('✅ TTDynamicForm component loaded');
