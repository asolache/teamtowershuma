// /v3/js/core/event-bus.js
// Sistema de eventos desacoplado (versión ES6 Modules + Global fallback)

class TTEventBus {
    constructor() {
        this.events = {};
    }

    // Suscribirse a un evento
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    }

    // Emitir evento
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    // Una sola vez
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    // Eliminar listener
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    // Limpiar eventos
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}

// 1. Creamos la instancia única (Singleton)
const EventBus = new TTEventBus();

// 2. Exportación ES6 (Para import { EventBus } en tests y nuevos módulos)
export { EventBus };

// 3. Fallback Global (Para no romper componentes antiguos)
window.EventBus = EventBus;

console.log('✅ event-bus.js cargado (ES6 Ready)');
