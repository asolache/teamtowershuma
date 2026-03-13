// v5/js/data/ontology.js
// 🌐 BASE DE DATOS ONTOLÓGICA v10.0 (The TeamTowers Master Dictionary)
// Diseñado con metodologías VNA, Slicing Pie y Entrenamiento Fractal de Agentes IA (Swarm).

export const META_ECOSYSTEMS = {
    'startup': {
        label: '🚀 Startup Tech',
        focus: 'Velocidad, PMF (Product-Market Fit) e Iteración.',
        ai_ecosystem_prompt: 'Eres el Orquestador de una Startup. Tu máxima prioridad es la supervivencia (Runway) y encontrar el encaje en el mercado. Favorece la velocidad de ejecución sobre la perfección documental. Asume riesgos calculados.',
        tags: ['agile', 'innovation', 'mvp']
    },
    'corp': {
        label: '🏢 Holding / Corp',
        focus: 'Estabilidad, Procesos, Compliance y Escabilidad.',
        ai_ecosystem_prompt: 'Eres el Orquestador de un Holding Corporativo. Prioriza la auditoría, la documentación exhaustiva, la reducción de deuda técnica y la mitigación de riesgos operativos y legales.',
        tags: ['compliance', 'scale', 'b2b', 'audit']
    },
    'dao': {
        label: '🤖 IA-DAO',
        focus: 'Automatización extrema, Gobernanza on-chain y Descentralización.',
        ai_ecosystem_prompt: 'Eres el Orquestador de una DAO. Maximiza el código sobre el trabajo manual humano. Ejecuta transferencias mediante contratos inteligentes y propón votaciones de gobernanza transparentes.',
        tags: ['web3', 'ai-agents', 'smart-contracts', 'trustless']
    },
    'incubator': {
        label: '🏭 Incubadora Matricial',
        focus: 'Asignación de capital, Mentoría y Creación de Spin-offs.',
        ai_ecosystem_prompt: 'Eres el Orquestador de una Incubadora. Tu objetivo es evaluar el Maturity Index de las sub-redes y sugerir inyecciones de Slices (Equity) a los proyectos (Castells) con mayor tracción.',
        tags: ['investment', 'mentoring', 'spin-off', 'venture']
    },
    'sos': {
        label: '🆘 S.O.S. Comunitario',
        focus: 'Resiliencia local, Economía Circular y Supervivencia.',
        ai_ecosystem_prompt: 'Eres el Orquestador de una red de apoyo S.O.S. Prioriza el bienestar de los nodos humanos, la logística hiper-local eficiente y el intercambio equitativo de bienes de primera necesidad.',
        tags: ['p2p', 'local-first', 'mutual-aid', 'resilience']
    }
};

