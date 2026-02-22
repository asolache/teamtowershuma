// tt-user-map.js - Vista de mapa por usuarios (hereda de base)
class TTUserMap extends TTValueMapBase {
    constructor() {
        super();
    }

    processData() {
        if (!this.data || this.data.length === 0) {
            this.nodes = [];
            this.edges = [];
            return;
        }

        // Agrupar por usuario
        const usersMap = new Map();
        
        this.data.forEach(tx => {
            const user = tx.user || 'desconocido';
            if (!usersMap.has(user)) {
                usersMap.set(user, {
                    id: user,
                    label: user,
                    value: 0,
                    sent: 0,
                    received: 0,
                    connections: new Map()
                });
            }
            const userData = usersMap.get(user);
            const uv = tx.uv || 0;
            userData.value += uv;
            userData.sent += uv;

            // Registrar conexión con otro usuario
            const otherUser = tx.targetUser || tx.to || 'desconocido';
            if (otherUser !== user) {
                const connections = userData.connections;
                connections.set(otherUser, (connections.get(otherUser) || 0) + uv);
            }
        });

        // Posicionar nodos en círculo
        const nodeArray = Array.from(usersMap.values());
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;

        this.nodes = nodeArray.map((node, i) => {
            const angle = (i / nodeArray.length) * Math.PI * 2;
            return {
                ...node,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                color: this.getUserColor(node.id)
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
                        type: 'tangible'
                    });
                }
            });
        });
    }

    getUserColor(userId) {
        const colors = [
            '#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#dc2626', '#6b7280'
        ];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash |= 0;
        }
        return colors[Math.abs(hash) % colors.length];
    }
}

customElements.define('tt-user-map', TTUserMap);