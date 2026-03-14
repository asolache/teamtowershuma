// v8/js/views/DashboardView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';

export default class DashboardView {
    constructor() {
        document.title = "Dashboard de Red | TeamTowers V8";
        this.activeProjectId = null;
        this.currentTab = 'overview';
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                        <div class="glass-panel" style="text-align:center; padding: 4rem; max-width: 500px;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1; filter: drop-shadow(0 0 20px rgba(0,176,255,0.3));">🛰️</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Radar Vacío</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">Aún no has instanciado ninguna red en este Kernel.</p>
                             <a href="/v8/create" data-link class="btn-primary" style="text-decoration:none;">➕ Instanciar Proyecto</a>
                        </div>
                    </main>
                </div>
            `;
        }

        this.activeProjectId = project.id;
        const hasAccess = store.canUserViewProject(project.id, activeUserId, globalRole);
        
        if (!hasAccess) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                        <div class="glass-panel" style="text-align:center; border: 1px dashed var(--accent-red); padding: 4rem; max-width: 600px; background: rgba(255, 82, 82, 0.05);">
                            <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">🔒</div>
                            <h1 style="color: var(--accent-red); margin-top:0; font-weight:900; letter-spacing:-1px;">ACCESO DENEGADO</h1>
                            <p style="color: #ccc; font-size:1.1rem;">Este Ecosistema es privado. No eres un nodo reconocido en su topología.</p>
                        </div>
                    </main>
                </div>
            `;
        }

