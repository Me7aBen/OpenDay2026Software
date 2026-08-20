# Procedimiento de construcción con Claude Code
### MISIÓN DEPLOY · del repo vacío al taller funcionando

---

## Etapa 0 · Antes de escribir una línea (30–40 min, sin Claude Code)

Cuatro cosas, en este orden. La primera puede cambiar todo el plan, así que va primera.

1. **Probar el firewall del laboratorio.** Desde una PC del lab, abrir `https://supabase.com` y, si puedes, hacer un `fetch` a cualquier endpoint `*.supabase.co` desde la consola del navegador. Si el campus lo bloquea, avísame y cambiamos de estrategia antes de construir nada.
2. **Crear el repo** `mision-deploy` en GitHub (público, para que GitHub Pages sea gratis).
3. **Crear el proyecto Supabase** (región São Paulo). Guardar `Project URL` y `anon public key`.
4. **Instalar Claude Code.** Instrucciones y requisitos actuales: https://docs.claude.com/en/docs/claude-code/overview

---

## Etapa 1 · Bootstrap del repo (15 min)

```bash
git clone https://github.com/TU_USUARIO/mision-deploy.git
cd mision-deploy
npm create vite@latest . -- --template react
npm install
mkdir -p docs
```

Luego, tres archivos a mano:

| Archivo | Contenido |
|---|---|
| `CLAUDE.md` | El archivo que te entregué. Va en la raíz |
| `docs/propuesta.md` | La propuesta completa del taller |
| `docs/PLAN.md` | Solo una línea: `## Estado: etapa 1 completa. Siguiente: motor + escenario A.` |

```bash
git add -A && git commit -m "chore: bootstrap del proyecto" && git push
claude
```

> **Por qué `CLAUDE.md` antes que el código:** Claude Code lo lee automáticamente en cada sesión. Sin él, cada conversación empieza de cero y las decisiones se contradicen entre sesiones.

---

## Etapa 2 · El motor y el contrato de contenido

Esta es la etapa que define si el proyecto escala a 3 escenarios o se vuelve un nudo. **Usa plan mode** (`Shift+Tab`) y revisa el plan antes de aceptar.

> **Prompt 1**
>
> Lee `CLAUDE.md` y `docs/propuesta.md`.
>
> Quiero construir el motor del juego y el contrato de contenido, sin diseño visual y sin backend todavía. Estilos mínimos y feos, en serio: esta etapa es para cronometrar el guion, no para que se vea bien.
>
> Necesito:
> 1. `docs/contrato-escenario.md` con el esquema del JSON de escenario y un ejemplo comentado.
> 2. Un motor en `src/engine/` que lea un JSON de escenario y ejecute las 5 fases en orden, con timer global de 11 minutos, timer por fase con auto-avance, y acumulación de puntaje.
> 3. `src/content/ccorca.json` con el contenido del escenario A tal como está en la propuesta (12 decisiones en total).
> 4. Los 5 minijuegos en `src/minigames/`, funcionales pero sin gracia visual: entrevista, wireframe, lógica, bugs, deploy.
> 5. Pantalla de registro (nombre + colegio), selección de escenario, HUD y pantalla de resultado con epílogo según puntaje.
>
> El leaderboard de esta etapa es fake, leído de `localStorage`. Supabase viene después.
>
> Antes de escribir código, propón el contrato del JSON y espera mi visto bueno.

**Criterio para cerrar la etapa:** puedes jugar de registro a epílogo sin tocar código y sin errores en consola.

---

## Etapa 3 · Cronometrar con humanos reales (la etapa que nadie hace)

Antes de invertir en diseño y backend:

1. Juégalo tú una vez, cronómetro en mano.
2. Siéntate con **2 o 3 estudiantes de secundaria** (sobrinos, hijos de colegas, lo que tengas) y **no les expliques nada**. Solo observa dónde se trancan y dónde leen dos veces.
3. Ajusta tiempos y textos **solo en los JSON**. Si tuviste que tocar `src/engine/` para ajustar contenido, el contrato quedó mal: dile a Claude Code que lo corrija ahora, no después.

Esta media hora te ahorra rediseñar el taller entre la sesión 1 y la 2 del evento.

---

## Etapa 4 · Supabase, leaderboard y panel del facilitador

> **Prompt 2**
>
> Ahora la persistencia. Según `docs/propuesta.md` sección 8:
>
> 1. Genera `supabase/schema.sql` con las tablas `sesiones` y `partidas`, los `check` de validación y las policies de RLS. Lo voy a correr yo a mano en el editor de Supabase.
> 2. `src/lib/supabase.js` con el cliente leyendo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
> 3. Resolución de sesión: si la URL trae `?s=CODIGO` se usa ese; si no, se consulta la sesión abierta. Si Supabase no responde, entrar en "modo local" con un aviso discreto y seguir jugando normal.
> 4. `src/lib/queue.js`: cola en `localStorage` para partidas no enviadas, con reintento al cargar la app.
> 5. Pantalla `/leaderboard` para proyector: top 10 de la sesión activa, refresco cada 4 segundos, tipografía legible a 8 metros.
> 6. Pantalla `/facilitador`: crear y cerrar sesión, ver todas las partidas, filtrar solo individuales, descargar CSV, ocultar una fila. Protegida con una clave simple en variable de entorno; es para un evento, no para producción.
>
> Prueba el flujo completo con datos reales antes de dar por terminado.

