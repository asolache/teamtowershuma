/**
 * TEAMTOWERS SOS v4.2 - KERNEL CONSCIENTE
 */
export class TTStore {
    constructor() {
        const ontologiaMaestra = {
            sectores: { 
                marketing: { "@anxaneta": "Strategy Director", "@aixecador": "Creative Director", "@dosos": "Content Curator", "@baixos": "Graphic Designer", "@pinya": "Ads Manager" },
                Web3: { "@anxaneta": "Lead Architect / Tokenomist", "@aixecador": "Smart Contract Dev", "@dosos": "Security Auditor", "@baixos": "DApp Developer", "@pinya": "Validator / IA" },
                gremial: { "@anxaneta": "Ingeniero Jefe", "@aixecador": "Oficial de 1ª", "@dosos": "Verificador de Calidad", "@baixos": "Especialista", "@pinya": "Logística Base" }
            },
            roles: [
                { id: "@anxaneta", multiplier: 3.0, precio_base_h: 90, area: "ESTRATEGIA" },
                { id: "@aixecador", multiplier: 2.5, precio_base_h: 75, area: "ESTRUCTURA" },
                { id: "@dosos", multiplier: 2.0, precio_base_h: 60, area: "REFINAMIENTO" },
                { id: "@baixos", multiplier: 1.5, precio_base_h: 45, area: "PRODUCCIÓN" },
                { id: "@pinya", multiplier: 1.0, precio_base_h: 30, area: "INFRAESTRUCTURA" }
            ]
        };

        this.state = {
            projects: [],
            ontology: ontologiaMaestra,
            roles: ontologiaMaestra.roles
        };
        this.listeners = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) this.state = JSON.parse(saved);
        // Aseguramos que la ontología esté siempre actualizada
        this.state.ontology = this.constructor().ontology; 
        window.dispatchEvent(new Event('store-ready'));
    }

    // --- MOTOR DE RESILIENCIA ---
    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return 100;
        
        const totalValue = p.transactions.reduce((acc, t) => acc + t.liquidación, 0);
        const auditValue = p.transactions
            .filter(t => t.rolId === '@dosos')
            .reduce((acc, t) => acc + t.liquidación, 0);
        
        // Si no hay auditoría, la salud cae drásticamente según el peso del proyecto
        return totalValue > 0 ? Math.round((auditValue / totalValue) * 100) : 100;
    }

    // --- SISTEMA DE ALERTAS (WATCHDOG) ---
    getAlerts(projectId) {
        const alerts = [];
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return [];

        // Alerta 1: Riesgo Deuda Técnica
        const tieneAuditoria = p.transactions.some(t => t.rolId === '@dosos');
        if (p.transactions.length > 0 && !tieneAuditoria) {
            alerts.push({ code: 'RIESGO_DEUDA_TECNICA', level: 'CRITICAL' });
        }

        // Alerta 2: Desviación de Precio
        p.transactions.forEach(t => {
            const r = this.state.roles.find(rol => rol.id === t.rolId);
            const precioHoraReal = t.liquidación / (t.horas * r.multiplier);
            if (precioHoraReal > r.precio_base_h * 1.5) { // Tolerancia del 50%
                alerts.push({ code: 'DESVIACION_PRECIO', msg: `Sobre-liquidación en ${t.rolId}` });
            }
        });

        return alerts;
    }

    dispatch(action) {
        const { type, payload } = action;
        switch (type) {
            case 'ADD_PROJECT':
                const alias = this.state.ontology.sectores[payload.sector] || this.state.ontology.sectores['marketing'];
                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: payload.sector,
                    customRoles: { ...alias }, transactions: []
                });
                break;

            case 'ADD_TRANSACTION':
                const project = this.state.projects.find(x => x.id === payload.projectId);
                const role = this.state.roles.find(r => r.id === payload.transaction.rolId);
                
                // --- CIRCUIT BREAKER ---
                const salud = this.calculateResilience(payload.projectId);
                if (salud < 30 && role.multiplier > 2.0) {
                    console.error("SOS: Circuit Breaker activado. Bloqueada liquidación estratégica por baja resiliencia.");
                    return; // Bloqueo total
                }

                const horas = payload.transaction.horas || 1;
                const precioBase = payload.transaction.override_price || role.precio_base_h;
                const liq = horas * precioBase * role.multiplier;

                project.transactions.push({
                    ...payload.transaction,
                    id: Date.now(),
                    liquidación: liq,
                    tipo_flujo: payload.transaction.tipo_flujo || 'tangible'
                });
                break;

            case 'UPDATE_ROLE_NAME':
                const prj = this.state.projects.find(p => p.id === payload.projectId);
                if (prj) prj.customRoles[payload.rolId] = payload.newName;
                break;

            case 'RESET_DATABASE':
                localStorage.removeItem('teamtowers-v4-state');
                location.reload();
                break;
        }
        this.save();
        this.notify();
    }

    save() { localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state)); }
    getState() { return JSON.parse(JSON.stringify(this.state)); }
    subscribe(cb) { this.listeners.push(cb); }
    notify() { this.listeners.forEach(cb => cb(this.state)); }
}
export const store = new TTStore();