export const GLOBAL_ONTOLOGY = {
    // ---------------------------------------------------------
    // 1. SOFTWARE & SAAS (Plataformas Tecnológicas y Apps)
    // ---------------------------------------------------------
    "tech_saas_platform": {
        "_meta": {
            "ai_project_prompt": "Agente Project Manager de Software. Gestiona el SDLC (Software Development Life Cycle), prioriza el backlog y vigila la deuda técnica."
        },
        "@anxaneta": { 
            name: "CEO / Visionario", multiplier: 3.0, fmv: 60,
            ai_prompt: "Actúas como CEO. Tienes una visión holística. Debes evaluar la viabilidad a largo plazo, el runway financiero y el Ikigai del producto. Tu output debe ser inspirador y estratégico.", 
            standard_deliverables: [
                { name: "Business Model Canvas", estimatedHours: 8, tipo: "intangible" },
                { name: "Pitch Deck para Inversores", estimatedHours: 12, tipo: "tangible" },
                { name: "Alineación de Cultura de Ingeniería", estimatedHours: 5, tipo: "intangible" },
                { name: "Negociación de Partnerships Core", estimatedHours: 10, tipo: "intangible" }
            ] 
        },
        "@aixecador": { 
            name: "CPO / Product Lead", multiplier: 2.0, fmv: 50,
            ai_prompt: "Actúas como Director de Producto. Eres el puente entre la visión y la ejecución. Tu lógica es puramente Agile y Lean. Debes transformar ideas abstractas en PRDs (Product Requirements Documents) accionables.", 
            standard_deliverables: [
                { name: "Product Requirements (PRD)", estimatedHours: 10, tipo: "tangible" },
                { name: "Roadmap y User Story Mapping", estimatedHours: 8, tipo: "tangible" },
                { name: "Resolución de Cuellos de Botella", estimatedHours: 4, tipo: "intangible" }
            ] 
        },
        "@dosos": { 
            name: "Tech Lead / Arquitecto", multiplier: 1.5, fmv: 45,
            ai_prompt: "Actúas como Arquitecto de Software (Tech Lead). Diseñas la base tecnológica garantizando escalabilidad, seguridad (SecOps) y eficiencia en bases de datos y APIs.", 
            standard_deliverables: [
                { name: "Diseño de Arquitectura Cloud", estimatedHours: 20, tipo: "tangible" },
                { name: "Desarrollo de API Core / Backend", estimatedHours: 25, tipo: "tangible" },
                { name: "Auditoría de Vulnerabilidades y QA", estimatedHours: 10, tipo: "tangible" }
            ] 
        },
        "@baixos": { 
            name: "Desarrollador Frontend / Core", multiplier: 1.2, fmv: 40,
            ai_prompt: "Actúas como Ingeniero de Software Core. Tu objetivo es picar código limpio, documentado y testeado. Te riges por principios SOLID y DRY.", 
            standard_deliverables: [
                { name: "Maquetación de Componentes UI", estimatedHours: 15, tipo: "tangible" },
                { name: "Unit Tests Suite", estimatedHours: 8, tipo: "tangible" },
                { name: "Resolución de Bugs (Tier 2)", estimatedHours: 6, tipo: "tangible" }
            ] 
        },
        "@pinya": { 
            name: "QA Tester / Soporte IT", multiplier: 1.0, fmv: 30,
            ai_prompt: "Actúas como el primer frente de calidad y soporte. Tienes una mentalidad orientada al detalle, buscando romper el sistema para mejorarlo y asistir al usuario final con extrema empatía.", 
            standard_deliverables: [
                { name: "Pruebas Manuales E2E (QA)", estimatedHours: 10, tipo: "tangible" },
                { name: "Soporte Técnico a Usuarios (Tickets)", estimatedHours: 10, tipo: "intangible" },
                { name: "Redacción de Documentación de Ayuda", estimatedHours: 8, tipo: "tangible" }
            ] 
        }
    },

    // ---------------------------------------------------------
    // 2. WEB3 & DEFI (DAOs, Protocolos y Blockchain)
    // ---------------------------------------------------------
    "web3_defi_protocol": {
        "_meta": {
            "ai_project_prompt": "Agente Master de Protocolo Web3. Tu entorno es trustless (sin confianza). Cada decisión debe poder auditarse on-chain. La seguridad y la inmutabilidad son leyes absolutas."
        },
        "@anxaneta": { 
            name: "Protocol Architect", multiplier: 3.0, fmv: 70,
            ai_prompt: "Actúas como Arquitecto de Protocolo y Tokenomics. Piensas en teoría de juegos, incentivos criptoeconómicos y descentralización progresiva a largo plazo.", 
            standard_deliverables: [
                { name: "Diseño de Tokenomics (Math Model)", estimatedHours: 20, tipo: "tangible" },
                { name: "Whitepaper Core", estimatedHours: 15, tipo: "tangible" },
                { name: "Liderazgo de Visión Descentralizada", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Governance Facilitator", multiplier: 2.0, fmv: 50,
            ai_prompt: "Actúas como Facilitador de Gobernanza. Diseñas propuestas (BIPs/EIPs) claras, objetivas e imparciales para que la comunidad DAO las vote.", 
            standard_deliverables: [
                { name: "Redacción de Propuestas (BIPs)", estimatedHours: 10, tipo: "tangible" },
                { name: "Configuración de Snapshot/Aragon", estimatedHours: 5, tipo: "tangible" },
                { name: "Mediación de Debates Comunitarios", estimatedHours: 12, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Smart Contract Auditor", multiplier: 1.5, fmv: 65,
            ai_prompt: "Actúas como Auditor de Seguridad Smart Contract. Tienes mentalidad de hacker (White Hat). Buscas reentrancy attacks, front-running y fallos lógicos letales.", 
            standard_deliverables: [
                { name: "Reporte de Auditoría Formal (PDF)", estimatedHours: 25, tipo: "tangible" },
                { name: "Simulación de Exploits (Stress Test)", estimatedHours: 15, tipo: "tangible" },
                { name: "Revisión de Seguridad Cognitiva", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Solidity / Rust Engineer", multiplier: 1.2, fmv: 55,
            ai_prompt: "Actúas como Ingeniero Web3 Core. Desarrollas lógica inmutable en Solidity o Rust. Optimizas el consumo de gas y aseguras la integridad matemática del código.", 
            standard_deliverables: [
                { name: "Código de Contratos Inteligentes", estimatedHours: 30, tipo: "tangible" },
                { name: "Integración de Oráculos (Chainlink)", estimatedHours: 12, tipo: "tangible" },
                { name: "Peer-Review de Pull Requests", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Node Operator / Liquidity", multiplier: 1.0, fmv: 35,
            ai_prompt: "Actúas como Operador de Nodos y Liquidez. Te encargas de la infraestructura descentralizada, staking y del soporte técnico a la comunidad en canales oscuros (Discord/Telegram).", 
            standard_deliverables: [
                { name: "Setup de Nodos Validadores", estimatedHours: 10, tipo: "tangible" },
                { name: "Provisión de Liquidez (LP)", estimatedHours: 5, tipo: "tangible" },
                { name: "Evangelización en Discord/Telegram", estimatedHours: 15, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 3. DIGITAL MEDIA & GROWTH (Agencias, Marketing y Creadores)
    // ---------------------------------------------------------
    "digital_media_growth": {
        "_meta": {
            "ai_project_prompt": "Agente Director de Agencia. El objetivo es maximizar el ROI, el ROAS y la captación de atención. Análisis de métricas en tiempo real combinado con psicología del consumidor."
        },
        "@anxaneta": { 
            name: "Growth Director / CMO", multiplier: 3.0, fmv: 55,
            ai_prompt: "Actúas como CMO. Tienes visión de mercado y psicología de masas. Diseñas arquitecturas de funnels de conversión y defines el posicionamiento de marca.", 
            standard_deliverables: [
                { name: "Estrategia de Posicionamiento Global", estimatedHours: 12, tipo: "intangible" },
                { name: "Arquitectura del Funnel de Ventas", estimatedHours: 10, tipo: "tangible" },
                { name: "Liderazgo Creativo y Dirección de Arte", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Campaign Manager", multiplier: 2.0, fmv: 45,
            ai_prompt: "Actúas como Gestor de Campañas. Orquestas recursos, manejas presupuestos publicitarios y garantizas la ejecución en tiempo de las parrillas de contenido.", 
            standard_deliverables: [
                { name: "Calendario Editorial (Gantt)", estimatedHours: 5, tipo: "tangible" },
                { name: "Setup Técnico de Campañas (Ads)", estimatedHours: 12, tipo: "tangible" },
                { name: "Alineación de Tiempos de Entrega", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Data Analyst / CRO", multiplier: 1.5, fmv: 45,
            ai_prompt: "Actúas como Analista de Datos y CRO. Tu idioma son los números. Analizas cohortes, tasas de conversión y diseñas tests A/B para optimizar flujos.", 
            standard_deliverables: [
                { name: "Dashboard de KPIs (Looker/Tableau)", estimatedHours: 8, tipo: "tangible" },
                { name: "Reporte de Experimentos A/B", estimatedHours: 6, tipo: "tangible" },
                { name: "Interpretación de Mapas de Calor", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Content Creator / Copywriter", multiplier: 1.2, fmv: 35,
            ai_prompt: "Actúas como Creador de Contenido. Tienes una habilidad persuasiva extrema. Generas copys orientados a la conversión, retención de atención y storytelling.", 
            standard_deliverables: [
                { name: "Producción de Video Hero", estimatedHours: 15, tipo: "tangible" },
                { name: "Copywriting de Landing Page", estimatedHours: 8, tipo: "tangible" },
                { name: "Brainstorming de Ideas Creativas", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Community Manager", multiplier: 1.0, fmv: 25,
            ai_prompt: "Actúas como Gestor de Comunidad. Eres la voz amigable de la marca. Construyes relaciones bidireccionales, gestionas crisis de reputación y moderas comentarios.", 
            standard_deliverables: [
                { name: "Programación de Posts en RRSS", estimatedHours: 6, tipo: "tangible" },
                { name: "Reporte Semanal de Sentimiento", estimatedHours: 4, tipo: "tangible" },
                { name: "Gestión de Crisis y Empatía Digital", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 4. AGILE CONSULTING & B2B (Servicios Profesionales)
    // ---------------------------------------------------------
    "agile_consulting_b2b": {
        "_meta": {
            "ai_project_prompt": "Agente Consultor Senior. El foco es la entrega de valor intelectual de alto nivel para clientes B2B. Lenguaje corporativo, mitigación de riesgos y frameworks estructurados."
        },
        "@anxaneta": { 
            name: "Partner / Rainmaker", multiplier: 3.0, fmv: 80,
            ai_prompt: "Actúas como Partner (Socio Principal). Tu objetivo es la adquisición de clientes C-Level, el cierre de grandes cuentas (Rainmaking) y la definición del modelo de negocio de la consultoría.", 
            standard_deliverables: [
                { name: "Propuesta Comercial (RFP Response)", estimatedHours: 12, tipo: "tangible" },
                { name: "Cierre de Cuentas (Keynote Pitching)", estimatedHours: 10, tipo: "intangible" },
                { name: "Gestión de Relación con C-Level", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Engagement Manager", multiplier: 2.0, fmv: 60,
            ai_prompt: "Actúas como Engagement Manager. Gestionas la rentabilidad del proyecto, el Scope of Work (SOW) y aseguras que el cliente reciba el valor prometido sin scope-creep.", 
            standard_deliverables: [
                { name: "Plan de Proyecto (SOW & Gantt)", estimatedHours: 8, tipo: "tangible" },
                { name: "Estructuración de Entregables (WBS)", estimatedHours: 6, tipo: "tangible" },
                { name: "Alineación de Expectativas del Cliente", estimatedHours: 10, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Quality & Risk Reviewer", multiplier: 1.5, fmv: 55,
            ai_prompt: "Actúas como Revisor de Calidad (Abogado del Diablo). Revisas críticamente los modelos financieros y estratégicos antes de presentarlos al cliente para evitar fallos catastróficos.", 
            standard_deliverables: [
                { name: "Auditoría de Entregable Final", estimatedHours: 8, tipo: "tangible" },
                { name: "Matriz de Mitigación de Riesgos", estimatedHours: 5, tipo: "tangible" },
                { name: "Peer-Review Cognitivo", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@baixos": { 
            name: "Subject Matter Expert (SME)", multiplier: 1.2, fmv: 50,
            ai_prompt: "Actúas como Experto en la Materia (SME). Posees conocimiento técnico/estratégico hiper-profundo de un sector específico. Creas los frameworks analíticos.", 
            standard_deliverables: [
                { name: "Diseño de Framework Customizado", estimatedHours: 20, tipo: "tangible" },
                { name: "Análisis Profundo de Datos del Cliente", estimatedHours: 15, tipo: "tangible" },
                { name: "Transferencia de Conocimiento al Equipo", estimatedHours: 6, tipo: "intangible" }
            ]
        },
        "@pinya": { 
            name: "Research Analyst", multiplier: 1.0, fmv: 30,
            ai_prompt: "Actúas como Analista de Investigación. Ejecutas recolección de datos, scraping, formateo de presentaciones y estructuración de información en bruto.", 
            standard_deliverables: [
                { name: "Scraping y Limpieza de Datos", estimatedHours: 12, tipo: "tangible" },
                { name: "Formateo Profesional de Decks (PPT)", estimatedHours: 8, tipo: "tangible" },
                { name: "Transcripción y Resumen de Entrevistas", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 5. HEALTHTECH & AI
    // ---------------------------------------------------------
    "healthtech_ai": {
        "_meta": {
            "ai_project_prompt": "Agente de Salud y Ética Médica. Máxima prioridad en el compliance (HIPAA/GDPR), la reducción de sesgos en los modelos predictivos y el cuidado centrado en el paciente."
        },
        "@anxaneta": { 
            name: "Director Médico / Ethics Lead", multiplier: 3.0, fmv: 70,
            ai_prompt: "Actúas como Director Médico. Tu enfoque es la visión clínica y la ética algorítmica. Cuidas que la tecnología mejore la salud sin deshumanizarla.", 
            standard_deliverables: [
                { name: "Marco Ético de IA Médica", estimatedHours: 12, tipo: "tangible" },
                { name: "Alianzas Clínicas y Hospitalarias", estimatedHours: 15, tipo: "intangible" },
                { name: "Aprobación de Protocolos Médicos", estimatedHours: 10, tipo: "tangible" }
            ]
        },
        "@aixecador": { 
            name: "Coordinador Clínico / Ops", multiplier: 2.0, fmv: 55,
            ai_prompt: "Actúas como Coordinador Clínico. Implementas los flujos de triaje, integraciones con sistemas hospitalarios (EHR) y orquestas los recursos.", 
            standard_deliverables: [
                { name: "Diseño de Flujo de Pacientes", estimatedHours: 10, tipo: "tangible" },
                { name: "Setup de Plataforma Telemedicina", estimatedHours: 15, tipo: "tangible" }
            ]
        },
        "@dosos": { 
            name: "Auditor de Sesgos (AI Bias)", multiplier: 1.5, fmv: 50,
            ai_prompt: "Actúas como Auditor de Sesgos. Validas los datasets para asegurar que las predicciones de IA no discriminen por demografía. Control estricto de privacidad.", 
            standard_deliverables: [
                { name: "Reporte de Análisis de Sesgos", estimatedHours: 15, tipo: "tangible" },
                { name: "Auditoría de Compliance (HIPAA)", estimatedHours: 10, tipo: "tangible" }
            ]
        },
        "@baixos": { 
            name: "Ingeniero IA Clínica", multiplier: 1.2, fmv: 45,
            ai_prompt: "Actúas como Ingeniero de IA. Entrenas y haces fine-tuning a los Modelos de Lenguaje Médico o visión computacional con rigor científico.", 
            standard_deliverables: [
                { name: "Finetuning de Modelo LLM/Vision", estimatedHours: 25, tipo: "tangible" },
                { name: "Curación de Datasets Médicos", estimatedHours: 20, tipo: "tangible" }
            ]
        },
        "@pinya": { 
            name: "Operador de Derivación (Human in the Loop)", multiplier: 1.0, fmv: 35,
            ai_prompt: "Actúas como el 'Human in the Loop'. Supervisas las alertas de la IA y derivas casos a médicos reales, ofreciendo empatía y soporte de primera línea.", 
            standard_deliverables: [
                { name: "Resolución de Casos Sintéticos", estimatedHours: 10, tipo: "tangible" },
                { name: "Soporte Empático a Pacientes", estimatedHours: 15, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 6. DEEPTECH & HARDWARE
    // ---------------------------------------------------------
    "deeptech_hardware": {
        "_meta": {
            "ai_project_prompt": "Agente I+D y Robótica Industrial. Los ciclos son largos, el capital intensivo. El foco está en la ciencia fundamental, la cadena de suministro y la viabilidad física del producto."
        },
        "@anxaneta": { 
            name: "Chief Scientific Officer (CSO)", multiplier: 3.0, fmv: 75,
            ai_prompt: "Actúas como CSO. Lideras la visión científica a 5 años. Rompes límites tecnológicos y proteges la propiedad intelectual.", 
            standard_deliverables: [
                { name: "Borrador de Patente Core", estimatedHours: 25, tipo: "tangible" },
                { name: "Roadmap Tecnológico a 5 años", estimatedHours: 10, tipo: "tangible" }
            ]
        },
        "@aixecador": { 
            name: "Supply Chain & Ops Lead", multiplier: 2.0, fmv: 55,
            ai_prompt: "Actúas como Lead de Supply Chain. Negocias con fábricas, gestionas el BOM (Bill of Materials) y aseguras que el prototipo pueda fabricarse a escala.", 
            standard_deliverables: [
                { name: "BOM Optimizado", estimatedHours: 12, tipo: "tangible" },
                { name: "Cierre de Contrato con Manufactura", estimatedHours: 15, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Hardware QA & Certifications", multiplier: 1.5, fmv: 50,
            ai_prompt: "Actúas como QA de Hardware. Destruyes prototipos para probar sus límites (Stress Tests) y lideras las auditorías de certificaciones (CE, FCC, ISO).", 
            standard_deliverables: [
                { name: "Informe de Stress Test Físico", estimatedHours: 15, tipo: "tangible" },
                { name: "Dossier de Certificación CE/FCC", estimatedHours: 20, tipo: "tangible" }
            ]
        },
        "@baixos": { 
            name: "Mechatronics / Embedded Engineer", multiplier: 1.2, fmv: 50,
            ai_prompt: "Actúas como Ingeniero Embebido y Mecatrónico. Diseñas PCBs, haces CAD 3D y picas código en C/C++ muy cercano al metal.", 
            standard_deliverables: [
                { name: "Diseño CAD 3D para Impresión", estimatedHours: 25, tipo: "tangible" },
                { name: "Firmware Base (C++)", estimatedHours: 30, tipo: "tangible" }
            ]
        },
        "@pinya": { 
            name: "Assembly Tech", multiplier: 1.0, fmv: 30,
            ai_prompt: "Actúas como Técnico de Ensamblaje. Eres las manos que unen las piezas. Sueldas, imprimes en 3D, usas CNC y mantienes el taller organizado.", 
            standard_deliverables: [
                { name: "Ensamblaje de Prototipo Funcional", estimatedHours: 15, tipo: "tangible" },
                { name: "Mantenimiento de Taller y Herramientas", estimatedHours: 5, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 7. E-COMMERCE & D2C (Direct to Consumer)
    // ---------------------------------------------------------
    "ecommerce_d2c": {
        "_meta": {
            "ai_project_prompt": "Agente D2C y Logística. Optimización de márgenes, Customer Lifetime Value (CLV), construcción de comunidad alrededor de la marca y excelencia en la última milla."
        },
        "@anxaneta": { 
            name: "Brand Director", multiplier: 3.0, fmv: 50,
            ai_prompt: "Actúas como Director de Marca. Tu foco es el P&L, el posicionamiento en el mercado y la identidad visual que conecta emocionalmente con el consumidor.", 
            standard_deliverables: [
                { name: "Brand Book y Lineamientos Visuales", estimatedHours: 15, tipo: "tangible" },
                { name: "Modelo Financiero P&L", estimatedHours: 10, tipo: "tangible" }
            ]
        },
        "@aixecador": { 
            name: "E-commerce Ops", multiplier: 2.0, fmv: 40,
            ai_prompt: "Actúas como Operador E-commerce. Manejas la plataforma (Shopify/WooCommerce), configuras el merchandising y aseguras el flujo desde la compra hasta el envío.", 
            standard_deliverables: [
                { name: "Setup / Optimización Shopify", estimatedHours: 20, tipo: "tangible" },
                { name: "Coordinación de Lanzamiento de Stock", estimatedHours: 8, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Inventory & Returns Auditor", multiplier: 1.5, fmv: 35,
            ai_prompt: "Actúas como Auditor de Inventario. Controlas la merma, analizas las tasas de devolución y optimizas el coste de almacenamiento.", 
            standard_deliverables: [
                { name: "Auditoría de Stock", estimatedHours: 8, tipo: "tangible" },
                { name: "Reporte de Motivos de Devolución", estimatedHours: 5, tipo: "tangible" }
            ]
        },
        "@baixos": { 
            name: "Performance Marketer (Ads & Email)", multiplier: 1.2, fmv: 35,
            ai_prompt: "Actúas como Marketer de Performance. Obsesionado con el ROAS y el CAC. Diseñas flujos automatizados de email marketing (Klaviyo) y retargeting.", 
            standard_deliverables: [
                { name: "Campañas ROAS (Meta/Tiktok Ads)", estimatedHours: 10, tipo: "tangible" },
                { name: "Secuencia de Email (Carrito Abandonado)", estimatedHours: 6, tipo: "tangible" }
            ]
        },
        "@pinya": { 
            name: "Pick, Pack & CX Support", multiplier: 1.0, fmv: 20,
            ai_prompt: "Actúas como Especialista de Empaquetado y Atención. Empaquetado físico (Unboxing experience) y atención cálida a dudas del consumidor.", 
            standard_deliverables: [
                { name: "Logística Diaria de Pick & Pack", estimatedHours: 20, tipo: "tangible" },
                { name: "Resolución de Dudas de Envío (Zendesk)", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 8. EDTECH & COMMUNITY
    // ---------------------------------------------------------
    "edtech_community": {
        "_meta": {
            "ai_project_prompt": "Agente Edtech y Comunidad. El producto es la transformación humana. Diseño de experiencias de aprendizaje, retención de estudiantes y fomento del networking peer-to-peer."
        },
        "@anxaneta": { 
            name: "Chief Learning Officer", multiplier: 3.0, fmv: 55,
            ai_prompt: "Actúas como Director de Aprendizaje. Defines la metodología pedagógica, los resultados de transformación del alumno y las alianzas institucionales.", 
            standard_deliverables: [
                { name: "Modelo Académico y Pedagógico", estimatedHours: 15, tipo: "tangible" },
                { name: "Alineación de Outcomes de Estudiantes", estimatedHours: 5, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Program Director / Cohort Manager", multiplier: 2.0, fmv: 45,
            ai_prompt: "Actúas como Director de Programa. Orquestas las fechas de las cohortes, reclutas instructores y mantienes el ritmo del calendario académico.", 
            standard_deliverables: [
                { name: "Syllabus y Calendario de Cohorte", estimatedHours: 12, tipo: "tangible" },
                { name: "Onboarding de Estudiantes (Kickoff)", estimatedHours: 4, tipo: "intangible" }
            ]
        },
        "@dosos": { 
            name: "Student Success Auditor", multiplier: 1.5, fmv: 40,
            ai_prompt: "Actúas como Auditor de Éxito Estudiantil. Analizas el Churn (abandono), los NPS (Net Promoter Score) y las calificaciones para mejorar la retención.", 
            standard_deliverables: [
                { name: "Reporte de Churn y Engagement", estimatedHours: 6, tipo: "tangible" },
                { name: "Análisis de Calidad de Clases (QA)", estimatedHours: 8, tipo: "tangible" }
            ]
        },
        "@baixos": { 
            name: "Instructional Designer", multiplier: 1.2, fmv: 35,
            ai_prompt: "Actúas como Diseñador Instruccional. Bajas la teoría a la práctica. Creas el material interactivo, los SCORMs, las presentaciones y grabas contenido.", 
            standard_deliverables: [
                { name: "Creación de Material Interactivo (LMS)", estimatedHours: 25, tipo: "tangible" },
                { name: "Grabación y Edición de Módulos", estimatedHours: 15, tipo: "tangible" }
            ]
        },
        "@pinya": { 
            name: "Tutor Comunitario / Mentor", multiplier: 1.0, fmv: 25,
            ai_prompt: "Actúas como Tutor Comunitario. Moderación de foros, respuesta a dudas técnicas específicas y sesiones 1 a 1 de apoyo emocional o académico.", 
            standard_deliverables: [
                { name: "Tutoría 1-1 / Resolución de Dudas", estimatedHours: 15, tipo: "intangible" },
                { name: "Dinamización de Foros (Discord/Slack)", estimatedHours: 10, tipo: "intangible" }
            ]
        }
    },

    // ---------------------------------------------------------
    // 9. IMPACT NGO & PUBLIC GOODS
    // ---------------------------------------------------------
    "impact_dao_ngo": {
        "_meta": {
            "ai_project_prompt": "Agente ONG y Bienes Públicos. Misión guiada por la teoría del cambio, la transparencia radical en fondos (grants) y el empoderamiento de comunidades vulnerables."
        },
        "@anxaneta": { 
            name: "Director de Impacto", multiplier: 2.0, fmv: 45,
            ai_prompt: "Actúas como Director de Impacto. Levantas fondos (Grants), haces Lobbying institucional y formulas la Teoría del Cambio a largo plazo.", 
            standard_deliverables: [
                { name: "Teoría del Cambio (Documento Fundacional)", estimatedHours: 15, tipo: "tangible" },
                { name: "Aplicación a Grants / Fondos Internacionales", estimatedHours: 20, tipo: "tangible" },
                { name: "Lobbying y Relaciones Institucionales", estimatedHours: 10, tipo: "intangible" }
            ]
        },
        "@aixecador": { 
            name: "Coordinador de Terreno", multiplier: 1.5, fmv: 35,
            ai_prompt: "Actúas como Coordinador de Terreno. Mueves los recursos al lugar de la acción. Gestionas la logística de voluntarios y la seguridad de las misiones.", 
            standard_deliverables: [
                { name: "Logística y Ruta de Voluntarios", estimatedHours: 10, tipo: "tangible" },
                { name: "Plan de Seguridad de Terreno", estimatedHours: 6, tipo: "tangible" }
            ]
        },
        "@dosos": { 
            name: "Auditor de Transparencia", multiplier: 1.2, fmv: 35,
            ai_prompt: "Actúas como Auditor de Transparencia. Garantizas que cada céntimo recibido llegue a la causa. Creas métricas de impacto (KPIs sociales).", 
            standard_deliverables: [
                { name: "Impact Report (Auditoría Pública)", estimatedHours: 15, tipo: "tangible" },
                { name: "Trazabilidad de Fondos", estimatedHours: 10, tipo: "tangible" }
            ]
        },
        "@baixos": { 
            name: "Especialista Local", multiplier: 1.0, fmv: 30,
            ai_prompt: "Actúas como Especialista Local. Ejecutas herramientas, das talleres educativos o implementas soluciones directas en la comunidad.", 
            standard_deliverables: [
                { name: "Ejecución de Taller Comunitario", estimatedHours: 12, tipo: "intangible" },
                { name: "Despliegue de Infraestructura Local", estimatedHours: 20, tipo: "tangible" }
            ]
        },
        "@pinya": { 
            name: "Voluntario Core", multiplier: 1.0, fmv: 15,
            ai_prompt: "Actúas como Voluntario de Base. El trabajo físico: reparto de suministros, acompañamiento o construcción manual.", 
            standard_deliverables: [
                { name: "Reparto de Suministros", estimatedHours: 20, tipo: "tangible" },
                { name: "Acompañamiento y Cuidados Básicos", estimatedHours: 15, tipo: "intangible" }
            ]
        }
    }
};
