// tt-network-map.js - Vista de red personal para usuarios (hereda de base)
class TTNetworkMap extends TTValueMapBase {
    constructor() {
        super();
        this.centerUser = null;
    }

    static get observedAttributes() {
        return ['data', 'center-user', 'view', 'width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === 'center-user' && oldValue !== newValue) {
            this.centerUser = newValue;
            this.processData();
            this.draw();
        }
    }

    setCenterUser(userId) {
        this.setAttribute('center-user', userId);
    }

    processData() {
        if (!this.data || !this.centerUser) {
            this.nodes = [];
            this.edges = [];
            return;
        }

        // Encontrar transacciones del usuario central
        const userTransactions = this.data.filter(tx => 
            tx.user === this.centerUser || tx.targetUser === this.centerUser
        );

        // Mapa de usuarios conectados
        const connectedUsers = new Map();
        
        // Añadir usuario central
        connectedUsers.set(this.centerUser, {
            id: this.centerUser,
            label: this.centerUser,
            value: 0,
            sent: 0,
            received: 0,
            connections: new Map()
        });

        userTransactions.forEach(tx => {
            const otherUser = tx.user === this.centerUser ? tx.targetUser : tx.user;
            if (!otherUser) return;
            
            const uv = tx.uv || 0;

            // Actualizar valor del central
            const centerData = connectedUsers.get(this.centerUser);
            centerData.value += uv;
            if (tx.user === this.centerUser) {
                centerData.sent += uv;
            } else {
                centerData.received += uv;
            }

            // Añadir usuario conectado si no existe
            if (!connectedUsers.has(otherUser)) {
                connectedUsers.set(otherUser, {
                    id: otherUser,
                    label: otherUser,
                    value: 0,
                    sent: 0,
                    received: 0,
                    connections: new Map()
                });
            }

            // Actualizar valor del otro usuario
            const otherData = connectedUsers.get(otherUser);
            otherData.value += uv;
            if (tx.user === otherUser) {
                otherData.sent += uv;
            } else {
                otherData.received += uv;
            }

            // Registrar conexión
            const connections = centerData.connections;
            connections.set(otherUser, (connections.get(otherUser) || 0) + uv);
        });

        // Posicionar nodos: central en el centro, otros alrededor
        const centerX = 0;
        const centerY = 0;
        const radius = 120;

        this.nodes = [];
        const nodeArray = Array.from(connectedUsers.values());
        let otherIndex = 0;

        nodeArray.forEach(node => {
            if (node.id === this.centerUser) {
                // Nodo central
                this.nodes.push({
                    ...node,
                    x: centerX,
                    y: centerY,
                    color: '#f59e0b' // Color destacado
                });
            } else {
                // Nodos periféricos
                const angle = (otherIndex / (nodeArray.length - 1)) * Math.PI * 2;
                this.nodes.push({
                    ...node,
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    color: this.getUserColor(node.id)
                });
                otherIndex++;
            }
        });

        // Crear aristas (solo desde/hacia el centro)
        this.edges = [];
        const centerNode = this.nodes.find(n => n.id === this.centerUser);
        
        centerNode.connections.forEach((value, toId) => {
            const toNode = this.nodes.find(n => n.id === toId);
            if (toNode) {
                this.edges.push({
                    from: centerNode,
                    to: toNode,
                    value,
                    type: 'tangible'
                });
            }
        });
    }

    getUserColor(userId) {
        const colors = [
            '#2563eb', '#8b5cf6', '#10b981', '#ec4899', '#dc2626'
        ];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash |= 0;
        }
        return colors[Math.abs(hash) % colors.length];
    }
}

customElements.define('tt-network-map', TTNetworkMap);