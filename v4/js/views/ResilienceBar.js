/**
 * Componente: Termómetro de Resiliencia SOS
 */
export const ResilienceBar = {
    render: (salud, alerts) => {
        // Lógica de color según salud
        let color = "#238636"; // Verde (Sólido)
        if (salud < 70) color = "#d29922"; // Naranja (Fatiga)
        if (salud < 30) color = "#f85149"; // Rojo (Bloqueo)

        const alertItems = alerts.map(a => `
            <div style="font-size: 0.7rem; color: ${a.level === 'CRITICAL' ? '#f85149' : '#d29922'}; margin-bottom: 5px;">
                ⚠️ ${a.code}
            </div>
        `).join('');

        return `
            <div id="resilience-panel" style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 0.8rem; font-weight: bold; color: #f0f6fc;">Resiliencia del Castell</span>
                    <span style="font-size: 1rem; font-weight: bold; color: ${color};">${salud}%</span>
                </div>
                
                <div style="width: 100%; height: 8px; background: #0d1117; border-radius: 4px; overflow: hidden; margin-bottom: 15px;">
                    <div style="width: ${salud}%; height: 100%; background: ${color}; transition: width 0.5s ease-in-out;"></div>
                </div>

                <div id="alert-list">
                    ${alertItems || '<span style="font-size: 0.7rem; color: #8b949e;">No hay riesgos detectados.</span>'}
                </div>

                ${salud < 30 ? `
                    <div style="margin-top: 10px; padding: 8px; background: rgba(248, 81, 73, 0.1); border: 1px solid #f85149; border-radius: 4px; font-size: 0.65rem; color: #f85149;">
                        <b>BLOQUEO ACTIVO:</b> Falta auditoría técnica (@dosos). Liquidaciones estratégicas pausadas.
                    </div>
                ` : ''}
            </div>
        `;
    }
};
