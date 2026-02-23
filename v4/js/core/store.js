/**
 * TEAMTOWERS SOS (Sistema Operativo Social) v4.0
 * KERNEL: Store Centralizado con Ontología FEVS
 */

class TTStore {
    constructor() {
        this.state = {
            projects: [],
            roles: [], 
            users: [],
            transactions: [],
            config: { version: "4.0-sos-core" } // Actualizado a v4
        };
        this.listeners = [];
        this.initPromise = this.init();
    }

    async init() {
        console.log('🚀 Iniciando SOS Kernel v4...');
        
        // 1. Recuperación con validación de versión
        const saved = localStorage.getItem('teamtowers-v4-state'); // Cambiado a v4
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Solo cargamos si la versión es compatible
                if (parsed.config && parsed.config.version.startsWith("4")) {
                    this.state = parsed;
                    console.log('✅ Estado v4 recuperado');
                } else {
                    console.warn('⚠️ Versión antigua detectada. Reseteando para v4...');
                }
            } catch (e) {
                console.error('❌ Error en LocalStorage');
            }
        }

        // 2. Sincronización obligatoria con la Ontología FEVS
        await this.loadCoreRoles();

        // 3. Garantía de integridad de datos
        this.state.projects = this.state.projects || [];
        this.state.transactions = this.state.transactions || [];
        if (!this.state.users || this.state.users.length === 0) {
            this.state.users = this.getDefaultUsers();
        }

        this.saveState();
        window.dispatchEvent(new Event('store-ready'));
        return this.state;
    }

    async loadCoreRoles() {
        try {
            // Ajustamos la ruta para que funcione desde /tests/ o desde raíz
            const response = await fetch('./data/core-roles.json').catch(() => fetch('../data/core-roles.json'));
            if (!response.ok) throw new Error("Fichero no alcanzable");
            const data = await response.json();
            this.state.roles = data.roles;
            console.log('✅ Ontología FEVS v4 cargada');
        } catch (e) {
            console.warn('⚠️ Usando roles de emergencia (Pinya Mode)');
            this.state.roles = [
                { id: "@pinya", nombre: "Soporte Base", multiplier: 1.0, precio_base_h: 30, fevs_req: {f:5,e:5,v:3,s:3} }
            ];
        }
    }

    dispatch(action) {
        const { type, payload } = action;
        console.log(`📡 SOS ACTION: ${type}`);

        switch (type) {
            case 'ADD_PROJECT':
                this.addProject(payload);
                break;
            case 'ADD_TRANSACTION':
                this.addTransaction(payload.projectId, payload.transaction);
                break;
            case 'RESET_DATABASE': // Útil para desarrollo
                localStorage.removeItem('teamtowers-v4-state');
                location.reload();
                break;
            default:
                console.warn(`⚠️ Acción no reconocida: ${type}`);
        }
        
        this.saveState();
        this.notify();
    }

    addProject(project) {
        const newProject = {
            id: project.id || `p-${Date.now()}`,
            nombre: project.nombre || "Nuevo Castell",
            transactions: [],
            created_at: new Date().toISOString()
        };
        this.state.projects.push(newProject);
    }

    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        const rolID = transaction.rolId || "@pinya";
        const rolConfig = this.state.roles.find(r => r.id === rolID) || this.state.roles[0];

        // Lógica de liquidación v4
        const horas = transaction.horas || 1;
        const valorEconomico = horas * (rolConfig.precio_base_h || 30) * (rolConfig.multiplier || 1);

        const newMeme = {
            id: `tx-${Date.now()}`,
            projectId,
            rolId: rolID,
            tipo_valor: transaction.tipo_valor || 'tangible',
            categoria: transaction.categoria || '#hacer',
            concepto: transaction.concepto || "Entrega de valor",
            uv: transaction.uv || 100,
            liquidación: valorEconomico,
            fevs_impact: rolConfig.fevs_req || {f:1,e:1,v:1,s:1},
            timestamp: new Date().toISOString()
        };

        project.transactions.push(newMeme);
        this.state.transactions.push(newMeme);
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    saveState() {
        localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state));
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => this.listeners = this.listeners.filter(l => l !== callback);
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }

    getDefaultUsers() {
        return [
            { id: "@alvaro-solache", nombre: "Álvaro Solache", fevs: {f:9,e:9,v:9,s:9} },
            { id: "@ia-architect", nombre: "Gemini SOS", fevs: {f:10,e:10,v:10,s:1} }
        ];
    }
}

const store = new TTStore();
window.store = store;
export { store };
