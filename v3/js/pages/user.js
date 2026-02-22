// user.js - Vista detallada de usuario con skills
import { User } from '../models/user.model.js';

export function renderUser(userId) {
    const state = window.store.getState();
    const userData = state.users.find(u => u.id === userId) || 
                    { id: userId, name: userId, type: 'human' };
    
    // Crear modelo de usuario con sus transacciones
    const user = new User({
        ...userData,
        transactions: state.transactions.filter(t => t.user === userId)
    });
    
    user.recalculateSkills();

    const totalUV = user.getTotalUV();
    const transactions = user.transactions;
    const pendingCount = user.getPendingCount();
    const roles = user.getRoles();
    const projects = user.getProjects();
    const topSkills = user.getTopSkills(8);
    const reputation = Math.round(user.reputation * 100);

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>🧑 ${user.id}</h2>
                <div class="reputation-badge" style="background: ${getReputationColor(reputation)};">
                    ⭐ ${reputation}% reputación
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                <p><strong>Nombre:</strong> ${user.name || user.id}</p>
                <p><strong>Tipo:</strong> ${user.type === 'human' ? '👤 Humano' : '🤖 IA'}</p>
                ${user.provider ? `<p><strong>Proveedor:</strong> ${user.provider}</p>` : ''}
            </div>
            
            <!-- SKILLS DEL USUARIO -->
            <div class="skills-section" style="margin-bottom: 30px;">
                <h3>🔧 Skills y Reputación</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${topSkills.map(s => `
                        <div class="skill-card" style="background: #f1f5f9; padding: 15px; border-radius: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: bold;">${s.skill}</span>
                                <span class="skill-level" style="color: ${getSkillColor(s.level)};">
                                    ${s.level}
                                </span>
                            </div>
                            <div class="skill-bar" style="height: 8px; background: #cbd5e1; border-radius: 4px;">
                                <div style="width: ${s.value * 100}%; height: 100%; background: ${getSkillColor(s.level)}; border-radius: 4px;"></div>
                            </div>
                            <div style="margin-top: 5px; font-size: 12px; color: #64748b; text-align: right;">
                                ${Math.round(s.value * 100)}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Métricas -->
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                    <div class="metric-label">UV Generadas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                    <div class="metric-label">Entregables</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${pendingCount}</div>
                    <div class="metric-label">Pendientes</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${roles.length}</div>
                    <div class="metric-label">Roles</div>
                </div>
            </div>
        </div>

        <!-- Roles y Proyectos -->
        <div class="card">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3>👤 Roles desempeñados</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${roles.map(role => `
                            <div style="background: #f1f5f9; padding: 8px 16px; border-radius: 30px; border-left: 4px solid ${getRoleColor(role)};">
                                ${role}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <h3>📋 Proyectos</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${projects.map(project => `
                            <div class="project-tag" data-project="${project}" 
                                 style="background: #f1f5f9; padding: 8px 16px; border-radius: 30px; cursor: pointer;">
                                ${project}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Entregables -->
        <div class="card">
            <h3>📦 Entregables</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Proyecto</th>
                        <th>Rol</th>
                        <th>UV</th>
                        <th>Skills aplicados</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.slice(0, 10).map(t => {
                        const roleData = window.roleTemplates?.casteller?.roles
                            .find(r => r.id === t.role);
                        const skills = roleData?.skills?.slice(0, 2).join(', ') || '—';
                        return `
                            <tr>
                                <td>${t.name}</td>
                                <td>${t.project}</td>
                                <td>${t.role}</td>
                                <td>${t.uv}</td>
                                <td><small>${skills}</small></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Funciones auxiliares
function getReputationColor(reputation) {
    if (reputation >= 80) return '#10b981';
    if (reputation >= 60) return '#3b82f6';
    if (reputation >= 40) return '#f59e0b';
    return '#ef4444';
}

function getSkillColor(level) {
    const colors = {
        'experto': '#10b981',
        'avanzado': '#3b82f6',
        'intermedio': '#f59e0b',
        'principiante': '#f97316',
        'aprendiz': '#ef4444'
    };
    return colors[level] || '#64748b';
}

function getRoleColor(role) {
    const colors = {
        '@enxaneta': '#f59e0b',
        '@acotxador': '#8b5cf6',
        '@segon': '#3b82f6',
        '@terç': '#2563eb',
        '@quart': '#10b981',
        '@pinya': '#64748b'
    };
    return colors[role] || '#94a3b8';
}