# Noms oficials per a la formació i per a qui fa servir el SOS

Encàrrec de l'Álvaro (21/11/2026): els àmbits de formació, amb noms més
oficials, d'acord amb les classificacions públiques (CNAE i el catàleg de
qualificacions). On ara diu «superheroi», «ciutadà» o «usuari», segons a qui
parli. El Comando Molekulon és una campanya indirecta: el llenguatge del SOS
ha de ser oficial i clar per a la ciutadania que es forma i per al sector
públic. Treure la fricció de cara al client.

**Estat: proposta.** En aquest PR només canvia el menú comú (grup
«Molekulon» → «Participació»). La resta de la taula s'aplica quan l'Álvaro
la doni per bona, pàgina per pàgina, amb el fil que porta cada pàgina
(`formacio.html` és del fil del catàleg; `SOS/index.html`, del de la UX).

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

## 2 · Els àmbits de formació, amb nom oficial

Referència: les famílies professionals del Catàleg Nacional de Qualificacions
Professionals (INCUAL / SEPE), que són les que fan servir els certificats de
professionalitat i la formació per a l'ocupació (Fundae), i la secció CNAE-2025
de l'activitat. El codi és orientatiu: diu a quina família s'assembla, no que
el mòdul doni el certificat.

| Mòdul | Avui | Proposta (ca) | Propuesta (es) | Família · CNAE |
|---|---|---|---|---|
| m1 | Fonaments SOS i codex Antigravity | Fonaments de sistemes digitals per a organitzacions | Fundamentos de sistemas digitales para organizaciones | IFC · J |
| m2 | Identitat descentralitzada i criptografia | Identitat digital i signatura electrònica | Identidad digital y firma electrónica | IFC · J |
| m3 | Value Network Analysis (Verna Allee) | Anàlisi de xarxes de valor (mètode VNA) | Análisis de redes de valor (método VNA) | ADG · M |
| m4 | Recursos comunitaris | Gestió de recursos compartits: banc de temps i préstec d'objectes | Gestión de recursos compartidos: banco de tiempo y préstamo de objetos | SSC · S |
| m5 | Governança i Guardians | Governança participativa i presa de decisions | Gobernanza participativa y toma de decisiones | SSC · S |
| m6 | MATRIU, Slicing Pie i intercooperació | Intercooperació i repartiment equitatiu en projectes col·lectius | Intercooperación y reparto equitativo en proyectos colectivos | ADG · M |
| m7 | Comando Molekulon i reputació | Participació ciutadana i reconeixement de les aportacions | Participación ciudadana y reconocimiento de las aportaciones | SSC · S |
| m8 | Ancoratge públic i IA integrada | Dades obertes i ús responsable de la IA | Datos abiertos y uso responsable de la IA | IFC · J |
| m9 | Facilitació i dinamització de grups | Dinamització de grups i comunitats | Dinamización de grupos y comunidades | SSC · S |
| m10 | Comunicació i captació de persones | Comunicació i captació de participants | Comunicación y captación de participantes | COM · M |
| m11 | Conflictes, cures i relleu | Gestió de conflictes i cura dels equips | Gestión de conflictos y cuidado de los equipos | SSC · S |
| m12 | Finançament i subvencions a Catalunya | Finançament i subvencions | Financiación y subvenciones | ADG · M |
| m13 | Formes jurídiques i tràmits | Formes jurídiques i tràmits (igual) | Formas jurídicas y trámites | ADG · M |
| m14 | Mesura d'impacte i justificació | Avaluació i justificació de l'impacte social | Evaluación y justificación del impacto social | SSC · S |
| m15 | Dades, privadesa i RGPD | Protecció de dades personals (RGPD) | Protección de datos personales (RGPD) | ADG · M |
| m16 | Formació de formadors | Docència i tutoria de la formació | Docencia y tutoría de la formación | SSC · P |
| m17 | El teu mapa de valor | Mapa de valor de l'organització | Mapa de valor de la organización | ADG · M |
| m18 | El teu cervell i la teva cultura | Base de coneixement de l'organització per a la IA | Base de conocimiento de la organización para la IA | IFC · J |
| m19 | La teva web | Web corporativa a partir del mapa de valor | Web corporativa a partir del mapa de valor | IFC · J |
| m20 | Editar i publicar sense trencar | Edició i publicació de continguts web | Edición y publicación de contenidos web | IFC · J |
| m21 | Que vagi sol | Automatització de formularis i processos | Automatización de formularios y procesos | IFC · J |
| m22 | Treballar amb el teu Claude | Treball amb un assistent d'IA | Trabajo con un asistente de IA | IFC · J |

Famílies: ADG Administració i gestió · COM Comerç i màrqueting · IFC
Informàtica i comunicacions · SSC Serveis socioculturals i a la comunitat.
CNAE: J informació i comunicacions · M activitats professionals · P educació ·
S altres serveis.

Els blocs: **A · Fonaments** → «Organitzacions comunitàries i economia
social»; **B · L'ofici comunitari** → «Dinamització comunitària»; **C · La
teva web viva** → «Transformació digital de l'organització».

## 3 · El que l'Álvaro ha de dir

1. ¿«Usuari» a l'app i «ciutadà» a les pàgines públiques, o un sol nom?
2. ¿La taula de mòduls tal qual, o amb canvis? Els enllaços `#m1`… no canvien.
3. ¿L'escola es diu «Escola de participació» també al títol de la pàgina?
