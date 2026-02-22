// tt-pinya-visual.js - Web Component para visualizar la base del castell por áreas
// TeamTowers Humà v3.4 - CIERRE DE VERSIÓN

class TTPinyaVisual extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.areas = ['#código', '#testing', '#arquitectura', '#economía', '#estrategia', '#ux', '#documentación'];
        this.colors = {
            '#código': '#2563eb',
            '#testing': '#dc2626',
            '#arquitectura': '#8b5cf6',
            '#economía': '#10b981',
            '#estrategia': '#f59e0b',
            '#ux': '#ec4899',
            '#documentación': '#64748b'
        };
    }

    static get observedAttributes() {
        return ['project-id'];
    }

    connectedCallback() {
        this.render();
        this.loadData();
    }

    attributeChangedCallback() {
        this.loadData();
    }

    loadData() {
        const projectId = this.getAttribute('project-id') || '#kernel';
        const state = window.store?.getState?.() || { transactions: [] };
        
        // Filtrar transacciones del proyecto
        const transactions = state.transactions.filter(t => t.project === projectId);
        
        // Extraer áreas de las transacciones (simulado - en realidad vendría de los roles)
        const areaData = {};
        this.areas.forEach(area => areaData[area] = { uv: 0, count: 0 });
        
        transactions.forEach(t => {
            // Asignar área basada en el rol (simplificado para demo)
            let area = '#código';
            if (t.role?.includes('tester') || t.role?.includes('quart')) area = '#testing';
            else if (t.role?.includes('arquitecto') || t.role?.includes('acotxador')) area = '#arquitectura';
            else if (t.role?.includes('economista')) area = '#economía';
            else if (t.role?.includes('master')) area = '#estrategia';
            
            if (areaData[area]) {
                areaData[area].uv += t.uv || 0;
                areaData[area].count++;
            }
        });

        this.renderChart(areaData, transactions.length);
    }

    renderChart(areaData, totalTx) {
        const maxUV = Math.max(...Object.values(areaData).map(d => d.uv));
        
        let areasHtml = '';
        for (const [area, data] of Object.entries(areaData)) {
            const percentage = maxUV > 0 ? (data.uv / maxUV) * 100 : 0;
            const areaName = area.replace('#', '');
            
            areasHtml += `
                <div class="area-row">
                    <div class="area-info">
                        <span class="area-color" style="background: ${this.colors[area]}"></span>
                        <span class="area-name">${areaName}</span>
                    </div>
                    <div class="area-bar-container">
                        <div class="area-bar" style="width: ${percentage}%; background: ${this.colors[area]};"></div>
                    </div>
                    <div class="area-stats">
                        <span class="area-uv">${data.uv} UV</span>
                        <span class="area-count">(${data.count} tx)</span>
                    </div>
                </div>
            `;
        }

        this.shadowRoot.innerHTML = `
            <style>
                .pinya-container {
                    background: #f8fafc;
                    border-radius: 24px;
                    padding: 25px;
                    margin: 20px 0;
                }
                .pinya-title {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .pinya-subtitle {
                    font-size: 0.9em;
                    color: #64748b;
                    margin-bottom: 20px;
                }
                .area-row {
                    display: grid;
                    grid-template-columns: 120px 1fr 120px;
                    gap: 15px;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .area-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .area-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }
                .area-name {
                    font-weight: 500;
                    text-transform: capitalize;
                }
                .area-bar-container {
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .area-bar {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                .area-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                }
                .area-uv {
                    font-weight: bold;
                    color: #2563eb;
                }
                .area-count {
                    color: #64748b;
                }
                .total-info {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid #e2e8f0;
                    text-align: right;
                    font-size: 14px;
                    color: #1e293b;
                }
                .bottleneck {
                    margin-top: 20px;
                    padding: 15px;
                    background: #fee2e2;
                    border-left: 4px solid #dc2626;
                    border-radius: 8px;
                }
                .bottleneck-title {
                    font-weight: bold;
                    color: #991b1b;
                    margin-bottom: 5px;
                }
                .bottleneck-desc {
                    color: #b91c1c;
                    font-size: 14px;
                }
                @media (max-width: 768px) {
                    .area-row {
                        grid-template-columns: 100px 1fr 80px;
                        gap: 8px;
                    }
                    .area-stats {
                        flex-direction: column;
                        align-items: flex-end;
                    }
                }
            </style>
            <div class="pinya-container">
                <div class="pinya-title">
                    <span>🪨 Pinya del Castell</span>
                    <span style="font-size: 0.8em; background: #e2e8f0; padding: 4px 12px; border-radius: 30px;">Base estructural</span>
                </div>
                <div class="pinya-subtitle">
                    Distribución de carga por área funcional
                </div>
                ${areasHtml}
                <div class="total-info">
                    Total: ${totalTx} transacciones | ${Object.values(areaData).reduce((s, d) => s + d.uv, 0)} UV
                </div>
                ${this.detectBottleneck(areaData)}
            </div>
        `;
    }

    detectBottleneck(areaData) {
        const maxArea = Object.entries(areaData).reduce((max, [area, data]) => 
            data.uv > (max?.data?.uv || 0) ? { area, data } : max, null);
        
        if (maxArea && maxArea.data.uv > 1000) {
            const areaName = maxArea.area.replace('#', '');
            return `
                <div class="bottleneck">
                    <div class="bottleneck-title">⚠️ Cuello de botella detectado</div>
                    <div class="bottleneck-desc">
                        El área <strong>${areaName}</strong> concentra ${maxArea.data.uv} UV (${Math.round(maxArea.data.uv / Object.values(areaData).reduce((s, d) => s + d.uv, 0) * 100)}% del valor). 
                        Considera distribuir carga.
                    </div>
                </div>
            `;
        }
        return '';
    }
}

customElements.define('tt-pinya-visual', TTPinyaVisual);
console.log('✅ Componente Pinya Visual cargado');
