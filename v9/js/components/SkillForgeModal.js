// v9/js/components/SkillForgeModal.js
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

const TAXONOMY_OPTIONS = `
    <optgroup label="Agentes y Nodos">
        <option value="agent">🤖 Agente IA / Persona</option>
        <option value="role">🪑 Silla / Rol VNA</option>
    </optgroup>
    <optgroup label="Skills del Panteón">
        <option value="skill">🎒 Skill (General)</option>
        <option value="core.architecture">🌌 Arquitectura & VNA</option>
        <option value="core.economy">⚖️ Economía & Ledger</option>
        <option value="core.cognition">🧠 Cognición & Ontología</option>
        <option value="core.execution">⚡ Ejecución & Código</option>
        <option value="core.culture">🎭 Cultura & Caos</option>
    </optgroup>
    <optgroup label="Recursos">
        <option value="reference">📚 Referencia (Teoría/Docs)</option>
        <option value="eval">📋 Eval (Test Case)</option>
        <option value="script">⚡ Script (Ejecutable)</option>
    </optgroup>
`;

export class SkillForgeModal {
    constructor(mountPointId) {
        this.container = document.getElementById(mountPointId);
        this.draftMemory = null;
        this.allNodesCache = [];
        this.linkedState = { references: [], evals: [], scripts: [] };
        
        this.initGlobalListener();
    }

