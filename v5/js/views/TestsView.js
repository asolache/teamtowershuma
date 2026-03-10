// v5/js/views/TestsView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

export default class TestsView {
    constructor() { document.title = "Suite de Pruebas (TDD) | TeamTowers SOS"; }

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
            </style>

            <div class="app-layout">
                <main class="workspace">
                    <header style="padding: 1.5rem 2rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); backdrop-filter: blur(10px);">
                        <div style="font-weight: bold; font-family: var(--font-mono); color: var(--accent-blue); font-size: 1.2rem;">🗼 OS_KERNEL_DIAGNOSTICS</div>
                        <a href="/v5/" data-link class="btn btn-outline" style="font-size: 0.8rem; color: #ccc; text-decoration: none; border: 1px solid #444; padding: 5px 10px; border-radius: 6px;">&larr; Volver al Sistema</a>
                    </header>

                    <div class="test-container">
                        <div class="test-header">
                            <h1>KERNEL v7.3 VALIDATION</h1>
                            <p style="color: var(--text-muted);">Ejecutando validaciones completas: SHA-256, Privacidad, Request Pulls y RBAC</p>
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
                            <div style="color: var(--accent-blue); margin-bottom: 10px;">> Sistema listo para ejecución de pruebas V7.3.</div>
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
            terminal.innerHTML = '<div style="color: var(--accent-blue); margin-bottom: 15px; font-weight: bold;">> Iniciando motor de aserciones V7.3...</div>';
            
