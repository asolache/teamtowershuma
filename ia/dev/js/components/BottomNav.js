// =============================================================================
// TEAMTOWERS SOS V10 — BOTTOM NAV
// Ruta: ia/dev/js/components/BottomNav.js
// =============================================================================

export class BottomNav {

    static getHtml(currentPath = '') {
        const items = [
            { path: '/dashboard', icon: '🛰️', label: 'RADAR'    },
            { path: '/project',   icon: '📋', label: 'PULL'     },
            { path: '/paper',     icon: '📝', label: 'EJECUTAR', center: true },
            { path: '/ledger',    icon: '⚖️', label: 'WALLET'   },
            { path: '/profile',   icon: '👤', label: 'PERFIL'   },
        ];

        const itemsHtml = items.map(item => {
            const isActive = currentPath === item.path ? 'active' : '';
            if (item.center) {
                return `
                <div class="bn-center-wrap">
                    <a href="${item.path}" data-link class="bn-center ${isActive}" title="${item.label}">${item.icon}</a>
                    <span class="bn-center-lbl">${item.label}</span>
                </div>`;
            }
            return `
            <a href="${item.path}" data-link class="bn-item ${isActive}">
                <span class="bn-icon">${item.icon}</span>
                <span>${item.label}</span>
            </a>`;
        }).join('');

        return `
        <style>
            .bottom-nav {
                display: none;
                position: fixed; bottom: 0; left: 0; width: 100%;
                background: rgba(10,10,14,0.98);
                backdrop-filter: blur(16px);
                border-top: 1px solid var(--glass-border);
                z-index: 200;
                padding-bottom: env(safe-area-inset-bottom);
            }
            .bn-menu { display: flex; justify-content: space-around; align-items: center; height: 72px; }
            .bn-item {
                display: flex; flex-direction: column; align-items: center; gap: 3px;
                text-decoration: none; font-size: 0.6rem; font-weight: 700;
                color: var(--text-muted, #5c5c70);
                transition: color 0.15s; flex: 1; padding: 0.5rem;
            }
            .bn-item.active { color: var(--accent-indigo, #6366f1); }
            .bn-icon { font-size: 1.3rem; }

            .bn-center-wrap {
                display: flex; flex-direction: column; align-items: center;
                gap: 4px; flex: 1;
            }
            .bn-center {
                width: 52px; height: 52px; border-radius: 50%;
                background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #e040fb));
                display: flex; align-items: center; justify-content: center;
                font-size: 1.4rem; text-decoration: none;
                box-shadow: 0 8px 20px rgba(99,102,241,0.4);
                border: 3px solid #050508;
                transform: translateY(-8px);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .bn-center:hover, .bn-center.active {
                transform: translateY(-12px);
                box-shadow: 0 12px 25px rgba(99,102,241,0.6);
            }
            .bn-center-lbl {
                font-size: 0.58rem; color: var(--text-muted, #5c5c70);
                font-weight: 700; font-family: var(--font-mono, monospace);
            }

            @media (max-width: 768px) { .bottom-nav { display: block; } }
        </style>

        <nav class="bottom-nav">
            <div class="bn-menu">${itemsHtml}</div>
        </nav>`;
    }
}
