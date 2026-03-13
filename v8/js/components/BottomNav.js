// v8/js/components/BottomNav.js
import { store } from '../core/store.js';

export const BottomNav = {
    getHtml: (activePath = '') => {
        const state = store.getState();
        if ((window.location.pathname === '/v8/' || window.location.pathname === '/v8') && !state.session.activeUserId) return '';

        return `
            <nav class="bottom-nav">
                <div class="bn-menu">
                    <a href="/v8/project" data-link class="bn-item ${activePath === '/project' ? 'active' : ''}">
                        <span style="font-size: 1.4rem; margin-bottom: 4px;">📋</span>
                        <span>PULL</span>
                    </a>
                    <a href="/v8/dashboard" data-link class="bn-item ${activePath === '/dashboard' ? 'active' : ''}">
                        <span style="font-size: 1.4rem; margin-bottom: 4px;">🛰️</span>
                        <span>RADAR</span>
                    </a>
                    <a href="/v8/ledger" data-link class="bn-item ${activePath === '/ledger' ? 'active' : ''}">
                        <span style="font-size: 1.4rem; margin-bottom: 4px;">⚖️</span>
                        <span>WALLET</span>
                    </a>
                    <a href="/v8/profile" data-link class="bn-item ${activePath === '/profile' ? 'active' : ''}">
                        <span style="font-size: 1.4rem; margin-bottom: 4px;">👤</span>
                        <span>ADN</span>
                    </a>
                </div>
            </nav>
        `;
    }
};
