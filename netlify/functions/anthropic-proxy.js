// ============================================================
//  netlify/functions/anthropic-proxy.js
//  TeamTowers SOS V10 — Proxy server-side para Anthropic API
//  Streaming pass-through — evita timeout 504 de Netlify
// ============================================================

export default async (request, context) => {

    // ── CORS preflight ────────────────────────────────────────
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin':  '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status:  405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status:  400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const { apiKey, _anthropicVersion, _anthropicBeta, ...anthropicPayload } = body;

    if (!apiKey || apiKey.length < 10) {
        return new Response(JSON.stringify({ error: 'Missing or invalid API key' }), {
            status:  400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const headers = {
        'x-api-key':         apiKey,
        'anthropic-version': _anthropicVersion || '2023-06-01',
        'content-type':      'application/json'
    };
    if (_anthropicBeta) headers['anthropic-beta'] = _anthropicBeta;

    try {
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method:  'POST',
            headers,
            body:    JSON.stringify(anthropicPayload)
        });

        // ── Streaming pass-through ────────────────────────────
        // En lugar de esperar .json() completo (que causa 504),
        // devolvemos el body stream directamente al cliente.
        return new Response(anthropicResponse.body, {
            status:  anthropicResponse.status,
            headers: {
                'Content-Type':                anthropicResponse.headers.get('content-type') || 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: `Proxy error: ${err.message}` }), {
            status:  502,
            headers: {
                'Content-Type':                'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

export const config = { path: '/api/anthropic-proxy' };
