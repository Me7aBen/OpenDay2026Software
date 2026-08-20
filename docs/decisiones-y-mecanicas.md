# Decisiones de Mecánicas y ampliación del contrato
### MISIÓN DEPLOY · v2 (post-lluvia de ideas)

> Documento de **decisiones**, no de spec. Define qué se hace, qué no, y por qué. Lo que viene después (la implementación en JSX) sale de este documento + `contrato-escenario.md`.
> Referencias: `docs/CLAUDE.md`, `docs/contrato-escenario.md`, `docs/lluvia.de.ideas`.

---

## 1. Las 4 mecánicas que pediste (confirmadas)

| # | Mecánica | Inserción en el JSON | Esfuerzo | Toca motor |
|---|---|---|---|---|
| 1 | **Mapa de calor** — clic sobre una imagen para "marcar" puntos críticos | nueva `tipoInteraccion: 'mapa-calor'` | medio | sí |
| 2 | **Slider entre imágenes** — barra que mezcla entre 4 mockups | nueva `tipoInteraccion: 'slider-imagenes'` | medio | sí |
| 3 | **Preguntas relámpago** — micro-decisiones de 5-8s con timer visible | nueva `tipoInteraccion: 'relampago'` | bajo | sí |
| 4 | **Pregunta normal** — la `seleccion-unica` actual, mejorada | re-uso de `seleccion-unica` | bajo | no |

---

## 2. Las 4 mecánicas extra que recomiendo (no incluidas en tu lista, pero valen)

| # | Mecánica | Para qué fase | Razón pedagógica |
|---|---|---|---|
| 5 | **Drag & drop de bloques tipo Scratch** (`SI`, `Y`, `bateria < 20`) en `construir` | construir | Es la mecánica que la propuesta original de la pág. §5 Fase 3 ya menciona. Hoy es input de texto plano. Mejor salto visual. |
| 6 | **Bandeja de tickets con severidad** | probar | Reemplaza los 3 botones con tarjetas de tamaño/color variable. Enseña a priorizar leyendo contexto, no a fuerza bruta. |
| 7 | **Reacción del cliente según puntaje parcial** | TODAS | El "storytelling" del que hablás. El cliente cambia su emoji + frase según cómo venís. Sin tocar el motor — es solo un array en el JSON. |
| 8 | **Chat que avanza con cada decisión** | TODAS | Mensajes cortos del cliente que van apareciendo en una burbuja tipo chat de WhatsApp. Hace que el cliente no aparezca-desaparecezca entre fases. Sin tocar el motor. |

---

## 3. Lo que confirmamos del pedido original

### 3.1 "Definido en JSONs"
Sí. Cada mecánica nueva se declara dentro de la `Decision` como `tipoInteraccion` + `metaMinijuego` con sus datos. **El motor no conoce la historia**, solo sabe leer el `tipoInteraccion` y delegar al componente que sabe renderizarlo. Esto cumple la regla de oro 1 del `CLAUDE.md`.

### 3.2 "Que el cliente renderice de acuerdo al tipo de pregunta o fase"
Sí. Las fases ya tienen el campo `estilo` (cosmético, actualmente). Se renombra a `minijuegoPorDecision` y se quita del JSON el mapeo uno-a-uno. **El motor lee `decision.tipoInteraccion` y elige el componente**. Una fase puede mezclar mecánicoas (ver §5).

### 3.3 "Reacciones del personaje según puntaje"
Sí. Implementado como **nuevo campo en el escenario**, no en cada decisión. Esto lo hace agnóstico al motor:

```jsonc
"cliente": {
  "nombre": "Rosa",
  "rol": "Profesora",
  "dolorFrase": "Las baterías se descargan sin aviso y los chicos pierden clases de computación.",
  "reacciones": [
    { "fase": "descubrir", "rangoPuntaje": "bajo",  "emoji": "🙄", "frase": "Ay, pensé que preguntarían otra cosa..." },
    { "fase": "descubrir", "rangoPuntaje": "medio", "emoji": "🙂", "frase": "Ah, interesante lo que me preguntas." },
    { "fase": "descubrir", "rangoPuntaje": "alto",  "emoji": "😮", "frase": "¡Qué buenas preguntas! Nadie había preguntado eso." }
  ]
}
```

El puntaje del "rango" se calcula **contra el puntaje parcial acumulado del escenario hasta esa fase**, no contra el final. Esto hace que la reacción llegue en el momento en que se la ganó, no cinco minutos después.

### 3.4 "Personajes con movimiento"
Sí. El `EscenaCliente` actual tiene un personaje pixelado estático. Se reemplaza por una **animación CSS ligera** (idle: respiración con `transform: scale`, hablando: rebote, asustado: shake). Sin assets nuevos, sin librería. **Cero impacto en performance** (es solo `transform`).

