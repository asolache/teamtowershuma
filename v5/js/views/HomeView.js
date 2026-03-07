// v5/js/views/HomeView.js

export default class HomeView {
    constructor() {
        // Título que se mostrará en la pestaña del navegador
        document.title = "TeamTowers | El Sistema Operativo para Creadores";
    }

    async getHtml() {
        return `
            <style>
                /* Estilos específicos de esta vista (Scoped) */
                .landing-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1.5rem 5%; background: rgba(10,10,12,0.8);
                    backdrop-filter: blur(20px); position: fixed; width: 100%; top: 0; z-index: 100;
                    border-bottom: 1px solid var(--glass-border);
                }
                .logo { font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
                .logo span { color: var(--accent-blue); }
                .nav-links { display: flex; gap: 2rem; }
                .nav-links a { color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
                .nav-links a:hover { color: var(--text-main); }
                
                .hero {
                    height: 100vh; display: flex; flex-direction: column; justify-content: center;
                    align-items: center; text-align: center; padding: 0 20px;
                }
                .tagline {
                    background: rgba(0, 230, 118, 0.1); color: var(--accent-green);
                    padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700;
                    border: 1px solid rgba(0, 230, 118, 0.3); margin-bottom: 1.5rem;
                }
                .hero h1 { font-size: 4.5rem; line-height: 1.1; margin-bottom: 1.5rem; max-width: 900px; }
                .hero h1 span { background: -webkit-linear-gradient(45deg, var(--accent-blue), var(--accent-green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .hero p { font-size: 1.2rem; color: var(--text-muted); max-width: 600px; margin-bottom: 2.5rem; }
                
                .features { padding: 5rem 5%; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
                .feature-card { padding: 2.5rem; transition: transform 0.3s; }
                .feature-card:hover { transform: translateY(-10px); border-color: var(--accent-blue); }
                .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
            </style>

            <div class="view-container">
                <header class="landing-header">
                    <div class="logo">🗼 <span>TeamTowers</span></div>
                    <nav class="nav-links hide-on-mobile">
                        <a href="#filosofia">Filosofía</a>
                        <a href="#metodologias">Aprender Haciendo</a>
                        <a href="/eco" data-link>Ecosistemas</a>
                    </nav>
                    <a href="/create" class="btn btn-primary" data-link>Entrar a la Red</a>
                </header>

                <section class="hero">
                    <div class="tagline">Slicing Pie + GTD + Inteligencia Artificial</div>
                    <h1>No uses software.<br>Construye tu <span>Exoesqueleto Cognitivo.</span></h1>
                    <p>TeamTowers es el primer sistema operativo diseñado para equipos que quieren repartir el valor de forma justa (Slicing Pie), trabajar profundo (Pomodoro) y organizarse orgánicamente (Ontologías DAO).</p>
                    
                    <a href="/create" class="btn btn-primary" style="font-size: 1.2rem; padding: 1rem 2rem;" data-link>Inicia un Proyecto IA</a>
                </section>

                <section class="features">
                    <div class="glass-panel feature-card">
                        <div class="feature-icon">🥧</div>
                        <h3>Slicing The Pie Automático</h3>
                        <p>Aprende a valorar el trabajo. El sistema calcula automáticamente el Equity basado en horas, roles y valor de mercado (FMV) inyectándolo en un Ledger Inmutable.</p>
                    </div>
                    <div class="glass-panel feature-card">
                        <div class="feature-icon">🧠</div>
                        <h3>Ontologías Dinámicas IA</h3>
                        <p>Dile a la IA qué quieres lograr. Ella generará los 5 roles exactos (del Anxaneta al Pinya) con sus responsabilidades y entregables estándar listos para ejecutar.</p>
                    </div>
                    <div class="glass-panel feature-card">
                        <div class="feature-icon">⏱️</div>
                        <h3>Pomodoro y GTD</h3>
                        <p>Aprende a enfocarte. Convierte el tiempo de pensar y crear prompts en "Trabajo de Alto Valor". El reloj integrado contabiliza tu Deep Work.</p>
                    </div>
                </section>
            </div>
        `;
    }

    // Este método se ejecuta justo después de que el HTML se inyecta en el DOM
    executeViewScript() {
        console.log("🚀 HomeView cargada correctamente. Sistema Base Operativo.");
        // Aquí podríamos añadir animaciones de scroll o lógicas de la landing page.
    }
}
