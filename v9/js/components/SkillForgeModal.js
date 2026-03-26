// v9/js/components/SkillForgeModal.js
import { KB } from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

export class SkillForgeModal {
    constructor(mountPointId) {
        this.container = document.getElementById(mountPointId);
        this.draftMemory = null;
        this.allNodesCache = [];
        this.initGlobalListener();
    }

    // 🔥 Escuchador Universal para cualquier "Píldora" de Skill en la app
    initGlobalListener() {
        document.body.addEventListener('click', (e) => {
            const badge = e.target.closest('.universal-skill-badge');
            if (badge) {
                const skillId = badge.dataset.skillId;
                if (skillId) window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: skillId } }));
            }
        });
    }

    async render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="modal-overlay" id="editModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <h2>🧠 Forja y Evolución de Skill</h2>
                        <button class="btn-close" id="btnCloseModal">&times;</button>
                    </div>
                    
                    <input type="hidden" id="editNodeId">
                    <input type="hidden" id="editNodeType">
                    <input type="hidden" id="editNodeProjectId">
                    
                    <div class="draft-banner" id="draftBanner">
                        <div class="draft-header">
                            <span class="draft-title">✨ Mutación Propuesta por @agent_skill_crafter</span>
                            <div class="draft-actions">
                                <button class="btn-micro discard" id="btnDiscardDraft">Descartar</button>
                                <button class="btn-micro apply" id="btnApplyDraft">Aceptar Mutación</button>
                            </div>
                        </div>
                        <div style="font-size: 0.9rem; margin-bottom: 10px;">Revisa el nuevo código generado. Si es correcto, acéptalo y luego sella la mutación en la red.</div>
                    </div>

                    <div class="chat-evolution-box" id="chatEvolutionBox">
                        <label>💬 Dicta la Evolución (Chat Contextual)</label>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input type="text" id="aiEvolutionPrompt" class="form-control" placeholder="Ej: Añade un paso en el SOP para requerir firmas multi-sig..." style="flex:1;">
                            <button class="btn-lux btn-expand" id="btnExpandNode">🌱 Generar Mutación</button>
                        </div>
                        <div style="font-size:0.7rem; color:#888; margin-top:5px; font-style:italic;">Si dejas el chat vacío, el Agente simplemente auditará y comprimirá el código actual (Filosofía Antigravity).</div>
                    </div>

                    <div class="modal-body-grid">
                        <div style="display:flex; flex-direction:column;">
                            <div style="display:flex; gap:15px;">
                                <div class="form-group" style="flex:1;">
                                    <label>Categoría</label>
                                    <input type="text" id="editNodeCat" class="form-control" placeholder="core.execution, skill...">
                                </div>
                                <div class="form-group" style="flex:2;">
                                    <label>Título del Nodo</label>
                                    <input type="text" id="editNodeTitle" class="form-control" placeholder="Título descriptivo">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Descripción Corta (Trigger para RAG)</label>
                                <input type="text" id="editNodeDesc" class="form-control" placeholder="Explica CUÁNDO debe invocar la IA esta skill...">
                            </div>

                            <div class="form-group" style="flex:1; display:flex; flex-direction:column; margin-bottom:0;">
                                <label>Instrucciones VNA (SOPs / Content)</label>
                                <textarea id="editNodeContent" class="form-control textarea" placeholder="[VNA_NODE]... [SOP]... [SOC]..."></textarea>
                            </div>
                        </div>

                        <div style="background: rgba(0,0,0,0.3); border: 1px solid #333; padding: 15px; border-radius: 12px; height: fit-content; display:flex; flex-direction:column; gap:15px;">
                            <div class="form-group" style="margin:0;">
                                <label style="color:var(--accent-blue);">📚 Referencias (Teoría en la DB)</label>
                                <input type="text" id="editNodeReferences" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="ref_1, ref_2">
                                <div id="refLinksContainer" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
                            </div>
                            
                            <div class="form-group" style="margin:0;">
                                <label style="color:var(--accent-orange);">📋 Evals (Test Cases)</label>
                                <input type="text" id="editNodeEvals" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="eval_1, eval_2">
                                <div id="evalLinksContainer" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
                            </div>
                            
                            <div class="form-group" style="margin:0;">
                                <label style="color:var(--accent-green);">⚡ Scripts Ejecutables</label>
                                <input type="text" id="editNodeScripts" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="script_1">
                                <div id="scriptLinksContainer" style="margin-top: 5px; display: flex; gap: 5px; flex-wrap: wrap;"></div>
                            </div>

                            <div class="form-group" style="margin:0;">
                                <label style="color:var(--accent-purple);">🏷️ Tags (Gravedad 3D)</label>
                                <input type="text" id="editNodeKeywords" class="form-control" style="font-family:var(--font-mono); font-size:0.8rem;" placeholder="#tag1, #tag2">
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn-modal btn-danger" id="btnDeleteNode">🗑️ Purgar de la Red</button>
                        <button class="btn-modal btn-export" id="btnExportSkill">📦 Exportar (.skill)</button>
                        <div style="flex:1;"></div>
                        <button class="btn-modal btn-save" id="btnSaveNode">💾 Sellar Mutación Definitiva</button>
                    </div>
                </div>
            </div>
            
            <style>
                /* Estilos encapsulados para el Modal */
                .chat-evolution-box { background: rgba(0,176,255,0.05); border: 1px dashed var(--accent-blue); padding: 15px; border-radius: 12px; margin-bottom: 20px; transition: 0.3s;}
                .chat-evolution-box:focus-within { border-style: solid; background: rgba(0,176,255,0.08); box-shadow: 0 0 20px rgba(0,176,255,0.1); }
                .chat-evolution-box label { color:var(--accent-blue); font-weight:bold; font-size:0.8rem; margin-bottom:8px; display:block; text-transform: uppercase; letter-spacing: 1px;}
                
                .universal-skill-badge { background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.3); color: var(--accent-green); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 5px;}
                .universal-skill-badge:hover { background: var(--accent-green); color: black; box-shadow: 0 0 10px rgba(0,230,118,0.4); transform: translateY(-1px);}
            </style>
        `;

        this.dom = {
            modal: this.container.querySelector('#editModal'),
            btnClose: this.container.querySelector('#btnCloseModal'),
            btnSave: this.container.querySelector('#btnSaveNode'),
            btnDelete: this.container.querySelector('#btnDeleteNode'),
            btnExpand: this.container.querySelector('#btnExpandNode'),
            btnExport: this.container.querySelector('#btnExportSkill'),
            
            inpId: this.container.querySelector('#editNodeId'),
            inpType: this.container.querySelector('#editNodeType'),
            inpProjId: this.container.querySelector('#editNodeProjectId'),
            inpCat: this.container.querySelector('#editNodeCat'),
            inpTitle: this.container.querySelector('#editNodeTitle'),
            inpDesc: this.container.querySelector('#editNodeDesc'),
            inpContent: this.container.querySelector('#editNodeContent'),
            inpKeywords: this.container.querySelector('#editNodeKeywords'),
            
            inpReferences: this.container.querySelector('#editNodeReferences'),
            refLinksContainer: this.container.querySelector('#refLinksContainer'), 
            inpEvals: this.container.querySelector('#editNodeEvals'),
            evalLinksContainer: this.container.querySelector('#evalLinksContainer'),
            inpScripts: this.container.querySelector('#editNodeScripts'),
            scriptLinksContainer: this.container.querySelector('#scriptLinksContainer'),

            draftBanner: this.container.querySelector('#draftBanner'),
            btnApplyDraft: this.container.querySelector('#btnApplyDraft'),
            btnDiscardDraft: this.container.querySelector('#btnDiscardDraft'),
            
            chatInput: this.container.querySelector('#aiEvolutionPrompt'),
            chatBox: this.container.querySelector('#chatEvolutionBox')
        };

        this.setupEvents();
    }

    // ... (El resto de métodos auxiliares se mantienen: loadJSZip, renderLinkedNodes)
    loadJSZip() {
        return new Promise((resolve) => {
            if (window.JSZip) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    renderLinkedNodes(idsArray, container, cssClass, icon) {
        if (!container) return;
        container.innerHTML = '';
        if (!idsArray || idsArray.length === 0) return;
        
        idsArray.forEach(id => {
            const node = this.allNodesCache.find(n => n.id === id);
            const title = node ? node.title : id;
            const badge = document.createElement('span');
            badge.className = cssClass;
            badge.innerHTML = `${icon} ${title} ↗`;
            badge.title = `Inspeccionar: ${id}`;
            badge.onclick = () => {
                this.closeEditor(); 
                setTimeout(() => this.openEditor(id), 350); 
            };
            container.appendChild(badge);
        });
    }

    async openEditor(nodeId) {
        await KB.init();
        this.allNodesCache = await KB.getAllNodes(); 
        
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');
        this.dom.chatBox.style.display = 'block';
        this.dom.chatInput.value = '';

        if (!nodeId) {
            this.dom.inpId.value = '';
            this.dom.inpType.value = 'custom';
            this.dom.inpProjId.value = 'global';
            this.dom.inpCat.value = 'skill';
            this.dom.inpTitle.value = '';
            this.dom.inpDesc.value = '';
            this.dom.inpContent.value = '';
            this.dom.inpKeywords.value = '';
            this.dom.inpReferences.value = '';
            this.dom.inpEvals.value = '';
            this.dom.inpScripts.value = '';
            
            this.renderLinkedNodes([], this.dom.refLinksContainer, '', '');
            this.renderLinkedNodes([], this.dom.evalLinksContainer, '', '');
            this.renderLinkedNodes([], this.dom.scriptLinksContainer, '', '');
            
            this.dom.btnDelete.style.display = 'none';
        } else {
            const node = this.allNodesCache.find(n => n.id === nodeId);
            if (!node) return;

            this.dom.inpId.value = node.id;
            this.dom.inpType.value = node.type || 'custom'; 
            this.dom.inpProjId.value = node.projectId || 'global';
            this.dom.inpCat.value = node.category || '';
            this.dom.inpTitle.value = node.title || '';
            this.dom.inpDesc.value = node.description || '';
            this.dom.inpContent.value = node.content || '';
            this.dom.inpKeywords.value = (node.keywords && Array.isArray(node.keywords)) ? node.keywords.join(', ') : (node.keywords || '');
            
            const refArr = (node.references && Array.isArray(node.references)) ? node.references : [];
            const evalArr = (node.evals && Array.isArray(node.evals)) ? node.evals : [];
            const scriptArr = (node.scripts && Array.isArray(node.scripts)) ? node.scripts : [];

            this.dom.inpReferences.value = refArr.join(', ');
            this.dom.inpEvals.value = evalArr.join(', ');
            this.dom.inpScripts.value = scriptArr.join(', ');
            
            this.renderLinkedNodes(refArr, this.dom.refLinksContainer, 'ref-badge', '📚');
            this.renderLinkedNodes(evalArr, this.dom.evalLinksContainer, 'eval-badge', '📋');
            this.renderLinkedNodes(scriptArr, this.dom.scriptLinksContainer, 'script-badge', '⚡');

            const isKernel = this.dom.inpKeywords.value.includes('#core_sos') || this.dom.inpKeywords.value.includes('#kernel_sos');
            this.dom.btnDelete.style.display = isKernel ? 'none' : 'block';
        }

        this.dom.modal.classList.add('active');
    }

    closeEditor() { 
        this.dom.modal.classList.remove('active'); 
        this.draftMemory = null;
        this.dom.draftBanner.classList.remove('active');
    }

    setupEvents() {
        window.addEventListener('open-forge-modal', (e) => this.openEditor(e.detail.nodeId));
        this.dom.btnClose.addEventListener('click', () => this.closeEditor());
        this.dom.modal.addEventListener('click', (e) => { if (e.target === this.dom.modal) this.closeEditor(); });

        this.dom.inpReferences.addEventListener('input', (e) => this.renderLinkedNodes(e.target.value.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.refLinksContainer, 'ref-badge', '📚'));
        this.dom.inpEvals.addEventListener('input', (e) => this.renderLinkedNodes(e.target.value.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.evalLinksContainer, 'eval-badge', '📋'));
        this.dom.inpScripts.addEventListener('input', (e) => this.renderLinkedNodes(e.target.value.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.scriptLinksContainer, 'script-badge', '⚡'));

        // 🔥 CHAT-EVOLVER: CONTROL DE VERSIONES Y DIRECTIVAS IA
        this.dom.btnExpand.addEventListener('click', async () => {
            const title = this.dom.inpTitle.value.trim();
            const rawContent = this.dom.inpContent.value.trim();
            const cat = this.dom.inpCat.value.trim();
            const tags = this.dom.inpKeywords.value.trim();
            const aiInstruction = this.dom.chatInput.value.trim();
            
            if (!title) return alert("Se necesita un título para que la IA sepa qué desarrollar.");

            // Ensamblamos el payload combinando el código semilla y la instrucción del Chat
            let contentToAI = rawContent;
            if (aiInstruction) {
                contentToAI += `\n\n[DIRECTIVA DEL MASTER ARCHITECT]:\n${aiInstruction}\n(Aplica esta instrucción obligatoriamente al SOP/SOC de esta Skill)`;
            }

            // Guardamos el Snapshot para poder hacer Revert (Descartar)
            this.draftMemory = {
                title: title, desc: this.dom.inpDesc.value, content: rawContent,
                keywords: tags, references: this.dom.inpReferences.value
            };

            this.dom.btnExpand.disabled = true;
            this.dom.btnExpand.innerText = "⏳ Córtex Evolucionando...";
            this.dom.chatInput.disabled = true;

            try {
                // Invocamos al Orquestador con la directiva inyectada
                const optimizedData = await Orchestrator.expandNodeSemantics(title, cat, contentToAI, tags);
                
                // Mapeamos los resultados al DOM (Modo Vista Previa)
                this.dom.inpTitle.value = optimizedData.title;
                this.dom.inpDesc.value = optimizedData.description || '';
                this.dom.inpContent.value = optimizedData.content;
                this.dom.inpKeywords.value = optimizedData.keywords.join(', ');
                
                if (optimizedData.reference_docs && optimizedData.reference_docs.length > 0) {
                    await KB.init();
                    let currentRefs = this.dom.inpReferences.value.split(',').map(r => r.trim()).filter(r => r !== '');
                    for (const refDoc of optimizedData.reference_docs) {
                        const cleanName = refDoc.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 20);
                        const newRefId = `ref_draft_${cleanName}_${Math.random().toString(36).substr(2,4)}`;
                        await KB.saveNode({ id: newRefId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global', title: refDoc.title, description: refDoc.description, content: refDoc.content, keywords: ['#ai_draft_ref'] });
                        currentRefs.push(newRefId);
                    }
                    this.dom.inpReferences.value = currentRefs.join(', ');
                    this.renderLinkedNodes(currentRefs, this.dom.refLinksContainer, 'ref-badge', '📚'); 
                }
                
                // Ocultar Chat, Mostrar Banner de Draft
                this.dom.chatBox.style.display = 'none';
                this.dom.draftBanner.classList.add('active');
                
            } catch (error) { 
                alert("Fallo en la evolución: " + error.message); 
                this.draftMemory = null;
            } finally { 
                this.dom.btnExpand.disabled = false; 
                this.dom.btnExpand.innerText = "🌱 Generar Mutación"; 
                this.dom.chatInput.disabled = false;
            }
        });

        // 🔙 Descartar Draft (Revert)
        this.dom.btnDiscardDraft.addEventListener('click', async () => {
            if (!this.draftMemory) return;
            this.dom.inpTitle.value = this.draftMemory.title;
            this.dom.inpDesc.value = this.draftMemory.desc;
            this.dom.inpContent.value = this.draftMemory.content;
            this.dom.inpKeywords.value = this.draftMemory.keywords;
            this.dom.inpReferences.value = this.draftMemory.references;
            
            this.renderLinkedNodes(this.draftMemory.references.split(',').map(k=>k.trim()).filter(k=>k!==''), this.dom.refLinksContainer, 'ref-badge', '📚');
            this.dom.draftBanner.classList.remove('active');
            this.dom.chatBox.style.display = 'block';
            this.draftMemory = null;
        });

        // ✅ Aceptar Draft (Merge Preparatorio)
        this.dom.btnApplyDraft.addEventListener('click', () => {
            this.dom.draftBanner.classList.remove('active');
            this.dom.chatBox.style.display = 'block';
            this.dom.chatInput.value = ''; // Limpiamos el chat
            this.draftMemory = null;
            this.dom.btnSave.style.boxShadow = "0 0 30px rgba(0, 230, 118, 0.8)";
            setTimeout(() => this.dom.btnSave.style.boxShadow = "", 1500);
        });

        // 🔥 SELLAR CAMBIOS EN BASE DE DATOS
        this.dom.btnSave.addEventListener('click', async () => {
            if (this.draftMemory) return alert("Tienes una mutación pendiente en el Banner. Acéptala o descártala antes de sellar.");

            const id = this.dom.inpId.value;
            const title = this.dom.inpTitle.value.trim();
            const desc = this.dom.inpDesc.value.trim();
            const content = this.dom.inpContent.value.trim();
            if (!title || !content) return alert("Título y contenido son obligatorios.");

            const keywordsArray = this.dom.inpKeywords.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const referencesArray = this.dom.inpReferences.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const evalsArray = this.dom.inpEvals.value.split(',').map(k => k.trim()).filter(k => k !== '');
            const scriptsArray = this.dom.inpScripts.value.split(',').map(k => k.trim()).filter(k => k !== '');
            
            await KB.init();
            const allNodes = await KB.getAllNodes();
            const oldNode = allNodes.find(n => n.id === id) || {};
            
            const updatedNode = { 
                ...oldNode, 
                id: id || `custom_${Date.now()}_${Math.random().toString(36).substr(2,4)}`, 
                type: this.dom.inpType.value || oldNode.type || 'custom', 
                projectId: this.dom.inpProjId.value || oldNode.projectId || 'global', 
                category: this.dom.inpCat.value.trim() || oldNode.category || 'skill', 
                title: title, description: desc, content: content, 
                keywords: keywordsArray, references: referencesArray, evals: evalsArray, scripts: scriptsArray  
            };

            this.dom.btnSave.disabled = true; this.dom.btnSave.innerText = "⏳ Sellando...";
            
            try {
                await KB.saveNode(updatedNode);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                this.closeEditor();
            } catch (e) { 
                alert(`Error al guardar: ${e.message}`); 
            } finally { 
                this.dom.btnSave.disabled = false; this.dom.btnSave.innerText = "💾 Sellar Mutación Definitiva"; 
            }
        });

        // 🔥 PURGAR (Con protección Antigravity para Core Skills)
        this.dom.btnDelete.addEventListener('click', async () => {
            const isKernel = this.dom.inpKeywords.value.includes('#core_sos') || this.dom.inpKeywords.value.includes('#kernel_sos');
            if (isKernel) return alert("Las Skills Core están protegidas por el Kernel Antigravity. No pueden purgarse.");

            const id = this.dom.inpId.value;
            if (!confirm("⚠️ ¿Purgar este nodo de la red para siempre?")) return;
            this.dom.btnDelete.disabled = true;
            try {
                await KB.init(); await KB.deleteNode(id);
                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                this.closeEditor();
            } catch (e) { alert(`Error: ${e.message}`); } 
            finally { this.dom.btnDelete.disabled = false; }
        });

        // 🔥 EXPORTAR
        this.dom.btnExport.addEventListener('click', async () => {
            // Lógica de exportación conservada intacta.
            if (!window.JSZip) await this.loadJSZip();
            const zip = new window.JSZip();

            const title = this.dom.inpTitle.value.trim() || 'Custom_Skill';
            const desc = this.dom.inpDesc.value.trim() || 'Skill generada por TeamTowers V9';
            const content = this.dom.inpContent.value.trim();
            const refArray = this.dom.inpReferences.value.split(',').map(r => r.trim()).filter(r => r !== '');
            const evalArray = this.dom.inpEvals.value.split(',').map(r => r.trim()).filter(r => r !== '');
            const scriptArray = this.dom.inpScripts.value.split(',').map(r => r.trim()).filter(r => r !== '');

            const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
            const rootFolder = zip.folder(safeTitle);

            rootFolder.file("SKILL.md", `---\nname: ${title}\ndescription: ${desc}\n---\n\n${content}`);

            await KB.init();
            if (refArray.length > 0) {
                const resourcesFolder = rootFolder.folder("references");
                for (const refId of refArray) {
                    const refNode = await KB.getNode(refId);
                    if (refNode) {
                        const refNameSafe = (refNode.title || refNode.id).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
                        resourcesFolder.file(`${refNameSafe}.md`, `---\nname: ${refNode.title}\ndescription: ${refNode.description || ''}\n---\n\n${refNode.content}`);
                    }
                }
            }
            if (evalArray.length > 0) {
                const evalsFolder = rootFolder.folder("evals");
                let allEvalsJson = [];
                for (const evalId of evalArray) {
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
            if (scriptArray.length > 0) {
                const scriptsFolder = rootFolder.folder("scripts");
                for (const scriptId of scriptArray) {
                    const scriptNode = await KB.getNode(scriptId);
                    if (scriptNode) {
                        const sName = scriptNode.title.includes('.') ? scriptNode.title : `${scriptNode.title}.py`;
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