### 3.5 "Mensajes en pantalla claros"
Sí. Tres reglas de tipografía que aplicamos:
- **Pregunta ≤ 2 líneas** (ya era regla de oro).
- **Explicación entre 4 y 6 líneas** (ya era regla de oro).
- **Feedback siempre en una caja destacada** (`feedback-box.ok` o `.info`), no inline. Ningún texto "explicativo" sin destacar.

### 3.6 "Leaderboard en vivo después de cada pregunta"
**Sí, con un matiz importante.** Esto NO es un cambio de pantalla — es un **panel lateral** que aparece después de cada decisión resuelta, con tu posición actual, los 3 de arriba y tu puntaje vs. el top. No reemplaza la pantalla de resultado, la complementa. Razonamiento en §6.

### 3.7 "No en una sala viendo al mismo cliente — más interactivo, sin presión de tiempo"
**Esto es la decisión de diseño más fuerte de este documento.** Cambia la lógica central del juego:

| Antes | Ahora |
|---|---|
| Timer global 16 min, auto-avance por fase | **Sin timer global**. Cada decisión tiene su `tiempoSegMax` individual. Si se pasa, puntúa 0 y se muestra feedbackSinCoincidencia. |
| El cliente aparece al inicio de cada fase | **El cliente aparece/desaparece entre decisiones** (chat que se llena). |
| Ritmo fijo: 5 fases × 3 decisiones | **Ritmo libre**: 8-10 decisiones combinando mecánicas. El usuario puede quedarse en una fase mucho si quiere. |
| Puntaje premia velocidad (bono de tiempo) | **Puntaje premia calidad**. Sin bono de tiempo. El desempate es por `criterioSecundario` opcional definido en el JSON (ej. "puntaje en construir"). |

**Por qué funciona:** el público no compite contra el reloj, compite **contra sí mismo** y contra el resto del leaderboard. La presión viene del ranking, no del countdown. Esto encaja con el taller de Tecsup: 15-17 años no necesitan un cronómetro agresivo, necesitan sentirse "dueños" de su historia.

**Costo:** hay que quitar del motor el `TICK` global y el mecanismo de auto-avance por fase. El `Timer` por decisión se mantiene pero es **opcional** (cada `Decision` puede no traer `tiempoSegMax` y vivir sin límite, dejando al usuario decidir cuándo seguir). El bono de tiempo desaparece (o se mantiene como opcional detrás de un flag).

---

## 4. Modelo de datos consolidado de la `Decision` (v2)

Este es el **nuevo esquema** de la decisión, después de las decisiones tomadas. Es aditivo respecto al actual (no rompe el escenario A; lo migra).

```
Decision
├─ id: string
├─ tipoInteraccion: 'seleccion-unica'           // pregunta normal
│             | 'seleccion-multiple'            // drag & drop
│             | 'escribir'                      // input de código
│             | 'mapa-calor'  ← NUEVO           // clic sobre imagen
│             | 'slider-imagenes'  ← NUEVO      // barra entre 4 mockups
│             | 'relampago'  ← NUEVO            // pregunta con timer 5-8s
│             | 'bloques-logica'  ← NUEVO       // drag de Scratch-style
├─ pregunta: string
├─ pistaTexto?: string
├─ tiempoSegMax?: number                        // si no está, sin límite
├─ metaMinijuego?: {
│      plantillaCodigo?: string                  // 'escribir' | 'bloques-logica'
│      imageFondo?: string                       // 'mapa-calor' | 'slider-imagenes'
│      zonasClicables?: Zona[]                   // 'mapa-calor'
│      mockups?: Mockup[]                        // 'slider-imagenes'
│      bloquesDisponibles?: BloqueScratch[]       // 'bloques-logica'
│      bloquesCorrectos?: string[]               // 'bloques-logica'
│      plantillaOpcionCorrecta?: string          // 'escribir' (alternativa al match)
│   }
├─ seleccionExacta?: number                      // 'seleccion-multiple'
├─ tablaPuntaje?: { [key: string]: number }       // 'seleccion-multiple' | 'mapa-calor'
├─ feedbackSinCoincidencia?: string              // 'escribir' | 'relampago'
└─ opciones: Opcion[]                            // en mapa-calor puede ser []
```

La `Opcion` queda igual. En `mapa-calor`, las opciones no se eligen — el puntaje sale del `metaMinijuego.zonasClicables`. En `slider-imagenes`, la "opción" es la posición del slider: `opciones` es un array de 4 cards y el motor mira cuál está **más cerca** del `puntajeSlider`.

---

## 5. Composición de fases (lo que reemplaza al "estilo" único)

Hoy el contrato tiene `Fase.estilo: 'entrevista' | 'wireframe' | ...` y ese estilo mapea 1-a-1 a un minijuego. **Eso se va.** Ahora la fase solo declara `id`, `titulo`, `rol`, `explicacion`, `intro`, `reaccionesClienteDisponibles`, y un array de `decisiones`. **Cada decisión trae su propia mecánica.**

