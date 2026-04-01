// =============================================================================
// TEAMTOWERS SOS V10.1 — AI ACTIVITY MONITOR
// Ruta: ia/dev/js/components/AiActivityMonitor.js
// Monitor global de actividad IA · Coste en tokens · Visible en todas las vistas
// Se monta en el sidebar cuando no estamos en el Chat
// =============================================================================

import { store } from '../core/store.js';

const PROVIDER_ICONS = { anthropic:'🟣', openai:'🟢', deepseek:'🔵', gemini:'🟡' };
const MAX_LOG = 12; // máximo de entradas en el log visible

export class AiActivityMonitor {

    static _instance = null;

    // ── mount — monta el monitor en el elemento dado ─────────────
    static mount(containerId = 'aiMonitorMount') {
        if (this._instance) this._instance.destroy();
        this._instance = new AiActivityMonitor(containerId);
        this._instance.init();
        return this._instance;
    }

    static unmount() {
        this._instance?.destroy();
        this._instance = null;
    }

    constructor(containerId) {
        this.containerId = containerId;
        this.log         = [];         // últimas N llamadas
        this.sessionCost = 0;          // coste acumulado en esta sesión
        this.sessionTokens = 0;
        this._handler    = null;
        this._active     = false;      // hay una llamada en curso
    }

    init() {
        this._handler = (e) => this._onActivity(e.detail);
        window.addEventListener('sos:ai-activity', this._handler);

        // Escuchar inicio de llamada (spinner)
        this._startHandler = () => { this._active = true;  this._render(); };
        this._endHandler   = () => { this._active = false; };
        window.addEventListener('sos:ai-start',   this._startHandler);
        window.addEventListener('sos:ai-activity', this._endHandler);

        this._render();
    }

    destroy() {
        if (this._handler)      window.removeEventListener('sos:ai-activity', this._handler);
        if (this._startHandler) window.removeEventListener('sos:ai-start',    this._startHandler);
        const el = document.getElementById(this.containerId);
        if (el) el.innerHTML = '';
    }

    _onActivity(detail) {
        this.sessionCost   += detail.costUSD || 0;
        this.sessionTokens += detail.totalTokens || 0;

        this.log.unshift({
            provider:    detail.provider,
            tokens:      detail.totalTokens || 0,
            cost:        detail.costUSD || 0,
            latency:     detail.latencyMs || 0,
            timestamp:   detail.timestamp || Date.now()
        });

        if (this.log.length > MAX_LOG) this.log.pop();

        this._active = false;
        this._render();

        // Persistir en el ledger global (sin proyecto activo)
        this._logToGlobalLedger(detail);
    }

    _logToGlobalLedger(detail) {
        try {
            const state   = store.getState();
            const project = state.projects?.find(p => !p.isArchived);
            if (!project) return; // sin proyecto activo, no hay donde guardar
            store.dispatch({
                type: 'ADD_LEDGER_ENTRY',
                payload: {
                    projectId: project.id,
                    entry: {
                        type:        'AI_COST',
                        provider:    detail.provider,
                        cost_usd:    detail.costUSD,
                        tokens:      detail.totalTokens,
                        latencyMs:   detail.latencyMs,
                        timestamp:   detail.timestamp,
                        descripcion: `API call · ${detail.provider} · ${detail.totalTokens}t`
                    }
                }
            });
        } catch(_) {}
    }

    _render() {
        const el = document.getElementById(this.containerId);
        if (!el) return;

        const providerColor = { anthropic:'#e040fb', openai:'#00e676', deepseek:'#6366f1', gemini:'#ffd740' };
        const logHtml = this.log.slice(0, 6).map(e => {
            const age = Math.round((Date.now() - e.timestamp) / 1000);
            const ageStr = age < 60 ? `${age}s` : `${Math.round(age/60)}m`;
            return `
            <div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                <span style="font-size:0.75rem;flex-shrink:0;">${PROVIDER_ICONS[e.provider]||'⚪'}</span>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.65rem;color:${providerColor[e.provider]||'#888'};font-family:var(--font-mono);">${e.tokens.toLocaleString()}t</span>
                        <span style="font-size:0.6rem;color:#333;">${ageStr}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                        <span style="font-size:0.6rem;color:#333;">${e.latency}ms</span>
                        <span style="font-size:0.6rem;color:var(--accent-red,#ff5252);font-family:var(--font-mono);">$${e.cost.toFixed(5)}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        el.innerHTML = `
        <style>
            #${this.containerId} {
                padding: 8px 10px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 10px;
                font-family: var(--font-mono, monospace);
                margin: 8px 0;
            }
            .aim-header {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 6px; justify-content: space-between;
            }
            .aim-title {
                font-size: 0.6rem; color: #444; text-transform: uppercase;
                font-weight: bold; letter-spacing: 1px;
                display: flex; align-items: center; gap: 5px;
            }
            .aim-pulse {
                width: 5px; height: 5px; border-radius: 50%;
                background: ${this._active ? '#ff9100' : (this.log.length ? '#00e676' : '#333')};
                ${this._active ? 'animation: pulse 0.8s infinite;' : ''}
                flex-shrink: 0;
            }
            .aim-session {
                display: flex; gap: 8px; margin-bottom: 6px;
                padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .aim-stat { flex: 1; text-align: center; }
            .aim-stat-val { font-size: 0.72rem; font-weight: bold; color: white; }
            .aim-stat-lbl { font-size: 0.55rem; color: #444; text-transform: uppercase; }
        </style>

        <div class="aim-header">
            <div class="aim-title">
                <div class="aim-pulse"></div>
                IA Activity
            </div>
            ${this._active ? '<span style="font-size:0.6rem;color:#ff9100;animation:pulse 1s infinite;">procesando…</span>' : ''}
        </div>

        <div class="aim-session">
            <div class="aim-stat">
                <div class="aim-stat-val" style="color:var(--accent-red,#ff5252);">$${this.sessionCost.toFixed(4)}</div>
                <div class="aim-stat-lbl">sesión</div>
            </div>
            <div class="aim-stat">
                <div class="aim-stat-val" style="color:#6366f1;">${this.sessionTokens.toLocaleString()}</div>
                <div class="aim-stat-lbl">tokens</div>
            </div>
            <div class="aim-stat">
                <div class="aim-stat-val" style="color:#555;">${this.log.length}</div>
                <div class="aim-stat-lbl">llamadas</div>
            </div>
        </div>

        ${logHtml || '<div style="font-size:0.62rem;color:#2a2a2a;text-align:center;padding:4px;">Sin actividad</div>'}`;
    }
}

// ── Emitir sos:ai-start antes de cada llamada fetch (para el spinner) ────────
// Monkey-patch mínimo de fetch — solo para llamadas a la API de Anthropic
const _origFetch = window.fetch;
window.fetch = function(url, ...args) {
    if (typeof url === 'string' && url.includes('anthropic.com')) {
        window.dispatchEvent(new CustomEvent('sos:ai-start'));
    }
    return _origFetch.call(this, url, ...args);
};
