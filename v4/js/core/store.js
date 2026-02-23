/**
 * TEAMTOWERS SOS v4.2 - KERNEL CONSCIENTE (CON ROLES DINÁMICOS Y DIRECCIONALIDAD)
 */
export class TTStore {
    constructor() {
        this.ontologyStatic = {
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
            ontology: this.ontologyStatic,
            roles: this.ontologyStatic.roles
        };
        this.listeners = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state.projects = parsed.projects || [];
            } catch (e) { console.error("SOS: Error storage", e); }
        }
        this.state.ontology = this.ontologyStatic;
        this.state.roles = this.ontologyStatic.roles;
        setTimeout(() => window.dispatchEvent(new Event('store-ready')), 10);
    }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return 100;
        const totalValue = p.transactions.reduce((acc, t) => acc + (t.liquidación || 0), 0);
        
        // Detectamos si el rol original O el nivel del rol dinámico es de auditoría
        const auditValue = p.transactions
            .filter(t => t.rolId === '@dosos' || t.levelId === '@dosos')
            .reduce((acc, t) => acc + (t.liquidación || 0), 0);
            
        return totalValue > 0 ? Math.round((auditValue / totalValue) * 100) : 100;
    }

    getAlerts(projectId) {
        const alerts = [];
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return [];
        
        const hasAudit = p.transactions.some(t => t.rolId === '@dosos' || t.levelId === '@dosos');
        if (p.transactions.length > 0 && !hasAudit) {
            alerts.push({ code: 'RIESGO_DEUDA_TECNICA', level: 'CRITICAL' });
        }
        
        p.transactions.forEach(t => {
            // Buscamos la data del rol (sea base o dinámico)
            let r = this.state.roles.find(rol => rol.id === t.rolId);
            if (!r && p.dynamicRoles) r = p.dynamicRoles.find(dr => dr.id === t.rolId);
            if (!r) return;
            
            const precioHoraReal = t.liquidación / (t.horas * r.multiplier);
            if (precioHoraReal > r.precio_base_h * 1.5) {
                alerts.push({ code: 'DESVIACION_PRECIO', msg: `Sobre-liquidación en ${t.rolId}` });
            }
        });
        
        return alerts;
    }

    dispatch(action) {
        const { type, payload } = action;
        const project = this.state.projects.find(x => x.id === payload.projectId);

        switch (type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                const sectorKey = Object.keys(this.state.ontology.sectores).find(k => k.toLowerCase() === payload.sector.toLowerCase()) || 'marketing';
                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: sectorKey,
                    customRoles: { ...this.state.ontology.sectores[sectorKey] }, 
                    dynamicRoles: [], transactions: []
                });
                break;

            case 'CREATE_CUSTOM_ROLE':
                if (project) {
                    const master = this.state.roles.find(r => r.id === payload.levelId);
                    project.dynamicRoles.push({
                        id: `custom-${Date.now()}`,
                        levelId: payload.levelId,
                        name: payload.name,
                        area: payload.area,
                        description: payload.description,
                        skills: payload.skills,
                        multiplier: master.multiplier,
                        precio_base_h: master.precio_base_h
                    });
                }
                break;

            case 'ADD_TRANSACTION':
                if (!project) return;
                
                let roleData = this.state.roles.find(r => r.id === payload.transaction.rolId);
                if (!roleData && project.dynamicRoles) {
                    roleData = project.dynamicRoles.find(dr => dr.id === payload.transaction.rolId);
                }
                if (!roleData) return;
                
                const salud = this.calculateResilience(payload.projectId);
                if (salud < 30 && roleData.multiplier > 2.0) return;

                // --- RESTAURADO: Cálculo con override_price y horas seguras ---
                const horas = payload.transaction.horas || 1;
                const precioBase = payload.transaction.override_price || roleData.precio_base_h;
                const liq = horas * precioBase * roleData.multiplier;

                project.transactions.push({
                    ...payload.transaction,
                    id: Date.now(),
                    liquidación: liq,
                    tipo_flujo: payload.transaction.tipo_flujo || 'tangible', // <-- RESTAURADO
                    levelId: roleData.levelId || roleData.id 
                });
                break;

            case 'UPDATE_ROLE_NAME':
                if (project) project.customRoles[payload.rolId] = payload.newName;
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
