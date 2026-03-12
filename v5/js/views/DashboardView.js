// v5/js/views/DashboardView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class DashboardView {
    constructor() {
        document.title = "Dashboard de Red | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        // Intentar recuperar el proyecto activo o el último creado
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) {
            project = state.projects[state.projects.length - 1];
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex; height:100vh; background: var(--bg-dark);">
                        <div style="text-align:center; padding: 4rem; border: 1px dashed #333; border-radius: 16px; background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);">
                             <div style="font-size: 4rem; margin-bottom: 1rem;">🛰️</div>
                             <h2 style="color:white; margin-top:0;">Frecuencia no detectada</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2rem;">Aún no has instanciado ninguna red en este Kernel.</p>
                             <a href="/v5/create" data-link class="btn btn-primary" style="background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; padding: 12px 25px; border-radius: 12px; font-weight: bold; text-decoration:none; box-shadow: 0 5px 15px rgba(0,176,255,0.2);">➕ Instanciar Proyecto</a>
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
                        <div style="text-align:center; background: rgba(255, 82, 82, 0.05); border: 1px dashed var(--accent-red); padding: 4rem; border-radius: 16px; max-width: 600px; backdrop-filter: blur(10px);">
                            <div style="font-size: 5rem; margin-bottom: 1rem;">🔒</div>
                            <h1 style="color: var(--accent-red); margin-top:0;">ACCESO DENEGADO</h1>
                            <p style="color: #ccc;">Este Castell es privado. No eres un nodo reconocido en su Colla.</p>
                        </div>
                    </main>
                </div>
            `;
        }

        // --- CÁLCULOS V10 ---
        const harvest = store.calculateHarvest(project.id) || [];
        const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
        const totalHours = (project.ledger || []).reduce((sum, l) => sum + (l.horas || 0), 0);
        const resilience = store.calculateResilience(project.id);
        const isPO = project.ownerId === activeUserId || globalRole === 'ecosystem-owner';
        
        const rolesActivos = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const sillasVacias = rolesActivos.filter(r => !asignaciones.find(a => a.roleId === r.id));

        let vacantesHtml = sillasVacias.length === 0 
            ? `<div class="status-ok">✅ Colla completa. Sin vacantes.</div>`
            : sillasVacias.map(r => `
                <div class="vacante-card">
                    <div>
                        <div class="vacante-name">${this.getIcon(r.levelId)} ${r.name}</div>
                        <div class="vacante-meta">${r.levelId} | 🛡️ ${r.guardian || 'Any'} | FMV: ${r.fmv}€/h</div>
                    </div>
                    <button class="btn-invite" data-rolename="${r.name}">➕ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición...';
        const tagsHtml = (project.tags && project.tags.length > 0) 
            ? project.tags.map(t => `<span class="badge-tag">#${t}</span>`).join('') 
            : `<span class="badge-tag">#VNA</span>`;

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 3rem 5rem; overflow-y: auto; display: flex; flex-direction: column; scroll-behavior: smooth;}
                
                /* HERO SECTION */
                .project-hero { margin-bottom: 3.5rem; position: relative; animation: fadeIn 0.6s ease-out; }
                .project-name { font-size: 3.5rem; color: white; margin: 0; letter-spacing: -1.5px; line-height: 1.1; font-weight: 900; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .project-meta-top { display: flex; gap: 10px; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap;}
                .badge-tag { font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-purple); border: 1px solid rgba(224, 64, 251, 0.3); padding: 4px 12px; border-radius: 6px; text-transform: uppercase; background: rgba(224, 64, 251, 0.05); font-weight: bold;}
                
                .presentation-box { margin-top: 2rem; max-width: 800px; background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 16px; border: 1px solid var(--glass-border); position: relative; border-left: 4px solid var(--accent-purple); backdrop-filter: blur(10px);}
                .presentation-text { color: #ccc; font-size: 1.05rem; line-height: 1.7; overflow: hidden; transition: max-height 0.4s ease; font-family: var(--font-main);}
                .presentation-text.collapsed { max-height: 100px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
                .btn-read-more { background: none; border: none; color: var(--accent-purple); font-weight: bold; cursor: pointer; padding: 10px 0 0 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;}

                /* BOTONERA PRINCIPAL */
                .hero-actions { display: flex; gap: 15px; margin-top: 2.5rem; flex-wrap: wrap;}
                .btn-lux-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; padding: 14px 28px; font-weight: 800; text-decoration: none; border-radius: 12px; font-size: 1rem; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2); transition: all 0.3s; display: inline-block; border: none;}
                .btn-lux-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}
                .btn-lux-outline { padding: 14px 28px; text-decoration: none; border-radius: 12px; color: white; border: 1px solid #555; background: rgba(0,0,0,0.5); font-weight: bold; transition: all 0.3s; display: inline-block;}
                .btn-lux-outline:hover { border-color: white; background: rgba(255,255,255,0.05); transform: translateY(-2px);}

                /* KPIS */
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 4rem; }
                .kpi-card { background: linear-gradient(145deg, rgba(0,0,0,0.6), rgba(15,15,20,0.8)); border: 1px solid var(--glass-border); padding: 2rem 1.5rem; border-radius: 16px; text-align: center; transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.2);}
                .kpi-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.1);}
                .kpi-val { font-size: 2.5rem; font-weight: 900; display: block; margin-bottom: 5px; font-family: var(--font-mono); line-height: 1;}
                .kpi-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

                /* PANELES INFERIORES */
                .content-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; }
                
                .panel-box { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2.5rem; backdrop-filter: blur(10px);}
                .panel-title { color: white; margin-top: 0; font-size: 1.4rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; font-weight: 800;}
                
                .vacante-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 1.2rem 1.5rem; border-radius: 12px; margin-bottom: 12px; transition: transform 0.2s;}
                .vacante-card:hover { transform: translateX(5px); border-color: #555; }
                .vacante-name { color: white; font-weight: bold; font-size: 1.05rem;}
                .vacante-meta { font-size: 0.8rem; color: #888; font-family: var(--font-mono); margin-top: 6px; }
                .btn-invite { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: bold; transition: all 0.2s;}
                .btn-invite:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 10px rgba(0,176,255,0.3);}

                .btn-ai-action { width: 100%; padding: 1.5rem; border-radius: 12px; border: 1px solid #333; background: rgba(0,0,0,0.5); color: white; text-align: left; cursor: pointer; transition: all 0.3s; margin-bottom: 15px; }
                .btn-ai-action:hover { border-color: var(--accent-purple); transform: translateY(-3px); background: rgba(224, 64, 251, 0.05); box-shadow: 0 5px 15px rgba(224,64,251,0.15);}
                .btn-ai-action strong { color: var(--accent-purple); display: block; font-size: 1.15rem; margin-bottom: 8px; font-weight: 800;}
                .btn-ai-action span { color: #888; font-size: 0.85rem; line-height: 1.4; display: block;}

                .status-ok { padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 12px; color: var(--accent-green); text-align: center; font-weight: bold; }

                /* MODAL IA */
                .modal-ia { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 4000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px);}
                .modal-ia-content { background: var(--bg-dark); width: 90%; max-width: 800px; max-height: 85vh; border-radius: 20px; border: 1px solid var(--glass-border); display: flex; flex-direction: column; overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);}
                .modal-ia-body { padding: 30px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; font-family: inherit;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                /* RESPONSIVE MOBILE */
                @media (max-width: 1100px) { 
                    .content-row { grid-template-columns: 1fr; } 
                    .kpi-grid { grid-template-columns: 1fr 1fr; } 
                }
                @media (max-width: 768px) {
                    .workspace { padding: 80px 1.5rem 3rem 1.5rem; }
                    .project-name { font-size: 2.5rem; }
                    .hero-actions { flex-direction: column; }
                    .hero-actions a { width: 100%; text-align: center; box-sizing: border-box;}
                    .panel-box { padding: 1.5rem; }
                    .vacante-card { flex-direction: column; align-items: stretch; gap: 15px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/dashboard')}

                <main class="workspace">
                    <header class="project-hero">
                        <div class="project-meta-top">
                            <span class="badge-tag" style="color:var(--accent-blue); border-color:var(--accent-blue);">${project.archetype.toUpperCase()}</span>
                            ${tagsHtml}
                        </div>
                        <h1 class="project-name">${project.nombre}</h1>
                        
                        <div class="presentation-box">
                            <div class="presentation-text collapsed" id="pitchText">
                                ${pitchText.replace(/\n/g, '<br>')}
                            </div>
                            <button class="btn-read-more" id="btnTogglePitch">Leer Manifiesto +</button>
                        </div>

                        <div class="hero-actions">
                            <a href="/v5/project" data-link class="btn-lux-primary">ACCEDER AL KANBAN</a>
                            <a href="/v5/map" data-link class="btn-lux-outline">MAPA DE VALOR (VNA)</a>
                        </div>
                    </header>

                    <section class="kpi-grid">
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</span>
                            <span class="kpi-lbl">Slices Minados</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: var(--accent-blue);">${totalHours.toFixed(1)}h</span>
                            <span class="kpi-lbl">Trabajo Auditado</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: ${resilience > 50 ? 'var(--accent-purple)' : 'var(--accent-red)'};">${resilience}%</span>
                            <span class="kpi-lbl">Salud de Red</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val" style="color: white;">${project.usuarios ? project.usuarios.length : 1}</span>
                            <span class="kpi-lbl">Nodos Activos</span>
                        </div>
                    </section>

                    <div class="content-row">
                        <div class="panel-box">
                            <h2 class="panel-title">🎯 Sillas Disponibles (Mercado Interno)</h2>
                            <p style="color:#888; font-size:0.9rem; margin-bottom:2rem;">Roles diseñados en la arquitectura que aún no han sido reclamados por un mercenario.</p>
                            ${vacantesHtml}
                        </div>

                        <div class="panel-box" style="border-color: rgba(224, 64, 251, 0.2);">
                            <h2 class="panel-title" style="color:var(--accent-purple);">🔮 Orquestador Legal</h2>
                            <p style="color:#888; font-size:0.9rem; margin-bottom:2rem;">Herramientas de Inteligencia Artificial para auditar la red y emitir contratos inmutables.</p>
                            
                            <button class="btn-ai-action" id="btnAIAuditor">
                                <strong>🧠 Auditoría de Salud VNA & Equity</strong>
                                <span>Analiza flujos, cuellos de botella y balance PoW/Capital.</span>
                            </button>

                            <button class="btn-ai-action" id="btnAILegal">
                                <strong>⚖️ Generar Pacto de Socios</strong>
                                <span>Redacta el contrato legal dinámico desglosando el Ledger.</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <div id="aiModal" class="modal-ia">
                <div class="modal-ia-content">
                    <div style="padding:20px 30px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.2rem; color:var(--accent-purple); font-weight:800;">Procesando...</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem; transition:0.2s;">✖</button>
                    </div>
                    <div class="modal-ia-body" id="aiModalBody"></div>
                    <div style="padding:20px 30px; border-top:1px solid #333; display:flex; justify-content:flex-end; background:rgba(0,0,0,0.5);">
                        <button class="btn-lux-primary" id="btnDownloadPDF" style="display:none; padding:10px 20px;">⬇️ DESCARGAR INFORME (.TXT)</button>
                    </div>
                </div>
            </div>
        `;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }

    executeViewScript() {
        Sidebar.initListeners();
        if (!this.activeProjectId) return;
        
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);

        // -- LÓGICA ACORDEÓN PITCH --
        const pitchEl = document.getElementById('pitchText');
        const btnToggle = document.getElementById('btnTogglePitch');
        if (pitchEl && btnToggle) {
            btnToggle.addEventListener('click', () => {
                const isCollapsed = pitchEl.classList.contains('collapsed');
                pitchEl.classList.toggle('collapsed');
                btnToggle.innerText = isCollapsed ? 'Contraer Manifiesto -' : 'Leer Manifiesto +';
            });
        }

        // -- INVITACIONES --
        document.querySelectorAll('.btn-invite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleName = e.target.getAttribute('data-rolename');
                const email = prompt(`Invitar mercenario para el rol [${roleName}]. Introduce su email o Wallet:`);
                if (email) {
                    alert(`Invitación enviada a ${email}. Pendiente de desarrollo P2P.`);
                }
            });
        });

        // -- MÓDULO IA (REPARACIÓN DE LECTURA DE CAPITAL Y VNA) --
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

            if (provider !== 'custom' && !apiKey) return alert("⚠️ Configura tu API Key en Settings antes de invocar al Orquestador.");

            modal.style.display = 'flex';
            modalBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation: pulse 2s infinite;">🧠</div><p style="color:var(--accent-purple); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Leyendo el Ledger Inmutable...</p></div>`;
            btnDownload.style.display = 'none';
            modalTitle.innerText = type === 'audit' ? 'Auditoría de Salud VNA & Equity' : 'Pacto de Socios (Slicing Pie)';

            // ---------------------------------------------------------
            // EXTRACCIÓN PROFUNDA DE DATOS PARA LA IA (V10 Mapeado)
            // ---------------------------------------------------------
            const harvest = store.calculateHarvest(project.id) || [];
            const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
            
            // 1. CAP TABLE CALCULADA
            let capTableDetails = ["El Ledger está vacío. Aún no se ha minado Equity (Slices)."];
            if (harvest.length > 0 && totalSlices > 0) {
                capTableDetails = harvest.map(h => {
                    const u = state.globalUsers?.find(gu => gu.id === (h.user || h.userId));
                    const userName = u ? u.name : (h.user || h.userId || 'Desconocido');
                    const percent = ((h.slices / totalSlices) * 100).toFixed(2);
                    return `- Socio: ${userName} | Participación: ${percent}% | Capital: ${Number(h.slices).toFixed(2)} Slices`;
                });
            }

            // 2. LEDGER INMUTABLE REAL
            const realLedger = (project.ledger || []).map(l => {
                const u = state.globalUsers?.find(gu => gu.id === l.userId);
                const userName = u ? u.name : (l.userId || 'Sistema');
                
                const isCap = l.isCapital || l.roleId === 'capital' || String(l.entregable || l.description).includes('[Capital');
                
                if (isCap) {
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} inyectó CAPITAL FINANCIERO o IP ("${l.description || l.entregable}"). Slices generados: +${l.valorCongelado}.`;
                } else {
                    const role = project.roles?.find(r => r.id === l.roleId);
                    const roleName = role ? `${role.levelId} ${role.name}` : 'Aportación Operativa'; 
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} ejecutó TRABAJO (PoW) como ${roleName}. Entregable: "${l.description || l.entregable}" (${l.horas || 0}h). Slices generados: +${l.valorCongelado}.`;
                }
            });

            // 3. FLUJOS VNA TEÓRICOS (Mapea vna_flows y transactions)
            const allFlows = [...(project.vna_flows || []), ...(project.transactions || [])];
            const vnaFlows = allFlows.map(tx => {
                const roleFrom = project.roles.find(r => r.id === tx.from);
                const roleTo = project.roles.find(r => r.id === tx.to);
                const nameFrom = roleFrom ? `${roleFrom.name} (${roleFrom.levelId})` : 'Nodo Externo';
                const nameTo = roleTo ? `${roleTo.name} (${roleTo.levelId})` : 'Nodo Externo';
                return `[${(tx.tipo || 'tangible').toUpperCase()}] ${nameFrom} ---> ${tx.template || tx.entregable} (${tx.estimatedHours || tx.horas}h) ---> ${nameTo}`;
            });

            const dataPayload = {
                nombre_ecosistema: project.nombre,
                arquetipo_gobernanza: project.archetype,
                vision_fundacional: project.presentation || project.prompt || "Sin definir",
                nodos_activos_roles: project.roles.map(r => `- ${r.levelId}: ${r.name} (Guardián: ${r.guardian || 'N/A'} | Multiplicador de Riesgo: ${r.multiplier}x)`),
                flujos_vna_diseñados: vnaFlows.length > 0 ? vnaFlows : ["Sin flujos."],
                cap_table_actual: capTableDetails,
                registro_aportaciones_reales: realLedger.length > 0 ? realLedger : ["No hay transacciones registradas en el ledger todavía."]
            };

            let systemPrompt = state.config?.globalPrompt || "Eres un Master Architect de DAOs.";
            
            if (type === 'audit') {
                systemPrompt += `\nMisión: Eres un Auditor VNA y experto en economía Slicing Pie.
                REGLAS CRÍTICAS DEL MODELO DE EQUIDAD:
                1. El modelo premia el RIESGO. Las inyecciones de CAPITAL asumen máximo riesgo y generan grandes Slices. Es legítimo, nunca lo consideres desproporcionado.
                2. El TRABAJO asume riesgo de tiempo.
                INSTRUCCIONES: Revisa el 'registro_aportaciones_reales' y la 'cap_table_actual'. Identifica nodos inversores vs operativos. Evalúa si hay un buen equilibrio o cuellos de botella. Formato texto plano legible.`;
            } else {
                systemPrompt += `\nMisión: Eres un Abogado Notarial Web3 experto en Slicing Pie.
                Redacta un "Pacto de Socios" formal basado estrictamente en los datos recibidos.
                1. Menciona la Visión Fundacional.
                2. Usa la "cap_table_actual" para la cláusula de PARTICIPACIÓN ACTUAL.
                3. Usa el "registro_aportaciones_reales" para un Anexo desglosando de dónde salen los Slices de cada socio (Capital vs Trabajo). Formato notarial, texto claro.`;
            }

            try {
                let text = "";
                if (provider === 'deepseek') {
                    const res = await fetch(`https://api.deepseek.com/chat/completions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: "deepseek-chat",
                            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(dataPayload) }]
                        })
                    });
                    if (!res.ok) throw new Error("Error en API DeepSeek");
                    const data = await res.json();
                    text = data.choices[0].message.content;
                } else if (provider === 'openai') {
                    const res = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({
                            model: "gpt-4o-mini",
                            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(dataPayload) }]
                        })
                    });
                    if (!res.ok) throw new Error("Error en API OpenAI");
                    const data = await res.json();
                    text = data.choices[0].message.content;
                } else if (provider === 'gemini') {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nJSON: ${JSON.stringify(dataPayload)}` }] }] })
                    });
                    if (!res.ok) throw new Error("Error en API Gemini");
                    const data = await res.json();
                    text = data.candidates[0].content.parts[0].text;
                } else if (provider === 'custom') {
                    const customUrl = localStorage.getItem('tt_ai_custom_url') || 'http://localhost:1234/v1/chat/completions';
                    const res = await fetch(customUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ prompt: systemPrompt, data: dataPayload })
                    });
                    if (!res.ok) throw new Error("Error en Endpoint Custom");
                    const data = await res.json();
                    text = typeof data === 'string' ? data : JSON.stringify(data);
                }

                modalBody.innerHTML = `<div style="white-space:pre-wrap; font-family:var(--font-main);">${text.replace(/\n/g, '<br>')}</div>`;
                
                btnDownload.style.display = 'block';
                btnDownload.onclick = () => {
                    const b = new Blob([text], {type:"text/plain"});
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a'); a.href=u; a.download=`${type}_${project.nombre.replace(/ /g,'_')}.txt`; a.click();
                };
            } catch (e) { 
                modalBody.innerHTML = `
                    <div style="text-align:center; padding:2rem;">
                        <div style="font-size:3rem; margin-bottom:1rem;">⚠️</div>
                        <h3 style="color:var(--accent-red);">Fallo de Conexión Neural</h3>
                        <p style="color:#888;">${e.message}</p>
                    </div>`; 
            }
        };

        document.getElementById('btnAIAuditor')?.addEventListener('click', () => runAI('audit'));
        document.getElementById('btnAILegal')?.addEventListener('click', () => runAI('legal'));
    }
}
