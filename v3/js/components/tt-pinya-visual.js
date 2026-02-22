// tt-pinya-visual.js - CORREGIDO
class TTPinyaVisual extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['project-id'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const projectId = this.getAttribute('project-id') || '#kernel';
        
        // Obtener datos con fallback seguro
        const state = window.store?.getState?.() || { transactions: [] };
        const transactions = state.transactions?.filter(t => t && t.project === projectId) || [];
        
        // Agrupar por área (simulado basado en rol)
        const areas = {
            '#código': { uv: 0, count: 0, color: '#2563eb' },
            '#testing': { uv: 0, count: 0, color: '#dc2626' },
            '#arquitectura': { uv: 0, count: 0, color: '#8b5cf6' },
            '#economía': { uv: 0, count: 0, color: '#10b981' },
            '#estrategia': { uv: 0, count: 0, color: '#f59e0b' }
        };

        transactions.forEach(t => {
            let area = '#código';
            if (t.role?.includes('tester') || t.role?.includes('quart')) area = '#testing';
            else if (t.role?.includes('arquitecto') || t.role?.includes('acotxador')) area = '#arquitectura';
            else if (t.role?.includes('economista')) area = '#economía';
            else if (t.role?.includes('master') || t.role?.includes('enxaneta')) area = '#estrategia';
            
            if (areas[area]) {
                areas[area].uv += t.uv || 0;
                areas[area].count++;
            }
        });

        const maxUV = Math.max(...Object.values(areas).map(a => a.uv));

        const areasHtml = Object.entries(areas)
            .filter(([_, data]) => data.count > 0)
            .map(([area, data]) => {
                const percentage = maxUV > 0 ? (data.uv / maxUV) * 100 : 0;
                return `
                    <div class="area-row">
                        <div class="area-info">
                            <span class="area-color" style="background: ${data.color}"></span>
                            <span class="area-name">${area.replace('#', '')}</span>
                        </div>
                        <div class="area-bar-container">
                            <div class="area-bar" style="width: ${percentage}%; background: ${data.color};"></div>
                        </div>
                        <div class="area-stats">
                            <span class="area-uv">${data.uv} UV</span>
                            <span class="area-count">(${data.count} tx)</span>
                        </div>
                    </div>
                `;
            }).join('');

        this.shadowRoot.innerHTML = `
            <style>
                .pinya-container {
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .pinya-title {
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .area-row {
                    display: grid;
                    grid-template-columns: 100px 1fr 120px;
                    gap: 10px;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .area-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .area-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                }
                .area-bar-container {
                    height: 20px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .area-bar {
                    height: 100%;
                }
                .area-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                }
                .area-uv {
                    font-weight: bold;
                    color: #2563eb;
                }
                .area-count {
                    color: #64748b;
                }
            </style>
            <div class="pinya-container">
                <div class="pinya-title">🪨 Pinya del Castell - ${projectId}</div>
                ${areasHtml || '<p style="color: #64748b;">No hay datos para este proyecto</p>'}
            </div>
        `;
    }
}

customElements.define('tt-pinya-visual', TTPinyaVisual);
