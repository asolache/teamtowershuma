const generateHash = (str) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; 
    }
    return Math.abs(hash).toString(16) + Date.now().toString(16);
};

// 🛡️ LÍMITE FÍSICO DE SEGURIDAD (DNA Check) - Evita colapsar el LocalStorage
const MAX_PROMPT_LENGTH = 4000;

export class TTStore {
    constructor() {
        this.ontologyStatic = {
            // Mantengo tus sectores y niveles originales
            sectores: { 
                marketing: { 
                    "@anxaneta": { name: "Strategy", prompt: "Eres el Director de Estrategia. Tu misión es definir el posicionamiento y los KPIs del proyecto.\n\n🎯 SUGERENCIAS:\n- [Tangible] Documento de Estrategia GTM (Go-To-Market).\n- [Intangible] Mentoría de Visión de Marca al equipo." },
                    "@aixecador": { name: "Creative", prompt: "Eres el Director Creativo. Traduces la estrategia en conceptos de campaña ejecutables.\n\n🎯 SUGERENCIAS:\n- [Tangible] Moodboard / Concepto de Campaña.\n- [Intangible] Feedback creativo sobre diseños." },
                    "@dosos": { name: "Content", prompt: "Eres el QA / Content Manager. Auditas que cada pieza cumpla la guía de estilo antes de publicarse.\n\n🎯 SUGERENCIAS:\n- [Tangible] Matriz de Copy Revisada.\n- [Intangible] Aprobación final de publicación." },
                    "@baixos": { name: "Design", prompt: "Eres el Diseñador Gráfico. Produces los assets visuales finales.\n\n🎯 SUGERENCIAS:\n- [Tangible] Banners y Creatividades Exportadas.\n- [Intangible] Propuesta de nueva línea visual." },
                    "@pinya": { name: "Ads", prompt: "Eres el Especialista en Pauta. Ejecutas y optimizas las campañas en plataformas.\n\n🎯 SUGERENCIAS:\n- [Tangible] Reporte de Rendimiento (ROAS).\n- [Intangible] Alerta de desviación de presupuesto." }
                },
                web3: { 
                    "@anxaneta": { name: "Lead Arch.", prompt: "Eres el Arquitecto Web3. Defines la tokenomics y la infraestructura descentralizada.\n\n🎯 SUGERENCIAS:\n- [Tangible] Whitepaper / Litepaper.\n- [Intangible] Resolución de debates sobre escalabilidad." },
                    "@aixecador": { name: "Smart Contracts", prompt: "Eres el Lead de Contratos Inteligentes. Diseñas la lógica on-chain.\n\n🎯 SUGERENCIAS:\n- [Tangible] Arquitectura del Smart Contract (UML).\n- [Intangible] Guía de estándares de seguridad." },
                    "@dosos": { name: "Auditor", prompt: "Eres el Auditor de Seguridad. Buscas vulnerabilidades (Reentrancy, overflow) antes del despliegue.\n\n🎯 SUGERENCIAS:\n- [Tangible] Reporte de Vulnerabilidades (Audit Report).\n- [Intangible] Certificación de Seguridad." },
                    "@baixos": { name: "DApp Dev", prompt: "Eres el Desarrollador Web3. Conectas el frontend con la blockchain (Web3.js/Ethers).\n\n🎯 SUGERENCIAS:\n- [Tangible] Integración de Wallet (Código).\n- [Intangible] Duda sobre manejo de estado asíncrono." },
                    "@pinya": { name: "Validator", prompt: "Eres el Operador de Nodos. Mantienes la infraestructura y monitorizas el RPC.\n\n🎯 SUGERENCIAS:\n- [Tangible] Log de Uptime del Nodo.\n- [Intangible] Soporte en caída de red." }
                },
                gremial: { 
                    "@anxaneta": { name: "Ingeniero", prompt: "Eres el Ingeniero. Realizas cálculos estructurales y firmas el proyecto.\n\n🎯 SUGERENCIAS:\n- [Tangible] Planos Técnicos Visados.\n- [Intangible] Aprobación de viabilidad." },
                    "@aixecador": { name: "Oficial", prompt: "Eres el Jefe de Obra/Taller. Organizas los recursos y planificas las fases.\n\n🎯 SUGERENCIAS:\n- [Tangible] Cronograma de Producción.\n- [Intangible] Instrucciones de ejecución al equipo." },
                    "@dosos": { name: "Calidad", prompt: "Eres el Inspector de Calidad. Revisas que el producto físico cumpla normativas.\n\n🎯 SUGERENCIAS:\n- [Tangible] Certificado de Inspección Técnica.\n- [Intangible] Alerta de defecto de fábrica." },
                    "@baixos": { name: "Especialista", prompt: "Eres el Operario Especialista. Manejas maquinaria y produces la pieza.\n\n🎯 SUGERENCIAS:\n- [Tangible] Lote de Piezas Terminadas.\n- [Intangible] Petición de mantenimiento de máquina." },
                    "@pinya": { name: "Logística", prompt: "Eres el Encargado de Logística. Gestionas almacén y envíos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Inventario de Stock.\n- [Intangible] Notificación de falta de material." }
                },
                saas: { 
                    "@anxaneta": { name: "Product Owner", prompt: "Eres el Product Owner. Maximizas el valor del producto alineando visión y usuario.\n\n🎯 SUGERENCIAS:\n- [Tangible] PRD (Product Requirements Document).\n- [Intangible] Sesión de Alineación Estratégica." },
                    "@aixecador": { name: "Tech Lead", prompt: "Eres el Tech Lead. Traduces requerimientos en arquitectura técnica.\n\n🎯 SUGERENCIAS:\n- [Tangible] Diagrama de Arquitectura de Sistemas.\n- [Intangible] Desbloqueo Técnico a desarrolladores." },
                    "@dosos": { name: "QA Tester", prompt: "Eres el QA. Rompes el software para garantizar resiliencia antes de producción.\n\n🎯 SUGERENCIAS:\n- [Tangible] Log de Bugs Reproducibles.\n- [Intangible] Aprobación (Greenlight) de Pase a Producción." },
                    "@baixos": { name: "Frontend/Backend", prompt: "Eres el Desarrollador. Escribes código limpio, eficiente y mantenible.\n\n🎯 SUGERENCIAS:\n- [Tangible] Código Funcional (Pull Request).\n- [Intangible] Propuesta de Refactorización." },
                    "@pinya": { name: "Soporte/DevOps", prompt: "Eres DevOps/Soporte. Mantienes el CI/CD y resuelves tickets de usuarios.\n\n🎯 SUGERENCIAS:\n- [Tangible] Pipeline CI/CD Desplegado.\n- [Intangible] Resolución de Incidencia Tier 1." }
                },
                legal: { 
                    "@anxaneta": { name: "Socio Director", prompt: "Eres el Socio Director. Defines estrategia legal y captas grandes cuentas.\n\n🎯 SUGERENCIAS:\n- [Tangible] Propuesta de Defensa Estratégica.\n- [Intangible] Negociación de Honorarios." },
                    "@aixecador": { name: "Asociado Senior", prompt: "Eres el Asociado Senior. Diriges la táctica del caso judicial o contrato.\n\n🎯 SUGERENCIAS:\n- [Tangible] Borrador Maestro de Contrato/Demanda.\n- [Intangible] Directrices de jurisprudencia a aplicar." },
                    "@dosos": { name: "Revisor/Compliance", prompt: "Eres el Auditor de Compliance. Previenes riesgos legales y normativos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Matriz de Riesgos Legales.\n- [Intangible] Visto bueno de cumplimiento normativo." },
                    "@baixos": { name: "Abogado Junior", prompt: "Eres el Abogado Junior. Redactas clausulados y buscas jurisprudencia.\n\n🎯 SUGERENCIAS:\n- [Tangible] Informe de Antecedentes Jurisprudenciales.\n- [Intangible] Consulta sobre estrategia procesal." },
                    "@pinya": { name: "Paralegal", prompt: "Eres el Paralegal. Gestionas plazos procesales y documentation.\n\n🎯 SUGERENCIAS:\n- [Tangible] Expediente Judicial Organizado.\n- [Intangible] Alerta de vencimiento de plazo." }
                },
                salud: { 
                    "@anxaneta": { name: "Director Médico", prompt: "Eres el Director Médico. Defines protocolos y políticas de salud.\n\n🎯 SUGERENCIAS:\n- [Tangible] Protocolo Clínico Actualizado.\n- [Intangible] Resolución de conflictos ético-médicos." },
                    "@aixecador": { name: "Jefe de Planta", prompt: "Eres el Jefe de Planta. Coordinas turnos y recursos hospitalarios.\n\n🎯 SUGERENCIAS:\n- [Tangible] Cuadrante de Turnos Mensual.\n- [Intangible] Instrucciones de priorización de pacientes." },
                    "@dosos": { name: "Supervisor", prompt: "Eres el Supervisor. Aseguras la correcta aplicación de protocolos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Reporte de Control de Calidad Asistencial.\n- [Intangible] Corrección de procedimiento a enfermería." },
                    "@baixos": { name: "Especialista", prompt: "Eres el Médico Especialista. Ejecutas tratamientos e intervenciones.\n\n🎯 SUGERENCIAS:\n- [Tangible] Informe de Alta Médica.\n- [Intangible] Interconsulta con otra especialidad." },
                    "@pinya": { name: "Enfermería/Celador", prompt: "Eres el Personal de Base. Cuidas al paciente y gestionas su entorno.\n\n🎯 SUGERENCIAS:\n- [Tangible] Registro de Constantes Vitales.\n- [Intangible] Alerta de empeoramiento del paciente." }
                },
                hosteleria: { 
                    "@anxaneta": { name: "Gerente/Chef", prompt: "Eres el Chef Ejecutivo/Gerente. Creas el menú y controlas la rentabilidad.\n\n🎯 SUGERENCIAS:\n- [Tangible] Escandallo y Fichas Técnicas de Menú.\n- [Intangible] Visión gastronómica para el equipo." },
                    "@aixecador": { name: "Maître", prompt: "Eres el Maître. Diriges el servicio de sala y experiencia del cliente.\n\n🎯 SUGERENCIAS:\n- [Tangible] Distribución de Rango de Mesas.\n- [Intangible] Briefing de ventas pre-servicio." },
                    "@dosos": { name: "Jefe de Rango", prompt: "Eres el Jefe de Rango. Supervisas la calidad de platos antes de salir.\n\n🎯 SUGERENCIAS:\n- [Tangible] Inventario de Vinos/Sala.\n- [Intangible] Control de calidad (Pase) antes del cliente." },
                    "@baixos": { name: "Cocinero/Camarero", prompt: "Eres el Operativo. Cocinas o sirves directamente al cliente.\n\n🎯 SUGERENCIAS:\n- [Tangible] Platos Ejecutados (Servicio).\n- [Intangible] Petición de refuerzo en partida." },
                    "@pinya": { name: "Ayudante", prompt: "Eres el Office/Ayudante. Mantienes limpieza y pre-producción.\n\n🎯 SUGERENCIAS:\n- [Tangible] Mise en place (Preparación) terminada.\n- [Intangible] Alerta de falta de vajilla limpia." }
                },
                educacion: { 
                    "@anxaneta": { name: "Rector/Director", prompt: "Eres el Director. Defines el proyecto educativo del centro.\n\n🎯 SUGERENCIAS:\n- [Tangible] Proyecto Educativo de Centro (PEC).\n- [Intangible] Motivación y liderazgo del claustro." },
                    "@aixecador": { name: "Jefe Estudios", prompt: "Eres el Jefe de Estudios. Planificas horarios y currículos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Planificación de Horarios y Aulas.\n- [Intangible] Mediación en conflictos de departamento." },
                    "@dosos": { name: "Coordinador", prompt: "Eres el Coordinador. Auditas metodologías y evalúas resultados.\n\n🎯 SUGERENCIAS:\n- [Tangible] Informe de Rendimiento Académico.\n- [Intangible] Feedback metodológico a profesores." },
                    "@baixos": { name: "Profesor", prompt: "Eres el Profesor. Impartes conocimiento y evalúas alumnos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Unidades Didácticas / Exámenes Corregidos.\n- [Intangible] Tutoría y orientación a alumnos." },
                    "@pinya": { name: "Administración", prompt: "Eres Conserjería/Admin. Sostienes la operativa del edificio y papeleo.\n\n🎯 SUGERENCIAS:\n- [Tangible] Actas y Matrículas Procesadas.\n- [Intangible] Solicitud de material escolar." }
                },
                construccion: { 
                    "@anxaneta": { name: "Arquitecto", prompt: "Eres el Arquitecto. Creas el diseño conceptual y espacial.\n\n🎯 SUGERENCIAS:\n- [Tangible] Proyecto Básico de Arquitectura.\n- [Intangible] Directriz de estética e iluminación." },
                    "@aixecador": { name: "Jefe de Obra", prompt: "Eres el Jefe de Obra. Coordinas a las subcontratas y plazos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Plan de Certificaciones Mensual.\n- [Intangible] Resolución de solapamiento de oficios." },
                    "@dosos": { name: "Aparejador (QA)", prompt: "Eres el Aparejador. Controlas seguridad, presupuesto y calidad material.\n\n🎯 SUGERENCIAS:\n- [Tangible] Certificación de Calidad de Materiales.\n- [Intangible] Orden de paralización por seguridad." },
                    "@baixos": { name: "Oficial", prompt: "Eres el Oficial. Ejecutas las tareas especializadas (albañilería, fontanería).\n\n🎯 SUGERENCIAS:\n- [Tangible] Tajo/Muro Terminado.\n- [Intangible] Consulta sobre lectura de plano." },
                    "@pinya": { name: "Peón", prompt: "Eres el Peón. Das soporte manual y preparas el entorno.\n\n🎯 SUGERENCIAS:\n- [Tangible] Escombros Retirados / Material Acopiado.\n- [Intangible] Aviso de necesidad de herramientas." }
                },
                audiovisual: { 
                    "@anxaneta": { name: "Productor Ej.", prompt: "Eres el Productor Ejecutivo. Consigues financiación y viabilidad.\n\n🎯 SUGERENCIAS:\n- [Tangible] Presupuesto Cerrado y Contratos.\n- [Intangible] Aprobación de luz verde al proyecto." },
                    "@aixecador": { name: "Director", prompt: "Eres el Director. Tienes la visión artística y guías el rodaje.\n\n🎯 SUGERENCIAS:\n- [Tangible] Guion Técnico / Storyboard.\n- [Intangible] Dirección de actores (Feedback emocional)." },
                    "@dosos": { name: "Script/Continuidad", prompt: "Eres Script/QA. Evitas fallos de raccord y llevas el control del minutaje.\n\n🎯 SUGERENCIAS:\n- [Tangible] Partes de Continuidad (Logs de Rodaje).\n- [Intangible] Alerta de fallo de continuidad en set." },
                    "@baixos": { name: "Cámara/Sonido", prompt: "Eres Operador Técnico. Capturas el material final.\n\n🎯 SUGERENCIAS:\n- [Tangible] Archivos de Brutos de Video/Audio.\n- [Intangible] Sugerencia técnica de iluminación/encuadre." },
                    "@pinya": { name: "Eléctrico/Auxiliar", prompt: "Eres Eléctrico/Runner. Instalas el set y cortas calles.\n\n🎯 SUGERENCIAS:\n- [Tangible] Set de Iluminación Montado.\n- [Intangible] Petición de relevo por descanso." }
                }
            },
            niveles: {
                "@anxaneta": { multiplier: 3.0, precio: 90 },
                "@aixecador": { multiplier: 2.5, precio: 75 },
                "@dosos": { multiplier: 2.0, precio: 60 },
                "@baixos": { multiplier: 1.5, precio: 45 },
                "@pinya": { multiplier: 1.0, precio: 30 }
            }
        };

        this.orbitPrompts = {
            "@anxaneta": "Misión: Toma de decisiones de alto riesgo, visión estratégica y capital.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Plan Estratégico / Presupuesto Aprobado / OKRs.\n- [Intangible] Visión a largo plazo / Liderazgo / Resolución de bloqueos graves.",
            "@aixecador": "Misión: Traducción de estrategia a táctica, coordinación de equipos.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Roadmap del Proyecto / Asignación de Tareas / Cronograma.\n- [Intangible] Coordinación entre áreas / Mentoría de gestión / Priorización.",
            "@dosos": "Misión: Fricción necesaria, validación y prevención de fallos sistémicos.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Reporte de Auditoría / Lista de Fallos (Log) / Métrica de Calidad.\n- [Intangible] Aprobación de paso a producción (Visto Bueno) / Feedback de corrección.",
            "@baixos": "Misión: Generación de valor directo, la 'fuerza bruta' del conocimiento especializado.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Asset Finalizado (Código, Diseño, Pieza Física, Documento redactado).\n- [Intangible] Propuesta de mejora técnica / Duda sobre requerimientos.",
            "@pinya": "Misión: Mantenimiento de la infraestructura para que los demás operen sin fricción.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Inventario Actualizado / Entorno Configurado / Herramientas listas.\n- [Intangible] Alerta de falta de recursos / Soporte logístico."
        };

        this.state = { projects: [], ontology: this.ontologyStatic };
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4.4-state');
        if (saved) {
            try { this.state.projects = JSON.parse(saved).projects || []; } 
            catch (e) { console.error("SOS Kernel Init Error:", e); }
        }
    }

