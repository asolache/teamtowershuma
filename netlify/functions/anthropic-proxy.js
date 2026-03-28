// ============================================================
//  netlify/functions/anthropic-proxy.js
//  TeamTowers SOS V10 — Proxy server-side para Anthropic API
//  Resuelve CORS: el browser llama a /api/anthropic-proxy,
//  Netlify reenvía server-side a api.anthropic.com.
//  La API Key viaja en el body (cifrada en tránsito por HTTPS).
// ============================================================

export default async (request, context) => {

    // ── Solo POST ─────────────────────────────────────────────
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status:  405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status:  400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { apiKey, ...anthropicPayload } = body;

    if (!apiKey || apiKey.length < 10) {
        return new Response(JSON.stringify({ error: 'Missing or invalid API key' }), {
            status:  400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // ── Reenvío server-side a Anthropic (sin CORS) ────────────
    try {
        // Construir headers — beta si viene en el payload
        const headers = {
            'x-api-key':        apiKey,
            'anthropic-version': anthropicPayload._anthropicVersion || '2023-06-01',
            'content-type':      'application/json'
        };

        if (anthropicPayload._anthropicBeta) {
            headers['anthropic-beta'] = anthropicPayload._anthropicBeta;
        }

        // Limpiar campos internos del proxy antes de reenviar
        delete anthropicPayload._anthropicVersion;
        delete anthropicPayload._anthropicBeta;

        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method:  'POST',
            headers,
            body:    JSON.stringify(anthropicPayload)
        });

        const responseData = await anthropicResponse.json();

        return new Response(JSON.stringify(responseData), {
            status:  anthropicResponse.status,
            headers: {
                'Content-Type':                'application/json',
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
