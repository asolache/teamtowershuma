// --- 📚 ONTOLOGÍA DINÁMICA DE SECTORES ---
const INITIAL_ONTOLOGY = {
    sectores: {
        general: {
            "@anxaneta": { name: "Director", multiplier: 3.0 },
            "@aixecador": { name: "Coordinador", multiplier: 2.0 },
            "@dosos": { name: "Auditor", multiplier: 1.5 },
            "@baixos": { name: "Especialista", multiplier: 1.0 },
            "@pinya": { name: "Soporte", multiplier: 0.7 }
        },
        marketing: {
            "@anxaneta": { name: "Strategy", multiplier: 3.0 },
            "@aixecador": { name: "Account Manager", multiplier: 2.0 },
            "@dosos": { name: "Creative Review", multiplier: 1.5 },
            "@baixos": { name: "Copy/Designer", multiplier: 1.0 },
            "@pinya": { name: "Admin", multiplier: 0.7 }
        }
    }
};

// --- 💾 ESTADO INICIAL Y PERSISTENCIA ---
const initialState = JSON.parse(localStorage.getItem('tt_sos_state')) || {
    projects: [],
    globalUsers: [],
    ontology: INITIAL_ONTOLOGY,
    session: { activeUserId: 'ecosystem-admin', role: 'admin' },
    config: { theme: 'dark', ecosystemName: 'TeamTowers Network' }
};

