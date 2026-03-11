// v5/js/views/DashboardView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class DashboardView {
    constructor() {
        document.title = "Dashboard Central | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const project = state.projects[state.projects.length - 1];
        const activeUserId = state.session.activeUserId;
        const globalRole = state.session.role;

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/dashboard')}
                    <main class="workspace" style="justify-content:center; align-items:center; display:flex; height:100vh; background: #050505;">
                        <div style="text-align:center; padding: 4rem; border: 1px dashed #333; border-radius: 12px;">
                             <div style="font-size: 4rem; margin-bottom: 1rem;">🛰️</div>
                             <h2 style="color:white; margin-top:0;">Frecuencia no detectada</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2rem;">Aún no has instanciado ninguna red en este Kernel.</p>
                             <a href="/v5/create" data-link class="btn btn-primary" style="background: var(--accent-blue); color: black; padding: 12px 25px; border-radius: 8px; font-weight: bold; text-decoration:none;">+ Instanciar Proyecto</a>
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
                        <div style="text-align:center; background: rgba(255, 82, 82, 0.05); border: 1px dashed var(--accent-red); padding: 4rem; border-radius: 12px; max-width: 600px;">
                            <div style="font-size: 5rem; margin-bottom: 1rem;">🔒</div>
                            <h1 style="color: var(--accent-red);">ACCESO DENEGADO</h1>
                            <p style="color: #ccc;">Este Castell es privado. No eres un nodo reconocido en su Colla.</p>
                        </div>
                    </main>
                </div>
            `;
        }

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
                    <button class="btn-invite" data-rolename="${r.name}">+ Invitar</button>
                </div>
            `).join('');

        const pitchText = project.presentation || project.prompt || 'El propósito fundacional de esta red está en fase de definición...';
        const tagsHtml = (project.tags && project.tags.length > 0) 
            ? project.tags.map(t => `<span class="badge-tag">#${t}</span>`).join('') 
            : `<span class="badge-tag">#Agnostico</span>`;

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #050505; font-family: var(--font-main); }
                .workspace { flex: 1; padding: 3rem 5rem; overflow-y: auto; display: flex; flex-direction: column; }
                
                .project-hero { margin-bottom: 3.5rem; position: relative; animation: fadeIn 0.8s ease-out; }
                .project-name { font-size: 4rem; color: white; margin: 0; letter-spacing: -2px; line-height: 1; font-weight: 800; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .project-meta-top { display: flex; gap: 12px; margin-bottom: 1rem; align-items: center; }
                .badge-tag { font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent-purple); border: 1px solid rgba(224, 64, 251, 0.3); padding: 3px 10px; border-radius: 4px; text-transform: uppercase; background: rgba(224, 64, 251, 0.05); }
                
                .presentation-box { margin-top: 2rem; max-width: 800px; background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 12px; border: 1px solid var(--glass-border); position: relative; border-left: 4px solid var(--accent-purple); }
                .presentation-text { color: #aaa; font-size: 1.1rem; line-height: 1.7; overflow: hidden; transition: max-height 0.4s ease; }
                .presentation-text.collapsed { max-height: 100px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
                .btn-read-more { background: none; border: none; color: var(--accent-purple); font-weight: bold; cursor: pointer; padding: 10px 0 0 0; font-size: 0.85rem; text-transform: uppercase; }

                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 4rem; }
                .kpi-card { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 12px; text-align: center; transition: 0.3s; }
                .kpi-card:hover { background: rgba(255,255,255,0.05); border-color: #444; }
                .kpi-val { font-size: 2.2rem; font-weight: bold; color: white; display: block; margin-bottom: 5px; font-family: var(--font-mono); }
                .kpi-lbl { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }

                .content-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; }
                
                .panel-box { background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: 16px; padding: 2.5rem; }
                .panel-title { color: white; margin-top: 0; font-size: 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 10px; }
                
                .vacante-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid #222; padding: 1rem 1.5rem; border-radius: 10px; margin-bottom: 12px; }
                .vacante-name { color: white; font-weight: bold; }
                .vacante-meta { font-size: 0.75rem; color: #555; font-family: var(--font-mono); margin-top: 4px; }
                .btn-invite { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 5px 15px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold; }
                .btn-invite:hover { background: var(--accent-blue); color: black; }

                .btn-ai-action { width: 100%; padding: 1.5rem; border-radius: 10px; border: 1px solid #333; background: rgba(0,0,0,0.5); color: white; text-align: left; cursor: pointer; transition: 0.2s; margin-bottom: 1rem; }
                .btn-ai-action:hover { border-color: var(--accent-purple); transform: translateX(5px); background: rgba(224, 64, 251, 0.05); }
                .btn-ai-action strong { color: var(--accent-purple); display: block; font-size: 1.1rem; margin-bottom: 5px; }
                .btn-ai-action span { color: #666; font-size: 0.8rem; }

                .status-ok { padding: 1.5rem; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); border-radius: 10px; color: var(--accent-green); text-align: center; font-weight: bold; }

                .modal-ia { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 2000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px);}
                .modal-ia-content { background: #0a0a0a; width: 90%; max-width: 800px; max-height: 85vh; border-radius: 12px; border: 1px solid #333; display: flex; flex-direction: column; overflow:hidden;}
                .modal-ia-body { padding: 25px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.6; white-space: pre-wrap; font-family: inherit;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1100px) { .content-row { grid-template-columns: 1fr; } .kpi-grid { grid-template-columns: 1fr 1fr; } }
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

                        <div style="display: flex; gap: 15px; margin-top: 2.5rem;">
                            <a href="/v5/project" data-link class="btn btn-primary" style="background:white; color:black; padding: 15px 30px; font-weight:bold; text-decoration:none; border-radius:8px;">ACCEDER AL KANBAN</a>
                            <a href="/v5/map" data-link class="btn btn-outline" style="padding: 15px 30px; text-decoration:none; border-radius:8px; color:white; border:1px solid #555;">MAPA DE VALOR VNA</a>
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
                            <span class="kpi-lbl">Resiliencia VNA</span>
                        </div>
                        <div class="kpi-card">
                            <span class="kpi-val">${project.usuarios ? project.usuarios.length : 1}</span>
                            <span class="kpi-lbl">Nodos Activos</span>
                        </div>
                    </section>

                    <div class="content-row">
                        <div class="panel-box">
                            <h2 class="panel-title">🎯 Sillas Disponibles (Mercado Interno)</h2>
                            <p style="color:#555; font-size:0.9rem; margin-bottom:2rem;">Roles diseñados en la arquitectura que aún no han sido reclamados por un mercenario.</p>
                            ${vacantesHtml}
                        </div>

                        <div class="panel-box" style="border-color: rgba(224, 64, 251, 0.2);">
                            <h2 class="panel-title" style="color:var(--accent-purple);">🔮 Orquestador de Valor</h2>
                            <p style="color:#555; font-size:0.9rem; margin-bottom:2rem;">Herramientas IA para la gestión legal y estratégica de la red.</p>
                            
                            <button class="btn-ai-action" id="btnAIAuditor">
                                <strong>🧠 Auditoría de Salud VNA</strong>
                                <span>Analiza flujos, cuellos de botella y balance de poder entre nodos.</span>
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
                    <div style="padding:15px 25px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                        <h2 id="aiModalTitle" style="margin:0; font-size:1.1rem; color:var(--accent-purple);">Procesando...</h2>
                        <button id="aiModalClose" style="background:transparent; border:none; color:white; cursor:pointer; font-size:1.2rem;">✖</button>
                    </div>
                    <div class="modal-ia-body" id="aiModalBody"></div>
                    <div style="padding:15px 25px; border-top:1px solid #333; display:flex; justify-content:flex-end; background:#000;">
                        <button class="btn btn-primary" id="btnDownloadPDF" style="display:none; background:var(--accent-blue); border:none; color:black; font-weight:bold; padding:10px 20px;">DESCARGAR INFORME (.TXT)</button>
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
                const email = prompt(`Invitar mercenario para el rol [${roleName}]. Introduce su email:`);
                if (email && email.includes('@')) {
                    alert(`Invitación enviada a ${email}. Se registrará en el log del proyecto.`);
                }
            });
        });

        // -- MÓDULO IA (CON PAYLOAD VNA Y LEDGER REAL MEJORADO) --
        const modal = document.getElementById('aiModal');
        const modalBody = document.getElementById('aiModalBody');
        const modalTitle = document.getElementById('aiModalTitle');
        const btnDownload = document.getElementById('btnDownloadPDF');

        document.getElementById('aiModalClose').onclick = () => modal.style.display = 'none';

        const runAI = async (type) => {
            const provider = localStorage.getItem('tt_ai_provider');
            let apiKey = '';
            if (provider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (provider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (provider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            if (!apiKey) return alert("Configura tu API Key en Settings antes de invocar al orquestador.");

            modal.style.display = 'flex';
            modalBody.innerHTML = `<div style="text-align:center; padding:3rem;"><div style="font-size:3rem; animation: pulseGlow 2s infinite;">🧠</div><p style="color:var(--accent-purple); margin-top:1rem;">Leyendo el Ledger Inmutable para generar el informe...</p></div>`;
            btnDownload.style.display = 'none';
            modalTitle.innerText = type === 'audit' ? 'Auditoría de Salud VNA' : 'Pacto de Socios (Slicing Pie)';

            // ---------------------------------------------------------
            // EXTRACCIÓN PROFUNDA DE DATOS PARA LA IA (V8.2)
            // ---------------------------------------------------------
            const harvest = store.calculateHarvest(project.id) || [];
            const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
            
            // 1. CAP TABLE CALCULADA (Para que no de 0%)
            let capTableDetails = ["El Ledger está vacío. Aún no se ha minado Equity (Slices)."];
            if (harvest.length > 0 && totalSlices > 0) {
                capTableDetails = harvest.map(h => {
                    const u = state.globalUsers?.find(gu => gu.id === (h.user || h.userId));
                    const userName = u ? u.name : (h.user || h.userId || 'Desconocido');
                    const percent = ((h.slices / totalSlices) * 100).toFixed(2);
                    return `- Socio: ${userName} | Participación: ${percent}% | Capital: ${Number(h.slices).toFixed(2)} Slices`;
                });
            }

            // 2. LEDGER INMUTABLE REAL (Las aportaciones exactas de cada socio)
            const realLedger = (project.ledger || []).map(l => {
                const u = state.globalUsers?.find(gu => gu.id === l.userId);
                const userName = u ? u.name : (l.userId || 'Sistema');
                
                if (l.isCapital) {
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} aportó CAPITAL TANGIBLE (${l.descripcion || l.entregable}). Recompensa: +${l.valorCongelado} Slices.`;
                } else {
                    const role = project.roles?.find(r => r.id === l.roleId);
                    const roleName = role ? `${role.levelId} ${role.name}` : 'Rol Eliminado';
                    return `[${new Date(l.timestamp).toLocaleDateString()}] ${userName} ejecutó TRABAJO como ${roleName}. Entregable: "${l.entregable}" (${l.horas}h). Recompensa: +${l.valorCongelado} Slices.`;
                }
            });

            // 3. FLUJOS VNA TEÓRICOS
            const vnaFlows = (project.transactions || []).map(tx => {
                const roleFrom = project.roles.find(r => r.id === tx.from);
                const roleTo = project.roles.find(r => r.id === tx.to);
                const nameFrom = roleFrom ? `${roleFrom.name} (${roleFrom.levelId})` : 'Nodo Externo';
                const nameTo = roleTo ? `${roleTo.name} (${roleTo.levelId})` : 'Nodo Externo';
                return `[${(tx.tipo || 'tangible').toUpperCase()}] ${nameFrom} ---> ${tx.entregable} (${tx.horas}h) ---> ${nameTo}`;
            });

            // CONSTRUCCIÓN DEL PAYLOAD FINAL
            const dataPayload = {
                nombre_ecosistema: project.nombre,
                arquetipo_gobernanza: project.archetype,
                vision_fundacional: project.presentation || project.prompt || "Sin definir",
                nodos_activos_roles: project.roles.map(r => `- ${r.levelId}: ${r.name} (Guardián: ${r.guardian || 'N/A'} | Multiplicador: ${r.multiplier}x)`),
                flujos_vna_diseñados: vnaFlows.length > 0 ? vnaFlows : ["Sin flujos."],
                cap_table_actual: capTableDetails,
                registro_aportaciones_reales: realLedger.length > 0 ? realLedger : ["No hay transacciones registradas en el ledger todavía."]
            };

            let systemPrompt = state.config?.globalPrompt || "Eres un Master Architect de DAOs.";
            
            if (type === 'audit') {
                systemPrompt += `\nMisión: Eres un Auditor VNA (Value Network Analysis). 
                Revisa el 'registro_aportaciones_reales' y la 'cap_table_actual'. 
                Detecta si alguien está aportando más de lo sano para la red o si hay dependencias excesivas de un solo socio. 
                Si el Ledger está vacío, dilo claramente. Formato texto plano legible sin markdown excesivo.`;
            } else {
                systemPrompt += `\nMisión: Eres un Abogado Notarial Web3 experto en Slicing Pie y contratos dinámicos.
                Redacta un "Pacto de Socios" formal basado estrictamente en los datos recibidos.
                1. Menciona la Visión Fundacional.
                2. Usa la "cap_table_actual" para redactar la cláusula de PARTICIPACIÓN ACTUAL (Asegúrate de poner los % correctos y nombrar a los socios).
                3. Usa el "registro_aportaciones_reales" para crear un Anexo final desglosando exactamente de dónde salen los Slices de cada socio (qué horas trabajaron o qué capital metieron).
                El documento debe parecer redactado por una notaría. Formato texto formal legible.`;
            }
            // ---------------------------------------------------------

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
                    if (!res.ok) throw new Error("Error en API de DeepSeek");
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
                    if (!res.ok) throw new Error("Error en API de OpenAI");
                    const data = await res.json();
                    text = data.choices[0].message.content;
                } else if (provider === 'gemini') {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nJSON: ${JSON.stringify(dataPayload)}` }] }] })
                    });
                    if (!res.ok) throw new Error("Error en API de Gemini");
                    const data = await res.json();
                    text = data.candidates[0].content.parts[0].text;
                }

                modalBody.innerHTML = `<div style="white-space:pre-wrap;">${text.replace(/\n/g, '<br>')}</div>`;
                btnDownload.style.display = 'block';
                btnDownload.onclick = () => {
                    const b = new Blob([text], {type:"text/plain"});
                    const u = URL.createObjectURL(b);
                    const a = document.createElement('a'); a.href=u; a.download=`${type}_${project.nombre.replace(/ /g,'_')}.txt`; a.click();
                };
            } catch (e) { 
                modalBody.innerHTML = `<p style="color:red;">Error de conexión: ${e.message}</p>`; 
            }
        };

        document.getElementById('btnAIAuditor')?.addEventListener('click', () => runAI('audit'));
        document.getElementById('btnAILegal')?.addEventListener('click', () => runAI('legal'));
    }
}
