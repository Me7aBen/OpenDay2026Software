# MISIÓN DEPLOY — contexto del proyecto

Simulador web tipo videojuego para un taller de ~30 minutos donde estudiantes de 4to y 5to de secundaria viven el ciclo de desarrollo de software resolviendo un problema social peruano. Se usa en el laboratorio de cómputo de Tecsup Arequipa, en varias sesiones, con leaderboard por sesión y premiación al top 3.

La propuesta completa está en `docs/propuesta.md`. **Léela antes de proponer cambios de alcance.** El estado y la bitácora de avance están en `docs/PLAN.md`.

## Reglas de oro

1. **El motor no contiene narrativa.** Ni un solo string de historia, pregunta, opción o feedback vive en `src/`. Todo el contenido está en `src/content/*.json`. Si necesitas texto para probar, ponlo en el JSON.
2. **Agregar un escenario nuevo = agregar un JSON.** Si un escenario nuevo obligara a tocar el motor, el diseño del motor está mal.
3. **La partida corre offline.** Ninguna fase puede quedar bloqueada esperando red. Supabase solo se usa al inicio (resolver sesión abierta) y al final (guardar partida), y ambos fallan en silencio hacia un modo local.
4. **Público real: chicos de 15-17 años en ~16 minutos, sin saber nada de desarrollo de software.** No conocen las etapas del ciclo de vida, ni jerga técnica, ni programación. Cada fase abre con una explicación explícita y breve en lenguaje simple (qué va a hacer, por qué, sin dar por sabido nada) *antes* de pedir la primera decisión — recién ahí se decide. Máximo 2 líneas de texto por decisión (la explicación de fase puede ser un poco más larga, pero se lee una sola vez por fase, no en cada decisión). Cero jerga técnica antes del final. Si una pantalla necesita explicación del facilitador, está mal diseñada.
5. **No todo es un cuestionario.** Cada minijuego debe usar la interacción que le corresponda de verdad — arrastrar en el wireframe, escribir en el bloque de lógica — no un listado de botones disfrazado. Selección por clic solo cuando la decisión real es "elegir una opción de una lista" (entrevista, bugs, deploy).
6. **Objetivo 1366×768, horizontal, sin scroll durante la partida.** Es la resolución típica del laboratorio.
7. **Sin audio indispensable.** Las PCs del lab no tienen parlantes. Todo sonido es decorativo.

## Stack

- React + Vite (JS, no TS salvo que ya esté configurado)
- Sin librería de estado: `useReducer` + contexto es suficiente
- Supabase JS client para persistencia
- CSS con variables en `src/styles/tokens.css` — los tokens vienen del diseño, no los inventes
- Deploy: GitHub Pages vía GitHub Actions

## Estructura

```
src/
  engine/      máquina de estados de fases, scoring, timer, cola de envío
  screens/     una carpeta por pantalla
  minigames/   los 5 tipos: entrevista, wireframe, logica, bugs, deploy
  ui/          componentes visuales compartidos entre pantallas (TopBar, EscenaCliente)
  content/     un JSON por escenario (contenido, no código)
  lib/         supabase.js, queue.js, storage.js
  styles/      tokens.css (fuente de verdad del diseño) y un .css por componente
```

## Convenciones

- Español en UI, textos de contenido y comentarios. Nombres de variables y funciones en inglés.
- Commits cortos y en español: `feat: minijuego de bugs`, `fix: timer no pausa en el epílogo`.
- Nada de dependencias nuevas sin preguntar primero. Este proyecto debe seguir funcionando dentro de un año sin mantenimiento.
- `localStorage` siempre con prefijo `md:` y limpieza al terminar la partida o al cambiar el código de sesión.
- Los secretos van en `.env.local` (ignorado) y en GitHub Actions secrets. La `anon key` de Supabase queda visible en el bundle: es esperado, la seguridad la da RLS.

## Criterio de aceptación permanente

Una partida completa, de la pantalla de registro al epílogo, debe poder jugarse de punta a punta **en cada commit**. Si algo se rompe a mitad del flujo, eso se arregla antes de seguir construyendo.

## Al terminar cada sesión de trabajo

Actualiza `docs/PLAN.md`: qué quedó hecho, qué decisiones se tomaron y por qué, y qué sigue. Es el handoff para la próxima sesión.