    save() {
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ projects: this.state.projects }));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    // 🚀 RESTAURADO: Cálculo de Resiliencia (Salud del Ecosistema)
    calculateResilience(projectId, specificTxs = null) {
        const p = this.state.projects.find(x => x.id === projectId);
        const txsToEval = specificTxs || (p ? p.transactions : []);
        if (!p || !txsToEval || txsToEval.length === 0) return 100;
        
        const total = txsToEval.length;
        const audits = txsToEval.filter(t => {
            const rFrom = p.roles.find(r => r.id === t.from);
            const rTo = p.roles.find(r => r.id === t.to);
            return (rFrom && rFrom.levelId === '@dosos') || (rTo && rTo.levelId === '@dosos');
        }).length;
        return Math.round((audits / total) * 100) || 100;
    }

    // 🚀 RESTAURADO: Generador de Contexto para IA
    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `PROYECTO: ${p.nombre}\nSECTOR: ${p.sector}\nMISIÓN ESTRATÉGICA: ${p.description || 'Operación estándar'}\n\n`;
        prompt += `[ONTOLOGÍA UNIFICADA DE ROLES]\n`;
        (p.roles || []).filter(r => !r.isArchived).forEach(r => {
            prompt += `- ${r.name} (Nivel: ${r.levelId})\n`;
        });
        return prompt;
    }

    // 🛠️ HELPER PRIVADO: Generador de instancias de proyecto
    _createProjectInstance(id, nombre, sector, ownerId = 'ecosystem-admin') {
        const sKey = sector || 'web3';
        const sectorData = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
        
        const initialRoles = Object.keys(this.ontologyStatic.niveles).map((levelId, idx) => {
            const levelDef = this.ontologyStatic.niveles[levelId];
            const roleMeta = sectorData[levelId];
            return {
                id: `role-${Date.now()}-${idx}`,
                levelId: levelId,
                name: roleMeta?.name || "Rol Base",
                systemPrompt: roleMeta?.prompt || this.orbitPrompts[levelId],
                price: levelDef.precio,
                multiplier: levelDef.multiplier,
                isArchived: false
            };
        });

        return {
            id, nombre, sector: sKey, ownerId,
            description: "Ecosistema de valor autogenerado.",
            roles: initialRoles, transactions: [], usuarios: [], asignaciones: [], ledger: [],
            rondas: [{ id: `ronda-${Date.now()}`, name: 'Fase 1: Bootstrapping', multiplier: 2.0 }]
        };
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                this.state.projects.push(this._createProjectInstance(payload.id, payload.nombre, payload.sector, payload.ownerId));
                break;

            case 'UPDATE_ROLE':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.roleId);
                    if (role) {
                        if (payload.field === 'systemPrompt' && payload.value.length > MAX_PROMPT_LENGTH) {
                            alert("Error: ADN de Prompt demasiado largo (límite físico).");
                            return;
                        }
                        role[payload.field] = payload.value;
                        if (payload.field === 'levelId') {
                            const def = this.ontologyStatic.niveles[payload.value];
                            if (def) { role.price = def.precio; role.multiplier = def.multiplier; }
                        }
                    }
                }
                break;

            case 'SORT_TRANSACTIONS_BY_GRAVITY':
                if (p && p.transactions.length > 0) {
                    p.transactions.forEach(tx => {
                        const emisor = p.roles.find(r => r.id === tx.from);
                        const receptor = p.roles.find(r => r.id === tx.to);
                        if (!emisor || !receptor) return;
                        if (emisor.multiplier > receptor.multiplier) tx.fase = emisor.levelId === '@anxaneta' ? 1 : 2;
                        else if (emisor.multiplier === receptor.multiplier) tx.fase = 3;
                        else if (receptor.levelId === '@dosos') tx.fase = 4;
                        else tx.fase = 5;
                    });
                    p.transactions.sort((a, b) => a.fase - b.fase);
                }
                break;

            case 'IMPORT_BATCH_LEDGER':
                const finalOwner = payload.ownerId || 'ecosystem-admin';
                if (!payload.entries) return;
                
                payload.entries.forEach(entry => {
                    let project = this.state.projects.find(x => x.id === entry.projectId);
                    if (!project) {
                        project = this._createProjectInstance(entry.projectId, "TeamTowers SOS (Importado)", "web3", finalOwner);
                        this.state.projects.push(project);
                    }
                    const role = project.roles.find(r => r.id === entry.roleId || r.levelId === entry.levelId) || project.roles[0];
                    const valor = (entry.horas || 1) * role.multiplier * role.price;

                    project.ledger.push({
                        id: `ldg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        timestamp: entry.timestamp || Date.now(),
                        userId: entry.userId,
                        roleId: role.id,
                        receiverId: entry.receiverId || "ecosistema",
                        description: entry.description,
                        horas: entry.horas,
                        valorCongelado: valor
                    });
                });
                break;

            case 'ADD_USER':
                if (p) {
                    p.usuarios = p.usuarios || [];
                    p.usuarios.push({ id: payload.id || `usr-${Date.now()}`, name: payload.name, joinedAt: Date.now() });
                }
                break;

            case 'ADD_TRANSACTION':
                if (p) {
                    const originRole = p.roles.find(r => r.id === payload.tx.from);
                    const valor = (payload.tx.horas || 1) * (originRole?.multiplier || 1) * (originRole?.price || 0);
                    p.transactions.push({ 
                        ...payload.tx, 
                        valorCongelado: valor, 
                        timestamp: Date.now(), 
                        hash: generateHash(Date.now().toString()) 
                    });
                }
                break;
            
            case 'ASSIGN_USER_ROLE':
                if (p) {
                    p.asignaciones = p.asignaciones || [];
                    if (!p.asignaciones.find(a => a.userId === payload.userId && a.roleId === payload.roleId)) {
                        p.asignaciones.push({ id: `asg-${Date.now()}`, userId: payload.userId, roleId: payload.roleId });
                    }
                }
                break;

            case 'ADD_LEDGER_ENTRY':
                if (p) {
                    p.ledger = p.ledger || [];
                    const role = p.roles.find(r => r.id === payload.roleId);
                    const valor = (parseFloat(payload.horas) || 1) * (role?.multiplier || 1) * (role?.price || 0);
                    p.ledger.push({ id: `ldg-${Date.now()}`, ...payload, valorCongelado: valor, timestamp: Date.now() });
                }
                break;
        }
        this.save();
    }
}
export const store = new TTStore();

// 🧪 DIAGNÓSTICO PRE-VUELO (Ejecutar store.runDiagnostic() en consola)
store.runDiagnostic = () => {
    console.group("🏥 SOS Diagnostic Tool");
    const errors = [];
    const check = (fn) => typeof store[fn] === 'function' ? console.log(`✅ ${fn}: OK`) : errors.push(`❌ ${fn}: Missing`);
    ['calculateResilience', 'getState', 'generateSystemPrompt', 'dispatch'].forEach(check);
    if (errors.length > 0) console.error("CRITICAL ERRORS FOUND:", errors);
    else console.log("%cSYSTEM STABLE", "color: green; font-weight: bold;");
    console.groupEnd();
};const generateHash = (str) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; 
    }
    return Math.abs(hash).toString(16) + Date.now().toString(16);
};

// 🛡️ LÍMITE FÍSICO DE SEGURIDAD (DNA Check)
const MAX_PROMPT_LENGTH = 4000;

export class TTStore {
    constructor() {
        this.ontologyStatic = {
            // Se mantienen tus 50 Prompts Maestros intactos
            sectores: { 
                marketing: { 
                    "@anxaneta": { name: "Strategy", prompt: "Eres el Director de Estrategia. Tu misión es definir el posicionamiento y los KPIs del proyecto.\n\n🎯 SUGERENCIAS:\n- [Tangible] Documento de Estrategia GTM (Go-To-Market).\n- [Intangible] Mentoría de Visión de Marca al equipo." },
                    "@aixecador": { name: "Creative", prompt: "Eres el Director Creativo. Traduces la estrategia en conceptos de campaña ejecutables.\n\n🎯 SUGERENCIAS:\n- [Tangible] Moodboard / Concepto de Campaña.\n- [Intangible] Feedback creativo sobre diseños." },
                    "@dosos": { name: "Content", prompt: "Eres el QA / Content Manager. Auditas que cada pieza cumpla la guía de estilo antes de publicarse.\n\n🎯 SUGERENCIAS:\n- [Tangible] Matriz de Copy Revisada.\n- [Intangible] Aprobación final de publicación." },
                    "@baixos": { name: "Design", prompt: "Eres el Diseñador Gráfico. Produces los assets visuales finales.\n\n🎯 SUGERENCIAS:\n- [Tangible] Banners y Creatividades Exportadas.\n- [Intangible] Propuesta de nueva línea visual." },
                    "@pinya": { name: "Ads", prompt: "Eres el Especialista en Pauta. Ejecutas y optimizas las campañas en plataformas.\n\n🎯 SUGERENCIAS:\n- [Tangible] Reporte de Rendimiento (ROAS).\n- [Intangible] Alerta de desviación de presupuesto." }
                },
                web3: { 
                    "@anxaneta": { name: "Lead Arch.", prompt: "Eres el Arquitecto Web3. Defines la tokenomics y la infraestructura descentralizada.\n\n🎯 SUGERENCIAS:\n- [Tangible] Whitepaper / Litepaper.\n- [Intangible] Resolución de debates sobre escalabilidad." },
                    "@aixecador": { name: "Smart Contracts", prompt: "Eres el Lead de Contratos Inteligentes. Diseñas la lógica on-chain.\n\n🎯 SUGERENCIAS:\n- [Tangible] Arquitectura del Smart Contract (UML).\n- [Intangible] Guía de estándares de seguridad." },
                    "@dosos": { name: "Auditor", prompt: "Eres el Auditor de Seguridad. Buscas vulnerabilidades (Reentrancy, overflow) antes del despliegue.\n\n🎯 SUGERENCIAS:\n- [Tangible] Reporte de Vulnerabilidades (Audit Report).\n- [Intangible] Certificación de Seguridad." },
                    "@baixos": { name: "DApp Dev", prompt: "Eres el Desarrollador Web3. Conectas el frontend con la blockchain (Web3.js/Ethers).\n\n🎯 SUGERENCIAS:\n- [Tangible] Integración de Wallet (Código).\n- [Intangible] Duda sobre manejo de estado asíncrono." },
                    "@pinya": { name: "Validator", prompt: "Eres el Operador de Nodos. Mantienes la infraestructura y monitorizas el RPC.\n\n🎯 SUGERENCIAS:\n- [Tangible] Log de Uptime del Nodo.\n- [Intangible] Soporte en caída de red." }
                },
                gremial: { 
                    "@anxaneta": { name: "Ingeniero", prompt: "Eres el Ingeniero. Realizas cálculos estructurales y firmas el proyecto.\n\n🎯 SUGERENCIAS:\n- [Tangible] Planos Técnicos Visados.\n- [Intangible] Aprobación de viabilidad." },
                    "@aixecador": { name: "Oficial", prompt: "Eres el Jefe de Obra/Taller. Organizas los recursos y planificas las fases.\n\n🎯 SUGERENCIAS:\n- [Tangible] Cronograma de Producción.\n- [Intangible] Instrucciones de ejecución al equipo." },
                    "@dosos": { name: "Calidad", prompt: "Eres el Inspector de Calidad. Revisas que el producto físico cumpla normativas.\n\n🎯 SUGERENCIAS:\n- [Tangible] Certificado de Inspección Técnica.\n- [Intangible] Alerta de defecto de fábrica." },
                    "@baixos": { name: "Especialista", prompt: "Eres el Operario Especialista. Manejas maquinaria y produces la pieza.\n\n🎯 SUGERENCIAS:\n- [Tangible] Lote de Piezas Terminadas.\n- [Intangible] Petición de mantenimiento de máquina." },
                    "@pinya": { name: "Logística", prompt: "Eres el Encargado de Logística. Gestionas almacén y envíos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Inventario de Stock.\n- [Intangible] Notificación de falta de material." }
                },
                saas: { 
                    "@anxaneta": { name: "Product Owner", prompt: "Eres el Product Owner. Maximizas el valor del producto alineando visión y usuario.\n\n🎯 SUGERENCIAS:\n- [Tangible] PRD (Product Requirements Document).\n- [Intangible] Sesión de Alineación Estratégica." },
                    "@aixecador": { name: "Tech Lead", prompt: "Eres el Tech Lead. Traduces requerimientos en arquitectura técnica.\n\n🎯 SUGERENCIAS:\n- [Tangible] Diagrama de Arquitectura de Sistemas.\n- [Intangible] Desbloqueo Técnico a desarrolladores." },
                    "@dosos": { name: "QA Tester", prompt: "Eres el QA. Rompes el software para garantizar resiliencia antes de producción.\n\n🎯 SUGERENCIAS:\n- [Tangible] Log de Bugs Reproducibles.\n- [Intangible] Aprobación (Greenlight) de Pase a Producción." },
                    "@baixos": { name: "Frontend/Backend", prompt: "Eres el Desarrollador. Escribes código limpio, eficiente y mantenible.\n\n🎯 SUGERENCIAS:\n- [Tangible] Código Funcional (Pull Request).\n- [Intangible] Propuesta de Refactorización." },
                    "@pinya": { name: "Soporte/DevOps", prompt: "Eres DevOps/Soporte. Mantienes el CI/CD y resuelves tickets de usuarios.\n\n🎯 SUGERENCIAS:\n- [Tangible] Pipeline CI/CD Desplegado.\n- [Intangible] Resolución de Incidencia Tier 1." }
                },
                legal: { 
                    "@anxaneta": { name: "Socio Director", prompt: "Eres el Socio Director. Defines estrategia legal y captas grandes cuentas.\n\n🎯 SUGERENCIAS:\n- [Tangible] Propuesta de Defensa Estratégica.\n- [Intangible] Negociación de Honorarios." },
                    "@aixecador": { name: "Asociado Senior", prompt: "Eres el Asociado Senior. Diriges la táctica del caso judicial o contrato.\n\n🎯 SUGERENCIAS:\n- [Tangible] Borrador Maestro de Contrato/Demanda.\n- [Intangible] Directrices de jurisprudencia a aplicar." },
                    "@dosos": { name: "Revisor/Compliance", prompt: "Eres el Auditor de Compliance. Previenes riesgos legales y normativos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Matriz de Riesgos Legales.\n- [Intangible] Visto bueno de cumplimiento normativo." },
                    "@baixos": { name: "Abogado Junior", prompt: "Eres el Abogado Junior. Redactas clausulados y buscas jurisprudencia.\n\n🎯 SUGERENCIAS:\n- [Tangible] Informe de Antecedentes Jurisprudenciales.\n- [Intangible] Consulta sobre estrategia procesal." },
                    "@pinya": { name: "Paralegal", prompt: "Eres el Paralegal. Gestionas plazos procesales y documentation.\n\n🎯 SUGERENCIAS:\n- [Tangible] Expediente Judicial Organizado.\n- [Intangible] Alerta de vencimiento de plazo." }
                },
                salud: { 
                    "@anxaneta": { name: "Director Médico", prompt: "Eres el Director Médico. Defines protocolos y políticas de salud.\n\n🎯 SUGERENCIAS:\n- [Tangible] Protocolo Clínico Actualizado.\n- [Intangible] Resolución de conflictos ético-médicos." },
                    "@aixecador": { name: "Jefe de Planta", prompt: "Eres el Jefe de Planta. Coordinas turnos y recursos hospitalarios.\n\n🎯 SUGERENCIAS:\n- [Tangible] Cuadrante de Turnos Mensual.\n- [Intangible] Instrucciones de priorización de pacientes." },
                    "@dosos": { name: "Supervisor", prompt: "Eres el Supervisor. Aseguras la correcta aplicación de protocolos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Reporte de Control de Calidad Asistencial.\n- [Intangible] Corrección de procedimiento a enfermería." },
                    "@baixos": { name: "Especialista", prompt: "Eres el Médico Especialista. Ejecutas tratamientos e intervenciones.\n\n🎯 SUGERENCIAS:\n- [Tangible] Informe de Alta Médica.\n- [Intangible] Interconsulta con otra especialidad." },
                    "@pinya": { name: "Enfermería/Celador", prompt: "Eres el Personal de Base. Cuidas al paciente y gestionas su entorno.\n\n🎯 SUGERENCIAS:\n- [Tangible] Registro de Constantes Vitales.\n- [Intangible] Alerta de empeoramiento del paciente." }
                },
                hosteleria: { 
                    "@anxaneta": { name: "Gerente/Chef", prompt: "Eres el Chef Ejecutivo/Gerente. Creas el menú y controlas la rentabilidad.\n\n🎯 SUGERENCIAS:\n- [Tangible] Escandallo y Fichas Técnicas de Menú.\n- [Intangible] Visión gastronómica para el equipo." },
                    "@aixecador": { name: "Maître", prompt: "Eres el Maître. Diriges el servicio de sala y experiencia del cliente.\n\n🎯 SUGERENCIAS:\n- [Tangible] Distribución de Rango de Mesas.\n- [Intangible] Briefing de ventas pre-servicio." },
                    "@dosos": { name: "Jefe de Rango", prompt: "Eres el Jefe de Rango. Supervisas la calidad de platos antes de salir.\n\n🎯 SUGERENCIAS:\n- [Tangible] Inventario de Vinos/Sala.\n- [Intangible] Control de calidad (Pase) antes del cliente." },
                    "@baixos": { name: "Cocinero/Camarero", prompt: "Eres el Operativo. Cocinas o sirves directamente al cliente.\n\n🎯 SUGERENCIAS:\n- [Tangible] Platos Ejecutados (Servicio).\n- [Intangible] Petición de refuerzo en partida." },
                    "@pinya": { name: "Ayudante", prompt: "Eres el Office/Ayudante. Mantienes limpieza y pre-producción.\n\n🎯 SUGERENCIAS:\n- [Tangible] Mise en place (Preparación) terminada.\n- [Intangible] Alerta de falta de vajilla limpia." }
                },
                educacion: { 
                    "@anxaneta": { name: "Rector/Director", prompt: "Eres el Director. Defines el proyecto educativo del centro.\n\n🎯 SUGERENCIAS:\n- [Tangible] Proyecto Educativo de Centro (PEC).\n- [Intangible] Motivación y liderazgo del claustro." },
                    "@aixecador": { name: "Jefe Estudios", prompt: "Eres el Jefe de Estudios. Planificas horarios y currículos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Planificación de Horarios y Aulas.\n- [Intangible] Mediación en conflictos de departamento." },
                    "@dosos": { name: "Coordinador", prompt: "Eres el Coordinador. Auditas metodologías y evalúas resultados.\n\n🎯 SUGERENCIAS:\n- [Tangible] Informe de Rendimiento Académico.\n- [Intangible] Feedback metodológico a profesores." },
                    "@baixos": { name: "Profesor", prompt: "Eres el Profesor. Impartes conocimiento y evalúas alumnos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Unidades Didácticas / Exámenes Corregidos.\n- [Intangible] Tutoría y orientación a alumnos." },
                    "@pinya": { name: "Administración", prompt: "Eres Conserjería/Admin. Sostienes la operativa del edificio y papeleo.\n\n🎯 SUGERENCIAS:\n- [Tangible] Actas y Matrículas Procesadas.\n- [Intangible] Solicitud de material escolar." }
                },
                construccion: { 
                    "@anxaneta": { name: "Arquitecto", prompt: "Eres el Arquitecto. Creas el diseño conceptual y espacial.\n\n🎯 SUGERENCIAS:\n- [Tangible] Proyecto Básico de Arquitectura.\n- [Intangible] Directriz de estética e iluminación." },
                    "@aixecador": { name: "Jefe de Obra", prompt: "Eres el Jefe de Obra. Coordinas a las subcontratas y plazos.\n\n🎯 SUGERENCIAS:\n- [Tangible] Plan de Certificaciones Mensual.\n- [Intangible] Resolución de solapamiento de oficios." },
                    "@dosos": { name: "Aparejador (QA)", prompt: "Eres el Aparejador. Controlas seguridad, presupuesto y calidad material.\n\n🎯 SUGERENCIAS:\n- [Tangible] Certificación de Calidad de Materiales.\n- [Intangible] Orden de paralización por seguridad." },
                    "@baixos": { name: "Oficial", prompt: "Eres el Oficial. Ejecutas las tareas especializadas (albañilería, fontanería).\n\n🎯 SUGERENCIAS:\n- [Tangible] Tajo/Muro Terminado.\n- [Intangible] Consulta sobre lectura de plano." },
                    "@pinya": { name: "Peón", prompt: "Eres el Peón. Das soporte manual y preparas el entorno.\n\n🎯 SUGERENCIAS:\n- [Tangible] Escombros Retirados / Material Acopiado.\n- [Intangible] Aviso de necesidad de herramientas." }
                },
                audiovisual: { 
                    "@anxaneta": { name: "Productor Ej.", prompt: "Eres el Productor Ejecutivo. Consigues financiación y viabilidad.\n\n🎯 SUGERENCIAS:\n- [Tangible] Presupuesto Cerrado y Contratos.\n- [Intangible] Aprobación de luz verde al proyecto." },
                    "@aixecador": { name: "Director", prompt: "Eres el Director. Tienes la visión artística y guías el rodaje.\n\n🎯 SUGERENCIAS:\n- [Tangible] Guion Técnico / Storyboard.\n- [Intangible] Dirección de actores (Feedback emocional)." },
                    "@dosos": { name: "Script/Continuidad", prompt: "Eres Script/QA. Evitas fallos de raccord y llevas el control del minutaje.\n\n🎯 SUGERENCIAS:\n- [Tangible] Partes de Continuidad (Logs de Rodaje).\n- [Intangible] Alerta de fallo de continuidad en set." },
                    "@baixos": { name: "Cámara/Sonido", prompt: "Eres Operador Técnico. Capturas el material final.\n\n🎯 SUGERENCIAS:\n- [Tangible] Archivos de Brutos de Video/Audio.\n- [Intangible] Sugerencia técnica de iluminación/encuadre." },
                    "@pinya": { name: "Eléctrico/Auxiliar", prompt: "Eres Eléctrico/Runner. Instalas el set y cortas calles.\n\n🎯 SUGERENCIAS:\n- [Tangible] Set de Iluminación Montado.\n- [Intangible] Petición de relevo por descanso." }
                }
            },
            niveles: {
                "@anxaneta": { multiplier: 3.0, precio: 90 },
                "@aixecador": { multiplier: 2.5, precio: 75 },
                "@dosos": { multiplier: 2.0, precio: 60 },
                "@baixos": { multiplier: 1.5, precio: 45 },
                "@pinya": { multiplier: 1.0, precio: 30 }
            }
        };

        this.orbitPrompts = {
            "@anxaneta": "Misión: Toma de decisiones de alto riesgo, visión estratégica y capital.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Plan Estratégico / Presupuesto Aprobado / OKRs.\n- [Intangible] Visión a largo plazo / Liderazgo / Resolución de bloqueos graves.",
            "@aixecador": "Misión: Traducción de estrategia a táctica, coordinación de equipos.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Roadmap del Proyecto / Asignación de Tareas / Cronograma.\n- [Intangible] Coordinación entre áreas / Mentoría de gestión / Priorización.",
            "@dosos": "Misión: Fricción necesaria, validación y prevención de fallos sistémicos.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Reporte de Auditoría / Lista de Fallos (Log) / Métrica de Calidad.\n- [Intangible] Aprobación de paso a producción (Visto Bueno) / Feedback de corrección.",
            "@baixos": "Misión: Generación de valor directo, la 'fuerza bruta' del conocimiento especializado.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Asset Finalizado (Código, Diseño, Pieza Física, Documento redactado).\n- [Intangible] Propuesta de mejora técnica / Duda sobre requerimientos.",
            "@pinya": "Misión: Mantenimiento de la infraestructura para que los demás operen sin fricción.\n\n🎯 SUGERENCIAS GLOBALES:\n- [Tangible] Inventario Actualizado / Entorno Configurado / Herramientas listas.\n- [Intangible] Alerta de falta de recursos / Soporte logístico."
        };

        this.state = { projects: [], ontology: this.ontologyStatic };
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4.4-state');
        if (saved) {
            try { this.state.projects = JSON.parse(saved).projects || []; } 
            catch (e) { console.error("SOS Kernel Error:", e); }
        }
    }

    save() {
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ projects: this.state.projects }));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    // 🛠️ HELPER PRIVADO: Crea la estructura base de un proyecto (Evita duplicar lógica)
    _createProjectInstance(id, nombre, sector, ownerId = 'ecosystem-admin') {
        const sKey = sector || 'web3';
        const sectorData = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
        
        const initialRoles = Object.keys(this.ontologyStatic.niveles).map((levelId, idx) => {
            const levelDef = this.ontologyStatic.niveles[levelId];
            const roleMeta = sectorData[levelId];
            return {
                id: `role-${Date.now()}-${idx}`,
                levelId: levelId,
                name: roleMeta?.name || "Rol Base",
                systemPrompt: roleMeta?.prompt || this.orbitPrompts[levelId],
                price: levelDef.precio,
                multiplier: levelDef.multiplier,
                isArchived: false
            };
        });

        return {
            id, nombre, sector: sKey, ownerId,
            description: "Ecosistema de valor autogenerado.",
            roles: initialRoles,
            transactions: [],
            usuarios: [],
            asignaciones: [],
            ledger: [],
            rondas: [{ id: `ronda-${Date.now()}`, name: 'Fase 1: Bootstrapping', multiplier: 2.0 }]
        };
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                const newProj = this._createProjectInstance(payload.id, payload.nombre, payload.sector, payload.ownerId);
                this.state.projects.push(newProj);
                break;

            case 'UPDATE_ROLE':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.roleId);
                    if (role) {
                        // 🧬 DNA CHECK: Límite físico para evitar corrupción del storage
                        if (payload.field === 'systemPrompt' && payload.value.length > MAX_PROMPT_LENGTH) {
                            alert("Error: El prompt excede el límite físico de seguridad.");
                            return;
                        }
                        role[payload.field] = payload.value;
                        if (payload.field === 'levelId') {
                            const def = this.ontologyStatic.niveles[payload.value];
                            if (def) { role.price = def.precio; role.multiplier = def.multiplier; }
                        }
                    }
                }
                break;

            case 'SORT_TRANSACTIONS_BY_GRAVITY':
                if (p && p.transactions.length > 0) {
                    p.transactions.forEach(tx => {
                        const emisor = p.roles.find(r => r.id === tx.from);
                        const receptor = p.roles.find(r => r.id === tx.to);
                        if (!emisor || !receptor) return;
                        if (emisor.multiplier > receptor.multiplier) tx.fase = emisor.levelId === '@anxaneta' ? 1 : 2;
                        else if (emisor.multiplier === receptor.multiplier) tx.fase = 3;
                        else if (receptor.levelId === '@dosos') tx.fase = 4;
                        else tx.fase = 5;
                    });
                    p.transactions.sort((a, b) => a.fase - b.fase);
                }
                break;

            // 🚀 NUEVO: IMPORTADOR UNIVERSAL CON GOBERNANZA (Dogfooding Ready)
            case 'IMPORT_BATCH_LEDGER':
                if (!payload.entries) return;
                payload.entries.forEach(entry => {
                    let project = this.state.projects.find(x => x.id === entry.projectId);
                    if (!project) {
                        // Si el proyecto no existe (ej. 0x564e41...), lo creamos automáticamente
                        project = this._createProjectInstance(entry.projectId, "TeamTowers SOS (Importado)", "web3", "ecosystem-admin");
                        this.state.projects.push(project);
                    }
                    // Buscamos el rol por nombre o ID base
                    let role = project.roles.find(r => r.id === entry.roleId || r.levelId === entry.levelId);
                    if (!role) role = project.roles[0];

                    const valor = (entry.horas || 1) * role.multiplier * role.price;
                    project.ledger.push({
                        id: `ldg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        timestamp: entry.timestamp || Date.now(),
                        userId: entry.userId,
                        roleId: role.id,
                        receiverId: entry.receiverId || "ecosistema",
                        description: entry.description,
                        horas: entry.horas,
                        valorCongelado: valor
                    });
                });
                break;

            case 'ADD_USER':
                if (p) {
                    p.usuarios = p.usuarios || [];
                    p.usuarios.push({ id: `usr-${Date.now()}`, name: payload.name, joinedAt: Date.now() });
                }
                break;

            case 'ADD_TRANSACTION':
                if (p) {
                    const originRole = p.roles.find(r => r.id === payload.tx.from);
                    const valor = (payload.tx.horas || 1) * (originRole?.multiplier || 1) * (originRole?.price || 0);
                    p.transactions.push({ ...payload.tx, valorCongelado: valor, timestamp: Date.now(), hash: generateHash(Date.now().toString()) });
                }
                break;
            
            case 'ASSIGN_USER_ROLE':
                if (p) {
                    p.asignaciones = p.asignaciones || [];
                    if (!p.asignaciones.find(a => a.userId === payload.userId && a.roleId === payload.roleId)) {
                        p.asignaciones.push({ id: `asg-${Date.now()}`, userId: payload.userId, roleId: payload.roleId });
                    }
                }
                break;

            case 'ADD_LEDGER_ENTRY':
                if (p) {
                    p.ledger = p.ledger || [];
                    const role = p.roles.find(r => r.id === payload.roleId);
                    const valor = (parseFloat(payload.horas) || 1) * (role?.multiplier || 1) * (role?.price || 0);
                    p.ledger.push({ id: `ldg-${Date.now()}`, ...payload, valorCongelado: valor, timestamp: Date.now() });
                }
                break;
        }
        this.save();
    }
}
export const store = new TTStore();
