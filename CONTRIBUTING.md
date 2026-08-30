# Guía de Contribución — TeamTowers Humà 🏰

Bienvenido/a al proyecto TeamTowers Humà. Esta guía describe cómo trabajar con el repositorio en local y cómo subir cambios a GitHub usando el modelo **Ship / Show / Ask**.

---

## 🖥️ Entorno de desarrollo local (localhost)

El proyecto es un sitio web estático (HTML + CSS + JS puro), sin dependencias de compilación ni frameworks. Para visualizarlo en local:

### Opción A — Python (preinstalado en macOS y Linux)

```bash
# 1. Clona el repositorio
git clone https://github.com/asolache/teamtowershuma.git
cd teamtowershuma

# 2. Arranca un servidor HTTP local
python3 -m http.server 8080

# 3. Abre el navegador en:
#    http://localhost:8080
```

### Opción B — Node.js (`npx serve`)

```bash
npx serve .
# Abre: http://localhost:3000
```

### Opción C — VS Code con extensión Live Server

1. Instala la extensión **Live Server** (Ritwick Dey) en VS Code.
2. Abre la carpeta del proyecto.
3. Haz clic en **"Go Live"** en la barra de estado.
4. El navegador se abrirá automáticamente en `http://127.0.0.1:5500`.

> **Recomendación:** Live Server recarga automáticamente el navegador al guardar cambios, lo que acelera el ciclo de edición.

---

## 🚀 Modelo Ship / Show / Ask

El modelo **Ship / Show / Ask** clasifica cada cambio según su tamaño, riesgo e impacto, y determina si necesita revisión antes de llegar a `main`.

| Tipo    | ¿Cuándo usarlo?                                      | Proceso                              |
|---------|------------------------------------------------------|--------------------------------------|
| **Ship** | Cambios triviales: typos, ajuste de colores, textos | Commit directo a `main`              |
| **Show** | Cambios pequeños que quieres comunicar al equipo     | Abre PR, tú mismo lo fusionas        |
| **Ask**  | Cambios grandes, dudosos o con impacto alto          | Abre PR y solicita revisión          |

### Regla de oro

> Si dudas entre Ship y Show → usa **Show**.  
> Si dudas entre Show y Ask → usa **Ask**.

---

## 📋 Flujo de trabajo paso a paso

### 1. Prepara tu rama

```bash
# Sincroniza con el estado actual de main
git checkout main
git pull origin main

# Crea una rama descriptiva
# Formato sugerido: tipo/descripcion-breve
git checkout -b show/actualizar-seccion-servicios
```

Prefijos de rama recomendados:

| Prefijo    | Significado                            |
|------------|----------------------------------------|
| `ship/`    | Cambio Ship (también se puede ir a main directo) |
| `show/`    | Cambio Show: PR que tú mismo fusionas  |
| `ask/`     | Cambio Ask: PR que requiere revisión   |
| `feature/` | Nueva funcionalidad grande             |
| `fix/`     | Corrección de bug                      |
| `docs/`    | Solo documentación                     |

### 2. Haz tus cambios y súbelos

```bash
# Edita los archivos que necesitas
nano index.html

# Revisa qué has cambiado
git diff

# Prepara y confirma el commit
git add .
git commit -m "show: actualizar descripción de servicios en la sección principal"

# Sube la rama a GitHub
git push origin show/actualizar-seccion-servicios
```

#### Convención de mensajes de commit

```
<tipo>: <descripción corta en imperativo>

Ejemplos:
  ship: corregir typo en título principal
  show: añadir nuevo servicio de mentoring
  ask: refactorizar sistema de idiomas ES/CA
  fix: arreglar enlace roto en sección contacto
  docs: actualizar instrucciones de despliegue
```

### 3. Abre el Pull Request (Show / Ask)

En GitHub:
1. Ve a **Pull Requests → New Pull Request**.
2. Selecciona tu rama como origen y `main` como destino.
3. Rellena la plantilla de PR (ver más abajo).
4. Etiqueta el PR con `ship`, `show` o `ask`.
5. **Show:** revisa el CI ✅ y fusiona tú mismo.
6. **Ask:** asigna un revisor y espera la aprobación.

---

## ✅ Checklist antes de fusionar

- [ ] El sitio funciona correctamente en `http://localhost:8080`
- [ ] No hay errores en la consola del navegador
- [ ] Los cambios son visibles y correctos en móvil (responsive)
- [ ] El CI de GitHub Actions pasa (✅ verde)
- [ ] El mensaje de commit sigue la convención

---

## 🔄 CI / CD (integración y despliegue continuos)

- **Cada Push / PR** activa el pipeline de CI (`.github/workflows/ci.yml`) que valida el código.
- **Cada fusión a `main`** activa el despliegue automático a GitHub Pages (`.github/workflows/deploy.yml`).
- El backup diario se ejecuta a las 2:00 AM UTC (`.github/workflows/backup-daily-to-github.yml`).

---

## 📖 Recursos

- [Ship / Show / Ask — Rouan Wilsenach](https://martinfowler.com/articles/ship-show-ask.html)
- [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)
- [GitHub Flow](https://docs.github.com/es/get-started/using-github/github-flow)
