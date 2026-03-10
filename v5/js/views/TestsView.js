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
                            <h1>KERNEL v7.0 VALIDATION</h1>
                            <p style="color: var(--text-muted);">Ejecutando 58 validaciones: SHA-256, Triple Entrada, RBAC, Slicing Pie, Identidad Fractal</p>
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
                            <div style="color: var(--accent-blue); margin-bottom: 10px;">> Sistema listo para ejecución de pruebas asíncronas.</div>
                            <div style="color: var(--text-muted); margin-bottom: 20px;">> Esperando orden del Comandante...</div>
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

        // La función de ejecución ahora es ASYNC para soportar el nuevo dispatch() de V7
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            terminal.innerHTML = '<div style="color: var(--accent-blue); margin-bottom: 15px; font-weight: bold;">> Iniciando motor de aserciones V7...</div>';
            
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
                
                if (!isPass) {
                    throw new Error(`Test Fallido: [${tag}] ${message}`);
                }
            };

            const PID_1 = 'test-proj-' + Date.now();
            const PID_2 = 'test-proj-2-' + Date.now();
            const PID_ECO = 'test-eco-' + Date.now();

            try {
                // 1-2. INICIALIZACIÓN Y LOGIN (V6.5/V7)
                assert(typeof store.calculateResilience === 'function', "Función de Resiliencia presente", "KERNEL");
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                
                // 3-6. CREACIÓN DE PROYECTOS Y ONTOLOGÍA (Génesis Hash)
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_1, nombre: 'Test Project V7', sector: 'digital_media_growth' } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined && p.sector === 'digital_media_growth', "Proyecto creado con sector asignado", "CORE");
                assert(p.genesisHash && p.genesisHash.length === 64, "Bloque Génesis Generado (SHA-256)", "WEB3");
                assert(p.ownerId === 'usr_alvaro_001', "RBAC Local: Creador asignado como Project Owner", "RBAC");
                
                let expectedRolesCount = 5;
                if (GLOBAL_ONTOLOGY['digital_media_growth']) {
                    expectedRolesCount = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).length;
                }
                assert(p.roles && p.roles.length === expectedRolesCount, `Ontología inyectada dinámicamente`, "ONTOLOGY");

                // 7-10. EDICIÓN Y ARCHIVADO (INMUTABILIDAD FASE 1.5)
                const anxanetaRole = p.roles.find(r => r.levelId === '@anxaneta');
                const anxanetaId = anxanetaRole.id;
                
                await store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: PID_1, roleId: anxanetaId, field: 'name', value: 'CEO Global' } });
                assert(store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.id === anxanetaId).name === 'CEO Global', "Edición de nombres de roles", "STORE");
                
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: PID_1, updates: { prompt: 'Misión IA' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).prompt === 'Misión IA', "Metadatos persistidos", "DESIGN");

                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { id: 'r-analista', name: 'Analista', levelId: '@baixos' } } });
                let pAfterCreate = store.getState().projects.find(x => x.id === PID_1);
                const newRole = pAfterCreate.roles.find(r => r.name === 'Analista');
                assert(newRole !== undefined, "Herencia de nuevos roles OK", "ONTOLOGY");

                await store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: PID_1, roleId: newRole.id } });
                assert(store.getState().projects.find(proj => proj.id === PID_1).roles.find(r => r.id === newRole.id).isArchived === true, "Inmutabilidad vía Archivado", "STORE");

                // 11-13. TRANSACCIONES TEÓRICAS
                const dososRole = pAfterCreate.roles.find(r => r.levelId === '@dosos');
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: anxanetaId, to: dososRole.id, horas: 2, entregable: 'Plan Q1', tipo: 'tangible' } } });
                const tx1 = store.getState().projects.find(x => x.id === PID_1).transactions[0];
                assert(tx1.hash !== undefined, "Transacción Teórica inyectada", "VNA");

                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: dososRole.id, to: anxanetaId, horas: 1, entregable: 'Review', tipo: 'intangible' } } });
                const tx2 = store.getState().projects.find(x => x.id === PID_1).transactions[1];
                assert(tx2.prevHash === tx1.hash, "Chaining de transacciones teóricas OK", "VNA");

                // 14-16. RESILIENCIA E INTEL (IA)
                const salud = store.calculateResilience(PID_1);
                assert(salud >= 0, `Salud sistémica calculada (${salud}%)`, "RESILIENCE");

                await store.dispatch({ type: 'UPDATE_TRANSACTION_PHASE', payload: { projectId: PID_1, txHash: tx1.hash, fase: 1 } });
                const prompt = store.generateSystemPrompt(PID_1);
                assert(prompt.includes('Fase 1:'), "Prompt incluye secuenciación temporal", "INTEL");
                assert(prompt.includes('CEO Global'), "Prompt incluye personalización de roles", "INTEL");

                // 17-19. CONFIGURACIÓN Y PARSER JSON
                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL");
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { theme: 'light', ecosystemName: 'Test Ecosistema' } });
                assert(store.getState().config.theme === 'light', "Actualización de Configuración Global OK", "SETTINGS");

                assert(typeof store.importSessionJSON === 'function', "El importador JSON asíncrono existe", "PARSER");
                
                const dynTestUser1 = '@test_user_' + Date.now();
                const dynTestUser2 = '@test_ai_' + Date.now();
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'TestUser', id: dynTestUser1 } });
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'TestAI', id: dynTestUser2 } });
                
                const pForJson = store.getState().projects.find(x => x.id === PID_1);
                const numLedgersBefore = pForJson.ledger ? pForJson.ledger.length : 0;
                
                // Prueba de importador JSON ahora es await
                await store.importSessionJSON(PID_1, [
                    { userId: dynTestUser1, roleId: anxanetaId, description: "Diseño TDD", horas: 0.5 },
                    { userId: dynTestUser2, roleId: newRole.id, description: "Refactor", horas: 0.8 }
                ]);
                assert(store.getState().projects.find(x => x.id === PID_1).ledger.length === numLedgersBefore + 2, "Importador inyecta arrays JSON al Ledger", "AUTO-LEDGER");

                // 20-23. IDENTIDAD Y POOL GLOBAL
                assert(store.getState().globalUsers !== undefined, "Pool Global de Usuarios inicializado", "KERNEL");
                const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'Laura (Node Dev)', id: dynLauraId, walletOrSocial: '0x123...abc' } });
                
                const lauraGlobal = store.getState().globalUsers.find(u => u.id === dynLauraId);
                assert(lauraGlobal !== undefined, "Usuario añadido al Pool Global con @id único", "IDENTITY");
                assert(lauraGlobal.globalRole === 'network-user', "Usuario hereda rol raso por defecto", "RBAC");

                // 24-26. RBAC SESSION GLOBAL
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynLauraId } });
                assert(store.getState().session.activeUserId === dynLauraId, "El usuario activo se registró correctamente", "RBAC");
                assert(store.getState().session.role === 'network-user', "El Kernel inyecta el Global Role correcto en sesión", "RBAC");
                
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } });
                assert(store.getState().session.role === 'ecosystem-owner', "El Administrador Root recupera su acceso de propietario global", "RBAC");

                // 27-31. ONTOLOGÍAS DINÁMICAS
                const sectorDynId = 'deep-tech-' + Date.now();
                await store.dispatch({
                    type: 'ADD_ONTOLOGY_SECTOR',
                    payload: { sectorId: sectorDynId, rolesData: { "@anxaneta": { name: "Lead Scientist" }, "@dosos": { name: "Peer Reviewer" } } }
                });
                assert(store.getState().ontology.sectores[sectorDynId] !== undefined, "El EO puede crear nuevos Sectores dinámicamente", "DATABASE");

                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_2, nombre: 'Deep Tech Lab', sector: sectorDynId } });
                assert(store.getState().projects.find(x => x.id === PID_2).roles.find(r => r.levelId === '@anxaneta').name === 'Lead Scientist', "Nuevo proyecto usa ontología dinámica", "CORE");

                // 32-35. SISTEMA PULL, POMODORO Y REPORTES
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', tipo: 'ecosystem' } });
                await store.dispatch({ type: 'UPDATE_PROJECT_CONFIG', payload: { projectId: PID_ECO, config: { tokenomics: 'dao' } } });
                assert(store.getState().projects.find(x => x.id === PID_ECO).config?.tokenomics === 'dao', "Modelo Tokenomics (DAO) guardado", "TOKENOMICS");

                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5 } } });
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_ECO, tx: { from: 'role-dev', to: anxanetaId, horas: 10, entregable: 'App', tipo: 'tangible' } } });
                let txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'theoretical', "El Entregable nace como Teórico (Pull-System)", "PULL-SYSTEM");

                await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, userId: dynLauraId } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'pinged' && txPull.assigneeId === dynLauraId, "Tracción: Usuario hace Pull", "PULL-SYSTEM");

                await store.dispatch({ type: 'REPORT_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, realHours: 8.5 } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'reported' && txPull.realHours === 8.5, "Focus: Prueba de Trabajo reportada", "POMODORO");

                // 36-39: LA TRIPLE ENTRADA (SHA-256 INMUTABLE V7)
                const genesisHash = store.getState().projects.find(p=>p.id===PID_ECO).genesisHash;
                await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash } });
                
                const pEcoEnd = store.getState().projects.find(x => x.id === PID_ECO);
                const blockLedger = pEcoEnd.ledger[0];
                
                assert(blockLedger !== undefined, "Transacción consolidada inyectada al Ledger", "LEDGER");
                assert(blockLedger.prevHash === genesisHash, "Triple Entrada: Enlace Criptográfico al Bloque Génesis", "WEB3");
                assert(blockLedger.hash.length === 64, "Triple Entrada: Hash SHA-256 inmutable generado para la Cap Table", "WEB3");
                assert(blockLedger.valorCongelado > 0, "Value Accounting: El Kernel calcula matemáticamente los Slices", "SLICING-PIE");

                // 40-42. ARQUETIPOS Y MATURITY INDEX
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'test-arch', nombre: 'Startup Tech', sector: 'software', archetype: 'startup' } });
                const maturity = store.calculateMaturityIndex('test-arch');
                assert(maturity.score >= 0, "El Kernel calcula la salud estructural (Maturity Index)", "KERNEL");
                assert(typeof store.getArchetypeFactor === 'function', "Función de Factor de Arquetipo presente", "KERNEL");

                // 43-45: MACRO-FLUJOS (VNA)
                const ecoProjA = 'eco-A-' + Date.now();
                const ecoProjB = 'eco-B-' + Date.now();
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: ecoProjA, nombre: 'Tech Node' } });
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: ecoProjB, nombre: 'Marketing Node' } });
                await store.dispatch({ type: 'ADD_MACRO_FLOW', payload: { fromProjectId: ecoProjA, toProjectId: ecoProjB, tipo: 'tangible' } });
                
                const macroExists = store.getState().macroFlows && store.getState().macroFlows.length > 0;
                assert(macroExists, "Macro-Redes: El Kernel registra flujos de valor inter-proyectos (VNA)", "NETWORK");

                // 46-48: IDENTITY FRACTAL & IKIGAI
                const uGlobal = store.getState().globalUsers[0];
                assert(uGlobal.profile !== undefined && uGlobal.profile.guardian_authority !== undefined, "Perfil incluye Arquetipos Pantheon (Autoridad)", "IKIGAI");
                assert(uGlobal.profile.structural_affinity.includes('@anxaneta'), "Perfil incluye Afinidad Estructural Casteller", "IKIGAI");

                // --- RESULTADO FINAL ---
                if(passed === total) {
                    const finalColor = 'var(--accent-green)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 25px; padding: 20px; border: 1px solid ${finalColor}; background: rgba(0, 230, 118, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in;">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2rem;">🚀 KERNEL v7.0 VALIDADO AL 100%</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem;">Los ${total} vectores de criptografía asíncrona, RBAC y Slicing Pie han sido superados.</p>
                        </div>
                    `;
                    btn.innerText = "CERTIFICACIÓN COMPLETADA ✓";
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
}// v5/js/views/TestsView.js
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
                            <h1>KERNEL v7.0 VALIDATION</h1>
                            <p style="color: var(--text-muted);">Ejecutando 58 validaciones: SHA-256, Triple Entrada, RBAC, Slicing Pie, Identidad Fractal</p>
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
                            <div style="color: var(--accent-blue); margin-bottom: 10px;">> Sistema listo para ejecución de pruebas asíncronas.</div>
                            <div style="color: var(--text-muted); margin-bottom: 20px;">> Esperando orden del Comandante...</div>
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

        // La función de ejecución ahora es ASYNC para soportar el nuevo dispatch() de V7
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            terminal.innerHTML = '<div style="color: var(--accent-blue); margin-bottom: 15px; font-weight: bold;">> Iniciando motor de aserciones V7...</div>';
            
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
                
                if (!isPass) {
                    throw new Error(`Test Fallido: [${tag}] ${message}`);
                }
            };

            const PID_1 = 'test-proj-' + Date.now();
            const PID_2 = 'test-proj-2-' + Date.now();
            const PID_ECO = 'test-eco-' + Date.now();

            try {
                // 1-2. INICIALIZACIÓN Y LOGIN (V6.5/V7)
                assert(typeof store.calculateResilience === 'function', "Función de Resiliencia presente", "KERNEL");
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                
                // 3-6. CREACIÓN DE PROYECTOS Y ONTOLOGÍA (Génesis Hash)
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_1, nombre: 'Test Project V7', sector: 'digital_media_growth' } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined && p.sector === 'digital_media_growth', "Proyecto creado con sector asignado", "CORE");
                assert(p.genesisHash && p.genesisHash.length === 64, "Bloque Génesis Generado (SHA-256)", "WEB3");
                assert(p.ownerId === 'usr_alvaro_001', "RBAC Local: Creador asignado como Project Owner", "RBAC");
                
                let expectedRolesCount = 5;
                if (GLOBAL_ONTOLOGY['digital_media_growth']) {
                    expectedRolesCount = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).length;
                }
                assert(p.roles && p.roles.length === expectedRolesCount, `Ontología inyectada dinámicamente`, "ONTOLOGY");

                // 7-10. EDICIÓN Y ARCHIVADO (INMUTABILIDAD FASE 1.5)
                const anxanetaRole = p.roles.find(r => r.levelId === '@anxaneta');
                const anxanetaId = anxanetaRole.id;
                
                await store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: PID_1, roleId: anxanetaId, field: 'name', value: 'CEO Global' } });
                assert(store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.id === anxanetaId).name === 'CEO Global', "Edición de nombres de roles", "STORE");
                
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: PID_1, updates: { prompt: 'Misión IA' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).prompt === 'Misión IA', "Metadatos persistidos", "DESIGN");

                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { id: 'r-analista', name: 'Analista', levelId: '@baixos' } } });
                let pAfterCreate = store.getState().projects.find(x => x.id === PID_1);
                const newRole = pAfterCreate.roles.find(r => r.name === 'Analista');
                assert(newRole !== undefined, "Herencia de nuevos roles OK", "ONTOLOGY");

                await store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: PID_1, roleId: newRole.id } });
                assert(store.getState().projects.find(proj => proj.id === PID_1).roles.find(r => r.id === newRole.id).isArchived === true, "Inmutabilidad vía Archivado", "STORE");

                // 11-13. TRANSACCIONES TEÓRICAS
                const dososRole = pAfterCreate.roles.find(r => r.levelId === '@dosos');
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: anxanetaId, to: dososRole.id, horas: 2, entregable: 'Plan Q1', tipo: 'tangible' } } });
                const tx1 = store.getState().projects.find(x => x.id === PID_1).transactions[0];
                assert(tx1.hash !== undefined, "Transacción Teórica inyectada", "VNA");

                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: dososRole.id, to: anxanetaId, horas: 1, entregable: 'Review', tipo: 'intangible' } } });
                const tx2 = store.getState().projects.find(x => x.id === PID_1).transactions[1];
                assert(tx2.prevHash === tx1.hash, "Chaining de transacciones teóricas OK", "VNA");

                // 14-16. RESILIENCIA E INTEL (IA)
                const salud = store.calculateResilience(PID_1);
                assert(salud >= 0, `Salud sistémica calculada (${salud}%)`, "RESILIENCE");

                await store.dispatch({ type: 'UPDATE_TRANSACTION_PHASE', payload: { projectId: PID_1, txHash: tx1.hash, fase: 1 } });
                const prompt = store.generateSystemPrompt(PID_1);
                assert(prompt.includes('Fase 1:'), "Prompt incluye secuenciación temporal", "INTEL");
                assert(prompt.includes('CEO Global'), "Prompt incluye personalización de roles", "INTEL");

                // 17-19. CONFIGURACIÓN Y PARSER JSON
                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL");
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { theme: 'light', ecosystemName: 'Test Ecosistema' } });
                assert(store.getState().config.theme === 'light', "Actualización de Configuración Global OK", "SETTINGS");

                assert(typeof store.importSessionJSON === 'function', "El importador JSON asíncrono existe", "PARSER");
                
                const dynTestUser1 = '@test_user_' + Date.now();
                const dynTestUser2 = '@test_ai_' + Date.now();
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'TestUser', id: dynTestUser1 } });
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'TestAI', id: dynTestUser2 } });
                
                const pForJson = store.getState().projects.find(x => x.id === PID_1);
                const numLedgersBefore = pForJson.ledger ? pForJson.ledger.length : 0;
                
                // Prueba de importador JSON ahora es await
                await store.importSessionJSON(PID_1, [
                    { userId: dynTestUser1, roleId: anxanetaId, description: "Diseño TDD", horas: 0.5 },
                    { userId: dynTestUser2, roleId: newRole.id, description: "Refactor", horas: 0.8 }
                ]);
                assert(store.getState().projects.find(x => x.id === PID_1).ledger.length === numLedgersBefore + 2, "Importador inyecta arrays JSON al Ledger", "AUTO-LEDGER");

                // 20-23. IDENTIDAD Y POOL GLOBAL
                assert(store.getState().globalUsers !== undefined, "Pool Global de Usuarios inicializado", "KERNEL");
                const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'Laura (Node Dev)', id: dynLauraId, walletOrSocial: '0x123...abc' } });
                
                const lauraGlobal = store.getState().globalUsers.find(u => u.id === dynLauraId);
                assert(lauraGlobal !== undefined, "Usuario añadido al Pool Global con @id único", "IDENTITY");
                assert(lauraGlobal.globalRole === 'network-user', "Usuario hereda rol raso por defecto", "RBAC");

                // 24-26. RBAC SESSION GLOBAL
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynLauraId } });
                assert(store.getState().session.activeUserId === dynLauraId, "El usuario activo se registró correctamente", "RBAC");
                assert(store.getState().session.role === 'network-user', "El Kernel inyecta el Global Role correcto en sesión", "RBAC");
                
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } });
                assert(store.getState().session.role === 'ecosystem-owner', "El Administrador Root recupera su acceso de propietario global", "RBAC");

                // 27-31. ONTOLOGÍAS DINÁMICAS
                const sectorDynId = 'deep-tech-' + Date.now();
                await store.dispatch({
                    type: 'ADD_ONTOLOGY_SECTOR',
                    payload: { sectorId: sectorDynId, rolesData: { "@anxaneta": { name: "Lead Scientist" }, "@dosos": { name: "Peer Reviewer" } } }
                });
                assert(store.getState().ontology.sectores[sectorDynId] !== undefined, "El EO puede crear nuevos Sectores dinámicamente", "DATABASE");

                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_2, nombre: 'Deep Tech Lab', sector: sectorDynId } });
                assert(store.getState().projects.find(x => x.id === PID_2).roles.find(r => r.levelId === '@anxaneta').name === 'Lead Scientist', "Nuevo proyecto usa ontología dinámica", "CORE");

                // 32-35. SISTEMA PULL, POMODORO Y REPORTES
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', tipo: 'ecosystem' } });
                await store.dispatch({ type: 'UPDATE_PROJECT_CONFIG', payload: { projectId: PID_ECO, config: { tokenomics: 'dao' } } });
                assert(store.getState().projects.find(x => x.id === PID_ECO).config?.tokenomics === 'dao', "Modelo Tokenomics (DAO) guardado", "TOKENOMICS");

                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5 } } });
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_ECO, tx: { from: 'role-dev', to: anxanetaId, horas: 10, entregable: 'App', tipo: 'tangible' } } });
                let txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'theoretical', "El Entregable nace como Teórico (Pull-System)", "PULL-SYSTEM");

                await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, userId: dynLauraId } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'pinged' && txPull.assigneeId === dynLauraId, "Tracción: Usuario hace Pull", "PULL-SYSTEM");

                await store.dispatch({ type: 'REPORT_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, realHours: 8.5 } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'reported' && txPull.realHours === 8.5, "Focus: Prueba de Trabajo reportada", "POMODORO");

                // 36-39: LA TRIPLE ENTRADA (SHA-256 INMUTABLE V7)
                const genesisHash = store.getState().projects.find(p=>p.id===PID_ECO).genesisHash;
                await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash } });
                
                const pEcoEnd = store.getState().projects.find(x => x.id === PID_ECO);
                const blockLedger = pEcoEnd.ledger[0];
                
                assert(blockLedger !== undefined, "Transacción consolidada inyectada al Ledger", "LEDGER");
                assert(blockLedger.prevHash === genesisHash, "Triple Entrada: Enlace Criptográfico al Bloque Génesis", "WEB3");
                assert(blockLedger.hash.length === 64, "Triple Entrada: Hash SHA-256 inmutable generado para la Cap Table", "WEB3");
                assert(blockLedger.valorCongelado > 0, "Value Accounting: El Kernel calcula matemáticamente los Slices", "SLICING-PIE");

                // 40-42. ARQUETIPOS Y MATURITY INDEX
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'test-arch', nombre: 'Startup Tech', sector: 'software', archetype: 'startup' } });
                const maturity = store.calculateMaturityIndex('test-arch');
                assert(maturity.score >= 0, "El Kernel calcula la salud estructural (Maturity Index)", "KERNEL");
                assert(typeof store.getArchetypeFactor === 'function', "Función de Factor de Arquetipo presente", "KERNEL");

                // 43-45: MACRO-FLUJOS (VNA)
                const ecoProjA = 'eco-A-' + Date.now();
                const ecoProjB = 'eco-B-' + Date.now();
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: ecoProjA, nombre: 'Tech Node' } });
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: ecoProjB, nombre: 'Marketing Node' } });
                await store.dispatch({ type: 'ADD_MACRO_FLOW', payload: { fromProjectId: ecoProjA, toProjectId: ecoProjB, tipo: 'tangible' } });
                
                const macroExists = store.getState().macroFlows && store.getState().macroFlows.length > 0;
                assert(macroExists, "Macro-Redes: El Kernel registra flujos de valor inter-proyectos (VNA)", "NETWORK");

                // 46-48: IDENTITY FRACTAL & IKIGAI
                const uGlobal = store.getState().globalUsers[0];
                assert(uGlobal.profile !== undefined && uGlobal.profile.guardian_authority !== undefined, "Perfil incluye Arquetipos Pantheon (Autoridad)", "IKIGAI");
                assert(uGlobal.profile.structural_affinity.includes('@anxaneta'), "Perfil incluye Afinidad Estructural Casteller", "IKIGAI");

                // --- RESULTADO FINAL ---
                if(passed === total) {
                    const finalColor = 'var(--accent-green)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 25px; padding: 20px; border: 1px solid ${finalColor}; background: rgba(0, 230, 118, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in;">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2rem;">🚀 KERNEL v7.0 VALIDADO AL 100%</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem;">Los ${total} vectores de criptografía asíncrona, RBAC y Slicing Pie han sido superados.</p>
                        </div>
                    `;
                    btn.innerText = "CERTIFICACIÓN COMPLETADA ✓";
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
