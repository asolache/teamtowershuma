// selectors.js - Versión global
window.Selectors = {
    getGlobalMetrics: function() {
        const state = window.store.getState();
        const transactions = state.transactions || [];
        
        const projectsWithTx = new Set(transactions.map(t => t.project));
        
        return {
            totalUV: transactions.reduce((sum, t) => sum + (t.uv || 0), 0),
            totalTransactions: transactions.length,
            pendingCount: 0,
            totalProjects: state.projects.length,
            activeProjects: projectsWithTx.size,
            totalUsers: state.users.length,
            activeUsers: new Set(transactions.map(t => t.user)).size
        };
    },
    
    getProjectsWithMetrics: function() {
        const state = window.store.getState();
        return state.projects.map(p => ({
            ...p,
            uv: state.transactions.filter(t => t.project === p.id).reduce((sum, t) => sum + (t.uv || 0), 0),
            transactions: state.transactions.filter(t => t.project === p.id).length
        }));
    },
    
    getTotalUVByProject: function(projectId) {
        const state = window.store.getState();
        return state.transactions
            .filter(t => t.project === projectId)
            .reduce((sum, t) => sum + (t.uv || 0), 0);
    },
    
    getTransactionsByProject: function(projectId) {
        const state = window.store.getState();
        return state.transactions.filter(t => t.project === projectId);
    },
    
    getUsers: function() {
        return window.store.getState().users;
    },
    
    getTopContributors: function(limit = 5) {
        const state = window.store.getState();
        const userUV = {};
        state.transactions.forEach(t => {
            userUV[t.user] = (userUV[t.user] || 0) + (t.uv || 0);
        });
        
        return Object.entries(userUV)
            .map(([user, uv]) => ({ user, uv }))
            .sort((a, b) => b.uv - a.uv)
            .slice(0, limit);
    }
};
// Selectors de skills y reputación (AÑADIR AL FINAL)

// Obtener todos los skills únicos del sistema
getAllSkills: () => {
    const state = window.store.getState();
    const skillsSet = new Set();
    
    state.transactions.forEach(t => {
        const roleData = window.roleTemplates?.casteller?.roles
            .find(r => r.id === t.role);
        roleData?.skills?.forEach(s => skillsSet.add(s));
    });
    
    return Array.from(skillsSet).sort();
},

// Obtener ranking de usuarios por skill específico
getTopUsersBySkill: (skill, limit = 10) => {
    const state = window.store.getState();
    const usersWithSkill = [];
    
    state.users.forEach(user => {
        // Crear usuario como modelo para calcular skills
        const userModel = new User(user);
        userModel.transactions = state.transactions
            .filter(t => t.user === user.id);
        userModel.recalculateSkills();
        
        if (userModel.skills[skill]) {
            usersWithSkill.push({
                user: user.id,
                name: user.name,
                skill: userModel.skills[skill],
                level: userModel.getSkillLevel(userModel.skills[skill])
            });
        }
    });
    
    return usersWithSkill
        .sort((a, b) => b.skill - a.skill)
        .slice(0, limit);
},

// Obtener distribución de skills en un proyecto
getProjectSkillDistribution: (projectId) => {
    const state = window.store.getState();
    const projectTx = state.transactions.filter(t => t.project === projectId);
    const skillMap = {};
    
    projectTx.forEach(t => {
        const user = state.users.find(u => u.id === t.user);
        if (user) {
            const userModel = new User(user);
            userModel.transactions = [t];
            userModel.recalculateSkills();
            
            Object.entries(userModel.skills).forEach(([skill, value]) => {
                if (!skillMap[skill]) {
                    skillMap[skill] = { total: 0, count: 0 };
                }
                skillMap[skill].total += value;
                skillMap[skill].count++;
            });
        }
    });
    
    // Calcular media por skill
    return Object.entries(skillMap).map(([skill, data]) => ({
        skill,
        average: data.total / data.count,
        occurrences: data.count
    })).sort((a, b) => b.average - a.average);
},

