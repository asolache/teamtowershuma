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
                    price: 90, 
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
                        price: 45, // Mantenemos herencia para compatibilidad de tests
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
                    if (!tx) return p; 
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
            const project = state.projects.find(proj => proj.id === action.payload.projectId);
            
            // 🔥 CORRECCIÓN SEGURIDAD: Lanzar error si ya existe en el proyecto local
            if (project && project.usuarios.find(u => u.id === targetId)) {
                throw new Error("ID Duplicado");
            }
            
            const userExists = state.globalUsers.find(u => u.id === targetId);
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

    // 🔥 --- ANALÍTICA SISTÉMICA ACTUALIZADA (VITALIDAD PONDERADA) ---
    calculateResilience: (projectId) => {
        const p = currentState.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return 100;
        
        // Asignamos pesos a cada estado para que la salud no sea 0 si hay intención
        const weights = {
            consolidated: 1.0,
            reported: 0.7,
            pinged: 0.3,
            theoretical: 0.1
        };
        
        const totalVitality = p.transactions.reduce((acc, tx) => acc + (weights[tx.status] || 0), 0);
        const health = Math.round((totalVitality / p.transactions.length) * 100);
        
        return Math.min(100, health);
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
                valorCongelado: entry.horas * 100,
                timestamp: Date.now()
            });
        });
        store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: {} } }); 
    },

    // 💰 --- NUEVO: CÁLCULO DE LA COSECHA (TOKENOMICS) ---
    calculateHarvest: (projectId, totalValue) => {
        const p = currentState.projects.find(x => x.id === projectId);
        if (!p || !p.ledger || p.ledger.length === 0) return [];

        const totalSlices = p.ledger.reduce((acc, entry) => acc + entry.valorCongelado, 0);
        
        // Agrupamos los slices por usuario
        const userSlices = p.ledger.reduce((acc, entry) => {
            acc[entry.userId] = (acc[entry.userId] || 0) + entry.valorCongelado;
            return acc;
        }, {});

        // Convertimos a array, calculamos porcentaje y valor económico
        return Object.entries(userSlices).map(([userId, slices]) => {
            const percentage = totalSlices > 0 ? (slices / totalSlices) : 0;
            return {
                userId,
                slices,
                percentage: (percentage * 100).toFixed(2) + '%',
                financialValue: (percentage * totalValue).toLocaleString() + '€'
            };
        }).sort((a, b) => b.slices - a.slices);
    }
};

window.dispatchEvent(new CustomEvent('store-ready'));
