// =============================================================================
// TEAMTOWERS SOS V10 — PROFILE VIEW
// Ruta: ia/dev/js/views/ProfileView.js
// Mi Espejo · Ikigai · SBTs · Córtex 3D
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js';
import { Orchestrator }   from '../core/Orchestrator.js';

export default class ProfileView {

    constructor() {
        document.title     = 'Mi Espejo (Ikigai) | TeamTowers V10';
        this.synapticCanvas = null;
    }

    async getHtml() {
        await store.init();
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const user         = state.globalUsers.find(u => u.id === activeUserId);

        // ── Calcular métricas globales ────────────────────────────
        let totalGlobalSlices = 0;
        let totalGlobalHours  = 0;
        let activeRoles       = [];

        state.projects.forEach(p => {
            const harvest  = store.calculateHarvest?.(p.id) || [];
            const myHarvest = harvest.find(h => h.userId === activeUserId || h.user === activeUserId);
            if (myHarvest?.totalSlices > 0) totalGlobalSlices += myHarvest.totalSlices;

            p.ledger?.forEach(tx => {
                if (tx.userId === activeUserId && tx.type === 'SOP_EXECUTION') {
                    totalGlobalHours += tx.horas || 0;
                }
            });

            p.asignaciones?.forEach(a => {
                if (a.userId === activeUserId) {
                    const rInfo = p.roles?.find(r => r.id === a.roleId);
                    if (rInfo) activeRoles.push({ project: p.nombre, role: rInfo.name, level: rInfo.levelId });
                }
            });
        });

        // ── KB — ikigai + tags ────────────────────────────────────
        await KB.init();
        const promptNode = await KB.getNode(`prompt_global_${activeUserId.replace('@', '')}`);
        const ikigai     = promptNode?.ikigai || { pasion: '', mision: '', vocacion: '', profesion: '' };
        const tags       = promptNode?.keywords?.filter(k => k !== 'human' && k !== activeUserId).join(', ') || '';

        // ── HTML parciales ─────────────────────────────────────────
        const rolesHtml = activeRoles.length > 0
            ? activeRoles.map(r =>
                `<div class="role-pill">
                    <span class="role-level">${r.level}</span>
                    <span style="color:white;">${r.role}</span>
                    <span style="color:#666;">en ${r.project}</span>
                 </div>`
              ).join('')
            : '<div style="color:#555; font-style:italic; padding:10px;">Sin asignaciones estructurales en la red.</div>';

        const sbtSkills  = user?.profile?.sbt_skills || [];
        const skillsHtml = sbtSkills.length > 0
            ? sbtSkills.map(s =>
                `<div class="skill-pill">
                    <span>🎒 ${s.skillName || s.flowId}</span>
                    <span style="color:var(--accent-green); font-family:var(--font-mono); font-weight:bold;">${s.exp?.toFixed(1)}h Exp</span>
                 </div>`
              ).join('')
            : '<div style="color:#555; font-style:italic; padding:10px;">Aún no has minado experiencia (SBTs) resolviendo Work Orders.</div>';

        const headerConfig = {
            title:   'Mi Espejo (Perfil Humano)',
            subtitle: 'Matriz Ikigai & SBTs',
            tagline: 'El valor que aportas a la red se refleja en tus Soulbound Tokens y tu Slicing Pie.'
        };

        return `
        <style>
            .app-layout { display:flex; height:100dvh; overflow:hidden; background:var(--bg-dark); font-family:var(--font-main); width:100%; }
            .workspace-profile { flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; box-sizing:border-box; background:radial-gradient(circle at center, #111116 0%, #050505 100%); }

            .profile-container { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2fr 1fr; gap:2rem; padding-bottom:5rem; }
            @media (max-width:1024px) { .profile-container { grid-template-columns:1fr; } }

            .stats-stripe { grid-column:1 / -1; display:flex; gap:20px; flex-wrap:wrap; }
            .stat-card { flex:1; min-width:220px; background:linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:20px; padding:1.5rem; display:flex; align-items:center; gap:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3); }
            .stat-icon { font-size:2.5rem; background:rgba(0,0,0,0.5); width:60px; height:60px; display:flex; justify-content:center; align-items:center; border-radius:14px; border:1px solid #333; }
            .stat-info h4 { margin:0 0 4px 0; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; }
            .stat-info .val { margin:0; color:white; font-size:1.8rem; font-weight:900; font-family:var(--font-mono); line-height:1; }
            .stat-info .val.green { color:var(--accent-green); }

            .profile-panel { background:linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:24px; padding:2rem; box-shadow:0 15px 35px rgba(0,0,0,0.4); }
            .panel-title { font-size:1rem; font-weight:900; color:white; margin:0 0 1.5rem 0; padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:8px; }

            .form-group { margin-bottom:1.25rem; }
            .form-group label { display:block; font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:bold; letter-spacing:1px; margin-bottom:6px; }
            .form-control { width:100%; background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:12px 14px; border-radius:10px; font-family:var(--font-main); font-size:0.95rem; outline:none; transition:0.3s; box-sizing:border-box; }
            .form-control:focus { border-color:var(--accent-indigo); }

            .ikigai-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; }
            .ikigai-cell { background:rgba(0,0,0,0.3); border-radius:12px; padding:1rem; border:1px solid #222; }
            .ikigai-cell label { font-size:0.7rem; color:var(--accent-indigo); text-transform:uppercase; font-weight:900; letter-spacing:1px; display:block; margin-bottom:6px; }
            .ikigai-cell textarea { width:100%; background:transparent; border:none; color:white; font-family:var(--font-main); font-size:0.88rem; resize:none; outline:none; line-height:1.5; min-height:60px; box-sizing:border-box; }

            .role-pill { display:flex; align-items:center; gap:8px; padding:10px 14px; background:rgba(0,0,0,0.3); border-radius:10px; margin-bottom:8px; border:1px solid #222; font-size:0.88rem; }
            .role-level { font-family:var(--font-mono); font-size:0.7rem; color:var(--accent-indigo); border:1px solid rgba(99,102,241,0.3); padding:2px 6px; border-radius:4px; background:rgba(99,102,241,0.1); }
            .skill-pill { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(0,0,0,0.3); border-radius:10px; margin-bottom:8px; border:1px solid #222; font-size:0.88rem; color:#ccc; }

            .cortex-mount { width:100%; height:400px; border-radius:16px; overflow:hidden; border:1px solid var(--glass-border); }

            /* Modal Dharma */
            .modal-dharma { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.88); backdrop-filter:blur(15px); z-index:5000; display:none; justify-content:center; align-items:center; }
            .modal-dharma-content { background:var(--bg-dark); border:1px solid rgba(255,171,64,0.3); border-radius:24px; width:90%; max-width:700px; max-height:88vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 30px 60px rgba(0,0,0,0.8); border-top:4px solid var(--accent-orange); }
            .dharma-header { padding:1.5rem 2rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); }
            .dharma-body   { padding:2rem; overflow-y:auto; flex:1; }

            @media (max-width:768px) { .workspace-profile { padding:80px 1rem 120px 1rem; } .ikigai-grid { grid-template-columns:1fr; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/profile')}
            <main class="workspace-profile">
                ${PageHeader.getHtml(headerConfig)}

                <div class="profile-container">

                    <!-- Stats stripe -->
                    <div class="stats-stripe">
                        <div class="stat-card">
                            <div class="stat-icon">🍕</div>
                            <div class="stat-info">
                                <h4>Slices Totales</h4>
                                <p class="val green">${Math.round(totalGlobalSlices).toLocaleString()}</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-info">
                                <h4>Horas Minadas</h4>
                                <p class="val">${totalGlobalHours.toFixed(1)}h</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🎒</div>
                            <div class="stat-info">
                                <h4>Skills (SBTs)</h4>
                                <p class="val">${sbtSkills.length}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Columna principal -->
                    <div>
                        <!-- Identidad -->
                        <div class="profile-panel" style="margin-bottom:2rem;">
                            <p class="panel-title">👤 Identidad & Taxonomía</p>
                            <div class="form-group">
                                <label>Nombre en la Red</label>
                                <input type="text" id="profName" class="form-control" value="${user?.name || ''}" placeholder="Tu alias en el Swarm">
                            </div>
                            <div class="form-group">
                                <label>Tags / Keywords</label>
                                <input type="text" id="profTags" class="form-control" value="${tags}" placeholder="#frontend, #blockchain, #design">
                            </div>
                            <button id="btnSaveProfile" class="btn-primary" style="width:100%;">💾 Sellar Identidad en la Matriz</button>
                        </div>

                        <!-- Ikigai -->
                        <div class="profile-panel" style="margin-bottom:2rem;">
                            <p class="panel-title">🌸 Matriz Ikigai (Propósito Vital)</p>
                            <div class="ikigai-grid">
                                <div class="ikigai-cell">
                                    <label>🔥 Pasión (Amas hacer)</label>
                                    <textarea id="ikiPasion" placeholder="Lo que te apasiona...">${ikigai.pasion}</textarea>
                                </div>
                                <div class="ikigai-cell">
                                    <label>🌍 Misión (El mundo necesita)</label>
                                    <textarea id="ikiMision" placeholder="Lo que el mundo necesita...">${ikigai.mision}</textarea>
                                </div>
                                <div class="ikigai-cell">
                                    <label>💼 Profesión (Te pagan por ello)</label>
                                    <textarea id="ikiProfesion" placeholder="Por lo que te pagan...">${ikigai.profesion}</textarea>
                                </div>
                                <div class="ikigai-cell">
                                    <label>🎯 Vocación (Eres bueno en ello)</label>
                                    <textarea id="ikiVocacion" placeholder="En lo que destacas...">${ikigai.vocacion}</textarea>
                                </div>
                            </div>
                            <button id="btnInvokeDharma" style="background:rgba(255,171,64,0.1); border:1px solid var(--accent-orange); color:var(--accent-orange); padding:10px 20px; border-radius:12px; font-weight:bold; cursor:pointer; transition:0.2s; width:100%;">
                                🧘‍♂️ Invocar @dharma_coach (IA) — Optimizar Ikigai
                            </button>
                        </div>

                        <!-- Roles activos -->
                        <div class="profile-panel">
                            <p class="panel-title">🏗️ Asignaciones en la Red</p>
                            ${rolesHtml}
                        </div>
                    </div>

                    <!-- Columna lateral -->
                    <div>
                        <!-- Skills SBT -->
                        <div class="profile-panel" style="margin-bottom:2rem;">
                            <p class="panel-title">🎒 Soulbound Tokens (Skills)</p>
                            ${skillsHtml}
                        </div>

                        <!-- Córtex 3D -->
                        <div class="profile-panel">
                            <p class="panel-title">🧠 Córtex 3D (Grafo de Conocimiento)</p>
                            <div class="cortex-mount" id="humanCortexMount"></div>
                        </div>
                    </div>

                </div>
            </main>

            <!-- Modal Dharma Coach -->
            <div id="dharmaModal" class="modal-dharma">
                <div class="modal-dharma-content">
                    <div class="dharma-header">
                        <h2 style="margin:0; font-size:1.1rem; color:var(--accent-orange); font-weight:900; text-transform:uppercase; letter-spacing:1px;">🧘‍♂️ @dharma_coach</h2>
                        <button id="dharmaModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem;">✖</button>
                    </div>
                    <div class="dharma-body" id="dharmaModalBody"></div>
                    <div style="padding:20px 30px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:flex-end; background:rgba(0,0,0,0.5);">
                        <button class="btn-primary" id="btnApplyDharma" style="display:none;">✨ Asimilar Propósito</button>
                    </div>
                </div>
            </div>

            ${BottomNav.getHtml('/profile')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender();

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const user         = state.globalUsers.find(u => u.id === activeUserId);

        // ── Córtex 3D ─────────────────────────────────────────────
        const mountPoint = document.getElementById('humanCortexMount');
        if (mountPoint) {
            this.synapticCanvas = new SynapticCanvas(mountPoint, activeUserId);
            await this.synapticCanvas.render();
        }

        // ── Guardar perfil ────────────────────────────────────────
        document.getElementById('btnSaveProfile')?.addEventListener('click', async () => {
            const name = document.getElementById('profName').value.trim();
            if (!name) return alert('Tu nombre no puede estar vacío.');

            const ikigaiData = {
                pasion:    document.getElementById('ikiPasion').value.trim(),
                mision:    document.getElementById('ikiMision').value.trim(),
                profesion: document.getElementById('ikiProfesion').value.trim(),
                vocacion:  document.getElementById('ikiVocacion').value.trim()
            };

            const rawTags       = document.getElementById('profTags').value;
            const keywordsArray = rawTags.split(',').map(k => k.trim().replace('#', '')).filter(Boolean);
            keywordsArray.push('human', activeUserId);

            const btn = document.getElementById('btnSaveProfile');
            btn.disabled  = true;
            btn.innerText = '⏳ Sellando...';

            try {
                if (user) {
                    await store.dispatch({ type: 'UPDATE_USER', payload: { ...user, name } });
                }
                await KB.init();
                await KB.saveNode({
                    id:         `prompt_global_${activeUserId.replace('@', '')}`,
                    type:       'prompt_a2a',
                    category:   'meta_prompt',
                    targetId:   activeUserId,
                    roleTarget: activeUserId,
                    title:      `Identidad de ${name}`,
                    content:    'Sistema de Identidad Humana (VNA)',
                    ikigai:     ikigaiData,
                    keywords:   keywordsArray
                });
                alert('✅ Identidad sincronizada con la Matriz.');
                window.location.reload();
            } catch (e) {
                alert('Error al guardar: ' + e.message);
                btn.disabled  = false;
                btn.innerText = '💾 Sellar Identidad en la Matriz';
            }
        });

        // ── Dharma Coach (IA) ─────────────────────────────────────
        const dharmaModal  = document.getElementById('dharmaModal');
        const dharmaBody   = document.getElementById('dharmaModalBody');
        const btnApply     = document.getElementById('btnApplyDharma');
        let latestDharma   = null;

        document.getElementById('dharmaModalClose')?.addEventListener('click', () => {
            dharmaModal.style.display = 'none';
        });

        document.getElementById('btnInvokeDharma')?.addEventListener('click', async () => {
            dharmaModal.style.display = 'flex';
            dharmaBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation:pulse 2s infinite;">🧘‍♂️</div><p style="color:var(--accent-orange); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Analizando karma, roles y experiencia en el Ledger...</p></div>`;
            btnApply.style.display = 'none';

            try {
                const ikigaiActual = {
                    pasion:    document.getElementById('ikiPasion').value.trim(),
                    mision:    document.getElementById('ikiMision').value.trim(),
                    profesion: document.getElementById('ikiProfesion').value.trim(),
                    vocacion:  document.getElementById('ikiVocacion').value.trim()
                };
                const userSkills = user?.profile?.sbt_skills || [];
                const expString  = userSkills.length > 0
                    ? userSkills.map(s => `${s.skillName || s.flowId} (${s.exp}h)`).join(', ')
                    : 'Cero horas minadas.';

                const systemPrompt = `Eres @dharma_coach, mentor de desarrollo profesional en TeamTowers V10 (red W3C).
Lee el perfil del humano y devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{
  "ikigai_pasion": "...",
  "ikigai_mision": "...",
  "ikigai_profesion": "...",
  "ikigai_vocacion": "...",
  "analisis_dharma": "Reflexión como coach sobre su carrera en la red.",
  "plan_desarrollo": "Pasos concretos para maximizar Slicing Pie y felicidad."
}`;

                const userPrompt = `Perfil: ${user?.name || activeUserId}
Ikigai actual: ${JSON.stringify(ikigaiActual)}
Skills (SBTs): ${expString}
Roles activos: ${JSON.stringify(state.projects.flatMap(p =>
    (p.asignaciones || []).filter(a => a.userId === activeUserId).map(a => {
        const r = p.roles?.find(r => r.id === a.roleId);
        return r ? `${r.name} en ${p.nombre}` : null;
    }).filter(Boolean)
))}`;

                const response = await Orchestrator.callLLM({
                    preferredEngine: 'anthropic',
                    systemPrompt,
                    userPrompt,
                    responseFormat: 'json_object',
                    temperature:    0.6
                });

                latestDharma = response.content;

                dharmaBody.innerHTML = `
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
                        ${['pasion','mision','profesion','vocacion'].map(k => `
                            <div style="background:rgba(255,171,64,0.05); border:1px solid rgba(255,171,64,0.2); border-radius:12px; padding:1rem;">
                                <div style="font-size:0.7rem; color:var(--accent-orange); font-weight:900; text-transform:uppercase; margin-bottom:6px;">${k}</div>
                                <div style="color:white; font-size:0.9rem; line-height:1.5;">${latestDharma[`ikigai_${k}`] || '—'}</div>
                            </div>`
                        ).join('')}
                    </div>
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:1.5rem; margin-bottom:1rem;">
                        <div style="font-size:0.75rem; color:var(--accent-orange); font-weight:900; text-transform:uppercase; margin-bottom:8px;">📊 Análisis Dharma</div>
                        <p style="color:#ccc; line-height:1.6; margin:0;">${latestDharma.analisis_dharma || '—'}</p>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:1.5rem;">
                        <div style="font-size:0.75rem; color:var(--accent-green); font-weight:900; text-transform:uppercase; margin-bottom:8px;">🗺️ Plan de Desarrollo</div>
                        <p style="color:#ccc; line-height:1.6; margin:0;">${latestDharma.plan_desarrollo || '—'}</p>
                    </div>`;

                btnApply.style.display = 'block';

            } catch (err) {
                dharmaBody.innerHTML = `<p style="color:var(--accent-red); padding:2rem;">❌ Error: ${err.message}</p>`;
            }
        });

        btnApply?.addEventListener('click', async () => {
            if (!latestDharma) return;
            document.getElementById('ikiPasion').value    = latestDharma.ikigai_pasion    || '';
            document.getElementById('ikiMision').value    = latestDharma.ikigai_mision    || '';
            document.getElementById('ikiProfesion').value = latestDharma.ikigai_profesion || '';
            document.getElementById('ikiVocacion').value  = latestDharma.ikigai_vocacion  || '';
            dharmaModal.style.display = 'none';
            alert('✨ Propósito asimilado. Recuerda guardar tu perfil.');
        });
    }

    // Alias compatibilidad V9
    executeViewScript() { return this.afterRender(); }
}
