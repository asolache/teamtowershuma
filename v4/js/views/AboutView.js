export const AboutView = {
    render: () => {
        return `
            <div class="container container-sm">
                <header class="header-main">
                    <div>
                        <h1 style="color: var(--accent-blue);">📖 TeamTowers SOS: Filosofía y Metodología</h1>
                        <p class="text-muted" style="margin: 0;">Mapeo de Flujo de Valor y Consultoría Aumentada por IA</p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/'">← Volver al Dashboard</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 30px;">
                    
                    <section class="panel">
                        <h3>1. El Propósito del Sistema</h3>
                        <p class="text-muted">TeamTowers System of Systems (SOS) no es un gestor de tareas tradicional. Es una herramienta de diagnóstico organizacional que fusiona la metodología <b>Value Stream Mapping (VSM)</b> con la arquitectura inmutable de un Ledger financiero y la potencia analítica de la Inteligencia Artificial.</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; text-align: center;">
                            <div class="panel-surface" style="padding: 15px 10px;">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">🗺️</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Mapear</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Dibujar el ecosistema real.</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px 10px;">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">💰</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Contabilizar</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Medir el valor inyectado.</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px 10px;">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">📊</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Analizar</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Detectar cuellos de botella.</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px 10px;">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">🤖</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Diagnóstico IA</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Sugerencias de mejora.</div>
                            </div>
                        </div>
                    </section>

                    <section class="panel">
                        <h3>2. La Ontología Unificada (Metáfora del Castell)</h3>
                        <p class="text-muted text-small" style="margin-bottom: 15px;">Toda organización se sostiene sobre órbitas concéntricas de responsabilidad. El sistema clasifica los roles en 5 niveles de impacto financiero e influencia:</p>
                        
                        <div style="display: grid; gap: 10px;">
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-blue);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@anxaneta</div>
                                <div class="text-muted text-small"><b>Dirección / C-Level:</b> CEO, Socios. Toman decisiones estratégicas, definen el rumbo y poseen el mayor multiplicador de valor de rol.</div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-purple);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@aixecador</div>
                                <div class="text-muted text-small"><b>Management / Directores:</b> Project Managers, Directores de área. Traducen la estrategia de la cúspide en planes ejecutables para la base.</div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-red);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@dosos</div>
                                <div class="text-muted text-small"><b>Mandos Medios / Calidad:</b> Team Leads, Auditores, QA. Revisan el flujo. <i>*Un sistema sin auditoría de este nivel sufre caídas drásticas de Resiliencia.</i></div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-green);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@baixos</div>
                                <div class="text-muted text-small"><b>Operativa / Especialistas:</b> Desarrolladores, Técnicos, Creadores. Son el motor productivo; la fuerza bruta que genera los entregables tangibles.</div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--text-muted);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@pinya</div>
                                <div class="text-muted text-small"><b>Soporte / Base:</b> Logística, Administración, Soporte IT. La red estructural masiva que sostiene el peso de todo el ecosistema corporativo.</div>
                            </div>
                        </div>
                    </section>

                    <section class="panel">
                        <h3 style="color: var(--accent-green);">3. Transacciones, Inmutabilidad y Tokenomics</h3>
                        <p class="text-muted text-small" style="margin-bottom: 20px;">Cuando interactúas con el Mapa o el Libro Mayor, estás documentando la topología de la empresa en el tiempo.</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="panel-surface">
                                <h4 class="text-heading" style="margin-top: 0; font-size: 0.95rem;">⚡ Tipos de Flujo y Resiliencia</h4>
                                <ul class="text-muted text-small" style="padding-left: 15px; margin-bottom: 0;">
                                    <li style="margin-bottom: 8px;"><b>Tangible (Continua Azul):</b> Entrega de valor material o contractual.</li>
                                    <li style="margin-bottom: 8px;"><b>Intangible (Violeta):</b> Transferencia de valor relacional no contractual.</li>
                                    <li><b>Resiliencia:</b> Porcentaje vivo. Indica qué tan expuesta está la empresa a la <i>Deuda Técnica</i> por falta de auditoría interna.</li>
                                </ul>
                            </div>
                            <div class="panel-surface">
                                <h4 class="text-heading" style="margin-top: 0; font-size: 0.95rem;">⏱️ Rondas y Multiplicadores</h4>
                                <ul class="text-muted text-small" style="padding-left: 15px; margin-bottom: 0;">
                                    <li style="margin-bottom: 8px;"><b>Hash Inmutable:</b> Toda inyección de valor recibe un código criptográfico congelando su precio en el tiempo.</li>
                                    <li><b>Tokenomics Dinámica:</b> El valor final aportado depende del riesgo asumido. Las aportaciones en "Rondas" tempranas reciben un multiplicador mayor que en fases consolidadas.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="panel" style="border-color: #d29922; background: rgba(210, 153, 34, 0.05);">
                        <h3 style="color: #d29922; display: flex; align-items: center; gap: 10px;">
                            📚 Bibliografía y Referencias Metodológicas
                        </h3>
                        <p class="text-muted text-small" style="margin-bottom: 15px;">La arquitectura de TeamTowers SOS se fundamenta en principios empíricos de diseño organizacional, análisis de redes de valor y economía dinámica de startups.</p>
                        
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            
                            <div class="panel-surface" style="border-left: 4px solid #d29922;">
                                <h4 class="text-heading" style="margin: 0; font-size: 1rem;">Slicing Pie (El Reparto del Pastel)</h4>
                                <div class="text-accent text-small" style="margin-bottom: 8px;">Autor: Mike Moyer</div>
                                <p class="text-muted text-small" style="margin-bottom: 10px;">
                                    <b>Aporte al Sistema:</b> Fundamenta el motor de "Tokenomics" y Rondas de inversión. Establece un modelo matemático para el reparto justo de capital ("Dynamic Equity Split") basado en el riesgo asumido según la madurez de la empresa.
                                </p>
                                <a href="https://slicingpie.com/wp-content/uploads/2016/09/Slicing-Pie-Handbook-FREE-SAMPLE.pdf" target="_blank" class="text-small" style="color: var(--accent-blue); text-decoration: none;">🔗 Leer extracto / Más información</a>
                            </div>

                            <div class="panel-surface" style="border-left: 4px solid var(--accent-purple);">
                                <h4 class="text-heading" style="margin: 0; font-size: 1rem;">Value Network Analysis and value conversion of tangible and intangible assets</h4>
                                <div class="text-accent text-small" style="margin-bottom: 8px;">Autora: Verna Allee (Journal of Intellectual Capital, 2008)</div>
                                <p class="text-muted text-small" style="margin-bottom: 10px;">
                                    <b>Aporte al Sistema:</b> Provee el marco teórico fundacional para el análisis del mapa de ecosistemas. Allee define cómo las organizaciones utilizan "redes de valor" para convertir activos tangibles e intangibles en formas negociables de valor. El sistema hereda de aquí la distinción vital entre transacciones tangibles (contractuales) e intangibles (conocimiento y beneficios no contractuales), así como la designación de los "Roles" como los verdaderos agentes de conversión en la red.
                                </p>
                            </div>

                        </div>
                    </section>

                    <section class="panel" style="border-color: var(--accent-purple); background: linear-gradient(180deg, rgba(163, 113, 247, 0.05) 0%, rgba(13, 17, 23, 0) 100%);">
                        <h3 style="color: var(--accent-purple);">5. El Horizonte: Diagnóstico Aumentado por IA</h3>
                        <p class="text
