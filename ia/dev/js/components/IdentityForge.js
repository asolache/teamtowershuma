// =============================================================================
// TEAMTOWERS SOS V10 — IDENTITY FORGE
// Ruta: ia/dev/js/components/IdentityForge.js
// Forja de Identidad · Agentes IA · Perfil Human · Skills · Simulación ReAct
// =============================================================================

import { store }      from '../core/store.js';
import { KB }         from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

const TAXONOMY = {
    'core.architecture': '🌌 Arquitectura & VNA',
    'core.economy':      '⚖️ Economía & Ledger',
    'core.cognition':    '🧠 Cognición & Ontología',
    'core.execution':    '⚡ Ejecución & Código',
    'core.culture':      '🎭 Cultura & Caos',
    'skill':             '🎒 Skills Custom (Generales)'
};

export class IdentityForge {

    constructor(containerId) {
        this.container       = document.getElementById(containerId);
        this.activeAgentId   = null;
        this.agentSkills     = [];
        this.isSimulating    = false;
        this.lastCompiledPrompt = '';
        this.dom             = {};
        // Alias legacy
        this.activeNodeId    = null;
    }

    async render(agentId = null) {
        if (!this.container) return;
        this.activeAgentId = agentId;
        this.activeNodeId  = agentId;

        const state = store.getState();
        let agentData   = { id: '@', name: '', profile: { isAi: true, guardian: 'creator', preferredEngine: 'anthropic', orchestration: 'react' } };
        let promptContent = '';

        if (this.activeAgentId) {
            const existing = state.globalUsers.find(u => u.id === this.activeAgentId);
            if (existing?.profile?.isAi) {
                agentData = existing;
                if (!agentData.profile.orchestration) agentData.profile.orchestration = 'react';
            }
            await KB.init();
            const promptNode = await KB.getNode(`prompt_global_${this.activeAgentId.replace('@','')}`);
            if (promptNode) {
                promptContent    = promptNode.content;
                this.agentSkills = promptNode.dependencies || [];
            }
        }

        await KB.init();
        const allSkills   = await KB.getAllNodes({ type: 'skill' });
        const groupedSkills = {};
        allSkills.forEach(sk => {
            const cat = sk.category || 'skill';
            if (!groupedSkills[cat]) groupedSkills[cat] = [];
            groupedSkills[cat].push(sk);
        });

        let skillSelectHtml = `<option value="">-- Buscar y Equipar Skill --</option>`;
        Object.entries(TAXONOMY).forEach(([catKey, catLabel]) => {
            const skInCat = groupedSkills[catKey] || [];
            if (skInCat.length > 0) {
                skillSelectHtml += `<optgroup label="${catLabel}">`;
                skInCat.forEach(sk => {
                    skillSelectHtml += `<option value="${sk.id}">${sk.title}</option>`;
                });
                skillSelectHtml += `</optgroup>`;
            }
        });

        const isAi = agentData.profile?.isAi !== false;

        this.container.innerHTML = `
        <style>
            .if-card { background:linear-gradient(145deg,rgba(20,20,25,0.8),rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:22px; padding:2.5rem; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 20px 50px rgba(0,0,0,0.5); backdrop-filter:blur(15px); box-sizing:border-box; width:100%; }

            .if-grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; }

            .if-section-title { color:var(--accent-indigo,#6366f1); font-size:0.78rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px 0; display:flex; align-items:center; gap:8px; }
            .if-form-group { margin-bottom:14px; }
            .if-form-group label { display:block; font-size:0.75rem; color:#888; text-transform:uppercase; margin-bottom:6px; font-weight:bold; }
            .if-input { background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:11px 14px; border-radius:10px; font-family:inherit; font-size:0.9rem; outline:none; width:100%; box-sizing:border-box; transition:0.2s; }
            .if-input:focus { border-color:var(--accent-indigo,#6366f1); }
            .if-textarea { min-height:200px; resize:vertical; font-family:var(--font-mono); font-size:0.82rem; line-height:1.6; background:#050508; }
            .if-textarea.synthesizing { border-color:var(--accent-green); box-shadow:inset 0 0 15px rgba(0,230,118,0.1); animation:breathe 2s ease-in-out infinite; }
            @keyframes breathe { 0%,100%{box-shadow:inset 0 0 10px rgba(0,230,118,0.05);}50%{box-shadow:inset 0 0 20px rgba(0,230,118,0.2);} }

            .skills-list { display:flex; flex-direction:column; gap:8px; max-height:240px; overflow-y:auto; padding-right:4px; margin-bottom:12px; }
            .skill-slot { background:rgba(0,230,118,0.05); border:1px solid rgba(0,230,118,0.3); padding:9px 13px; border-radius:9px; display:flex; justify-content:space-between; align-items:center; transition:0.2s; }
            .skill-slot:hover { border-color:var(--accent-green); background:rgba(0,230,118,0.1); }
            .skill-slot-title { color:white; font-weight:bold; font-size:0.85rem; font-family:var(--font-mono); }
            .btn-remove-skill { background:transparent; border:none; color:var(--accent-red); cursor:pointer; font-size:1.1rem; }

            .terminal-container { flex:1; background:#050508; border:1px solid #333; border-radius:10px; padding:13px; font-family:var(--font-mono); font-size:0.78rem; line-height:1.5; color:#aaa; max-height:220px; overflow-y:auto; }
            .term-log { padding:2px 0; }
            .term-log.thought      { color:#aaa; }
            .term-log.action       { color:var(--accent-indigo,#6366f1); font-weight:bold; }
            .term-log.observation  { color:var(--accent-green); }
            .term-log.final        { color:var(--accent-green); font-weight:900; border-top:1px dashed var(--accent-green); padding-top:6px; }

            .dropzone-if { border:2px dashed rgba(99,102,241,0.3); border-radius:12px; padding:16px; text-align:center; color:#666; font-size:0.82rem; cursor:pointer; transition:0.3s; margin-bottom:14px; display:flex; align-items:center; justify-content:center; gap:10px; }
            .dropzone-if:hover,.dropzone-if.drag-over { border-color:var(--accent-indigo,#6366f1); color:white; background:rgba(99,102,241,0.04); }

            .if-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:1.5rem; }
            .btn-lux { padding:11px 20px; border-radius:10px; font-weight:900; font-size:0.88rem; cursor:pointer; transition:0.3s; border:none; }
            .btn-primary { background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple)); color:white; }
            .btn-success { background:var(--accent-green); color:black; }
            .btn-outline { background:transparent; border:1px dashed #888; color:#aaa; }
            .btn-outline:hover { background:rgba(255,255,255,0.05); color:white; border-style:solid; }
            .btn-lux:disabled { opacity:0.5; cursor:not-allowed; pointer-events:none; }

            @media (max-width:1024px) { .if-grid { grid-template-columns:1fr; } }
        </style>

        <div class="if-card">
            <div class="if-grid">
                <!-- Columna Izquierda: Datos del Agente -->
                <div>
                    <p class="if-section-title">🧬 Identidad del Nodo</p>

                    <div class="if-form-group">
                        <label>Alias / ID (@alias)</label>
                        <input type="text" id="ifId" class="if-input" value="${agentData.id || ''}" placeholder="@mi_agente_v10">
                    </div>
                    <div class="if-form-group">
                        <label>Nombre Display</label>
                        <input type="text" id="ifName" class="if-input" value="${agentData.name || ''}" placeholder="Nombre del Agente">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div class="if-form-group">
                            <label>Motor IA Preferido</label>
                            <select id="ifEngine" class="if-input" style="color:var(--accent-indigo,#6366f1);font-weight:bold;">
                                <option value="anthropic" ${agentData.profile?.preferredEngine==='anthropic'?'selected':''}>🦉 Anthropic</option>
                                <option value="deepseek"  ${agentData.profile?.preferredEngine==='deepseek'? 'selected':''}>🐋 DeepSeek</option>
                                <option value="openai"    ${agentData.profile?.preferredEngine==='openai'?  'selected':''}>🧠 OpenAI</option>
                                <option value="gemini"    ${agentData.profile?.preferredEngine==='gemini'?  'selected':''}>✨ Gemini</option>
                            </select>
                        </div>
                        <div class="if-form-group">
                            <label>Protocolo de Orquestación</label>
                            <select id="ifOrchestration" class="if-input">
                                <option value="react"   ${agentData.profile?.orchestration==='react'?  'selected':''}>ReAct (Razonamiento)</option>
                                <option value="plan"    ${agentData.profile?.orchestration==='plan'?   'selected':''}>Plan & Execute</option>
                                <option value="direct"  ${agentData.profile?.orchestration==='direct'? 'selected':''}>Direct (Rápido)</option>
                            </select>
                        </div>
                    </div>

                    <div class="if-form-group">
                        <label>System Prompt (AGENT.md / Ikigai)</label>
                        <textarea id="ifPrompt" class="if-input if-textarea" placeholder="Eres un agente especializado en... SOPs: 1. ... SOCs: - ...">${promptContent}</textarea>
                        <div id="synthStatus" style="font-size:0.7rem; color:var(--accent-purple); font-weight:bold; display:none; margin-top:4px; animation:pulse 1.5s infinite;">🔄 Sintetizando cinturón de Skills…</div>
                    </div>

                    <div style="display:flex; gap:8px;">
                        <button id="btnViewPrompt" class="btn-lux btn-outline" style="font-size:0.8rem; padding:8px 12px;">👁️ Ver Compilado</button>
                    </div>
                </div>

                <!-- Columna Derecha: Skills + Terminal -->
                <div style="display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <p class="if-section-title">🎒 Cinturón de Skills</p>
                        <select id="skillSelector" class="if-input" style="margin-bottom:10px; color:var(--accent-purple); font-weight:bold;">
                            ${skillSelectHtml}
                        </select>
                        <div class="skills-list" id="skillsList"></div>

                        <div class="dropzone-if" id="globalDropzone">
                            <span style="font-size:1.4rem;">📥</span>
                            <span>Arrastra un <b>.skill</b> o <b>.agent</b> para inyectar</span>
                        </div>
                    </div>

                    <div>
                        <p class="if-section-title">🧪 Terminal ReAct (Simulación CI/CD)</p>
                        <div style="display:flex; gap:8px; margin-bottom:8px;">
                            <input type="text" id="simInput" class="if-input" placeholder="Tarea a simular: Analiza la topología VNA del proyecto X…" style="flex:1;">
                            <select id="simEngineOverride" class="if-input" style="width:130px; font-size:0.8rem; color:var(--accent-indigo,#6366f1);">
                                <option value="">Auto</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="deepseek">DeepSeek</option>
                                <option value="openai">OpenAI</option>
                            </select>
                            <button id="btnRunSim" class="btn-lux btn-primary" style="padding:10px 14px; font-size:0.82rem; white-space:nowrap;">▶ Simular</button>
                        </div>
                        <div class="terminal-container" id="simTerminal">
                            <div class="term-log">&gt; Agente en estado IDLE. Introduce una tarea para simular el bucle ReAct.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="if-actions">
                <button id="btnSaveAgent"  class="btn-lux btn-success">💾 Sellar en el Padrón</button>
                <button id="btnExportAgent" class="btn-lux btn-outline">📦 Exportar .agent</button>
                <div style="flex:1;"></div>
                ${this.activeAgentId ? `<button id="btnDeleteAgent" style="background:transparent;border:1px solid var(--accent-red);color:var(--accent-red);padding:10px 18px;border-radius:10px;cursor:pointer;font-weight:bold;font-size:0.85rem;">🗑️ Purgar Nodo</button>` : ''}
            </div>
        </div>`;

        this.dom = {
            btnSave:          this.container.querySelector('#btnSaveAgent'),
            btnExport:        this.container.querySelector('#btnExportAgent'),
            btnRunSim:        this.container.querySelector('#btnRunSim'),
            btnViewPrompt:    this.container.querySelector('#btnViewPrompt'),
            btnDelete:        this.container.querySelector('#btnDeleteAgent'),
            skillSelector:    this.container.querySelector('#skillSelector'),
            skillsList:       this.container.querySelector('#skillsList'),
            dropzone:         this.container.querySelector('#globalDropzone'),
            simInput:         this.container.querySelector('#simInput'),
            simTerminal:      this.container.querySelector('#simTerminal'),
            simEngine:        this.container.querySelector('#simEngineOverride'),
            promptArea:       this.container.querySelector('#ifPrompt'),
            synthStatus:      this.container.querySelector('#synthStatus')
        };

        this._renderSkillsList();
        this._attachEvents();
    }

