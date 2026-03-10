// v5/js/views/OnboardingView.js
import { store } from '../core/store.js';

export default class OnboardingView {
    constructor() {
        document.title = "Registro y Sincronización | TeamTowers SOS";
    }

    async getHtml() {
        const tempName = sessionStorage.getItem('tt_temp_onboarding_name') || '';
        const tempEmail = sessionStorage.getItem('tt_temp_onboarding_email') || '';
        
        // Sugerir un handle a partir del nombre
        const suggestedHandle = tempName ? `@${tempName.split(' ')[0].toLowerCase()}_${Math.floor(Math.random() * 999)}` : '@nodo_nuevo';

        return `
            <style>
                .onboarding-canvas { height: 100vh; width: 100vw; background: #050507; display: flex; justify-content: center; align-items: center; font-family: var(--font-main); }
                .onb-card { background: #111; border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; max-width: 600px; padding: 3rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .onb-header { text-align: center; margin-bottom: 2rem; }
                .onb-header h1 { color: white; margin: 0; font-size: 2rem; }
                .onb-header p { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.9rem; text-transform: uppercase; margin-top: 5px;}
                
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 1rem; outline: none; transition: 0.2s;}
                .form-control:focus { border-color: var(--accent-blue); }
                
                .cv-box { min-height: 120px; resize: vertical; font-size: 0.9rem; line-height: 1.5; }
                
                .btn-primary { width: 100%; background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: 0.2s; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(179, 136, 255, 0.4); }
                
                .ai-status { display: none; text-align: center; margin-top: 1rem; color: var(--accent-orange); font-family: var(--font-mono); font-size: 0.85rem; font-weight: bold;}
            </style>
            
            <div class="onboarding-canvas">
                <div class="onb-card">
                    <div class="onb-header">
                        <h1>Sincronización de Nodo</h1>
                        <p>Generación de Identidad Fractal</p>
                    </div>

                    <div class="form-group">
                        <label>Nombre Legal</label>
                        <input type="text" id="inpRealName" class="form-control" value="${tempName}" disabled style="opacity:0.5;">
                    </div>
                    
                    <div class="form-group">
                        <label>ID de Red (Alias Único)</label>
                        <input type="text" id="inpHandle" class="form-control" value="${suggestedHandle}" style="color: var(--accent-green); font-family: var(--font-mono); font-weight: bold;">
                    </div>

                    <div class="form-group">
                        <label>Contexto Profesional (Pega tu Bio o CV)</label>
                        <textarea id="inpCV" class="form-control cv-box" placeholder="Pega aquí un resumen de tu LinkedIn, tu CV, o descríbete en unas líneas. El Orquestador IA lo usará para instanciar tu Ikigai y Arquetipos..."></textarea>
                    </div>

                    <button class="btn-primary" id="btnRegister">Analizar con IA y Registrarse 🚀</button>
                    <div class="ai-status" id="aiStatusMsg">⚙️ Leyendo memoria y forjando arquetipos...</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const btnRegister = document.getElementById('btnRegister');
        const statusMsg = document.getElementById('aiStatusMsg');
        
        btnRegister.addEventListener('click', async () => {
            const handle = document.getElementById('inpHandle').value.trim();
            const realName = document.getElementById('inpRealName').value.trim();
            const cvText = document.getElementById('inpCV').value.trim();
            const email = sessionStorage.getItem('tt_temp_onboarding_email');

            if (!handle || !email) return alert("Falta el Handle o el Email de sesión.");

            btnRegister.disabled = true;
            statusMsg.style.display = 'block';

            // INVOCACIÓN A LA IA (Usando la llave global si existe, o un perfil genérico si no)
            const savedProvider = localStorage.getItem('tt_ai_provider');
            let apiKey = '';
            if (savedProvider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (savedProvider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (savedProvider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            let profileData = {
                vision: cvText || "Usuario recién llegado a la red.",
                structural_affinity: ["@baixos"],
                guardian_authority: ["everyman"],
                guardian_growth: ["explorer"],
                ikigaiSummary: "Pendiente de análisis profundo."
            };

            if (apiKey && cvText.length > 20) {
                try {
                    const sysPrompt = `
                        Analiza este resumen profesional. 
                        Devuelve un JSON estricto con:
                        1. "ikigaiSummary": Resumen de 2 líneas de su aporte de valor en una DAO.
                        2. "structural_affinity": Array eligiendo entre ["@anxaneta", "@aixecador", "@dosos", "@baixos", "@pinya"].
                        3. "guardian_authority": Array con 1-2 arquetipos predominantes (ej: ["creator", "hero", "sage", "magician", "caregiver", "ruler"]).
                    `;

                    let textResponse = "";

                    if (savedProvider === 'openai') {
                        const res = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                            body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: sysPrompt }, { role: "user", content: cvText }], response_format: { type: "json_object" } })
                        });
                        const data = await res.json(); textResponse = data.choices[0].message.content;
                    } else if (savedProvider === 'deepseek') {
                        const res = await fetch('https://api.deepseek.com/chat/completions', {
                            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                            body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }, { role: "user", content: cvText }], response_format: { type: "json_object" } })
                        });
                        const data = await res.json(); textResponse = data.choices[0].message.content;
                    }

                    if(textResponse) {
                        textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const parsed = JSON.parse(textResponse);
                        profileData.ikigaiSummary = parsed.ikigaiSummary;
                        profileData.structural_affinity = parsed.structural_affinity;
                        profileData.guardian_authority = parsed.guardian_authority;
                    }
                } catch (e) {
                    console.warn("Fallo IA en onboarding, usando valores por defecto.", e);
                }
            }

            // REGISTRAR EN EL KERNEL Y LOGUEAR
            statusMsg.innerText = "✅ Inyectando Nodo en el Kernel...";
            
            await store.dispatch({
                type: 'ADD_USER',
                payload: {
                    id: handle,
                    name: realName,
                    walletOrSocial: email,
                    globalRole: 'network-user'
                }
            });

            // Guardar perfil generado
            const currentState = store.getState();
            const uIdx = currentState.globalUsers.findIndex(u => u.id === handle);
            if (uIdx > -1) {
                currentState.globalUsers[uIdx].profile = { ...profileData, lastUpdated: Date.now() };
                store.state = currentState;
                localStorage.setItem('tt_sos_state', JSON.stringify(currentState));
            }

            // Autologuear y limpiar sesión temporal
            sessionStorage.removeItem('tt_temp_onboarding_email');
            sessionStorage.removeItem('tt_temp_onboarding_name');
            
            await store.dispatch({ type: 'LOGIN_USER', payload: { userId: handle } });
            window.location.href = '/v5/';
        });
    }
}
