export const AboutView = {
    render: () => {
        return `
            <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: sans-serif; line-height: 1.6; color: #c9d1d9;">
                
                <header style="border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <button onclick="location.hash='#/'" style="background:transparent; border:1px solid #30363d; color:#58a6ff; padding:8px 15px; border-radius:6px; cursor:pointer; margin-bottom: 20px;">← Volver al Dashboard</button>
                    <h1 style="color: #f0f6fc; font-size: 2.5rem; margin: 0;">TeamTowers SOS <span style="color: #58a6ff;">v4.2</span></h1>
                    <p style="color: #8b949e; font-size: 1.1rem; margin-top: 5px;">Sistema Operativo Social basado en Redes de Valor</p>
                </header>

                <section style="margin-bottom: 40px;">
                    <h2 style="color: #f0f6fc; border-left: 4px solid #58a6ff; padding-left: 10px;">Nuestra Visión</h2>
                    <p>Redefinir el trabajo colaborativo en la economía digital. Creemos en un mundo donde <strong>ningún esfuerzo quede invisible</strong> y donde la gestión de proyectos pase de ser una simple "lista de tareas" a un ecosistema vivo de flujos de valor. Si el valor fluye, el equipo prospera.</p>
                </section>

                <section style="margin-bottom: 40px;">
                    <h2 style="color: #f0f6fc; border-left: 4px solid #238636; padding-left: 10px;">Nuestra Misión</h2>
                    <p>Proveer a equipos de alto rendimiento, DAOs y gremios de una arquitectura de software (El <strong>Social Operating System - SOS</strong>) que visualice, cuantifique y proteja la integridad de su trabajo conjunto.</p>
                    <p>Utilizamos el <strong>Value Network Analysis (VNA)</strong> para mapear los flujos de capital tangible e intangible, y nos inspiramos en la resiliencia de los <em>Castells</em> catalanes: sin una base sólida (Pinya/Baixos) y un refinamiento constante (Dosos), la estrategia (Anxaneta) se derrumba.</p>
                </section>

                <section style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px; margin-bottom: 40px;">
                    <h2 style="color: #f0f6fc; margin-top: 0;">Objetivos Core del Sistema</h2>
                    <ul style="color: #8b949e; padding-left: 20px; margin-bottom: 0;">
                        <li style="margin-bottom: 15px;"><strong style="color: #c9d1d9;">Meritocracia Transparente:</strong> Calcular liquidaciones económicas en tiempo real basadas en parámetros de mercado objetivos (multiplicador de rol × hora), eliminando la fricción salarial.</li>
                        <li style="margin-bottom: 15px;"><strong style="color: #c9d1d9;">Visualización VNA:</strong> Transformar la información plana en grafos de red donde el valor se ve fluir y crecer de manera orgánica (nodos dinámicos).</li>
                        <li style="margin-bottom: 15px;"><strong style="color: #c9d1d9;">Resiliencia Automatizada:</strong> Implementar mecanismos de seguridad (Circuit Breakers y Watchdogs) que detecten la "deuda técnica" y pausen el sistema si la proporción de auditoría/revisión cae por debajo de niveles críticos.</li>
                        <li><strong style="color: #c9d1d9;">Adaptabilidad Sectorial:</strong> Mantener un <em>Kernel</em> capaz de permutar su ontología para gestionar desde despliegues Web3 hasta proyectos de ingeniería civil o agencias de marketing.</li>
                    </ul>
                </section>

                <footer style="text-align: center; color: #484f58; font-size: 0.85rem; border-top: 1px solid #30363d; padding-top: 20px;">
                    SOS_ENGINE_V4.2 // ARCHITECTURE BY TEAMTOWERS HUMA
                </footer>
            </div>
        `;
    }
};
