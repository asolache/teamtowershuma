// Modelo Role - para futura implementación
export class Role {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.multiplier = data.multiplier || 1.0;
        this.color = data.color || '#64748b';
    }
}