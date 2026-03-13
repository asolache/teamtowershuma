// v5/js/views/HelpView.js
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class HelpView {
    constructor() {
        document.title = "Manual de Operaciones | TeamTowers SOS";
    }

    async getHtml() {
        const headerConfig = {
            title: "Centro de Ayuda",
            subtitle: "V10 Stable",
            tagline: "Domina el Exoesqueleto Cognitivo para construir organizaciones soberanas."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; scroll-behavior: smooth; }
                .help-wrapper { max-width: 1100px; margin: 0 auto; padding-bottom: 5rem; }

                /* ROADMAP VISUAL SECTION */
                .roadmap-lux { 
                    background: linear-gradient(135deg, rgba(0, 176, 255, 0.1), rgba(224, 64, 251, 0.1));
                    border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem;
                    margin: 2rem 0 4rem 0; text-align: center; position: relative; overflow: hidden;
                }
                .roadmap-grid { 
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
                    gap: 20px; align-items: start; margin-top: 3rem; position: relative; 
                }
                .roadmap-step { position: relative; z-index: 2; }
                .step-num { 
                    width: 40px; height: 40px; background: white; color: black; 
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 15px auto; font-weight: 900; font-size: 1.2rem;
                    box-shadow: 0 0 20px rgba(255,255,255,0.4);
                }
                .roadmap-step h4 { color: white; margin-bottom: 8px; font-size: 1.1rem; }
                .roadmap-step p { color: #888; font-size: 0.85rem; line-height: 1.4; }

                /* ACORDEÓN DE MÓDULOS */
                .guide-section { margin-bottom: 4rem; }
                .guide-card { 
                    background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); 
                    border-radius: 16px; margin-bottom: 1rem; overflow: hidden; transition: 0.3s;
                }
                .guide-header { 
                    padding: 1.5rem 2rem; display: flex; justify-content: space-between; 
                    align-items: center; cursor: pointer; user-select: none;
                }
                .guide-header:hover { background: rgba(255,255,255,0.05); }
                .guide-header h3 { margin: 0; color: white; font-size: 1.2rem; display: flex; align-items: center; gap: 12px; }
                
                .guide-content { 
                    max-height: 0; opacity: 0; overflow: hidden; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    background: rgba(0,0,0,0.2);
                }
                .guide-content.open { max-height: 800px; opacity: 1; padding: 2rem; border-top: 1px solid #222; }

                /* BLOQUES DE CONOCIMIENTO (APIs & WALLET) */
                .knowledge-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3rem; }
                .k-panel { 
                    background: rgba(0,0,0,0.4); border: 1px solid #333; border-radius: 20px; padding: 2.5rem;
                    display: flex; flex-direction: column; gap: 15px;
                }
                .k-panel h2 { color: white; margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;}
                .k-list { list-style: none; padding: 0; margin: 1rem 0; }
                .k-list li { 
                    margin-bottom: 12px; color: #aaa; font-size: 0.9rem; 
                    display: flex; align-items: center; gap: 10px;
                }
                .k-list li b { color: var(--accent-blue); }
                .btn-help-ext { 
                    background: rgba(255,255,255,0.05); color: white; text-decoration: none; 
                    padding: 10px 15px; border-radius: 8px; text-align: center; font-weight: bold;
                    font-size: 0.8rem; border: 1px solid #444; transition: 0.2s;
                }
                .btn-help-ext:hover { background: white; color: black; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .workspace { padding: 80px 1.5rem 100px 1.5rem; }
                    .knowledge-grid { grid-template-columns: 1fr; }
                    .roadmap-grid { grid-template-columns: 1fr 1fr; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/help')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="help-wrapper">
                        
                        <section class="roadmap-lux">
                            <h2 style="color: white; font-weight: 900; font-size: 2rem; margin:0;">El Ciclo de Valor Soberano</h2>
                            <p style="color: #aaa; margin-top: 10px;">De la idea al Equity Inmutable en 4 pasos.</p>
                            
                            <div class="roadmap-grid">
                                <div class="roadmap-step">
                                    <div class="step-num">1</div>
                                    <h4>DISEÑO VNA</h4>
                                    <p>Mapea nodos y tuberías de valor permanentes.</p>
                                </div>
                                <div class="roadmap-step">
                                    <div class="step-num">2</div>
                                    <h4>LA COLLA</h4>
                                    <p>Asigna talento real a las sillas estructurales.</p>
                                </div>
                                <div class="roadmap-step">
                                    <div class="step-num">3</div>
                                    <h4>EJECUCIÓN</h4>
                                    <p>Abre el grifo de tareas y reporta PoW veraz.</p>
                                </div>
                                <div class="roadmap-step">
                                    <div class="step-num">4</div>
                                    <h4>EQUITY</h4>
                                    <p>El Ledger acuña Slices dinámicos por riesgo.</p>
                                </div>
                            </div>
                        </section>

                        <section class="guide-section">
                            <div class="guide-card">
                                <div class="guide-header" data-target="vna">
                                    <h3><span>🕸️</span> 1. Mapa VNA: Arquitectura de Red</h3>
                                    <span>▼</span>
                                </div>
                                <div class="guide-content" id="content-vna">
                                    <p><b>Qué es:</b> El plano de ingeniería de tu organización. Aquí no defines personas, sino "puestos de actividad" y qué se entregan entre sí.</p>
                                    <p><b>Uso Pro:</b> Usa el Orquestador IA para que diseñe la red por ti basándose en el sector. Una red sana es aquella donde el valor fluye sin saltos jerárquicos bruscos.</p>
                                </div>
                            </div>

                            <div class="guide-card">
                                <div class="guide-header" data-target="colla">
                                    <h3><span>👥</span> 2. La Colla: Gestión de Nodos Humanos</h3>
                                    <span>▼</span>
                                </div>
                                <div class="guide-content" id="content-colla">
                                    <p><b>Qué es:</b> El panel de reclutamiento y asignación. Aquí el talento se conecta con las sillas del mapa.</p>
                                    <p><b>Uso Pro:</b> Busca el equilibrio de los 12 Guardianes. Una red sin un "Cuidador" colapsa por estrés; una sin "Héroe" no ejecuta.</p>
                                </div>
                            </div>

                            <div class="guide-card">
                                <div class="guide-header" data-target="kanban">
                                    <h3><span>📋</span> 3. Kanban & Focus: El Motor PoW</h3>
                                    <span>▼</span>
                                </div>
                                <div class="guide-content" id="content-kanban">
                                    <p><b>Qué es:</b> Donde la teoría se vuelve realidad. El sistema genera Work Orders (pedidos de trabajo) basados en tus tuberías VNA.</p>
                                    <p><b>Uso Pro:</b> Activa el modo <b>Deep Work</b> (Pomodoro). El sistema sella tus horas solo si mantienes el foco, garantizando que el Equity sea justo.</p>
                                </div>
                            </div>
                        </section>

                        <div class="knowledge-grid">
                            <div class="k-panel" style="border-top: 4px solid var(--accent-purple);">
                                <h2>🧠 Combustible IA</h2>
                                <p style="color:#888; font-size:0.9rem;">TeamTowers es un cerebro vacío sin sus conexiones. Necesitas una "API Key".</p>
                                <ul class="k-list">
                                    <li><b>DeepSeek:</b> La más eficiente y económica. Crea cuenta en <i>platform.deepseek.com</i>.</li>
                                    <li><b>OpenAI:</b> El estándar industrial. Consigue tu llave en <i>platform.openai.com</i>.</li>
                                    <li><b>Gemini:</b> Potencia de Google. Usa <i>aistudio.google.com</i>.</li>
                                </ul>
                                <a href="/v5/settings" data-link class="btn-help-ext">CONFIGURAR LLAVES AHORA</a>
                            </div>

                            <div class="k-panel" style="border-top: 4px solid var(--accent-blue);">
                                <h2>🦊 Identidad Web3</h2>
                                <p style="color:#888; font-size:0.9rem;">Para ser dueño de tus Slices, necesitas una billetera digital (Wallet).</p>
                                <ul class="k-list">
                                    <li><b>MetaMask:</b> Descarga la extensión para Chrome o Brave.</li>
                                    <li><b>Custodia:</b> Guarda tu "Frase Semilla" en papel. <b>Nunca</b> la compartas.</li>
                                    <li><b>Firma:</b> Usarás tu Wallet para sellar pactos de socios inmutables.</li>
                                </ul>
                                <a href="https://metamask.io/download/" target="_blank" class="btn-help-ext">DESCARGAR METAMASK</a>
                            </div>
                        </div>

                        <div style="margin-top: 5rem; text-align: center; opacity: 0.5; font-size: 0.8rem;">
                            SOS_KERNEL_STABLE // UNIDAD_DE_CONOCIMIENTO_001
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

        // Lógica del Acordeón Luxury
        document.querySelectorAll('.guide-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(`content-${targetId}`);
                
                const isOpen = content.classList.contains('open');
                
                // Cerrar todos
                document.querySelectorAll('.guide-content').forEach(c => c.classList.remove('open'));
                document.querySelectorAll('.guide-header span').forEach(s => s.style.transform = 'rotate(0deg)');

                if (!isOpen) {
                    content.classList.add('open');
                    header.querySelector('span').style.transform = 'rotate(180deg)';
                }
            });
        });
    }
}
