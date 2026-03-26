// v9/js/core/seed.js
export const CoreSeed = {
    async inject(KB) {
        const check = await KB.getNode('skill_vna_architect');
        if (check) return; 

        console.log("🌱 [Antigravity Kernel] Inyectando ADN de Skills Core (Incluyendo Codex & UI) en la Matriz...");

        const coreSkills = [
            {
                id: 'skill_vna_architect',
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: 'Arquitecto VNA (Value Network Analysis)',
                description: 'Diseña topologías de red, nodos y flujos de valor a partir de una visión fundacional.',
                keywords: ['#vna', '#architecture', '#core_sos'],
                content: `
### 1. VNA Flow (Flujo de Valor)
- **Inputs Requeridos:** Nombre del proyecto, Arquetipo y Visión Fundacional (Pitch).
- **Outputs Generados:** Un JSON estructurado con roles (sillas) y transacciones (flujos tangibles e intangibles).

### 2. SOP (Standard Operating Procedure)
1. Analiza la visión del usuario. Si es ambigua, detente y exige contexto.
2. Identifica los Nodos (Roles) necesarios para sostener el ecosistema. Asigna a cada uno un multiplicador de riesgo (Slicing Pie) y un arquetipo (Guardian).
3. Traza las transacciones PULL entre los nodos. Toda transacción debe tener un entregable claro (template) y un tiempo estimado (horas).
4. No dividas la red en eras temporales. Diseña la máquina en estado estacionario.
5. Devuelve ÚNICAMENTE el formato JSON esperado por el Kernel.

### 3. SOC (Criterios de Aceptación)
- [ ] El JSON devuelto es válido y parseable.
- [ ] Contiene un mínimo de 3 roles estructurales.
- [ ] Existen transacciones PULL donde el entregable de un nodo es el input del siguiente.
                `.trim()
            },
            {
                id: 'skill_slicing_pie_notary',
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: 'Notaría TDD (Slicing Pie)',
                description: 'Audita el Proof of Work (entregables) contra los SOCs y certifica el minado de Slices.',
                keywords: ['#tdd', '#audit', '#slicing_pie', '#core_sos'],
                content: `
### 1. VNA Flow
- **Inputs Requeridos:** Entregable del usuario (Proof of Work) y Checklist de SOCs (Condiciones).
- **Outputs Generados:** Validación TDD (JSON booleano) que autoriza o bloquea el Slicing Pie.

### 2. SOP (Standard Operating Procedure)
1. Lee el entregable (texto, link a PR, o documento).
2. Lee cada punto del \`soc_checklist\`.
3. Actúa como un juez inmutable: Si el entregable NO demuestra explícitamente que cumple un SOC, márcalo como \`false\`.
4. No asumas ni infieras éxito. La carga de la prueba recae en el trabajador.
5. Devuelve el JSON con las aserciones: \`{ "soc_id": true/false }\`.

### 3. SOC (Criterios de Aceptación)
- [ ] La evaluación es determinista (Cero ambigüedad emocional).
- [ ] Se devuelven todos los IDs de los SOCs solicitados.
                `.trim()
            },
            {
                id: 'skill_ikigai_ontologist',
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: 'Ontología y Propósito Humano',
                description: 'Analiza el Soulbound Token (SBT) de un nodo y genera su matriz Ikigai.',
                keywords: ['#ikigai', '#dharma', '#core_sos'],
                content: `
### 1. VNA Flow
- **Inputs Requeridos:** Historial de Slices, Skills adquiridas (SBTs) y borrador de intereses.
- **Outputs Generados:** Propuesta poética pero accionable de Ikigai y un plan de inversión en la red.

### 2. SOP (Standard Operating Procedure)
1. Analiza las horas minadas por el nodo para detectar en qué es objetivamente bueno (Vocación).
2. Cruza esto con sus intereses declarados (Pasión).
3. Identifica dónde la red tiene huecos rentables (Profesión/Misión).
4. Redacta los 4 cuadrantes del Ikigai con un tono inspirador (Arquetipo Caregiver/Sage).
5. Genera tags semánticos para anclar al usuario en el Córtex 3D.

### 3. SOC (Criterios de Aceptación)
- [ ] El tono es empático y constructivo.
- [ ] Las sugerencias están basadas en datos reales del Ledger (si existen).
                `.trim()
            },
            {
                id: 'skill_legal_drafting',
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: 'Pacto de Socios Dinámico',
                description: 'Genera contratos legales y cláusulas de Slicing Pie basados en el Ledger actual.',
                keywords: ['#legal', '#smart_contract', '#core_sos'],
                content: `
### 1. VNA Flow
- **Inputs Requeridos:** Cap Table del proyecto y roles activos.
- **Outputs Generados:** Documento Legal (Markdown) listo para firma.

### 2. SOP (Standard Operating Procedure)
1. Extrae los porcentajes actuales del Cap Table.
2. Redacta las cláusulas de "Recuperación de Slices" (Good Leaver / Bad Leaver).
3. Estipula que la gobernanza es proporcional a los Slices minados hasta la serie A.
4. Formatea el texto como un contrato profesional y blindado.

### 3. SOC (Criterios de Aceptación)
- [ ] Refleja exactamente la matemática del Slicing Pie.
- [ ] No inventa cláusulas fuera de la equidad dinámica.
                `.trim()
            },
            // 🔥 FRENTE B: SKILLS PARA OMNI-PAPER Y CÓDIGO 🔥
            {
                id: 'skill_ui_component_forge',
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: 'Forja de UI Antigravity (@web_deployer)',
                description: 'Genera código frontend (HTML/CSS) limpio, responsivo y visualmente deslumbrante, adaptado a la identidad de un ecosistema pero siguiendo las leyes del Codex TeamTowers.',
                keywords: ['#ui', '#frontend', '#antigravity', '#web_deployer'],
                content: `
### 1. VNA Flow
- **Inputs Requeridos:** Propósito del componente (ej: "Landing Page", "Dashboard de Afiliados"), Paleta/Identidad del cliente, Datos de la red.
- **Outputs Generados:** JSON estricto conteniendo campos \`html\`, \`css\` y \`js\` separados, listos para ser inyectados y renderizados a pantalla completa en el Omni-Paper.

### 2. SOP (Standard Operating Procedure)
1. **Leyes Antigravity:** PROHIBIDO usar frameworks como React, Vue, Tailwind o librerías CDN externas. Todo el código debe ser HTML5 Semántico y CSS3 puro.
2. **Variables del Sistema:** La interfaz debe heredar los colores de la red usando variables CSS globales si están disponibles. Asume la existencia de:
   - \`var(--bg-dark)\`, \`var(--bg-panel)\`.
   - \`var(--accent-blue)\`, \`var(--accent-green)\`, \`var(--accent-purple)\`, \`var(--accent-orange)\`.
   - \`var(--font-main)\`, \`var(--font-mono)\`.
3. **Glassmorphism:** Para tarjetas y paneles, usa el patrón visual estándar del Kernel: 
   \`background: rgba(20,20,25,0.8); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px;\`
4. **Responsividad Suprema:** Obligatorio usar CSS Grid (ej: \`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\`) para que las vistas se adapten perfectamente a dispositivos móviles y al modo pantalla completa.
5. **Formato de Salida:** Devuelve el código encapsulado en el siguiente formato JSON para que el Omni-Paper lo ejecute en el Sandbox:
   \`{ "type": "web_component", "html": "...", "css": "...", "js": "..." }\`

### 3. SOC (Criterios de Aceptación / Evals)
- [ ] El JSON devuelto es estrictamente válido (Cuidado con escapar comillas dobles en el HTML).
- [ ] No contiene la etiqueta \`<style>\` dentro del \`html\` (el CSS debe ir en su campo correspondiente).
- [ ] Las clases CSS son únicas (usa prefijos, ej: \`.lp-card\` en vez de \`.card\`) para no colisionar con el Kernel.
                `.trim()
            },
            {
                id: 'skill_vault_monetization',
                type: 'skill', category: 'skill', projectId: 'global', targetId: 'global',
                title: 'Bóvedas de Liquidez (Fiat/Web3)',
                description: 'Desarrolla la lógica transaccional de pagos (Stripe MVP y MetaMask) conectada al sistema de comisiones (Afiliados).',
                keywords: ['#monetization', '#web3', '#stripe', '#codex_developer'],
                content: `
### 1. VNA Flow
- **Inputs Requeridos:** Identificador de proyecto, coste del servicio, ID del afiliado (si aplica).
- **Outputs Generados:** Script \`js\` modular para gestionar el checkout.

### 2. SOP (Standard Operating Procedure)
1. **El Margen del Protocolo:** Todo script de cobro debe contemplar el *Protocol Fee* de TeamTowers (ej: 35%).
2. **Sistema Web3 (MetaMask):**
   - Comprueba \`if(typeof window.ethereum !== 'undefined')\`.
   - Programa la solicitud de cuentas \`eth_requestAccounts\`.
   - La transacción debe enviar fondos a un "Splitter Smart Contract" si existe, o simular la división de la liquidez.
3. **Sistema Fiat (Stripe MVP):**
   - Programa un mock o llamada \`fetch\` al endpoint \`/api/checkout\` enviando el \`projectId\` y el \`application_fee_amount\` necesario para el routing del dinero.
4. **Respuesta Visual:** El JS debe contener lógica para modificar el DOM y mostrar "⏳ Procesando..." o "✅ Pago completado" al usuario final.

### 3. SOC (Criterios de Aceptación / Evals)
- [ ] El script contiene un bloque \`try/catch\` para gestionar rechazos de conexión (ej: usuario cierra MetaMask).
- [ ] El script no bloquea el Event Loop del navegador.
                `.trim()
            }
        ];

        for (const skill of coreSkills) {
            await KB.saveNode(skill);
        }
        console.log("🌳 [Antigravity Kernel] ADN inyectado con éxito (Codex & Deployer operativos).");
    }
};
