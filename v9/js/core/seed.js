// v9/js/core/seed.js
export const CoreSeed = {
    async inject(KB) {
        // Comprobamos si el ADN ya ha sido inyectado previamente
        const check = await KB.getNode('skill_vna_architect');
        if (check) return; // Semilla ya plantada, abortar inyección

        console.log("🌱 [Antigravity Kernel] Inyectando ADN de Skills Core en la Matriz...");

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
            }
        ];

        for (const skill of coreSkills) {
            await KB.saveNode(skill);
        }
        console.log("🌳 [Antigravity Kernel] ADN inyectado con éxito.");
    }
};
