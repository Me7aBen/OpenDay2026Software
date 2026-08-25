# PRIMER DÍA — plataforma de exploración vocacional

Un estudiante de secundaria puede buscar una carrera, leer qué se estudia en
ella, ver dónde puede estudiarla y —lo que hace distinto al producto—
**experimentarla**: jugar gratis una simulación basada en un problema real de esa
profesión antes de decidir si le interesa.

> Antes de elegir una carrera, experiméntala.

El nombre comercial es provisional y se cambia en un solo archivo:
`src/config/marca.js`.

## Cómo correrlo

```bash
npm install
npm run dev
```

| comando         | qué hace                                             |
|-----------------|------------------------------------------------------|
| `npm run dev`   | servidor de desarrollo                                |
| `npm run build` | build de producción                                   |
| `npm run lint`  | ESLint                                                |
| `npm test`      | juega las tres simulaciones completas contra el motor |

`npm test` usa `node --test`: sin runner y sin dependencias nuevas.

## Rutas

| ruta | qué es |
|------|--------|
| `/` | homepage con buscador de carreras |
| `/carreras` · `/carreras/:slug` | explorador y ficha de carrera |
| `/simulaciones` · `/simulaciones/:slug` | catálogo y pantalla de entrada |
| `/simulaciones/:slug/jugar` | la simulación corriendo |
| `/aprender` · `/aprender/:slug` | microcursos |
| `/comparar` | comparador de hasta 3 carreras |
| `/mi-exploracion` | carreras guardadas, historial y opiniones |
| `/evento` | **modo evento**: la jornada del Open Day, con registro por colegio, misiones en secuencia y ranking |
| `?vista=leaderboard` | panel de ranking para el facilitador |

## Simulaciones

| simulación | carrera | estado |
|------------|---------|--------|
| El Pedido Fantasma | Ingeniería de Software | gratis |
| Código Cero | Ingeniería de Software | gratis |
| Luz para Ccorca | Ingeniería Civil / Arquitectura | gratis |

Agregar una simulación es agregar un JSON en `src/content/` y una entrada en
`src/features/simulations/catalogo.js`. El motor no se toca.

## Documentación

- `docs/CLAUDE.md` — contexto del producto y reglas de oro. **Léelo primero.**
- `docs/contrato-escenario.md` — el contrato del JSON de cada simulación.
