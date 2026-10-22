# Registro de actividades de tratamiento

*Art. 30 RGPD. Generado por `node SOS/tools/rgpd.js` desde `tratamientos.json`: no se edita a mano.*

## Responsable

- **Alvaro Solache**, autónomo. Marcas: TeamTowers, TeamTowers Humà, Events Penedès.
- Contacto: el correo de la página de contacto (/qui-som).
- No hace falta delegado de protección de datos: no se tratan datos a gran escala ni categorías especiales (art. 37 RGPD).

## Tratamientos

### Clientes y clientes potenciales

- **Para qué:** Contestar a quien nos escribe, preparar el diagnóstico, la propuesta y el proyecto, y hacer el seguimiento comercial.
- **Base legal:** Medidas precontractuales y contrato (art. 6.1.b RGPD); la casilla de privacidad del espacio de cliente deja constancia de que se ha informado.
- **De quién:** Personas que piden un diagnóstico, una visita, un pedido o abren su espacio de cliente.
- **Qué datos:** Nombre, correo, teléfono si lo dan, cargo, organización, web, lo que cuentan del proyecto y el dibujo de quién tienen alrededor (nombres de grupos, no de personas). Si usan la IA del espacio de cliente: cómo se han identificado (correo o usuario de GitHub) y cuánto la han usado, guardado con una huella del correo y no con el correo (Netlify Blobs); el texto no se guarda. Cuando hay propuesta: lo que incluye su proyecto, las horas y el precio, guardado también con la huella (Netlify Blobs) y visible solo para quien entra con esa cuenta.
- **Por dónde llegan:** los formularios `diagnostic-org`, `comanda`, `visita`, `cliente-web`, `incidencia`.
- **Quién los trata por encargo:** Netlify, Zoho, GitHub, Anthropic.
- **Cuánto tiempo:** Mientras dure la relación y, si no hay contrato, 2 años desde el último contacto.
- **Fuera de la UE:** A EE. UU. por Netlify, GitHub y Anthropic, con el Marco de Privacidad de Datos o cláusulas tipo.

### Facturación y cobros

- **Para qué:** Cobrar los proyectos y las cuotas, emitir facturas y cumplir con Hacienda.
- **Base legal:** Contrato (art. 6.1.b) y obligación legal (art. 6.1.c): normativa fiscal y mercantil.
- **De quién:** Clientes que pagan.
- **Qué datos:** Nombre o razón social, NIF, dirección de facturación, correo, importes y fechas. Los datos de la tarjeta los guarda Stripe.
- **Quién los trata por encargo:** Stripe, Zoho.
- **Cuánto tiempo:** 6 años (Código de Comercio, art. 30) y 4 años a efectos fiscales.
- **Fuera de la UE:** Las que haga Stripe, con sus garantías.

### Directorio del SOS

- **Para qué:** Mostrar las fichas que cada persona u organización decide publicar.
- **Base legal:** Consentimiento de quien publica su ficha (art. 6.1.a).
- **De quién:** Personas y organizaciones que publican su ficha.
- **Qué datos:** Lo que cada uno pone en su ficha pública.
- **Quién los trata por encargo:** Supabase, Netlify.
- **Cuánto tiempo:** Hasta que la persona la retira.
- **Fuera de la UE:** Ninguna fuera de la UE prevista.

## Encargados y sus contratos (DPA)

| Proveedor | Para qué | Dónde | Contrato | Estado |
|---|---|---|---|---|
| Netlify | alojamiento de la web y formularios | EE. UU. (Marco de Privacidad de Datos UE-EE. UU. y cláusulas tipo) | [DPA](https://www.netlify.com/pdf/netlify-dpa.pdf) | Incorporado en sus términos |
| Zoho | CRM: contactos, oportunidades y lo que llega de los formularios | UE (centro de datos de la UE) | [DPA](https://www.zoho.com/gdpr.html) | Pendiente: hay que firmarlo |
| GitHub | repositorios privados con las páginas de cada cliente potencial | EE. UU. (Marco de Privacidad de Datos UE-EE. UU. y cláusulas tipo) | [DPA](https://github.com/customer-terms) | Pendiente: comprobar |
| Supabase | el directorio del SOS (fichas que cada uno publica) | UE (región de la UE) | [DPA](https://supabase.com/legal/dpa) | Pendiente: comprobar |
| Anthropic | la IA del servicio «Mapa y web» y la del espacio de cliente (Claude), con la API: lo que escribe el cliente solo para preparar las propuestas | EE. UU. (cláusulas tipo) | [DPA](https://www.anthropic.com/legal/commercial-terms) | Pendiente: comprobar |
| Stripe | cobros (las tarjetas nunca pasan por nosotros) | UE e EE. UU. (Marco de Privacidad de Datos) | [DPA](https://stripe.com/es/legal/dpa) | Incorporado en sus términos |
| Apple (iCloud) | nuestro correo | | | Servicio de correo con sus condiciones; no es un encargo a medida. |

## Medidas de seguridad

- Los datos de tarjeta nunca pasan por nuestros sistemas (Stripe).
- Las herramientas del SOS y el espacio de cliente guardan los datos en el navegador de cada uno.
- Las páginas de clientes potenciales viven en un repositorio privado y se borran después de la visita.
- Ningún dato de cliente va al repositorio público.
- Cuentas con contraseña única y verificación en dos pasos donde el servicio la ofrece.

## Lo que falta por hacer

- [ ] **Zoho.** Hay que firmarlo: en Zoho, Mi cuenta → Preferencias → Privacidad → «Data Processing Addendum» → Initiate Now. Llega un correo con el enlace para firmar.
- [ ] **GitHub.** El DPA de GitHub va con sus términos de cliente. Comprobar que la cuenta los tiene aceptados.
- [ ] **Supabase.** Se pide desde el panel de Supabase (organización → documentos legales). Comprobar que está pedido.
- [ ] **Anthropic.** Con la API, el DPA va dentro de los términos comerciales. Con un plan personal de Claude no hay DPA: no meter ahí datos de clientes.
- [ ] Revisar este registro una vez al año, o cuando entre un proveedor o un formulario nuevo (la CI avisa).

*No es asesoría legal: confírmalo con la gestoría.*
