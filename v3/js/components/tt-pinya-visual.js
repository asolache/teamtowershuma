// tt-pinya-visual.js
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
        const state = window.store?.getState?.() || { transactions: [] };
        const transactions = state.transactions?.filter(t => t && t.project === projectId) || [];
        
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

        const areasHtml = Object.entries(areas)
            .filter(([_, data]) => data.count > 0)
            .map(([area, data]) => `
                <div class="area-row">
                    <div class="area-info">
                        <span class="area-color" style="background: ${data.color}"></span>
                        <span>${area.replace('#', '')}</span>
                    </div>
                    <div class="area-bar-container">
                        <div class="area-bar" style="width: ${(data.uv / 500) * 100}%; background: ${data.color};"></div>
                    </div>
                    <div class="area-stats">${data.uv} UV (${data.count} tx)</div>
                </div>
            `).join('');

        this.shadowRoot.innerHTML = `
            <style>
                .pinya { padding: 15px; background: #f8fafc; border-radius: 16px; }
                .area-row { display: grid; grid-template-columns: 100px 1fr 100px; gap: 10px; margin: 10px 0; }
                .area-info { display: flex; align-items: center; gap: 5px; }
                .area-color { width: 12px; height: 12px; border-radius: 4px; }
                .area-bar-container { height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
                .area-bar { height: 100%; }
                .area-stats { text-align: right; font-size: 12px; }
            </style>
            <div class="pinya">
                <h4>🪨 Pinya - ${projectId}</h4>
                ${areasHtml || '<p>Sin datos</p>'}
            </div>
        `;
    }
}

customElements.define('tt-pinya-visual', TTPinyaVisual);
