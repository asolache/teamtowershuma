// v9/js/components/SandboxRenderer.js
export class SandboxRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.iframe = null;
        this.currentData = null;
        this.viewMode = 'preview'; // 'preview' o 'code'
    }

    renderArtifact(data) {
        if (!this.container) return;
        this.currentData = data;
        
        this.container.innerHTML = `
            <style>
                .sandbox-wrapper { display: flex; flex-direction: column; width: 100%; height: 100%; background: var(--bg-dark); border-radius: 16px; overflow: hidden; border: 1px solid var(--glass-border); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .sandbox-wrapper.fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9999; border-radius: 0; border: none; }
                
                .sb-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: rgba(10,10,15,0.95); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .sb-title { color: var(--accent-orange); font-family: var(--font-mono); font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 8px; }
                .sb-actions { display: flex; gap: 10px; }
                
                .sb-btn { background: rgba(255,255,255,0.05); border: 1px solid #444; color: #ccc; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-family: var(--font-main); font-weight: bold; }
                .sb-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .sb-btn.active { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue); }
                
                .sb-content { flex: 1; position: relative; overflow: hidden; background: #050508; }
                .sb-iframe { width: 100%; height: 100%; border: none; background: #ffffff; /* Fondo blanco por defecto para web components estándar */ transition: opacity 0.3s; }
                .sb-code-view { position: absolute; top:0; left:0; width: 100%; height: 100%; background: #0a0a0f; color: #00e676; font-family: var(--font-mono); font-size: 0.85rem; padding: 20px; overflow-y: auto; display: none; box-sizing: border-box; white-space: pre-wrap; }
            </style>
            <div class="sandbox-wrapper" id="sbWrapper">
                <div class="sb-toolbar">
                    <div class="sb-title">⚡ Web Deployer Artifact</div>
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

        this.attachLogic();
    }

    attachLogic() {
        const wrapper = this.container.querySelector('#sbWrapper');
        const iframe = this.container.querySelector('#sbIframe');
        const codeView = this.container.querySelector('#sbCodeView');
        const btnPreview = this.container.querySelector('#btnSbPreview');
        const btnCode = this.container.querySelector('#btnSbCode');
        const btnFullscreen = this.container.querySelector('#btnSbFullscreen');

        // 1. Inyectamos el ADN (HTML + CSS + JS) en el iFrame
        const combinedHTML = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    /* Inyectar variables del Kernel SOS para que el componente las herede si usa var(--) */
                    :root {
                        --bg-dark: #050507; --bg-panel: #0a0a0f;
                        --accent-blue: #00b0ff; --accent-purple: #e040fb;
                        --accent-green: #00e676; --accent-orange: #ff9100;
                        --accent-red: #ff5252; --text-main: #ffffff;
                        --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }
                    body { margin: 0; padding: 0; font-family: var(--font-main); background-color: var(--bg-dark); color: var(--text-main); }
                    ${this.currentData.css || ''}
                </style>
            </head>
            <body>
                ${this.currentData.html || '<div style="padding:20px;color:#888;">El Agente no generó HTML.</div>'}
                <script>
                    try {
                        ${this.currentData.js || ''}
                    } catch(e) {
                        console.error("Sandbox JS Error:", e);
                        document.body.innerHTML += '<div style="color:red; padding:10px;">Error JS: ' + e.message + '</div>';
                    }
                </script>
            </body>
            </html>
        `;
        
        iframe.srcdoc = combinedHTML;

        // 2. Rellenamos el visor de código
        codeView.innerText = `/* --- HTML --- */\n${this.currentData.html || ''}\n\n/* --- CSS --- */\n${this.currentData.css || ''}\n\n/* --- JS --- */\n${this.currentData.js || ''}`;

        // 3. Eventos de la Toolbar
        btnPreview.addEventListener('click', () => {
            this.viewMode = 'preview';
            btnPreview.classList.add('active'); btnCode.classList.remove('active');
            iframe.style.display = 'block'; codeView.style.display = 'none';
        });

        btnCode.addEventListener('click', () => {
            this.viewMode = 'code';
            btnCode.classList.add('active'); btnPreview.classList.remove('active');
            iframe.style.display = 'none'; codeView.style.display = 'block';
        });

        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                wrapper.requestFullscreen().catch(err => {
                    alert(`Error al intentar modo pantalla completa: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                wrapper.classList.add('fullscreen');
                btnFullscreen.innerHTML = '🗗 Salir';
                btnFullscreen.style.color = 'var(--accent-red)';
                btnFullscreen.style.borderColor = 'var(--accent-red)';
            } else {
                wrapper.classList.remove('fullscreen');
                btnFullscreen.innerHTML = '⛶ Fullscreen';
                btnFullscreen.style.color = '#ccc';
                btnFullscreen.style.borderColor = '#444';
            }
        });
    }
}
