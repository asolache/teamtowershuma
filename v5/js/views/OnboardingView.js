// v5/js/views/OnboardingView.js
import { store } from '../core/store.js';

// Reutilizamos el mismo diccionario Geo-Local para mantener DRY
const GEO_DATA = {
    "España": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Alicante", "Palma", "Otra..."],
    "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Mérida", "Otra..."],
    "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Otra..."],
    "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Otra..."],
    "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Otra..."],
    "Perú": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Otra..."],
    "Estados Unidos": ["Miami", "New York", "San Francisco", "Los Angeles", "Austin", "Otra..."],
    "Otro País...": ["Otra..."]
};

export default class OnboardingView {
    constructor() {
        document.title = "Acuñar Pasaporte Fractal | TeamTowers SOS";
    }

    async getHtml() {
        const tempName = sessionStorage.getItem('tt_temp_onboarding_name') || '';
        const tempEmail = sessionStorage.getItem('tt_temp_onboarding_email') || '';
        const tempWallet = sessionStorage.getItem('tt_temp_onboarding_wallet') || '';
        
        // Sugerir un handle a partir del nombre
        const suggestedHandle = tempName ? `@${tempName.split(' ')[0].toLowerCase()}_${Math.floor(Math.random() * 999)}` : '@nodo_nuevo';

        // Generar opciones de países
        let countryOptions = `<option value="">Seleccionar país...</option>`;
        Object.keys(GEO_DATA).forEach(c => {
            countryOptions += `<option value="${c}">${c}</option>`;
        });

        return `
            <style>
                .onboarding-canvas { min-height: 100vh; width: 100vw; background: #050507; display: flex; justify-content: center; align-items: center; font-family: var(--font-main); padding: 2rem 0; overflow-y: auto;}
                .onb-card { background: #111; border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; max-width: 650px; padding: 3rem; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; overflow: hidden;}
                .onb-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); }
                
                .onb-header { text-align: center; margin-bottom: 2rem; }
                .onb-header h1 { color: white; margin: 0; font-size: 2rem; letter-spacing: -1px; }
                .onb-header p { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.9rem; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px;}
                
                .form-row { display: flex; gap: 15px; margin-bottom: 1.5rem; }
                .form-group { flex: 1; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.75rem; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: 0.2s; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-blue); }
                .form-control:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .cv-box { min-height: 100px; resize: vertical; font-size: 0.9rem; line-height: 1.5; }
                
                .btn-primary { width: 100%; background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 10px;}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(179, 136, 255, 0.4); }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
                
                .ai-status { display: none; text-align: center; margin-top: 1rem; color: var(--accent-orange); font-family: var(--font-mono); font-size: 0.85rem; font-weight: bold; animation: pulse 1.5s infinite;}
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            </style>
            
            <div class="onboarding-canvas">
                <div class="onb-card">
                    <div class="onb-header">
                        <h1>Sincronización de Nodo</h1>
                        <p>Generación de Pasaporte Fractal</p>
                    </div>

                    <div class="form-row">
                        <div class="form-group" style="flex: 2;">
                            <label>Nombre Legal</label>
                            <input type="text" id="inpRealName" class="form-control" value="${tempName}" placeholder="Tu nombre completo">
                        </div>
                        <div class="form-group" style="flex: 1.5;">
                            <label>Alias Único (Edge ID)</label>
                            <input type="text" id="inpHandle" class="form-control" value="${suggestedHandle}" style="color: var(--accent-green); font-family: var(--font-mono); font-weight: bold;">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email (Credencial Principal)</label>
                            <input type="email" id="inpEmail" class="form-control" value="${tempEmail}" ${tempEmail ? 'disabled' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Crypto Wallet (Web3)</label>
                            <input type="text" id="inpWallet" class="form-control" value="${tempWallet}" ${tempWallet ? 'disabled' : ''} placeholder="0x...">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>País</label>
                            <select id="inpCountry" class="form-control">
                                ${countryOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Ciudad</label>
                            <select id="inpCity" class="form-control" disabled>
                                <option value="">Primero elige país</option>
                            </select>
                            <input type="text" id="inpCityCustom" class="form-control" placeholder="Escribe tu ciudad..." style="display:none; margin-top:5px;">
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label>Contexto Profesional (Bio / CV)</label>
                        <textarea id="inpCV" class="form-control cv-box" placeholder="Pega aquí tu biografía. La IA de TeamTowers la procesará para forjar tus Arquetipos y tu Ikigai dentro de la red..."></textarea>
                    </div>

                    <button class="btn-primary" id="btnRegister">Acuñar Identidad Fractal ⚡</button>
                    <div class="ai-status" id="aiStatusMsg">Verificando unicidad en Edge Backend...</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const btnRegister = document.getElementById('btnRegister');
        const statusMsg = document.getElementById('aiStatusMsg');
        
        const selCountry = document.getElementById('inpCountry');
        const selCity = document.getElementById('inpCity');
        const inpCityCustom = document.getElementById('inpCityCustom');

        // Lógica de Ciudades Dependientes (DRY)
        selCountry.addEventListener('change', (e) => {
            const country = e.target.value;
            selCity.innerHTML = '';
            inpCityCustom.style.display = 'none';
            inpCityCustom.value = '';

            if (!country) {
                selCity.disabled = true;
                selCity.innerHTML = '<option value="">Primero elige país</option>';
                return;
            }

            selCity.disabled = false;
            selCity.innerHTML = '<option value="">Selecciona Ciudad...</option>';
            
            const cities = GEO_DATA[country] || ["Otra..."];
            cities.forEach(city => {
                selCity.innerHTML += `<option value="${city}">${city}</option>`;
            });
        });

        selCity.addEventListener('change', (e) => {
            if (e.target.value === 'Otra...') {
                inpCityCustom.style.display = 'block';
                inpCityCustom.focus();
            } else {
                inpCityCustom.style.display = 'none';
                inpCityCustom.value = '';
            }
        });

        btnRegister.addEventListener('click', async () => {
            let handle = document.getElementById('inpHandle').value.trim();
            const realName = document.getElementById('inpRealName').value.trim();
            const email = document.getElementById('inpEmail').value.trim();
            const wallet = document.getElementById('inpWallet').value.trim();
            const cvText = document.getElementById('inpCV').value.trim();
            
            const country = selCountry.value;
            let city = selCity.value;
            if (city === 'Otra...') city = inpCityCustom.value.trim();

            if (!handle || !realName) return alert("El Alias y el Nombre son obligatorios.");
            if (!handle.startsWith('@')) handle = '@' + handle;

            btnRegister.disabled = true;
            statusMsg.style.display = 'block';

            // -------------------------------------------------------------------
            // SIMULACIÓN DE LLAMADA AL EDGE BACKEND (Validación de Alias Único)
            // -------------------------------------------------------------------
            statusMsg.innerText = "🌐 Validando unicidad del @alias en Edge Network...";
            
            const edgeBackendSimulation = new Promise((resolve, reject) => {
                setTimeout(() => {
                    const state = store.getState();
                    const aliasTakenLocal = state.globalUsers.find(u => u.id === handle);
                    // Aquí se haría el fetch real a Supabase/Cloudflare. 
                    // Simulamos que el backend rechaza si el alias ya está registrado.
                    if (aliasTakenLocal) {
                        reject(new Error("El alias ya está registrado en el Ecosistema Global."));
                    } else {
                        resolve({ status: "OK", tx_hash: "0x" + Math.random().toString(16).slice(2, 10) });
                    }
                }, 1000); // 1 segundo de latencia de red simulada
            });

            try {
                await edgeBackendSimulation;
            } catch (err) {
                alert(err.message);
                btnRegister.disabled = false;
                statusMsg.style.display = 'none';
                return; // Corta la ejecución para que el usuario cambie el alias
            }


            // -------------------------------------------------------------------
            // INVOCACIÓN A LA IA PARA GENERAR IDENTIDAD (Arquetipos / Ikigai)
            // -------------------------------------------------------------------
            statusMsg.innerText = "🧠 Procesando biografía y forjando Arquetipos...";

            const savedProvider = localStorage.getItem('tt_ai_provider');
            let apiKey = '';
            if (savedProvider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek');
            if (savedProvider === 'openai') apiKey = localStorage.getItem('tt_key_openai');
            if (savedProvider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini');

            let profileData = {
                country: country,
                city: city,
                vision: cvText || "Usuario recién llegado a la red.",
                structural_affinity: ["@baixos"],
                guardian_authority: ["everyman"],
                guardian_growth: ["explorer"],
                ikigaiSummary: "Pendiente de análisis profundo."
            };

            if (apiKey && cvText.length > 20) {
                try {
                    const sysPrompt = `
                        Analiza este perfil profesional. 
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

            // -------------------------------------------------------------------
            // REGISTRO LOCAL Y LOGIN
            // -------------------------------------------------------------------
            statusMsg.innerText = "✅ Inyectando Nodo en el Kernel Local...";
            
            await store.dispatch({
                type: 'ADD_USER',
                payload: {
                    id: handle,
                    name: realName,
                    email: email,
                    wallet: wallet,
                    social: '', // No lo pedimos en el onboarding por agilidad, lo rellenará en Profile
                    globalRole: 'network-user'
                }
            });

            // Guardar perfil generado (fusionando los datos geográficos y los de la IA)
            const currentState = store.getState();
            const uIdx = currentState.globalUsers.findIndex(u => u.id === handle);
            if (uIdx > -1) {
                currentState.globalUsers[uIdx].profile = { ...profileData, lastUpdated: Date.now() };
                store.saveState();
            }

            // Limpiamos las cachés de seguridad
            sessionStorage.removeItem('tt_temp_onboarding_email');
            sessionStorage.removeItem('tt_temp_onboarding_name');
            sessionStorage.removeItem('tt_temp_onboarding_wallet');
            
            // Login y redirección
            await store.dispatch({ type: 'LOGIN_USER', payload: { userId: handle } });
            window.location.href = '/v5/';
        });
    }
}