// Obtener evolución de reputación de un usuario
getUserReputationHistory: (userId, timeWindow = 30) => {
    const state = window.store.getState();
    const userTx = state.transactions
        .filter(t => t.user === userId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const timeline = [];
    let runningReputation = 0;
    let txCount = 0;
    
    userTx.forEach(t => {
        txCount++;
        // Calcular reputación acumulada (media móvil)
        const skillValues = Object.values(t.skills || {});
        const txReputation = skillValues.length > 0 
            ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length 
            : 0;
        
        runningReputation = (runningReputation * (txCount - 1) + txReputation) / txCount;
        
        timeline.push({
            date: t.date,
            reputation: runningReputation,
            transaction: t.name
        });
    });
    
    return {
        userId,
        current: timeline.length > 0 ? timeline[timeline.length - 1].reputation : 0,
        history: timeline.slice(-timeWindow)
    };
}
// Visualización tipo castell (para mapa de valor)
getCastellVisualization: (projectId) => {
    try {
        const state = window.store.getState();
        const roles = state.roles || [];
        
        const castell = {
            cim: [],
            'pom-de-dalt': [],
            'tronc-alt': [],
            'tronc-mig': [],
            'tronc-baix': [],
            manilles: [],
            folre: [],
            pinya: []
        };
        
        roles.forEach(role => {
            const transactions = state.transactions
                .filter(t => t.role === role.id && t.project === projectId);
            const uvTotal = transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
            
            const roleData = {
                ...role,
                uv: uvTotal,
                transactions: transactions.length,
                users: role.users || []
            };
            
            // Clasificar por nivel
            if (role.level === 'cim') {
                castell.cim.push(roleData);
            } else if (role.level === 'pom-de-dalt') {
                castell['pom-de-dalt'].push(roleData);
            } else if (role.level === 'tronc-alt') {
                castell['tronc-alt'].push(roleData);
            } else if (role.level === 'tronc-mig') {
                castell['tronc-mig'].push(roleData);
            } else if (role.level === 'tronc-baix') {
                castell['tronc-baix'].push(roleData);
            } else if (role.level === 'manilles') {
                castell.manilles.push(roleData);
            } else if (role.level === 'folre') {
                castell.folre.push(roleData);
            } else {
                castell.pinya.push(roleData);
            }
        });
        
        return castell;
    } catch (e) {
        console.error('Error en getCastellVisualization:', e);
        return {
            cim: [], 'pom-de-dalt': [], 'tronc-alt': [], 'tronc-mig': [], 
            'tronc-baix': [], manilles: [], folre: [], pinya: []
        };
    }
},

// Flujo de valor en el tiempo
getValueFlow: (projectId, timeWindow = 30) => {
    try {
        const state = window.store.getState();
        const transactions = state.transactions
            .filter(t => t.project === projectId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const timeline = [];
        const roles = new Set();
        
        transactions.forEach(t => roles.add(t.role));
        
        for (let i = 0; i < timeWindow; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (timeWindow - i - 1));
            const dateStr = date.toISOString().split('T')[0];
            
            const dayTransactions = transactions.filter(t => 
                new Date(t.date).toISOString().split('T')[0] === dateStr
            );
            
            const dayFlow = {};
            Array.from(roles).forEach(role => {
                dayFlow[role] = dayTransactions
                    .filter(t => t.role === role)
                    .reduce((sum, t) => sum + (t.uv || 0), 0);
            });
            
            timeline.push({
                date: dateStr,
                total: dayTransactions.reduce((sum, t) => sum + (t.uv || 0), 0),
                byRole: dayFlow,
                transactions: dayTransactions.length
            });
        }
        
        return {
            projectId,
            timeWindow,
            timeline,
            roles: Array.from(roles)
        };
    } catch (e) {
        console.error('Error en getValueFlow:', e);
        return {
            projectId,
            timeWindow,
            timeline: [],
            roles: []
        };
    }
}