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

## Declaración de caras

Formato: `- ruta · cara · una línea de lo que entra`. El generador lee esta
lista y nada más. Crear una carpeta sin declararla rompe el CI.

- `saber` · saber · El cerebro: mapa, codex, contrato de la IA, taxonomía y backlog
- `guardas` · prova · Las comprobaciones que fallan en CI cuando una promesa deja de ser cierta
