// v5/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class HomeView {
    constructor() {
        document.title = "Centro de Mando | TeamTowers SOS";
        this.currentTab = 'identidad'; // identidad, proyectos, mapa, explorador
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const config = state.config;

        // -------------------------------------------------------------------
        // MODO LANDING PAGE (No logueado)
        // -------------------------------------------------------------------
        if (!activeUserId || activeUserId === 'ecosystem-admin' || state.session.role === 'guest') {
            return this.getLandingHtml();
        }

        // -------------------------------------------------------------------
        // MODO DASHBOARD DE ECOSISTEMA (Logueado) V9.0
        // -------------------------------------------------------------------
        const user = state.globalUsers.find(u => u.id === activeUserId);
        const archetypeColors = {
            'startup': { label: '🚀 STARTUP', color: 'var(--accent-green)' },
            'corp': { label: '🏢 HOLDING / CORP', color: 'var(--accent-blue)' },
            'corporate': { label: '🏢 HOLDING / CORP', color: 'var(--accent-blue)' },
            'dao': { label: '🤖 IA-DAO', color: 'var(--accent-purple)' },
            'incubator': { label: '🏭 INCUBADORA MATRICIAL', color: 'var(--accent-orange)' },
            'sos': { label: '🆘 S.O.S. COMUNITARIO', color: 'var(--accent-red)' },
            'custom': { label: '✨ RED CUSTOM', color: 'white' }
        };

        const globalArchetype = config.archetype || (state.projects[0] ? state.projects[0].archetype : 'startup');
        const archData = archetypeColors[globalArchetype] || archetypeColors['startup'];

        const headerConfig = {
            title: config.ecosystemName || "TeamTowers Network",
            subtitle: `<span style="font-size:0.6rem; padding:4px 8px; border-radius:12px; border:1px solid ${archData.color}; color:${archData.color}; vertical-align:middle; margin-left:10px;">${archData.label}</span>`,
            tagline: "Panel de control del Ecosistema (Macro-Red).",
            tabs: [
                { id: 'identidad', label: '📜 Misión & Comando', active: this.currentTab === 'identidad' },
                { id: 'proyectos', label: '🪐 Nodos (Proyectos)', active: this.currentTab === 'proyectos' },
                { id: 'mapa', label: '🕸️ VNA Global', active: this.currentTab === 'mapa' },
                { id: 'explorador', label: '🔎 Etherscan Local', active: this.currentTab === 'explorador' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; height: 100%; box-sizing: border-box; scroll-behavior: smooth;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 2rem; }
                .tab-content.active { display: block; }

                /* PANELES */
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem;}
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                
                /* STATS */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; }
                .stat-value { font-size: 2.5rem; color: var(--accent-green); font-weight: 800; font-family: var(--font-mono); margin-bottom: 5px; }
                .stat-label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                /* GRID PROYECTOS */
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .project-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 12px; transition: transform 0.2s; cursor: pointer; text-decoration: none;}
                .project-card:hover { transform: translateY(-3px); border-color: var(--accent-blue); }
                .project-name { color: white; font-weight: bold; font-size: 1.2rem; margin-bottom: 10px; display:block;}
                .project-meta { font-size: 0.8rem; color: #888; display: flex; justify-content: space-between;}

                /* ETHERSCAN LOCAL */
                .etherscan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;}
                .etherscan-filters select, .etherscan-filters input { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; outline: none; font-size:0.85rem; font-family:var(--font-mono);}
                .ledger-table-wrapper { overflow-x: auto; background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1rem;}
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; font-family: var(--font-mono); font-size: 0.85rem;}
                .ledger-table th { padding: 1rem; color: var(--accent-blue); border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem;}
                .ledger-table td { padding: 1rem; border-bottom: 1px dashed #1a1a24; color: #ddd; }
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                .hash-badge { color: var(--accent-purple); padding: 2px 6px; border-radius: 4px; background: rgba(224,64,251,0.1); border: 1px solid rgba(224,64,251,0.2);}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .etherscan-filters { width: 100%; display: flex; flex-direction: column; }
                    .etherscan-filters input, .etherscan-filters select { width: 100%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-identidad" class="tab-content active">
                        <div class="panel">
                            <h2>📜 Misión y System Prompt Global</h2>
                            <p style="font-family: var(--font-mono); color: #ccc; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px dashed #444;">
                                ${config.globalPrompt || "El Ecosistema aún no tiene un System Prompt definido. Ve a Configuración para establecer su propósito."}
                            </p>
                        </div>

                        <div class="panel">
                            <h2>📊 Tablero de Comando Global</h2>
                            <div class="stats-grid" id="globalStatsGrid">
                                <div class="stat-card">
                                    <div class="stat-value">Cargando...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="view-proyectos" class="tab-content">
                        <div class="projects-grid" id="ecosystemProjectsGrid">
                            </div>
                    </div>

                    <div id="view-mapa" class="tab-content">
                        <div class="panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height: 400px; text-align:center;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🕸️</div>
                            <h2 style="border:none;">Topología Macro-Red (En Construcción)</h2>
                            <p style="max-width: 500px; margin:0 auto;">En la V9, este lienzo mostrará cómo las empresas/proyectos (nodos macro) se pasan valor entre ellos mediante el orquestador de <code>macroFlows</code> del Kernel.</p>
                        </div>
                    </div>

                    <div id="view-explorador" class="tab-content">
                        <div class="etherscan-header">
                            <h2 style="color:white; margin:0;">🔎 Explorador de Bloques</h2>
                            <div class="etherscan-filters">
                                <input type="text" id="scanSearch" placeholder="Buscar por Tx Hash o Alias...">
                                <select id="scanProjectFilter">
                                    <option value="all">Todas las Redes</option>
                                    ${state.projects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="ledger-table-wrapper">
                            <table class="ledger-table">
                                <thead>
                                    <tr>
                                        <th>Hash</th>
                                        <th>Red (Proyecto)</th>
                                        <th>Fecha</th>
                                        <th>Nodo</th>
                                        <th>Concepto</th>
                                        <th style="text-align:right;">Slices Generados</th>
                                    </tr>
                                </thead>
                                <tbody id="scanTableBody">
                                    </tbody>
                            </table>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    // --- LANDING PAGE (NO LOGUEADO) ---
    getLandingHtml() {
        return `
            <style>
                .landing-canvas { height: 100vh; width: 100vw; background: #050507; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-main); position: relative; overflow: hidden; }
                .grid-bg { position: absolute; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 176, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 176, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg); bottom: -50%; left: -50%; animation: gridMove 20s linear infinite; z-index: 0; }
                @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }
                .content-box { z-index: 10; text-align: center; max-width: 900px; padding: 0 2rem; background: rgba(5, 5, 7, 0.8); backdrop-filter: blur(10px); padding: 4rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 30px 60px rgba(0,0,0,0.8);}
                .tagline { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 1.5rem; display: inline-block; background: rgba(0,176,255,0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid rgba(0,176,255,0.2);}
                .main-title { font-size: 4rem; color: white; line-height: 1; margin-bottom: 1.5rem; letter-spacing: -2px; font-weight: 800; }
                .main-title span { color: transparent; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; background-clip: text; }
                .description { color: #aaa; font-size: 1.1rem; max-width: 600px; margin: 0 auto 3rem auto; line-height: 1.6; }
                .auth-container { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; max-width: 350px; margin: 0 auto;}
                .btn-web3 { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;}
                .btn-web3:hover { background: rgba(255,255,255,0.1); border-color: white; transform: translateY(-2px);}
                #googleButtonContainer { width: 100%; display: flex; justify-content: center;}
                .features-row { display: flex; justify-content: center; gap: 30px; margin-top: 3rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem;}
                .feat { font-size: 0.8rem; color: #666; display: flex; align-items: center; gap: 8px;}
                .feat strong { color: var(--accent-green); }
                .terminal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 7, 0.98); backdrop-filter: blur(20px); z-index: 2000; display: none; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-mono); color: var(--accent-green); }
                .boot-log { width: 500px; text-align: left; font-size: 1rem; line-height: 2; border-left: 3px solid var(--accent-blue); padding-left: 25px; text-shadow: 0 0 8px rgba(0, 230, 118, 0.5); font-weight: bold; }
                .cursor { display: inline-block; width: 10px; height: 18px; background: var(--accent-green); animation: blink 0.8s infinite; margin-left: 5px; vertical-align: middle;}
                @keyframes blink { 50% { opacity: 0; } }
            </style>
            <div class="landing-canvas">
                <div class="grid-bg"></div>
                <div class="content-box">
                    <span class="tagline">Local-First DAO OS</span>
                    <h1 class="main-title">No uses software.<br>Construye <span>Soberanía.</span></h1>
                    <p class="description">El primer Exoesqueleto Organizacional que fusiona Modelos Dinámicos de Equidad (Slicing Pie), Agentes IA y Bases de Datos Locales para equipos radicales.</p>
                    <div class="auth-container">
                        <button class="btn-web3" id="btnConnectWallet">🦊 Conectar Wallet (Web3)</button>
                        <div style="color:#555; font-size:0.8rem; margin: 5px 0;">— o utiliza el puente Web2 —</div>
                        <div id="googleButtonContainer"></div>
                        <div id="authStatus" style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; display: none;">Sincronizando Identidad Fractal...</div>
                    </div>
                    <div class="features-row">
                        <div class="feat"><strong>✓</strong> Datos en Localhost</div>
                        <div class="feat"><strong>✓</strong> Contratos Inmutables</div>
                        <div class="feat"><strong>✓</strong> Orquestador Cognitivo IA</div>
                    </div>
                </div>
                <div class="terminal-overlay" id="bootTerminal">
                    <div style="font-size: 4rem; margin-bottom: 2rem; text-shadow: 0 0 20px rgba(0,176,255,0.5);">🗼</div>
                    <div class="boot-log" id="logContent"></div>
                    <div style="margin-top: 3rem; font-size: 0.75rem; color: #555; text-shadow: none;">SOS_KERNEL_STABLE // BUILD 2026.03.11</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        if (!state.session.activeUserId || state.session.activeUserId === 'ecosystem-admin' || state.session.role === 'guest') {
            this.initLandingScripts();
            return;
        }

        // --- SCRIPTS DEL DASHBOARD ECOSISTEMA (LOGUEADO) ---
        Sidebar.initListeners();
        PageHeader.execute();

        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => content.classList.remove('active'));
                
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        this.renderGlobalStats(state);
        this.renderEcosystemProjects(state);
        this.renderEtherscan(state);

        // Filtros Etherscan
        document.getElementById('scanSearch')?.addEventListener('input', () => this.renderEtherscan(store.getState()));
        document.getElementById('scanProjectFilter')?.addEventListener('change', () => this.renderEtherscan(store.getState()));
    }

    renderGlobalStats(state) {
        let totalProjects = state.projects.length;
        let totalGlobalSlices = 0;
        let totalGlobalUsers = new Set();
        let totalTxs = 0;

        state.projects.forEach(p => {
            (p.ledger || []).forEach(l => {
                totalGlobalSlices += l.valorCongelado || 0;
                totalTxs++;
            });
            (p.usuarios || []).forEach(u => totalGlobalUsers.add(u.id));
        });

        document.getElementById('globalStatsGrid').innerHTML = `
            <div class="stat-card" style="border-color: var(--accent-blue);">
                <div class="stat-value" style="color: var(--accent-blue);">${totalProjects}</div>
                <div class="stat-label">Proyectos (Nodos)</div>
            </div>
            <div class="stat-card" style="border-color: var(--accent-green);">
                <div class="stat-value" style="color: var(--accent-green);">${Math.round(totalGlobalSlices).toLocaleString()}</div>
                <div class="stat-label">Slices Minados Global</div>
            </div>
            <div class="stat-card" style="border-color: var(--accent-purple);">
                <div class="stat-label" style="margin-bottom:5px;">Comunidad</div>
                <div style="font-size: 1.5rem; color: white; font-weight:bold;">${totalGlobalUsers.size} Usuarios</div>
                <div style="font-size: 0.8rem; color: #888; margin-top:5px;">${totalTxs} Bloques Validados</div>
            </div>
        `;
    }

    renderEcosystemProjects(state) {
        const grid = document.getElementById('ecosystemProjectsGrid');
        if(!grid) return;
        
        if (state.projects.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; padding:3rem; text-align:center; color:#888;">El Ecosistema está vacío. Crea tu primera red en la configuración.</div>`;
            return;
        }

        grid.innerHTML = state.projects.map(p => {
            const usersCount = (p.usuarios || []).length;
            const ledgerCount = (p.ledger || []).length;
            return `
                <a href="/v5/project" class="project-card" onclick="localStorage.setItem('tt_active_project', '${p.id}')">
                    <span class="project-name">${p.nombre}</span>
                    <div class="project-meta">
                        <span>👥 ${usersCount} Nodos</span>
                        <span>🧱 ${ledgerCount} Bloques</span>
                    </div>
                </a>
            `;
        }).join('');
    }

    renderEtherscan(state) {
        const tbody = document.getElementById('scanTableBody');
        if(!tbody) return;

        const searchQ = document.getElementById('scanSearch')?.value.toLowerCase() || '';
        const projFilt = document.getElementById('scanProjectFilter')?.value || 'all';

        let globalLedger = [];
        state.projects.forEach(p => {
            if(projFilt === 'all' || projFilt === p.id) {
                (p.ledger || []).forEach(l => {
                    globalLedger.push({ ...l, projectName: p.nombre });
                });
            }
        });

        // Ordenar por fecha más reciente
        globalLedger.sort((a, b) => b.timestamp - a.timestamp);

        // Filtrar por búsqueda (Añadido parche defensivo para los hash antiguos)
        if (searchQ) {
            globalLedger = globalLedger.filter(l => 
                (l.hash || '').toLowerCase().includes(searchQ) || 
                (l.userId || '').toLowerCase().includes(searchQ) || 
                (l.description || '').toLowerCase().includes(searchQ)
            );
        }

        if (globalLedger.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color:#666;">No se encontraron bloques.</td></tr>`;
            return;
        }

        tbody.innerHTML = globalLedger.slice(0, 100).map(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const user = state.globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
            
            // Fix defensivo: si no hay hash (datos legacy V6), usa el id o un placeholder
            const rawHash = entry.hash || entry.id || 'LEGACY_BLOCK';
            const hashShort = rawHash.substring(0,10);
            
            const slicesFmt = `+${Math.round(entry.valorCongelado).toLocaleString()}`;
            
            return `
                <tr>
                    <td><span class="hash-badge" title="${rawHash}">${hashShort}...</span></td>
                    <td style="color:var(--accent-blue);">${entry.projectName}</td>
                    <td style="color:#888;">${date}</td>
                    <td style="font-weight:bold; color:white;">${user.name}</td>
                    <td style="color:#ccc;">${entry.description}</td>
                    <td style="text-align:right; font-weight:bold; color:var(--accent-green); font-family:var(--font-mono);">${slicesFmt}</td>
                </tr>
            `;
        }).join('');
    }

    // --- LANDING SCRIPTS ---
    initLandingScripts() {
        if (!document.getElementById('gsi-script')) {
            const script = document.createElement('script');
            script.id = 'gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.head.appendChild(script);
            script.onload = () => this.initGoogleAuth();
        } else {
            this.initGoogleAuth();
        }

        const btnWallet = document.getElementById('btnConnectWallet');
        if (btnWallet) {
            btnWallet.addEventListener('click', () => {
                const address = prompt("Fase Beta: Simulador de Conexión Ethers.js\nIntroduce una Wallet Address (Ej: 0x123...):", "0xabc123...");
                if (address) {
                    this.processLoginOrOnboarding({ wallet: address, name: "Crypto User" });
                }
            });
        }
    }

    initGoogleAuth() {
        const GOOGLE_CLIENT_ID = "778991708293-c4f7s4l4339ooldpun0eitfdb12gjfdn.apps.googleusercontent.com";
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: this.handleGoogleCredentialResponse.bind(this)
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleButtonContainer"),
                    { theme: "outline", size: "large", shape: "rectangular", width: 350 }
                );
            } catch (e) {
                console.warn("GSI Error:", e);
                document.getElementById("googleButtonContainer").innerHTML = 
                    `<button class="btn-web3" onclick="alert('Google Auth requiere HTTPS / Dominio válido.')">⚠️ Forzar Login Dummy</button>`;
            }
        }
    }

    async handleGoogleCredentialResponse(response) {
        document.getElementById('authStatus').style.display = 'block';
        document.getElementById('googleButtonContainer').style.display = 'none';
        document.getElementById('btnConnectWallet').style.display = 'none';

        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        this.processLoginOrOnboarding({ email: decodedToken.email, name: decodedToken.name });
    }

    async processLoginOrOnboarding(credentials) {
        const state = store.getState();
        
        const existingUser = state.globalUsers.find(u => 
            (credentials.email && u.email === credentials.email) || 
            (credentials.wallet && u.wallet === credentials.wallet) ||
            (credentials.email && u.walletOrSocial === credentials.email)
        );

        if (existingUser) {
            const terminal = document.getElementById('bootTerminal');
            const logContent = document.getElementById('logContent');
            if (terminal) terminal.style.display = 'flex';
            
            const lines = [
                `> AUTHENTICATING ENTITY: [${existingUser.id}]`,
                "> SYNCING VNA PROTOCOLS... <span style='color:var(--accent-blue)'>[OK]</span>",
                "> LOADING SLICING PIE LEDGER... <span style='color:var(--accent-blue)'>[OK]</span>",
                "> DEPLOYING COGNITIVE EXOSKELETON..."
            ];

            let i = 0;
            const printLine = () => {
                if (i < lines.length) {
                    if (logContent) logContent.innerHTML += `<div style="margin-bottom: 5px;">${lines[i]}</div>`;
                    i++;
                    setTimeout(printLine, 300); 
                } else {
                    if (logContent) logContent.innerHTML += `<div style="margin-top:20px; color:white; font-size: 1.2rem;">ACCESS GRANTED <span class="cursor"></span></div>`;
                    setTimeout(async () => {
                        await store.dispatch({ type: 'LOGIN_USER', payload: { userId: existingUser.id } });
                        window.location.reload();
                    }, 600);
                }
            };
            setTimeout(printLine, 200);

        } else {
            sessionStorage.setItem('tt_temp_onboarding_email', credentials.email || '');
            sessionStorage.setItem('tt_temp_onboarding_wallet', credentials.wallet || '');
            sessionStorage.setItem('tt_temp_onboarding_name', credentials.name || '');
            setTimeout(() => window.location.href = '/v5/onboarding', 1000);
        }
    }
}