    _renderSkillsList() {
        if (!this.dom.skillsList) return;
        this.dom.skillsList.innerHTML = this.agentSkills.length === 0
            ? `<div style="color:#555; font-style:italic; font-size:0.82rem; text-align:center; padding:1rem;">Sin skills equipadas. Añade desde el selector.</div>`
            : '';
        this.agentSkills.forEach((skillId, idx) => {
            KB.getNode(skillId).then(node => {
                if (!node || !this.dom.skillsList) return;
                const slot = document.createElement('div');
                slot.className = 'skill-slot';
                slot.innerHTML = `<span class="skill-slot-title">${node.title || skillId}</span><button class="btn-remove-skill" data-idx="${idx}">✕</button>`;
                slot.querySelector('.btn-remove-skill').addEventListener('click', () => {
                    this.agentSkills.splice(idx, 1);
                    this._renderSkillsList();
                });
                this.dom.skillsList.appendChild(slot);
            }).catch(() => {});
        });
    }

    _attachEvents() {
        // Equipar skill
        this.dom.skillSelector.addEventListener('change', async (e) => {
            const selectedId = e.target.value;
            if (selectedId && !this.agentSkills.includes(selectedId)) {
                this.agentSkills.push(selectedId);
                this._renderSkillsList();
                await this._triggerPromptSynthesis(selectedId);
            }
            e.target.value = '';
        });

        // Guardar
        this.dom.btnSave.addEventListener('click', () => this._saveAgent());

        // Exportar
        this.dom.btnExport.addEventListener('click', () => this._exportAgent());

        // Ver prompt compilado
        this.dom.btnViewPrompt.addEventListener('click', () => {
            const compiled = this.lastCompiledPrompt || this.dom.promptArea.value;
            if (!compiled) return alert('Aún no hay prompt compilado. Ejecuta una simulación primero.');
            alert(compiled.substring(0, 2000) + (compiled.length > 2000 ? '\n[…truncado]' : ''));
        });

        // Eliminar
        this.dom.btnDelete?.addEventListener('click', async () => {
            if (!this.activeAgentId) return;
            if (!confirm(`¿Purgar el nodo ${this.activeAgentId} del Padrón para siempre?`)) return;
            await store.dispatch({ type: 'REMOVE_USER', payload: { id: this.activeAgentId } });
            await KB.init();
            await KB.deleteNode(`prompt_global_${this.activeAgentId.replace('@','')}`).catch(() => {});
            window.dispatchEvent(new CustomEvent('identity-forged'));
            await this.render(null);
        });

        // Simulación ReAct
        this.dom.btnRunSim.addEventListener('click', () => this._runSimulation());

        // Drag & Drop
        const dz = this.dom.dropzone;
        ['dragenter','dragover','dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
        ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, () => dz.classList.add('drag-over')));
        ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('drag-over')));

        dz.addEventListener('drop', async (e) => {
            const file = e.dataTransfer.files[0];
            if (!file) return;
            if (file.name.endsWith('.skill')) {
                const skillId = await this._importSkillZip(file);
                if (skillId && !this.agentSkills.includes(skillId)) {
                    this.agentSkills.push(skillId);
                    this._renderSkillsList();
                    await this._triggerPromptSynthesis(skillId);
                }
            } else if (file.name.endsWith('.agent') || file.name.endsWith('.zip')) {
                await this._importAgentZip(file);
            } else {
                alert('Formato no soportado. Usa .skill o .agent');
            }
        });
    }

    async _triggerPromptSynthesis(newSkillId) {
        if (!this.dom.promptArea) return;
        this.dom.synthStatus.style.display = 'block';
        this.dom.promptArea.classList.add('synthesizing');

        try {
            const skillNode  = await KB.getNode(newSkillId);
            if (!skillNode) return;

            const currentPrompt = this.dom.promptArea.value.trim();
            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt: `Eres @agent_prompt_synthesizer del Swarm SOS V10.
Tu misión es INYECTAR una nueva Skill en el System Prompt de un Agente sin romper el prompt existente.
La nueva Skill debe añadirse como una sección "## NUEVA HERRAMIENTA: [nombre]" con el cuándo y cómo usarla.
Devuelve SOLO el prompt completo actualizado (sin JSON, sin markdown extra).`,
                userPrompt: `PROMPT ACTUAL:\n${currentPrompt}\n\n---\n\nNUEVA SKILL A INYECTAR:\nNombre: ${skillNode.title}\nDescripción: ${skillNode.description || ''}\nContenido (SOP):\n${skillNode.content || ''}`,
                responseFormat: 'text',
                temperature: 0.25
            });

            const updatedPrompt = response.content;
            if (updatedPrompt && typeof updatedPrompt === 'string' && updatedPrompt.length > 20) {
                this.dom.promptArea.value = updatedPrompt;
                this.lastCompiledPrompt   = updatedPrompt;
            }
        } catch (err) {
            console.warn('[IdentityForge] Fallo en síntesis de prompt:', err.message);
        } finally {
            this.dom.synthStatus.style.display = 'none';
            this.dom.promptArea.classList.remove('synthesizing');
            this.dom.promptArea.style.boxShadow = 'inset 0 0 12px rgba(0,230,118,0.2)';
            setTimeout(() => { if (this.dom.promptArea) this.dom.promptArea.style.boxShadow = ''; }, 1200);
        }
    }

    async _runSimulation() {
        if (this.isSimulating) return;
        const task = this.dom.simInput.value.trim();
        if (!task) return alert('Introduce una tarea para simular.');

        this.isSimulating          = true;
        this.dom.btnRunSim.disabled = true;
        this.dom.btnRunSim.innerText = '⏳ Simulando…';
        this.dom.simTerminal.innerHTML = '';

        const agentName  = this.container.querySelector('#ifName')?.value || (this.activeAgentId || 'Agente');
        const agentPrompt = this.dom.promptArea.value.trim();
        const engine     = this.dom.simEngine?.value || 'anthropic';

        try {
            await KB.init();
            let fullSystem = agentPrompt || `Eres ${agentName}, agente del Swarm SOS V10.`;

            // Inyectar skills en el prompt de simulación
            for (const skillId of this.agentSkills) {
                const sk = await KB.getNode(skillId);
                if (sk) fullSystem += `\n\n## SKILL: ${sk.title}\n${sk.content || ''}`;
            }

            fullSystem += `\n\n[PROTOCOLO DE SIMULACIÓN REACT]:
Simula un ciclo ReAct (Thought/Action/Observation) para la tarea dada.
Devuelve TEXTO PLANO con cada línea empezando con:
THOUGHT: ... (razonamiento)
ACTION: ... (herramienta o paso)
OBSERVATION: ... (resultado simulado)
FINAL: ... (entregable final)`;

            this.lastCompiledPrompt = fullSystem;

            const response = await Orchestrator.callLLM({
                preferredEngine: engine || 'anthropic',
                systemPrompt:    fullSystem,
                userPrompt:      `TAREA ASIGNADA: ${task}\n\nEjecuta el bucle ReAct.`,
                responseFormat:  'text',
                temperature:     0.4
            });

            this._formatTerminalOutput(response.content);

        } catch (err) {
            this.dom.simTerminal.innerHTML += `<div class="term-log" style="color:var(--accent-red);">⚠️ Fallo Neural: ${err.message}</div>`;
        } finally {
            this.isSimulating           = false;
            this.dom.btnRunSim.disabled  = false;
            this.dom.btnRunSim.innerText = '▶ Simular';
        }
    }

    _formatTerminalOutput(text) {
        let html = '';
        const lines = (text || '').split('\n');
        lines.forEach(l => {
            if      (l.startsWith('THOUGHT:'))     html += `<div class="term-log thought">🧠 ${l.substring(8)}</div>`;
            else if (l.startsWith('ACTION:'))      html += `<div class="term-log action">⚡ Acción: ${l.substring(7)}</div>`;
            else if (l.startsWith('OBSERVATION:')) html += `<div class="term-log observation">👁️ Observación: ${l.substring(12)}</div>`;
            else if (l.startsWith('FINAL:'))       html += `<div class="term-log final">✅ Entregable FINAL: ${l.substring(6)}</div>`;
            else if (l.trim().length > 0)          html += `<div class="term-log thought">${l}</div>`;
        });
        this.dom.simTerminal.innerHTML += html;
        this.dom.simTerminal.scrollTop  = this.dom.simTerminal.scrollHeight;
    }

    async _saveAgent() {
        let id = this.container.querySelector('#ifId')?.value.trim();
        if (!id) return alert('El Alias / ID es obligatorio.');
        if (!id.startsWith('@')) id = '@' + id;

        this.dom.btnSave.disabled  = true;
        this.dom.btnSave.innerText = '⏳ Sellando Córtex…';

        try {
            const newUserData = {
                id,
                name:       this.container.querySelector('#ifName')?.value.trim() || 'Agente Anónimo',
                globalRole: 'ai-agent',
                profile: {
                    isAi:             true,
                    guardian:         'creator',
                    preferredEngine:  this.container.querySelector('#ifEngine')?.value || 'anthropic',
                    orchestration:    this.container.querySelector('#ifOrchestration')?.value || 'react',
                    active_skills:    this.agentSkills
                }
            };

            if (this.activeAgentId) await store.dispatch({ type: 'UPDATE_USER', payload: newUserData });
            else                    await store.dispatch({ type: 'ADD_USER',    payload: newUserData });

            await KB.init();
            await KB.saveNode({
                id:           `prompt_global_${id.replace('@','')}`,
                type:         'prompt_a2a',
                category:     'meta_prompt',
                targetId:     id,
                roleTarget:   id,
                projectId:    'global',
                title:        `AGENT.md: ${newUserData.name}`,
                content:      this.dom.promptArea.value.trim(),
                dependencies: this.agentSkills,
                keywords:     ['ai_agent', id]
            });

            window.dispatchEvent(new CustomEvent('identity-forged'));
            if (!this.activeAgentId) await this.render(id);
            alert(`✅ Agente ${id} ensamblado y sellado en el Padrón V10.`);

        } catch (err) {
            alert('Error al guardar: ' + err.message);
        } finally {
            this.dom.btnSave.disabled  = false;
            this.dom.btnSave.innerText = '💾 Sellar en el Padrón';
        }
    }

    async _exportAgent() {
        if (!window.JSZip) await this._loadJSZip();
        const id       = this.container.querySelector('#ifId')?.value.trim() || 'unnamed_agent';
        const name     = this.container.querySelector('#ifName')?.value.trim() || id;
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g,'_').toLowerCase() || 'agent';

        this.dom.btnExport.disabled  = true;
        this.dom.btnExport.innerText = '⏳ Empaquetando…';

        try {
            const zip        = new window.JSZip();
            const rootFolder = zip.folder(safeName);
            const prompt     = this.dom.promptArea.value.trim();

            rootFolder.file('AGENT.md', `---\nalias: ${id}\nname: ${name}\n---\n\n${prompt}`);
            rootFolder.file('config.json', JSON.stringify({
                version:      '1.0-v10',
                engine:       this.container.querySelector('#ifEngine')?.value || 'anthropic',
                orchestration: this.container.querySelector('#ifOrchestration')?.value || 'react',
                skills:       this.agentSkills
            }, null, 2));

            if (this.agentSkills.length > 0) {
                const skillsFolder = rootFolder.folder('skills');
                await KB.init();
                for (const skillId of this.agentSkills) {
                    const sk = await KB.getNode(skillId);
                    if (sk) skillsFolder.file(`${sk.title.replace(/[^a-zA-Z0-9_-]/g,'_')}.json`, JSON.stringify(sk, null, 2));
                }
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `${safeName}.agent`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) { alert('Fallo al exportar: ' + err.message); }
        finally { this.dom.btnExport.disabled = false; this.dom.btnExport.innerText = '📦 Exportar .agent'; }
    }

    async _importSkillZip(file) {
        if (!window.JSZip) await this._loadJSZip();
        try {
            const zip        = new window.JSZip();
            const contents   = await zip.loadAsync(file);
            const skillKey   = Object.keys(contents.files).find(k => k.endsWith('SKILL.md'));
            if (!skillKey)   throw new Error('No es una skill válida. Falta SKILL.md');

            const skillText  = await contents.files[skillKey].async('text');
            const title      = skillText.match(/name:\s*(.+)/)?.[1].trim() || file.name;
            const newNodeId  = `skill_imported_${Date.now()}`;

            await KB.init();
            await KB.saveNode({ id:newNodeId, type:'skill', category:'skill', projectId:'global', targetId:'global', title, description:'Skill inyectada vía IdentityForge V10', content:skillText });
            return newNodeId;
        } catch (err) { alert('Fallo inyectando Skill: ' + err.message); return null; }
    }

    async _importAgentZip(file) {
        if (!window.JSZip) await this._loadJSZip();
        try {
            const zip      = new window.JSZip();
            const contents = await zip.loadAsync(file);
            const configKey = Object.keys(contents.files).find(k => k.endsWith('config.json'));
            const agentKey  = Object.keys(contents.files).find(k => k.endsWith('AGENT.md'));

            if (!configKey || !agentKey) throw new Error('Paquete .agent corrupto. Falta config.json o AGENT.md');

            const configText = await contents.files[configKey].async('text');
            const agentText  = await contents.files[agentKey].async('text');
            const config     = JSON.parse(configText);

            let alias  = `@imported_agent_${Math.floor(Math.random()*1000)}`;
            let name   = 'Agente Importado';
            const yamlMatch = agentText.match(/^---\n([\s\S]*?)\n---/);
            if (yamlMatch) {
                const aliasMatch = yamlMatch[1].match(/alias:\s*(.+)/);
                const nameMatch  = yamlMatch[1].match(/name:\s*(.+)/);
                if (aliasMatch) alias = aliasMatch[1].trim();
                if (nameMatch)  name  = nameMatch[1].trim();
            }
            const promptContent = agentText.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

            const importedSkills = [];
            const skillsInZip    = Object.keys(contents.files).filter(k => k.includes('skills/') && k.endsWith('.json'));
            await KB.init();
            for (const sKey of skillsInZip) {
                const sText = await contents.files[sKey].async('text');
                const sData = JSON.parse(sText);
                if (sData.id) { await KB.saveNode(sData); importedSkills.push(sData.id); }
            }

            await store.dispatch({ type: 'ADD_USER', payload: { id:alias, name, globalRole:'ai-agent', profile:{ isAi:true, guardian:'creator', preferredEngine:config.engine||'anthropic', orchestration:config.orchestration||'react', active_skills:importedSkills } } });
            await KB.saveNode({ id:`prompt_global_${alias.replace('@','')}`, type:'prompt_a2a', category:'meta_prompt', targetId:alias, roleTarget:alias, projectId:'global', title:`AGENT.md: ${name}`, content:promptContent, dependencies:importedSkills, keywords:['ai_agent',alias] });

            window.dispatchEvent(new CustomEvent('identity-forged'));
            await this.render(alias);
            alert(`✅ Agente ${alias} importado desde el paquete .agent.`);

        } catch (err) { alert('Fallo importando .agent: ' + err.message); }
    }

    _loadJSZip() {
        return new Promise(resolve => {
            if (window.JSZip) return resolve();
            const s   = document.createElement('script');
            s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            s.onload  = resolve;
            document.head.appendChild(s);
        });
    }
}
