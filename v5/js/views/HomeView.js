// v5/js/views/HomeView.js
export default class HomeView {
    constructor() {
        document.title = "TeamTowers | El Sistema Operativo para Redes de Valor";
    }

    async getHtml() {
        return `
            <style>
                .landing-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1.5rem 5%; background: rgba(10,10,12,0.8);
                    backdrop-filter: blur(20px); position: fixed; width: 100%; top: 0; left: 0; z-index: 100;
                    border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'Segoe UI', sans-serif;
                }
                .logo { font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 10px; color: white; letter-spacing: -0.5px;}
                .logo span { color: #00b0ff; }
                
                .nav-links { display: flex; gap: 2rem; align-items: center; }
                .nav-links a { color: #888; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: color 0.2s; cursor: pointer; }
                .nav-links a:hover { color: white; }
                
                .hero {
                    min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
                    align-items: center; text-align: center; padding: 120px 20px 60px 20px;
                    background: radial-gradient(circle at center top, rgba(0, 176, 255, 0.1) 0%, #0a0a0c 50%);
                    font-family: 'Segoe UI', sans-serif; position: relative; overflow: hidden;
                }
                
                /* Decoración de fondo */
                .hero::before {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0);
                    background-size: 40px 40px; pointer-events: none; z-index: 0;
                }

                .tagline {
                    background: rgba(0, 230, 118, 0.1); color: #00e676;
                    padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold;
                    border: 1px solid rgba(0, 230, 118, 0.3); margin-bottom: 1.5rem; z-index: 1; letter-spacing: 1px; text-transform: uppercase;
                }
                .hero h1 { font-size: 4.5rem; line-height: 1.1; margin-bottom: 1.5rem; max-width: 900px; color: white; z-index: 1; letter-spacing: -2px;}
                .hero h1 span { background: linear-gradient(45deg, #00b0ff, #e040fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .hero p { font-size: 1.2rem; color: #888; max-width: 600px; margin-bottom: 3rem; z-index: 1; line-height: 1.6;}
                
                .cta-group { display: flex; gap: 1rem; z-index: 1; }
                .btn-primary { background: #00b0ff; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 10px 25px rgba(0, 176, 255, 0.3);}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 176, 255, 0.4); }
                .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-decoration: none; transition: background 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); }

                .features { padding: 5rem 5%; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; background: #0a0a0c; font-family: 'Segoe UI', sans-serif;}
                .feature-card { padding: 2.5rem; transition: transform 0.3s; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; background: rgba(255,255,255,0.02); }
                .feature-card:hover { transform: translateY(-10px); border-color: #00b0ff; background: rgba(255,255,255,0.03); }
                .feature-icon { font-size: 3rem; margin-bottom: 1.5rem; display: inline-block; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);}
                .feature-card h3 { color: white; font-size: 1.4rem; margin-top: 0; margin-bottom: 10px;}
                .feature-card p { color: #888; line-height: 1.6; margin: 0; font-size: 0.95rem;}

                @media (max-width: 768px) {
                    .hero h1 { font-size: 3rem; }
                    .nav-links .hide-on-mobile { display: none; }
                    .cta-group { flex-direction: column; }
                }
            </style>

            <div class="view-container">
                <header class="landing-header">
                    <div class="logo">🗼 <span>TeamTowers</span></div>
                    <nav class="nav-links">
                        <div class="hide-on-mobile" style="display: flex; gap: 2rem;">
                            <a href="/v5/network" data-link>🌐 Explorar DAOs</a>
                            <a href="/v5/profile" data-link>👤 Mi CV (Skills)</a>
                            <a href="/v5/project" data-link>📋 Tracción</a>
                        </div>
                        <a href="/v5/create" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;" data-link>Instanciar Red</a>
                    </nav>
                </header>

                <section class="hero">
                    <div class="tagline">Slicing Pie + VNA + Identidad Web3</div>
                    <h1>No uses software.<br>Construye tu <span>Exoesqueleto Cognitivo.</span></h1>
                    <p>El primer Sistema Operativo que conecta Ontologías de Diseño con Contabilidad de Triple Entrada. Convierte el Deep Work en Equidad Inmutable.</p>
                    
                    <div class="cta-group">
                        <a href="/v5/create" class="btn-primary" data-link>Instanciar Proyecto</a>
                        <a href="/v5/network" class="btn-secondary" data-link>Explorar el Ecosistema</a>
                    </div>
                </section>

                <section class="features" id="filosofia">
                    <div class="feature-card">
                        <div class="feature-icon">🕸️</div>
                        <h3>Value Network Analysis (VNA)</h3>
                        <p>Diseña el "Castell" (la estructura de tu equipo) mapeando flujos de valor tangibles e intangibles antes de ejecutar una sola línea de código.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⏱️</div>
                        <h3>Deep Work Automático</h3>
                        <p>Haz "Pull" de las tareas del mercado teórico a tu estación Pomodoro. Protege tu atención y reporta horas exactas respaldadas por Proof of Work.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚖️</div>
                        <h3>Slicing Pie en Tiempo Real</h3>
                        <p>El fin de las discusiones por el capital. El Kernel traduce tu esfuerzo en Slices usando el valor justo de mercado y el riesgo asumido.</p>
                    </div>
                </section>
            </div>
        `;
    }

    executeViewScript() {
        console.log("🚀 Sistema TeamTowers V5 Iniciado Correctamente.");
    }
}
