// v5/js/views/HelpView.js
import { Sidebar } from '../components/Sidebar.js';

export default class HelpView {
    constructor() {
        document.title = "Manual del Exoesqueleto | TeamTowers SOS";
    }

    async getHtml() {
        // Datos del Manual (Fácilmente actualizables aquí)
        const guias = [
            {
                id: 'vna',
                icono: '🕸️',
                titulo: '1. Equilibri: Mapa VNA (Value Network Analysis)',
                que: 'Es el lienzo donde diseñas la arquitectura de tu DAO o proyecto. Defines los Nodos (Roles) y los Flujos (Entregables) entre ellos.',
                por_que: 'Porque "força sin equilibri" es caos. Si el trabajo no está mapeado estratégicamente antes de ejecutarse, se desperdicia energía y capital.',
                como: 'Entra al Mapa, usa el Orquestador IA para generar una estructura base, o añade nodos manualmente. Conecta un nodo con otro para crear transacciones teóricas.',
                cuando: 'En la fase de concepción (Génesis) o cuando la organización necesita pivotar y reestructurarse.',
                donde: 'Es la primera capa del sistema. Alimenta al Kanban y a la Colla.'
            },
            {
                id: 'colla',
                icono: '👥',
                titulo: '2. Seny: La Colla (Talento e Identidad)',
                que: 'Es el panel de gestión de talento donde asignas Nodos Humanos (personas) a las Sillas (roles) del mapa VNA.',
                por_que: 'Porque las personas no son recursos, son identidades fractales. El sistema usa Ikigai y arquetipos (Los 12 Guardianes) para asegurar que la persona adecuada ocupe el lugar correcto.',
                como: 'Invita miembros. El Motor de Matching Semántico leerá sus perfiles y te sugerirá qué porcentaje de afinidad tienen con cada silla vacía. Haz clic en asignar.',
                cuando: 'Después de tener el Mapa VNA diseñado y siempre que necesites expandir el equipo (Onboarding).',
                donde: 'Conecta el talento del exterior con la estructura interna del Castell.'
            },
            {
                id: 'traccion',
                icono: '📋',
                titulo: '3. Força: Kanban de Tracción & Deep Work',
                que: 'Es el motor operativo. Un sistema "Pull" donde las tareas teóricas del mapa se convierten en trabajo real.',
                por_que: 'Para eliminar el micro-management. Los usuarios asumen responsabilidad proactivamente y usan la técnica Pomodoro para proteger su atención (Deep Work).',
                como: '1. Haz PULL de una tarea (debes tener la silla asignada). 2. Ve al Focus Mode (Reloj Pomodoro). 3. Ejecuta y envía tu Prueba de Trabajo (Proof of Work) con las horas reales.',
                cuando: 'Diariamente. Es el lugar donde la Colla suda la camiseta para generar valor.',
                donde: 'Es el puente entre el diseño (VNA) y la recompensa (Ledger).'
            },
            {
                id: 'ledger',
                icono: '⚖️',
                titulo: '4. Valor: Ledger Equity (Slicing Pie)',
                que: 'La tabla de capitalización dinámica y el registro criptográfico de triple entrada.',
                por_que: 'Para repartir el Equity de forma matemáticamente perfecta. Si aportas valor y asumes riesgo, ganas Slices inmutables. Se acabó discutir por las acciones.',
                como: 'El Auditor (o Project Owner) revisa la Prueba de Trabajo en el Kanban y le da a "Aprobar". El Kernel calcula (Horas x FMV x Riesgo) y acuña los Slices en un Hash SHA-256 inmutable.',
                cuando: 'En las revisiones de ciclo (Sprints/Auditorías) y al sellar el Snapshot en la Permaweb para inversores.',
                donde: 'Es el destino final del valor generado. La caja fuerte de la DAO.'
            }
        ];

        let accordionHtml = guias.map(g => `
            <div class="guide-card">
                <div class="guide-header" data-target="${g.id}">
                    <div class="guide-title"><span style="font-size: 1.5rem; margin-right: 10px;">${g.icono}</span> ${g.titulo}</div>
                    <div class="guide-toggle">▼</div>
                </div>
                <div class="guide-content" id="content-${g.id}">
                    <div class="guide-grid">
                        <div class="w-block"><strong>¿QUÉ ES?</strong><p>${g.que}</p></div>
                        <div class="w-block"><strong>¿POR QUÉ?</strong><p>${g.por_que}</p></div>
                        <div class="w-block"><strong>¿CÓMO SE USA?</strong><p>${g.como}</p></div>
                        <div class="w-block"><strong>¿CUÁNDO?</strong><p>${g.cuando}</p></div>
                        <div class="w-block" style="grid-column: 1 / -1; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px; margin-top: 5px;">
                            <strong style="color: var(--accent-blue);">¿DÓNDE ENCAJA EN EL ECOSISTEMA?</strong><p>${g.donde}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }
                .help-container { max-width: 900px; width: 100%; }
                
                .help-header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid var(--glass-border); }
                .help-header h1 { font-size: 2.8rem; color: white; margin: 0 0 10px 0; letter-spacing: -1px; }
                .help-header p { color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto; line-height: 1.5; }

                .guide-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); margin-bottom: 1rem; overflow: hidden; transition: border-color 0.2s;}
                .guide-card:hover { border-color: #555; }
                
                .guide-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: rgba(255,255,255,0.01); user-select: none; }
                .guide-header:hover { background: rgba(0, 176, 255, 0.05); }
                .guide-title { font-size: 1.2rem; font-weight: bold; color: white; display: flex; align-items: center;}
                .guide-toggle { color: #888; transition: transform 0.3s; font-size: 0.8rem; }
                
                .guide-content { padding: 0 1.5rem; max-height: 0; overflow: hidden; opacity: 0; transition: all 0.3s ease-in-out; background: rgba(0,0,0,0.3); }
                .guide-content.open { padding: 1.5rem; max-height: 1000px; opacity: 1; border-top: 1px solid var(--glass-border); }

                .guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .w-block strong { display: block; color: var(--accent-orange); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; font-family: var(--font-mono);}
                .w-block p { color: #ccc; font-size: 0.95rem; line-height: 1.6; margin: 0; }

                @media (max-width: 768px) {
                    .guide-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .workspace { padding: 1.5rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/help')}
                
                <main class="workspace">
                    <div class="help-container">
                        <div class="help-header">
                            <div style="font-size: 3.5rem; margin-bottom: 10px;">📖</div>
                            <h1>Manual del Exoesqueleto</h1>
                            <p>Comprende el "Qué, Por Qué y Cómo" de cada módulo de TeamTowers para dominar la Soberanía Organizacional.</p>
                        </div>

                        <div class="accordion-container">
                            ${accordionHtml}
                        </div>
                        
                        <div style="margin-top: 3rem; text-align: center; padding: 2rem; background: rgba(0, 176, 255, 0.05); border: 1px dashed rgba(0, 176, 255, 0.3); border-radius: 12px;">
                            <h3 style="color: var(--accent-blue); margin-top: 0;">¿Necesitas soporte humano?</h3>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">Contacta con los Master Architects en la red principal para mentorías sobre Value Network Analysis y Tokenomics.</p>
                            <a href="mailto:founder@teamtowers.com" style="color: white; font-weight: bold; text-decoration: none; border-bottom: 1px solid var(--accent-blue); padding-bottom: 2px;">founder@teamtowers.com</a>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        // Lógica del Acordeón
        document.querySelectorAll('.guide-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(`content-${targetId}`);
                const toggleBtn = header.querySelector('.guide-toggle');

                // Si está abierto, lo cerramos
                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    toggleBtn.style.transform = 'rotate(0deg)';
                } else {
                    // Opcional: Cerrar los demás al abrir uno (estilo acordeón estricto)
                    /*
                    document.querySelectorAll('.guide-content').forEach(c => c.classList.remove('open'));
                    document.querySelectorAll('.guide-toggle').forEach(t => t.style.transform = 'rotate(0deg)');
                    */
                    
                    // Abrimos el seleccionado
                    content.classList.add('open');
                    toggleBtn.style.transform = 'rotate(180deg)';
                }
            });
        });
    }
}
