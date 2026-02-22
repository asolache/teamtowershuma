// tt-value-map-base.js - Clase base para todos los mapas de valor
class TTValueMapBase extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.edges = [];
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.hoveredNode = null;
        this.data = [];
    }

    static get observedAttributes() {
        return ['data', 'view', 'width', 'height'];
    }

    connectedCallback() {
        this.render();
        this.initCanvas();
        this.parseData();
        this.setupEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data' && oldValue !== newValue) {
            this.parseData();
            this.processData();
            this.draw();
        }
        if (name === 'view' && oldValue !== newValue) {
            this.processData();
            this.draw();
        }
    }

    render() {
        const width = this.getAttribute('width') || '100%';
        const height = this.getAttribute('height') || '500px';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: ${width};
                    height: ${height};
                    position: relative;
                    background: #f8fafc;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 2px solid #e2e8f0;
                }
                canvas {
                    width: 100%;
                    height: 100%;
                    display: block;
                    cursor: grab;
                }
                canvas:active {
                    cursor: grabbing;
                }
                .node-tooltip {
                    position: absolute;
                    background: #1e293b;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 1000;
                    display: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }
            </style>
            <canvas id="map-canvas"></canvas>
            <div id="tooltip" class="node-tooltip"></div>
        `;
    }

    initCanvas() {
        this.canvas = this.shadowRoot.getElementById('map-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = this.shadowRoot.getElementById('tooltip');
        this.resize();
        
        // Observar cambios de tamaño
        const resizeObserver = new ResizeObserver(() => this.resize());
        resizeObserver.observe(this.canvas);
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        this.processData();
        this.draw();
    }

    setupEvents() {
        // Zoom con rueda
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.scale *= delta;
            this.scale = Math.min(Math.max(0.5, this.scale), 3);
            this.draw();
        });

        // Pan con arrastre
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.offsetX;
            this.lastY = e.offsetY;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.offsetX - this.lastX;
                const dy = e.offsetY - this.lastY;
                this.offsetX += dx;
                this.offsetY += dy;
                this.lastX = e.offsetX;
                this.lastY = e.offsetY;
                this.draw();
            } else {
                this.checkHover(e.offsetX, e.offsetY);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.hoveredNode = null;
            this.tooltip.style.display = 'none';
            this.draw();
        });

        // Doble click para centrar
        this.canvas.addEventListener('dblclick', () => {
            this.offsetX = this.canvas.width / 2;
            this.offsetY = this.canvas.height / 2;
            this.scale = 1;
            this.draw();
        });

        // Click en nodo
        this.canvas.addEventListener('click', (e) => {
            if (this.isDragging) return;
            const node = this.getNodeAt(e.offsetX, e.offsetY);
            if (node) {
                this.dispatchEvent(new CustomEvent('node-click', { 
                    detail: { id: node.id, type: node.type } 
                }));
            }
        });
    }

    parseData() {
        try {
            if (this.hasAttribute('data')) {
                this.data = JSON.parse(this.getAttribute('data'));
            }
        } catch (e) {
            console.error('Error parsing map data', e);
            this.data = [];
        }
    }

    processData() {
        // Método a sobrescribir por las clases hijas
        this.nodes = [];
        this.edges = [];
    }

    draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);

        // Dibujar aristas
        this.edges.forEach(edge => this.drawEdge(edge));

        // Dibujar nodos
        this.nodes.forEach(node => this.drawNode(node));

        this.ctx.restore();
    }

    drawNode(node) {
        const radius = 20 + (node.value / 1000) * 10;
        
        // Sombra
        this.ctx.shadowColor = 'rgba(0,0,0,0.2)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 2;

        // Círculo principal
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = node.color || '#2563eb';
        this.ctx.fill();

        // Borde
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Efecto hover
        if (this.hoveredNode === node.id) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = node.color;
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }

        this.ctx.shadowBlur = 0;

        // Etiqueta
        this.ctx.font = 'bold 10px system-ui';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.label.substring(0, 10), node.x, node.y);

        // Valor
        this.ctx.font = '8px system-ui';
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillText(`${node.value} UV`, node.x, node.y + radius + 12);
    }

    drawEdge(edge) {
        this.ctx.beginPath();
        this.ctx.moveTo(edge.from.x, edge.from.y);
        this.ctx.lineTo(edge.to.x, edge.to.y);

        // Estilo según tipo
        if (edge.type === 'tangible') {
            this.ctx.strokeStyle = '#2563eb';
            this.ctx.setLineDash([]);
        } else {
            this.ctx.strokeStyle = '#f59e0b';
            this.ctx.setLineDash([5, 3]);
        }

        this.ctx.lineWidth = 1 + (edge.value / 500);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Flecha
        const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
        const arrowX = edge.to.x - Math.cos(angle) * 25;
        const arrowY = edge.to.y - Math.sin(angle) * 25;

        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX - 8 * Math.cos(angle - 0.3), arrowY - 8 * Math.sin(angle - 0.3));
        this.ctx.lineTo(arrowX - 8 * Math.cos(angle + 0.3), arrowY - 8 * Math.sin(angle + 0.3));
        this.ctx.closePath();
        this.ctx.fillStyle = edge.type === 'tangible' ? '#2563eb' : '#f59e0b';
        this.ctx.fill();
    }

    checkHover(mouseX, mouseY) {
        const x = (mouseX - this.offsetX) / this.scale;
        const y = (mouseY - this.offsetY) / this.scale;

        let hovered = null;
        for (const node of this.nodes) {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            const radius = 20 + (node.value / 1000) * 10;
            if (dist < radius) {
                hovered = node.id;
                this.showTooltip(node, mouseX, mouseY);
                break;
            }
        }

        if (hovered !== this.hoveredNode) {
            this.hoveredNode = hovered;
            this.draw();
            if (!hovered) {
                this.tooltip.style.display = 'none';
            }
        }
    }

    getNodeAt(mouseX, mouseY) {
        const x = (mouseX - this.offsetX) / this.scale;
        const y = (mouseY - this.offsetY) / this.scale;

        for (const node of this.nodes) {
            const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            const radius = 20 + (node.value / 1000) * 10;
            if (dist < radius) {
                return node;
            }
        }
        return null;
    }

    showTooltip(node, x, y) {
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (x + 20) + 'px';
        this.tooltip.style.top = (y - 20) + 'px';
        this.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${node.label}</div>
            <div>📤 Enviado: ${node.sent || 0} UV</div>
            <div>📥 Recibido: ${node.received || 0} UV</div>
            <div>🔄 Total: ${node.value} UV</div>
        `;
    }

    setView(view) {
        this.setAttribute('view', view);
    }

    updateData(newData) {
        this.setAttribute('data', JSON.stringify(newData));
    }
}

customElements.define('tt-value-map-base', TTValueMapBase);