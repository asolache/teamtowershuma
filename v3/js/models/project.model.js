// project.model.js - Modelo formal de proyecto
export class Project {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.sector = data.sector || 'software';
        this.uv = data.uv || 0;
        this.transactions = data.transactions || [];
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.uv += transaction.uv || 0;
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

    getCompletionRate() {
        const completed = this.transactions.filter(t => t.realValue).length;
        return this.transactions.length ? (completed / this.transactions.length) * 100 : 0;
    }

    getRoleDistribution() {
        const roles = {};
        this.transactions.forEach(t => {
            roles[t.role] = (roles[t.role] || 0) + 1;
        });
        return roles;
    }

    getUserDistribution() {
        const users = {};
        this.transactions.forEach(t => {
            users[t.user] = (users[t.user] || 0) + 1;
        });
        return users;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            sector: this.sector,
            uv: this.uv,
            transactions: this.transactions.length,
            createdAt: this.createdAt
        };
    }
}