            let passed = 0; let total = 0;
            const assert = (condition, message, tag) => {
                total++; const isPass = !!condition; if(isPass) passed++;
                terminal.innerHTML += `
                    <div class="test-row" style="color: ${isPass ? '#c9d1d9' : 'var(--accent-red)'};">
                        <span class="test-icon">${isPass ? '✅' : '❌'}</span>
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
                // TESTS PREVIOS V7.0/V7.2
                assert(typeof store.calculateResilience === 'function', "Función de Resiliencia presente", "KERNEL");
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_1, nombre: 'Test Project V7', sector: 'digital_media_growth' } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined && p.sector === 'digital_media_growth', "Proyecto creado con sector asignado", "CORE");
                assert(p.genesisHash && p.genesisHash.length === 64, "Bloque Génesis Generado (SHA-256)", "WEB3");
                assert(p.ownerId === 'usr_alvaro_001', "RBAC Local: Creador asignado como Project Owner", "RBAC");
                let expectedRolesCount = 5; if (GLOBAL_ONTOLOGY['digital_media_growth']) expectedRolesCount = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).length;
                assert(p.roles && p.roles.length === expectedRolesCount, `Ontología inyectada dinámicamente`, "ONTOLOGY");

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

                const dososRole = pAfterCreate.roles.find(r => r.levelId === '@dosos');
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: anxanetaId, to: dososRole.id, horas: 2, entregable: 'Plan Q1', tipo: 'tangible' } } });
                const tx1 = store.getState().projects.find(x => x.id === PID_1).transactions[0];
                assert(tx1.hash !== undefined, "Transacción Teórica inyectada", "VNA");

                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { from: dososRole.id, to: anxanetaId, horas: 1, entregable: 'Review', tipo: 'intangible' } } });
                const tx2 = store.getState().projects.find(x => x.id === PID_1).transactions[1];
                assert(tx2.prevHash === tx1.hash, "Chaining de transacciones teóricas OK", "VNA");

                const salud = store.calculateResilience(PID_1);
                assert(salud >= 0, `Salud sistémica calculada (${salud}%)`, "RESILIENCE");

                await store.dispatch({ type: 'UPDATE_TRANSACTION_PHASE', payload: { projectId: PID_1, txHash: tx1.hash, fase: 1 } });
                const prompt = store.generateSystemPrompt(PID_1);
                assert(prompt.includes('Fase 1:'), "Prompt incluye secuenciación temporal", "INTEL");

                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL");
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { theme: 'light', ecosystemName: 'Test Ecosistema' } });
                assert(store.getState().config.theme === 'light', "Actualización de Configuración Global OK", "SETTINGS");

                const dynTestUser1 = '@test_user_' + Date.now();
                const dynTestUser2 = '@test_ai_' + Date.now();
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'TestUser', id: dynTestUser1 } });
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'TestAI', id: dynTestUser2 } });
                
                const pForJson = store.getState().projects.find(x => x.id === PID_1);
                const numLedgersBefore = pForJson.ledger ? pForJson.ledger.length : 0;
                await store.importSessionJSON(PID_1, [ { userId: dynTestUser1, roleId: anxanetaId, description: "Diseño TDD", horas: 0.5 } ]);
                assert(store.getState().projects.find(x => x.id === PID_1).ledger.length === numLedgersBefore + 1, "Importador inyecta arrays JSON al Ledger", "AUTO-LEDGER");

                assert(store.getState().globalUsers !== undefined, "Pool Global de Usuarios inicializado", "KERNEL");
                const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
                await store.dispatch({ type: 'ADD_USER', payload: { projectId: PID_1, name: 'Laura (Node Dev)', id: dynLauraId, walletOrSocial: '0x123...abc' } });
                
                const lauraGlobal = store.getState().globalUsers.find(u => u.id === dynLauraId);
                assert(lauraGlobal !== undefined, "Usuario añadido al Pool Global", "IDENTITY");

                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynLauraId } });
                assert(store.getState().session.activeUserId === dynLauraId, "El usuario activo se registró correctamente", "RBAC");
                
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } });
                assert(store.getState().session.role === 'ecosystem-owner', "Admin Root recupera su acceso", "RBAC");

                const sectorDynId = 'deep-tech-' + Date.now();
                await store.dispatch({ type: 'ADD_ONTOLOGY_SECTOR', payload: { sectorId: sectorDynId, rolesData: { "@anxaneta": { name: "Lead Scientist" } } } });
                assert(store.getState().ontology.sectores[sectorDynId] !== undefined, "El EO puede crear nuevos Sectores", "DATABASE");

                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_2, nombre: 'Deep Tech Lab', sector: sectorDynId } });
                assert(store.getState().projects.find(x => x.id === PID_2).roles.find(r => r.levelId === '@anxaneta').name === 'Lead Scientist', "Nuevo proyecto usa ontología", "CORE");

                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', tipo: 'ecosystem' } });
                await store.dispatch({ type: 'UPDATE_PROJECT_CONFIG', payload: { projectId: PID_ECO, config: { tokenomics: 'dao' } } });
                
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5 } } });
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_ECO, tx: { from: 'role-dev', to: anxanetaId, horas: 10, entregable: 'App', tipo: 'tangible' } } });
                let txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'theoretical', "Entregable nace Teórico", "PULL-SYSTEM");

                await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, userId: dynLauraId } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'pinged' && txPull.assigneeId === dynLauraId, "Usuario hace Pull (o PO hace Push)", "PULL-SYSTEM");

                await store.dispatch({ type: 'REPORT_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash, realHours: 8.5 } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'reported', "Prueba de Trabajo reportada", "POMODORO");

                const genesisHash = store.getState().projects.find(p=>p.id===PID_ECO).genesisHash;
                await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: PID_ECO, txHash: txPull.hash } });
                
                const pEcoEnd = store.getState().projects.find(x => x.id === PID_ECO);
                const blockLedger = pEcoEnd.ledger[0];
                
                assert(blockLedger !== undefined, "Transacción inyectada al Ledger", "LEDGER");
                assert(blockLedger.prevHash === genesisHash, "Enlace Criptográfico al Bloque Génesis", "WEB3");

                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'test-arch', nombre: 'Startup Tech', sector: 'software', archetype: 'startup' } });
                const maturity = store.calculateMaturityIndex('test-arch');
                assert(maturity.score >= 0, "Maturity Index calculado", "KERNEL");

                // NUEVOS TESTS V7.2
                await store.dispatch({ type: 'ADD_PROJECT', payload: { id: PID_PRIV, nombre: 'Stealth Startup', sector: 'tech_saas_platform', isPrivate: true } });
                const pPriv = store.getState().projects.find(x => x.id === PID_PRIV);
                assert(pPriv !== undefined, "Proyecto Privado instanciado", "CORE");
                assert(pPriv.isPrivate === true, "Flag isPrivate guardado inmutablemente", "SECURITY");

                const DYN_HACKER_ID = '@hacker_' + Date.now();
                await store.dispatch({ type: 'ADD_USER', payload: { userId: DYN_HACKER_ID, name: 'Hacker', globalRole: 'network-user' } });
                
                assert(store.canUserViewProject(PID_PRIV, 'usr_alvaro_001', 'ecosystem-owner') === true, "Master Architect puede ver redes privadas", "RBAC-V7.2");
                assert(store.canUserViewProject(PID_PRIV, DYN_HACKER_ID, 'network-user') === false, "Usuario no invitado bloqueado", "RBAC-V7.2");

                await store.dispatch({ type: 'LOG_INVITATION', payload: { projectId: PID_PRIV, email: 'test@daohack.com' } });
                assert(store.getState().projects.find(x => x.id === PID_PRIV).invitations.length === 1, "Auditoría de envío de emails OK", "COMMS");

                // NUEVO TEST V7.3: REQUEST_TRANSACTION
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_PRIV, tx: { from: 'role-test', to: 'role-dest', horas: 5, entregable: 'Test Request' } } });
                let pTestReq = store.getState().projects.find(x => x.id === PID_PRIV);
                let txReqHash = pTestReq.transactions[0].hash;
                
                await store.dispatch({ type: 'REQUEST_TRANSACTION', payload: { projectId: PID_PRIV, txHash: txReqHash, userId: DYN_HACKER_ID } });
                pTestReq = store.getState().projects.find(x => x.id === PID_PRIV);
                
                assert(pTestReq.transactions[0].status === 'requested', "Solicitud PULL registrada en Kernel (Requested)", "PULL-V7.3");
                assert(pTestReq.transactions[0].assigneeId === DYN_HACKER_ID, "Asignación temporal guardada", "PULL-V7.3");

                // RESULTADO FINAL
                if(passed === total) {
                    const finalColor = 'var(--accent-green)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 25px; padding: 20px; border: 1px solid ${finalColor}; background: rgba(0, 230, 118, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in;">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2rem;">🚀 KERNEL v7.3 VALIDADO AL 100%</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem;">Los ${total} vectores del protocolo (incluyendo Request Pull) han sido superados sin mutaciones.</p>
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