        // --- CÁLCULOS CORE V8 ---
        const harvest = store.calculateHarvest(project.id) || [];
        const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
        const totalHours = (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0);
        const resilience = store.calculateResilience(project.id);
        
        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));

        // --- CÁLCULO DE ARBITRAJE IA (Fase 17) ---
        let aiGrossValue = 0;
        let aiCost = 0;
        
        (project.ledger || []).forEach(tx => {
            const user = state.globalUsers.find(u => u.id === tx.userId);
            if (user && user.profile?.isAi) {
                const hrs = tx.horas || 1;
                // Valor de Mercado que hubiera cobrado un humano
                aiGrossValue += (tx.fmv || 50) * (tx.multiplier || 1) * hrs; 
                // Coste real de la API
                aiCost += (user.profile.apiCostPerHour || 0.15) * hrs;
            }
        });
        const aiNetSavings = aiGrossValue - aiCost;

        let vacantesHtml = sillasVacias.length === 0 
            ? `<div style="padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 12px; color: var(--accent-green); text-align: center; font-weight: bold;">✅ Arquitectura completa. Sin vacantes estructurales.</div>`
            : sillasVacias.map(r => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 1.2rem; border-radius: 12px; margin-bottom: 12px; transition: 0.3s;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--glass-border)'">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="font-size:1.8rem; line-height:1; filter:drop-shadow(0 0 5px rgba(255,255,255,0.2));">${this.getIcon(r.levelId)}</div>
                        <div>
                            <div style="color: white; font-weight: 900; font-size: 1rem;">${r.name}</div>
                            <div style="font-size: 0.8rem; color: #888; font-family: var(--font-mono); margin-top: 4px;">${r.levelId} | FMV: <span style="color:var(--accent-green); font-weight:bold;">${r.fmv}€/h</span></div>
                        </div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}" style="background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 900; transition: all 0.2s; text-transform: uppercase;">➕ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición...';
        const tagsHtml = (project.tags && project.tags.length > 0) 
            ? project.tags.map(t => `<span style="font-family: var(--font-mono); font-size: 0.7rem; color: #888; border: 1px solid #333; padding: 4px 10px; border-radius: 6px; background: rgba(0,0,0,0.5);">#${t}</span>`).join('') 
            : `<span style="font-family: var(--font-mono); font-size: 0.7rem; color: #888; border: 1px solid #333; padding: 4px 10px; border-radius: 6px; background: rgba(0,0,0,0.5);">#VNA</span>`;
        
        // --- HEADER V8 CONFIG ---
        const headerConfig = {
            title: project.nombre,
            subtitle: project.archetype, 
            tagline: "Centro de Mando del Ecosistema",
            tabs: [
                { id: 'overview', label: '📊 Resumen Operativo', active: this.currentTab === 'overview' },
                { id: 'market', label: '🎯 Mercado Interno', active: this.currentTab === 'market', badge: sillasVacias.length || null },
                { id: 'settings', label: '⚙️ Configuración', active: this.currentTab === 'settings' }
            ],
            magicActions: [
                { id: 'audit', label: 'Auditoría VNA & Equity', icon: '🧠', isAi: true, tokens: 150 },
                { id: 'legal', label: 'Emitir Pacto Socios', icon: '⚖️', isAi: true, tokens: 300 }
            ]
        };

        return `
            <style>
                .workflow-schema { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem; margin-bottom: 2rem; }
                .schema-step { display: flex; flex-direction: column; align-items: center; text-decoration: none; text-align: center; gap: 12px; flex: 1; transition: all 0.3s; filter: grayscale(40%) opacity(0.8); }
                .schema-step:hover { transform: translateY(-5px); filter: grayscale(0%) opacity(1); }
                .s-icon { font-size: 2.5rem; background: rgba(255,255,255,0.03); width: 75px; height: 75px; display: flex; justify-content: center; align-items: center; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 20px rgba(0,0,0,0.4); transition: 0.3s; }
                .schema-step:hover .s-icon { border-color: var(--accent-blue); box-shadow: 0 15px 30px rgba(0,176,255,0.2); }
                .s-text { color: white; font-weight: 900; font-size: 0.95rem; text-transform: uppercase; }
                .s-text span { color: var(--accent-blue); font-size: 0.75rem; font-family: var(--font-mono); display: block; margin-top: 4px; font-weight: normal; }
                .schema-arrow { color: rgba(255,255,255,0.1); font-size: 2rem; font-weight: bold; margin-top: 20px; }

                .presentation-text { color: #ccc; font-size: 1rem; line-height: 1.6; overflow: hidden; transition: max-height 0.4s ease; }
                .presentation-text.collapsed { max-height: 75px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }

                .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }
                .kpi-card { background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); padding: 1.5rem 1rem; border-radius: 16px; text-align: center; transition: 0.3s; }
                .kpi-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.02); }
                .kpi-val { font-size: 2.2rem; font-weight: 900; display: block; margin-bottom: 5px; font-family: var(--font-mono); line-height: 1;}
                .kpi-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

                /* AI ARBITRAGE PANEL */
                .ai-arbitrage-panel { background: linear-gradient(135deg, rgba(224, 64, 251, 0.05), rgba(0, 176, 255, 0.05)); border: 1px dashed var(--accent-purple); padding: 2rem; border-radius: 20px; margin-bottom: 2.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;}
                .ai-stat-block { display: flex; flex-direction: column; gap: 5px; }
                .ai-stat-lbl { font-size: 0.75rem; color: #aaa; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
                .ai-stat-val { font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: white; }

                .modal-ia { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 4000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px);}
                .modal-ia-content { background: var(--bg-dark); width: 90%; max-width: 800px; max-height: 85vh; border-radius: 20px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border-top: 4px solid var(--accent-purple);}
                
                @media (max-width: 768px) {
                    .workflow-schema { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 1.5rem; }
                    .schema-arrow { display: none; }
                    .s-icon { width: 60px; height: 60px; font-size: 2rem; border-radius: 16px; margin-bottom: 10px;}
                    .ai-arbitrage-panel { flex-direction: column; align-items: flex-start; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-overview" class="tab-content ${this.currentTab === 'overview' ? 'active' : ''}">
                        
                        <div class="glass-panel workflow-schema">
                            <a href="/v8/map" data-link class="schema-step">
                                <div class="s-icon">🕸️</div>
                                <div class="s-text">1. Diseñar<br><span>(Mapa VNA)</span></div>
                            </a>
                            <div class="schema-arrow">→</div>
                            <a href="/v8/project" data-link class="schema-step">
                                <div class="s-icon">📋</div>
                                <div class="s-text">2. Asignar<br><span>(Kanban)</span></div>
                            </a>
                            <div class="schema-arrow">→</div>
                            <a href="/v8/focus" data-link class="schema-step">
                                <div class="s-icon">🍅</div>
                                <div class="s-text">3. Ejecutar<br><span>(Focus Mode)</span></div>
                            </a>
                            <div class="schema-arrow">→</div>
                            <a href="/v8/ledger" data-link class="schema-step">
                                <div class="s-icon">⚖️</div>
                                <div class="s-text">4. Cobrar<br><span>(Ledger Equity)</span></div>
                            </a>
                        </div>

                        <div class="ai-arbitrage-panel">
                            <div style="display:flex; align-items:center; gap: 15px;">
                                <div style="font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(224, 64, 251, 0.4));">🤖</div>
                                <div>
                                    <h3 style="color: var(--accent-purple); margin:0 0 5px 0; font-weight:900;">Arbitraje Cognitivo (IA)</h3>
                                    <p style="color: #aaa; margin:0; font-size:0.85rem;">Diferencial entre el valor minado por IAs y su coste API real.</p>
                                </div>
                            </div>
                            <div style="display:flex; gap: 2rem; flex-wrap:wrap;">
                                <div class="ai-stat-block">
                                    <span class="ai-stat-lbl">Valor Bruto Facturado</span>
                                    <span class="ai-stat-val">€${aiGrossValue.toFixed(2)}</span>
                                </div>
                                <div class="ai-stat-block">
                                    <span class="ai-stat-lbl" style="color:var(--accent-red);">Coste API Asumido</span>
                                    <span class="ai-stat-val" style="color:var(--accent-red);">- €${aiCost.toFixed(2)}</span>
                                </div>
                                <div class="ai-stat-block" style="padding-left: 1rem; border-left: 1px dashed rgba(255,255,255,0.2);">
                                    <span class="ai-stat-lbl" style="color:var(--accent-green);">Ahorro Neto (Profit)</span>
                                    <span class="ai-stat-val" style="color:var(--accent-green);">€${aiNetSavings.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="glass-panel" style="padding: 1.5rem 2rem; border-left: 4px solid var(--accent-blue); margin-bottom: 2.5rem;">
                            <div style="display:flex; gap: 10px; margin-bottom: 15px; flex-wrap:wrap;">${tagsHtml}</div>
                            <div class="presentation-text collapsed" id="pitchText">${pitchText.replace(/\n/g, '<br>')}</div>
                            <button id="btnTogglePitch" style="background:none; border:none; color:var(--accent-blue); font-weight:900; cursor:pointer; padding:10px 0 0 0; font-size:0.8rem; text-transform:uppercase;">Expandir Manifiesto ▾</button>
                        </div>

                        <section class="kpi-grid">
                            <div class="kpi-card" style="border-bottom: 3px solid var(--accent-green);">
                                <span class="kpi-val" style="color: var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</span>
                                <span class="kpi-lbl">Slices Minados</span>
                            </div>
                            <div class="kpi-card" style="border-bottom: 3px solid var(--accent-blue);">
                                <span class="kpi-val" style="color: var(--accent-blue);">${totalHours.toFixed(1)}h</span>
                                <span class="kpi-lbl">Trabajo Auditado</span>
                            </div>
                            <div class="kpi-card" style="border-bottom: 3px solid ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">
                                <span class="kpi-val" style="color: ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">${resilience}%</span>
                                <span class="kpi-lbl">Salud Estructural</span>
                            </div>
                            <div class="kpi-card" style="border-bottom: 3px solid #888;">
                                <span class="kpi-val" style="color: white;">${project.usuarios ? project.usuarios.length : 1}</span>
                                <span class="kpi-lbl">Nodos en Colla</span>
                            </div>
                        </section>
                    </div>

                    <div id="tab-market" class="tab-content ${this.currentTab === 'market' ? 'active' : ''}">
                        <div class="glass-panel">
                            <h2 style="color: white; margin-top: 0; font-size: 1.3rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-weight: 900; text-transform: uppercase;">🎯 Mercado Interno (Vacantes)</h2>
                            <p style="color:#888; font-size:0.85rem; margin-bottom:1.5rem; line-height:1.4;">Roles vitales diseñados en la arquitectura que aún no tienen un talento humano o IA asignado.</p>
                            <div>${vacantesHtml}</div>
                        </div>
                    </div>

                    <div id="tab-settings" class="tab-content ${this.currentTab === 'settings' ? 'active' : ''}">
                         <div class="glass-panel">
                            <h2 style="color: var(--text-muted);">Módulo de Configuración de Red</h2>
                            <p>Opciones de gobernanza y parámetros de la DAO. (Centralizado en la Consola Global V8).</p>
                            <a href="/v8/settings" data-link class="btn-primary" style="display:inline-block; margin-top:1rem; text-decoration:none;">Ir a Settings Global</a>
                         </div>
                    </div>

                </main>
            </div>

            <div id="aiModal" class="modal-ia">
                <div class="modal-ia-content">
                    <div style="padding:20px 30px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.2rem; color:var(--accent-purple); font-weight:900; text-transform:uppercase; letter-spacing:1px;">Procesando...</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem; transition:0.2s;">✖</button>
                    </div>
                    <div style="padding: 30px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.7; white-space: pre-wrap;" id="aiModalBody"></div>
                    <div style="padding:20px 30px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:flex-end; background:rgba(0,0,0,0.5);">
                        <button class="btn-primary" id="btnDownloadPDF" style="display:none;">⬇️ DESCARGAR INFORME (.TXT)</button>
                    </div>
                </div>
            </div>
        `;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }

    executeViewScript() {
        if (!this.activeProjectId) return;
        
        Sidebar.initListeners();
        PageHeader.execute();
        
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);

        // -- LÓGICA DE TABS V8 --
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        // -- LÓGICA ACORDEÓN PITCH --
        const pitchEl = document.getElementById('pitchText');
        const btnToggle = document.getElementById('btnTogglePitch');
        if (pitchEl && btnToggle) {
            btnToggle.addEventListener('click', () => {
                const isCollapsed = pitchEl.classList.contains('collapsed');
                pitchEl.classList.toggle('collapsed');
                btnToggle.innerText = isCollapsed ? 'Contraer Manifiesto ▴' : 'Expandir Manifiesto ▾';
            });
        }

        // -- INVITACIONES --
        document.querySelectorAll('.btn-invite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleName = e.target.getAttribute('data-rolename');
                const email = prompt(`Invitar mercenario o Agente IA para el rol [${roleName}]. Introduce email o Wallet:`);
                if (email) alert(`Invitación enviada a ${email}. Pendiente de integración P2P.`);
            });
        });

        // -- MÓDULO IA CONECTADO AL MAGIC BUTTON --
        const modal = document.getElementById('aiModal');
        const modalBody = document.getElementById('aiModalBody');
        const modalTitle = document.getElementById('aiModalTitle');
        const btnDownload = document.getElementById('btnDownloadPDF');

        document.getElementById('aiModalClose').onclick = () => modal.style.display = 'none';

        const runAI = async (type) => {
            const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = '';
            if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            if (provider !== 'custom' && !apiKey) return alert("⚠️ Configura tu API Key en Configuración Global antes de invocar al Orquestador.");

            modal.style.display = 'flex';
            modalBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation: pulse 2s infinite;">🧠</div><p style="color:var(--accent-purple); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Leyendo el Ledger Inmutable...</p></div>`;
            btnDownload.style.display = 'none';
            modalTitle.innerText = type === 'audit' ? 'Auditoría VNA & Equity' : 'Pacto de Socios (Slicing Pie)';

            // EXTRACCIÓN PROFUNDA
            const harvest = store.calculateHarvest(project.id) || [];
            const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
            
            let capTableDetails = ["El Ledger está vacío. Aún no se ha minado Equity."];
            if (harvest.length > 0 && totalSlices > 0) {
                capTableDetails = harvest.map(h => {
                    const u = state.globalUsers?.find(gu => gu.id === (h.user || h.userId));
                    const userName = u ? u.name : (h.user || h.userId || 'Desconocido');
                    return `- Socio: ${userName} | Participación: ${((h.slices / totalSlices) * 100).toFixed(2)}% | Capital: ${Number(h.slices).toFixed(2)} Slices`;
                });
            }

            const realLedger = (project.ledger || []).map(l => {
                const u = state.globalUsers?.find(gu => gu.id === l.userId);
                const userName = u ? u.name : (l.userId || 'Sistema');
                const isCap = l.isCapital || l.roleId === 'capital' || String(l.entregable || l.description).includes('[Capital');
                
                if (isCap) {
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} inyectó CAPITAL. Slices: +${l.valorCongelado}.`;
                } else {
                    const role = project.roles?.find(r => r.id === l.roleId);
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} ejecutó Trabajo (${role ? role.name : 'Operativo'}) ${l.horas}h. Slices: +${l.valorCongelado}.`;
                }
            });

            const dataPayload = {
                nombre_ecosistema: project.nombre,
                arquetipo_gobernanza: project.archetype,
                vision_fundacional: project.presentation || project.prompt || "Sin definir",
                cap_table_actual: capTableDetails,
                registro_aportaciones_reales: realLedger.length > 0 ? realLedger : ["Sin transacciones."]
            };

            let systemPrompt = state.config?.globalPrompt || "Eres un Master Architect de DAOs.";
            
            if (type === 'audit') {
                systemPrompt += `\nMisión: Eres un Auditor VNA y experto en economía Slicing Pie. Identifica nodos inversores vs operativos. Evalúa si hay un buen equilibrio o cuellos de botella. Formato texto plano legible.`;
            } else {
                systemPrompt += `\nMisión: Eres un Abogado Notarial Web3 experto en Slicing Pie. Redacta un "Pacto de Socios" formal basado estrictamente en los datos recibidos (Cap Table y Aportaciones).`;
            }

            try {
                let text = "";
                if (provider === 'deepseek') {
                    const res = await fetch(`https://api.deepseek.com/chat/completions`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(dataPayload) }] })
                    });
                    if (!res.ok) throw new Error("Error en API DeepSeek");
                    text = (await res.json()).choices[0].message.content;
                } else if (provider === 'openai') {
                    const res = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(dataPayload) }] })
                    });
                    if (!res.ok) throw new Error("Error en API OpenAI");
                    text = (await res.json()).choices[0].message.content;
                } else if (provider === 'gemini') {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nJSON: ${JSON.stringify(dataPayload)}` }] }] })
                    });
                    if (!res.ok) throw new Error("Error en API Gemini");
                    text = (await res.json()).candidates[0].content.parts[0].text;
                } else if (provider === 'custom') {
                    const customUrl = localStorage.getItem('tt_ai_custom_url') || 'http://localhost:1234/v1/chat/completions';
                    const res = await fetch(customUrl, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ prompt: systemPrompt, data: dataPayload })
                    });
                    if (!res.ok) throw new Error("Error en Endpoint Custom");
                    const data = await res.json();
                    text = typeof data === 'string' ? data : JSON.stringify(data);
                }

                modalBody.innerHTML = `<div style="font-family:var(--font-main);">${text.replace(/\n/g, '<br>')}</div>`;
                
                btnDownload.style.display = 'block';
                btnDownload.onclick = () => {
                    const b = new Blob([text], {type:"text/plain"});
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a'); a.href=u; a.download=`${type}_${project.nombre.replace(/ /g,'_')}.txt`; a.click();
                };
            } catch (e) { 
                modalBody.innerHTML = `<div style="text-align:center; padding:2rem;"><div style="font-size:3rem; margin-bottom:1rem;">⚠️</div><h3 style="color:var(--accent-red);">Fallo Neural</h3><p style="color:#888;">${e.message}</p></div>`; 
            }
        };

        // --- CONEXIÓN DEL EVENTO MAGIC BUTTON ---
        window.addEventListener('ph-magic-action', (e) => {
            if (e.detail.actionId === 'audit') runAI('audit');
            if (e.detail.actionId === 'legal') runAI('legal');
        });
    }
}
