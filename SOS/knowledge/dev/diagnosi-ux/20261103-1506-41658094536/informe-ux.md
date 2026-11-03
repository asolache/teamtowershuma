# Diagnóstico de experiencia de uso

## 1) Lo que pasa, en 5 frases

- La app tiene **88 pantallas**, pero **96 de ellas se abren como ventana flotante** encima de otra, y 17 obligan a desplazarse dentro de esa ventana.
- Casi ninguna tiene dirección propia: la barra del navegador sigue mostrando la del mapa o la del chat, así que no se pueden enviar, recargar ni abrir en otro móvil.
- Habla el idioma de quien la programó (node, ledger, SOS, relé, CID, MATRIU, Comando) y no el de quien la usa.
- En muchas pantallas el botón más visible es «Tanca». Los estados vacíos explican qué hacer pero no dan el botón para hacerlo.
- Hay funciones duplicadas en dos o tres sitios, y lo que la persona viene a hacer (su mapa, sus tareas, apuntar una aportación) queda enterrado bajo guías, cabeceras y avisos.

## 2) Los 10 problemas que más cuestan

**1. Ventanas encima de ventanas, sin dirección propia.** Rompe las dos reglas principales: pantalla completa y «todo es un link». Se ve en «Fes-te el perfil» (alta), «Identitat», «Configuració», «El dossier», «Comando Molekulon», «Activitat», «Registre d'accions», «Què hi ha a prop», «Directori d'entitats», «Nou projecte», «Assemblea àgil», «Moneder SOS Coop» y prácticamente todas las demás.

**2. Errores visibles que destruyen la confianza.** Aparece «[object Object]» o un error técnico en crudo en «Mentoria preparada» (que además dice que no se ha podido preparar), «El dossier de…», «Pings», «El meu registre» y «Arrel del registre» (TypeError). Son fallos que se ven en la primera línea.

**3. Jerga del sistema.** node, ledger, did:sos, NIP-07, mainHash, CID, relé, quòrum, stewards, Slicing Pie, FMV, glass-box, penetració, fluxos. Se nota sobre todo en «Identitat», «Ancoratge Nostr», «Paquet ancorat», «Relé», «Sabiduria» (gobernanza), «Aportació (Slicing Pie)», «Simulador d'impacte» y «Assemblea federativa».

**4. Callejones sin salida: el botón principal es «Tanca».** El texto dice qué hacer pero no hay botón para hacerlo. Pasa en «Pings», «Multivers Molekulon», «Federacions temàtiques», «Historial de publicacions», «Certificat del rol», «Registre públic de decisions», «Bomba» (dice «invita a alguien» y no deja invitar) y «Esperen el teu vistiplau».

**5. Lo importante enterrado.** En las pestañas del proyecto («Mapa de valor», «Tauler», «Comptes», «Conversa»), antes de ver el mapa, el tablero, el botón de apuntar o el campo para escribir hay una guía de pasos abierta y la cabecera de misión, visión y objetivos vacía. En el móvil hay que desplazar entre 2 y 8 pantallas.

**6. Lo mismo en dos o tres sitios.**
- «El meu dia» y «Tasques/Què et toca» son la misma lista.
- «Territoris» aparece arriba y en las pestañas.
- «Què necessites?» y «Totes les accions» son el mismo buscador.
- «Qui mou la xarxa», «A prop» y «Directori» buscan personas.
- Hay tres copias de seguridad distintas: «Còpia de la identitat», «Còpia de tot» y «Còpia de seguretat».
- Hay cinco pantallas de «pruebas»: «Ancoratges», «Ancoratge Nostr», «Paquet ancorat», «Arrel del registre» y «Registre d'accions».

**7. Formularios larguísimos en ventanas, con el botón de guardar fuera de la vista.**

| Pantalla | Pantallas de desplazamiento en el móvil |
|---|---|
| «El dossier» | 6,7 |
| «El meu perfil superheroi» | 4,6 |
| «Fes-te el perfil» | 4,4 |
| «Configuració» | 3,7 |
| «Identitat» | 3,2 |

También pasa en «Comando Molekulon» (10 pantallas de texto).

