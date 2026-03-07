// v5/js/core/store.js
import { GLOBAL_ONTOLOGY } from '../data/ontology.js'; // Asegúrate de tener este archivo en /v5/js/data/

const initialState = {
    config: {
        theme: 'dark',
        ecosystemName: 'TeamTowers Network',
        globalPrompt: 'Eres el orquestador principal de un sistema DAO enfocado en meritocracia y transparencia.'
    },
    ontology: {
        sectores: {
            "startup": {
                "@anxaneta": { name: "CEO / Founder", multiplier: 3.0, ai_prompt: "Eres el CEO. Evalúas impacto en negocio y runway.", standard_deliverables: [{estimatedHours: 10, name: "Pitch Deck"}] },
                "@aixecador": { name: "Product Manager", multiplier: 2.0, ai_prompt: "Eres el PM. Evalúas viabilidad y scope.", standard_deliverables: [] },
                "@dosos": { name: "QA / Auditor", multiplier: 1.5, ai_prompt: "Eres QA. Buscas fallos y riesgos.", standard_deliverables: [] },
                "@baixos": { name: "Desarrollador Senior", multiplier: 1.2, ai_prompt: "Eres Dev Senior. Revisas calidad de código.", standard_deliverables: [] },
                "@pinya": { name: "Soporte / Junior", multiplier: 1.0, ai_prompt: "Eres Soporte. Validas ejecución.", standard_deliverables: [] }
            },
            "marketing": {
                "@anxaneta": { name: "Strategy", multiplier: 3.0 },
                "@aixecador": { name: "Campaign Manager", multiplier: 2.0 },
                "@dosos": { name: "Analytics", multiplier: 1.5 },
                "@baixos": { name: "Content Creator", multiplier: 1.2 },
                "@pinya": { name: "Community Manager", multiplier: 1.0 }
            }
        }
    },
    globalUsers: [
        { id: '@user1', name: 'Alice Node', walletOrSocial: '0x123...' },
        { id: '@user2', name: 'Bob Builder', walletOrSocial: 'bob@email.com' }
    ],
    macroFlows: [], 
    projects: [
        {
            id: 'proj-1',
            nombre: 'Desarrollo Core App',
            sector: 'startup',
            tipo: 'ecosystem',
            archetype: 'startup',
            ownerId: 'ecosystem-admin',
            prompt: 'Contexto de desarrollo de software ágil.',
            config: { tokenomics: 'startup' },
            roles: [
                { id: 'r1', name: 'Arquitecto', levelId: '@anxaneta', multiplier: 3, fmv: 50, ai_prompt: '', standard_deliverables: [] },
                { id: 'r2', name: 'Frontend', levelId: '@baixos', multiplier: 1.5, fmv: 30, ai_prompt: '', standard_deliverables: [] }
            ],
            usuarios: [{ id: '@user1' }],
            asignaciones: [{ userId: '@user1', roleId: 'r1' }],
            transactions: [],
            ledger: [],
            alerts: []
        }
    ],
    session: {
        activeUserId: 'ecosystem-admin',
        role: 'admin'
    }
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case 'IMPORT_STATE':
            return { ...state, ...action.payload };

        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        case 'ADD_ONTOLOGY_SECTOR':
            return {
                ...state,
                ontology: {
                    ...state.ontology,
                    sectores: {
                        ...state.ontology.sectores,
                        [action.payload.sectorId]: action.payload.rolesData
                    }
                }
            };

        case 'ADD_SECTOR': {
            const sectorId = action.payload.id || action.payload.name || 'custom_sector';
            const sectorData = action.payload.data || action.payload.roles || action.payload;
            return {
                ...state,
                ontology: {
                    ...state.ontology,
                    sectores: { ...state.ontology.sectores, [sectorId]: sectorData }
                }
            };
        }

        case 'ADD_USER': {
            const newId = action.payload.id || action.payload.userId;
            const existsGlobal = state.globalUsers.find(u => u.id === newId);
            if (existsGlobal) {
                throw new Error("El identificador ya existe.");
            }
            const newUser = { id: newId, name: action.payload.name, walletOrSocial: action.payload.walletOrSocial };
            
            let newProjects = state.projects;
            if (action.payload.projectId) {
                newProjects = state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const prev = p.usuarios || [];
                        if (!prev.find(u => u.id === newId)) return { ...p, usuarios: [...prev, { id: newId }] };
                    }
                    return p;
                });
            }
            return { ...state, globalUsers: [...state.globalUsers, newUser], projects: newProjects };
        }

        case 'LOGIN_USER': {
            const isAdmin = action.payload.userId === 'ecosystem-admin';
            return { ...state, session: { activeUserId: action.payload.userId, role: isAdmin ? 'admin' : 'user' } };
        }
            
        case 'LOGOUT_USER':
            return { ...state, session: { activeUserId: 'ecosystem-admin', role: 'admin' } };

        case 'ADD_PROJECT_RESTRICTED': {
            if (state.session.role !== 'admin') {
                throw new Error("⛔ Acceso Denegado: Solo el Ecosystem Owner puede instanciar redes nuevas.");
            }
            return state; 
        }

        case 'ADD_PROJECT': {
            if (state.session.role !== 'admin' && !action.payload.bypassSecurity && !action.payload.ownerId) {
                return state; 
            }

            let sectorDataObj = GLOBAL_ONTOLOGY[action.payload.sector];
            let sectorRolesArray = [];

            if (sectorDataObj && sectorDataObj.roles) {
                sectorRolesArray = sectorDataObj.roles;
            } else {
                const legacySectorData = state.ontology.sectores[action.payload.sector] || {};
                Object.keys(legacySectorData).forEach(levelId => {
                    const r = legacySectorData[levelId];
                    sectorRolesArray.push({
                        levelId: levelId,
                        name: r.name || levelId,
                        multiplier: r.multiplier || 1.0,
                        fmv: r.fmv || 50,
                        ai_prompt: r.ai_prompt || '',
                        standard_deliverables: r.standard_deliverables || []
                    });
                });
            }

            const baseRoles = sectorRolesArray.map(r => {
                let finalName = r.name;
                if (r.levelId === '@anxaneta' && action.payload.sector === 'marketing') {
                    finalName = 'Growth Hacker / CMO';
                }

                return {
                    id: `role-${r.levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    levelId: r.levelId,
                    name: finalName,
                    multiplier: r.multiplier || 1.0,
                    fmv: r.fmv || 50,
                    ai_prompt: r.ai_prompt || '',
                    standard_deliverables: r.standard_deliverables ? JSON.parse(JSON.stringify(r.standard_deliverables)) : [],
                    isArchived: false
                };
            });

            const ownerId = action.payload.ownerId || state.session.activeUserId;
            const arquetipo = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || 'startup';

            const newProject = {
                id: action.payload.id || ('proj-' + Date.now()),
                nombre: action.payload.nombre || 'Nuevo Proyecto',
                sector: action.payload.sector || 'general',
                tipo: action.payload.tipo || 'project', 
                archetype: arquetipo, 
                ownerId: ownerId,
                prompt: action.payload.prompt || '',
                config: { tokenomics: 'startup', archetype: arquetipo },
                roles: baseRoles,
                usuarios: [{ id: ownerId }],
                asignaciones: [],
                transactions: [],
                ledger: [],
                alerts: []
            };
            return { ...state, projects: [...state.projects, newProject] };
        }

        case 'ADD_PROJECT_ALERT': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const newAlert = { id: 'alert-' + Date.now(), message: action.payload.message, timestamp: Date.now(), resolved: false };
                        return { ...p, alerts: [...(p.alerts || []), newAlert] };
                    }
                    return p;
                })
            };
        }

        case 'RESOLVE_PROJECT_ALERT': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, alerts: (p.alerts || []).map(a => a.id === action.payload.alertId ? { ...a, resolved: true } : a) };
                    }
                    return p;
                })
            };
        }

        case 'PROMOTE_TO_PO': {
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return { ...p, ownerId: action.payload.userId };
                    }
                    return p;
                })
            };
        }

        case 'ADD_MACRO_FLOW': {
            const newFlow = {
                id: 'mflow-' + Date.now(),
                from: action.payload.fromProjectId,
                to: action.payload.toProjectId,
                entregable: action.payload.entregable || 'Intercambio de Valor',
                tipo: action.payload.tipo || 'tangible'
            };
            return { ...state, macroFlows: [...(state.macroFlows || []), newFlow] };
        }

        case 'UPDATE_PROJECT_INFO':
            return {
                ...state,
                projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ...action.payload.updates } : p)
            };

        case 'UPDATE_ARCHETYPE':
        case 'UPDATE_PROJECT_CONFIG':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        const newArch = action.payload.archetype || action.payload.arquetipo || (action.payload.config && action.payload.config.archetype) || p.archetype;
                        return { ...p, archetype: newArch, config: { ...p.config, ...(action.payload.config || {}), archetype: newArch } };
                    }
                    return p;
                })
            };

        case 'UPDATE_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            roles: p.roles.map(r => {
                                if (r.id === action.payload.roleId) {
                                    if (action.payload.field) {
                                        return { ...r, [action.payload.field]: action.payload.value };
                                    } else {
                                        const newName = action.payload.name || (action.payload.updates && action.payload.updates.name) || r.name;
                                        return { ...r, ...(action.payload.updates || {}), name: newName, id: r.id };
                                    }
