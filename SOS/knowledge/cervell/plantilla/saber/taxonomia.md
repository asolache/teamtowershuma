# Taxonomía · dónde va cada cosa

Cada carpeta es exactamente una de cinco caras, y la cara dice **qué se puede
hacer con ella**. Una IA no pregunta: lee el nombre de la carpeta y escribe. Por
eso cada carpeta se declara aquí, y `MAPA.md` se genera del árbol real.

| Cara | Qué es | Regla de entrada |
|---|---|---|
| **llei** | Las reglas que gobiernan el resto | Si se rompe, invalida el trabajo hecho |
| **obra** | La cosa misma: lo que usa la gente | Una sola fuente de verdad por cosa |
| **prova** | Lo que comprueba que la obra cumple la ley | Debe fallar cuando toca, y solo entonces |
| **saber** | Lo que sabemos y aún no es obra | Se cita, no se copia |
| **arxiu** | Lo que fue | Se conserva; no se lee como presente |

Nada de `misc/` ni `temp/`: un cajón sin criterio de entrada se llena solo y
no se vacía nunca.

## Documentos: el tronco común y las etiquetas de este proyecto

Cada documento estratégico lleva arriba el tronco común, igual en todos los
proyectos (`saber/heredado/taxonomia-universal.json`, heredado: no se edita):

```
---
tipo: plan               # visión, plan, decisión, modelo, propuesta, acuerdo, informe, proceso, aprendizaje
de: mi-proyecto          # el ecosistema, de los que declara la folksonomía
rol: [ventas, finanzas]  # comunicación, marketing, ventas, finanzas, logística, producción, operaciones…
fase: sostiene           # crea, sostiene, transforma (opcional)
visible: privada         # pública, cliente, privada
estado: borrador         # borrador, vigente, superado
etiquetas: [cata]        # libres, con las palabras de este proyecto
---
```

Las etiquetas libres son la folksonomía de este proyecto: `saber/folksonomia.json`
dice de qué rol cuelga cada una. Nunca hacen fallar el CI; la que se repite sin
colgar de nada sale en el mapa como candidata. Para que la guarda mire los
documentos, `cervell.json` declara `documents` (carpetas o ficheros). Lo que es
público pasa por el sedàs: un importe en un documento público hace fallar el CI.

## Declaración de caras

Formato: `- ruta · cara · una línea de lo que entra`. El generador lee esta
lista y nada más. Crear una carpeta sin declararla rompe el CI.

- `saber` · saber · El cerebro: mapa, codex, contrato de la IA, taxonomía y backlog
- `herramientas` · obra · Lo que el proyecto hereda para trabajar: el editor del mapa, revisarlo y sacar la web. No se edita aquí
- `guardas` · prova · Las comprobaciones que fallan en CI cuando una promesa deja de ser cierta
