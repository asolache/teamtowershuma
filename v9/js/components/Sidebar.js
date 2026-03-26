// v9/js/components/Sidebar.js
import { store } from '../core/store.js';

export class Sidebar {
    static getHtml(currentPath = '') {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const isMin = localStorage.getItem('tt_sidebar_min') === 'true';
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project && state.projects.length > 0) {
            project = state.projects.find(p => !p.isArchived) || state.projects[0];
        }
        
        const activeUserName = activeUserId ? (state.globalUsers.find(u => u.id === activeUserId)?.name || activeUserId) : 'Guest';
        const projectLabel = project ? project.nombre : 'Ecosistema Inactivo';

        const navItems = [
            { path: '/v9/dashboard', icon: '🛰️', label: 'Ojo del Castell' },
            { path: '/v9/map', icon: '🕸️', label: 'Topología VNA' },
            { path: '/v9/project', icon: '📋', label: 'Mercado PULL' },
            { path: '/v9/paper', icon: '📝', label: 'Omni-Paper (Ejecutar)' },
            { path: '/v9/team', icon: '👥', label: 'Padrón de Nodos' },
            { path: '/v9/ledger', icon: '⚖️', label: 'Notaría (Slicing Pie)' },
            { path: '/v9/lms', icon: '🧠', label: 'La Forja (Córtex W3C)' }, 
            { path: '/v9/pantheon', icon: '⚙️', label: 'Panteón Global' },
            { path: '/v9/tests', icon: '🩺', label: 'Test Antigravity' }
        ];

        let navHtml = '';
        navItems.forEach(item => {
            const isActive = currentPath === item.path.replace('/v9', '') ? 'active' : '';
            navHtml += `
                <a href="${item.path}" class="nav-item ${isActive}" data-link title="${item.label}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
            `;
        });

        const visibleProjects = state.projects.filter(p => !p.isArchived || p.id === currentActiveId);
        
        let ecosystemOptions = visibleProjects.map(p => 
            `<option value="${p.id}" ${p.id === (project ? project.id : '') ? 'selected' : ''}>${p.isArchived ? '🗄️ ' : ''}${p.nombre}</option>`
        ).join('');
        
        ecosystemOptions += `<option disabled>──────────</option>`;
        ecosystemOptions += `<option value="__CREATE_NEW__" style="color:var(--accent-green); font-weight:bold;">➕ Instanciar Nuevo Ecosistema</option>`;

