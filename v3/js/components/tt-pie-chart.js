// tt-pie-chart.js - Web Component para gráficos (SIN acceso a store)
class TTPieChart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.data = [];
    }

    static get observedAttributes() {
        return ['data', 'width', 'height'];
    }

    connectedCallback() {
        this.parseData();
        this.render();
    }

    attributeChangedCallback() {
        this.parseData();
        this.render();
    }

    parseData() {
        try {
            if (this.hasAttribute('data')) {
                this.data = JSON.parse(this.getAttribute('data'));
            }
        } catch (e) {
            console.error('Error parsing chart data', e);
        }
    }

    render() {
        const width = parseInt(this.getAttribute('width')) || 300;
        const height = parseInt(this.getAttribute('height')) || 300;

        if (!this.data.length) {
            this.shadowRoot.innerHTML = '<div>No hay datos</div>';
            return;
        }

        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        
        this.shadowRoot.innerHTML = `
            <style>
                .chart-container {
                    position: relative;
                    width: ${width}px;
                    height: ${height}px;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                }
                .legend {
                    margin-top: 15px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .legend-item:hover {
                    background: #f1f5f9;
                }
                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 4px;
                }
            </style>
            <div class="chart-container">
                <canvas id="pie-canvas" width="${width}" height="${height}"></canvas>
            </div>
            <div class="legend">
                ${this.data.map((item, index) => `
                    <div class="legend-item" data-index="${index}">
                        <span class="legend-color" style="background: ${item.color}"></span>
                        <span>${item.label}: ${Math.round(item.value / total * 100)}%</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.drawChart();
        this.attachEvents();
    }

    drawChart() {
        const canvas = this.shadowRoot.getElementById('pie-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;

        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        let startAngle = 0;

        this.data.forEach(item => {
            const angle = (item.value / total) * Math.PI * 2;

            ctx.beginPath();
            ctx.fillStyle = item.color;
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.lineTo(centerX, centerY);
            ctx.stroke();

            startAngle += angle;
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    attachEvents() {
        this.shadowRoot.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const dataItem = this.data[index];
                
                this.dispatchEvent(new CustomEvent('slice-click', {
                    bubbles: true,
                    composed: true,
                    detail: dataItem
                }));
            });
        });
    }

    // Método público para actualizar datos
    setData(newData) {
        this.setAttribute('data', JSON.stringify(newData));
    }
}

customElements.define('tt-pie-chart', TTPieChart);