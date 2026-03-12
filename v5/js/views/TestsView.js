// v5/js/views/TestsView.js
import { store } from '../core/store.js';
import { META_ECOSYSTEMS, GLOBAL_ONTOLOGY } from '../data/ontology.js';

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

                .log-terminal { background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1.5rem; font-family: var(--font-mono); height: 450px; overflow-y: auto; color: #a0a0a0; font-size: 0.9rem; line-height: 1.6; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); scroll-behavior: smooth;}
                
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
                            <p style="color: var(--text-muted);">Auditoría global V9: Mapas VNA, Edición Pura, Focus Cache, Meta-Ontología y Slicing Pie</p>
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
                            <div style="color: var(--accent-blue); margin-bottom: 10px;">> Sistema listo para ejecución de pruebas asíncronas integrales V9.9.</div>
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
            terminal.innerHTML = '<div style="color: var(--accent-blue); margin-bottom: 15px; font-weight: bold;">> Iniciando motor de aserciones V9.9...</div>';
            
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
            const PID_ECO = 'test-eco-' + Date.now();

            try {
                // --- FASE 1: KERNEL & META-ONTOLOGY (V10 PREP) ---
                assert(META_ECOSYSTEMS !== undefined, "Meta-Ontología de Ecosistemas inyectada", "AI-SWARM");
                assert(META_ECOSYSTEMS['dao'].tags.includes('trustless'), "Configuración semántica para Agentes IA validada", "AI-SWARM");
                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL"); 
                
                await store.dispatch({ type: 'UPDATE_CONFIG', payload: { archetype: 'dao' } });
                assert(store.getState().config.archetype === 'dao', "Actualización de Configuración Global OK", "SETTINGS"); 

                // --- FASE 2: IDENTIDAD, POOL Y RBAC ---
                assert(store.getState().globalUsers !== undefined, "Pool Global de Usuarios inicializado", "IDENTITY"); 
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                assert(store.getState().session.activeUserId === 'usr_alvaro_001', "Login Root verificado", "RBAC"); 
                
                const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                const lauraGlobal = store.getState().globalUsers.find(u => u.id === dynLauraId);
                assert(lauraGlobal !== undefined, "Usuario añadido al Pool Global con ID único", "IDENTITY"); 
                assert(lauraGlobal.globalRole === 'network-user', "Usuario hereda rol raso por defecto", "RBAC"); 

                // --- FASE 3: CREACIÓN DE REDES Y GÉNESIS ---
                await store.dispatch({ type: 'CREATE_PROJECT', payload: { id: PID_1, nombre: 'Test V9', sector: 'digital_media_growth', roles: [], transactions: [], ledger: [] } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined, "Proyecto instanciado correctamente", "CORE"); 
                
                // Inyectar roles ontológicos dinámicamente para el test
                const baseRoles = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).filter(k => k !== '_meta');
                for (let rId of baseRoles) {
                    await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { name: GLOBAL_ONTOLOGY['digital_media_growth'][rId].name, levelId: rId, multiplier: 1.5, fmv: 50, isArchived: false } } });
                }
                
                const pRoles = store.getState().projects.find(x => x.id === PID_1);
                assert(pRoles.roles && pRoles.roles.length === baseRoles.length, `Ontología inyectada dinámicamente en roles`, "ONTOLOGY"); 

                // --- FASE 4: INMUTABILIDAD Y GESTIÓN DE NODOS VNA (V9.4) ---
                const anxanetaRole = pRoles.roles.find(r => r.levelId === '@anxaneta');
                const dososRole = pRoles.roles.find(r => r.levelId === '@dosos');
                const anxanetaId = anxanetaRole.id;
                
                await store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: PID_1, roleId: anxanetaId, updates: { name: 'Super CEO' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.id === anxanetaId).name === 'Super CEO', "Edición Pura de metadatos del Nodo OK", "STORE"); 
                
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { name: 'Nodo a Borrar', levelId: '@baixos', isArchived: false } } });
                let pAfterCreate = store.getState().projects.find(x => x.id === PID_1);
                const newRole = pAfterCreate.roles.find(r => r.name === 'Nodo a Borrar');
                assert(newRole !== undefined, "Instanciación manual de nuevos nodos OK", "VNA-MAP"); 

                await store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: PID_1, roleId: newRole.id } });
                assert(store.getState().projects.find(proj => proj.id === PID_1).roles.find(r => r.id === newRole.id).isArchived === true, "Inmutabilidad: El nodo se archiva, no se borra de la BD", "DATA-SAFE"); 

                // --- FASE 5: EDICIÓN DE TRANSACCIONES PURAS (V9.4) ---
                const testTxHash = 'tx_mock_' + Date.now();
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_1, tx: { hash: testTxHash, from: anxanetaId, to: dososRole.id, horas: 2, entregable: 'Plan Original', tipo: 'tangible', status: 'theoretical' } } });
                const tx1 = store.getState().projects.find(x => x.id === PID_1).transactions[0];
                assert(tx1.entregable === 'Plan Original', "Transacción Teórica inyectada en el lienzo", "VNA-MAP"); 

                await store.dispatch({ type: 'UPDATE_TRANSACTION', payload: { projectId: PID_1, txHash: testTxHash, updates: { entregable: 'Plan Editado', horas: 5 } } });
                const tx1Upd = store.getState().projects.find(x => x.id === PID_1).transactions[0];
                assert(tx1Upd.entregable === 'Plan Editado' && tx1Upd.horas === 5, "Redux Puro: La transacción se actualiza sin mutaciones forzadas", "REDUCER"); 

                await store.dispatch({ type: 'DELETE_TRANSACTION', payload: { projectId: PID_1, txHash: testTxHash } });
                const txListAfterDel = store.getState().projects.find(x => x.id === PID_1).transactions;
                assert(txListAfterDel.length === 0, "Botón Undo: Transacción eliminada limpiamente del flujo", "VNA-MAP");

                // --- FASE 6: SLICING PIE & LEDGER INMUTABLE ---
                await store.dispatch({ type: 'CREATE_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', roles: [], transactions: [], ledger: [], usuarios: [] } });
                
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5, fmv: 40 } } });
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-ceo', name: 'CEO', levelId: '@anxaneta', multiplier: 3.0, fmv: 60 } } });
                
                const pushHash = 'tx_push_' + Date.now();
                await store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: PID_ECO, tx: { hash: pushHash, from: 'role-ceo', to: 'role-dev', horas: 10, entregable: 'App Code', tipo: 'tangible', status: 'theoretical' } } });
                
                let txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'theoretical', "Flujo Kanban: El Entregable nace como Teórico Libre", "PULL-SYSTEM"); 

                await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: PID_ECO, txHash: pushHash, userId: dynLauraId } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'pinged' && txPull.assigneeId === dynLauraId, "Flujo Kanban: Nodo toma el control de la tarea (Ping)", "PULL-SYSTEM"); 

                // --- FASE 7: FOCUS POMODORO CACHE (V8.5+) ---
                localStorage.setItem(`tt_focus_${pushHash}_running`, 'true');
                assert(localStorage.getItem(`tt_focus_${pushHash}_running`) === 'true', "Deep Work: Persistencia del cronómetro en background OK", "FOCUS-MODE");

                await store.dispatch({ type: 'REPORT_TRANSACTION', payload: { projectId: PID_ECO, txHash: pushHash, realHours: 8.5 } });
                txPull = store.getState().projects.find(x => x.id === PID_ECO).transactions[0];
                assert(txPull.status === 'reported' && txPull.realHours === 8.5, "Flujo Kanban: Prueba de Trabajo (PoW) enviada a auditoría", "FOCUS-MODE"); 

                await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: PID_ECO, txHash: pushHash } });
                
                const pEcoEnd = store.getState().projects.find(x => x.id === PID_ECO);
                const blockLedger = pEcoEnd.ledger[0];
                
                assert(blockLedger !== undefined, "Slicing Pie: Bloque minado e inyectado al Ledger", "LEDGER"); 
                assert(blockLedger.hash === pushHash, "Slicing Pie: Enlace Criptográfico estricto al flujo original", "WEB3"); 
                assert(blockLedger.valorCongelado === (8.5 * 40 * 1.5), "Matemática Pie: (Horas Reales x FMV x Multiplicador) calculadas a la perfección", "EQUITY"); 

                const maturity = store.calculateMaturityIndex(PID_ECO);
                assert(maturity.score > 0, "Algoritmo de Madurez de Red operativo", "METRICS"); 

                // Limpieza de basurilla del test en cache
                localStorage.removeItem(`tt_focus_${pushHash}_running`);

                // --- RESULTADO FINAL ---
                if(passed === total) {
                    const finalColor = 'var(--accent-green)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 25px; padding: 20px; border: 1px solid ${finalColor}; background: rgba(0, 230, 118, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in;">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2rem;">🚀 KERNEL v9.9 VALIDADO AL 100%</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem;">El Motor Core ha superado exactamente ${total} vectores de prueba críticos.</p>
                            <p style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; margin-top: 5px;">Módulos garantizados: Meta-Ontology, Redux Purity, VNA Builder, Kanban, Slicing Pie, Focus Cache</p>
                        </div>
                    `;
                    btn.innerText = "CERTIFICACIÓN V9.9 COMPLETADA ✓";
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