        return `
            <style>
                .sidebar { width: 260px; height: 100vh; background: var(--bg-panel); border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 100; position: relative;}
                .sidebar.minimized { width: 80px; }
                
                /* 🔥 FIX: Cambio de orientación al minimizar para que quepan ambos elementos */
                .sb-header { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
                .sidebar.minimized .sb-header { flex-direction: column; padding: 1.5rem 0; gap: 15px; }
                
                .sb-brand { display: flex; align-items: center; justify-content: center; text-decoration: none; width: 100%; transition: 0.3s; cursor: pointer;}
                .sb-brand-img { height: 28px; width: auto; object-fit: contain; display: block; transition: 0.3s; filter: invert(1) brightness(100) drop-shadow(0 0 10px rgba(255,255,255,0.2));}
                .sb-brand-icon { font-size: 1.8rem; display: none; text-shadow: 0 0 15px rgba(0,176,255,0.4);}
                
                .sidebar:not(.minimized) .sb-brand-icon { display: none; }
                .sidebar.minimized .sb-brand-img { display: none; }
                .sidebar.minimized .sb-brand-icon { display: block; }
                
                /* 🔥 FIX: El botón vuelve a ser visible y rota correctamente */
                .btn-collapse { background: transparent; border: none; color: #888; font-size: 1.2rem; cursor: pointer; transition: 0.3s; padding: 5px; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px;}
                .btn-collapse:hover { color: white; background: rgba(255,255,255,0.1); }
                .sidebar.minimized .btn-collapse { transform: rotate(180deg); margin: 0; }
                
                .sb-ecosystem-wrapper { padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.3s; overflow: hidden; background: rgba(0,0,0,0.2);}
                .sidebar.minimized .sb-ecosystem-wrapper { padding: 1rem 0; display: flex; justify-content: center;}
                
                .sb-eco-label { font-size: 0.7rem; color: var(--accent-blue); text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px; display: block;}
                .sidebar.minimized .sb-eco-label { display: none; }
                
                .sb-eco-select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--accent-blue); color: white; font-size: 0.85rem; padding: 8px 10px; border-radius: 8px; font-weight: bold; cursor: pointer; outline: none; transition: 0.3s; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;}
                .sb-eco-select:focus { box-shadow: inset 0 0 10px rgba(0,176,255,0.2); }
                .sidebar.minimized .sb-eco-select { display: none; }
                
                .sb-eco-icon-min { display: none; color: var(--accent-blue); font-size: 1.2rem; cursor: pointer; text-decoration: none;}
                .sidebar.minimized .sb-eco-icon-min { display: block; }
                .sb-eco-icon-min:hover { transform: scale(1.1); }

                .sb-nav { flex: 1; padding: 1rem 0; display: flex; flex-direction: column; gap: 5px; overflow-y: auto; overflow-x: hidden;}
                
                .nav-item { display: flex; align-items: center; padding: 12px 1.5rem; color: #aaa; text-decoration: none; transition: 0.2s; white-space: nowrap; border-left: 3px solid transparent; overflow: hidden; font-weight: 500;}
                .nav-item:hover { background: rgba(255,255,255,0.03); color: white; }
                .nav-item.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-left-color: var(--accent-blue); font-weight: 900;}
                
                .nav-icon { font-size: 1.2rem; min-width: 35px; text-align: center; transition: 0.3s;}
                
                .nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; font-size: 0.95rem; }
                
                .sidebar.minimized .nav-item { padding: 12px 0; justify-content: center; border-left: none; }
                .sidebar.minimized .nav-item.active { border-left: 3px solid var(--accent-blue); }
                .sidebar.minimized .nav-label { display: none; }
                
                .sb-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 15px; white-space: nowrap; overflow: hidden; background: rgba(0,0,0,0.3);}
                .sidebar.minimized .sb-footer { justify-content: center; padding: 1.5rem 0; }
                .sb-avatar { width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; display: flex; justify-content: center; align-items: center; font-weight: 900; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 0 10px rgba(0,176,255,0.3);}
                .sb-user-info { display: flex; flex-direction: column; overflow: hidden; }
                .sidebar.minimized .sb-user-info { display: none; }
                .sb-user-name { color: white; font-weight: 900; font-size: 0.95rem; text-overflow: ellipsis; overflow: hidden; }
                .sb-user-role { color: var(--accent-green); font-size: 0.7rem; font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }

                @media (max-width: 768px) {
                    .sidebar { display: none; } 
                }
            </style>

            <nav class="sidebar ${isMin ? 'minimized' : ''}" id="mainSidebar">
                <div class="sb-header">
                    <a href="/v9/" data-link class="sb-brand" id="btnSidebarLogo" title="Volver a la Matriz Global">
                        <span class="sb-brand-icon">🏰</span>
                        <img src="https://raw.githubusercontent.com/asolache/teamtowershuma/main/v9/logoteamtowers.png" alt="TeamTowers" class="sb-brand-img">
                    </a>
                    <button class="btn-collapse" id="btnToggleSidebar" title="Colapsar/Expandir menú">◀</button>
                </div>
                
                <div class="sb-ecosystem-wrapper">
                    <span class="sb-eco-label">Ecosistema Activo</span>
                    <select class="sb-eco-select" id="sbProjectSelect" title="Cambiar Ecosistema">
                        ${ecosystemOptions || '<option value="">Sin ecosistemas</option>'}
                    </select>
                    <a href="/v9/dashboard" data-link class="sb-eco-icon-min" title="${projectLabel}">🌐</a>
                </div>

                <div class="sb-nav">
                    ${navHtml}
                </div>

                <div class="sb-footer">
                    <div class="sb-avatar">${activeUserName.charAt(0).toUpperCase()}</div>
                    <div class="sb-user-info">
                        <span class="sb-user-name">${activeUserName}</span>
                        <span class="sb-user-role">${state.session.role.replace('-',' ')}</span>
                    </div>
                </div>
            </nav>
        `;
    }

    static initListeners() {
        const btnToggle = document.getElementById('btnToggleSidebar');
        const sidebar = document.getElementById('mainSidebar');
        const selectProject = document.getElementById('sbProjectSelect');
        
        const toggleSidebarAction = (e) => {
            e.preventDefault();
            sidebar.classList.toggle('minimized');
            const isMin = sidebar.classList.contains('minimized');
            localStorage.setItem('tt_sidebar_min', isMin);
        };

        if (btnToggle && sidebar) {
            btnToggle.addEventListener('click', toggleSidebarAction);
        }

        if (selectProject) {
            selectProject.addEventListener('change', (e) => {
                const targetValue = e.target.value;
                
                if (targetValue === "__CREATE_NEW__") {
                    e.target.value = localStorage.getItem('tt_active_project') || ""; 
                    window.history.pushState(null, null, '/v9/create');
                    window.dispatchEvent(new Event('popstate'));
                    return;
                }

                if(targetValue) {
                    localStorage.setItem('tt_active_project', targetValue);
                    window.location.reload(); 
                }
            });
        }
    }
}
