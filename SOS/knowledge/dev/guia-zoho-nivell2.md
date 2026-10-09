# Guia · el formulari del web entra a Zoho CRM sol (nivell 2)

**Per a qui:** l'Àlvar, o qui administri el Netlify i el Zoho del pilot. No cal
programar: són tres valors que es copien d'un lloc a un altre.

**Què fa:** cada enviament verificat del formulari *Diagnòstic d'organització*
(`SOS/diagnostic-org.html`) es converteix en un lead a Zoho CRM. El fa la funció
`netlify/functions/submission-created.mjs`. Netlify la crida sola quan un
formulari rep un enviament; el que Netlify marca com a brossa no hi arriba.

**Mentre no hi hagi les claus, no fa res.** El formulari segueix arribant com
fins ara, i el registre de la funció diu `sense-config`.

## 1 · Crear el client a Zoho (5 minuts)

1. Entra a la consola d'API de Zoho del teu centre de dades. Si el compte és
   europeu, és `https://api-console.zoho.eu`.
2. **Add Client › Self Client › Create.** Apunta el **Client ID** i el
   **Client Secret**.
3. A la pestanya **Generate Code**:
   - **Scope:** `ZohoCRM.modules.leads.CREATE`. Només crear leads: la funció
     no podrà llegir ni esborrar res.
   - **Time duration:** 10 minuts. **Description:** «web teamtowershuma».
   - **Create.** Copia el codi que surt. Caduca en 10 minuts.

## 2 · Canviar el codi per un *refresh token* (1 minut)

Des d'un terminal, posant-hi els teus valors. Si el compte no és europeu,
canvia `.eu` pel teu domini:

```bash
curl -s -X POST https://accounts.zoho.eu/oauth/v2/token \
  -d grant_type=authorization_code \
  -d client_id=EL_CLIENT_ID \
  -d client_secret=EL_CLIENT_SECRET \
  -d code=EL_CODI_DEL_PAS_1
```

La resposta porta un `refresh_token`: és el que no caduca. **No el desis enlloc
més que al pas 3**: ni al repositori, ni en un correu, ni al CRM.

## 3 · Posar-ho a Netlify (2 minuts)

Netlify › el lloc › **Site configuration › Environment variables › Add a
variable**. Marca-les com a secretes si t'ho ofereix:

| Variable | Valor |
|---|---|
| `ZOHO_CLIENT_ID` | el Client ID |
| `ZOHO_CLIENT_SECRET` | el Client Secret |
| `ZOHO_REFRESH_TOKEN` | el refresh token del pas 2 |
| `ZOHO_DC` | `eu`, que és el valor per defecte. També pot ser `com`, `in`, `com.au` o `jp` |
| `ZOHO_DRY_RUN` | `1` per a la primera prova |

Després, **Deploys › Trigger deploy**, perquè la funció llegeixi les
variables.

## 4 · Provar-ho

1. Amb `ZOHO_DRY_RUN=1`, envia el diagnòstic des del web amb dades de prova.
2. A Netlify › **Logs › Functions › submission-created** ha de sortir
   `"estat":"prova"` i la llista de camps. Mai hi surten les dades: és a
   propòsit.
3. Esborra `ZOHO_DRY_RUN`, torna a desplegar i envia'n un altre. Al registre
   ha de sortir `"estat":"creat"`, i el lead ha d'aparèixer a Zoho › Leads.

**Si surt `error`,** el motiu diu on és el problema:

- `token: invalid_code` vol dir que el refresh token no és bo. Torna al pas 1.
- `lead: INVALID_DATA` o `MANDATORY_NOT_FOUND` vol dir que el teu Zoho té
  algun camp obligatori de més. Digue'ns quin.

## Opcional

- `ZOHO_LEAD_SOURCE`: si a Zoho tens un valor a la llista *Lead Source* per al
  web (per exemple, «Web»), posa'l aquí i els leads el portaran. Si el valor no
  és a la llista, Zoho el rebutja. Per això, per defecte, l'origen va escrit a
  la descripció.
- **Un altre formulari:** s'afegeix a `FORMULARIS` dins de la funció, a
  propòsit i amb el seu test. Cap formulari nou envia dades al CRM sense que
  algú ho hagi decidit.

## Per què és així

- **La clau és al servidor.** Una clau en un HTML públic és una clau
  regalada.
- **El permís és el mínim.** Amb només crear leads, si la clau s'escapa no
  serveix per llegir els teus clients.
- **El registre no porta dades personals.** El llegeix qui administra el
  lloc.
- **El formulari ja ho diu.** El text d'enviament diu que les dades passen al
  CRM (Zoho).
