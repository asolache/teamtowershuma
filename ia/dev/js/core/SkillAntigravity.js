// =============================================================================
// TEAMTOWERS SOS V10.1 — SKILL ANTIGRAVITY COMPILER
// Ruta: ia/dev/js/core/SkillAntigravity.js
// Convierte una skill humana en su versión Antigravity:
// — optimizada para consumo por agente (menos tokens, mismo resultado)
// — con URL canónica que apunta a la versión humana completa
// — con referencias a nodos KB en lugar de texto completo
// =============================================================================

import { KB }           from './kb.js';
import { store }        from './store.js';
import { Orchestrator } from './Orchestrator.js';

// ── Schema de una Skill Antigravity ──────────────────────────────────────────
// {
//   id:           'antigravity_skill_xxx',
//   type:         'skill_antigravity',
//   sourceId:     'skill_xxx',           // ID de la skill humana original
//   title:        'Nombre comprimido',
//   canonicalUrl: '/ia/dev/kb/skill_xxx', // URL a la versión humana
//   mission:      'Una frase: qué hace esta skill',
//   socs:         ['SOC 1', 'SOC 2'],    // criterios de calidad comprimidos
//   outputSchema: { type, fields },      // schema del output esperado
//   nodeRefs:     ['kb_id_1', 'kb_id_2'],// IDs de nodos KB relevantes
//   tokenCount:   N,                     // tokens estimados de esta versión
//   compression:  0.XX,                  // ratio vs skill original
//   version:      1,
//   createdAt:    timestamp
// }

export class SkillAntigravity {

    // ══════════════════════════════════════════════════════════════
    //  compile — genera la versión Antigravity de una skill
    //  Usa Claude para comprimir, luego persiste en KB
    // ══════════════════════════════════════════════════════════════
    static async compile(skillId, projectId = 'global') {
        await KB.init();
        const skill = await KB.getNode(skillId);
        if (!skill) throw new Error(`SkillAntigravity: skill ${skillId} no encontrada en KB`);

        // Construir contexto de referencias del KB
        const allNodes   = await KB.getAllNodes();
        const refs       = (skill.references || []).map(rid => allNodes.find(n => n.id === rid)).filter(Boolean);
        const evals      = (skill.evals      || []).map(eid => allNodes.find(n => n.id === eid)).filter(Boolean);

        const refsCtx = refs.map(r => `- [${r.id}] ${r.title}: ${(r.description || '').substring(0, 80)}`).join('\n');
        const evalsCtx = evals.map(e => `- ${e.criteria || e.title}`).join('\n');

        // Llamar al LLM para comprimir
        const response = await Orchestrator.callLLM({
            preferredEngine: 'anthropic',
            systemPrompt: `Eres @agent_skill_crafter especializado en comprimir skills para consumo por agentes IA.
Tu objetivo: generar una versión Antigravity de la skill — máximo 30% de los tokens originales, mismo resultado.

Reglas de compresión Antigravity:
1. mission: UNA frase que capture el propósito completo (max 15 palabras)
2. socs: máximo 5 criterios de calidad, escritos como condiciones verificables
3. outputSchema: schema JSON del output esperado (type + fields esenciales)
4. nodeRefs: IDs de nodos KB que el agente debe consultar (solo los críticos)
5. NUNCA incluir ejemplos — el agente los busca via nodeRefs
6. NUNCA repetir información disponible en nodeRefs

Devuelve SOLO JSON con esta estructura exacta:
{
  "mission": "...",
  "socs": ["SOC 1", "SOC 2", ...],
  "outputSchema": { "type": "...", "fields": ["field1", "field2"] },
  "nodeRefs": ["kb_id_1", "kb_id_2"],
  "compressionNotes": "Por qué se comprimió así"
}`,
            userPrompt: `SKILL ORIGINAL: ${skill.title}
DESCRIPCIÓN: ${skill.description || ''}
CONTENIDO:
${(typeof skill.content === 'string' ? skill.content : JSON.stringify(skill.content)).substring(0, 3000)}

REFERENCIAS DISPONIBLES:
${refsCtx || 'Ninguna'}

EVALS/SOCs EXISTENTES:
${evalsCtx || 'Ninguno'}`,
            responseFormat: 'json_object',
            temperature: 0.2
        });

        const compiled = response.content;

        // Calcular ratio de compresión
        const originalTokens   = this._estimateTokens(typeof skill.content === 'string' ? skill.content : JSON.stringify(skill.content));
        const antigravityTokens = this._estimateTokens(JSON.stringify(compiled));
        const compression       = antigravityTokens / Math.max(originalTokens, 1);

        // Construir el nodo Antigravity
        const agId = `antigravity_${skillId}_v${Date.now()}`;
        const agNode = {
            id:           agId,
            type:         'skill_antigravity',
            category:     'skill_antigravity',
            sourceId:     skillId,
            title:        `[AG] ${skill.title}`,
            canonicalUrl: `/ia/dev/kb/${skillId}`,
            mission:      compiled.mission      || skill.description || '',
            socs:         compiled.socs         || [],
            outputSchema: compiled.outputSchema || { type: 'text', fields: [] },
            nodeRefs:     compiled.nodeRefs     || [],
            compressionNotes: compiled.compressionNotes || '',
            tokenCount:   antigravityTokens,
            originalTokens,
            compression:  Number(compression.toFixed(3)),
            version:      1,
            projectId,
            keywords:     ['antigravity', skillId, ...(skill.keywords || [])],
            createdAt:    Date.now()
        };

        await KB.saveNode(agNode);

        // Actualizar la skill original con referencia a su versión AG
        const updatedSkill = { ...skill, antigravityId: agId };
        await KB.saveNode(updatedSkill);

        return agNode;
    }