**Prueba obligatoria antes de cerrar:** juega una partida, corta el wifi a mitad, termínala, reconecta y verifica que la partida llegó al leaderboard.

---

## Etapa 5 · Escenarios B y C (solo contenido)

Aquí el trabajo es tuyo, no de Claude Code: **el contenido pedagógico y narrativo lo escribes tú**, porque es donde está el valor del taller y tú conoces el contexto minero y rural de verdad.

Dos formas de hacerlo, y te recomiendo la segunda:

- Pedirle a Claude Code que genere B y C por analogía con A. Rápido, pero suena genérico.
- **Escribir el contenido conmigo aquí en chat** (decisión por decisión, con el "por qué" de cada opción) y que Claude Code solo lo convierta a JSON y valide contra el contrato.

> **Prompt 3**
>
> Te paso el contenido del escenario B en texto plano. Conviértelo a `src/content/turno-seguro.json` respetando `docs/contrato-escenario.md`, sin inventar ni reescribir ningún texto, y agrégalo al selector de escenarios. Si algo del contenido no encaja en el contrato, dime qué falta en vez de improvisar.

---

## Etapa 6 · Diseño y aplicación de estilos

1. Le pasas a Claude Design la sección 9 de la propuesta (el brief) más capturas de tu prototipo feo.
2. De ahí sacas: los tokens (colores, tipografías, espaciado), las 11 pantallas y los assets.
3. Guardas los assets en `public/assets/` y los tokens en `src/styles/tokens.css`.

> **Prompt 4**
>
> Ya tengo el diseño. Los tokens están en `src/styles/tokens.css` y los assets en `public/assets/`. Aplica el diseño a todas las pantallas usando **solo** esos tokens, sin inventar colores ni tamaños nuevos. Objetivo 1366×768 horizontal sin scroll durante la partida; el leaderboard sí puede ser distinto porque va a proyector. No cambies ninguna lógica del motor en este paso.

Mantener el diseño en un commit separado de la lógica te permite revertir solo lo visual si algo se rompe.

---

## Etapa 7 · Deploy y ensayo en el laboratorio

> **Prompt 5**
>
> Configura el deploy a GitHub Pages con GitHub Actions: build de Vite con el `base` correcto para este repo, e inyectando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde los secrets del repositorio. Documenta en `docs/PLAN.md` qué secrets tengo que crear y dónde.

Después, **ensayo en el laboratorio real** (no en tu laptop):

- Abrir en 3 PCs distintas al mismo tiempo y terminar 3 partidas en paralelo.
- Verificar el leaderboard proyectado desde el fondo del aula. Si no lo lees a 8 metros, sube la tipografía.
- Probar el atajo de reinicio y la limpieza de `localStorage` entre grupos.
- Cronometrar el bloque completo de 25 minutos con el guion en la mano.

---

## Etapa 8 · Kit del facilitador

> **Prompt 6**
>
> Genera `docs/kit-facilitador.md`: guion minuto a minuto del taller, checklist de los 10 minutos previos a cada sesión, las 3 preguntas de debrief con su respuesta esperada, y el plan B si Supabase o la red fallan. Debe poder imprimirse en 2 páginas y ser usable por alguien que no construyó el juego.

Eso último importa: si el taller solo lo puedes dictar tú, se dicta 4 veces. Si un estudiante-embajador puede dictarlo, se dicta 12.

---

## Cómo trabajar con Claude Code en este proyecto

| Práctica | Por qué |
|---|---|
| **Un objetivo por sesión**, y `/clear` al cambiar de etapa | El contexto sucio de la etapa anterior produce decisiones contradictorias |
| **Plan mode (`Shift+Tab`) para todo lo estructural** | Corregir un plan cuesta un minuto; corregir 800 líneas cuesta una tarde |
| **Rama por etapa** (`git checkout -b etapa-4-supabase`) | Si una etapa sale mal, la tiras completa sin perder lo anterior |
| **Que actualice `docs/PLAN.md` al cerrar cada sesión** | Es la memoria del proyecto entre sesiones |
| **Jugar una partida completa antes de cada commit grande** | El bug caro es el que aparece con 30 estudiantes mirando |
| **Decirle "no" al alcance extra** | Va a proponerte sonidos, logros, animaciones. Anótalos en `docs/PLAN.md` como backlog y sigue |

**Tiempo realista:** etapas 1–4 en dos sesiones de trabajo enfocadas. El contenido de B y C es lo que más tiempo humano toma, y es lo que no conviene apurar.

---

## Y si algo se rompe

Cuando Claude Code se atore en algo, tráelo aquí con el error y el archivo: es más fácil razonar sobre una decisión de arquitectura en chat que a mitad de una sesión de edición. Sobre todo el contrato del JSON de escenario, que es la pieza de la que depende todo lo demás.
