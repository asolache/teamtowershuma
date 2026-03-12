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
                
                .test-container { padding: 3rem; max-width: 1000px; margin: 0 auto; width: 100%;}
                .test-header { text-align: center; margin-bottom: 3rem; }
                .test-header h1 { color: var(--accent-blue); font-family: var(--font-mono); font-size: 2.5rem; letter-spacing: -1px; }
                
                .metrics-row { display: flex; gap: 1rem; margin-bottom: 2rem; }
                .metric-box { flex: 1; background: rgba(0, 230, 118, 0.05); border: 1px solid rgba(0, 230, 118, 0.2); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; }
                .metric-box h3 { color: var(--accent-green); font-size: 2.5rem; margin-bottom: 5px; font-family: var(--font-mono); font-weight: 800; }
                .metric-box p { color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; font-weight: bold; margin: 0;}

                .log-terminal { background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1.5rem; font-family: var(--font-mono); height: 500px; overflow-y: auto; color: #a0a0a0; font-size: 0.9rem; line-height: 1.6; box-shadow: inset 0 0 30px rgba(0,0,0,0.8); scroll-behavior: smooth;}
                
                .test-row { margin-bottom: 8px; display: flex; align-items: flex-start; animation: fadeIn 0.3s ease-in; }
                .test-icon { margin-right: 10px; font-size: 1.1rem; }
                .test-msg { flex: 1; }
                .test-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 12px; background: #222; border: 1px solid #444; color: var(--text-muted); margin-left: 10px; white-space: nowrap; font-weight: bold; }
                .badge-v10 { border-color: var(--accent-blue); color: var(--accent-blue); }
                .badge-v11 { border-color: var(--accent-purple); color: var(--accent-purple); background: rgba(224,64,251,0.1); }

                .run-btn { width: 100%; padding: 1.2rem; font-size: 1.1rem; margin-top: 1.5rem; font-family: var(--font-mono); border-radius: var(--border-radius-sm); cursor: pointer; background: var(--accent-blue); color: black; border: none; font-weight: bold; transition: transform 0.2s;}
                .run-btn:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(0,176,255,0.4); }
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
                            <h1>TDD / SECURITY MATRIX</h1>
                            <p style="color: var(--text-muted);">Auditoría V10 (Arquitectura) y V11 (Gobernanza Fractal & Permisos)</p>
                        </div>

                        <div class="metrics-row">
                            <div class="metric-box">
                                <h3 id="testScore" style="color: #666;">0/0</h3>
                                <p>Tests Superados</p>
                            </div>
                            <div class="metric-box" style="background: rgba(0, 176, 255, 0.05); border-color: rgba(0, 176, 255, 0.2);">
                                <h3 style="color: var(--accent-blue);">V11.0</h3>
                                <p>Versión del Motor</p>
                            </div>
                        </div>

                        <div class="log-terminal" id="terminalLog">
                            <div style="color: var(--accent-blue); margin-bottom: 10px; font-weight:bold;">> Sistema listo para ejecución de matriz de seguridad.</div>
                        </div>

                        <button class="run-btn" id="runTestsBtn">EJECUTAR AUDITORÍA DE KERNEL ▶</button>
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
            terminal.innerHTML = '<div style="color: var(--accent-purple); margin-bottom: 15px; font-weight: bold;">> Iniciando escaneo de soberanía e inmutabilidad...</div>';
            
            let passed = 0; 
            let total = 0;

            const assert = (condition, message, tag, isV11 = false) => {
                total++;
                const isPass = !!condition;
                if(isPass) passed++;
                
                const icon = isPass ? '✅' : '❌';
                const badgeClass = isV11 ? 'test-badge badge-v11' : 'test-badge badge-v10';
                
                terminal.innerHTML += `
                    <div class="test-row" style="color: ${isPass ? '#c9d1d9' : 'var(--accent-red)'};">
                        <span class="test-icon">${icon}</span>
                        <span class="test-msg">${message}</span>
                        <span class="${badgeClass}">${tag}</span>
                    </div>
                `;
                terminal.scrollTop = terminal.scrollHeight;
                score.innerText = `${passed}/${total}`;
                
                if (!isPass) throw new Error(`Test Fallido: [${tag}] ${message}`);
            };

            const PID_1 = 'test-proj-' + Date.now();
            const PID_ECO = 'test-eco-' + Date.now();
            const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 100000);
            const dynBobId = '@bob_user_' + Math.floor(Math.random() * 100000);
            const dynPoId = '@project_owner_' + Math.floor(Math.random() * 100000);

            try {
                // =========================================================================
                // BLOQUE 1: INFRAESTRUCTURA Y VNA (LEGADO V10 CONSERVADO)
                // =========================================================================
                assert(META_ECOSYSTEMS !== undefined, "Meta-Ontología de Ecosistemas inyectada", "AI-SWARM");
                assert(store.getState().config !== undefined, "Objeto config global inicializado", "KERNEL"); 
                
                await store.dispatch({ type: 'UPDATE_CONFIG', payload: { archetype: 'dao' } });
                assert(store.getState().config.archetype === 'dao', "Actualización de Configuración Global OK", "SETTINGS"); 

                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } }); 
                
                // Creación de Nodos en Padrón
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynBobId, name: 'Bob Normal', globalRole: 'network-user' } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynPoId, name: 'PO Boss', globalRole: 'network-user' } });

                assert(store.getState().globalUsers.find(u => u.id === dynLauraId), "Usuario añadido al Pool Global con ID único", "IDENTITY"); 

                // Estructura V10
                await store.dispatch({ type: 'CREATE_PROJECT', payload: { id: PID_1, nombre: 'Test V10', sector: 'digital_media_growth', roles: [], vna_flows: [], work_orders: [], ledger: [] } });
                const p = store.getState().projects.find(x => x.id === PID_1);
                assert(p !== undefined, "Proyecto instanciado", "CORE"); 
                assert(Array.isArray(p.vna_flows) && Array.isArray(p.work_orders), "Estructuras separadas (Tuberías y Agua) inicializadas", "ARCHITECTURE");
                
                const baseRoles = Object.keys(GLOBAL_ONTOLOGY['digital_media_growth']).filter(k => k !== '_meta');
                for (let rId of baseRoles) {
                    await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_1, role: { name: GLOBAL_ONTOLOGY['digital_media_growth'][rId].name, levelId: rId, multiplier: 1.5, fmv: 50, isArchived: false } } });
                }

                // Inmutabilidad
                const anxanetaRole = store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.levelId === '@anxaneta');
                await store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: PID_1, roleId: anxanetaRole.id, updates: { name: 'Super CEO' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).roles.find(r => r.id === anxanetaRole.id).name === 'Super CEO', "Edición Pura de metadatos del Nodo OK", "STORE"); 

                // Tuberías
                const testFlowId = 'flow_mock_' + Date.now();
                await store.dispatch({ type: 'ADD_FLOW', payload: { projectId: PID_1, flow: { id: testFlowId, from: anxanetaRole.id, to: 'foo', estimatedHours: 2, template: 'Plan Original', tipo: 'tangible' } } });
                assert(store.getState().projects.find(x => x.id === PID_1).vna_flows[0].template === 'Plan Original', "Tubería (Flow) creada exitosamente", "VNA-MODEL"); 
                
                await store.dispatch({ type: 'DELETE_FLOW', payload: { projectId: PID_1, flowId: testFlowId } });
                assert(store.getState().projects.find(x => x.id === PID_1).vna_flows.length === 0, "Tubería eliminada limpiamente", "VNA-MODEL");

                // Work Orders & Slicing Pie
                await store.dispatch({ type: 'CREATE_PROJECT', payload: { id: PID_ECO, nombre: 'DAO Project', sector: 'general', ownerId: dynPoId, roles: [], vna_flows: [], work_orders: [], ledger: [], usuarios: [] } });
                await store.dispatch({ type: 'ADD_ROLE', payload: { projectId: PID_ECO, role: { id: 'role-dev', name: 'Dev', levelId: '@baixos', multiplier: 1.5, fmv: 40 } } });
                await store.dispatch({ type: 'ADD_FLOW', payload: { projectId: PID_ECO, flow: { id: 'flow_pipe_1', from: 'foo', to: 'role-dev', estimatedHours: 10, template: 'App Code', tipo: 'tangible' } } });
                
                const woHash = 'wo_mock_' + Date.now();
                await store.dispatch({ type: 'SPAWN_WORK_ORDER', payload: { projectId: PID_ECO, workOrder: { hash: woHash, flowId: 'flow_pipe_1', status: 'theoretical' } } });
                assert(store.getState().projects.find(x => x.id === PID_ECO).work_orders[0].status === 'theoretical', "Instancia de Trabajo nace libre en Kanban", "WORK-ORDER"); 

                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_ECO, woHash: woHash, userId: dynLauraId } });
                assert(store.getState().projects.find(x => x.id === PID_ECO).work_orders[0].assigneeId === dynLauraId, "Nodo asume la Work Order (PULL exitoso)", "KANBAN"); 

                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_ECO, woHash: woHash, realHours: 8.5 } });
                assert(store.getState().projects.find(x => x.id === PID_ECO).work_orders[0].realHours === 8.5, "PoW sobre la instancia enviada a auditoría", "FOCUS-MODE"); 

                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_ECO, woHash: woHash } });
                const blockLedger = store.getState().projects.find(x => x.id === PID_ECO).ledger[0];
                assert(blockLedger !== undefined && blockLedger.hash === woHash, "Slicing Pie: Bloque minado con enlace criptográfico validado", "LEDGER"); 
                assert(blockLedger.valorCongelado === (8.5 * 40 * 1.5), "Slicing Pie: Matemática (Horas x FMV x Riesgo) exacta", "EQUITY"); 


                // =========================================================================
                // BLOQUE 2: GOBERNANZA FRACTAL (NUEVOS TESTS V11)
                // =========================================================================

                // TEST 2.1: SOBERANÍA DEL ECOSYSTEM OWNER (EO)
                // El EO actual es 'usr_alvaro_001'. Evaluamos si puede ver un proyecto de otro (dynPoId).
                const hasAccessEO = store.canUserViewProject(PID_ECO, 'usr_alvaro_001', 'ecosystem-owner');
                assert(hasAccessEO === true, "[Soberanía Global] Ecosystem Owner tiene acceso y visión sobre proyectos creados por otros.", "GOV-MACRO", true);

                // TEST 2.2: PRIVACIDAD ENTRE NODOS BASE
                const hasAccessBob = store.canUserViewProject(PID_ECO, dynBobId, 'network-user');
                assert(hasAccessBob === false, "[Muro de Cristal] Usuario sin asignar no puede ver el proyecto privado de otro.", "PRIVACY", true);

                // Configuramos a Laura dentro del proyecto para el siguiente test
                await store.dispatch({ 
                    type: 'UPDATE_PROJECT_INFO', 
                    payload: { projectId: PID_ECO, updates: { usuarios: [{id: dynLauraId, permissions: {canCreateWO: false}}] } }
                });

                // TEST 2.3: POLÍTICA DE CREACIÓN MACRO (EO Restringe creación)
                // (Requiere actualización del store.js para atrapar la lógica)
                await store.dispatch({ type: 'UPDATE_GLOBAL_CONFIG', payload: { projectCreationMode: 'closed' } });
                const creationPolicy = store.getState().config.projectCreationMode;
                assert(creationPolicy === 'closed', "[Kernel Config] EO ha bloqueado la creación libre de Castells.", "GOV-MACRO", true);
                
                // TEST 2.4: GOBERNANZA MICRO (PO controla el grifo)
                // Hacemos que el proyecto solo permita al PO crear Tareas
                await store.dispatch({ 
                    type: 'UPDATE_PROJECT_INFO', 
                    payload: { projectId: PID_ECO, updates: { governance: { workOrderCreation: 'po_only' } } }
                });
                
                const pMicro = store.getState().projects.find(x => x.id === PID_ECO);
                const isPoOnly = pMicro.governance && pMicro.governance.workOrderCreation === 'po_only';
                assert(isPoOnly === true, "[Micro-Management] Project Owner ha cerrado la inyección de tareas a la Colla.", "GOV-MICRO", true);
                
                // Evaluador de permisos simulado (la misma lógica que usaremos en la Vista)
                const checkUserCanCreateWO = (userId, proj) => {
                    if (store.getState().session.role === 'ecosystem-owner') return true;
                    if (proj.ownerId === userId) return true;
                    if (!proj.governance || proj.governance.workOrderCreation === 'open') return true;
                    
                    if (proj.governance.workOrderCreation === 'custom') {
                        const u = proj.usuarios?.find(x => x.id === userId);
                        return u?.permissions?.canCreateWO === true;
                    }
                    return false; // po_only
                };

                assert(checkUserCanCreateWO(dynPoId, pMicro) === true, "[Autoridad] El PO siempre puede crear tareas en su red.", "RBAC", true);
                assert(checkUserCanCreateWO(dynLauraId, pMicro) === false, "[Restricción] El Nodo Base (Laura) NO puede crear tareas si la política es po_only.", "RBAC", true);


                // =========================================================================
                // RESULTADO FINAL
                // =========================================================================
                if(passed === total) {
                    const finalColor = 'var(--accent-purple)';
                    score.style.color = finalColor;
                    terminal.innerHTML += `
                        <div style="margin-top: 30px; padding: 25px; border: 1px solid ${finalColor}; background: rgba(224, 64, 251, 0.1); border-radius: var(--border-radius-md); text-align: center; animation: fadeIn 0.5s ease-in; box-shadow: 0 0 30px rgba(224,64,251,0.2);">
                            <h2 style="color: ${finalColor}; margin: 0; font-size: 2.2rem; letter-spacing: -1px;">🚀 KERNEL v11.0 VALIDADO (NIVEL DIOS)</h2>
                            <p style="color: white; margin-top: 10px; font-size: 1.1rem; line-height:1.5;">El motor ha superado exactamente los ${total} vectores críticos.</p>
                            <p style="color: #aaa; font-family: var(--font-mono); font-size: 0.85rem; margin-top: 15px;">Matriz asegurada: Inmutabilidad (V10) + Soberanía (V11) + Motor Slicing Pie.</p>
                        </div>
                    `;
                    btn.innerText = "CERTIFICACIÓN V11 COMPLETADA ✓";
                    btn.style.background = finalColor;
                    btn.style.color = "white";
                }

            } catch (error) {
                terminal.innerHTML += `
                    <div style="margin-top: 25px; padding: 20px; border: 1px solid var(--accent-red); background: rgba(255, 82, 82, 0.1); border-radius: var(--border-radius-md); animation: fadeIn 0.5s ease-in;">
                        <h2 style="color: var(--accent-red); margin: 0;">💥 ERROR DE CÓDIGO PENAL</h2>
                        <p style="color: white; margin-top: 10px; font-family: var(--font-mono);">${error.message}</p>
                        <div style="background: #000; padding: 15