    // ══════════════════════════════════════════════════════════════
    //  buildPromptForAgent — construye el system prompt AG para un agente
    //  Dado un agNode, genera el prompt mínimo que el agente necesita
    // ══════════════════════════════════════════════════════════════
    static buildPromptForAgent(agNode, agentId = null) {
        const socs = (agNode.socs || []).map((s, i) => `${i+1}. ${s}`).join('\n');
        const refs = (agNode.nodeRefs || []).map(id => `→ kb:${id}`).join(' ');
        const schema = agNode.outputSchema
            ? `OUTPUT: ${agNode.outputSchema.type}${agNode.outputSchema.fields?.length ? ` {${agNode.outputSchema.fields.join(', ')}}` : ''}`
            : '';

        return `[SKILL:${agNode.sourceId}]
MISSION: ${agNode.mission}
${socs ? `SOCs:\n${socs}` : ''}
${schema}
${refs ? `REFS: ${refs}` : ''}
${agNode.canonicalUrl ? `FULL: ${agNode.canonicalUrl}` : ''}`.trim();
    }

    // ══════════════════════════════════════════════════════════════
    //  getOrCompile — obtiene la versión AG si existe, si no la compila
    // ══════════════════════════════════════════════════════════════
    static async getOrCompile(skillId, projectId = 'global') {
        await KB.init();
        const skill = await KB.getNode(skillId);
        if (!skill) throw new Error(`Skill ${skillId} no encontrada`);

        // Si ya tiene versión AG, devolverla
        if (skill.antigravityId) {
            const existing = await KB.getNode(skill.antigravityId);
            if (existing) return existing;
        }

        // Si no, compilar
        return await this.compile(skillId, projectId);
    }

    // ══════════════════════════════════════════════════════════════
    //  buildAgentContext — construye el contexto completo para un agente
    //  a partir de sus skills equipadas, en formato Antigravity
    // ══════════════════════════════════════════════════════════════
    static async buildAgentContext(userId, maxTokens = 800) {
        await KB.init();
        const state    = store.getState();
        const user     = state.globalUsers.find(u => u.id === userId);
        if (!user) return '';

        const skillIds = user.profile?.active_skills || [];
        const parts    = [];
        let tokenCount = 0;

        for (const sid of skillIds) {
            try {
                const agNode = await this.getOrCompile(sid);
                const prompt = this.buildPromptForAgent(agNode, userId);
                const tokens = this._estimateTokens(prompt);
                if (tokenCount + tokens > maxTokens) break;
                parts.push(prompt);
                tokenCount += tokens;
            } catch (_) { /* skill no disponible, continuar */ }
        }

        return parts.join('\n\n---\n\n');
    }

    // ══════════════════════════════════════════════════════════════
    //  listAntigravitySkills — lista todas las skills AG en KB
    // ══════════════════════════════════════════════════════════════
    static async listAntigravitySkills() {
        await KB.init();
        const all = await KB.getAllNodes();
        return all
            .filter(n => n.type === 'skill_antigravity')
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // ── Privados ──────────────────────────────────────────────────

    static _estimateTokens(text) {
        // Estimación rápida: ~4 chars por token
        return Math.ceil((text || '').length / 4);
    }
}
