// v9/js/views/ProjectCreatorView.js
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';
import { ProjectForge } from '../components/ProjectForge.js';

export default class ProjectCreatorView {
    constructor() {
        document.title = "Forjar Ecosistema | TeamTowers V9";
        this.forgeComponent = null;
    }

    async getHtml() {
        const headerConfig = {
            title: "Project Forge",
            subtitle: "Inicialización VNA",
            tagline: "Define el Ikigai del ecosistema, despliega roles y auto-asigna talento.",
            tabs: []
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .creator-workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; background: radial-gradient(circle at center, #111116 0%, #050505 100%); width: 100%; box-sizing: border-box;}
                @media (max-width: 768px) {
                    .creator-workspace { padding: 90px 1rem 2rem 1rem; }
                }
            </style>
            <div class="app-layout">
                ${Sidebar.getHtml('/create')}
                <main class="creator-workspace">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div id="projectForgeMountPoint"></div>
                    
                </main>
                ${BottomNav.getHtml('/create')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        // Montamos el Componente de Forja
        this.forgeComponent = new ProjectForge('projectForgeMountPoint');
        await this.forgeComponent.render();
    }
}
