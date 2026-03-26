// v9/js/views/ProfileView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SynapticCanvas } from '../components/SynapticCanvas.js';
import { Orchestrator } from '../core/Orchestrator.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Espejo (Ikigai) | TeamTowers V9";
        this.synapticCanvas = null;
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        let totalGlobalSlices = 0;
        let totalGlobalHours = 0;
        let activeRoles = [];

        state.projects.forEach(p => {
            const harvest = store.calculateHarvest(p.id) || [];
            const myHarvest = harvest.find(h => h.userId === activeUserId || h.user === activeUserId);
            if (myHarvest && myHarvest.totalSlices > 0) {
                totalGlobalSlices += myHarvest.totalSlices;
            }
            if (p.ledger) {
                p.ledger.forEach(tx => {
                    if (tx.userId === activeUserId && tx.type === 'SOP_EXECUTION') {
                        totalGlobalHours += (tx.horas || 0);
                    }
                });
            }
            if (p.asignaciones) {
                p.asignaciones.forEach(a => {
                    if (a.userId === activeUserId) {
                        const rInfo = p.roles.find(r => r.id === a.roleId);
                        if (rInfo) activeRoles.push({ project: p.nombre, role: rInfo.name, level: rInfo.levelId });
                    }
                });
            }
        });

        await KB.init();
        const promptNode = await KB.getNode(`prompt_global_${activeUserId.replace('@','')}`);
        const ikigai = promptNode?.ikigai || { pasion: '', mision: '', vocacion: '', profesion: '' };
        const tags = promptNode?.keywords?.filter(k => k !== 'human' && k !== activeUserId).join(', ') || '';

        const rolesHtml = activeRoles.length > 0 
            ? activeRoles.map(r => `<div class="role-pill"><span class="role-level">${r.level}</span> <span style="color:white;">${r.role}</span> <span style="color:#666;">en ${r.project}</span></div>`).join('')
            : '<div style="color:#555; font-style:italic; padding:10px;">Sin asignaciones estructurales en la red.</div>';

        const sbtSkills = user?.profile?.sbt_skills || [];
        const skillsHtml = sbtSkills.length > 0
            ? sbtSkills.map(s => `<div class="skill-pill"><span>🎒 ${s.skillName || s.flowId}</span> <span style="color:var(--accent-green); font-family:var(--font-mono); font-weight:bold;">${s.exp.toFixed(1)}h Exp</span></div>`).join('')
            : '<div style="color:#555; font-style:italic; padding:10px;">Aún no has minado experiencia (SBTs) resolviendo Work Orders.</div>';

        const headerConfig = {
            title: "Mi Espejo (Perfil Humano)",
            subtitle: "Matriz Ikigai & SBTs",
            tagline: "El valor que aportas a la red se refleja en tus Soulbound Tokens y tu Slicing Pie."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-profile { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; background: radial-gradient(circle at center, #111116 0%, #050505 100%);}
                
                .profile-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; padding-bottom: 5rem;}
                @media (max-width: 1024px) { .profile-container { grid-template-columns: 1fr; } }
                
                .stats-stripe { grid-column: 1 / -1; display: flex; gap: 20px; flex-wrap: wrap;}
                .stat-card { flex: 1; min-width: 250px; background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);}
                .stat-icon { font-size: 3rem; background: rgba(0,0,0,0.5); width: 70px; height: 70px; display: flex; justify-content: center; align-items: center; border-radius: 16px; border: 1px solid #333;}
                .stat-info h4 { margin: 0 0 5px 0; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;}
                .stat-info .val { margin: 0; color: white; font-size: 2rem; font-weight: 900; font-family: var(--font-mono); line-height: 1;}
                .stat-info .val.green { color: var(--accent-green); text-shadow: 0 0 15px rgba(0,230,118,0.3); }
                .stat-info .val.blue { color: var(--accent-blue); text-shadow: 0 0 15px rgba(0,176,255,0.3); }

                .profile-panel { background: rgba(20,20,25,0.6); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(15px);}
                .panel-title { color: white; font-size: 1.2rem; font-weight: 900; margin-top: 0; margin-bottom: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;}
                
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;}
                .form-group label { color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 12px; border-radius: 10px; font-family: var(--font-main); font-size: 0.95rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.1);}
                
                .ikigai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;}
                @media (max-width: 600px) { .ikigai-grid { grid-template-columns: 1fr; } }
                
                .btn-lux { padding: 14px 20px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: 0.3s; border: none; width: 100%; display: flex; justify-content: center; align-items: center; gap: 10px;}
                .btn-success { background: linear-gradient(135deg, var(--accent-blue), var(--accent-green)); color: black; box-shadow: 0 5px 15px rgba(0,176,255,0.3);}
                .btn-success:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,230,118,0.5); filter: brightness(1.2);}
                
                .btn-dharma { background: linear-gradient(135deg, rgba(255,145,0,0.1), rgba(255,145,0,0.2)); border: 1px solid var(--accent-orange); color: var(--accent-orange); margin-bottom: 20px; font-size: 0.9rem;}
                .btn-dharma:hover { background: var(--accent-orange); color: black; box-shadow: 0 5px 20px rgba(255,145,0,0.4);}

                .role-pill { background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 10px 15px; border-radius: 10px; margin-bottom: 8px; font-size: 0.9rem;}
                .role-level { color: var(--accent-purple); font-family: var(--font-mono); font-weight: bold; margin-right: 5px;}
                
                .skill-pill { background: rgba(0,230,118,0.05); border: 1px solid rgba(0,230,118,0.2); padding: 10px 15px; border-radius: 10px; margin-bottom: 8px; font-size: 0.9rem; display: flex; justify-content: space-between;}

                #humanCortexMount { height: 400px; width: 100%; border: 1px solid rgba(0,176,255,0.2); border-radius: 16px; overflow: hidden; background: #050508; margin-top: 10px;}
                
                /* Oráculo Modal */
                .modal-dharma { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 5000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px);}
                .modal-dharma-content { background: var(--bg-dark); width: 90%; max-width: 800px; max-height: 85vh; border-radius: 20px; border: 1px solid var(--accent-orange); display: flex; flex-direction: column; overflow:hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border-top: 4px solid var(--accent-orange);}
                .dharma-header { padding:20px 30px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(255,145,0,0.05);}
                .dharma-body { padding: 30px; overflow-y: auto; color: #ccc; font-size: 1rem; line-height: 1.7; white-space: pre-wrap;}
                .dharma-log { border-left: 3px solid var(--accent-orange); padding-left: 15px; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 0 8px 8px 0;}
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}
                <main class="workspace-profile">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="profile-container">
                        
                        <div class="stats-stripe">
                            <div class="stat-card">
                                <div class="stat-icon" style="color:var(--accent-purple); border-color:var(--accent-purple); background:rgba(224,64,251,0.1);">👤</div>
                                <div class="stat-info">
                                    <h4>Identidad Activa</h4>
                                    <div class="val">${user ? user.name : 'Desconocido'}</div>
                                    <div style="color:#888; font-family:var(--font-mono); font-size:0.8rem;">${activeUserId}</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="color:var(--accent-green); border-color:var(--accent-green); background:rgba(0,230,118,0.1);">💎</div>
                                <div class="stat-info">
                                    <h4>Slices Globales</h4>
                                    <div class="val green">${Math.round(totalGlobalSlices).toLocaleString()}</div>
                                    <div style="color:#888; font-family:var(--font-mono); font-size:0.8rem;">Patrimonio Slicing Pie</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="color:var(--accent-blue); border-color:var(--accent-blue); background:rgba(0,176,255,0.1);">⏱️</div>
                                <div class="stat-info">
                                    <h4>Esfuerzo Bruto</h4>
                                    <div class="val blue">${totalGlobalHours.toFixed(1)}h</div>
                                    <div style="color:#888; font-family:var(--font-mono); font-size:0.8rem;">Horas auditadas en Ledger</div>
                                </div>
                            </div>
                        </div>

                        <div class="profile-panel">
                            <div class="panel-title">
                                <span>⛩️ Matriz Ikigai (Propósito)</span>
                            </div>
                            
                            <button class="btn-lux btn-dharma" id="btnInvokeDharma">🧘‍♂️ Invocar a @dharma_coach (Auditoría Ontológica)</button>

                            <div class="form-group">
                                <label>Nombre Público</label>
                                <input type="text" id="profName" class="form-control" value="${user?.name || ''}">
                            </div>

                            <div class="ikigai-grid">
                                <div class="form-group">
                                    <label style="color:#e91e63;">Lo que amas (Pasión)</label>
                                    <textarea id="ikiPasion" class="form-control" rows="3">${ikigai.pasion || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="color:#00bcd4;">Lo que el mundo necesita (Misión)</label>
                                    <textarea id="ikiMision" class="form-control" rows="3">${ikigai.mision || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="color:#ff9800;">Por lo que te pagan (Profesión)</label>
                                    <textarea id="ikiProfesion" class="form-control" rows="3">${ikigai.profesion || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="color:#4caf50;">En lo que eres bueno (Vocación)</label>
                                    <textarea id="ikiVocacion" class="form-control" rows="3">${ikigai.vocacion || ''}</textarea>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 20px;">
                                <label>Tags Semánticos (Gravedad en Córtex 3D)</label>
                                <input type="text" id="profTags" class="form-control" placeholder="#backend, #design..." value="${tags}" style="color:var(--accent-green); font-family:var(--font-mono);">
                            </div>

                            <button class="btn-lux btn-success" id="btnSaveProfile">💾 Sellar Identidad en la Matriz</button>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:2rem;">
                            
                            <div class="profile-panel">
                                <div class="panel-title"><span>🌟</span> Roles Activos</div>
                                <div>${rolesHtml}</div>
                            </div>

                            <div class="profile-panel">
                                <div class="panel-title"><span>🎓</span> Soulbound Tokens (Skills)</div>
                                <div>${skillsHtml}</div>
                            </div>

                            <div class="profile-panel" style="padding: 1.5rem;">
                                <div class="panel-title" style="margin-bottom:0.5rem; border:none;"><span>🧠</span> Córtex Personal</div>
                                <div id="humanCortexMount"></div>
                            </div>

                        </div>
                    </div>
                </main>
                ${BottomNav.getHtml('/profile')}
            </div>

            <div id="dharmaModal" class="modal-dharma">
                <div class="modal-dharma-content">
                    <div class="dharma-header">
                        <h2 id="dharmaModalTitle" style="margin:0; font-size:1.2rem; color:var(--accent-orange); font-weight:900; text-transform:uppercase; letter-spacing:1px;">🧘‍♂️ @dharma_coach meditando...</h2>
                        <button id="dharmaModalClose" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem; transition:0.2s;">✖</button>
                    </div>
                    <div class="dharma-body" id="dharmaModalBody"></div>
                    <div style="padding:20px 30px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:flex-end; background:rgba(0,0,0,0.5);">
                        <button class="btn-lux btn-success" id="btnApplyDharma" style="width:auto; display:none;">✨ Asimilar Propósito</button>
                    </div>
                </div>
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        // Render WebGL Córtex
        const mountPoint = document.getElementById('humanCortexMount');
        if (mountPoint) {
            this.synapticCanvas = new SynapticCanvas(mountPoint, activeUserId);
            await this.synapticCanvas.render();
        }

        // GUARDAR PERFIL
        document.getElementById('btnSaveProfile').addEventListener('click', async () => {
            const name = document.getElementById('profName').value.trim();
            if (!name) return alert("Tu nombre no puede estar vacío.");

            const ikigaiData = {
                pasion: document.getElementById('ikiPasion').value.trim(),
                mision: document.getElementById('ikiMision').value.trim(),
                profesion: document.getElementById('ikiProfesion').value.trim(),
                vocacion: document.getElementById('ikiVocacion').value.trim()
            };

            const rawTags = document.getElementById('profTags').value;
            const keywordsArray = rawTags.split(',').map(k => k.trim().replace('#','')).filter(k => k !== '');
            keywordsArray.push('human', activeUserId);

            const btnSave = document.getElementById('btnSaveProfile');
            btnSave.disabled = true; btnSave.innerText = "⏳ Sellando...";

            try {
                // Actualizar name en Redux
                if (user) {
                    const updatedUser = { ...user, name: name };
                    await store.dispatch({ type: 'UPDATE_USER', payload: updatedUser });
                }

                // Guardar/Actualizar el Prompt global de identidad
                await KB.init();
                await KB.saveNode({
                    id: `prompt_global_${activeUserId.replace('@','')}`,
                    type: 'prompt_a2a', category: 'meta_prompt', targetId: activeUserId, roleTarget: activeUserId,
                    title: `Identidad de ${name}`,
                    content: "Sistema de Identidad Humana (VNA)",
                    ikigai: ikigaiData, 
                    keywords: keywordsArray
                });

                alert("✅ Identidad sincronizada con la Matriz.");
                window.location.reload();
            } catch (e) {
                alert("Error al guardar: " + e.message);
                btnSave.disabled = false; btnSave.innerText = "💾 Sellar Identidad en la Matriz";
            }
        });

        // 🧘‍♂️ INVOCAR A DHARMA COACH
        document.getElementById('btnInvokeDharma').addEventListener('click', async () => {
            const provider = localStorage.getItem('tt_ai_provider') || 'openai';
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (!apiKey && provider !== 'custom') return alert("⚠️ Configura tu API Key en el Panteón para invocar a Dharma.");

            const modal = document.getElementById('dharmaModal');
            const modalBody = document.getElementById('dharmaModalBody');
            const btnApply = document.getElementById('btnApplyDharma');
            
            modal.style.display = 'flex';
            modalBody.innerHTML = `<div style="text-align:center; padding:4rem;"><div style="font-size:4rem; animation: pulse 2s infinite;">🧘‍♂️</div><p style="color:var(--accent-orange); margin-top:1.5rem; font-family:var(--font-mono); font-weight:bold;">Analizando tu karma, roles y experiencia en el Ledger...</p></div>`;
            btnApply.style.display = 'none';

            try {
                // Preparamos el contexto para Dharma
                const ikigaiActual = {
                    pasion: document.getElementById('ikiPasion').value.trim(),
                    mision: document.getElementById('ikiMision').value.trim(),
                    profesion: document.getElementById('ikiProfesion').value.trim(),
                    vocacion: document.getElementById('ikiVocacion').value.trim()
                };

                const userSkills = user?.profile?.sbt_skills || [];
                const expString = userSkills.length > 0 ? userSkills.map(s => `${s.skillName || s.flowId} (${s.exp}h)`).join(', ') : 'Cero horas minadas.';

                const systemPrompt = `
                    Eres @dharma_coach, un mentor de desarrollo profesional en una red W3C llamada TeamTowers.
                    Tu objetivo es leer el perfil de un humano (Sus skills obtenidas trabajando y sus intereses actuales en la matriz Ikigai).
                    Debes:
                    1. Re-escribir su matriz Ikigai de forma poética pero profesional (llenando los huecos si están vacíos basándote en sus skills).
                    2. Sugerirle un "Plan de Desarrollo", recomendándole qué tipo de roles o proyectos debería buscar en la red para maximizar su Slicing Pie y su felicidad.
                    
                    DEVUELVE UNICAMENTE UN JSON STRICTO con esta estructura:
                    {
                        "ikigai_pasion": "Texto mejorado...",
                        "ikigai_mision": "Texto mejorado...",
                        "ikigai_profesion": "Texto mejorado...",
                        "ikigai_vocacion": "Texto mejorado...",
                        "analisis_dharma": "Tu reflexión como coach sobre su carrera en la red.",
                        "tags_recomendados": ["#tag1", "#tag2"]
                    }
                `;

                const userPrompt = `
                    Humano: ${user?.name || activeUserId}
                    Experiencia Real Auditada (SBTs): ${expString}
                    
                    Ikigai Actual (Borrador del humano):
                    - Pasión: ${ikigaiActual.pasion}
                    - Misión: ${ikigaiActual.mision}
                    - Profesión: ${ikigaiActual.profesion}
                    - Vocación: ${ikigaiActual.vocacion}
                `;

                const response = await Orchestrator.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.5 });
                const result = response.content;

                modalBody.innerHTML = `
                    <div style="font-family:var(--font-main);">
                        <div class="dharma-log" style="font-style:italic;">"${result.analisis_dharma}"</div>
                        
                        <h3 style="color:#e91e63;">❤️ Pasión (Sugerencia)</h3>
                        <p style="background:rgba(233, 30, 99, 0.1); padding:15px; border-radius:8px;">${result.ikigai_pasion}</p>
                        
                        <h3 style="color:#00bcd4;">🌍 Misión (Sugerencia)</h3>
                        <p style="background:rgba(0, 188, 212, 0.1); padding:15px; border-radius:8px;">${result.ikigai_mision}</p>
                        
                        <h3 style="color:#ff9800;">💼 Profesión (Sugerencia)</h3>
                        <p style="background:rgba(255, 152, 0, 0.1); padding:15px; border-radius:8px;">${result.ikigai_profesion}</p>
                        
                        <h3 style="color:#4caf50;">🎯 Vocación (Sugerencia)</h3>
                        <p style="background:rgba(76, 175, 80, 0.1); padding:15px; border-radius:8px;">${result.ikigai_vocacion}</p>
                        
                        <div style="margin-top:20px; color:var(--accent-blue); font-family:var(--font-mono); font-size:0.8rem;">
                            Tags sugeridos para tu córtex: ${result.tags_recomendados.join(', ')}
                        </div>
                    </div>
                `;

                document.getElementById('dharmaModalTitle').innerText = "🧘‍♂️ Visión de Dharma completada";
                btnApply.style.display = 'flex';

                btnApply.onclick = () => {
                    document.getElementById('ikiPasion').value = result.ikigai_pasion;
                    document.getElementById('ikiMision').value = result.ikigai_mision;
                    document.getElementById('ikiProfesion').value = result.ikigai_profesion;
                    document.getElementById('ikiVocacion').value = result.ikigai_vocacion;
                    
                    const currentTags = document.getElementById('profTags').value;
                    const newTags = result.tags_recomendados.join(', ');
                    document.getElementById('profTags').value = currentTags ? `${currentTags}, ${newTags}` : newTags;
                    
                    modal.style.display = 'none';
                    alert("✨ Propósito inyectado en el formulario. Recuerda pulsar 'Sellar Identidad' para guardarlo.");
                };

            } catch (e) {
                modalBody.innerHTML = `<div style="text-align:center; padding:2rem;"><h3 style="color:var(--accent-red);">Fallo Neural</h3><p style="color:#888;">${e.message}</p></div>`;
            }
        });

        document.getElementById('dharmaModalClose').addEventListener('click', () => {
            document.getElementById('dharmaModal').style.display = 'none';
        });
    }
}
