// transaction.model.js - Modelo formal de transacción
export class Transaction {
    constructor(data = {}) {
        this.id = data.id || `tx-${Date.now()}`;
        this.name = data.name || '';
        this.project = data.project || '';
        this.role = data.role || '';
        this.user = data.user || '';
        this.uv = data.uv || 0;
        this.realValue = data.realValue || null;
        this.type = data.type || 'tangible'; // tangible / intangible
        this.subtype = data.subtype || '';
        this.description = data.description || '';
        this.date = data.date || new Date().toISOString();
        this.tags = data.tags || [];
    }

    isPending() {
        return this.realValue === null;
    }

    getVariance() {
        if (this.realValue === null) return null;
        return ((this.realValue - this.uv) / this.uv) * 100;
    }

    getAccuracy() {
        if (this.realValue === null) return null;
        return 100 - Math.abs(this.getVariance());
    }

    setRealValue(value, notes = '') {
        this.realValue = value;
        this.realValueDate = new Date().toISOString();
        this.realValueNotes = notes;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            project: this.project,
            role: this.role,
            user: this.user,
            uv: this.uv,
            realValue: this.realValue,
            type: this.type,
            date: this.date
        };
    }
}