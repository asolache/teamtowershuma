# TeamTowers Humà 🏰

**De las torres humanas a las organizaciones humanas**  
*Consultoría estratégica de RRHH con enfoque humanista desde el corazón del Penedès*

![TeamTowers Humà Banner](https://raw.githubusercontent.com/asolache/Teamtowers/main/images/logoteamtowers.png)

## 🌟 Visión

TeamTowers Humà es la evolución natural de 20+ años construyendo equipos sólidos como castillos. Fundada por **Álvaro Solache**, combinamos la sabiduría ancestral de los castellers (Patrimonio Inmaterial UNESCO) con metodologías innovadoras de análisis de redes de valor para transformar organizaciones en espacios donde el talento humano florece naturalmente.

> *"No construimos solo torres humanas. Construimos organizaciones humanas donde cada persona encuentra su lugar, propósito y poder para contribuir al todo."*  
> — Álvaro Solache, Fundador

## 🚀 Servicios

Nuestra oferta integral de consultoría estratégica en gestión de personas:

| Servicio | Descripción | Impacto Medible |
|----------|-------------|-----------------|
| **TeamTowers** | Experiencias castelleras transformadoras para equipos corporativos | +30-50% cohesión de equipo en 2 horas |
| **Value Network Analysis** | Mapeo estratégico de flujos de valor tangibles e intangibles | -30% ineficiencias identificadas |
| **Comunidades de Práctica** | Modelos de aprendizaje basados en redes de valor | -47% tiempo onboarding, +65% retención talento |
| **Consultoría RRHH Estratégica** | Outsourcing, transformación cultural y People Analytics | Soluciones personalizadas para PYMEs y grandes empresas |
| **Producción de Eventos** | Eventos corporativos, team building y festivales | 20+ años produciendo para empresas líderes |
| **Formación de Equipos** | Programas transformadores con metodologías únicas | Liderazgo colaborativo y gestión del cambio |

## 🎯 Propuesta de Valor Única

Somos **la única consultora** que fusiona:

✅ **Experiencia física** construyendo torres humanas (60.000+ participantes transformados)  
✅ **Análisis estratégico** mediante Value Network Analysis (metodología de Verna Allee)  
✅ **Territorialidad auténtica** desde Vilafranca del Penedès, corazón del cooperativismo catalán  
✅ **Enfoque humanista** que prioriza el valor humano sobre métricas frías  
✅ **Resultados cuantificables** con impacto en negocio real (no solo "satisfacción post-curso")

## 📊 Impacto en Cifras

```
20+ años  → Experiencia construyendo equipos sólidos como castillos
150+ empresas → Transformadas (IKEA, Telefónica, Vodafone, Novartis, BBVA, Porsche...)
95% satisfacción → Clientes que repiten y recomiendan
60.000+ participantes → Formados en valores de colaboración y confianza
4x mayor → Transferencia de aprendizaje vs. modelos tradicionales
```

## 💻 Tecnología

Landing page 100% estática optimizada para rendimiento y conversión:

- **HTML5 semántico** con Schema.org estructurado para SEO
- **CSS puro** sin frameworks pesados (carga < 50KB)
- **JavaScript ligero** para:
  - Cambio de idioma sin recarga (ES/CA)
  - Sistema de contacto obfuscado anti-bots
  - Animaciones suaves y experiencia de usuario premium
- **Video background** optimizado para engagement máximo
- **Responsive design** mobile-first (100% Lighthouse)

## 🌐 Posicionamiento Territorial

TeamTowers Humà nace con un compromiso claro con el **Penedès**:

📍 Ubicación estratégica en Vilafranca del Penedès (capital del cava y cooperativismo)  
📍 Alianzas con tejido empresarial local (bodegas, cooperativas, industria)  
📍 Acceso a ayudas de la Generalitat para innovación social y economía social  
📍 Conexión con el patrimonio cultural catalán como diferencial competitivo

## 🚀 Despliegue

Este proyecto está diseñado para despliegue rápido en plataformas estáticas:

```bash
# 1. Clona el repositorio
git clone https://github.com/asolache/teamtowershuma.git
cd teamtowershuma

# 2. Edita el archivo index.html con tus datos
nano index.html

# 3. Despliega en Netlify (recomendado)
#    - Conecta tu repositorio GitHub
#    - Netlify detectará automáticamente el index.html
#    - ¡Listo en 30 segundos!

# 4. O despliega manualmente en cualquier hosting estático
scp index.html usuario@tudominio.com:/var/www/html/
```

## 📁 Estructura del Proyecto

```
teamtowershuma/
├── index.html                  # Landing page principal (bilingüe ES/CA)
├── app.html                    # App principal VNA (Value Network Analysis)
├── app_coops.html              # App para cooperativas
├── mapas.html                  # Mapas de valor
├── finances.html               # Gestión financiera
├── tokenomics.html             # Tokenomics
├── tokenomics_config.html      # Configurador de tokenomics
├── *.html                      # Resto de páginas de la plataforma
├── js/
│   ├── backup-manager.js       # Gestión de copias de seguridad en localStorage
│   └── github-sync.js          # Sincronización de backups con GitHub API
├── data/
│   └── seeds/
│       └── stakeholders-example.json  # Datos de ejemplo
├── knowledge-base/
│   ├── stakeholders.html       # Dashboard de stakeholders
│   └── modules/
│       └── stakeholders.js     # Módulo de stakeholders
├── v2/                         # Versión 2 (en desarrollo)
└── README.md                   # Este archivo
```

## 💾 Almacenamiento Local de Datos

Los datos de la aplicación se guardan en **tres lugares**:

### 1. `localStorage` del navegador

Los datos del proyecto se guardan automáticamente en el `localStorage` del navegador (no en archivos de disco). Cada módulo usa su propia clave:

| Módulo | Clave localStorage |
|--------|--------------------|
| VNA (`app.html`) | `vnaData` |
| Mapas de valor (`mapas.html`) | `valueMapData` |
| Tokenomics (`tokenomics.html`) | `tokenomicsData` |
| Idioma preferido | `preferredLanguage` |
| BackupManager (personalizable) | clave configurada al instanciar |

> **¿Cómo acceder?** Abre las DevTools del navegador → pestaña *Application* → *Local Storage* → selecciona la URL de la app.

### 2. Carpeta de Descargas del navegador

Cuando exportas datos desde la app (botones *Exportar JSON*, *Exportar CSV*, *Exportar PNG*, *Descargar contrato*), el archivo se descarga en la **carpeta de Descargas** predeterminada de tu sistema operativo.

### 3. Backups en GitHub

El módulo `github-sync.js` sube copias de seguridad al repositorio en la ruta `data/backups/` vía la API de GitHub.

## 🔒 Privacidad y Anti-Bots

El sistema de contacto implementa múltiples capas de protección:

```javascript
// Email construido dinámicamente para evitar scraping
const email = 'asolache' + '@' + 'mac.com';

// Asuntos personalizados por servicio para mejor segmentación
contactService('TeamTowers'); 
// → mailto:asolache@mac.com?subject=Consulta%20sobre%20TeamTowers
```

## 🤝 Colabora

¿Eres diseñador, desarrollador o especialista en marketing del Penedès? ¡Nos encantaría colaborar contigo!

1. **Fork** este repositorio
2. Crea una rama para tu feature (`git checkout -b feature/awesome-feature`)
3. Haz commit de tus cambios (`git commit -am 'Add awesome feature'`)
4. Haz push a la rama (`git push origin feature/awesome-feature`)
5. Abre un **Pull Request**

## 📜 Licencia

Este proyecto es propiedad de **TeamTowers Humà** y está protegido por derechos de autor. El código HTML/CSS/JS puede ser utilizado como referencia educativa, pero cualquier uso comercial requiere autorización previa.

```
© 2026 TeamTowers Humà
Consultoría estratégica de RRHH en Vilafranca del Penedès
https://teamtowershuma.netlify.app
asolache@mac.com | +34 629 86 77 15
```

## 🌍 Enlaces de Interés

- [🌐 Sitio web principal](https://teamtowershuma.netlify.app)
- [👥 TeamTowers original](https://www.teamtowers.eu)
- [🔬 Value Network Lab](https://valuenetworklab.netlify.app)
- [🎓 Curso de VNA](https://cursovna.netlify.app)
- [👤 Perfil de Álvaro Solache](https://alvarosolache.netlify.app)
- [💼 LinkedIn](https://linkedin.com/in/alvarosolache)

---

*TeamTowers Humà — Construyendo organizaciones humanas desde el corazón del Penedès* 🏰💙💜
