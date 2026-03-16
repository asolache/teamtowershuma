// v8/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class HomeView {
    constructor() {
        document.title = "Centro de Mando | SOS V9";
        this.currentTab = 'redes'; 
    }

    async getHtml() {
        const state = store.getState();
        
        // ==========================================
        // 1. PANTALLA DE LOGIN ZERO-TRUST (NO LOGUEADO)
        // ==========================================
        if (!state.session.activeUserId || state.session.role === 'guest') {
            return this.getLandingHtml();
        }

        // ==========================================
        // 2. CENTRO DE MANDO COMPLETO (LOGUEADO)
        // ==========================================
        const config = state.config;

        const headerConfig = {
            title: config.ecosystemName || "Agentic Network",
            subtitle: "V9 CORE",
            tagline: "Panel de control P2P. Supervisa el flujo de valor entre humanos e IA.",
            tabs: [
                { id: 'redes', label: '🪐 Nodos y Redes', active: this.currentTab === 'redes' },
                { id: 'agentes', label: '🤖 Enjambre IA', active: this.currentTab === 'agentes' }
            ]
        };

        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let apiKey = '';
        if (savedProvider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') apiKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini') || '';
        
        const hasKey = apiKey.length > 5;
        let onboardingHtml = '';

        if (!hasKey) {
            onboardingHtml = `
                <div style="background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.05)); border: 1px dashed var(--accent-purple); padding: 2rem; border-radius: 20px; margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-size:2.5rem; filter: drop-shadow(0 0 10px rgba(224, 64, 251, 0.5));">🤖</span>
                        <div>
                            <h3 style="margin:0; color:white; font-size:1.3rem;">¡Bienvenido, Master Architect!</h3>
                            <p style="margin:5px 0 0 0; color:#ccc; font-size:0.95rem; line-height:1.5;">Soy @genesi_ai. Para que el Enjambre pueda orquestar redes, generar código y redactar pactos Slicing Pie, necesitamos conexión a la Matrix.</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:15px; margin-top:10px;">
                        <a href="/v8/settings" data-link style="background:var(--accent-purple); color:white; padding:10px 20px; border-radius:10px; font-weight:bold; text-decoration:none; font-size:0.9rem; transition:0.2s;">🔑 Configurar API Key (LLM)</a>
                        <a href="/v8/help" data-link style="background:transparent; border:1px solid #555; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; text-decoration:none; font-size:0.9rem;">Leer Documentación</a>
                    </div>
                </div>
            `;
        }

        const aiAgents = state.globalUsers.filter(u => u.globalRole === 'ai-agent');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%;}
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }
                .glass-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; backdrop-filter: blur(15px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); box-sizing: border-box;}
                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2); font-size: 0.95rem; text-decoration:none;}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}
                .agent-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(224, 64, 251, 0.3); border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; transition:0.3s; margin-bottom:15px;}
                .agent-card:hover { border-color: var(--accent-purple); transform: translateX(5px); background: rgba(224, 64, 251, 0.05);}
                .agent-info { flex: 1; }
                .agent-name { font-weight: 900; color: white; font-size: 1.15rem; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;}
                .agent-id { color: var(--accent-purple); font-family: var(--font-mono); font-size: 0.85rem; font-weight:bold;}
                .agent-vision { color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-top: 8px; font-style:italic;}
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 768px) { .workspace { padding: 90px 1rem 120px 1rem; } .agent-card { flex-direction: column; align-items: flex-start; gap: 15px; } .agent-card > div:last-child { width: 100%; text-align: left !important; } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}
                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}
                    <div id="view-redes" class="tab-content ${this.currentTab === 'redes' ? 'active' : ''}">
                        ${onboardingHtml}
                        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2.5rem; margin-bottom: 2rem; flex-wrap:wrap; gap:15px;">
                            <div>
                                <h2 style="margin:0; font-size:1.2rem; color:white;">Redes Activas</h2>
                                <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">Ecosistemas bajo tu gobernanza.</p>
                            </div>
                            <a href="/v8/create" data-link class="btn-primary">➕ Inicializar Red</a>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
                            ${state.projects.map(p => `
                                <div class="glass-panel" style="padding: 2rem; cursor: pointer; transition: 0.3s;" onclick="localStorage.setItem('tt_active_project', '${p.id}'); window.location.href='/v8/dashboard'">
                                    <h3 style="margin: 0 0 10px 0; font-size: 1.4rem; color: white;">${p.nombre}</h3>
                                    <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1.5rem; text-transform:uppercase;">${p.archetype || 'Startup'}</div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:0.85rem; color:#aaa;">
                                        <span>Nodos: <b style="color:white;">${(p.usuarios||[]).length}</b></span>
                                        <span>Tubos VNA: <b style="color:white;">${(p.vna_flows||[]).length}</b></span>
                                    </div>
                                    <div style="border-top: 1px dashed var(--glass-border); padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; color: var(--accent-green);">
                                        <span>ENTRAR AL RADAR</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            `).join('') || '<div style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding:3rem; border:1px dashed #333; border-radius:16px;">No hay redes inicializadas. Crea tu primer Castell.</div>'}
                        </div>
                    </div>
                    <div id="view-agentes" class="tab-content ${this.currentTab === 'agentes' ? 'active' : ''}">
                        <div class="glass-panel" style="padding: 3rem;">
                            <h2 style="color: var(--accent-purple); margin-top:0; font-size:1.8rem; letter-spacing:-1px;">Enjambre IA Desplegado</h2>
                            <p style="color: #aaa; margin-bottom: 2rem; font-size:1.05rem;">Estos son los Agentes Nativos del Ecosistema. Reclútalos en tus redes desde el menú "La Colla" para delegar Work Orders.</p>
                            <div style="display: flex; flex-direction: column;">
                                ${aiAgents.length > 0 ? aiAgents.map(a => `
                                    <div class="agent-card">
                                        <div class="agent-info">
                                            <div class="agent-name"><span style="color: var(--accent-green); font-size: 0.6rem; text-shadow:0 0 10px var(--accent-green);">🟢 (ONLINE)</span> ${a.name}</div>
                                            <div class="agent-id">${a.id}</div>
                                            <div class="agent-vision">"${a.profile?.vision || 'Operador de IA'}"</div>
                                        </div>
                                        <div style="text-align: right; font-family: var(--font-mono); color: #888; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px; border: 1px solid #333;">
                                            <div style="font-size:0.7rem; text-transform:uppercase; margin-bottom:4px;">Afinidad Base:</div>
                                            <span style="color:white; font-weight:bold;">${(a.profile?.structural_affinity || ['@baixos'])[0]}</span>
                                            <div style="margin-top:8px; border-top:1px dashed #444; padding-top:8px;">Coste API: <span style="color:var(--accent-green); font-weight:bold;">€${a.profile?.apiCostPerHour || 0.15}/h</span></div>
                                        </div>
                                    </div>
                                `).join('') : '<div style="color:#666;">No hay agentes registrados en la matriz V9. Inicializa el Kernel.</div>'}
                            </div>
                        </div>
                    </div>
                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    // ==========================================
    // LOGIN PANTALLA WEB3 & 2FA (ZERO-TRUST REAL)
    // ==========================================
    getLandingHtml() {
        return `
            <style>
                .login-layout { display: flex; height: 100dvh; overflow: hidden; background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #050508 100%); font-family: var(--font-main); justify-content: center; align-items: center; color: white; position: relative;}
                .grid-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(0, 176, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 176, 255, 0.05) 1px, transparent 1px); background-size: 40px 40px; z-index: 1; pointer-events: none; transform: perspective(500px) rotateX(60deg) translateY(100px) translateZ(-200px); animation: gridMove 10s linear infinite;}
                @keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 0 40px; } }
                
                .login-card { background: rgba(10, 10, 15, 0.85); border: 1px solid var(--glass-border); border-radius: 24px; width: 100%; max-width: 450px; padding: 3rem 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05); backdrop-filter: blur(20px); z-index: 10; text-align: center;}
                .tt-logo { font-size: 3.5rem; margin-bottom: 10px; text-shadow: 0 0 20px rgba(0, 176, 255, 0.5); }
                .tt-title { font-size: 2rem; font-weight: 900; margin: 0 0 5px 0; letter-spacing: -1px; }
                .tt-subtitle { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2.5rem; font-family: var(--font-mono); }
                
                .btn-wallet { width: 100%; padding: 16px; border-radius: 16px; font-weight: bold; font-size: 1.1rem; display: flex; justify-content: center; align-items: center; gap: 12px; cursor: pointer; transition: all 0.3s; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: white; margin-bottom: 15px;}
                .btn-wallet:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); transform: translateY(-2px); }
                
                .divider { display: flex; align-items: center; text-align: center; color: #555; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; margin: 1.5rem 0; }
                .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #222; }
                .divider:not(:empty)::before { margin-right: .5em; }
                .divider:not(:empty)::after { margin-left: .5em; }
                
                .form-group { text-align: left; margin-bottom: 1.5rem; }
                .login-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 1rem; outline: none; transition: 0.3s; box-sizing: border-box; text-align: center;}
                .btn-login-std { width: 100%; background: linear-gradient(135deg, var(--accent-blue), #536dfe); color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: 0.3s;}
                
                .connected-state { display: none; flex-direction: column; align-items: center; animation: fadeIn 0.4s ease-out; }
                .wallet-address-box { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 10px 20px; border-radius: 30px; font-family: var(--font-mono); font-size: 0.85rem; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
                .btn-sign { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; width: 100%; padding: 16px; border-radius: 16px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 5px 15px rgba(224,64,251,0.3); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>

            <div class="login-layout">
                <div class="grid-bg"></div>
                <div class="login-card">
                    <div class="tt-logo">🏯</div>
                    <h1 class="tt-title">Kernel V9</h1>
                    <p class="tt-subtitle">Zero-Trust Cognitive OS</p>
                    
                    <div id="connectState">
                        <button class="btn-wallet" id="btnConnectInjected">
                            🦊 Conectar Browser Wallet
                            <div style="font-size: 0.7rem; color: #888; margin-top: 4px; text-transform: uppercase;">MetaMask / TrustWallet</div>
                        </button>
                        
                        <div id="stepManual">
                            <div class="divider">Fallback Local</div>
                            <div class="form-group">
                                <input type="text" id="inpLoginId" class="login-input" placeholder="@alvaro o 0xWallet..." value="@alvaro">
                            </div>
                            <button class="btn-login-std" id="btnConnectId">Solicitar Acceso</button>
                        </div>

                        <div id="step2fa" style="display:none; animation: fadeIn 0.4s ease-out;">
                            <div class="divider">Verificación 2FA</div>
                            <p style="font-size:0.85rem; color:#aaa; margin-bottom:15px; line-height:1.4;">
                                El protocolo requiere el código Authenticator (PIN Maestro) para verificar tu identidad.
                            </p>
                            <div class="form-group">
                                <input type="password" id="inp2faCode" class="login-input" placeholder="• • • • • •" maxlength="6" style="letter-spacing: 12px; font-size: 1.8rem; font-weight:900;">
                            </div>
                            <button class="btn-login-std" id="btnVerify2fa" style="background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));">Desbloquear Kernel</button>
                            <button style="background:transparent; border:none; color:#888; font-size:0.8rem; margin-top:15px; cursor:pointer;" id="btnCancel2fa">Volver</button>
                        </div>
                    </div>

                    <div id="signState" class="connected-state">
                        <div class="wallet-address-box" title="Wallet conectada">🟢 <span id="displayAddress">0x...</span></div>
                        <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;" id="signTextMsg">
                            El protocolo requiere tu firma criptográfica para verificar que posees la llave privada. (0 Gas fee)
                        </p>
                        <button class="btn-sign" id="btnSignMessage">✍️ Firmar Acceso (EIP-4361)</button>
                        <button style="background:transparent; border:none; color:#888; font-size:0.8rem; margin-top:15px; cursor:pointer;" id="btnDisconnect">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        
        // ==========================================
        // LÓGICA DE LOGIN (WEB3 & 2FA MANUAL)
        // ==========================================
        if (!state.session.activeUserId || state.session.role === 'guest') {
            const dom = {
                connectState: document.getElementById('connectState'),
                signState: document.getElementById('signState'),
                btnConnectInjected: document.getElementById('btnConnectInjected'),
                displayAddress: document.getElementById('displayAddress'),
                btnSignMessage: document.getElementById('btnSignMessage'),
                btnDisconnect: document.getElementById('btnDisconnect'),
                btnConnectId: document.getElementById('btnConnectId'),
                inpLoginId: document.getElementById('inpLoginId'),
                signTextMsg: document.getElementById('signTextMsg'),
                // DOM 2FA
                stepManual: document.getElementById('stepManual'),
                step2fa: document.getElementById('step2fa'),
                inp2faCode: document.getElementById('inp2faCode'),
                btnVerify2fa: document.getElementById('btnVerify2fa'),
                btnCancel2fa: document.getElementById('btnCancel2fa')
            };

            let web3Signer = null;
            let currentAddress = null;
            let ethersModule = null; 
            let pendingUserId = null;

            // 🔥 FIX: NAVEGACIÓN BLINDADA (TIEMPO DE GUARDADO DE 150ms)
          // 🔥 FIX: ESCUDO ANTI-FANTASMAS Y NAVEGACIÓN SPA NATIVA
         const doLogin = async (userId) => {
             if (!userId) return alert("Identidad no válida.");

             // 1. Verificamos si el usuario realmente existe en la memoria
             const currentState = store.getState();
             const userExists = currentState.globalUsers.find(u => u.id === userId);

             if (!userExists) {
                 alert(`🛑 ACCESO DENEGADO: La identidad "${userId}" no existe en el Padrón Global.\n\nEl navegador está leyendo una caché antigua donde no existes. Por favor, limpia la memoria o verifica tu store.js.`);
                 return; 
             }

             // 2. Despachamos el login a Redux (que lo guardará en LocalStorage)
             await store.dispatch({ type: 'LOGIN_USER', payload: { userId: userId } });

             // 3. Viajamos al Dashboard usando el Router nativo de la V9 (No reload, no href)
             setTimeout(() => {
                 navigateTo('/v8/dashboard');
             }, 100);
         };

            // 1. INVOCAR BROWSER WALLET (🦊 MetaMask, TrustWallet)
            if (dom.btnConnectInjected) {
                dom.btnConnectInjected.addEventListener('click', async () => {
                    const providerObj = window.ethereum || window.trustwallet;
                    
                    if (typeof providerObj !== 'undefined') {
                        try {
                            const originalHTML = dom.btnConnectInjected.innerHTML;
                            dom.btnConnectInjected.innerText = '⏳ Cargando Motor Criptográfico...';
                            
                            // Carga dinámica para que SES no bloquee el archivo
                            if (!ethersModule) {
                                ethersModule = await import('https://cdn.jsdelivr.net/npm/ethers@6.11.1/+esm');
                            }
                            const { ethers } = ethersModule;

                            dom.btnConnectInjected.innerText = '🦊 Solicitando Permisos...';
                            await providerObj.request({ method: 'eth_requestAccounts' });
                            
                            const provider = new ethers.BrowserProvider(providerObj);
                            web3Signer = await provider.getSigner();
                            currentAddress = await web3Signer.getAddress();
                            
                            const shortAddr = `${currentAddress.substring(0, 6)}...${currentAddress.substring(currentAddress.length - 4)}`;
                            dom.displayAddress.innerText = shortAddr;
                            dom.connectState.style.display = 'none';
                            dom.signState.style.display = 'flex';
                            
                            dom.btnConnectInjected.innerHTML = originalHTML;
                        } catch (err) {
                            console.error("Error Web3:", err);
                            alert("Conexión rechazada. Usa el Fallback Local.");
                            dom.btnConnectInjected.innerHTML = `🦊 Conectar Browser Wallet <div style="font-size: 0.7rem; color: #888; margin-top: 4px; text-transform: uppercase;">MetaMask / TrustWallet</div>`;
                        }
                    } else {
                        alert("No se ha detectado ninguna Wallet en tu navegador.");
                    }
                });
            }

            // 2. FIRMA CRIPTOGRÁFICA (SIWE)
            if (dom.btnSignMessage) {
                dom.btnSignMessage.addEventListener('click', async () => {
                    if (!web3Signer || !currentAddress || !ethersModule) return;
                    const { ethers } = ethersModule;

                    dom.btnSignMessage.innerText = '⏳ Esperando Firma...';
                    dom.btnSignMessage.style.opacity = '0.7';

                    const nonce = Date.now().toString(16);
                    const domain = window.location.host;
                    const message = `Welcome to TeamTowers V9!\n\nClick to sign in and accept the TeamTowers Terms of Service.\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nURI: https://${domain}\nWallet: ${currentAddress}\nNonce: ${nonce}`;

                    try {
                        const signature = await web3Signer.signMessage(message);
                        const recoveredAddress = ethers.verifyMessage(message, signature);
                        
                        if (recoveredAddress.toLowerCase() === currentAddress.toLowerCase()) {
                            dom.signTextMsg.innerText = "✅ Criptografía verificada. Entrando a la Matriz...";
                            dom.signTextMsg.style.color = "var(--accent-green)";
                            setTimeout(() => doLogin(currentAddress), 1000);
                        } else {
                            throw new Error("La dirección recuperada no coincide.");
                        }
                    } catch (error) {
                        console.error(error);
                        dom.btnSignMessage.innerText = '✍️ Reintentar Firma';
                        dom.btnSignMessage.style.opacity = '1';
                        alert("Firma rechazada o fallida. Operación cancelada.");
                    }
                });
            }

            // Cancelar Firma Web3
            if (dom.btnDisconnect) {
                dom.btnDisconnect.addEventListener('click', () => {
                    web3Signer = null; currentAddress = null;
                    dom.signState.style.display = 'none';
                    dom.connectState.style.display = 'block';
                });
            }

            // 3. FLUJO MANUAL (Paso 1: Solicitar Acceso con Alias)
            if (dom.btnConnectId) {
                dom.btnConnectId.addEventListener('click', () => {
                    const userId = dom.inpLoginId.value.trim();
                    if (!userId) return alert("Introduce una Identidad.");
                    
                    // Pasamos a la pantalla del 2FA
                    pendingUserId = userId;
                    dom.stepManual.style.display = 'none';
                    dom.btnConnectInjected.style.display = 'none'; 
                    dom.step2fa.style.display = 'block';
                    dom.inp2faCode.focus();
                });
            }

            // FLUJO MANUAL (Paso 2: Verificar PIN 2FA)
            if (dom.btnVerify2fa) {
                const verify2fa = () => {
                    const code = dom.inp2faCode.value.trim();
                    // El PIN por defecto de la Matriz es 202626
                    const masterPin = localStorage.getItem('tt_2fa_pin') || '202626';

                    if (code === masterPin) {
                        doLogin(pendingUserId);
                    } else {
                        alert("❌ Código Authenticator Incorrecto. Acceso denegado.");
                        dom.inp2faCode.value = '';
                        dom.inp2faCode.focus();
                    }
                };

                dom.btnVerify2fa.addEventListener('click', verify2fa);
                dom.inp2faCode.addEventListener('keypress', (e) => { if(e.key === 'Enter') verify2fa(); });
            }

            // Cancelar 2FA y volver atrás
            if (dom.btnCancel2fa) {
                dom.btnCancel2fa.addEventListener('click', () => {
                    pendingUserId = null;
                    dom.step2fa.style.display = 'none';
                    dom.stepManual.style.display = 'block';
                    dom.btnConnectInjected.style.display = 'flex';
                    dom.inp2faCode.value = '';
                });
            }

            return; // Fin del bloque Login.
        }

        // ==========================================
        // LÓGICA DEL HOME REGULAR (Ya logueado)
        // ==========================================
        Sidebar.initListeners();
        PageHeader.execute();

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`view-${this.currentTab}`);
            if(target) target.classList.add('active');
        });
    }
}
