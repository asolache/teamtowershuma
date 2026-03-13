// js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);
        const currentPath = window.location.pathname;
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );
        
        let activeProjectId = localStorage.getItem('tt_active_project');

        const getArchIcon = (arch) => {
            const icons = { 'startup': '🚀', 'dao': '🤖', 'corp': '🏢', 'corporate': '🏢', 'incubator': '🏭', 'sos': '🆘' };
            return icons[arch] || '🪐';
        };

        const enrichedProjects = userProjects.map(p => {
            const activity = (p.vna_flows?.length || 0) + (p.work_orders?.length || 0) + (p.ledger?.length || 0);
            const tsMatch = p.id.match(/\d+/);
            const timestamp = tsMatch ? parseInt(tsMatch[0]) : 0;
            return { ...p, activity, timestamp, icon: getArchIcon(p.archetype) };
        });

        enrichedProjects.sort((a, b) => b.timestamp - a.timestamp);
        const activeProjects = [...enrichedProjects].filter(p => p.activity > 0).sort((a, b) => b.activity - a.activity).slice(0, 3);
        const activeIds = activeProjects.map(p => p.id);
        const recentProjects = enrichedProjects.filter(p => !activeIds.includes(p.id));

        if (!activeProjectId && enrichedProjects.length > 0) {
            activeProjectId = activeProjects.length > 0 ? activeProjects[0].id : recentProjects[0].id;
        }

        let projectOptionsHtml = '';
        if (activeProjects.length > 0) {
            projectOptionsHtml += `<optgroup label="🔥 MÁS ACTIVAS">`;
            activeProjects.forEach(p => {
                projectOptionsHtml += `<option value="${p.id}" ${p.id === activeProjectId ? 'selected' : ''}>${p.icon} ${p.nombre.toUpperCase()} (${p.activity})</option>`;
            });
            projectOptionsHtml += `</optgroup>`;
        }
        if (recentProjects.length > 0) {
            projectOptionsHtml += `<optgroup label="🆕 RECIENTES / OTRAS">`;
            recentProjects.forEach(p => {
                projectOptionsHtml += `<option value="${p.id}" ${p.id === activeProjectId ? 'selected' : ''}>${p.icon} ${p.nombre.toUpperCase()}</option>`;
            });
            projectOptionsHtml += `</optgroup>`;
        }

        const isBaseRoute = currentPath.endsWith('/') || currentPath.endsWith('index.html');
        const showAuxLinks = isBaseRoute || !config.tabs;
        const auxLinksHtml = showAuxLinks ? `
            <nav class="ph-utility-nav">
                <a href="/manifesto" data-link class="ph-utility-link">📖 CODEX</a>
                <a href="/help" data-link class="ph-utility-link">❓ AYUDA</a>
            </nav>
        ` : '';

        // --- LÓGICA DE PESTAÑAS (BOTONERA VS SELECT MÓVIL) ---
        let tabsHtml = '';
        let mobSelectHtml = '';
        if (config.tabs && config.tabs.length > 0) {
            const isManyTabs = config.tabs.length > 3;
            tabsHtml = `
                <div class="ph-tabs-container ${isManyTabs ? 'hide-tabs-on-mobile' : ''}" id="phTabsContainer">
                    ${config.tabs.map(t => `
                        <button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">
                            ${t.label} ${t.badge ? `<span class="ph-tab-badge" id="badge-${t.id}">${t.badge}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            `;
            if (isManyTabs) {
                mobSelectHtml = `
                    <div class="ph-mob-tabs-wrapper">
                        <select class="ph-mob-tabs-select" id="phMobTabsSelect">
                            ${config.tabs.map(t => `
                                <option value="${t.id}" ${t.active ? 'selected' : ''}>${t.label.replace(/<[^>]*>?/gm, '')}</option>
                            `).join('')}
                        </select>
                    </div>
                `;
            }
        }

        // --- LÓGICA DEL MAGIC BUTTON ---
        let finalActionsHtml = config.actionHtml || ''; 
        if (config.magicActions && config.magicActions.length > 0) {
            finalActionsHtml = `
                <div class="magic-action-group">
                    <select class="magic-select" id="phMagicSelect">
                        ${config.magicActions.map((a, index) => `
                            <option value="${a.id}" data-isai="${a.isAi || false}" data-tokens="${a.tokens || 0}" ${index === 0 ? 'selected' : ''}>
                                ${a.icon || '⚡'} ${a.label}
                            </option>
                        `).join('')}
                    </select>
                    <button class="btn-magic-exec" id="phMagicBtn">
                        <span class="magic-btn-icon">✨</span> Ejecutar
                        <span class="magic-token-badge" id="phMagicTokenBadge" style="display: none;"></span>
                    </button>
                </div>
            `;
        }

        const isPomodoroActive = localStorage.getItem('tt_active_pomodoro_tx');
        const pomodoroAlertHtml = isPomodoroActive ? `<a href="/focus" data-link class="ph-pomodoro-alert" title="Volver al Focus">🍅</a>` : '';

        const archetypeBadgeHtml = config.subtitle ? `<span class="ph-badge-startup">${config.subtitle}</span>` : '';

        return `
            <style>
                .ph-global-top-bar { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 12px 20px; margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05); gap: 15px;
                    background: rgba(10, 10, 15, 0.2); flex-shrink: 0; 
                }

                .ph-utility-nav { display: flex; gap: 20px; align-items: center; }
                .ph-utility-link { font-size: 0.65rem; color: var(--text-muted); text-decoration: none; font-weight: 800; letter-spacing: 1.5px; transition: all 0.2s; padding: 4px 0; border-bottom: 1px solid transparent; white-space: nowrap; }
                .ph-utility-link:hover { color: var(--accent-blue); border-bottom-color: var(--accent-blue); }

                .ph-mob-brand { display: none; align-items: center; height: 32px; text-decoration:none; flex-shrink: 0; }
                .ph-mob-controls-right { display: flex; align-items: center; justify-content: flex-end; gap: 15px; flex: 1; }

                .ph-mob-project-select { 
                    appearance: none; background: rgba(0, 0, 0, 0.4) no-repeat right 12px top 50% / 10px auto;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300b0ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    border: 1px solid rgba(0, 176, 255, 0.2); color: var(--accent-blue); 
                    padding: 8px 35px 8px 15px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold;
                    outline: none; max-width: 220px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; cursor: pointer; transition: all 0.3s ease;
                }

                .ph-mob-user { 
                    display: flex; align-items: center; justify-content: center; 
                    width: 35px; height: 35px; background: linear-gradient(135deg, var(--accent-purple), #7c4dff); 
                    color: white; border-radius: 50%; font-weight: 900; text-decoration: none; font-size: 0.9rem; 
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer; flex-shrink: 0;
                }
                
                .ph-user-dropdown { position: absolute; top: 50px; right: 0; background: rgba(15,15,20, 0.98); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; min-width: 220px; box-shadow: 0 15px 40px rgba(0,0,0,0.9); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s; z-index: 10000; overflow: hidden; }
                .ph-user-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
                .ph-dd-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.3);}
                .ph-dd-link { display: flex; align-items: center; gap: 12px; padding: 15px 20px; color: #ccc; text-decoration: none; font-size: 0.9rem; font-weight: bold; }
                .ph-dd-link:hover { background: rgba(255,255,255,0.05); color: white;}

                /* --- TÍTULOS --- */
                .ph-view-header { margin-bottom: 2rem; width: 100%; }
                .ph-title-wrapper { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: 8px; }
                .ph-title-text { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900; line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word; }
                .ph-badge-startup { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); padding: 4px 12px; border-radius: 20px; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; display: inline-block; }
                .ph-tagline { color: var(--text-muted); font-size: 1rem; margin-top: 0; margin-bottom: 1.5rem; line-height: 1.4; max-width: 700px; }

                /* --- MAGIC ACTION GROUP --- */
                .magic-action-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: rgba(10, 10, 15, 0.6); padding: 6px; border-radius: 14px; border: 1px solid var(--glass-border); }
                .magic-select { appearance: none; background: rgba(0,0,0,0.5) no-repeat right 12px top 50% / 10px auto; background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23e040fb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); border: 1px solid rgba(224, 64, 251, 0.3); color: white; padding: 10px 35px 10px 15px; border-radius: 10px; font-family: var(--font-main); font-size: 0.9rem; font-weight: 800; outline: none; cursor: pointer; transition: all 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); }
                .magic-select:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224, 64, 251, 0.2); }
                .magic-select option { background: var(--bg-panel); color: white; }
                .btn-magic-exec { background: linear-gradient(135deg, var(--accent-purple), #7c4dff); color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 900; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 5px 15px rgba(224, 64, 251, 0.2); transition: 0.3s; height: 40px; }
                .btn-magic-exec:hover { transform: translateY(-2px); filter: brightness(1.1); }
                .magic-token-badge { background: rgba(0,0,0,0.5); color: var(--accent-green); font-family: var(--font-mono); font-size: 0.7rem; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(0, 230, 118, 0.3); }

                /* --- TABS --- */
                .ph-tabs-container { display: flex; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 5px; margin-bottom: 2rem; overflow-x: auto; scrollbar-width: none;}
                .ph-tabs-container::-webkit-scrollbar { display: none; }
                .ph-tab-btn { flex: 1; padding: 10px 20px; background: transparent; border: none; border-radius: 8px; color: var(--text-muted); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
                .ph-tab-btn.active { background: rgba(255,255,255,0.08); color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
                .ph-mob-tabs-wrapper { display: none; width: 100%; margin-bottom: 1.5rem; }
                .ph-mob-tabs-select { appearance: none; background: linear-gradient(145deg, rgba(25, 25, 30, 0.9), rgba(10, 10, 15, 0.95)) no-repeat right 15px top 50% / 12px auto; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e040fb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); border: 1px solid var(--accent-purple); color: white; padding: 14px 40px 14px 20px; border-radius: 12px; font-size: 1rem; font-weight: 800; outline: none; width: 100%; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }

                /* EL ESPACIADOR MÓVIL (Por defecto oculto en PC) */
                .ph-mobile-spacer { display: none; }

                /* --- BLINDAJE MÓVIL TOTAL (<768px) --- */
                @media (max-width: 768px) {
                    .ph-global-top-bar { 
                        position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; 
                        background: rgba(10, 10, 14, 0.98); backdrop-filter: blur(20px); 
                        padding: 10px 15px; box-sizing: border-box; margin-bottom: 0;
                    }
                    
                    /* AQUÍ ESTÁ LA MAGIA: El Spacer se vuelve un bloque físico de 90px de alto */
                    .ph-mobile-spacer {
                        display: block;
                        height: 95px; /* Empuja el título exactamente por debajo de la barra top */
                        width: 100%;
                        flex-shrink: 0;
                    }

                    .ph-mob-brand { display: flex; }
                    .ph-utility-nav { display: none !important; }
                    
                    .ph-view-header { display: block; margin-bottom: 1.5rem; width: 100%; }
                    .ph-title-wrapper { flex-direction: column; align-items: flex-start; gap: 10px; margin-bottom: 12px; width: 100%; }
                    .ph-title-text { font-size: 1.8rem; line-height: 1.2; width: 100%; }
                    .ph-badge-startup { font-size: 0.7rem; padding: 4px 10px; margin-bottom: 4px; }
                    
                    .magic-action-group { flex-direction: column; width: 100%; align-items: stretch; margin-top: 15px;}
                    .magic-select { width: 100%; height: 45px;}
                    .btn-magic-exec { width: 100%; height: 45px;}

                    .ph-mob-project-select { max-width: 130px; font-size: 0.75rem; padding-right:25px;}
                    .ph-mob-user { width: 32px; height: 32px; font-size: 0.85rem; }
                    
                    .hide-tabs-on-mobile { display: none !important; }
                    .ph-mob-tabs-wrapper { display: block; }
                    .ph-tabs-container:not(.hide-tabs-on-mobile) { justify-content: flex-start; margin-bottom: 1.5rem; }
                    .ph-tab-btn { flex: 0 0 auto; padding: 8px 15px; font-size: 0.8rem;}
                }
            </style>

            <header class="ph-global-top-bar">
                <a href="/v7/" data-link class="ph-mob-brand">
                    <span style="font-size: 1.5rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5));">🗼</span>
                </a>
                
                ${auxLinksHtml}

                <div class="ph-mob-controls-right">
                    ${pomodoroAlertHtml}
                    <select class="ph-mob-project-select" id="phMobProjectSelect" title="Cambiar Red">
                        ${projectOptionsHtml}
                    </select>
                    
                    <div style="position:relative;">
                        <div class="ph-mob-user" id="phUserAvatarToggle">
                            ${user?.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div class="ph-user-dropdown" id="phUserDropdown">
                            <div class="ph-dd-header">
                                <span style="color:white; font-weight:900; display:block;">${user?.name || 'Usuario'}</span>
                                <span style="color:var(--accent-blue); font-family:var(--font-mono); font-size:0.75rem;">${user?.id || '@guest'}</span>
                            </div>
                            <a href="/profile" data-link class="ph-dd-link">👤 Mi Identidad / Perfil</a>
                            <a href="/map" data-link class="ph-dd-link">🕸️ Mapa Ecosistema (VNA)</a>
                            ${state.session.role === 'ecosystem-owner' ? `<a href="/settings" data-link class="ph-dd-link">⚙️ Consola de Gobernanza</a>` : ''}
                            <div class="ph-dd-link danger" id="phBtnLogout" style="cursor:pointer; border-top:1px solid rgba(255,255,255,0.05);">🚪 Desconectar Nodo</div>
                        </div>
                    </div>
                </div>
            </header>

            <div class="ph-mobile-spacer"></div>

            <div class="ph-view-header">
                <div class="ph-title-wrapper">
                    <h1 class="ph-title-text">${config.title}</h1>
                    ${archetypeBadgeHtml}
                </div>
                ${config.tagline ? `<p class="ph-tagline">${config.tagline}</p>` : ''}
                
                ${finalActionsHtml ? `<div class="ph-header-actions">${finalActionsHtml}</div>` : ''}
            </div>

            ${tabsHtml}
            ${mobSelectHtml}
        `;
    },

    execute: () => {
        const globalSelect = document.getElementById('phMobProjectSelect');
        if (globalSelect) {
            globalSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: e.target.value, updates: { _lastSwitch: Date.now() } }
                }).then(() => window.location.reload());
            });
        }

        const avatarToggle = document.getElementById('phUserAvatarToggle');
        const userDropdown = document.getElementById('phUserDropdown');
        if (avatarToggle && userDropdown) {
            avatarToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('open');
            });
            document.addEventListener('click', (e) => {
                if (!avatarToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('open');
                }
            });
        }

        document.getElementById('phBtnLogout')?.addEventListener('click', () => {
            store.dispatch({ type: 'LOGOUT_USER' }).then(() => { window.location.href = '/v7/'; });
        });

        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const mobTabsSelect = document.getElementById('phMobTabsSelect');

        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (mobTabsSelect) mobTabsSelect.value = btn.dataset.tab;
                    window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: btn.dataset.tab } }));
                });
            });
        }

        if (mobTabsSelect) {
            mobTabsSelect.addEventListener('change', (e) => {
                tabBtns.forEach(b => {
                    b.classList.toggle('active', b.dataset.tab === e.target.value);
                });
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: e.target.value } }));
            });
        }

        const magicSelect = document.getElementById('phMagicSelect');
        const magicBtn = document.getElementById('phMagicBtn');
        const magicTokenBadge = document.getElementById('phMagicTokenBadge');

        if (magicSelect && magicBtn && magicTokenBadge) {
            const updateMagicButton = () => {
                const selectedOption = magicSelect.options[magicSelect.selectedIndex];
                const isAi = selectedOption.dataset.isai === 'true';
                const tokens = selectedOption.dataset.tokens;

                if (isAi && tokens > 0) {
                    magicTokenBadge.style.display = 'inline-block';
                    magicTokenBadge.innerHTML = `🪙 ${tokens}`;
                } else {
                    magicTokenBadge.style.display = 'none';
                }
            };
            updateMagicButton();
            magicSelect.addEventListener('change', updateMagicButton);
            magicBtn.addEventListener('click', () => {
                const actionId = magicSelect.value;
                window.dispatchEvent(new CustomEvent('ph-magic-action', { detail: { actionId } }));
            });
        }
    }
};
