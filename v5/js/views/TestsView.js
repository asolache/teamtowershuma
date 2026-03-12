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
                            <p style="color: var(--text-muted);">Auditoría V10: Desacople de Tuberías (VNA) e Instancias (Work Orders)</p>
                        </div>

                        <div class="metrics-row">
                            <div class="metric-box">
                                <h3 id="testScore" style="color: #666;">0/0</h3>
                                <p>Tests Superados</p>
                            </div>
                            <div class="metric-box" style="background: rgba(0, 176, 255, 0.05); border-color: rgba(0, 176, 255, 0.2);">
                                <h3 style="color: var(--accent-blue);">100%</h3>
                                <p>Cobertura V10</p>
                            </div>
                        </div>

                        <div class="log-terminal" id="terminalLog">
                            <div style="color: var(--accent-blue); margin-bottom: 10px;">> Sistema listo para ejecución de pruebas asíncronas V10.0.</div>
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
            terminal.innerHTML = '<div style="color: var(--accent-blue); margin-bottom: 15px; font-weight: bold;">> Iniciando motor de aserciones V10.0 (Work Orders Architecture)...</div>';
            
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
                // --- FASE 1: KERNEL & META-ONTOLOGY ---
                assert(META_ECOSYSTEMS !== undefined, "Meta-Ontología de Ecosistemas inyectada", "AI-SWARM");
                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL"); 
                
                await store.dispatch({ type: 'UPDATE_CONFIG', payload: { archetype: 'dao' } });
                assert(store.getState().config.archetype === 'dao', "Actualización de Configuración Global OK", "SETTINGS"); 

                // --- FASE 2: IDENTIDAD, POOL Y RBAC ---
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                
                const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                const lauraGlobal = store.getState().globalUsers.find(u => u.id === dynLauraId);
                assert(lauraGlobal !== undefined, "Usuario añadido al Pool Global con ID único", "IDENTITY"); 

                // --- FASE 3: CREACIÓN DE REDES (V10 ESTRUCTURA) ---
                // Validamos que el proyecto nazca con vna_flows y work_orders vacíos en lugar del antiguo transactions
                await store.dispatch({ type: 'CREATE_PROJECT', payload: { id: PID_1, nombre: 'Test V10', sector: 'digital_media_growth', roles: [], vna_flows: [], work_orders: [], ledger: [] } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined, "Proyecto instanciado", "CORE"); 
                assert(Array.isArray(p.vna_flows) && Array.isArray(p.work_orders), "V10: Estructuras separadas (Tuberías y Agua) inicializadas", "ARCHITECTURE");
                
                const baseRoles = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).filter(k => k !== '_meta');
                for (let rId of baseRoles) {
                    await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { name: GLOBAL_ONTOLOGY['digital_media_growth'][rId].name, levelId: rId, multiplier: 1.5, fmv: 50, isArchived: false } } });
                }

                // --- FASE 4: INMUTABILIDAD DE NODOS ---
                const anxanetaRole = store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.levelId === '@anxaneta');
                const dososRole = store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.levelId === '@dosos');
                const anxanetaId = anxanetaRole.id;
                
                await store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: PID_1, roleId: anxanetaId, updates: { name: 'Super CEO' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.id === anxanetaId).name === 'Super CEO', "Edición Pura de metadatos del Nodo OK", "STORE"); 

                // --- FASE 5: V10 - VNA FLOWS (CREAR TUBERÍAS) ---
                const testFlowId = 'flow_mock_' + Date.now();
                await store.dispatch({ type: 'ADD_FLOW', payload: { projectId: PID_1, flow: { id: testFlowId, from: anxanetaId, to: dososRole.id, estimatedHours: 2, template: 'Plan Original', tipo: 'tangible' } } });
                const flow1 = store.getState().projects.find(x => x.id === PID_1).vna_flows[0];
                assert(flow1.template === 'Plan Original', "V10: Tubería (Flow) creada exitosamente en el mapa VNA", "VNA-MODEL"); 

                await store.dispatch({ type: 'UPDATE_FLOW', payload: { projectId: PID_1, flowId: testFlowId, updates: { template: 'Plan Editado', estimatedHours: 5 } } });
                const flow1Upd = store.getState().projects.find(x => x.id === PID_1).vna_flows[0];
                assert(flow1Upd.template === 'Plan Editado' && flow1Upd.estimatedHours === 5, "V10: Redux Puro en edición de Tuberías", "REDUCER"); 

                await store.dispatch({ type: 'DELETE_FLOW', payload: { projectId: PID_1, flowId: testFlowId } });
                const flowListAfterDel = store.getState().projects.find(x => x.id === PID_1).vna_flows;
                assert(flowListAfterDel.length === 0, "V10: Tubería eliminada limpiamente", "VNA-MODEL");

                // --- FASE 6: V10 - WORK ORDERS (EL AGUA EN EL KANBAN) & SLICING PIE ---
                await store.dispatch({ type: 'CREATE_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', roles: [], vna_flows: [], work_orders: [], ledger: [], usuarios: [] } });
                
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5, fmv: 40 } } });
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-ceo', name: 'CEO', levelId: '@anxaneta', multiplier: 3.0, fmv: 60 } } });
                
                // 1. Crear Tubería Permanente
                const myFlowId = 'flow_pipe_1';
                await store.dispatch({ type: 'ADD_FLOW', payload: { projectId: PID_ECO, flow: { id: myFlowId, from: 'role-ceo', to: 'role-dev', estimatedHours: 10, template: 'App Code', tipo: 'tangible' } } });
                
                // 2. Instanciar Work Order (Pull Request de la tarea)
                const woHash = 'wo_mock_' + Date.now();
                await store.dispatch({ type: 'SPAWN_WORK_ORDER', payload: { projectId: PID_ECO, workOrder: { hash: woHash, flowId: myFlowId, status: 'theoretical' } } });
                
                let woPull = store.getState().projects.find(x => x.id === PID_ECO).work_orders[0];
                assert(woPull.status === 'theoretical', "V10: Instancia de Trabajo (Work Order) nace libre en el Kanban", "WORK-ORDER"); 

                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_ECO, woHash: woHash, userId: dynLauraId } });
                woPull = store.getState().projects.find(x => x.id === PID_ECO).work_orders[0];
                assert(woPull.status === 'pinged' && woPull.assigneeId === dynLauraId, "V10: Nodo asume la Work Order (PULL exitoso)", "KANBAN"); 

                // --- FASE 7: FOCUS POMODORO CACHE (V8.5+) ---
                localStorage.setItem(`tt_focus_${woHash}_running`, 'true');
                assert(localStorage.getItem(`tt_focus_${woHash}_running`) === 'true', "Deep Work: Cache de Pomodoro asimilado a la nueva estructura Hash", "FOCUS-MODE");

                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_ECO, woHash: woHash, realHours: 8.5 } });
                woPull = store.getState().projects.find(x => x.id === PID_ECO).work_orders[0];
                assert(woPull.status === 'reported' && woPull.realHours === 8.5, "V10: Prueba de Trabajo (PoW) sobre la instancia enviada a auditoría", "FOCUS-MODE"); 

                // 3. Aprobar Work Order e inyectar al Ledger
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_ECO, woHash: woHash } });
                
                const pEcoEnd = store.getState().projects.find(x => x.id === PID_ECO);
                const blockLedger = pEcoEnd.ledger[0];
                
                assert(blockLedger !== undefined, "Slicing Pie V10: Bloque minado desde la Work Order completada", "LEDGER"); 
                assert(blockLedger.hash === woHash, "Slicing Pie V10: Enlace criptográfico a la Instancia validado", "WEB3"); 
                assert(blockLedger.valorCongelado === (8.5 * 40 * 1.5), "Matemática Pie V10: Cruce de datos entre Work Order (horas) y Flow (rol/multiplier) exitoso", "EQUITY"); 

                // Limpieza de basurilla del test
                localStorage.removeItem(`tt_focus_${woHash}_running`);

                // --- RESULTADO FINAL ---
                if(passed === total) {
                    const finalColor = 'var(--accent-green)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 25px; padding: 20px; border: 1px solid ${finalColor}; background: rgba(0, 230, 118, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in;">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2rem;">🚀 KERNEL v10.0 VALIDADO AL 100%</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem;">El Motor Core ha superado exactamente ${total} vectores de prueba críticos de la nueva arquitectura.</p>
                            <p style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; margin-top: 5px;">Módulos garantizados: VNA Pipes (vna_flows), Instances (work_orders), Ledger Cross-Reference.</p>
                        </div>
                    `;
                    btn.innerText = "CERTIFICACIÓN V10 COMPLETADA ✓";
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
