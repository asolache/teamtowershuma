// ============================================
// components/tt-form.js
// Web Component genérico de formulario
// Filosofía: Unidad Epistemológica - Cada formulario es autodescriptivo
// ============================================

class TTForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.fields = [];
        this.data = {};
    }

    static get observedAttributes() {
        return ['fields', 'submit-label'];
    }

    connectedCallback() {
        this.parseFields();
        this.render();
        this.attachEvents();
    }

    attributeChangedCallback() {
        this.parseFields();
        this.render();
        this.attachEvents();
    }

    parseFields() {
        try {
            const fieldsAttr = this.getAttribute('fields');
            if (fieldsAttr) {
                this.fields = JSON.parse(fieldsAttr);
            }
        } catch (e) {
            console.error('TTForm: Error parsing fields', e);
        }
    }

    validateField(field, value) {
        if (field.required && (!value || value.trim() === '')) {
            return `El campo ${field.nombre} es obligatorio`;
        }
        if (field.type === 'text' && field.pattern) {
            const regex = new RegExp(field.pattern);
            if (!regex.test(value)) {
                return field.patternError || `Formato inválido para ${field.nombre}`;
            }
        }
        return null;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Recoger datos
        const formData = new FormData(e.target);
        const data = {};
        const errors = [];

        this.fields.forEach(field => {
            const value = formData.get(field.nombre);
            data[field.nombre] = value;
            
            const error = this.validateField(field, value);
            if (error) errors.push(error);
        });

        // Mostrar errores si hay
        const errorDiv = this.shadowRoot.getElementById('form-errors');
        if (errors.length > 0) {
            errorDiv.innerHTML = errors.map(e => `<div class="error">❌ ${e}</div>`).join('');
            errorDiv.style.display = 'block';
            return;
        } else {
            errorDiv.style.display = 'none';
        }

        // Emitir evento con los datos
        this.dispatchEvent(new CustomEvent('form-submit', {
            detail: data,
            bubbles: true,
            composed: true
        }));
    }

    renderField(field) {
        const fieldId = `field-${field.nombre.toLowerCase().replace(/\s+/g, '-')}`;
        const required = field.required ? 'required' : '';
        
        switch(field.type) {
            case 'textarea':
                return `
                    <div class="field">
                        <label for="${fieldId}">${field.nombre}</label>
                        <textarea 
                            id="${fieldId}" 
                            name="${field.nombre}" 
                            placeholder="${field.placeholder || ''}"
                            ${required}
                        ></textarea>
                        ${field.help ? `<small class="help">${field.help}</small>` : ''}
                    </div>
                `;
                
            case 'select':
                return `
                    <div class="field">
                        <label for="${fieldId}">${field.nombre}</label>
                        <select id="${fieldId}" name="${field.nombre}" ${required}>
                            ${field.options.map(opt => 
                                `<option value="${opt}">${opt}</option>`
                            ).join('')}
                        </select>
                        ${field.help ? `<small class="help">${field.help}</small>` : ''}
                    </div>
                `;
                
            default: // text
                return `
                    <div class="field">
                        <label for="${fieldId}">${field.nombre}</label>
                        <input 
                            type="${field.type || 'text'}" 
                            id="${fieldId}" 
                            name="${field.nombre}" 
                            placeholder="${field.placeholder || ''}"
                            ${required}
                        >
                        ${field.help ? `<small class="help">${field.help}</small>` : ''}
                    </div>
                `;
        }
    }

    render() {
        const submitLabel = this.getAttribute('submit-label') || 'Guardar';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: system-ui, sans-serif;
                }
                .form {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .field {
                    margin-bottom: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #1e293b;
                }
                input, select, textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }
                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                }
                .help {
                    display: block;
                    font-size: 12px;
                    color: #64748b;
                    margin-top: 4px;
                }
                .errors {
                    background: #fee2e2;
                    border-left: 4px solid #dc2626;
                    padding: 12px;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    display: none;
                }
                .error {
                    color: #991b1b;
                    font-size: 13px;
                    margin: 4px 0;
                }
                button {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    transition: background 0.2s;
                }
                button:hover {
                    background: #1d4ed8;
                }
            </style>

            <form class="form" id="ttForm">
                <div id="form-errors" class="errors"></div>
                
                ${this.fields.map(f => this.renderField(f)).join('')}
                
                <button type="submit">${submitLabel}</button>
            </form>
        `;
    }

    attachEvents() {
        const form = this.shadowRoot.getElementById('ttForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
}

customElements.define('tt-form', TTForm);
console.log('✅ TTForm component loaded');
