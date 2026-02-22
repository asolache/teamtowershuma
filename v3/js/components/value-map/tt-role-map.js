// tt-role-map.js - Vista de mapa por roles (hereda de base)
class TTRoleMap extends TTValueMapBase {
    constructor() {
        super();
    }

    processData() {
        if (!this.data || this.data.length === 0) {
            this.nodes = [];
            this.edges = [];
            return;
        }

        // Agrupar por rol
        const rolesMap = new Map();
        
        this.data.forEach(tx => {
            const role = tx.role || 'desconocido';
            if (!rolesMap.has(role)) {
                rolesMap.set(role, {
                    id: role,
                    label: role,
                    value: 0,
                    sent: 0,
                    received: 0,
                    connections: new Map()
                });
            }
            const roleData = rolesMap.get(role);
            const uv = tx.uv || 0;
            roleData.value += uv;
            roleData.sent += uv;

            // Registrar conexión con otro rol
            const otherRole = tx.targetRole || tx.to || 'desconocido';
            if (otherRole !== role) {
                const connections = roleData.connections;
                connections.set(otherRole, (connections.get(otherRole) || 0) + uv);
            }
        });

        // Posicionar nodos en círculo
        const nodeArray = Array.from(rolesMap.values());
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;

        this.nodes = nodeArray.map((node, i) => {
            const angle = (i / nodeArray.length) * Math.PI * 2;
            return {
                ...node,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                color: this.getRoleColor(node.id)
            };
        });

        // Crear aristas
        this.edges = [];
        this.nodes.forEach(fromNode => {
            fromNode.connections.forEach((value, toId) => {
                const toNode = this.nodes.find(n => n.id === toId);
                if (toNode) {
                    this.edges.push({
                        from: fromNode,
                        to: toNode,
                        value,
                        type: 'tangible' // Se puede determinar por datos reales
                    });
                }
            });
        });
    }

    getRoleColor(roleId) {
        const colors = {
            '@arquitecto': '#8b5cf6',
            '@Mr-Q': '#2563eb',
            '@tester': '#10b981',
            '@masterproject': '#f59e0b',
            '@super-z': '#ec4899'
        };
        return colors[roleId] || '#64748b';
    }
}

customElements.define('tt-role-map', TTRoleMap);