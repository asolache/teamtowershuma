// v8/js/views/HelpView.js
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class HelpView {
    constructor() {
        document.title = "Help & Docs | TeamTowers V8";
    }

    async getHtml() {
        const headerConfig = {
            title: "Documentación SOS",
            subtitle: "Help Center",
            tagline: "Manual de operador del ecosistema fractal."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); }
                .help-workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; scroll-behavior: smooth; }
                .help-container { max-width: 900px; margin: 0 auto; padding-bottom: 5rem; }
                
                .faq-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; margin-bottom: 1.5rem; backdrop-filter: blur(10px); }
                .faq-card h3 { color: var(--accent-blue); margin-top: 0; font-size: 1.3rem; margin-bottom: 10px; }
                .faq-card p { color: #aaa; line-height: 1.6; font-size: 0.95rem; margin: 0; }
                
                @media (max-width: 768px) {
                    .help-workspace { padding: 80px 1.5rem 100px 1.5rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/help')}
                
                <main class="help-workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="help-container">
                        <div class="faq-card">
                            <h3>¿Cómo creo un nuevo proyecto o DAO?</h3>
                            <p>Ve a <b>Settings > Gobernanza</b> y asegúrate de que el "Modo de Creación" está abierto. Luego, puedes usar el botón "+" en la barra lateral o navegar a <code>/v8/create</code> para iniciar el instanciador de IA.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>¿Qué diferencia hay entre la Red Visual y el Arquitecto?</h3>
                            <p>En el <b>Mapa VNA</b>, la pestaña "Red Visual" es de solo lectura y te permite simular el flujo (con la magia de IA). La pestaña "Arquitecto" te permite trazar tuberías haciendo clic entre nodos.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>No veo las tareas en mi Kanban</h3>
                            <p>El Kanban funciona bajo la metodología PULL. Si no ves tareas, asegúrate de no tener activo el filtro "Solo mis tareas", o ve al Mapa VNA y asegúrate de que existen "Tuberías" (flujos) conectadas a tu rol.</p>
                        </div>
                        
                        <div class="faq-card">
                            <h3>¿Cómo funcionan los Slices?</h3>
                            <p>Los Slices son tokens matemáticos que representan tu % de propiedad del proyecto. Se minan automáticamente cuando reportas horas de trabajo en el <b>Focus Mode</b> y el Project Owner las aprueba.</p>
                        </div>
                    </div>
                </main>

                ${BottomNav.getHtml('/help')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
    }
}
