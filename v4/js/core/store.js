/**
 * TEAMTOWERS SOS (Sistema Operativo Social) v4.0
 * KERNEL: Store Centralizado con Ontología FEVS
 * ---------------------------------------------------------
 * Este es el motor central que gestiona el estado, la persistencia
 * y la lógica de liquidación económica del gremio.
 */

class TTStore {
    constructor() {
        this.state = {
            projects: [],
            roles: [], 
            users: [],
            transactions: [],
            config: { 
                version: "4.0-sos-core",
                lastUpdate: new Date().toISOString()
            }
        };
        this.listeners = [];
        this.initPromise = this.init();
    }

    async init() {
        console.log('🚀 [SOS KERNEL] Iniciando v4.0...');
        
        // 1. Intentar recuperar estado previo de LocalStorage (v4)
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.config && parsed.config.version.startsWith("4")) {
                    this.state = parsed;
                    console.log('✅ [SOS KERNEL] Estado v4 recuperado con éxito');
                } else {
                    console.warn('⚠️ [SOS KERNEL] Versión incompatible detectada. Forzando actualización a v4.');
                }
            } catch (e) {
                console.error('❌ [SOS KERNEL] Error crítico al leer LocalStorage');
            }
        }

        // 2. Carga obligatoria de la Ontología FEVS (Gremio)
        await this.loadCoreRoles();

        // 3. Garantía de integridad estructural
        this.state.projects = this.state.projects || [];
        this.state.transactions = this.state.transactions || [];
        if (!this.state.users || this.state.users.length === 0) {
            this.state.users = this.getDefaultUsers();
        }

        this.saveState();
        
        // Notificar al sistema que el núcleo está listo
        window.dispatchEvent(new Event('store-ready'));
        return this.state;
    }

    /**
     * Rastreador Inteligente de Ontología
     * Busca el archivo core-roles.json en diferentes niveles de profundidad
     */
    async loadCoreRoles() {
        const paths = [
            './data/core-roles.json',
            '../data/core-roles.json',
            '../../data/core-roles.json'
        ];

        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    this.state.roles = data.roles;
                    console.log(`✅ [ONTOLOGÍA] Cargada con éxito desde: ${path}`);
                    return; 
                }
            } catch (e) {
                // Sigue probando el siguiente path
            }
        }

        console.error('❌ [CRÍTICO] No se encontró core-roles.json. Activando protocolo de emergencia.');
        this.state.roles = [
            { id: "@pinya", nombre: "Emergencia", multiplier: 1.0, precio_base_h: 30, fevs_req: {f:1,e:1,v:1,s:1} }
        ];
    }

    // ===== MOTOR DE ACCIONES (Dispatch) =====
    dispatch(action) {
        const { type, payload } = action;
        console.log(`📡 [SOS ACTION]: ${type}`, payload);

        switch (type) {
            case 'ADD_PROJECT':
                this.addProject(payload);
                break;
            case 'ADD_TRANSACTION':
                this.addTransaction(payload.projectId, payload.transaction);
                break;
            case 'RESET_DATABASE':
                console.warn('🧹 Reseteando base de datos...');
                localStorage.removeItem('teamtowers-v4-state');
                location.reload();
                break;
            default:
                console.warn(`⚠️ Acción SOS desconocida: ${type}`);
        }
        
        this.saveState();
        this.notify();
    }

    // ===== LÓGICA DE NEGOCIO =====
    
    addProject(project) {
        const newProject = {
            id: project.id || `p-${Date.now()}`,
            nombre: project.nombre || "Nuevo Castell",
            transactions: [],
            created_at: new Date().toISOString(),
            status: 'active'
        };
        this.state.projects.push(newProject);
    }

    /**
     * Liquidación de Memes de Valor (Triple Entrada)
     */
    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) {
            console.error(`❌ Proyecto ${projectId} no encontrado`);
            return;
        }

        // 1. Identificar Rol y aplicar tarifas del Gremio
        const rolID = transaction.rolId || "@pinya";
        const rolConfig = this.state.roles.find(r => r.id === rolID) || this.state.roles[0];

        // 2. Cálculo económico SOS: Horas * Precio Base * Multiplicador Rol
        const horas = transaction.horas || 1;
        const precioBase = rolConfig.precio_base_h || 30;
        const multiplier = rolConfig.multiplier || 1.0;
        const liquidacionFinal = horas * precioBase * multiplier;

        // 3. Crear el Meme de Valor (Transacción inmutable)
        const newMeme = {
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            projectId,
            rolId: rolID,
            tipo_valor: transaction.tipo_valor || (multiplier >= 2 ? 'intangible' : 'tangible'),
            categoria: transaction.categoria || '#hacer',
            concepto: transaction.concepto || "Aportación de valor",
            uv: transaction.uv || 100,
            liquidación: liquidacionFinal,
            fevs_impact: rolConfig.fevs_req || {f:1,e:1,v:1,s:1},
            timestamp: new Date().toISOString()
        };

        // 4. Inyectar en el estado
        project.transactions.push(newMeme);
        this.state.transactions.push(newMeme);
        
        console.log(`💰 [LIQUIDACIÓN] Meme generado: ${liquidacionFinal}€ por ${rolID}`);
    }

    // ===== UTILIDADES =====
    
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

// Exportación y Globalización
const store = new TTStore();
window.store = store; // Para debug desde consola
export { store };
