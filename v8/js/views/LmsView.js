// v8/js/views/LmsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import '../components/SemanticElement.js'; // Inicializa los Web Components

export default class LmsView {
    constructor() {
        document.title = "Forja LMS | TeamTowers V14";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "La Forja (Cerebro LMS)",
            subtitle: project ? project.nombre : 'Global',
            tagline: "Destila conocimiento bruto en Memes W3C (SOPs y SOCs) para entrenar al Enjambre IA."
        };

        const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const apiKey = localStorage.getItem(`tt_key_${provider}`) || '';
        const hasKey = apiKey.length > 5;

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-lms { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box;}
                
                .lms-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; padding-bottom: 5rem; align-items: start;}
                
                /* PANEL IZQUIERDO: INGESTA (LA FORJA) */
                .forge-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--accent-purple); border-radius: 20px; padding: 2rem; position: sticky; top: 0; box-shadow: 0 15px 40px rgba(0,0,0,0.5), inset 0 2px 15px rgba(224,64,251,0.05); backdrop-filter: blur(10px);}
                .forge-header { display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem; border-bottom: 1px dashed rgba(224,64,251,0.3); padding-bottom: 1rem;}
                .forge-icon { font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(224,64,251,0.5));}
                .forge-title { margin: 0; color: white; font-weight: 900; font-size: 1.4rem;}
                .forge-desc { margin: 5px 0 0 0; color: #aaa; font-size: 0.85rem; line-height: 1.4;}

                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 15px; border-radius: 12px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); resize: vertical; min-height: 200px; line-height: 1.5;}
                .form-control:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.15);}
                
                .btn-forge { width: 100%; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(224,64,251,0.2); margin-top: 1.5rem; text-transform: uppercase; letter-spacing: 1px; display:flex; justify-content:center; align-items:center; gap:10px;}
                .btn-forge:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224,64,251,0.4); filter: brightness(1.1);}
                .btn-forge:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(0.8); }

                /* PANEL DERECHO: MEMÉTICA ACTIVA (GRID) */
                .kb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;}
                .kb-title { color: white; font-size: 1.3rem; font-weight: 900; margin: 0; display:flex; align-items:center; gap:10px;}
                
                .lms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                
                /* ESTADOS DE CARGA */
                .forge-loading { display: none; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 0; animation: pulse 2s infinite; }
                .forge-loading span { font-size: 3rem; margin-bottom: 10px; text-shadow: 0 0 20px rgba(224,64,251,0.5); }
                .forge-loading p { color: var(--accent-purple); font-family: var(--font-mono); font-weight: bold; margin: 0; font-size: 0.9rem;}

                @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }

                @media (max-width: 900px) {
                    .workspace-lms { padding: 90px 1rem 120px 1rem; }
                    .lms-layout { grid-template-columns: 1fr; }
                    .forge-panel { position: relative; top: 0; margin-bottom: 2rem;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/lms')}
                
                <main class="workspace-lms">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    ${!hasKey && isPO ? `
                        <div style="background: rgba(255,82,82,0.1); border: 1px solid var(--accent-red); color: white; padding: 15px; border-radius: 12px; margin-bottom: 2rem;">
                            ⚠️ <b>Atención:</b> No tienes una API Key configurada en el Panteón. La Forja IA está desactivada. Ve a la Consola Global para conectar un motor LLM.
                        </div>
                    ` : ''}

                    <div class="lms-layout">
                        <div class="forge-panel">
                            <div class="forge-header">
                                <div class="forge-icon">🔥</div>
                                <div>
                                    <h3 class="forge-title">Destilería W3C</h3>
                                    <p class="forge-desc">Pega manuales, código o directrices en bruto. @mestre_escola extraerá los SOPs (Procedimientos) y SOCs (Criterios de Auditoría).</p>
                                </div>
                            </div>
                            
                            <textarea id="inpRawText" class="form-control" placeholder="Ejemplo: 'Para todos los despliegues en producción, el código debe pasar el linter sin warnings y la cobertura de tests debe ser superior al 80%. El responsable de esto es el rol de DevOps...'"></textarea>
                            
                            <div id="forgeLoading" class="forge-loading">
                                <span>🔮</span>
                                <p>Extrayendo Memes Estructurales...</p>
                            </div>

                            <button id="btnDistill" class="btn-forge" ${!hasKey || !isPO ? 'disabled' : ''}>
                                🧠 Destilar Conocimiento
                            </button>
                        </div>

                        <div>
                            <div class="kb-header">
                                <h3 class="kb-title"><span>🧬</span> Memética Activa del Castell</h3>
                                <span style="color:var(--text-muted); font-family:var(--font-mono); font-size:0.8rem;" id="kbCount">0 Nodos</span>
                            </div>
                            
                            <div class="lms-grid" id="kbGrid">
                                <div style="color:#666; text-align:center; padding:3rem; border:1px dashed #333; border-radius:16px; grid-column:1/-1;">
                                    El Cerebro Semántico está vacío. Inyecta la primera directriz.
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                ${BottomNav.getHtml('/lms')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        this.activeProjectId = localStorage.getItem('tt_active_project') || 'global';
        
        this.dom = {
            inpRawText: document.getElementById('inpRawText'),
            btnDistill: document.getElementById('btnDistill'),
            kbGrid: document.getElementById('kbGrid'),
            kbCount: document.getElementById('kbCount'),
            forgeLoading: document.getElementById('forgeLoading')
        };

        // 1. Iniciar IndexedDB y renderizar
        await KB.init();
        this.renderDocuments();

        // 2. Lógica de la Forja (RAG y LLM)
        if (this.dom.btnDistill) {
            this.dom.btnDistill.addEventListener('click', async () => {
                const text = this.dom.inpRawText.value.trim();
                if (!text) return alert("⚠️ Pega algún texto en la Forja antes de destilar.");

                this.dom.btnDistill.style.display = 'none';
                this.dom.inpRawText.style.display = 'none';
                this.dom.forgeLoading.style.display = 'flex';

                try {
                    await this.distillKnowledge(text);
                    this.dom.inpRawText.value = ''; // Limpiar tras éxito
                } catch (error) {
                    console.error("Error en la Forja:", error);
                    alert(`Fallo en la destilación: ${error.message}`);
                } finally {
                    this.dom.forgeLoading.style.display = 'none';
                    this.dom.inpRawText.style.display = 'block';
                    this.dom.btnDistill.style.display = 'flex';
                    this.renderDocuments();
                }
            });
        }
    }

    async distillKnowledge(rawText) {
        const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        const apiKey = localStorage.getItem(`tt_key_${provider}`);
        if (!apiKey) throw new Error("API Key no configurada.");

        // SYSTEM PROMPT DEL MESTRE D'ESCOLA
        const systemPrompt = `
            Actúa como @mestre_escola, el Maestro del Conocimiento de TeamTowers V14.
            Tu función es destilar texto bruto (manuales, reglas, notas) en "Memes" estructurados bajo la taxonomía W3C.
            
            Tipos de Memes (categories):
            - "SOP" (Standard Operating Procedure): Un proceso paso a paso.
            - "SOC" (Standard Operating Condition): Una métrica binaria estricta de auditoría (ej: "Cobertura de test > 80%").
            - "SKILL": Una habilidad dura o blanda requerida.
            - "RULE": Una regla general del negocio.

            ANALIZA el texto del usuario y extrae todos los memes posibles.
            DEVUELVE ÚNICAMENTE un objeto JSON con este formato exacto:
            {
                "memes": [
                    {
                        "category": "SOC",
                        "title": "Título corto",
                        "content": "Descripción detallada y accionable de la regla o procedimiento...",
                        "keywords": ["tag1", "tag2"],
                        "roleTarget": "Global" // O el rol específico si se menciona, ej: "@baixos"
                    }
                ]
            }
        `;

        const response = await Orchestrator.callLLM({
            provider, 
            apiKey, 
            systemPrompt, 
            userPrompt: rawText, 
            responseFormat: "json_object",
            temperature: 0.1 // Frío y estructurado
        });

        const data = response.content;
        
        if (!data || !data.memes || !Array.isArray(data.memes)) {
            throw new Error("La IA no devolvió el formato JSON estructurado correcto.");
        }

        if (data.memes.length === 0) {
            throw new Error("No se extrajo ningún conocimiento útil del texto.");
        }

        // Guardar cada Meme en la KB Local (IndexedDB)
        for (const meme of data.memes) {
            await KB.saveNode({
                id: `meme_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: 'meme',
                category: meme.category || 'RULE',
                projectId: this.activeProjectId,
                targetId: 'global', // Opcional: enlazar a un rol si existe
                roleTarget: meme.roleTarget || 'Global',
                title: meme.title || 'Directriz',
                content: meme.content,
                keywords: meme.keywords || []
            });
        }
    }

    async renderDocuments() {
        if (!this.dom.kbGrid) return;
        
        // Recuperamos todos los memes del proyecto y los globales
        const projectDocs = await KB.getAllDocuments(this.activeProjectId);
        const globalDocs = this.activeProjectId !== 'global' ? await KB.getAllDocuments('global') : [];
        
        // Filtramos para no duplicar y priorizar los del proyecto
        const allDocs = [...projectDocs];
        globalDocs.forEach(gd => { if (!allDocs.find(d => d.id === gd.id)) allDocs.push(gd); });

        const memes = allDocs.filter(d => d.type === 'meme' || d.type === 'document'); // Compatibilidad legacy

        this.dom.kbCount.innerText = `${memes.length} Nodos Semánticos`;

        if (memes.length === 0) {
            this.dom.kbGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; border:1px dashed #444; border-radius:16px; color:#888;">El Cerebro Semántico está vacío. Inyecta la primera directriz en la Forja.</div>`;
            return;
        }

        // Renderizado Inyectando Web Components (<tt-knowledge-card>)
        this.dom.kbGrid.innerHTML = memes.reverse().map(doc => {
            const jsonldString = JSON.stringify(doc.jsonLd || {}).replace(/"/g, '&quot;');
            const categoryBadge = doc.category ? `<span style="background:var(--accent-purple); color:white; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-family:monospace;">${doc.category}</span>` : '';
            
            return `
                <div style="position: relative;">
                    <tt-knowledge-card 
                        data-title="${doc.title}" 
                        data-role="${doc.roleTarget || 'Global'}" 
                        data-content="${doc.content}"
                        data-jsonld="${jsonldString}">
                    </tt-knowledge-card>
                    <div style="position:absolute; top:-10px; right:10px; z-index:10;">${categoryBadge}</div>
                </div>
            `;
        }).join('');
    }
}