    initGlobalListener() {
        document.body.addEventListener('click', (e) => {
            const badge = e.target.closest('.universal-skill-badge');
            if (badge && badge.dataset.skillId) {
                window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: badge.dataset.skillId } }));
            }
        });
    }

    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <style>
                .sfm-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(5,5,8,0.85); backdrop-filter: blur(15px); z-index: 6000; display: none; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s;}
                .sfm-overlay.active { display: flex; opacity: 1; }
                .sfm-card { background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(10,10,15,0.98)); border: 1px solid var(--accent-blue); border-radius: 24px; width: 100%; max-width: 1100px; padding: 2.5rem; box-shadow: 0 30px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 95vh; overflow-y: auto; display:flex; flex-direction:column; box-sizing: border-box;}
                .sfm-overlay.active .sfm-card { transform: translateY(0); }
                
                .sfm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 1.5rem;}
                .sfm-header h2 { margin: 0; color: white; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px; display:flex; align-items:center; gap:10px;}
                .sfm-btn-close { background: transparent; border: none; color: #888; font-size: 2.5rem; cursor: pointer; transition: 0.2s; line-height: 1;}
                .sfm-btn-close:hover { color: var(--accent-red); transform: scale(1.1);}
                
                .sfm-body-grid { display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 30px; flex: 1;}
                
                .sfm-form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;}
                .sfm-form-group label { color: var(--accent-blue); font-size: 0.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display:flex; justify-content:space-between;}
                
                .sfm-form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 14px 16px; border-radius: 12px; font-family: var(--font-main); font-size: 1rem; outline: none; transition: 0.2s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .sfm-form-control:focus { border-color: var(--accent-blue); box-shadow: inset 0 2px 5px rgba(0,0,0,0.3), 0 0 15px rgba(0,176,255,0.15);}
                .sfm-textarea { min-height: 350px; resize: vertical; font-family: var(--font-mono); line-height: 1.6; font-size: 0.9rem; background: #050508;}
                
                select.sfm-form-control optgroup { background: #111; color: var(--accent-purple); font-family: var(--font-mono); padding: 5px; }
                select.sfm-form-control option { background: #0a0a0a; color: white; padding: 5px; font-family: var(--font-main); }

                /* 🔥 SMART INPUTS (Multi-Select Deluxe) */
                .sfm-smart-input-box { background: rgba(0,0,0,0.5); border: 1px solid #444; border-radius: 12px; padding: 8px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); transition: 0.2s; position: relative;}
                .sfm-smart-input-box:focus-within { border-color: var(--accent-purple); box-shadow: inset 0 2px 5px rgba(0,0,0,0.3), 0 0 15px rgba(224,64,251,0.15);}
                .sfm-smart-input { background: transparent; border: none; color: white; outline: none; font-family: var(--font-mono); font-size: 0.85rem; flex: 1; min-width: 150px; padding: 4px;}
                .sfm-dropdown { position: absolute; top: 100%; left: 0; width: 100%; background: rgba(15,15,20,0.95); backdrop-filter: blur(20px); border: 1px solid var(--accent-purple); border-radius: 12px; margin-top: 5px; z-index: 100; max-height: 250px; overflow-y: auto; display: none; box-shadow: 0 10px 30px rgba(0,0,0,0.8);}
                .sfm-dd-item { padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: 0.2s;}
                .sfm-dd-item:hover { background: rgba(224,64,251,0.1); }
                .sfm-dd-title { color: white; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;}
                .sfm-dd-meta { color: #888; font-size: 0.75rem; font-family: var(--font-mono);}
                .sfm-dd-create { color: var(--accent-green); font-weight: bold; padding: 12px 15px; cursor: pointer; text-align: center; border-top: 1px dashed var(--accent-green); background: rgba(0,230,118,0.05);}
                .sfm-dd-create:hover { background: var(--accent-green); color: black;}

                /* Badges en el Smart Input */
                .sfm-badge { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; cursor: pointer; transition: 0.2s; font-weight: bold; font-family: var(--font-mono); display:flex; align-items:center; gap:6px;}
                .sfm-badge:hover { filter: brightness(1.2); }
                .sfm-badge .del { font-size: 1rem; line-height: 1; cursor: pointer; opacity: 0.7; }
                .sfm-badge .del:hover { opacity: 1; color: white; }
                
                .badge-ref { background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue);}
                .badge-eval { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange);}
                .badge-script { background: rgba(0,230,118,0.1); border: 1px solid var(--accent-green); color: var(--accent-green);}

                /* CHAT-EVOLVER */
                .sfm-chat-box { background: rgba(0,176,255,0.05); border: 1px dashed var(--accent-blue); padding: 20px; border-radius: 16px; margin-bottom: 25px; transition: 0.3s;}
                .sfm-chat-box:focus-within { border-style: solid; background: rgba(0,176,255,0.08); box-shadow: 0 0 20px rgba(0,176,255,0.1); }
                .sfm-chat-box label { color:var(--accent-blue); font-weight:900; font-size:0.85rem; margin-bottom:12px; display:flex; align-items:center; gap:8px; text-transform: uppercase; letter-spacing: 1px;}
                
                .sfm-draft-banner { display:none; background: rgba(255,145,0,0.1); border: 1px solid var(--accent-orange); border-radius: 16px; padding: 20px; margin-bottom: 25px; color: #fff;}
                .sfm-draft-banner.active { display: block; animation: fadeIn 0.3s; }
                .sfm-draft-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;}
                .sfm-draft-title { font-weight: 900; color: var(--accent-orange); font-size: 1.2rem;}
                
                .sfm-actions { display: flex; justify-content: flex-end; flex-wrap:wrap; gap: 15px; margin-top: 2rem; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 2rem;}
                .sfm-btn { padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: 0.3s; border: none;}
                .sfm-btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; box-shadow: 0 5px 20px rgba(0,176,255,0.3);}
                .sfm-btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224,64,251,0.5); filter: brightness(1.2);}
                .sfm-btn-danger { background: transparent; border: 1px solid var(--accent-red); color: var(--accent-red);}
                .sfm-btn-danger:hover { background: rgba(255,82,82,0.1); transform: translateY(-2px);}
                .sfm-btn-expand { background: linear-gradient(135deg, var(--accent-orange), #ff3d00); color: white; box-shadow: 0 5px 15px rgba(255,171,64,0.3); display:flex; align-items:center; gap:8px;}
                .sfm-btn-expand:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,171,64,0.5); filter: brightness(1.2); }
                .sfm-btn-export { background: transparent; border: 1px dashed #aaa; color: #ccc; }
                .sfm-btn-export:hover { background: rgba(255,255,255,0.05); color:white; border-style: solid;}

                @media (max-width: 900px) { .sfm-body-grid { grid-template-columns: 1fr; } .sfm-actions { flex-direction: column; } .sfm-btn { width: 100%; } }
            </style>

            <div class="sfm-overlay" id="editModal">
                <div class="sfm-card">
                    <div class="sfm-header">
                        <h2 id="sfmHeaderTitle">🧠 Forja de Entidad</h2>
                        <button class="sfm-btn-close" id="btnCloseModal">&times;</button>
                    </div>
                    
                    <input type="hidden" id="editNodeId">
                    <input type="hidden" id="editNodeProjectId">
                    
                    <div class="sfm-draft-banner" id="draftBanner">
                        <div class="sfm-draft-header">
                            <span class="sfm-draft-title">✨ Mutación Propuesta por @agent_skill_crafter</span>
                            <div style="display: flex; gap: 10px;">
                                <button class="sfm-btn sfm-btn-danger" id="btnDiscardDraft" style="padding: 8px 15px; font-size:0.85rem;">Descartar</button>
                                <button class="sfm-btn" id="btnApplyDraft" style="padding: 8px 15px; font-size:0.85rem; background:var(--accent-green); color:black;">✅ Aceptar Mutación</button>
                            </div>
                        </div>
                        <div style="font-size: 0.95rem; line-height:1.5;">Revisa el código generado. Acéptalo para prepararlo, y luego pulsa "Sellar Mutación Definitiva" para inyectarlo en el Kernel.</div>
                    </div>

                    <div class="sfm-chat-box" id="chatEvolutionBox">
                        <label>💬 Dicta la Evolución (Chat Contextual)</label>
                        <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
                            <input type="text" id="aiEvolutionPrompt" class="sfm-form-control" placeholder="Ej: Rediseña el SOP para que sea más estricto con el CSS..." style="flex:1; min-width:250px;">
                            <button class="sfm-btn sfm-btn-expand" id="btnExpandNode">🌱 Evolucionar / Generar</button>
                        </div>
                        <div style="font-size:0.8rem; color:#888; margin-top:10px; font-style:italic;">Dejar en blanco aplica una Meta-Compresión (Antigravity Dry-Run).</div>
                    </div>

                    <div class="sfm-body-grid">
                        <div style="display:flex; flex-direction:column;">
                            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                                <div class="sfm-form-group" style="flex:1; min-width:200px;">
                                    <label>Categoría Taxonómica</label>
                                    <select id="editNodeCat" class="sfm-form-control">
                                        ${TAXONOMY_OPTIONS}
                                    </select>
                                </div>
                                <div class="sfm-form-group" style="flex:2; min-width:250px;">
                                    <label id="lblNodeTitle">Nombre de la Entidad</label>
                                    <input type="text" id="editNodeTitle" class="sfm-form-control" placeholder="Ej: Skill UI Forge">
                                </div>
                            </div>
                            
                            <div class="sfm-form-group">
                                <label>
                                    <span>Descripción (Trigger RAG)</span>
                                    <span style="color:#888; font-size:0.7rem; font-family:var(--font-mono);">Max 300 chars (agentskills.io)</span>
                                </label>
                                <input type="text" id="editNodeDesc" class="sfm-form-control" maxlength="300" placeholder="Explica exactamente CUÁNDO y POR QUÉ invocar esta entidad...">
                            </div>

                            <div class="sfm-form-group" style="flex:1; display:flex; flex-direction:column; margin-bottom:0;">
                                <label id="lblNodeContent">Códice Operativo (VNA / SOP / SOC)</label>
                                <textarea id="editNodeContent" class="sfm-form-control sfm-textarea" placeholder="[VNA_NODE]... [SOP]... [SOC]..."></textarea>
                            </div>
                        </div>

                        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; height: fit-content; display:flex; flex-direction:column; gap:20px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                            <div class="sfm-form-group" style="margin:0;">
                                <label style="color:var(--accent-blue);">📚 Referencias (Teoría / Docs)</label>
                                <div class="sfm-smart-input-box" id="box-refs">
                                    <div id="tags-refs" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
                                    <input type="text" class="sfm-smart-input" data-type="reference" placeholder="Buscar o crear ref...">
                                    <div class="sfm-dropdown"></div>
                                </div>
                            </div>
                            
                            <div class="sfm-form-group" style="margin:0;">
                                <label style="color:var(--accent-orange);">📋 Evals (Test Cases TDD)</label>
                                <div class="sfm-smart-input-box" id="box-evals">
                                    <div id="tags-evals" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
                                    <input type="text" class="sfm-smart-input" data-type="eval" placeholder="Buscar o crear eval...">
                                    <div class="sfm-dropdown"></div>
                                </div>
                            </div>
                            
                            <div class="sfm-form-group" style="margin:0;">
                                <label style="color:var(--accent-green);">⚡ Scripts Ejecutables</label>
                                <div class="sfm-smart-input-box" id="box-scripts">
                                    <div id="tags-scripts" style="display:flex; flex-wrap:wrap; gap:5px;"></div>
                                    <input type="text" class="sfm-smart-input" data-type="script" placeholder="Buscar o crear script...">
                                    <div class="sfm-dropdown"></div>
                                </div>
                            </div>

                            <div class="sfm-form-group" style="margin:0; border-top: 1px dashed #333; padding-top: 20px; margin-top: 10px;">
                                <label style="color:var(--accent-purple);">🏷️ Tags (Gravedad 3D / Comas)</label>
                                <input type="text" id="editNodeKeywords" class="sfm-form-control" style="font-family:var(--font-mono); font-size:0.85rem;" placeholder="#tag1, #tag2">
                            </div>
                        </div>
                    </div>

                    <div class="sfm-actions">
                        <button class="sfm-btn sfm-btn-danger" id="btnDeleteNode">🗑️ Purgar Entidad</button>
                        <button class="sfm-btn sfm-btn-export" id="btnExportSkill">📦 Exportar ZIP</button>
                        <div style="flex:1;"></div>
                        <button class="sfm-btn sfm-btn-save" id="btnSaveNode">💾 Sellar Mutación Definitiva</button>
                    </div>
                </div>
            </div>
        `;

        this.dom = {
            modal: this.container.querySelector('#editModal'),
            btnClose: this.container.querySelector('#btnCloseModal'),
            btnSave: this.container.querySelector('#btnSaveNode'),
            btnDelete: this.container.querySelector('#btnDeleteNode'),
            btnExpand: this.container.querySelector('#btnExpandNode'),
            btnExport: this.container.querySelector('#btnExportSkill'),
            
            headerTitle: this.container.querySelector('#sfmHeaderTitle'),
            lblTitle: this.container.querySelector('#lblNodeTitle'),
            lblContent: this.container.querySelector('#lblNodeContent'),

            inpId: this.container.querySelector('#editNodeId'),
            inpProjId: this.container.querySelector('#editNodeProjectId'),
            inpCat: this.container.querySelector('#editNodeCat'),
            inpTitle: this.container.querySelector('#editNodeTitle'),
            inpDesc: this.container.querySelector('#editNodeDesc'),
            inpContent: this.container.querySelector('#editNodeContent'),
            inpKeywords: this.container.querySelector('#editNodeKeywords'),
            
            draftBanner: this.container.querySelector('#draftBanner'),
            btnApplyDraft: this.container.querySelector('#btnApplyDraft'),
            btnDiscardDraft: this.container.querySelector('#btnDiscardDraft'),
            
            chatInput: this.container.querySelector('#aiEvolutionPrompt'),
            chatBox: this.container.querySelector('#chatEvolutionBox')
        };

        this.setupEvents();
        this.setupSmartInputs();
    }

    // 🔥 SMART INPUTS LOGIC (Fuzzy Search & Creation)
    setupSmartInputs() {
        const inputs = this.container.querySelectorAll('.sfm-smart-input');
        
        inputs.forEach(input => {
            const type = input.dataset.type; // reference, eval, script
            const box = input.closest('.sfm-smart-input-box');
            const dropdown = box.querySelector('.sfm-dropdown');

            input.addEventListener('input', () => {
                const val = input.value.toLowerCase().trim();
                dropdown.innerHTML = '';
                if (!val) { dropdown.style.display = 'none'; return; }

                const matches = this.allNodesCache.filter(n => 
                    (n.type === type || n.category === type || (n.id && n.id.includes(type))) && 
                    (n.title?.toLowerCase().includes(val) || n.id.toLowerCase().includes(val))
                );

                const renderItem = (n) => `
                    <div class="sfm-dd-item" data-id="${n.id}">
                        <div class="sfm-dd-title">${this.getIconForType(type)} ${n.title || n.id}</div>
                        <div class="sfm-dd-meta">${n.description ? n.description.substring(0,40)+'...' : n.category || 'Sin descripción'}</div>
                    </div>
                `;

                if (matches.length > 0) {
                    dropdown.innerHTML = matches.slice(0, 5).map(renderItem).join('');
                }

                dropdown.innerHTML += `<div class="sfm-dd-create" data-create="${val}">➕ Crear entidad '${val}'</div>`;
                dropdown.style.display = 'block';

                dropdown.querySelectorAll('.sfm-dd-item').forEach(item => {
                    item.addEventListener('click', () => {
                        this.addSmartTag(type, item.dataset.id);
                        input.value = ''; dropdown.style.display = 'none';
                    });
                });

                dropdown.querySelector('.sfm-dd-create').addEventListener('click', async (e) => {
                    const newTitle = e.target.dataset.create;
                    const newId = `${type}_${Date.now()}`;
                    await KB.init();
                    await KB.saveNode({ id: newId, type: type, category: type, projectId: 'global', targetId: 'global', title: newTitle, content: `[DRAFT] Contenido para ${newTitle}...` });
                    this.allNodesCache = await KB.getAllNodes(); // refrescar cache
                    this.addSmartTag(type, newId);
                    input.value = ''; dropdown.style.display = 'none';
                });
            });

            document.addEventListener('click', (e) => { if (!box.contains(e.target)) dropdown.style.display = 'none'; });
        });
    }

    addSmartTag(type, id) {
        if (!this.linkedState[type + 's']) this.linkedState[type + 's'] = [];
        if (!this.linkedState[type + 's'].includes(id)) {
            this.linkedState[type + 's'].push(id);
            this.renderSmartTags(type);
        }
    }

    removeSmartTag(type, id) {
        this.linkedState[type + 's'] = this.linkedState[type + 's'].filter(x => x !== id);
        this.renderSmartTags(type);
    }

    renderSmartTags(type) {
        const container = this.container.querySelector(`#tags-${type}s`);
        if (!container) return;
        const icon = this.getIconForType(type);
        const colorClass = type === 'reference' ? 'badge-ref' : (type === 'eval' ? 'badge-eval' : 'badge-script');
        
        container.innerHTML = this.linkedState[type + 's'].map(id => {
            const node = this.allNodesCache.find(n => n.id === id);
            const title = node ? node.title : id;
            return `
                <span class="sfm-badge ${colorClass}">
                    <span title="Inspeccionar" onclick="window.dispatchEvent(new CustomEvent('open-forge-modal', {detail:{nodeId:'${id}'}}))">${icon} ${title}</span>
                    <span class="del" data-type="${type}" data-id="${id}">&times;</span>
                </span>
            `;
        }).join('');

        container.querySelectorAll('.del').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this.removeSmartTag(e.target.dataset.type, e.target.dataset.id); });
        });
    }

    getIconForType(type) { return type === 'reference' ? '📚' : (type === 'eval' ? '📋' : '⚡'); }

    // 🔥 LÓGICA CORE: IMPORTACIÓN DE .SKILL
    async parseZipSkillFile(file, dropzoneElement = null) {
        if (!window.JSZip) await this.loadJSZip();
        try {
            if (dropzoneElement) {
                dropzoneElement.innerHTML = `<span style="font-size:2rem; animation:pulse 1s infinite;">⏳</span><br>Desempaquetando Entidad...`;
            }
            const zip = new window.JSZip();
            const contents = await zip.loadAsync(file);
            
            const skillFileKey = Object.keys(contents.files).find(k => k.endsWith('SKILL.md'));
            if (!skillFileKey) throw new Error("No es una skill válida. Falta SKILL.md");
            
            const skillText = await contents.files[skillFileKey].async("text");
            const nameMatch = skillText.match(/name:\s*(.+)/);
            const descMatch = skillText.match(/description:\s*(.+)/);
            const title = nameMatch ? nameMatch[1].trim() : file.name.replace('.skill', '');
            const desc = descMatch ? descMatch[1].trim() : 'Skill inyectada desde paquete.';
            
            // Quitar el frontmatter yaml
            const content = skillText.replace(/^---\n([\s\S]*?)\n---\n/, '').trim();

            const newNodeId = `skill_imported_${Date.now()}`;
            const linkedRefs = [];
            const linkedEvals = [];
            const linkedScripts = [];

            await KB.init();

            // Referencias
            const refFiles = Object.keys(contents.files).filter(k => k.includes('references/') && k.endsWith('.md'));
            for (const rKey of refFiles) {
                const rText = await contents.files[rKey].async("text");
                const rNameMatch = rText.match(/name:\s*(.+)/);
                const rTitle = rNameMatch ? rNameMatch[1].trim() : rKey.split('/').pop();
                const rContent = rText.replace(/^---\n([\s\S]*?)\n---\n/, '').trim();
                const rId = `ref_imp_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id: rId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global', title: rTitle, content: rContent });
                linkedRefs.push(rId);
            }

            // Evals
            const evalFiles = Object.keys(contents.files).filter(k => k.includes('evals/') && k.endsWith('.json'));
            for (const eKey of evalFiles) {
                const eText = await contents.files[eKey].async("text");
                const eParsed = JSON.parse(eText);
                const evalsArray = eParsed.evals || eParsed;
                const eId = `eval_imp_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id: eId, type: 'eval', category: 'eval', projectId: 'global', targetId: 'global', title: `Evals para ${title}`, content: JSON.stringify(evalsArray) });
                linkedEvals.push(eId);
            }

            // Scripts
            const scriptFiles = Object.keys(contents.files).filter(k => k.includes('scripts/') && !k.endsWith('/'));
            for (const sKey of scriptFiles) {
                const sText = await contents.files[sKey].async("text");
                const sTitle = sKey.split('/').pop();
                const sId = `script_imp_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                await KB.saveNode({ id: sId, type: 'script', category: 'script', projectId: 'global', targetId: 'global', title: sTitle, content: sText });
                linkedScripts.push(sId);
            }

            await KB.saveNode({ 
                id: newNodeId, type: 'skill', category: 'skill', projectId: 'global', targetId: 'global', 
                title: title, description: desc, content: content,
                references: linkedRefs, evals: linkedEvals, scripts: linkedScripts,
                keywords: ['#imported_skill']
            });

            if (dropzoneElement) {
                dropzoneElement.innerHTML = `<span style="font-size:2rem; color:var(--accent-green);">✅</span><br>¡Entidad <b>${title}</b> inyectada en el Córtex!`;
                setTimeout(() => {
                    dropzoneElement.innerHTML = `<span style="font-size:2rem;">📥</span><span>Arrastra un <b>.agent</b> o <b>.skill</b> aquí.</span>`;
                }, 3000);
            }
            return newNodeId;

        } catch (e) { 
            console.error(e);
            if (dropzoneElement) {
                dropzoneElement.innerHTML = `<span style="font-size:2rem; color:var(--accent-red);">❌</span><br>Error: ${e.message}`;
                setTimeout(() => {
                    dropzoneElement.innerHTML = `<span style="font-size:2rem;">📥</span><span>Arrastra un <b>.agent</b> o <b>.skill</b> aquí.</span>`;
                }, 3000);
            }
            alert("Fallo inyectando paquete: " + e.message); 
            return null; 
        }
    }

    loadJSZip() {
        return new Promise((resolve) => {
            if (window.JSZip) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    async openEditor(nodeId) {
        await KB.init();
        this.allNodesCache = await KB.getAllNodes(); 
        
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');
        this.dom.chatBox.style.display = 'block';
        this.dom.chatInput.value = '';
        
        this.linkedState = { references: [], evals: [], scripts: [] };

        if (!nodeId) {
            this.dom.inpId.value = '';
            this.dom.inpProjId.value = 'global';
            this.dom.inpCat.value = 'skill';
            this.dom.inpTitle.value = '';
            this.dom.inpDesc.value = '';
            this.dom.inpContent.value = '';
            this.dom.inpKeywords.value = '';
            
            this.updateLabels('skill');
            this.renderSmartTags('reference'); this.renderSmartTags('eval'); this.renderSmartTags('script');
            this.dom.btnDelete.style.display = 'none';
        } else {
            const node = this.allNodesCache.find(n => n.id === nodeId);
            if (!node) return;

            this.dom.inpId.value = node.id;
            this.dom.inpProjId.value = node.projectId || 'global';
            
            let catMatch = Array.from(this.dom.inpCat.options).find(opt => opt.value === node.category);
            this.dom.inpCat.value = catMatch ? node.category : 'skill';
            
            this.dom.inpTitle.value = node.title || '';
            this.dom.inpDesc.value = node.description || '';
            this.dom.inpContent.value = node.content || '';
            this.dom.inpKeywords.value = (node.keywords && Array.isArray(node.keywords)) ? node.keywords.join(', ') : (node.keywords || '');
            
            this.linkedState.references = (node.references && Array.isArray(node.references)) ? node.references : [];
            this.linkedState.evals = (node.evals && Array.isArray(node.evals)) ? node.evals : [];
            this.linkedState.scripts = (node.scripts && Array.isArray(node.scripts)) ? node.scripts : [];
            
            this.renderSmartTags('reference'); this.renderSmartTags('eval'); this.renderSmartTags('script');
            this.updateLabels(this.dom.inpCat.value);

            const isKernel = this.dom.inpKeywords.value.includes('#core_sos');
            this.dom.btnDelete.style.display = isKernel ? 'none' : 'block';
        }

        this.dom.modal.classList.add('active');
    }

    updateLabels(category) {
        const isAgentOrRole = category === 'agent' || category === 'role';
        const isResource = category === 'reference' || category === 'eval' || category === 'script';
        
        this.dom.headerTitle.innerHTML = isAgentOrRole ? '🧠 Forja de Agente/Rol' : (isResource ? '🛠️ Forja de Recurso' : '🎒 Forja de Skill');
        this.dom.lblTitle.innerText = isAgentOrRole ? 'Nombre de la Entidad' : 'Nombre del Nodo';
        this.dom.lblContent.innerText = isAgentOrRole ? 'System Prompt (AGENT.md)' : (isResource ? 'Contenido Bruto (Markdown/Code)' : 'Códice Operativo (VNA / SOP / SOC)');
    }

    closeEditor() { 
        this.dom.modal.classList.remove('active'); 
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');
    }

    setupEvents() {
        window.addEventListener('open-forge-modal', (e) => {
            document.querySelectorAll('.profile-modal-overlay').forEach(m => m.style.display = 'none');
            this.openEditor(e.detail.nodeId);
        });
        
        this.dom.btnClose.addEventListener('click', () => this.closeEditor());
        this.dom.modal.addEventListener('click', (e) => { if (e.target === this.dom.modal) this.closeEditor(); });
        
        this.dom.inpCat.addEventListener('change', (e) => this.updateLabels(e.target.value));

        this.dom.btnExpand.addEventListener('click', async () => {
            const title = this.dom.inpTitle.value.trim();
            const rawContent = this.dom.inpContent.value.trim();
            const cat = this.dom.inpCat.value;
            const tags = this.dom.inpKeywords.value.trim();
            const aiInstruction = this.dom.chatInput.value.trim();
            
            if (!title) return alert("Se necesita un título para que la IA sepa qué desarrollar.");

            let contentToAI = rawContent;
            if (aiInstruction) contentToAI += `\n\n[DIRECTIVA]:\n${aiInstruction}`;

            this.draftMemory = { title, desc: this.dom.inpDesc.value, content: rawContent, keywords: tags, linked: JSON.parse(JSON.stringify(this.linkedState)) };

            this.dom.btnExpand.disabled = true; this.dom.btnExpand.innerHTML = "⏳ Córtex Evolucionando..."; this.dom.chatInput.disabled = true;

            try {
                const optimizedData = await Orchestrator.expandNodeSemantics(title, cat, contentToAI, tags);
                
                this.dom.inpTitle.value = optimizedData.title;
                this.dom.inpDesc.value = optimizedData.description || '';
                this.dom.inpContent.value = optimizedData.content;
                this.dom.inpKeywords.value = optimizedData.keywords.join(', ');
                
                if (optimizedData.reference_docs && optimizedData.reference_docs.length > 0) {
                    await KB.init();
                    let currentRefs = this.linkedState.references;
                    for (const refDoc of optimizedData.reference_docs) {
                        const cleanName = refDoc.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20);
                        const newRefId = `ref_draft_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                        await KB.saveNode({ id: newRefId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global', title: refDoc.title, description: refDoc.description, content: refDoc.content, keywords: ['#ai_draft_ref'] });
                        this.addSmartTag('reference', newRefId);
                    }
                }
                
                this.dom.chatBox.style.display = 'none'; this.dom.draftBanner.classList.add('active');
            } catch (error) { alert("Fallo en la evolución: " + error.message); this.draftMemory = null; } 
            finally { this.dom.btnExpand.disabled = false; this.dom.btnExpand.innerHTML = "🌱 Evolucionar / Generar"; this.dom.chatInput.disabled = false; }
        });

        this.dom.btnDiscardDraft.addEventListener('click', async () => {
            if (!this.draftMemory) return;
            this.dom.inpTitle.value = this.draftMemory.title;
            this.dom.inpDesc.value = this.draftMemory.desc;
            this.dom.inpContent.value = this.draftMemory.content;
            this.dom.inpKeywords.value = this.draftMemory.keywords;
            this.linkedState = this.draftMemory.linked;
            
            this.renderSmartTags('reference'); this.renderSmartTags('eval'); this.renderSmartTags('script');
            this.dom.draftBanner.classList.remove('active'); this.dom.chatBox.style.display = 'block'; this.draftMemory = null;
        });

        this.dom.btnApplyDraft.addEventListener('click', () => {
            this.dom.draftBanner.classList.remove('active'); this.dom.chatBox.style.display = 'block'; this.dom.chatInput.value = ''; this.draftMemory = null;
            this.dom.btnSave.style.boxShadow = "0 0 30px rgba(0, 230, 118, 0.8)"; setTimeout(() => this.dom.btnSave.style.boxShadow = "", 1500);
        });

        this.dom.btnSave.addEventListener('click', async () => {
            if (this.draftMemory) return alert("Acepta o descarta el draft antes de sellar.");
            const title = this.dom.inpTitle.value.trim(), content = this.dom.inpContent.value.trim();
            if (!title || !content) return alert("Título y contenido obligatorios.");
            
            const id = this.dom.inpId.value || `node_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
            const type = this.dom.inpCat.value.split('.')[0] || 'custom'; 

            await KB.init();
            const allNodes = await KB.getAllNodes();
            const oldNode = allNodes.find(n => n.id === id) || {};
            
            const updatedNode = { 
                ...oldNode, id, type, projectId: this.dom.inpProjId.value || 'global', 
                category: this.dom.inpCat.value, title, description: this.dom.inpDesc.value.trim(), content, 
                keywords: this.dom.inpKeywords.value.split(',').map(k=>k.trim()).filter(k=>k), 
                references: this.linkedState.references, evals: this.linkedState.evals, scripts: this.linkedState.scripts  
            };

            this.dom.btnSave.disabled = true; this.dom.btnSave.innerText = "⏳ Sellando...";
            try {
                await KB.saveNode(updatedNode);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                this.closeEditor();
            } catch (e) { alert(`Error al guardar: ${e.message}`); } 
            finally { this.dom.btnSave.disabled = false; this.dom.btnSave.innerText = "💾 Sellar Mutación Definitiva"; }
        });

        this.dom.btnDelete.addEventListener('click', async () => {
            if (this.dom.inpKeywords.value.includes('#core_sos')) return alert("Las Skills Core están protegidas.");
            if (!confirm("⚠️ ¿Purgar este nodo de la red para siempre?")) return;
            this.dom.btnDelete.disabled = true;
            try { await KB.init(); await KB.deleteNode(this.dom.inpId.value); window.dispatchEvent(new CustomEvent('refresh-lms-data')); this.closeEditor(); } 
            catch (e) { alert(`Error: ${e.message}`); } finally { this.dom.btnDelete.disabled = false; }
        });

        // 🔥 EXPORTACIÓN ZIP (Restaurada al 100%)
        this.dom.btnExport.addEventListener('click', async () => {
            if (!window.JSZip) await this.loadJSZip();
            const zip = new window.JSZip();

            const title = this.dom.inpTitle.value.trim() || 'Custom_Skill';
            const desc = this.dom.inpDesc.value.trim() || 'Skill generada por TeamTowers V9';
            const content = this.dom.inpContent.value.trim();
            
            const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
            const rootFolder = zip.folder(safeTitle);

            rootFolder.file("SKILL.md", `---\nname: ${title}\ndescription: ${desc}\n---\n\n${content}`);

            await KB.init();
            if (this.linkedState.references && this.linkedState.references.length > 0) {
                const resourcesFolder = rootFolder.folder("references");
                for (const refId of this.linkedState.references) {
                    const refNode = await KB.getNode(refId);
                    if (refNode) {
                        const refNameSafe = (refNode.title || refNode.id).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
                        resourcesFolder.file(`${refNameSafe}.md`, `---\nname: ${refNode.title}\ndescription: ${refNode.description || ''}\n---\n\n${refNode.content}`);
                    }
                }
            }
            if (this.linkedState.evals && this.linkedState.evals.length > 0) {
                const evalsFolder = rootFolder.folder("evals");
                let allEvalsJson = [];
                for (const evalId of this.linkedState.evals) {
                    const evalNode = await KB.getNode(evalId);
                    if (evalNode) {
                        try {
                            const parsed = JSON.parse(evalNode.content);
                            if (Array.isArray(parsed)) allEvalsJson.push(...parsed); else allEvalsJson.push(parsed);
                        } catch(e) { allEvalsJson.push({ id: evalNode.id, prompt: evalNode.title, description: evalNode.description }); }
                    }
                }
                if (allEvalsJson.length > 0) evalsFolder.file("evals.json", JSON.stringify({ skill_name: safeTitle, evals: allEvalsJson }, null, 2));
            }
            if (this.linkedState.scripts && this.linkedState.scripts.length > 0) {
                const scriptsFolder = rootFolder.folder("scripts");
                for (const scriptId of this.linkedState.scripts) {
                    const scriptNode = await KB.getNode(scriptId);
                    if (scriptNode) {
                        const sName = scriptNode.title.includes('.') ? scriptNode.title : `${scriptNode.title}.js`;
                        scriptsFolder.file(sName.replace(/[^a-zA-Z0-9_.-]/g, '_'), scriptNode.content);
                    }
                }
            }

            const blob = await zip.generateAsync({type:"blob"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${safeTitle}.skill`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        });
    }
}
