// Modelo Transaction - para futura implementación
export class Transaction {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.project = data.project;
        this.role = data.role;
        this.user = data.user;
        this.uv = data.uv || 0;
        this.date = data.date || new Date().toISOString();
    }
}