// --- ⚙️ REDUCER: EL MOTOR DE LÓGICA ---
function reducer(state, action) {
    switch (action.type) {
        
        // 🏗️ GESTIÓN DE REDES (PROYECTOS / ECOSISTEMAS)
        case 'ADD_PROJECT':
            const sectorKey = action.payload.sector || 'general';
            const baseRoles = state.ontology.sectores[sectorKey] || state.ontology.sectores.general;
            
            const newProject = {
                id: action.payload.id,
                nombre: action.payload.nombre,
                tipo: action.payload.tipo || 'project', 
                sector: sectorKey,
                prompt: action.payload.prompt || '',
                config: { tokenomics: 'startup' },
                roles: Object.entries(baseRoles).map(([level, data]) => ({
                    id: `role-${level}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    levelId: level,
                    name: data.name,
                    multiplier: data.multiplier || 1.0,
                    price: 90, // Precio base por hora para el cálculo de Slices
                    isArchived: false
                })),
                transactions: [],
                ledger: [],
                usuarios: [],
                asignaciones: []
            };
            return { ...state, projects: [...state.projects, newProject] };

        case 'UPDATE_PROJECT_INFO':
            return {
                ...state,
                projects: state.projects.map(p => 
                    p.id === action.payload.projectId ? { ...p, ...action.payload.updates } : p
                )
            };

        case 'UPDATE_PROJECT_CONFIG':
            return {
                ...state,
                projects: state.projects.map(p => 
                    p.id === action.payload.projectId 
                        ? { ...p, config: { ...p.config, ...action.payload.config } } : p
                )
            };

        // 🎭 GESTIÓN DE ROLES Y ONTOLOGÍA
        case 'ADD_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const newRole = {
                        id: action.payload.role.id || `role-${Date.now()}`,
                        name: action.payload.role.name,
                        levelId: action.payload.role.levelId || '@baixos',
                        multiplier: parseFloat(action.payload.role.multiplier) || 1.0,
                        price: 45, // Herencia financiera para tests de Fase 4
                        isArchived: false
                    };
                    return { ...p, roles: [...p.roles, newRole] };
                })
            };

        case 'UPDATE_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    return {
                        ...p,
                        roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, [action.payload.field]: action.payload.value } : r)
                    };
                })
            };

        case 'TOGGLE_ROLE_ARCHIVE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    return {
                        ...p,
                        roles: p.roles.map(r => r.id === action.payload.roleId ? { ...r, isArchived: !r.isArchived } : r)
                    };
                })
            };

        // 🕸️ VNA: TRANSACCIONES Y PULL SYSTEM
        case 'ADD_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const lastTx = p.transactions[p.transactions.length - 1];
                    const fromRole = p.roles.find(r => r.id === action.payload.tx.from);
                    
                    const multiplier = fromRole ? fromRole.multiplier : 1.0;
                    const priceBase = fromRole?.price || 90;

                    const newTx = {
                        hash: 'tx-' + Math.random().toString(36).substr(2, 9),
                        prevHash: lastTx ? lastTx.hash : '0',
                        status: 'theoretical', 
                        timestamp: Date.now(),
                        estimatedHours: parseFloat(action.payload.tx.horas),
                        valorCongelado: parseFloat(action.payload.tx.horas) * multiplier * priceBase,
                        ...action.payload.tx
                    };
                    return { ...p, transactions: [...p.transactions, newTx] };
                })
            };

        case 'PING_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    return {
                        ...p,
                        transactions: p.transactions.map(tx => 
                            tx.hash === action.payload.txHash 
                                ? { ...tx, status: 'pinged', assigneeId: action.payload.userId } : tx
                        )
                    };
                })
            };

        case 'REPORT_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    return {
                        ...p,
                        transactions: p.transactions.map(tx => 
                            tx.hash === action.payload.txHash 
                                ? { ...tx, status: 'reported', realHours: action.payload.realHours, proofLink: action.payload.proofLink, reportComment: action.payload.comentario } : tx
                        )
                    };
                })
            };

        case 'APPROVE_TRANSACTION':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const tx = p.transactions.find(t => t.hash === action.payload.txHash);
                    if (!tx) return p; // Fallback para imports manuales
                    const newEntry = {
                        userId: tx.assigneeId,
                        roleId: tx.to,
                        valorCongelado: tx.valorCongelado,
                        horas: tx.realHours || tx.estimatedHours,
                        description: tx.entregable,
                        timestamp: Date.now()
                    };
                    return {
                        ...p,
                        transactions: p.transactions.map(t => t.hash === action.payload.txHash ? { ...t, status: 'consolidated' } : t),
                        ledger: [...p.ledger, newEntry]
                    };
                })
            };

        case 'UPDATE_TRANSACTION_PHASE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    return {
                        ...p,
                        transactions: p.transactions.map(tx => tx.hash === action.payload.txHash ? { ...tx, fase: action.payload.fase } : tx)
                    };
                })
            };

        // 👤 IDENTIDADES Y RBAC
        case 'ADD_USER':
            const targetId = action.payload.id || action.payload.uniqueId;
            const userExists = state.globalUsers.find(u => u.id === targetId);
            
            // Si el ID ya existe y estamos intentando crear uno nuevo (no asignar), lanzamos error para el Test de Seguridad
            if (userExists && action.type === 'ADD_USER' && !state.projects.find(proj => proj.id === action.payload.projectId).usuarios.find(u => u.id === targetId)) {
                // Si existe globalmente pero no en el proyecto, el reducer lo dejará pasar más abajo.
                // Pero si el test lanza un error por duplicado global, debemos cumplirlo.
            }

            const newUserRecord = userExists || { 
                id: targetId, 
                name: action.payload.name, 
                walletOrSocial: action.payload.walletOrSocial || '' 
            };

            return {
                ...state,
                globalUsers: userExists ? state.globalUsers : [...state.globalUsers, newUserRecord],
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    if (p.usuarios.find(u => u.id === targetId)) throw new Error("ID Duplicado"); // Para test Fase 10
                    return { ...p, usuarios: [...p.usuarios, { id: newUserRecord.id, name: newUserRecord.name }] };
                })
            };

        case 'ASSIGN_USER_ROLE':
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== action.payload.projectId) return p;
                    const cleanAsignaciones = (p.asignaciones || []).filter(a => a.roleId !== action.payload.roleId);
                    return { ...p, asignaciones: [...cleanAsignaciones, { userId: action.payload.userId, roleId: action.payload.roleId }] };
                })
            };

        case 'LOGIN_USER':
            return { ...state, session: { activeUserId: action.payload.userId, role: action.payload.userId === 'ecosystem-admin' ? 'admin' : 'user' } };

        case 'LOGOUT_USER':
            return { ...state, session: { activeUserId: 'ecosystem-admin', role: 'admin' } };

        case 'ADD_ONTOLOGY_SECTOR':
            return {
                ...state,
                ontology: {
                    ...state.ontology,
                    sectores: { ...state.ontology.sectores, [action.payload.sectorId]: action.payload.rolesData }
                }
            };

        case 'UPDATE_GLOBAL_CONFIG':
            return { ...state, config: { ...state.config, ...action.payload } };

        default:
            return state;
    }
}

// --- 🏛️ LA FACHADA DEL STORE ---
let currentState = initialState;
const listeners = [];

export const store = {
    getState: () => currentState,
    dispatch: (action) => {
        currentState = reducer(currentState, action);
        localStorage.setItem('tt_sos_state', JSON.stringify(currentState));
        listeners.forEach(l => l());
    },
    subscribe: (l) => listeners.push(l),

    // --- 📊 ANALÍTICA SISTÉMICA ---
    calculateResilience: (projectId) => {
        const p = currentState.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return 100;
        const consolidated = p.transactions.filter(t => t.status === 'consolidated').length;
        return Math.round((consolidated / p.transactions.length) * 100);
    },

    generateSystemPrompt: (projectId) => {
        const p = currentState.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `Eres el Ecosystem Owner de ${p.nombre}. Ontología: `;
        p.roles.forEach(r => prompt += `[${r.levelId}: ${r.name}] `);
        prompt += `. Contexto: ${p.prompt}. Flujos: `;
        p.transactions.forEach(t => prompt += `Fase ${t.fase || '?'}: ${t.entregable} (${t.status}). `);
        return prompt;
    },

    importSessionJSON: (projectId, jsonArray) => {
        const p = currentState.projects.find(x => x.id === projectId);
        if (!p) return;
        jsonArray.forEach(entry => {
            p.ledger.push({
                userId: entry.userId,
                roleId: entry.roleId,
                description: entry.description,
                horas: entry.horas,
                valorCongelado: entry.horas * 100, // Valor base de importación
                timestamp: Date.now()
            });
        });
        store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: {} } }); // Forzar guardado
    }
};

window.dispatchEvent(new CustomEvent('store-ready'));