Es decir, una fase `disenar` puede tener:
- Decisión 1: `slider-imagenes` (elegir entre mockups)
- Decisión 2: `seleccion-multiple` (idioma/colores)
- Decisión 3: `mapa-calor` (marcar zonas de la pantalla del portero)

Esto resuelve tu pedido de "*no siempre lo mismo*" sin reinventar nada del motor. Solo se quita el `estilo` global.

**Excepción:** `construir` sigue usando `bloques-logica` o `escribir` (no tiene sentido meter un mapa de calor ahí pedagógicamente). Se valida en el JSON.

---

## 6. Leaderboard en vivo (cómo se ve)

### 6.1 Posición en pantalla (no en pantalla separada)

Después de cada decisión resuelta, durante **3 segundos** aparece un panel translúcido en la esquina superior derecha:

```
┌─────────────────────────────┐
│  #14  Andreas M.            │
│  Colegio San José · Ccorca  │
│  450 pts (+60)              │
│  ────────────────────────   │
│  ▲ Subiste 2 posiciones     │
│  Top 1: Lucía Q. (820)      │
└─────────────────────────────┘
```

No bloqueo: el usuario puede hacer clic en "Siguiente" antes de los 3s. Solo se muestra si hay red (Supabase) y si la partida actual ya fue enviada. Si no hay red, no se muestra (cumple regla de oro 3: offline-first).

### 6.2 Cómo se calcula tu posición

El estado local del jugador guarda `puntajeAcumulado` después de cada decisión. Para conocer la posición, consulta a Supabase:

```sql
SELECT count(*) FROM partidas
WHERE sesion = 'AQP-1809-A' AND puntaje > 450
```

Es 1-2ms con índice. Cada PC pregunta una sola vez por decisión, no realtime. Eso es coherente con la propuesta original (polling cada 4s, no subs).

### 6.3 Reemplazo del "bono de tiempo"

Como dijimos, sin timer global no hay bono de tiempo. **Reemplazo recomendado:** el ranking premia al que **más puntos crudos** acumuló. El desempate se hace por `criterioSecundario` del JSON de escenario (default: puntaje en la fase `construir` — alinea con "yo programé algo que funcionó"). Esto no necesita cambio de esquema en Supabase: alcanza con mandar `puntajeSecundario` en el INSERT.

### 6.4 Categorías de ranking (opcional, no rompe nada)

En la pantalla de resultado final, además del top general, mostrás 5 mini-rankings por fase (mejor analista, mejor UX, mejor dev, mejor QA, mejor DevOps). Esto da 5 chances de podium sin canje. **Lo dejo como opt-in, no como default**, porque agrega ruido visual.

---

## 7. Reacciones del cliente (detalle de implementación)

### 7.1 Cómo se dispara

Después de resolver la última decisión de una fase, antes de mostrar la siguiente, el motor:
1. Calcula el puntaje parcial de la fase.
2. Lo categoriza en `bajo | medio | alto` (rangos por defecto: `< 50%`, `50-80%`, `> 80%` del máximo posible de la fase).
3. Busca en `cliente.reacciones[]` la entrada que matchee fase + rango.
4. Muestra la reacción como un **toast o burbuja** durante 2.5 segundos.
5. Si no hay reacción para esa combinación, no muestra nada (silencio).

### 7.2 Visibilidad

El personaje en la escena **cambia de emoji/pose** durante la reacción. Los movimientos nuevos son:
- `idle` por defecto (respiración suave).
- `feliz` (salto leve + bounce).
- `confundido` (inclinación de cabeza + shake leve).
- `molesto` (paso atrás + emoji 😤).
- `sorprendido` (pop-up + emoji 😮).

**Implementación:** 5 estados CSS en el SVG/emoji del cliente. **No requiere librerías**, ni canvas, ni assets nuevos.

---

## 8. Chat que avanza con cada decisión (detalle)

### 8.1 Cómo se llena

Cada `Decision` puede tener un campo opcional `mensajeCliente` que se muestra en una burbuja de chat **antes** de la primera decisión de la fase. Opcionalmente, cada decisión puede tener `mensajeClientePost` que se muestra **después** de ser resuelta.

```jsonc
{
  "id": "descubrir-1",
  "tipoInteraccion": "mapa-calor",
  "pregunta": "Marca los 3 lugares del colegio donde pasan cosas",
  "mensajeClientePost": "¡Uy! Sabías que el portero nunca baja al sótano, ¿eh?",
  "metaMinijuego": { ... }
}
```

### 8.2 Acumulación

