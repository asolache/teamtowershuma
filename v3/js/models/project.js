// Modelo Project - para futura implementación
export class Project {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.sector = data.sector;
        this.uv = data.uv || 0;
    }
}