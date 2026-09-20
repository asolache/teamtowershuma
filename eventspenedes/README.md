# eventspenedes.com

Web provisional de **Events Penedès** — producción de eventos, localizaciones y
actividades en el Alt Penedès, para agencias, espacios y empresas finales.

Sitio estático (HTML + CSS + JS vanilla, sin frameworks ni build). Se publica con
GitHub Pages sobre el dominio `eventspenedes.com`.

---

## Estructura

```
/
├── index.html          Landing (one-page, ES por defecto)
├── 404.html            Página de error
├── CNAME               Dominio personalizado para GitHub Pages
├── .nojekyll           Evita el procesado Jekyll de GitHub Pages
├── robots.txt
├── sitemap.xml
├── css/styles.css      Hoja de estilos única (tokens Antigravity)
├── js/i18n.js          Traducciones CA / ES / EN + navegación móvil
└── assets/
    ├── favicon.svg
    └── og-image.png    Imagen para redes sociales (1200×630)
```

## Idiomas

El HTML está escrito en castellano. `js/i18n.js` guarda un diccionario de catalán
e inglés y sustituye los nodos con `data-i18n`. Para tocar un texto:

1. En castellano → edita directamente el `index.html`.
2. En catalán o inglés → edita la clave correspondiente en `js/i18n.js`.

El idioma inicial se detecta del navegador y se recuerda en `localStorage`.

## Desarrollo local

No hay build. Basta con servir la carpeta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Publicación (GitHub Pages)

1. `Settings → Pages → Source: Deploy from a branch`, rama `main`, carpeta `/ (root)`.
2. `Settings → Pages → Custom domain`: `eventspenedes.com` (el fichero `CNAME` ya lo fija).
3. Marcar **Enforce HTTPS** cuando GitHub haya emitido el certificado (puede tardar
   unos minutos tras propagarse el DNS).

## DNS del dominio

En el panel del registrador de `eventspenedes.com`:

| Tipo  | Nombre | Valor                    |
|-------|--------|--------------------------|
| A     | `@`    | `185.199.108.153`        |
| A     | `@`    | `185.199.109.153`        |
| A     | `@`    | `185.199.110.153`        |
| A     | `@`    | `185.199.111.153`        |
| CNAME | `www`  | `<usuario>.github.io.`   |

(Opcionalmente los mismos registros en AAAA: `2606:50c0:8000::153`, `...8001::153`,
`...8002::153`, `...8003::153`.)

## Pendiente antes de dar la web por definitiva

- Fotografías reales de La Masia y del Taller de Castells.
- Datos concretos de los espacios: dirección, aforo, accesos, aparcamiento.
- Buzón `hola@eventspenedes.com` operativo (o sustituir por el correo definitivo).
- Formulario con backend real (Formspree, Netlify Forms o similar) en lugar de `mailto:`.
- Aviso legal, política de privacidad y cookies si se añade analítica.

---

© 2026 Events Penedès · Un proyecto de TeamTowers Humà
