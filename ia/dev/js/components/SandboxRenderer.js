// =============================================================================
// TEAMTOWERS SOS V10 — SANDBOX RENDERER
// Ruta: ia/dev/js/components/SandboxRenderer.js
// Renderiza Artifacts polimórficos: web_component, document, entity_mutation
// =============================================================================

import { KB } from '../core/kb.js';

export class SandboxRenderer {

    constructor(containerId) {
        this.container   = document.getElementById(containerId);
        this.currentData = null;
    }

    renderArtifact(artifact) {
        if (!this.container) return;
        this.currentData = artifact;

        switch (artifact.type) {
            case 'web_component':   this._renderWebComponent(artifact);   break;
            case 'document':        this._renderDocument(artifact);        break;
            case 'entity_mutation': this._renderEntityMutation(artifact);  break;
            default:
                this.container.innerHTML = `
                    <div style="padding:3rem; text-align:center; color:var(--accent-red); font-family:var(--font-mono);">
                        ⚠️ Tipo de Artifact desconocido: <b>${artifact.type}</b>
                    </div>`;
        }
    }

    // ── Web Component ─────────────────────────────────────────────
    _renderWebComponent(data) {
        this.container.innerHTML = `
        <style>
            .sb-wrapper  { display:flex; flex-direction:column; width:100%; height:100%; background:var(--bg-dark); border-radius:14px; overflow:hidden; border:1px dashed var(--accent-indigo); box-shadow:0 10px 30px rgba(0,0,0,0.5); }
            .sb-wrapper.fullscreen { position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:9999; border-radius:0; border:none; }
            .sb-toolbar  { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(10,10,15,0.97); border-bottom:1px solid rgba(255,255,255,0.05); }
            .sb-title    { color:var(--accent-indigo); font-family:var(--font-mono); font-size:0.82rem; font-weight:bold; display:flex; align-items:center; gap:8px; text-transform:uppercase; }
            .sb-actions  { display:flex; gap:8px; }
            .sb-btn      { background:rgba(255,255,255,0.05); border:1px solid #444; color:#ccc; padding:6px 12px; border-radius:8px; font-size:0.78rem; cursor:pointer; transition:0.2s; font-family:var(--font-main); font-weight:bold; }
            .sb-btn:hover  { background:rgba(255,255,255,0.1); color:white; }
            .sb-btn.active { background:rgba(99,102,241,0.1); border-color:var(--accent-indigo); color:var(--accent-indigo); }
            .sb-content  { flex:1; position:relative; overflow:hidden; background:#050508; }
            .sb-iframe   { width:100%; height:100%; border:none; background:#ffffff; transition:opacity 0.3s; }
            .sb-code-view { position:absolute; top:0; left:0; width:100%; height:100%; background:#0a0a0f; color:var(--accent-green); font-family:var(--font-mono); font-size:0.82rem; padding:18px; overflow-y:auto; display:none; box-sizing:border-box; white-space:pre-wrap; }
        </style>
        <div class="sb-wrapper" id="sbWrapper">
            <div class="sb-toolbar">
                <div class="sb-title">⚡ UI/UX Web Component</div>
                <div class="sb-actions">
                    <button class="sb-btn active" id="btnSbPreview">👁️ Preview</button>
                    <button class="sb-btn"         id="btnSbCode">💻 Code</button>
                    <button class="sb-btn"         id="btnSbFullscreen">⛶ Fullscreen</button>
                </div>
            </div>
            <div class="sb-content">
                <iframe class="sb-iframe"   id="sbIframe"   sandbox="allow-scripts allow-same-origin"></iframe>
                <div   class="sb-code-view" id="sbCodeView"></div>
            </div>
        </div>`;

        const wrapper    = this.container.querySelector('#sbWrapper');
        const iframe     = this.container.querySelector('#sbIframe');
        const codeView   = this.container.querySelector('#sbCodeView');
        const btnPreview = this.container.querySelector('#btnSbPreview');
        const btnCode    = this.container.querySelector('#btnSbCode');
        const btnFull    = this.container.querySelector('#btnSbFullscreen');

        const combinedHTML = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
:root{--bg-dark:#050507;--bg-panel:#0a0a0f;--accent-indigo:#6366f1;--accent-purple:#e040fb;--accent-green:#00e676;--accent-orange:#ff9100;--accent-red:#ff5252;--text-main:#ffffff;--font-main:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
body{margin:0;padding:0;font-family:var(--font-main);background-color:var(--bg-dark);color:var(--text-main);}
${data.css || ''}
</style></head><body>${data.html || ''}
<script>try{${data.js || ''}}catch(e){document.body.innerHTML+='<div style="color:red;padding:10px;">Error JS: '+e.message+'</div>';}</script>
</body></html>`;

        iframe.srcdoc  = combinedHTML;
        codeView.innerText = `/* --- HTML ---*/\n${data.html||''}\n\n/* --- CSS ---*/\n${data.css||''}\n\n/* --- JS ---*/\n${data.js||''}`;

        btnPreview.onclick = () => { btnPreview.classList.add('active'); btnCode.classList.remove('active'); iframe.style.display='block'; codeView.style.display='none'; };
        btnCode.onclick    = () => { btnCode.classList.add('active'); btnPreview.classList.remove('active'); iframe.style.display='none'; codeView.style.display='block'; };
        btnFull.onclick    = () => {
            if (!document.fullscreenElement) wrapper.requestFullscreen().catch(e => console.warn(e));
            else document.exitFullscreen();
        };
        document.onfullscreenchange = () => {
            wrapper.classList.toggle('fullscreen', !!document.fullscreenElement && document.fullscreenElement === wrapper);
        };
    }

    // ── Document ──────────────────────────────────────────────────
    _renderDocument(data) {
        this.container.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%; background:var(--bg-panel,#0a0a0f); border:1px solid #333; border-radius:14px; overflow:hidden;">
            <div style="background:rgba(255,145,0,0.1); border-bottom:1px solid rgba(255,145,0,0.3); padding:14px; color:var(--accent-orange); font-family:var(--font-mono); font-weight:bold; font-size:0.82rem; text-transform:uppercase;">
                📄 Documento / Entregable: ${data.title || 'Draft'}
            </div>
            <div style="padding:24px; overflow-y:auto; flex:1; font-family:'Georgia',serif; font-size:1.05rem; line-height:1.7; color:#ddd; white-space:pre-wrap;">
                ${(data.content || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
            </div>
        </div>`;
    }

    // ── Entity Mutation (Skill / Agente) ──────────────────────────
    _renderEntityMutation(data) {
        const hasRefs    = data.references?.length > 0;
        const hasEvals   = data.evals?.length > 0;
        const hasScripts = data.scripts?.length > 0;

        let extraBadges = '';
        if (hasRefs)    extraBadges += `<span style="background:rgba(0,176,255,0.1);border:1px solid var(--accent-blue,#00b0ff);color:var(--accent-blue,#00b0ff);padding:4px 10px;border-radius:6px;font-size:0.72rem;margin-right:6px;font-family:var(--font-mono);font-weight:bold;">📚 ${data.references.length} Ref(s)</span>`;
        if (hasEvals)   extraBadges += `<span style="background:rgba(255,145,0,0.1);border:1px solid var(--accent-orange);color:var(--accent-orange);padding:4px 10px;border-radius:6px;font-size:0.72rem;margin-right:6px;font-family:var(--font-mono);font-weight:bold;">📋 ${data.evals.length} Eval(s)</span>`;
        if (hasScripts) extraBadges += `<span style="background:rgba(0,230,118,0.1);border:1px solid var(--accent-green);color:var(--accent-green);padding:4px 10px;border-radius:6px;font-size:0.72rem;font-family:var(--font-mono);font-weight:bold;">⚡ ${data.scripts.length} Script(s)</span>`;

        this.container.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%; background:rgba(224,64,251,0.04); border:1px solid var(--accent-purple); border-radius:14px; overflow:hidden;">
            <div style="background:rgba(224,64,251,0.1); border-bottom:1px dashed var(--accent-purple); padding:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="color:var(--accent-purple); font-family:var(--font-mono); font-weight:bold; font-size:0.82rem; text-transform:uppercase;">
                    🧬 Mutación de Entidad (${data.entity_type || 'skill'})
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    ${extraBadges}
                    ${hasEvals ? `<button id="btnRunEvals" style="background:rgba(255,171,64,0.1);border:1px solid var(--accent-orange);color:var(--accent-orange);padding:5px 12px;border-radius:8px;font-size:0.78rem;cursor:pointer;font-weight:bold;transition:0.2s;">▶ Ejecutar Evals</button>` : ''}
                    <button id="btnSaveSkill" style="background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple));border:none;color:white;padding:5px 14px;border-radius:8px;font-size:0.78rem;cursor:pointer;font-weight:bold;transition:0.2s;">💾 Sellar en KB</button>
                </div>
            </div>

            <div style="padding:1.5rem; overflow-y:auto; flex:1;">
                <h3 style="color:white; margin-top:0; font-size:1.2rem; font-weight:900;">${data.title || 'Sin título'}</h3>
                ${data.description ? `<p style="color:#888; font-size:0.88rem; margin-bottom:1.5rem; font-style:italic;">${data.description}</p>` : ''}
                <pre style="background:rgba(0,0,0,0.6); border:1px solid #333; border-radius:10px; padding:1.25rem; color:#ccc; font-size:0.82rem; white-space:pre-wrap; font-family:var(--font-mono); line-height:1.6; overflow-x:auto;">${(data.content || '').replace(/</g,'&lt;')}</pre>

                ${hasRefs ? `
                <div style="margin-top:1.5rem;">
                    <div style="font-size:0.72rem; color:var(--accent-blue,#00b0ff); font-weight:900; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">📚 Referencias</div>
                    ${data.references.map(r => `<div style="background:rgba(0,0,0,0.4);border:1px solid #333;border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:0.82rem;color:#ccc;"><b style="color:white;">${r.title || '—'}</b><br>${(r.content || '').substring(0,200)}${r.content?.length > 200 ? '…' : ''}</div>`).join('')}
                </div>` : ''}

                ${hasEvals ? `
                <div style="margin-top:1.5rem;" id="evalsSection">
                    <div style="font-size:0.72rem; color:var(--accent-orange); font-weight:900; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">📋 Evals (TDD)</div>
                    ${data.evals.map((e, i) => `<div style="background:rgba(0,0,0,0.4);border:1px solid #333;border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:0.82rem;"><span style="color:#888;">#${i+1}</span> <b style="color:white;">${e.prompt || e.description || '—'}</b><br><span style="color:#555;">Esperado: ${e.expected_output || '—'}</span></div>`).join('')}
                </div>` : ''}
            </div>
        </div>`;

        // Sellar en KB
        document.getElementById('btnSaveSkill')?.addEventListener('click', async () => {
            const btn = document.getElementById('btnSaveSkill');
            btn.disabled  = true;
            btn.innerText = '⏳ Sellando…';

            try {
                await KB.init();
                const newId    = data.id || `skill_${Date.now()}`;
                const refIds   = [];
                const evalIds  = [];
                const scriptIds = [];

                // Guardar hijos
                for (const ref of (data.references || [])) {
                    const rId = `ref_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({ id: rId, type: 'reference', category: 'reference', projectId: 'global', targetId: 'global', title: ref.title || 'Referencia', content: ref.content || '' });
                    refIds.push(rId);
                }
                for (const ev of (data.evals || [])) {
                    const eId = `eval_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({ id: eId, type: 'eval', category: 'eval', projectId: 'global', targetId: 'global', title: ev.prompt || 'Eval', content: JSON.stringify([ev]) });
                    evalIds.push(eId);
                }
                for (const sc of (data.scripts || [])) {
                    const sId = `script_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                    await KB.saveNode({ id: sId, type: 'script', category: 'script', projectId: 'global', targetId: 'global', title: sc.title || 'Script', content: sc.content || '' });
                    scriptIds.push(sId);
                }

                await KB.saveNode({
                    id:          newId,
                    type:        data.entity_type || 'skill',
                    category:    data.entity_type || 'skill',
                    projectId:   'global',
                    targetId:    'global',
                    title:       data.title || 'Skill V10',
                    description: data.description || '',
                    content:     data.content || '',
                    references:  refIds,
                    evals:       evalIds,
                    scripts:     scriptIds,
                    keywords:    ['#generated_v10']
                });

                window.dispatchEvent(new CustomEvent('refresh-lms-data'));
                btn.innerText = '✅ Sellado en KB';
                btn.style.background = 'var(--accent-green)';
                btn.style.color      = 'black';

            } catch (err) {
                alert('Error al sellar en KB: ' + err.message);
                btn.disabled  = false;
                btn.innerText = '💾 Sellar en KB';
            }
        });
    }
}
