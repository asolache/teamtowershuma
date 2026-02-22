// role.model.js - Modelo formal de rol
export class Role {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.multiplier = data.multiplier || 1.0;
        this.color = data.color || '#64748b';
        this.level = data.level || 'quart';
        this.skills = data.skills || [];
        this.transactions = data.transactions || [];
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    getTotalUV() {
        return this.transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
    }

    getTransactionCount() {
        return this.transactions.length;
    }

    getAverageUV() {
        return this.transactions.length ? this.getTotalUV() / this.transactions.length : 0;
    }

    getTopUsers(limit = 5) {
        const userUV = {};
        this.transactions.forEach(t => {
            userUV[t.user] = (userUV[t.user] || 0) + (t.uv || 0);
        });
        
        return Object.entries(userUV)
            .map(([user, uv]) => ({ user, uv }))
            .sort((a, b) => b.uv - a.uv)
            .slice(0, limit);
    }

    getProjects() {
        return [...new Set(this.transactions.map(t => t.project))];
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            multiplier: this.multiplier,
            level: this.level,
            skills: this.skills
        };
    }
}