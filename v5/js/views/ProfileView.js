// v5/js/views/ProfileView.js
import { store } from '../core/store.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil & Reputación | TeamTowers";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Sidebar */
                .sidebar { width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid rgba(255,255,255,0.05); padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 10; }
                .side-link { padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: #888; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .side-link.active { background: rgba(0, 176, 255, 0.1); color: #00b0ff; font-weight: bold; border-left: 3px solid #00b0ff; }

                /* Workspace */
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                
                /* HEADER PERFIL */
                .profile-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
                .profile-avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #00b0ff, #e040fb); display: flex; justify-content: center; align-items: center; font-size: 3rem; font-weight: bold; color: white; box-shadow: 0 10px 30px rgba(0, 176, 255, 0.3); }
                .profile-info h1 { margin: 0; font-size: 2.5rem; color: white; letter-spacing: -1px; }
                .profile-info p { margin: 5px 0 0 0; color: #888; font-family: monospace; font-size: 1rem; }
                
                /* ESTADÍSTICAS GLOBALES */
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: #121216; border: 1px solid #222; padding: 1.5rem; border-radius: 12px; text-align: center; transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-5px); border-color: #333; }
                .stat-value { font-size: 2.5rem; color: #00e676; font-weight: 800; font-family: monospace; margin-bottom: 5px; }
                .stat-label { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                /* SECCIONES: PROYECTOS Y SKILLS */
                .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                
                .section-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; }
                .panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 2rem; }
                
                /* LISTA DE PROYECTOS */
                .project-row { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .project-row:last-child { border-bottom: none; }
                .project-name { color: white; font-weight: bold; font-size: 1.1rem; }
                .project-role { color: #00b0ff; font-size: 0.8rem; font-family: monospace; background: rgba(0, 176, 255, 0.1); padding: 4px 8px; border-radius: 4px; margin-top: 5px; display: inline-block;}
                .project-slices { text-align: right; }
                .project-slices .amt { color: #00e676; font-size: 1.2rem; font-weight: bold; font-family: monospace; }
                
                /* SKILLS (SBTs) */
                .skills-container { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill-badge { background: #1a1a24; border: 1px solid #333; color: #ccc; padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
                .skill-count { background: #00b0ff; color: #000; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; }
            </style>

            <div class="app-layout">
                <aside class="sidebar">
                    <div style="font-weight: bold; font-family: monospace; color: white; margin-bottom: 2rem; font-size: 1.2rem;">🗼 TeamTowers</div>
                    
                    <a href="/v5/" class="side-link" data-link>🏠 Inicio</a>
                    <a href="/v5/profile" class="side-link active" data-link>👤 Mi Perfil (SBTs)</a>
                    <a href="/v5/create" class="side-link" data-link>➕ Instanciar Red</a>
                    <hr style="border-color: rgba(255,255,255,0.05); width: 100%; margin: 1rem 0;">
                    <a href="/v5/project" class="side-link" data-link>📋 Proyecto Actual</a>
                </aside>

                <main class="workspace">
                    <div class="profile-header">
                        <div class="profile-avatar" id="profInitials">?</div>
                        <div class="profile-info">
                            <h1 id="profName">Usuario Desconocido</h1>
                            <p id="profId">@id</p>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="totSlices">0</div>
                            <div class="stat-label">Slices Acumulados (Total)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totHours" style="color: #00b0ff;">0h</div>
                            <div class="stat-label">Horas de Deep Work (PoW)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totProjects" style="color: #e040fb;">0</div>
                            <div class="stat-label">Redes Activas</div>
                        </div>
                    </div>

                    <div class="content-grid">
                        <div class="panel">
                            <h3 class="section-title">🌐 Mis Redes de Valor</h3>
                            <div id="projectsList">
                                </div>
                        </div>

                        <div class="panel">
                            <h3 class="section-title">🏅 Skills Verificadas</h3>
                            <p style="color: #888; font-size: 0.8rem; margin-bottom: 1.5rem;">Habilidades certificadas inmutablemente a través del Ledger de entregables.</p>
                            <div class="skills-container" id="skillsList">
                                </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;

        // 1. Obtener datos del usuario global
        const user = state.globalUsers.find(u => u.id === activeUserId);
        
        if (user) {
            document.getElementById('profName').innerText = user.name;
            document.getElementById('profId').innerText = user.id;
            document.getElementById('profInitials').innerText = user.name.charAt(0).toUpperCase();
        } else {
            document.getElementById('profName').innerText = "Administrador del Sistema";
            document.getElementById('profId').innerText = activeUserId;
            document.getElementById('profInitials').innerText = "⚙️";
        }

        // 2. Analizar toda la participación en todos los proyectos
        let globalSlices = 0;
        let globalHours = 0;
        let activeProjectsCount = 0;
        const projectRowsHtml = [];
        const skillsMap = {}; // Para contar el tipo de entregables (Reputación)

        state.projects.forEach(p => {
            // Ver si el usuario está en el ledger de este proyecto
            const userLedgerEntries = (p.ledger || []).filter(entry => entry.userId === activeUserId);
            
            if (userLedgerEntries.length > 0) {
                activeProjectsCount++;
                let projectSlices = 0;
                let projectRoles = new Set();

                userLedgerEntries.forEach(entry => {
                    projectSlices += entry.valorCongelado;
                    globalSlices += entry.valorCongelado;
                    globalHours += entry.horas || 0;
                    
                    // Rescatar nombre del rol para mostrar
                    const rolObj = p.roles.find(r => r.id === entry.roleId);
                    if (rolObj) {
                        projectRoles.add(rolObj.name);
                        
                        // INFERENCIA DE SKILLS BASADA EN EL ROL Y TIPO DE ENTREGABLE
                        const skillTag = this.inferSkill(rolObj.levelId, entry.description);
                        skillsMap[skillTag] = (skillsMap[skillTag] || 0) + 1;
                    }
                });

                projectRowsHtml.push(`
                    <div class="project-row">
                        <div>
                            <div class="project-name">${p.nombre}</div>
                            <div class="project-role">${Array.from(projectRoles).join(', ')}</div>
                        </div>
                        <div class="project-slices">
                            <div class="amt">${Math.round(projectSlices).toLocaleString()} Slices</div>
                        </div>
                    </div>
                `);
            }
        });

        // 3. Pintar Estadísticas Globales
        document.getElementById('totSlices').innerText = Math.round(globalSlices).toLocaleString();
        document.getElementById('totHours').innerText = globalHours.toFixed(1) + 'h';
        document.getElementById('totProjects').innerText = activeProjectsCount;

        // 4. Pintar Lista de Proyectos
        const pList = document.getElementById('projectsList');
        if (projectRowsHtml.length > 0) {
            pList.innerHTML = projectRowsHtml.join('');
        } else {
            pList.innerHTML = `<p style="color: #666; font-style: italic;">Aún no tienes Slices consolidados en ninguna red.</p>`;
        }

        // 5. Pintar Skills (El CV Criptográfico)
        const sList = document.getElementById('skillsList');
        const sortedSkills = Object.entries(skillsMap).sort((a, b) => b[1] - a[1]); // Ordenar por más veces demostrada
        
        if (sortedSkills.length > 0) {
            sList.innerHTML = sortedSkills.map(([skill, count]) => `
                <div class="skill-badge">
                    ${skill} <span class="skill-count">${count}</span>
                </div>
            `).join('');
        } else {
            sList.innerHTML = `<p style="color: #666; font-size: 0.8rem;">Completa entregables (Proof of Work) para ganar badges de reputación.</p>`;
        }
    }

    // Un motor semántico ultra-básico para deducir habilidades en base al trabajo hecho
    inferSkill(levelId, description) {
        const descLower = description.toLowerCase();
        if (levelId === '@baixos' && (descLower.includes('código') || descLower.includes('api') || descLower.includes('dev'))) return 'Backend Eng';
        if (levelId === '@baixos') return 'Technical Execution';
        if (levelId === '@anxaneta') return 'Strategy & Leadership';
        if (levelId === '@aixecador') return 'Project Management';
        if (levelId === '@dosos') return 'QA & Auditing';
        if (levelId === '@pinya') return 'Community & Support';
        return 'General Contributor';
    }
}
