# Contexto del proyecto

**Plataforma de exploración vocacional para estudiantes de secundaria en Perú.**

El estudiante busca una carrera, lee qué se estudia en ella, y —esto es lo que
distingue al producto— **la experimenta** jugando una simulación basada en un
problema profesional real antes de decidir si le interesa.

> Antes de elegir una carrera, experiméntala.

El nombre comercial todavía no está definido. El provisional es **PRIMER DÍA** y
vive en `src/config/marca.js`: no se escribe a mano en ningún componente.

## Historia: de dónde viene este repo

Nació como "Misión Deploy", un simulador para un taller de Tecsup Day. Esa
aplicación completa **sigue existiendo y funcionando** en la ruta `/evento`
(registro por colegio, misiones en secuencia obligatoria, ranking por sesión).
No se eliminó: se convirtió en un modo más del producto, útil para ferias y
visitas escolares.

El principio de la migración fue **cambiar la cáscara, conservar el corazón**:
el motor de simulación, los minijuegos y el pixel art se reutilizaron enteros;
lo que cambió fue lo que los rodea.

## Reglas de oro

1. **El motor no contiene narrativa.** Ni un solo string de historia, pregunta,
   opción o feedback vive en `src/engine` o `src/minigames`. Todo el contenido
   está en `src/content/*.json`. Si un minijuego necesita un rótulo distinto
   según la simulación, ese rótulo se declara en el JSON con el valor histórico
   como default — no se agrega un `if` por escenario.
2. **Agregar una simulación = agregar un JSON.** Si obligara a tocar el motor,
   el diseño del motor está mal.
3. **Las dos simulaciones heredadas no se rompen.** "Código Cero" y "Luz para
   Ccorca" tienen que poder jugarse de punta a punta en cada commit, tanto desde
   la plataforma (`/simulaciones/:slug/jugar`) como desde `/evento`.
   `npm test` juega las tres simulaciones completas contra el reducer real.
4. **Mobile first.** El público principal entra desde un celular. Se diseña
   primero para 360–390 px de ancho y se crece hacia arriba. Nada de "desktop
   encogido": en móvil los componentes se **reorganizan**, no se achican. Cero
   scroll horizontal, objetivos táctiles de 44 px o más.
5. **Público real: chicos de 15–17 años que no saben nada de la profesión.**
   Cada fase abre con una explicación breve en lenguaje simple antes de pedir la
   primera decisión. Cero jerga sin explicar.
6. **No todo es un cuestionario.** Cada minijuego usa la interacción que le
   corresponde de verdad. Selección por clic solo cuando la decisión real es
   "elegir una opción de una lista".
7. **El puntaje no es una señal vocacional.** Es el resultado de un juego. La
   señal vocacional es la respuesta explícita del estudiante a "¿qué te pareció
   la experiencia?", y se guarda **separada** del puntaje. Ninguna pantalla dice
   "eres ideal para X".
8. **No se inventan datos.** Nada de sueldos, rankings de universidades ni
   mallas presentadas como oficiales. Todo dato de carrera o institución lleva
   `fuenteEstado` y la UI dice cuando es contenido de ejemplo.
9. **No se simula un pago.** Mientras no haya backend seguro, el CTA de compra
   dice "Próximamente disponible" y no se pide ni un dato. Cero secretos en el
   frontend.
10. **Sin audio indispensable.** Todo sonido es decorativo, opcional y
    lazy-loaded.
11. **Sin dependencias nuevas sin preguntar.** Este proyecto debe seguir
    funcionando dentro de un año sin mantenimiento. Por eso el router es propio
    (~100 líneas) y no hay librería de estado, de UI ni de animación.

## Stack

- React + Vite (JS, no TS). **Cero dependencias runtime** además de React.
- Estado: `useReducer` + contexto.
- Router propio sobre la History API (`src/app/router/`), con `public/404.html`
  para que las URLs profundas funcionen en GitHub Pages.
- Supabase opcional, solo en modo evento; falla en silencio a localStorage.
- CSS con variables en `src/styles/tokens.css`.
- Deploy: GitHub Pages vía GitHub Actions, base `/OpenDay2026Software/`.

## Estructura

```
src/
  app/           router, layout de la plataforma, metadatos SEO
  config/        marca.js — nombre, tagline y logo, en un solo lugar
  features/
    careers/     modelo de carrera, catálogo, ficha, buscador
    institutions/ instituciones y programas académicos (entidades separadas)
    compare/     comparador de hasta 3 carreras
    simulations/ catálogo, pantalla de entrada, host del motor, resultado
    exploration/ "Mi exploración": guardadas, historial, opiniones
    learning/    microcursos
    home/        homepage
    event/       modo evento (la jornada del Open Day, intacta)
  engine/        máquina de fases, scoring, timer   ← el corazón, reutilizado
  minigames/     mecánicas, mapeadas por tipoInteraccion  ← reutilizadas
  screens/       pantallas del motor (HUD, registro, resultado del evento)
  ui/            componentes visuales compartidos, pixel art
  content/       un JSON por simulación (contenido, no código)
  lib/           supabase, storage, audio
  styles/        tokens.css y un .css por componente
tests/           node --test, sin runner ni dependencias
```

## Rendimiento

La homepage **no** carga el motor, ni los minijuegos, ni los JSON de escenario,
ni el audio. Todo eso está detrás de `lazy()` y de imports dinámicos, y baja
recién cuando el estudiante entra a una simulación. Al tocar esto, revisar que
el chunk inicial siga sin arrastrar `PantallaJuego`.

## Convenciones

- Español en UI, contenido y comentarios. Nombres de variables y funciones en
  inglés cuando corresponda; el dominio está en español.
- Commits cortos y en español: `feat: flow debugger`, `fix: reloj de fase en NaN`.
- `localStorage` siempre con prefijo `md:`.
- Los secretos van en `.env.local` (ignorado) y en GitHub Actions secrets.

## Criterio de aceptación permanente

`npm run lint`, `npm test` y `npm run build` pasan, y las tres simulaciones se
juegan de principio a fin —desde el celular— en cada commit.