**8. Se pregunta lo que la app ya sabe.**
- «Qui l'aporta» y «Soci» salen vacíos en vez de poner a la persona conectada.
- «Kit narratiu» pide escribir a mano el grupo y los miembros.
- «Què et toca» pide hacerse el perfil a quien ya hizo su mapa de valor en la web.
- «Alta de soci» deja escribir el nombre antes de buscarlo, lo que crea duplicados.

**9. Avisos flotantes que tapan botones y no tienen relación con la pantalla.** «Atles carregat · 17 entitats», «Crea primer el teu perfil», «Identifica't primer per preparar la mentoria», «Dona d'alta algú primer», «Aquest tema no existeix en aquest dispositiu» y «Digues primer qui ets». En el móvil tapan justo la acción principal.

**10. La navegación cambia de sitio.**
- Hay tres barras apiladas y las pestañas se cortan en el móvil («A pro…», «Compte…») sin indicar que hay más.
- No hay miga de pan y los títulos van en mayúsculas de máquina, cada uno con su estilo.
- Hay mensajes contradictorios: «Al dia» con la clave sin copiar en «Còpia de seguretat», y «Connectat» al lado de «Esperant» en «Connectat».

## 3) La nueva arquitectura

Las direcciones van en catalán, como la app. Cada una abre igual en frío en cualquier dispositivo.

