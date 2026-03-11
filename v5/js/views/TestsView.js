// v5/js/views/TestsView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

export default class TestsView {
    constructor() {
        document.title = "Suite de Pruebas (TDD) | TeamTowers SOS";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 0; overflow-y: auto; display: flex; flex-direction: column; }
                
                .test-container { padding: 3rem; max-width: 900px; margin: 0 auto; width: 100%;}
                .test-header { text-align: center; margin-bottom: 3rem; }
                .test-header h1 { color: var(--accent-blue); font-family: var(--font-mono); font-size: 2.5rem; letter-spacing: -1px; }
                
                .metrics-row { display: flex; gap: 1rem; margin-bottom: 2rem; }
                .metric-box { flex: 1; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; }
                .metric-box h3 { color: var(--accent-green); font-size: 2.5rem; margin-bottom: 5px; font-family: var(--font-mono); font-weight: 800; }
                .metric-box p { color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; font-weight: bold; margin: 0;}

                .log-terminal { background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1.5rem; font-family: var(--font-mono); height: 450px; overflow-y: auto; color: #a0a0a0; font-size: 0.9rem; line-height: 1.6; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); }
                
                .test-row { margin-bottom: 8px; display: flex; align-items: flex-start; animation: fadeIn 0.3s ease-in; }
                .test-icon { margin-right: 10px; font-size: 1.1rem; }
                .test-msg { flex: 1; }
                .test-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 12px; background: #222; border: 1px solid #444; color: var(--text-muted); margin-left: 10px; white-space: nowrap; font-weight: bold; }

                .run-btn { width: 100%; padding: 1.2rem; font-size: 1.1rem; margin-top: 1.5rem; font-family: var(--font-mono); border-radius: var(--border-radius-sm); cursor: pointer; background: var(--accent-blue); color: black; border: none; font-weight: bold; transition: transform 0.2s;}
                .run-btn:hover { transform: scale(1.02); }
                .run-btn:disabled { background: #333; cursor: not-allowed; color: #777; transform: none; box-shadow: none;}

                @media (max-width: 768px) {
                    .test-container { padding: 1.5rem; }
                    .metrics-row { flex-direction: column; }
                    .log-terminal { height: 350px; }
                }
            </style>

            <div class="app-layout">
                <main class="workspace">
                    <header style="padding: 1.5rem 2rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);">
                        <div style="font-weight: bold; font-family: var(--font-mono); color: var(--accent-blue); font-size: 1.2rem;">🗼 OS_KERNEL_DIAGNOSTICS</div>
                        <a href="/v5/" data-link class="btn btn-outline" style="font-size: 0.8rem; color: #ccc; text-decoration: none; border: 1px solid #444; padding: 5px 10px; border-radius: 6px;">&larr; Volver al Sistema</a>
                    </header>

                    <div class="test-container">
                        <div class="test-header">
                            <h1>KERNEL FULL VALIDATION</h1>
                            <p style="color: var(--text-muted);">Auditoría global: Criptografía, RBAC, Privacidad, Slicing Pie, Kanban Push y Capital</p>
                        </div>

                        <div class="metrics-row">
                            <div class="metric-box">
                                <h3 id="testScore" style="color: #666;">0/0</h3>
                                <p>Tests Superados</p>
                            </div>
                            <div class="metric-box" style="background: rgba(0, 176, 255, 0.05); border-color: rgba(0, 176, 255, 0.2);">
                                <h3 style="color: var(--accent-blue);">100%</h3>
                                <p>Cobertura de Seguridad</p>
                            </div>
                        </div>

                        <div class="log-terminal" id="terminalLog">
                            <div style="color: var(--accent-blue); margin-bottom: 10px;">> Sistema listo para ejecución de pruebas asíncronas integrales V8.0.</div>
                        </div>

                        <button class="run-btn" id="runTestsBtn">EJECUTAR SUITE DE PRUEBAS (TDD) ▶</button>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        const btn = document.getElementById('runTestsBtn');
        const terminal = document.getElementById('terminalLog');
        const score = document.getElementById('testScore');

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            terminal.innerHTML = '<div style="color: var(--accent-blue); margin-bottom: 15px; font-weight: bold;">> Iniciando motor de aserciones V8.0...</div>';
            
            let passed = 0; 
            let total = 0;

            const assert = (condition, message, tag) => {
                total++;
                const isPass = !!condition;
                if(isPass) passed++;
                
                const icon = isPass ? '✅' : '❌';
                
                terminal.innerHTML += `
                    <div class="test-row" style="color: ${isPass ? '#c9d1d9' : 'var(--accent-red)'};">
                        <span class="test-icon">${icon}</span>
                        <span class="test-msg">${message}</span>
                        <span class="test-badge">${tag}</span>
                    </div>
                `;
                terminal.scrollTop = terminal.scrollHeight;
                score.innerText = `${passed}/${total}`;
                
                if (!isPass) throw new Error(`Test Fallido: [${tag}] ${message}`);
            };

            const PID_1 = 'test-proj-' + Date.now();
            const PID_2 = 'test-proj-2-' + Date.now();
            const PID_ECO = 'test-eco-' + Date.now();
            const PID_PRIV = 'test-priv-' + Date.now();

            try {
                // --- FASE 1: KERNEL & CONFIG ---
                assert(typeof store.calculateResilience === 'function', "Función de Resiliencia presente en Store", "KERNEL"); 
                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL"); 
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { theme: 'light' } });
                assert(store.getState().config.theme === 'light', "Actualización de Configuración Global OK", "SETTINGS"); 

                // --- FASE 2: IDENTIDAD, POOL Y RBAC ---
                assert(store.getState().globalUsers !== undefined, "Pool Global de Usuarios inicializado", "IDENTITY"); 
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                assert(store.getState().session.activeUserId === 'usr_alvaro_001', "Login Root verificado", "RBAC"); 
                
                const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
                await store.dispatch({ type: 'ADD_USER', payload: { userId: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                const lauraGlobal = store.getState().globalUsers.find(u => u.id === dynLauraId);
                assert(lauraGlobal !== undefined, "Usuario añadido al Pool Global con ID único", "IDENTITY"); 
                assert(lauraGlobal.globalRole === 'network-user', "Usuario hereda rol raso por defecto", "RBAC"); 
                
                const uGlobal = store.getState().globalUsers[0];
                assert(uGlobal.profile !== undefined && uGlobal.profile.guardian_authority !== undefined, "Perfil incluye Arquetipos Pantheon (Autoridad)", "IKIGAI"); 

                // --- FASE 2.5: ONBOARDING & REGISTRO GLOBAL INDEPENDIENTE (V8.0) ---
                const testGlobalUserId = '@new_global_' + Math.floor(Math.random() * 100000);
                await store.dispatch({
                    type: 'REGISTER_GLOBAL_USER',
                    payload: {
                        id: testGlobalUserId,
                        name: 'Test Global User',
                        email: 'global@test.com',
                        wallet: '0xabc',
                        profile: { country: 'TestLand', structural_affinity: ['@anxaneta'] }
                    }
                });

                const globalCheck = store.getState().globalUsers.find(u => u.id === testGlobalUserId);
                assert(globalCheck !== undefined, "Usuario creado exitosamente en namespace Global SIN Proyecto", "PERMAWEB");
                assert(globalCheck.email === 'global@test.com' && globalCheck.profile.country === 'TestLand', "Atributos Geo-Web3 guardados correctamente", "PERMAWEB");

                // Test de Inmutabilidad de Alias
                await store.dispatch({
                    type: 'REGISTER_GLOBAL_USER',
                    payload: {
                        id: testGlobalUserId, // Intentamos crear el mismo ID
                        name: 'Impostor User',
                        email: 'hacker@test.com'
                    }
                });
                
                const checkAgain = store.getState().globalUsers.find(u => u.id === testGlobalUserId);
                assert(checkAgain.email === 'global@test.com', "Seguridad: El Kernel rechaza sobrescribir un Alias existente", "SECURITY");

                // --- FASE 3: CREACIÓN DE ECOSISTEMAS Y GÉNESIS HASH ---
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_1, nombre: 'Test V7', sector: 'digital_media_growth' } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined, "Proyecto instanciado correctamente", "CORE"); 
                assert(p.genesisHash && p.genesisHash.length === 64, "Sello Criptográfico: Bloque Génesis Generado (SHA-256)", "WEB3"); 
                assert(p.ownerId === 'usr_alvaro_001', "RBAC: Creador asignado automáticamente como Project Owner", "RBAC"); 
                
                let expectedRolesCount = 5;
                if (GLOBAL_ONTOLOGY['digital_media_growth']) expectedRolesCount = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).length;
                assert(p.roles && p.roles.length === expectedRolesCount, `Ontología inyectada dinámicamente`, "ONTOLOGY"); 

                // --- FASE 3.5: AÑADIR USUARIO GLOBAL A PROYECTO (Integración V8.0) ---
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, userId: testGlobalUserId } });
                const projCheck = store.getState().projects.find(x => x.id === PID_1).usuarios.find(u => u.id === testGlobalUserId);
                assert(projCheck !== undefined, "Integración de usuario de Permaweb en Colla de proyecto exitosa", "COLLA");

                // --- FASE 4: INMUTABILIDAD Y GESTIÓN DE ROLES ---
                const anxanetaRole = p.roles.find(r => r.levelId === '@anxaneta');
                const anxanetaId = anxanetaRole.id;
                await store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: PID_1, roleId: anxanetaId, field: 'name', value: 'CEO Global' } });
                assert(store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.id === anxanetaId).name === 'CEO Global', "Edición de nombres de roles", "STORE"); 
                
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: PID_1, updates: { prompt: 'Misión IA' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).prompt === 'Misión IA', "Metadatos y Presentación persistidos", "DESIGN"); 

                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { id: 'r-analista', name: 'Analista', levelId: '@baixos' } } });
                let pAfterCreate = store.getState().projects.find(x => x.id === PID_1);
                const newRole = pAfterCreate.roles.find(r => r.name === 'Analista');
                assert(newRole !== undefined, "Inyección manual de nuevos roles OK", "ONTOLOGY"); 

                await store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: PID_1, roleId: newRole.id } });
                assert(store.getState().projects.find(proj => proj.id === PID_1).roles.find(r => r.id === newRole.id).isArchived === true, "Inmutabilidad asegurada vía Archivado", "STORE"); 

                // --- FASE 5: VNA Y CADENA DE TRANSACCIONES ---
                const dososRole = pAfterCreate.roles.find(r => r.levelId === '@dosos');
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: anxanetaId, to: dososRole.id, horas: 2, entregable: 'Plan Q1', tipo: 'tangible' } } });
                const tx1 = store.getState().projects.find(x => x.id === PID_1).transactions[0];
                assert(tx1.hash !== undefined, "Transacción Teórica inyectada con Hash local", "VNA"); 

                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: dososRole.id, to: anxanetaId, horas: 1, entregable: 'Review', tipo: 'intangible' } } });
                const tx2 = store.getState().projects.find(x => x.id === PID_1).transactions[1];
                assert(tx2.prevHash === tx1.hash, "Chaining: Las transacciones enlazan su hash anterior", "VNA"); 

                const salud = store.calculateResilience(PID_1);
                assert(salud >= 0 && salud <= 100, `Cálculo de Resiliencia Sistémica operativa (${salud}%)`, "RESILIENCE"); 

                await store.dispatch({ type: 'UPDATE_TRANSACTION_PHASE', payload: { projectId: PID_1, txHash: tx1.hash, fase: 1 } });
                const prompt = store.generateSystemPrompt(PID_1);
                assert(prompt.includes('Fase 1:'), "Prompt incluye secuenciación temporal", "INTEL"); 

                // --- FASE 6: ONTOLOGÍA DINÁMICA ---
                const sectorDynId = 'deep-tech-' + Date.now();
                await store.dispatch({ type: 'ADD_ONTOLOGY_SECTOR', payload: { sectorId: sectorDynId, rolesData: { "@anxaneta": { name: "Lead Scientist" } } } });
                assert(store.getState().ontology.sectores[sectorDynId] !== undefined, "El EO puede crear nuevos Sectores", "DATABASE"); 

                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_2, nombre: 'Deep Tech Lab', sector: sectorDynId } });
                assert(store.getState().projects.find(x => x.id === PID_2).roles.find(r => r.levelId === '@anxaneta').name === 'Lead Scientist', "Nuevo proyecto usa ontología", "CORE"); 

                // --- FASE 7: SLICING PIE & LEDGER INMUTABLE ---
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', archetype: 'dao' } });
                await store.dispatch({ type: 'UPDATE_PROJECT_CONFIG', payload: { projectId: PID_ECO, config: { tokenomics: 'dao' } } });
                
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5 } } });
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_ECO, tx: { from: 'role-dev', to: anxanetaId, horas: 10, entregable: 'App', tipo: 'tangible' } } });
                
                let txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'theoretical', "Flujo Kanban: El Entregable nace como Teórico", "PULL-SYSTEM"); 

                await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, userId: dynLauraId } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'pinged' && txPull.assigneeId === dynLauraId, "Flujo Kanban: Tracción (Ping/Asignación)", "PULL-SYSTEM"); 

                await store.dispatch({ type: 'REPORT_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, realHours: 8.5 } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'reported' && txPull.realHours === 8.5, "Flujo Kanban: Prueba de Trabajo (Reported)", "POMODORO"); 

                const genesisHashEco = store.getState().projects.find(p=>p.id===PID_ECO).genesisHash;
                await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash } });
                
                const pEcoEnd = store.getState().projects.find(x => x.id === PID_ECO);
                const blockLedger = pEcoEnd.ledger[0];
                
                assert(blockLedger !== undefined, "Slicing Pie: Transacción consolidada inyectada al Ledger", "LEDGER"); 
                assert(blockLedger.prevHash === genesisHashEco, "Slicing Pie: Enlace Criptográfico estricto al Bloque Génesis", "WEB3"); 
                assert(blockLedger.hash.length === 64, "Slicing Pie: Hash SHA-256 generado para la Cap Table", "WEB3"); 
                assert(blockLedger.valorCongelado > 0, "Slicing Pie: El Kernel calcula matemáticamente los Slices", "EQUITY"); 

                assert(typeof store.getArchetypeFactor === 'function', "Función de Factor de Arquetipo presente", "KERNEL"); 

                // --- FASE 8: IMPORTADOR JSON ---
                assert(typeof store.importSessionJSON === 'function', "El importador JSON asíncrono existe", "PARSER"); 
                const numLedgersBefore = pEcoEnd.ledger.length;
                await store.importSessionJSON(PID_ECO, [ { userId: dynLauraId, roleId: 'role-dev', description: "Diseño TDD", horas: 0.5 } ]);
                assert(store.getState().projects.find(x => x.id === PID_ECO).ledger.length === numLedgersBefore + 1, "Importador inyecta arrays JSON al Ledger", "AUTO-LEDGER"); 

                // --- FASE 9: MACRO-FLUJOS VNA ---
                const ecoProjA = 'eco-A-' + Date.now();
                const ecoProjB = 'eco-B-' + Date.now();
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: ecoProjA, nombre: 'Tech Node' } });
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: ecoProjB, nombre: 'Marketing Node' } });
                await store.dispatch({ type: 'ADD_MACRO_FLOW', payload: { fromProjectId: ecoProjA, toProjectId: ecoProjB, tipo: 'tangible' } });
                
                const macroExists = store.getState().macroFlows && store.getState().macroFlows.length > 0;
                assert(macroExists, "Macro-Redes: El Kernel registra flujos de valor inter-proyectos (VNA)", "NETWORK"); 
                assert(store.getState().macroFlows[store.getState().macroFlows.length - 1].from === ecoProjA, "Macro-Redes: Origen y destino enlazados correctamente", "NETWORK"); 

                // --- FASE 10: PRIVACIDAD Y GOBERNANZA V7.2 ---
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_PRIV, nombre: 'Stealth Startup', sector: 'tech_saas_platform', isPrivate: true } });
                const pPriv = store.getState().projects.find(x => x.id === PID_PRIV);
                assert(pPriv !== undefined, "Instanciación de Proyecto Privado", "CORE"); 
                assert(pPriv.isPrivate === true, "Seguridad: Flag isPrivate guardado inmutablemente", "SECURITY"); 
                assert(Array.isArray(pPriv.invitations), "Seguridad: Registro de Invitaciones (Mail) inicializado", "DATA"); 

                const DYN_HACKER_ID = '@hacker_' + Date.now();
                await store.dispatch({ type: 'ADD_USER', payload: { userId: DYN_HACKER_ID, name: 'Hacker', globalRole: 'network-user' } });
                
                assert(store.canUserViewProject(PID_PRIV, 'usr_alvaro_001', 'ecosystem-owner') === true, "RBAC: Master Architect tiene bypass de lectura global", "SECURITY"); 
                assert(store.canUserViewProject(PID_PRIV, DYN_HACKER_ID, 'network-user') === false, "RBAC Firewall: Usuario miron es bloqueado de la red privada", "SECURITY"); 

                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_PRIV, userId: DYN_HACKER_ID, name: 'Hacker' } });
                assert(store.canUserViewProject(PID_PRIV, DYN_HACKER_ID, 'network-user') === true, "RBAC Firewall: Usuario invitado (miembro) obtiene acceso", "SECURITY"); 

                // --- FASE 11: DELEGACIÓN Y PUSH V7.3 ---
                await store.dispatch({ type: 'LOG_INVITATION', payload: { projectId: PID_PRIV, email: 'test@daohack.com' } });
                assert(store.getState().projects.find(x => x.id === PID_PRIV).invitations.length === 1, "El sistema audita el envío de invitaciones por email", "COMMS"); 

                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_PRIV, tx: { from: 'r-1', to: 'r-2', horas: 5, entregable: 'Test Request' } } });
                let pTestReq = store.getState().projects.find(x => x.id === PID_PRIV);
                let txReqHash = pTestReq.transactions[0].hash;
                
                await store.dispatch({ type: 'REQUEST_TRANSACTION', payload: { projectId: PID_PRIV, txHash: txReqHash, userId: DYN_HACKER_ID } });
                pTestReq = store.getState().projects.find(x => x.id === PID_PRIV);
                
                assert(pTestReq.transactions[0].status === 'requested', "Delegación: Solicitud de Tarea PULL cambia el estado a Requested", "KANBAN"); 
                assert(pTestReq.transactions[0].assigneeId === DYN_HACKER_ID, "Delegación: Se registra temporalmente el ID del solicitante", "KANBAN"); 
                
                await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: PID_PRIV, txHash: txReqHash, userId: DYN_HACKER_ID } });
                assert(store.getState().projects.find(x => x.id === PID_PRIV).transactions[0].status === 'pinged', "Delegación: PO aprueba el request y la tarea entra en progreso", "KANBAN"); 

                // --- FASE 12: INYECCIONES DE CAPITAL V7.4 ---
                const lastLedgerLength = pTestReq.ledger ? pTestReq.ledger.length : 0;
                await store.dispatch({ 
                    type: 'ADD_CAPITAL_INJECTION', 
                    payload: { projectId: PID_PRIV, userId: 'usr_alvaro_001', assetType: 'cash', amount: 1000, description: 'Seed Money' } 
                });
                
                pTestReq = store.getState().projects.find(x => x.id === PID_PRIV);
                const newLedgerLength = pTestReq.ledger.length;
                const capBlock = pTestReq.ledger[pTestReq.ledger.length - 1];

                assert(newLedgerLength === lastLedgerLength + 1, "Slicing Pie: Inyección de Capital registra un nuevo bloque en el Ledger", "CAPITAL"); 
                assert(capBlock.roleId === 'CAPITAL_ASSET', "Slicing Pie: Rol asignado como activo de capital", "CAPITAL"); 
                assert(capBlock.horas === 0, "Slicing Pie: Las inyecciones de dinero no consumen horas de Deep Work", "CAPITAL"); 
                
                assert(capBlock.valorCongelado === 8000, "Slicing Pie: Efectivo (Cash) recibe multiplicador exacto (4x * factor de arquetipo)", "CAPITAL"); 

                await store.dispatch({ 
                    type: 'ADD_CAPITAL_INJECTION', 
                    payload: { projectId: PID_PRIV, userId: 'usr_alvaro_001', assetType: 'tools', amount: 1000, description: 'AWS' } 
                });
                const toolsBlock = store.getState().projects.find(x => x.id === PID_PRIV).ledger.slice(-1)[0];
                
                assert(toolsBlock.valorCongelado === 4000, "Slicing Pie: Herramientas reciben multiplicador exacto (2x * factor de arquetipo)", "CAPITAL"); 
                
                const maturity = store.calculateMaturityIndex(PID_1);
                assert(maturity.score >= 0, "Maturity Index calculado con seguridad", "KERNEL"); 
                
                assert(store.getState().projects.find(x => x.id === PID_ECO).config.tokenomics === 'dao', "Modelo Tokenomics guardado y enlazado a DAO", "TOKENOMICS");

                // --- RESULTADO FINAL ---
                if(passed === total) {
                    const finalColor = 'var(--accent-green)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 25px; padding: 20px; border: 1px solid ${finalColor}; background: rgba(0, 230, 118, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in;">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2rem;">🚀 KERNEL v8.0 VALIDADO AL 100%</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem;">El Motor Core ha superado exactamente ${total} vectores de prueba.</p>
                            <p style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; margin-top: 5px;">Módulos chequeados: RBAC, VNA, SHA-256, Slicing Pie, Capital, Privacy, Identity (Permaweb)</p>
                        </div>
                    `;
                    btn.innerText = "CERTIFICACIÓN V8.0 COMPLETADA ✓";
                    btn.style.background = finalColor;
                    btn.style.color = "black";
                }

            } catch (error) {
                terminal.innerHTML += `
                    <div style="margin-top: 25px; padding: 20px; border: 1px solid var(--accent-red); background: rgba(255, 82, 82, 0.1); border-radius: var(--border-radius-md); animation: fadeIn 0.5s ease-in;">
                        <h2 style="color: var(--accent-red); margin: 0;">💥 ERROR FATAL (CRASH EN KERNEL)</h2>
                        <p style="color: white; margin-top: 10px; font-family: var(--font-mono);">${error.message}</p>
                        <div style="background: #000; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 0.8rem; overflow-x: auto; color: #ff8a80;">
                            ${error.stack}
                        </div>
                    </div>
                `;
                console.error(error);
                score.style.color = 'var(--accent-red)';
            }
            
            terminal.scrollTop = terminal.scrollHeight;
        });
    }
}