El estado del juego mantiene `chat: Mensaje[]`. Cada mensaje tiene `autor: 'cliente' | 'jugador'`, `timestamp`, `texto`. El chat se puede **revisar al final** en la pantalla de resultado, como "lo que dijiste en esta misión". Esto refuerza la narrativa continua que pediste.

### 8.3 Implementación

**Cero cambio de motor.** Es un array en el `gameReducer` que se appenda con cada `RESPONDER_DECISION`. El render es un componente nuevo `BurbujaChat` que el `EscenaCliente` envuelve.

---

## 9. Ranking por puntaje (sin timer)

Esto es la decisión clave de la **lógica de juego**:

### 9.1 Reglas

- **Puntaje total** = suma de `puntajeDecisiones + bonoEspecifico + bonusMecanica` (cap 1000).
- **Bono de tiempo**: eliminado. Si la versión 1.x lo tenía, se quita.
- **Penalización de pista**: se mantiene (-20 c/u). Es una decisión pedagógica, no de timer.
- **Bonos especiales** (`bugCritico`, `usuarioReal`): se mantienen.
- **Bono de mecánicas** (NUEVO): cada mecánica puede traer un `bonusPorMecanica` en su `metaMinijuego` (ej. "si usás 3+ bloques correctos, +20"). Es opcional.

### 9.2 Desempate

```jsonc
"escenario": {
  "criterioDesempate": "puntaje-construir"  // default si se omite
}
```

Default: `puntaje-construir` (alínea con el "yo programé algo y funcionó", que es el momento que el chico se lleva a casa).

---

## 10. Lo que NO cambia (líneas rojas)

- **5 fases del ciclo de vida.** Intocable. Es el andamiaje pedagógico.
- **Reglas de oro del `CLAUDE.md`:** motor sin narrativa, offline-first, sin jerga, no-todo-cuestionario, 1366×768 sin scroll, sin audio indispensable.
- **`Opcion`:** id, texto, puntaje, esCorrecta, esTrampa, feedback, bonus. No se toca.
- **`Epilogo`:** por buckets de puntaje. No se toca.
- **Stack:** React + Vite, sin TS, sin librería de estado, sin librería de animación (CSS only).

---

## 11. Tareas de implementación (orden sugerido)

| # | Tarea | Esfuerzo | Bloquea la siguiente |
|---|---|---|---|
| 1 | Actualizar `contrato-escenario.md` con los nuevos `tipoInteraccion` | 2h | sí |
| 2 | Implementar `mapa-calor` en `src/minigames/MapaCalor.jsx` + CSS | 8h | no |
| 3 | Implementar `slider-imagenes` en `src/minigames/SliderImagenes.jsx` + CSS | 8h | no |
| 4 | Implementar `relampago` (wrapper de `seleccion-unica` con timer corto) | 4h | no |
| 5 | Implementar `bloques-logica` (drag & drop de Scratch) | 12h | no |
| 6 | Agregar `cliente.reacciones[]` + `Decision.mensajeCliente` + `BurbujaChat` | 4h | no |
| 7 | Animaciones del personaje (idle, feliz, confundido, molesto, sorprendido) | 3h | no |
| 8 | Quitar Timer global; pasar a `tiempoSegMax` por decisión | 4h | sí |
| 9 | Panel de leaderboard en vivo (pull a Supabase cada decisión) | 6h | sí |
| 10 | Migrar `ccorca.json` a v2 del contrato | 6h | no |
| 11 | Re-jugar con 2-3 estudiantes ajenos al proyecto (Etapa 3 del procedimiento) | — | sí |

**Bloqueantes:** la 1 hay que hacerla primero. La 8 depende de cómo se decida el tema del timer. La 9 depende de tener Supabase (Etapa 4).

---

## 12. Decisiones que dejo ABIERTAS para discutir

1. **¿Se quita el timer global SÍ o SÍ?** Mi recomendación es sí. Si preferís mantenerlo (por miedo a que se eternicen), la versión 2 funciona con timer global opcional. Quiero tu OK explícito.
2. **¿El bono de tiempo se reemplaza por desempate por puntaje en construir o por otro criterio?** Default: construir. Pero vos conocés al público.
3. **¿El personaje animado tiene 5 estados CSS o solo 3 (feliz/confundido/molesto)?** Mi recomendación: 5 estados. 3 ahorra 1h pero pierde expresividad.
4. **¿El chat con la historia completa se muestra en la pantalla de resultado?** Recomiendo que sí, pero ocupa espacio. Se puede reemplazar por un botón "Ver conversación" que abre un modal.
5. **¿Las categorías de ranking (mejor analista, etc.) entran en v1 o quedan para v2?** Recomiendo v2: agrega ruido visual sin cambiar el juego.

---

*Fin del documento de decisiones. Si validás §3.7 (sin timer global) y §7 (reacciones por puntaje), podemos arrancar con la Tarea 1 mañana.*
