// v9/js/components/SandboxRenderer.js
export class SandboxRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentData = null;
    }

    renderArtifact(artifact) {
        if (!this.container) return;
        this.currentData = artifact;
        
        if (artifact.type === 'web_component') {
            this.renderWebComponent(artifact);
        } else if (artifact.type === 'document') {
            this.renderDocument(artifact);
        } else if (artifact.type === 'entity_mutation') {
            this.renderEntityMutation(artifact);
        } else {
            this.container.innerHTML = `
                <div style="padding:3rem; text-align:center; color:var(--accent-red); font-family:var(--font-mono);">
                    ⚠️ Tipo de Artifact desconocido: ${artifact.type}
                </div>
            `;
        }
    }

    renderWebComponent(data) {
        this.container.innerHTML = `
            <style>
                .sb-wrapper { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--bg-dark); border-radius: 16px; overflow: hidden; border: 1px dashed var(--accent-blue); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .sb-wrapper.fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; border-radius: 0; border: none; }
                .sb-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: rgba(10,10,15,0.95); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .sb-title { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 8px; text-transform:uppercase;}
                .sb-actions { display: flex; gap: 10px; }
                .sb-btn { background: rgba(255,255,255,0.05); border: 1px solid #444; color: #ccc; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-family: var(--font-main); font-weight: bold; }
                .sb-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .sb-btn.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue); }
                .sb-content { flex: 1; position: relative; overflow: hidden; background: #050508; }
                .sb-iframe { width: 100%; height: 100%; border: none; background: #ffffff; transition: opacity 0.3s; }
                .sb-code-view { position: absolute; top:0; left:0; width: 100%; height: 100%; background: #0a0a0f; color: #00e676; font-family: var(--font-mono); font-size: 0.85rem; padding: 20px; overflow-y: auto; display: none; box-sizing: border-box; white-space: pre-wrap; }
            </style>
            <div class="sb-wrapper" id="sbWrapper">
                <div class="sb-toolbar">
                    <div class="sb-title">⚡ UI/UX Web Component</div>
                    <div class="sb-actions">
                        <button class="sb-btn active" id="btnSbPreview">👁️ Preview</button>
                        <button class="sb-btn" id="btnSbCode">💻 Code</button>
                        <button class="sb-btn" id="btnSbFullscreen">⛶ Fullscreen</button>
                    </div>
                </div>
                <div class="sb-content">
                    <iframe class="sb-iframe" id="sbIframe" sandbox="allow-scripts allow-same-origin"></iframe>
                    <div class="sb-code-view" id="sbCodeView"></div>
                </div>
            </div>
        `;

        const wrapper = this.container.querySelector('#sbWrapper');
        const iframe = this.container.querySelector('#sbIframe');
        const codeView = this.container.querySelector('#sbCodeView');
        const btnPreview = this.container.querySelector('#btnSbPreview');
        const btnCode = this.container.querySelector('#btnSbCode');
        const btnFullscreen = this.container.querySelector('#btnSbFullscreen');

        const combinedHTML = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>:root { --bg-dark: #050507; --bg-panel: #0a0a0f; --accent-blue: #00b0ff; --accent-purple: #e040fb; --accent-green: #00e676; --accent-orange: #ff9100; --accent-red: #ff5252; --text-main: #ffffff; --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; } body { margin: 0; padding: 0; font-family: var(--font-main); background-color: var(--bg-dark); color: var(--text-main); } ${data.css || ''}</style></head><body>${data.html || ''}<script>try { ${data.js || ''} } catch(e) { document.body.innerHTML += '<div style="color:red; padding:10px;">Error JS: ' + e.message + '</div>'; }</script></body></html>`;
        
        iframe.srcdoc = combinedHTML;
        codeView.innerText = `/* --- HTML --- */\n${data.html || ''}\n\n/* --- CSS --- */\n${data.css || ''}\n\n/* --- JS --- */\n${data.js || ''}`;

        btnPreview.onclick = () => { btnPreview.classList.add('active'); btnCode.classList.remove('active'); iframe.style.display = 'block'; codeView.style.display = 'none'; };
        btnCode.onclick = () => { btnCode.classList.add('active'); btnPreview.classList.remove('active'); iframe.style.display = 'none'; codeView.style.display = 'block'; };
        btnFullscreen.onclick = () => { if (!document.fullscreenElement) wrapper.requestFullscreen().catch(e=>console.warn(e)); else document.exitFullscreen(); };
        
        document.onfullscreenchange = () => {
            if (document.fullscreenElement === wrapper) wrapper.classList.add('fullscreen');
            else wrapper.classList.remove('fullscreen');
        };
    }

    renderDocument(data) {
        this.container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; background:var(--bg-panel); border:1px solid #333; border-radius:16px; overflow:hidden;">
                <div style="background:rgba(255,145,0,0.1); border-bottom:1px solid rgba(255,145,0,0.3); padding:15px; color:var(--accent-orange); font-family:var(--font-mono); font-weight:bold; font-size:0.85rem; text-transform:uppercase;">
                    📄 Documento / Entregable: ${data.title || 'Draft'}
                </div>
                <div style="padding:25px; overflow-y:auto; flex:1; font-family:'Georgia', serif; font-size:1.1rem; line-height:1.7; color:#ddd; white-space:pre-wrap;">
                    ${(data.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
            </div>
        `;
    }

    renderEntityMutation(data) {
        let extraBadges = '';
        if (data.references && data.references.length > 0) {
            extraBadges += `<span style="background:rgba(0,176,255,0.1); border:1px solid var(--accent-blue); color:var(--accent-blue); padding:4px 10px; border-radius:6px; font-size:0.75rem; margin-right:8px; font-family:var(--font-mono); font-weight:bold;">📚 ${data.references.length} Ref(s)</span>`;
        }
        if (data.evals && data.evals.length > 0) {
            extraBadges += `<span style="background:rgba(255,145,0,0.1); border:1px solid var(--accent-orange); color:var(--accent-orange); padding:4px 10px; border-radius:6px; font-size:0.75rem; margin-right:8px; font-family:var(--font-mono); font-weight:bold;">📋 ${data.evals.length} Eval(s)</span>`;
        }
        if (data.scripts && data.scripts.length > 0) {
            extraBadges += `<span style="background:rgba(0,230,118,0.1); border:1px solid var(--accent-green); color:var(--accent-green); padding:4px 10px; border-radius:6px; font-size:0.75rem; font-family:var(--font-mono); font-weight:bold;">⚡ ${data.scripts.length} Script(s)</span>`;
        }

        const hasEvals = data.evals && data.evals.length > 0;

        this.container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; background:rgba(224,64,251,0.05); border:1px solid var(--accent-purple); border-radius:16px; overflow:hidden;">
                <div style="background:rgba(224,64,251,0.1); border-bottom:1px dashed var(--accent-purple); padding:15px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="color:var(--accent-purple); font-family:var(--font-mono); font-weight:bold; font-size:0.85rem; text-transform:uppercase;">
                        🧬 Mutación de Entidad (${data.entity_type || 'skill'})
                    </div>
                    <div>
                        ${hasEvals ? `<button id="btnPentestSkill" style="background:linear-gradient(135deg, var(--accent-orange), var(--accent-red)); border:none; color:white; padding:8px 15px; border-radius:8px; font-weight:bold; cursor:pointer; margin-right:10px; transition:0.2s;">🧪 Ejecutar Pentest</button>` : ''}
                        <button id="btnSealMutation" style="background:linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border:none; color:white; padding:8px 15px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;">💾 Sellar en el Córtex</button>
                    </div>
                </div>
                <div style="padding:20px; overflow-y:auto; flex:1;">
                    <h2 style="color:white; margin-top:0;">${data.title || 'Entidad Anónima'}</h2>
                    <p style="color:#aaa; font-style:italic;">${data.description || 'Mutada desde el Omni-Paper'}</p>
                    
                    ${extraBadges ? `<div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:5px;">${extraBadges}</div>` : ''}

                    <div style="background:rgba(0,0,0,0.6); padding:15px; border-radius:12px; border:1px solid #333; margin-top:20px; font-family:var(--font-mono); font-size:0.85rem; color:#00e676; white-space:pre-wrap;">${(data.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                </div>
            </div>
        `;

        const btnSeal = this.container.querySelector('#btnSealMutation');
        btnSeal.addEventListener('click', () => {
            btnSeal.disabled = true;
            btnSeal.innerText = "⏳ Sellando...";
            window.dispatchEvent(new CustomEvent('save-entity-mutation', { detail: data }));
        });

        if (hasEvals) {
            const btnPentest = this.container.querySelector('#btnPentestSkill');
            btnPentest.addEventListener('click', () => {
                btnPentest.disabled = true;
                btnPentest.innerText = "🧪 Evaluando...";
                window.dispatchEvent(new CustomEvent('run-skill-pentest', { detail: data }));
            });
        }
    }
}
