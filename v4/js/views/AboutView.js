export const AboutView = {
    render: () => {
        return `
            <div class="container container-sm">
                <header class="header-main">
                    <div>
                        <h1 style="color: var(--accent-blue);">📖 TeamTowers SOS: Filosofía y Metodología</h1>
                        <p class="text-muted" style="margin: 0;">Mapeo de Flujo de Valor, Slicing Pie y Consultoría Aumentada por IA</p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/'">← Volver al Dashboard</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 30px;">
                    
                    <section class="panel">
                        <h3>1. El Propósito del Sistema</h3>
                        <p class="text-muted">TeamTowers System of Systems (SOS) no es un gestor de tareas tradicional. Es una herramienta de diagnóstico organizacional que fusiona la metodología <b>Value Network Analysis (VNA)</b> para mapear la empresa, la arquitectura inmutable de un Ledger financiero basado en <b>Slicing Pie</b> para el reparto justo de valor, y la potencia analítica de la Inteligencia Artificial.</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 20px; text-align: center;">
                            <div class="panel-surface" style="padding: 15px 10px; border-top: 3px solid var(--accent-purple);">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">🗺️</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Mapear (VNA)</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Diseñar roles y flujos teóricos del ecosistema.</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px 10px; border-top: 3px solid var(--accent-green);">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">💰</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Slicing Pie</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Registrar horas reales y calcular el equity justo.</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px 10px; border-top: 3px solid var(--accent-gold);">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">📖</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Ledger (Historial)</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Libro mayor inmutable de todas las aportaciones.</div>
                            </div>
                            <div class="panel-surface" style="padding: 15px 10px; border-top: 3px solid var(--accent-blue);">
                                <div style="font-size: 1.5rem; margin-bottom: 5px;">🤖</div>
                                <b class="text-accent" style="font-size: 0.9rem;">Diagnóstico IA</b>
                                <div class="text-muted text-small" style="margin-top: 5px;">Auditoría del cruce entre el mapa y la realidad.</div>
                            </div>
                        </div>
                    </section>

                    <section class="panel">
                        <h3>2. La Ontología Unificada (Metáfora del Castell)</h3>
                        <p class="text-muted text-small" style="margin-bottom: 15px;">Toda organización se sostiene sobre órbitas concéntricas de responsabilidad. El sistema clasifica los roles en 5 niveles de impacto financiero e influencia:</p>
                        
                        <div style="display: grid; gap: 10px;">
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-blue);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@anxaneta</div>
                                <div class="text-muted text-small"><b>Dirección / C-Level (3.0x):</b> CEO, Socios. Toman decisiones estratégicas, definen el rumbo y poseen el mayor multiplicador de valor de rol.</div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-purple);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@aixecador</div>
                                <div class="text-muted text-small"><b>Management / Directores (2.5x):</b> Project Managers, Directores de área. Traducen la estrategia de la cúspide en planes ejecutables para la base.</div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-red);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@dosos</div>
                                <div class="text-muted text-small"><b>Mandos Medios / Calidad (2.0x):</b> Team Leads, Auditores, QA. Revisan el flujo. <i>*Un sistema sin auditoría de este nivel sufre caídas drásticas de Resiliencia.</i></div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--accent-green);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@baixos</div>
                                <div class="text-muted text-small"><b>Operativa / Especialistas (1.5x):</b> Desarrolladores, Técnicos, Creadores. Son el motor productivo; la fuerza bruta que genera los entregables tangibles.</div>
                            </div>
                            <div class="panel-surface" style="display: flex; align-items: center; gap: 15px; border-left: 3px solid var(--text-muted);">
                                <div style="width: 100px; font-weight: bold; color: var(--text-heading);">@pinya</div>
                                <div class="text-muted text-small"><b>Soporte / Base (1.0x):</b> Logística, Administración, Soporte IT. La red estructural masiva que sostiene el peso de todo el ecosistema corporativo.</div>
                            </div>
                        </div>
                    </section>

                    <section class="panel" style="border-color: var(--accent-green); background: rgba(35, 134, 54, 0.03);">
                        <h3 style="color: var(--accent-green);">3. El Paradigma: Usuarios vs. Roles (Slicing Pie)</h3>
                        <p class="text-muted text-small" style="margin-bottom: 15px;">A partir de la v4.5, TeamTowers separa estrictamente la <b>Teoría (Mapa de Valor)</b> de la <b>Práctica (Contabilidad)</b>.</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="panel-surface">
                                <h4 class="text-heading" style="margin-top: 0; font-size: 0.95rem;">👤 Los Usuarios (Personas)</h4>
                                <p class="text-muted text-small">Son los contribuyentes reales de carne y hueso (ej. Laura). Un usuario puede llevar varios "sombreros" o roles dentro de la empresa. <b>Solo los usuarios ganan <i>Equity</i> (Acciones).</b></p>
                            </div>
                            <div class="panel-surface">
                                <h4 class="text-heading" style="margin-top: 0; font-size: 0.95rem;">⚙️ Los Roles (Tuberías)</h4>
                                <p class="text-muted text-small">Son funciones abstractas (ej. Lead Dev, QA Tester). En el <i>Ledger</i>, Laura debe declarar "actuando como Lead Dev, entrego esto a QA". El valor financiero se calcula leyendo el nivel de riesgo del Rol que ejerció.</p>
                            </div>
                        </div>
                    </section>

                    <section class="panel" style="border-color: #d29922; background: rgba(210, 153, 34, 0.05);">
                        <h3 style="color: #d29922; display: flex; align-items: center; gap: 10px;">
                            📚 Bibliografía y Referencias Metodológicas
                        </h3>
