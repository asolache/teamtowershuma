import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === state.session.activeUserId);
        const projects = state.projects.filter(p => state.session.role === 'ecosystem-owner' || p.ownerId === user?.id || (p.usuarios?.find(u => u.id === user?.id)));
        let activePId = localStorage.getItem('tt_active_project') || projects[0]?.id;

        return `
            <header class="ph-global-top-bar">
                <a href="/v5/" data-link class="ph-mob-brand"><img src="/v5/logoteamtowers.png" style="height:30px"></a>
                <div class="ph-header-actions">
                    <select class="ph-mob-project-select" id="phMobProjectSelect">
                        ${projects.map(p => `<option value="${p.id}" ${p.id === activePId ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                    </select>
                    <div class="ph-mob-user" id="phUserAvatarToggle" style="width:35px; height:35px; background:var(--accent-purple); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">${user?.name.charAt(0) || '?'}</div>
                    <div class="ph-user-dropdown" id="phUserDropdown">
                        <a href="/v5/profile" data-link class="ph-dd-link">👤 Perfil</a>
                        <div class="ph-dd-link danger" id="phBtnLogout">🚪 Salir</div>
                    </div>
                </div>
            </header>
            <div class="ph-view-header">
                <h1>${config.title} <span style="color:var(--accent-blue)">${config.subtitle || ''}</span></h1>
                <p>${config.tagline || ''}</p>
                <div class="ph-tabs-container">
                    ${config.tabs ? config.tabs.map(t => `<button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('') : ''}
                </div>
            </div>
        `;
    },
    execute: () => {
        document.getElementById('phMobProjectSelect')?.addEventListener('change', (e) => {
            localStorage.setItem('tt_active_project', e.target.value);
            window.location.reload();
        });
        document.getElementById('phUserAvatarToggle')?.addEventListener('click', () => {
            document.getElementById('phUserDropdown').classList.toggle('open');
        });
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        tabBtns.forEach(btn => btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: btn.dataset.tab } }));
        }));
    }
};
