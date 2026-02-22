// castell-view.js - Visualización radial del mapa de valor casteller
// System Prompt: Muestra los roles como niveles concéntricos de un castell
// VERSIÓN CON VERIFICACIONES DE SEGURIDAD

export function renderCastellView(projectId = '#kernel') {
    // VERIFICAR QUE SELECTORS EXISTE
    if (!window.Selectors) {
        console.error('❌ Selectors no disponible');
        return '<div class="loading">Error: Selectors no disponible</div>';
    }

    try {
        const state = window.store?.getState();
        if (!state) {
            console.error('❌ Store no disponible');
            return '<div class="loading">Error: Store no disponible</div>';
        }

        const project = state.projects.find(p => p.id === projectId) || { id: projectId, name: 'Proyecto' };
        
        // Obtener visualización del castell con fallback
        let castell = { cim: [], 'pom-de-dalt': [], 'tronc-alt': [], 'tronc-mig': [], 
                       'tronc-baix': [], manilles: [], folre: [], pinya: [] };
        let flow = { timeline: [], roles: [], timeWindow: 14 };
        
        try {
            castell = window.Selectors.getCastellVisualization(projectId) || castell;
            flow = window.Selectors.getValueFlow(projectId, 14) || flow;
        } catch (e) {
            console.warn('⚠️ Error obteniendo visualización:', e);
        }
        
        // Calcular salud del castell
        const salud = calcularSaludCastell(castell);
        
        // Obtener lista de proyectos para el selector
        const proyectos = state.projects.map(p => 
            `<option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>`
        ).join('');

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>🏰 Castell de Valor - ${project.name}</h2>
                    <div class="salud-indicator" style="
                        padding: 8px 16px;
                        border-radius: 30px;
                        background: ${salud.color};
                        color: white;
                        font-weight: bold;
                    ">
                        ${salud.emoji} Salud: ${salud.nivel}
                    </div>
                </div>
                
                <!-- Selector de proyecto -->
                <div style="margin-bottom: 30px;">
                    <label for="castell-project" style="font-weight: 500; margin-right: 10px;">Proyecto:</label>
                    <select id="castell-project" class="project-select" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1;">
                        ${proyectos}
                    </select>
                </div>

                <!-- VISUALIZACIÓN RADIAL DEL CASTELL -->
                <div id="castell-radial" style="position: relative; height: 600px; margin: 40px 0; background: #f8fafc; border-radius: 50%; overflow: hidden;">
                    <canvas id="castell-canvas" width="600" height="600" style="width: 100%; height: 100%; display: block;"></canvas>
                    
                    <!-- Tooltip para roles -->
                    <div id="castell-tooltip" style="
                        position: absolute;
                        background: #1e293b;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        font-size: 12px;
                        pointer-events: none;
                        display: none;
                        z-index: 1000;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    "></div>
                </div>

                <!-- Leyenda de niveles -->
                <div style="display: flex; gap: 30px; justify-content: center; margin: 20px 0; flex-wrap: wrap;">
                    <div><span style="display: inline-block; width: 16px; height: 16px; background: #f59e0b; border-radius: 4px;"></span> Cim (Enxaneta)</div>
                    <div><span style="display: inline-block; width: 16px; height: 16px; background: #8b5cf6; border-radius: 4px;"></span> Tronc Alt</div>
                    <div><span style="display: inline-block; width: 16px; height: 16px; background: #2563eb; border-radius: 4px;"></span> Tronc Mig</div>
                    <div><span style="display: inline-block; width: 16px; height: 16px; background: #10b981; border-radius: 4px;"></span> Tronc Baix</div>
                    <div><span style="display: inline-block; width: 16px; height: 16px; background: #64748b; border-radius: 4px;"></span> Pinya/Base</div>
                </div>
            </div>

            <!-- FLUJO DE VALOR EN EL TIEMPO -->
            <div class="card">
                <h2>📈 Flujo de Valor (últimos ${flow.timeWindow} días)</h2>
                
                <div style="display: flex; gap: 20px; overflow-x: auto; padding: 20px 0;">
                    ${flow.timeline.map(day => {
                        const altura = Math.min(100, day.total / 10);
                        return `
                            <div style="min-width: 60px; text-align: center;">
                                <div style="height: ${altura}px; background: linear-gradient(180deg, #2563eb 0%, #8b5cf6 100%); border-radius: 4px 4px 0 0;"></div>
                                <div style="margin-top: 8px; font-size: 11px;">${new Date(day.date).toLocaleDateString().slice(5)}</div>
                                <div style="font-size: 10px; color: #64748b;">${day.total} UV</div>
                                <div style="font-size: 9px; color: #94a3b8;">${day.transactions} tx</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- DISTRIBUCIÓN POR ROL -->
            <div class="card">
                <h2>📊 Distribución por Rol</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${Object.entries(castell).map(([nivel, roles]) => {
                        if (!roles || roles.length === 0) return '';
                        const nivelColor = getNivelColor(nivel);
                        return `
                            <div style="background: #f8fafc; padding: 15px; border-radius: 12px;">
                                <h3 style="color: ${nivelColor}; margin-bottom: 10px; border-bottom: 2px solid ${nivelColor}20; padding-bottom: 5px;">
                                    ${getNivelIcon(nivel)} ${getNivelNombre(nivel)}
                                </h3>
                                ${roles.map(role => `
                                    <div class="role-row" data-role="${role.id}" style="
                                        display: flex;
                                        justify-content: space-between;
                                        padding: 8px;
                                        margin: 5px 0;
                                        background: white;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                        border-left: 4px solid ${role.color || '#64748b'};
                                    ">
                                        <div>
                                            <div style="font-weight: 500;">${role.id}</div>
                                            <div style="font-size: 11px; color: #64748b;">${role.users?.length || 0} usuarios</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: bold; color: #2563eb;">${role.uv || 0} UV</div>
                                            <div style="font-size: 11px; color: #64748b;">${role.transactions || 0} tx</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- INDICADORES DE SALUD -->
            <div class="card">
                <h2>🏥 Indicadores de Salud del Castell</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div class="metric-card">
                        <div class="metric-value" style="color: ${salud.equilibrio > 0.7 ? '#10b981' : salud.equilibrio > 0.4 ? '#f59e0b' : '#ef4444'};">
                            ${Math.round(salud.equilibrio * 100)}%
                        </div>
                        <div class="metric-label">Equilibrio</div>
                        <div style="font-size: 11px; color: #64748b;">Distribución homogénea</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: ${salud.baseFuerza > 0.7 ? '#10b981' : salud.baseFuerza > 0.4 ? '#f59e0b' : '#ef4444'};">
                            ${Math.round(salud.baseFuerza * 100)}%
                        </div>
                        <div class="metric-label">Fuerza de Base</div>
                        <div style="font-size: 11px; color: #64748b;">Actividad en pinya</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: ${salud.verticalidad > 0.7 ? '#10b981' : salud.verticalidad > 0.4 ? '#f59e0b' : '#ef4444'};">
                            ${Math.round(salud.verticalidad * 100)}%
                        </div>
                        <div class="metric-label">Verticalidad</div>
                        <div style="font-size: 11px; color: #64748b;">Flujo de valor ascendente</div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderCastellView:', e);
        return `<div class="loading">Error al cargar la vista casteller: ${e.message}</div>`;
    }
}

// ===== FUNCIÓN DE DIBUJO DEL CANVAS =====
function dibujarCastellRadial(castell) {
    const canvas = document.getElementById('castell-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Definir radios para cada nivel
    const radios = {
        cim: 60,
        'pom-de-dalt': 100,
        'tronc-alt': 140,
        'tronc-mig': 180,
        'tronc-baix': 220,
        manilles: 250,
        folre: 270,
        pinya: 300
    };

    // Dibujar círculos concéntricos (anillos)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    Object.values(radios).forEach(radio => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radio, 0, Math.PI * 2);
        ctx.stroke();
    });

    ctx.setLineDash([]);

    // Dibujar líneas radiales (para orientación)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * 320;
        const y = centerY + Math.sin(angle) * 320;
        
        ctx.beginPath();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // Función para dibujar un rol en su posición
    function dibujarRol(role, nivel, index, total) {
        const radio = radios[nivel] || 200;
        const anguloBase = total > 0 ? (index / total) * Math.PI * 2 : 0;
        // Añadir variación para evitar superposición perfecta
        const variacion = 0.1 * Math.sin(anguloBase * 3);
        const angulo = anguloBase + variacion;
        
        const x = centerX + Math.cos(angulo) * radio;
        const y = centerY + Math.sin(angulo) * radio;
        
        // Tamaño basado en UV (valor)
        const tamañoBase = 20;
        const tamaño = Math.min(40, tamañoBase + (role.uv || 0) / 50);
        
        // Sombra
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        
        // Círculo del rol
        ctx.beginPath();
        ctx.arc(x, y, tamaño / 2, 0, Math.PI * 2);
        ctx.fillStyle = role.color || getNivelColor(nivel);
        ctx.fill();
        
        // Borde según presión (si está sobrecargado)
        const presion = (role.transactions || 0) / Math.max(1, role.uv || 1);
        if (presion > 2) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (presion > 1.5) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Reset sombra para texto
        ctx.shadowBlur = 0;
        
        // Etiqueta (solo si hay espacio)
        ctx.font = 'bold 9px system-ui';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(role.id.substring(0, 8), x, y);
        
        // Guardar posición para tooltips
        role._x = x;
        role._y = y;
        role._radio = tamaño / 2;
    }

    // Dibujar roles por nivel (de base a cima)
    const nivelesOrden = ['pinya', 'folre', 'manilles', 'tronc-baix', 'tronc-mig', 'tronc-alt', 'pom-de-dalt', 'cim'];
    
    nivelesOrden.forEach(nivel => {
        const roles = castell[nivel] || [];
        roles.forEach((role, index) => {
            dibujarRol(role, nivel, index, roles.length);
        });
    });

    // Guardar datos en el canvas para eventos
    canvas._castellData = castell;
}

// ===== FUNCIÓN PARA DETECTAR ROL BAJO EL RATÓN =====
function detectarRolEnPosicion(x, y, castell) {
    for (const nivel in castell) {
        const roles = castell[nivel] || [];
        for (const role of roles) {
            if (role._x && role._y && role._radio) {
                const dist = Math.sqrt((x - role._x) ** 2 + (y - role._y) ** 2);
                if (dist < role._radio) {
                    return role;
                }
            }
        }
    }
    return null;
}

// ===== FUNCIÓN PARA CALCULAR SALUD DEL CASTELL =====
function calcularSaludCastell(castell) {
    // Valores por defecto
    const defaultSalud = {
        nivel: 'Sin datos',
        color: '#64748b',
        emoji: '📊',
        equilibrio: 0.5,
        baseFuerza: 0.5,
        verticalidad: 0.5,
        saludGeneral: 0.5
    };

    if (!castell) return defaultSalud;

    // Calcular equilibrio (distribución homogénea)
    const niveles = ['cim', 'pom-de-dalt', 'tronc-alt', 'tronc-mig', 'tronc-baix', 'manilles', 'folre', 'pinya'];
    let totalUV = 0;
    let maxUV = 0;
    let minUV = Infinity;
    let baseUV = 0;
    let cimUV = 0;
    
    niveles.forEach(nivel => {
        const uv = (castell[nivel] || []).reduce((sum, r) => sum + (r.uv || 0), 0);
        totalUV += uv;
        if (uv > 0) {
            maxUV = Math.max(maxUV, uv);
            minUV = Math.min(minUV, uv);
        }
        
        if (nivel === 'pinya') baseUV = uv;
        if (nivel === 'cim') cimUV = uv;
    });
    
    if (totalUV === 0) return defaultSalud;
    
    const equilibrio = maxUV > 0 ? 1 - ((maxUV - minUV) / maxUV) : 1;
    const baseFuerza = totalUV > 0 ? baseUV / totalUV : 0;
    const verticalidad = baseUV > 0 ? Math.min(1, cimUV / baseUV) : 0;
    
    // Determinar nivel de salud general
    let nivel, color, emoji;
    const saludGeneral = (equilibrio * 0.4 + baseFuerza * 0.3 + verticalidad * 0.3);
    
    if (saludGeneral > 0.7) {
        nivel = 'Óptimo';
        color = '#10b981';
        emoji = '💪';
    } else if (saludGeneral > 0.4) {
        nivel = 'Estable';
        color = '#f59e0b';
        emoji = '⚖️';
    } else {
        nivel = 'Crítico';
        color = '#ef4444';
        emoji = '⚠️';
    }
    
    return {
        nivel,
        color,
        emoji,
        equilibrio,
        baseFuerza,
        verticalidad,
        saludGeneral
    };
}

// ===== FUNCIONES AUXILIARES =====
function getNivelColor(nivel) {
    const colores = {
        'cim': '#f59e0b',
        'pom-de-dalt': '#8b5cf6',
        'tronc-alt': '#3b82f6',
        'tronc-mig': '#2563eb',
        'tronc-baix': '#10b981',
        'manilles': '#f97316',
        'folre': '#fbbf24',
        'pinya': '#64748b'
    };
    return colores[nivel] || '#64748b';
}

function getNivelIcon(nivel) {
    const icons = {
        'cim': '👑',
        'pom-de-dalt': '🏛️',
        'tronc-alt': '⚡',
        'tronc-mig': '🔧',
        'tronc-baix': '⚙️',
        'manilles': '🛡️',
        'folre': '🔰',
        'pinya': '🪨'
    };
    return icons[nivel] || '•';
}

function getNivelNombre(nivel) {
    const nombres = {
        'cim': 'Cim',
        'pom-de-dalt': 'Pom de Dalt',
        'tronc-alt': 'Tronc Alt',
        'tronc-mig': 'Tronc Mig',
        'tronc-baix': 'Tronc Baix',
        'manilles': 'Manilles',
        'folre': 'Folre',
        'pinya': 'Pinya'
    };
    return nombres[nivel] || nivel;
}

// ===== SETUP DE EVENTOS =====
export function setupCastellViewEvents() {
    console.log('🏰 Vista casteller: configurando eventos');
    
    try {
        // Selector de proyecto
        const projectSelect = document.getElementById('castell-project');
        if (projectSelect) {
            projectSelect.addEventListener('change', (e) => {
                if (window.router) {
                    window.router.navigate('castell', e.target.value);
                } else {
                    console.warn('Router no disponible');
                }
            });
        }
        
        // Canvas para dibujar
        const canvas = document.getElementById('castell-canvas');
        if (!canvas) return;
        
        // Obtener datos del castell
        const projectId = projectSelect?.value || '#kernel';
        let castell = { cim: [], 'pom-de-dalt': [], 'tronc-alt': [], 'tronc-mig': [], 
                       'tronc-baix': [], manilles: [], folre: [], pinya: [] };
        
        try {
            if (window.Selectors) {
                castell = window.Selectors.getCastellVisualization(projectId) || castell;
            }
        } catch (e) {
            console.warn('⚠️ Error obteniendo visualización:', e);
        }
        
        // Dibujar
        dibujarCastellRadial(castell);
        
        // Tooltip
        const tooltip = document.getElementById('castell-tooltip');
        
        // Eventos de mouse
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            const role = detectarRolEnPosicion(x, y, castell);
            
            if (role && tooltip) {
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 10) + 'px';
                tooltip.style.top = (e.clientY - 10) + 'px';
                
                const presion = ((role.transactions || 0) / Math.max(1, role.uv || 1)).toFixed(2);
                tooltip.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">${role.id}</div>
                    <div>📊 UV: ${role.uv || 0}</div>
                    <div>📦 Tx: ${role.transactions || 0}</div>
                    <div>👥 Usuarios: ${role.users?.length || 0}</div>
                    <div style="color: ${presion > 1.5 ? '#ef4444' : '#10b981'}; margin-top: 5px;">
                        ⚡ Presión: ${presion}x
                    </div>
                `;
            } else if (tooltip) {
                tooltip.style.display = 'none';
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            if (tooltip) tooltip.style.display = 'none';
        });
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            const role = detectarRolEnPosicion(x, y, castell);
            
            if (role && window.router) {
                window.router.navigate('role', role.id);
            }
        });
        
        // Click en filas de roles
        document.querySelectorAll('.role-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const roleId = row.dataset.role;
                if (roleId && window.router) {
                    window.router.navigate('role', roleId);
                }
            });
        });
        
    } catch (e) {
        console.error('❌ Error en setupCastellViewEvents:', e);
    }
}

// Hacer funciones disponibles globalmente (para debugging)
window.dibujarCastellRadial = dibujarCastellRadial;
window.calcularSaludCastell = calcularSaludCastell;