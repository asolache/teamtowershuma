// v7/js/components/PageHeader.js
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
                <a href="/v7/manifesto" data-link class="ph-utility-link">📖 CODEX</a>
                <a href="/v7/help" data-link class="ph-utility-link">❓ AYUDA</a>
            </nav>
        ` : '';

        // --- LÓGICA MÁGICA DE PESTAÑAS (>3) ---
        let tabsHtml = '';
        let selectHtml = '';
        const hasTabs = config.tabs && config.tabs.length > 0;
        const triggerMobileDropdown = hasTabs && config.tabs.length > 3;

        if (hasTabs) {
            tabsHtml = `
                <div class="ph-tabs-buttons">
                    ${config.tabs.map(t => `
                        <button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">
                            ${t.label} ${t.badge ? `<span class="ph-tab-badge">${t.badge}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            `;
            
            selectHtml = `
                <div class="ph-tabs-select-wrapper">
                    <select class="ph-mob-tabs-select" id="phMobTabsSelect">
                        ${config.tabs.map(t => `
                            <option value="${t.id}" ${t.active ? 'selected' : ''}>${t.label.replace(/<[^>]*>?/gm, '')}</option>
                        `).join('')}
                    </select>
                </div>
            `;
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
        const pomodoroAlertHtml = isPomodoroActive ? `<a href="/v7/focus" data-link class="ph-pomodoro-alert" title="Volver al Focus">🍅</a>` : '';

        return `
            <style id="ph-dynamic-styles">
                /* BASE (PC) */
                .ph-top-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(10, 10, 15, 0.4); border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; border-radius: 12px; }
                .ph-push-down { padding-top: 0; }
                
                .ph-utility-nav { display: flex; gap: 20px; align-items: center; }
                .ph-utility-link { font-size: 0.65rem; color: #888; text-decoration: none; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
                .ph-utility-link:hover { color: #00b0ff; }

                .ph-controls { display: flex; align-items: center; gap: 15px; }
                .ph-mob-brand { display: none; font-size: 1.5rem; text-decoration: none; }

                .ph-select-net { appearance: none; background: rgba(0, 0, 0, 0.4) no-repeat right 12px top 50% / 10px auto; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300b0ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); border: 1px solid rgba(0, 176, 255, 0.2); color: #00b0ff; padding: 8px 35px 8px 15px; border-radius: 8px; font-family: monospace; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
                
                .ph-avatar-wrap { position: relative; }
                .ph-avatar { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: linear-gradient(135deg, #e040fb, #7c4dff); color: white; border-radius: 50%; font-weight: 900; cursor: pointer; }
                .ph-dropdown { position: absolute; top: 45px; right: 0; background: rgba(15,15,20, 0.98); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; min-width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.9); opacity: 0; visibility: hidden; transform: translateY(-10px); transition: 0.3s; z-index: 10000; overflow: hidden; }
                .ph-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
                .ph-dd-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); }
                .ph-dd-link { display: block; padding: 12px 20px; color: #ccc; text-decoration: none; font-size: 0.9rem; font-weight: bold; }
                .ph-dd-link:hover { background: rgba(255,255,255,0.05); color: white; }

                .ph-title-row { display: flex; align-items: center; gap: 15px; margin-bottom: 10px; flex-wrap: wrap; }
                .ph-h1 { font-size: 2.2rem; font-weight: 900; color: white; margin: 0; word-break: break-word; line-height: 1.2; letter-spacing: -1px;}
                .ph-tag { background: rgba(0, 230, 118, 0.1); color: #00e676; padding: 4px 12px; border-radius: 20px; font-family: monospace; font-size: 0.85rem; font-weight: bold; white-space: nowrap; border: 1px solid rgba(0,230,118,0.3); display: inline-block;}
                .ph-tagline { color: #888; font-size: 1rem; margin-bottom: 20px; line-height: 1.4; max-width: 700px; }

                .ph-tabs-buttons { display: flex; gap: 5px; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow-x: auto; margin-bottom: 20px; }
                .ph-tab-btn { flex: 1; padding: 10px 20px; background: transparent; border: none; color: #888; border-radius: 8px; font-weight: bold; cursor: pointer; white-space: nowrap; }
                .ph-tab-btn.active { background: rgba(255,255,255,0.1); color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
                .ph-tabs-select-wrapper { display: none; margin-bottom: 20px; } /* Oculto en PC */

                .magic-action-group { display: flex; gap: 10px; flex-wrap: wrap; background: rgba(10,10,15,0.6); padding: 6px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px; }
                .magic-select { appearance: none; background: rgba(0,0,0,0.5) no-repeat right 12px top 50% / 10px auto; background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23e040fb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); border: 1px solid rgba(224,64,251,0.3); color: white; padding: 10px 35px 10px 15px; border-radius: 10px; font-weight: bold; outline: none; cursor: pointer; }
                .btn-magic-exec { background: linear-gradient(135deg, #e040fb, #7c4dff); color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 8px; height: 40px; }
                .magic-token-badge { background: rgba(0,0,0,0.5); color: #00e676; font-family: monospace; font-size: 0.7rem; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(0,230,118,0.3); }

                /* =======================================================
                   BLINDAJE MÓVIL (< 768px)
                   ======================================================= */
                @media (max-width: 768px) {
                    /* 1. BARRA SUPERIOR FIJA (ALTO EXACTO) */
                    .ph-top-bar { 
                        position: fixed !important; 
                        top: 0 !important; 
                        left: 0 !important; 
                        width: 100vw !important; 
                        height: 70px !important; 
                        z-index: 9999 !important; 
                        border-radius: 0 !important;
                        margin: 0 !important;
                        background: rgba(10, 10, 15, 0.98) !important;
                        box-sizing: border-box !important;
                        backdrop-filter: blur(20px) !important;
                    }
                    .ph-utility-nav { display: none !important; }
                    .ph-mob-brand { display: flex !important; }
                    
                    /* 2. EL ESCUDO DE PADDING (No se puede ignorar) */
                    .ph-push-down { 
                        display: block !important;
                        padding-top: 90px !important; /* 70px de barra + 20px de aire */
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }

                    /* 3. TÍTULO Y TAG EN COLUMNA ESTRICTA */
                    .ph-title-row { 
                        flex-direction: column !important; 
                        align-items: flex-start !important; 
                        gap: 10px !important; 
                    }
                    .ph-h1 { font-size: 1.8rem !important; width: 100% !important; }
                    .ph-tag { font-size: 0.7rem !important; padding: 4px 10px !important; }

                    /* 4. MAGIC BUTTON APILADO */
                    .magic-action-group { flex-direction: column !important; align-items: stretch !important; }
                    .magic-select, .btn-magic-exec { width: 100% !important; height: 45px !important; }
                    
                    /* 5. LÓGICA DE PESTAÑAS (INYECCIÓN CONDICIONAL W3C) */
                    ${triggerMobileDropdown ? `
                        .ph-tabs-buttons { display: none !important; }
                        .ph-tabs-select-wrapper { display: block !important; width: 100%; }
                        .ph-mob-tabs-select { appearance: none; background: linear-gradient(145deg, #19191e, #0a0a0f) no-repeat right 15px top 50% / 12px auto; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e040fb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); border: 1px solid #e040fb; color: white; padding: 14px 40px 14px 20px; border-radius: 12px; font-size: 1rem; font-weight: 800; outline: none; width: 100%; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
                    ` : `
                        .ph-tabs-buttons { display: flex !important; justify-content: flex-start !important; }
                        .ph-tabs-select-wrapper { display: none !important; }
                    `}
                }
            </style>

            <div class="ph-top-bar">
                <a href="/v7/" data-link class="ph-mob-brand">🗼</a>
                ${auxLinksHtml}
                <div class="ph-controls">
                    ${pomodoroAlertHtml}
                    <select class="ph-select-net" id="phMobProjectSelect">
                        ${projectOptionsHtml}
                    </select>
                    <div class="ph-avatar-wrap">
                        <div class="ph-avatar" id="phUserAvatarToggle">
                            ${user?.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div class="ph-dropdown" id="phUserDropdown">
                            <div class="ph-dd-header">
                                <span style="color:white; font-weight:900; display:block;">${user?.name || 'Usuario'}</span>
                                <span style="color:#00b0ff; font-family:monospace; font-size:0.75rem;">${user?.id || '@guest'}</span>
                            </div>
                            <a href="/v7/profile" data-link class="ph-dd-link">👤 Mi Perfil</a>
                            <a href="/v7/map" data-link class="ph-dd-link">🕸️ Mapa VNA</a>
                            ${state.session.role === 'ecosystem-owner' ? `<a href="/v7/settings" data-link class="ph-dd-link">⚙️ Gobernanza</a>` : ''}
                            <div class="ph-dd-link" id="phBtnLogout" style="cursor:pointer; color:#ff5252; border-top:1px solid rgba(255,255,255,0.05);">🚪 Desconectar</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ph-push-down">
                <div class="ph-title-row">
                    <h1 class="ph-h1">${config.title}</h1>
                    ${config.subtitle ? `<span class="ph-tag">${config.subtitle}</span>` : ''}
                </div>
                ${config.tagline ? `<p class="ph-tagline">${config.tagline}</p>` : ''}
                
                ${finalActionsHtml}
                
                ${tabsHtml}
                ${selectHtml}
            </div>
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
                const opt = magicSelect.options[magicSelect.selectedIndex];
                if (opt.dataset.isai === 'true' && opt.dataset.tokens > 0) {
                    magicTokenBadge.style.display = 'inline-block';
                    magicTokenBadge.innerHTML = `🪙 ${opt.dataset.tokens}`;
                } else {
                    magicTokenBadge.style.display = 'none';
                }
            };
            updateMagicButton();
            magicSelect.addEventListener('change', updateMagicButton);
            magicBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('ph-magic-action', { detail: { actionId: magicSelect.value } }));
            });
        }
    }
};
