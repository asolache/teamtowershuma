/**
 * TEAMTOWERS SOS (Sistema Operativo Social) v1.0
 * KERNEL: Store Centralizado con Ontología FEVS
 */

class TTStore {
    constructor() {
        this.state = {
            projects: [],
            roles: [], // Se cargan desde core-roles.json
            users: [],
            transactions: [],
            config: { version: "3.5-sos-ready" }
        };
        this.listeners = [];
        this.initPromise = this.init();
    }

    async init() {
        console.log('🚀 Iniciando SOS Kernel...');
        
        // 1. Intentar cargar desde LocalStorage
        const saved = localStorage.getItem('teamtowers-v3-state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                console.log('✅ Estado recuperado de LocalStorage');
            } catch (e) {
                console.error('❌ Error al parsear LocalStorage, reiniciando...');
            }
        }

        // 2. Cargar/Actualizar la librería de roles FEVS (Sincronización con el Gremio)
        await this.loadCoreRoles();

        // 3. Asegurar estructura mínima
        if (!this.state.projects) this.state.projects = [];
        if (!this.state.transactions) this.state.transactions = [];
        if (this.state.users.length === 0) this.state.users = this.getDefaultUsers();

        this.saveState();
        window.dispatchEvent(new Event('store-ready'));
        return this.state;
    }

    async loadCoreRoles() {
        try {
            // Intentamos cargar la ontología oficial
            const response = await fetch('../data/core-roles.json');
            if (!response.ok) throw new Error("No se encontró core-roles.json");
            const data = await response.json();
            this.state.roles = data.roles;
            console.log('✅ Ontología FEVS cargada:', this.state.roles.length, 'roles disponibles');
        } catch (e) {
            console.warn('⚠️ No se pudo cargar core-roles.json. Usando roles de emergencia.');
            this.state.roles = [
                { id: "@pinya", nombre: "Soporte Base", multiplier: 1.0, precio_base_h: 30, fevs_req: {f:5,e:5,v:3,s:3} }
            ];
        }
    }

    // ===== SISTEMA DE ACCIONES (Dispatch) =====
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
            case 'UPDATE_USER_FEVS':
                this.updateUserFEVS(payload.userId, payload.fevs);
                break;
            default:
                console.warn(`⚠️ Acción SOS no reconocida: ${type}`);
        }
        
        this.saveState();
        this.notify();
    }

    // ===== LÓGICA DE NEGOCIO (Memes de Valor) =====
    
    addProject(project) {
        const newProject = {
            id: project.id || `p-${Date.now()}`,
            nombre: project.nombre || "Nuevo Castell",
            transactions: project.transactions || [],
            created_at: new Date().toISOString(),
            status: 'active'
        };
        this.state.projects.push(newProject);
    }

    /**
     * P-024: Liquidación de Memes de Valor
     * Calcula automáticamente el valor económico basado en el Rol SOS.
     */
    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        // Buscar el rol para aplicar liquidación SOS
        const rolID = transaction.rolId || "@pinya";
        const rolConfig = this.state.roles.find(r => r.id === rolID) || this.state.roles[0];

        // Cálculo de Liquidación del Gremio
        const horas = transaction.horas || 1;
        const valorEconomico = horas * rolConfig.precio_base_h * rolConfig.multiplier;

        const newMeme = {
            id: `tx-${Date.now()}`,
            projectId,
            rolId: rolID,
            tipo_valor: transaction.tipo_valor || 'tangible', // Para el Mapa de Valor
            categoria: transaction.categoria || '#hacer',   // Ontología SOS
            concepto: transaction.concepto || "Nueva entrega",
            uv: transaction.uv || 100, // Unidades de Valor Relativo
            liquidación: valorEconomico,
            fevs_impact: rolConfig.fevs_req, // Huella de identidad de la entrega
            timestamp: new Date().toISOString()
        };

        if (!project.transactions) project.transactions = [];
        project.transactions.push(newMeme);
        this.state.transactions.push(newMeme);
        
        console.log(`💰 Meme Liquidado: ${valorEconomico}€ (${newMeme.categoria})`);
    }

    // ===== PERSISTENCIA Y UTILIDADES =====
    
    getState() {
        const copy = JSON.parse(JSON.stringify(this.state));
        copy.proyectos = copy.projects; // Compatibilidad legacy
        return copy;
    }

    saveState() {
        localStorage.setItem('teamtowers-v3-state', JSON.stringify(this.state));
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

// Inicialización global
const store = new TTStore();
window.store = store;
export { store };

console.log('✅ SOS Kernel v1.0 cargado y listo para el Agente Parser.');
