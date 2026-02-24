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
                                <div class="text-muted text-small"><b>Dirección / C-Level:</b> CEO, Socios. Toman decisiones estratégicas, definen el rumbo y poseen el mayor multiplicador de valor. Se sitúan en el centro de la órbita.</div>
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
                        <h3 style="color: var(--accent-green);">3. Transacciones, Inmutabilidad y Resiliencia</h3>
                        <p class="text-muted text-small" style="margin-bottom: 20px;">Cuando interactúas con el Mapa o el Libro Mayor, estás documentando la topología de la empresa.</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="panel-surface">
                                <h4 class="text-heading" style="margin-top: 0; font-size: 0.95rem;">⚡ Tipos de Flujo</h4>
                                <ul class="text-muted text-small" style="padding-left: 15px; margin-bottom: 0;">
                                    <li style="margin-bottom: 8px;"><b>Tangible (Continua Azul):</b> Entrega de valor material (código, presupuesto, reportes).</li>
                                    <li><b>Intangible (Discontinua Violeta):</b> Transferencia de valor relacional (mentoría, validación, feedback).</li>
                                </ul>
                            </div>
                            <div class="panel-surface">
                                <h4 class="text-heading" style="margin-top: 0; font-size: 0.95rem;">🛡️ El Ledger y la Salud</h4>
                                <ul class="text-muted text-small" style="padding-left: 15px; margin-bottom: 0;">
                                    <li style="margin-bottom: 8px;"><b>Hash Inmutable:</b> Toda inyección de valor recibe un código criptográfico congelando el precio/hora en el tiempo.</li>
                                    <li><b>Resiliencia:</b> Porcentaje vivo. Indica qué tan expuesta está la empresa a la <i>Deuda Técnica</i> por falta de auditoría o revisión interna.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="panel" style="border-color: var(--accent-purple); background: linear-gradient(180deg, rgba(163, 113, 247, 0.05) 0%, rgba(13, 17, 23, 0) 100%);">
                        <h3 style="color: var(--accent-purple);">4. El Horizonte: Diagnóstico Aumentado por IA</h3>
                        <p class="text-muted">El objetivo final de documentar un ecosistema en TeamTowers SOS no es solo llevar la contabilidad, sino preparar a la organización para la <b>Consultoría Algorítmica</b>.</p>
                        
                        <ul class="text-muted text-small" style="padding-left: 20px; line-height: 1.6;">
                            <li style="margin-bottom: 10px;"><b>El Prompt Maestro (Espejo de Consciencia):</b> El sistema compila en tiempo real tu Ontología y la secuencia de Flujos en un contexto estructurado que cualquier <i>Large Language Model (LLM)</i> puede entender.</li>
                            <li style="margin-bottom: 10px;"><b>Detección de Cuellos de Botella:</b> En fases futuras, la IA analizará el Libro Mayor para detectar qué roles están sobrecargados (generando demasiado valor sin soporte) y sugerirá redistribuciones en la órbita de especialistas.</li>
                            <li style="margin-bottom: 10px;"><b>Optimización de Flujo:</b> A partir del mapa secuenciado (Fase 1, Fase 2...), la IA propondrá atajos metodológicos, identificará redundancias en flujos tangibles y advertirá de desconexiones entre la Dirección (<code>@anxaneta</code>) y la Operativa (<code>@baixos</code>).</li>
                        </ul>
                    </section>

                </div>
            </div>
        `;
    }
};
