// Modelo User - para futura implementación
export class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type || 'human';
    }
}