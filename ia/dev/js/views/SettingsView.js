// ============================================================
//  ia/dev/js/views/SettingsView.js
//  TeamTowers SOS — Sesión V10
// ============================================================

import { Sidebar }       from '../components/Sidebar.js';
import { BottomNav }     from '../components/BottomNav.js';
import { PageHeader }    from '../components/PageHeader.js';
import { SettingsVault } from '../components/SettingsVault.js';

export default class SettingsView {

    constructor() {
        document.title    = 'Panteón V10 | TeamTowers';
        this.vaultComponent = null;
    }

    async getHtml() {
        const headerConfig = {
            title:   'Panteón (Consola Global)',
            tagline: 'Configuración Root · Bóveda KB · Modelos IA · Portabilidad de Ecosistemas.',
            tabs:    []
        };

        return `
        <style>
            .app-layout {
                display:flex; height:100vh; overflow:hidden;
                background:var(--bg-dark); font-family:var(--font-main); width:100%;
            }
            .workspace-settings {
                flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden;
                scroll-behavior:smooth; box-sizing:border-box;
                background:radial-gradient(circle at center, #111116 0%, #050505 100%);
            }
            @media (max-width:768px) {
                .workspace-settings { padding:90px 1rem 120px 1rem; }
            }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/settings')}
            <main class="workspace-settings">
                ${PageHeader.getHtml(headerConfig)}
                <div id="settingsVaultMountPoint"></div>
            </main>
            ${BottomNav.getHtml('/settings')}
        </div>`;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
        this.vaultComponent = new SettingsVault('settingsVaultMountPoint');
        await this.vaultComponent.render();
    }
}
