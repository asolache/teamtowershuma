---
tipo: decisión
de: huma
rol: [comunicación, personas]
fase: sostiene
visible: pública
estado: vigente
etiquetas: [noms-oficials, formacio]
---
# Noms oficials per a la formació i per a qui fa servir el SOS

Encàrrec de l'Álvaro (21/11/2026): els àmbits de formació, amb noms més
oficials, d'acord amb les classificacions públiques (CNAE i el catàleg de
qualificacions). On ara diu «superheroi», «ciutadà» o «usuari», segons a qui
parli. El Comando Molekulon és una campanya indirecta: el llenguatge del SOS
ha de ser oficial i clar per a la ciutadania que es forma i per al sector
públic. Treure la fricció de cara al client.

**Estat (21/11/2026):** tot aplicat; la veda 187 adoptada.

## 1 · Qui és qui: substituir «superheroi»

| A qui parla | Avui | Proposta (ca / es) | On surt |
|---|---|---|---|
| Qui entra a l'app | superheroi, el teu perfil de superheroi | **usuari/usuària** · el teu perfil | `SOS/index.html` (fil UX) |
| Qui participa al barri o a la xarxa | superheroi, superherois validats | **ciutadà/ciutadana** · persones participants | `uneix-te.html`, `vedes.html`, `intro.html` |
| Qui es forma | superheroi | **alumne/a** · participant de la formació | `formacio.html` (fil catàleg) |
| Sector públic | (no hi és) | **entitat** · personal tècnic | catàleg, propostes |
| Escola, 6–13 anys | La Fàbrica de Superherois i l'Escola de Superpoders | **Escola de participació** · alumnat | `escola.html` (títol i h1) |
| Campanya Molekulon | el Comando, els 14 herois | **la campanya** · els 14 personatges | menú comú (fet en aquest PR) |

El nom intern de les funcions (`openSuperheroiOnboarding`, `superheroCromo`)
no es veu: no es toca, per no trencar res sense guany.

## 2 · Els 22 mòduls, segona proposta (21/11, veda 187)

L'Álvaro: «que cada título defina más la temática y luego haya más detalle…
áreas de conocimiento y roles… qué skills desarrollan». El títol diu l'àrea;
a sota, el rol que forma i les capacitats.

| Mòdul | Títol (ca) | Título (es) | Rol que forma · capacitats (es) | Família · CNAE |
|---|---|---|---|---|
| m1 | Sistemes digitals per a organitzacions | Sistemas digitales para organizaciones | Responsable digital · elegir herramientas abiertas, guardar los datos propios | IFC · J |
| m2 | Identitat digital i signatura electrònica | Identidad digital y firma electrónica | Responsable de datos · firmar, verificar y custodiar | IFC · J |
| m3 | Anàlisi de xarxes de valor | Análisis de redes de valor | Analista de procesos · mapear roles e intercambios, ver qué falta | ADG · M |
| m4 | Gestió de recursos compartits | Gestión de recursos compartidos | Gestor/a de recursos comunitarios · banco de tiempo, préstamo de objetos | SSC · S |
| m5 | Governança participativa | Gobernanza participativa | Secretaría y facilitación de órganos · quórum, actas, decisiones | SSC · S |
| m6 | Economia col·laborativa i intercooperació | Economía colaborativa e intercooperación | Promotor/a de proyectos colectivos · reparto equitativo, acuerdos entre entidades | ADG · M |
| m7 | Participació ciutadana | Participación ciudadana | Dinamizador/a de participación · registrar y reconocer aportaciones | SSC · S |
| m8 | Dades obertes i IA responsable | Datos abiertos e IA responsable | Técnico/a de datos · publicar con garantías, usar la IA con criterio | IFC · J |
| m9 | Dinamització de grups | Dinamización de grupos | Dinamizador/a comunitario/a · conducir sesiones | SSC · S |
| m10 | Comunicació i captació | Comunicación y captación | Comunicador/a · difundir, acoger y fidelizar | COM · M |
| m11 | Gestió de conflictes i cures | Gestión de conflictos y cuidados | Mediador/a · mediar, prevenir el desgaste, preparar relevos | SSC · S |
| m12 | Finançament i subvencions | Financiación y subvenciones | Gestor/a de proyectos · buscar, solicitar y justificar | ADG · M |
| m13 | Formes jurídiques i tràmits | Formas jurídicas y trámites | Gestor/a administrativo/a · elegir forma, hacer trámites | ADG · M |
| m14 | Avaluació de l'impacte social | Evaluación del impacto social | Evaluador/a · indicadores e informes | SSC · S |
| m15 | Protecció de dades personals | Protección de datos personales | Responsable de tratamiento · RGPD, consentimientos | ADG · M |
| m16 | Docència i tutoria | Docencia y tutoría | Formador/a · diseñar, tutorizar y evaluar | SSC · P |
| m17 | Mapa de valor de l'organització | Mapa de valor de la organización | Dirección o consultoría · quién aporta qué, con las diez reglas | ADG · M |
| m18 | Gestió del coneixement per a la IA | Gestión del conocimiento para la IA | Gestor/a del conocimiento · que la IA conozca la organización | IFC · J |
| m19 | Web corporativa | Web corporativa | Responsable web · del mapa a la web sin perder posicionamiento | IFC · J |
| m20 | Publicació de continguts web | Publicación de contenidos web | Editor/a de contenidos · vista previa antes de publicar | IFC · J |
| m21 | Automatització de processos | Automatización de procesos | Técnico/a de procesos · formularios y flujos conectados | IFC · J |
| m22 | Treball amb assistents d'IA | Trabajo con asistentes de IA | Cualquier rol · pedir cambios, revisarlos y validarlos | IFC · J |

Famílies: ADG Administració i gestió · COM Comerç i màrqueting · IFC
Informàtica i comunicacions · SSC Serveis socioculturals i a la comunitat.
CNAE: J informació i comunicacions · M activitats professionals · P educació ·
S altres serveis.

Els blocs: **A** → «Organitzacions comunitàries i economia social»; **B** →
«Dinamització comunitària»; **C** → «Transformació digital de l'organització».

## 3 · Impacte del canvi

- **Enllaços i posicionament:** cap. `#m1`…`#m22`, els `id` i les URL no
  canvien; només canvien títols visibles. L'escola canvia el `<title>`, que és
  una pàgina petita.
- **Pàgines que canvien:** `formacio.html` (22 títols, l'índex, les taules
  d'itineraris i de rols), i el que en llegeix els noms: `comando.html` i
  `molekulandia.html` (es regeneren amb `build-comando.js` i
  `build-molekulandia.js`, PR #409), el catàleg, el pressupost i la visió per
  stakeholder (PR #410).
- **L'app:** només textos visibles (usuari/ària); el rol intern `superheroi`
  queda, perquè és la clau de les dades que la gent ja té desades.
- **El que no es toca:** el blog i les vedes antigues (són història) i les
  pàgines de la campanya Molekulon (la ficció hi té el seu lloc).
- **Arquitectura:** tres nivells fixos (àrea → mòdul → pràctica) i les regles
  de la veda 187, que val per a qualsevol web comunitària nova.

## 4 · Decidit i pendent

- Decidit (21/11): usuari a l'app, ciutadà al públic; «Escola de participació».
- Decidit (21/11): els 22 títols de la taula de dalt i la veda 187 («ok, está bien la estructura»).
