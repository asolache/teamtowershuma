// user.model.js - Modelo de usuario con skills y reputación
// System Prompt: Los usuarios tienen skills derivados de su actividad en proyectos

export class User {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.type = data.type || 'human';
        this.provider = data.provider || null;
        this.roles = data.roles || [];
        this.transactions = data.transactions || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        
        // Skills con reputación (calculados o iniciales)
        this.skills = data.skills || {}; // { "javascript": 0.8, "arquitectura": 0.5 }
        this.reputation = data.reputation || 0;
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.recalculateSkills();
    }

    addRole(role, project, dedication = 1.0) {
        this.roles.push({ 
            role, 
            project, 
            dedication, 
            since: new Date().toISOString() 
        });
    }

    // Calcular skills basados en transacciones y roles
    recalculateSkills() {
        const skillMap = {};
        let totalWeight = 0;

        this.transactions.forEach(t => {
            // Obtener skills del rol desde el template
            const roleData = window.roleTemplates?.casteller?.roles
                .find(r => r.id === t.role);
            
            if (roleData?.skills) {
                roleData.skills.forEach(skill => {
                    skillMap[skill] = (skillMap[skill] || 0) + (t.uv || 1);
                    totalWeight += t.uv || 1;
                });
            }
        });

        // Normalizar skills (0-1)
        if (totalWeight > 0) {
            Object.keys(skillMap).forEach(skill => {
                this.skills[skill] = skillMap[skill] / totalWeight;
            });
        }

        // Reputación general = media de skills
        const skillValues = Object.values(this.skills);
        this.reputation = skillValues.length > 0 
            ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length 
            : 0;
    }

    // Obtener top skills
    getTopSkills(limit = 5) {
        return Object.entries(this.skills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([skill, value]) => ({ 
                skill, 
                value: Math.round(value * 100) / 100,
                level: this.getSkillLevel(value)
            }));
    }

    getSkillLevel(value) {
        if (value >= 0.8) return 'experto';
        if (value >= 0.6) return 'avanzado';
        if (value >= 0.4) return 'intermedio';
        if (value >= 0.2) return 'principiante';
        return 'aprendiz';
    }

    getTotalUV() {
        return this.transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
    }

    getTransactionCount() {
        return this.transactions.length;
    }

    getPendingCount() {
        return this.transactions.filter(t => !t.realValue).length;
    }

    getRoles() {
        return [...new Set(this.transactions.map(t => t.role))];
    }

    getProjects() {
        return [...new Set(this.transactions.map(t => t.project))];
    }

    getActivityByProject() {
        const byProject = {};
        this.transactions.forEach(t => {
            if (!byProject[t.project]) {
                byProject[t.project] = { uv: 0, count: 0 };
            }
            byProject[t.project].uv += t.uv || 0;
            byProject[t.project].count++;
        });
        return byProject;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            provider: this.provider,
            roles: this.roles,
            skills: this.skills,
            reputation: this.reputation
        };
    }
}