**Avui — #/avui** (el inicio)
Entran «Què et toca», «El meu dia», «Bomba» (como «Pròxims passos»), «Esperen el teu vistiplau» (bloque «Per confirmar»), las últimas 5 de «Activitat» (la lista entera en #/avui/novetats) y el resumen de «Pings».
Arriba, una sola tarea con un botón. Si la persona viene de la web, saludo y su mapa ya importado.

**Buscar — #/cerca?q=…**
Entran «Què necessites?», «Totes les accions» y «Què hi ha a prop». Un campo grande y, debajo, resultados por persona, lugar o acción.

**Gent — #/gent** (filtros Ara · A prop · Tothom · Entitats)
Entran «Qui mou la xarxa», «Directori d'entitats», «Descobreix entitats» (como sección «Suggeriments») y «Registra una entitat existent» (#/gent/entitats/nova).

**Territoris — #/territoris** y **#/territoris/{comarca}**
Entran «Mapa de Catalunya» (conmutador Mapa / Llista), «Federacions temàtiques» y «Temes del projecte» (#/temes). La ubicación de «Coordenades» pasa al perfil y la importación masiva a Configuració.

**Projecte — #/t/{projecte}/…**, siete pestañas, cada una con su dirección:
- **Resum** (#/t/{p}): misión y visión plegadas, el «menú ràpid del projecte» convertido en cabecera con «Registra hores o diner», y «Sobre el projecte» (la ventana de rols funcionals).
- **Mapa** (/mapa): «Mapa de valor», «Fluxos sense retorn» (/mapa/retorns), «Desviació respecte al model» (/mapa/compara), «Assistent de valoració amb IA» (/mapa/valora), «Simulador d'impacte» (/mapa/impacte) y «Assemblea federativa» (/mapa/assemblea).
- **Tasques** (/tasques): «Tauler». Al cerrar una tarea, botón «Passa-la a aportació».
- **Aportacions** (/aportacions): «Comptes», «Apunta una aportació», «Aportació (Slicing Pie)», «Registre d'accions» y «El meu registre» filtrado.
- **Intercanvis** (/intercanvis): «Nova demanda» (con conmutador Ofereixo / Necessito), «Afegeix objecte», «Acompanyament», «Pings» (coincidencias), «Rebut» y «T'interessa».
- **Decisions** (/decisions): «Sabiduria», «Assemblea àgil» y «Registre públic de decisions».
- **Conversa** (/conversa): mensajes arriba y campo de escribir fijo abajo.

En «Més» del proyecto quedan:
- **Equip** (/equip): «Alta de soci», «Comando del projecte» y «Comando de l'entitat».
- **Història** (/historia): «Kit narratiu», «Multivers Molekulon» y «Comando Molekulon».
- **Compartir i versions** (/compartir): «Historial de publicacions», «Publica l'oferta comuna», «Llegeix un paquet», «Paquet ancorat», «Ancoratge Nostr», «Arrel del registre» y «Ancoratges».

**Nou — #/nou** (una puerta para crear)
Entran «Nova entrada al territori», «Nou projecte» (#/nou/projecte), «Situa el projecte», «Nou país» y «Crea el teu país» (#/nou/pais, un paso por dirección).

**Publica — #/publica**
Entra «Abans de publicar». El perfil mínimo es el último paso del propio formulario y no un muro previo.

**Jo — #/jo**
Entran «Fes-te el perfil» y «El meu perfil superheroi» (una sola pantalla, en modo alta o edición), «El dossier» (por pasos), «Identitat» (#/jo/seguretat), «El teu cromo» (#/jo/cromos), «Certificat del rol», «Mentoria preparada» (#/jo/aprendre) y «El meu registre» (#/jo/aportacions).

**Valor — #/valor**
Entran «Fons cooperatiu» y «Impacte» (pestañas Aportat · Impacte) y «Moneder SOS Coop». «La caixa de la DAO» y «SOS Coop · la caixa i el repartiment» van a Configuració › Diners, solo para quien administra.

**Configuració — #/config**
- Dades i còpies: una sola copia de seguridad que une las tres.
- Dispositius: «Sincronitza», «Escaneja un QR» y «Connectat».
- Idioma, Aparença, Diners.
- Avançat: «Relé», «Orígens», «Països», atlas, clave de IA y «Verifica un paquet».
- Integracions: «Revisió de PR amb IA».

**Ajuda — #/ajuda**
Entran «Benvinguda» (#/ajuda/benvinguda/1…3), «Avisa d'un problema» (#/ajuda/avisa) y «Totes les eines» (#/eines, enlazada desde aquí y desde la portada).

**Se quedan como diálogo corto** (solo confirmar algo o un dato):
- «T'interessa → Ja ho hem fet?»
- Confirmar antes de publicar a otros pueblos (no se puede deshacer).
- «Vols fer-te'n responsable?»
- Aturar la caixa, con el motivo.
- Esborrar projecte.
- Desconnecta dispositiu.
- Descarregar sense contrasenya.

## 4) Qué sobra del uso diario y adónde va

**Quitar:**
- «El Comando a les pantalles»: pasa a ser un interruptor en Configuració.
- El «menú ràpid del projecte»: duplica la ficha.
- Los avisos técnicos tipo «Atles carregat» y «LOCAL / BETA».
- El botón «El meu tauler» repetido junto a los títulos.
- Los botones «Tanca» en todas las pantallas completas.
- «Apaga i desconnecta» cuando ya está apagado.

**A Configuració › Avançat:** «Relé», «Orígens», «Països», la importación de coordenadas, los relés Nostr, el puente de claves, «⚙ El node» y «Verifica un paquet».

**A Més (del proyecto o general):** «Història» (Kit, Multivers, Comando), los simuladores (impacte, assemblea), las demos que ahora viven dentro de «Configuració» (pasan a una página «Demostracions») y «Revisió de PR amb IA».

**Plegado dentro de su pantalla:** misión, visión y objetivos vacíos; guías de «Passos en aquest context»; textos de privacidad; detalles técnicos (CID, firma, hash); fórmulas (Penrose, Gini).

## 5) El patrón de pantalla completa

Cada pantalla tiene siempre, en el mismo orden:

1. **Barra única** arriba, con logo, buscar y tu cuenta. Es igual en todas.
2. **Miga de pan**, por ejemplo «Exemple · el mapa viu › Aportacions › Nova». Cada tramo es un enlace y sirve para volver.
3. **Título** con un solo estilo, en minúsculas normales, sin emojis ni mayúsculas de máquina. Debajo, una frase que diga qué ganas.
4. **Una acción principal**: un único botón de color, a la derecha del título en escritorio y **fijo abajo** en el móvil. El resto, en texto o en «⋯».
5. **Contenido** en una columna. Lo opcional, plegado («Més detalls», «Com funciona?»).
6. **Volver**: la miga de pan o el botón atrás del navegador, que regresa al mismo punto de la pantalla anterior. Nunca «Tanca».
7. **Estado vacío**: una frase y el mismo botón principal. Nunca un vacío sin salida.
8. **Avisos** dentro de la página, arriba y sin tapar nada.

En el móvil:
- Las pestañas se convierten en barra inferior (Avui, Cerca, Gent, Territoris, Més) o en pestañas desplazables con un degradado que avisa de que hay más.
- Sin desplazamiento dentro de ventanas: la página se desplaza entera.
- Las cifras van en lista o en cuadrícula de 2, nunca en 4 columnas cortadas.

## 6) Plan por fases

**Fase 1. Que funcione y se entienda (1–2 semanas).**
- Arreglar los errores visibles de [object Object] y TypeError.
- Quitar los avisos flotantes ajenos a cada pantalla.
- En todos los estados vacíos, cambiar «Tanca» por el botón que lleva a hacer la cosa.
- Rellenar «Qui l'aporta» y «Soci» con la persona conectada.
- Plegar por defecto las guías y la cabecera de misión en las pestañas del proyecto.
- Glosario de renombres: Comptes → Aportacions, node → projecte, fluxos → intercanvis, ledger → registre, Pings → Qui pot ajudar qui.

*Se nota:* nada parece roto, y al abrir el mapa, el tablero o la conversa se ve el contenido sin desplazar.

**Fase 2. Pantallas completas con dirección propia (3–4 semanas).**
Pasar a página propia las más usadas: «Fes-te el perfil», «Apunta una aportació», «Nova demanda», «Afegeix objecte», «Alta de soci», «Què hi ha a prop», «Directori d'entitats», «Assemblea àgil» y «Configuració». Poner la miga de pan y la barra única.

*Se nota:* se puede enviar un enlace a «apunta tus horas aquí», el botón atrás funciona y en el móvil el botón de guardar siempre está visible.

**Fase 3. Fusionar y ordenar (4–6 semanas).**
- Unir «El meu dia» y «Tasques» en Avui.
- Unir «Què necessites?», «Totes les accions» y «A prop» en Cerca.
- Unir las tres copias de seguridad.
- Unir las cinco pantallas de pruebas en «Compartir i versions».
- Dejar las siete pestañas del proyecto.
- Crear #/nou para todo lo que se crea.
- Sacar lo técnico a Configuració › Avançat.

*Se nota:* cada cosa tiene un solo sitio, la barra cabe en el móvil y desaparece la sensación de laberinto.

**Fase 4. Pulir el primer día (2–3 semanas).**
- Importar el mapa de valor hecho en la web.
- «Benvinguda» en 3 pasos orientados a tareas.
- Pasar a pasos el perfil y el dossier.
- Iconos y títulos con un único estilo.

*Se nota:* quien llega de la web se reconoce y sabe qué hacer en 10 segundos.

## 7) Victorias rápidas (menos de una hora cada una)

- Corregir el nombre en «Mentoria preparada», «El dossier», «Pings» y «El meu registre» para que muestre texto y no [object Object].
- Eliminar el aviso «Atles carregat · 17 entitats oficials».
- Que «Tanca» deje de ser el botón de color en todas las ventanas.
- En «Còpia de tot», el botón principal debe ser «Descarrega còpia protegida», no «SENSE xifrar».
- En «Còpia de seguretat», cambiar «Al dia» por «Falta copiar la teva clau» cuando no está copiada.
- En «Connectat», mostrar solo «Esperant l'altre dispositiu» hasta que llegue.
- Quitar «El meu tauler» repetido junto a los títulos y «☰ Territoris» duplicado.
- Degradado en las pestañas del móvil para indicar que hay más.
- En «Bomba», convertir «Convida algú» en botón y ocultar «Fa 0 dies».
- En «Registre públic de decisions» y «Ancoratge Nostr», ocultar el botón de anclar mientras no haya nada que anclar.
- Renombrar la pestaña «Comptes» a «Aportacions» y «Alta de soci» a «Afegeix participant».
- Etiquetar los porcentajes en «SOS Coop · la caixa i el repartiment» (Funcionament, Node, Federació) y los topes en «La caixa de la DAO» (Màxim al mes, Màxim al dia).
- En «Nova demanda», no preseleccionar la categoría «Acompanyament i companyia».
- Añadir el texto de ayuda «Tria…» a los desplegables vacíos de «Acompanyament».

---
Pantallas analizadas: 88 · coste IA: 10.14 $
