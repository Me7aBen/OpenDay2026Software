# Storytelling — MISIÓN DEPLOY
### Borrador de narrativa v2 · mecánica por decisión

> Documento vivo. Define el **guion de la partida** con la mecánica específica que va en cada decisión. La historia se cuenta con la combinación de: cliente que reacciona, chat que avanza, mecánicas que varían, y feedback puntual.
> Supuestos base: 1 escenario = 1 historia. 5 fases × 2-3 decisiones = 8-10 decisiones totales. Sin timer global (decisión §3.7 de `decisiones-y-mecanicas.md`). El puntaje total sigue siendo 0-1000.

---

## 0. Estructura narrativa común (todas las historias)

Toda historia sigue este **arco emocional del cliente**:

```
FASE 1  →  Cliente: vulnerable, espera ayuda.
FASE 2  →  Cliente: curiosa, "por fin alguien me escucha".
FASE 3  →  Cliente: confiada, "está funcionando".
FASE 4  →  Cliente: preocupada, "algo falló pero confiamos".
FASE 5  →  Cliente: agradecida o frustrada, según el puntaje.
```

El cliente cambia su **emoji + frase** según el `rangoPuntaje` que acumulaste hasta esa fase. Esto es la reacción que se evaluó en las ideas.

---

## 1. Historia A · "Luz para Ccorca" (energía limpia)

**Cliente:** Rosa, profesora de primaria en Ccorca.
**Dolor:** Las baterías se descargan sin aviso y los chicos pierden clases de computación.
**Lo que se construye:** sistema de monitoreo con alertas por SMS.

### Fase 1 · DESCUBRIR (Analista)

**Explicación al estudiante:**
> "Eres analista. Tu trabajo es entender bien el problema antes de tocar una sola línea de código. Vas a hacer una 'visita' al colegio de Rosa: vas a ver el lugar y charlar con ella. Cada clic que hagas le prestará atención a algo — y eso le dice a Rosa qué tipo de profesional eres."

**Mensaje del cliente (chat, antes de la 1ra decisión):**
> Rosa: "Gracias por venir. Te cuento rápido: la sala de cómputo usa baterías y siempre se corta la clase. No sé qué más decirte... pregunta lo que necesites."

**Decisiones:**

| # | Mecánica | Qué pasa | Puntaje |
|---|---|---|---|
| 1 | **Mapa de calor** (NUEVO) | El estudiante ve un plano SVG del colegio (sala de cómputo, patio, oficina de Rosa, caseta del portero, almacén, baños, cocina, depósito). Debe **marcar 3 lugares críticos** donde pasan cosas. La pregunta implícita: "¿qué partes del colegio sostienen el problema?". Zona válida: sala de cómputo, caseta del portero, oficina de Rosa. Trampa: baños, cocina. | `tablaPuntaje`: { "3": 60, "2": 30, "1": 0, "0": 0 } |
| 2 | **Pregunta relámpago** | Rosa habla rápido: *"El portero mide la batería con un aparato. ¿Quién crees que lo lee bien?"* Opciones: "el portero", "Rosa", "los chicos", "nadie lo lee". Responde en 8 segundos. | 0/30/60 |
| 3 | **Pregunta normal** (`seleccion-unica`) | Después de la visita, ¿qué pregunta clave le harías a Rosa antes de empezar? Opciones: la barrera económica, la conectividad, el usuario real, el color de la app. La trampa obvia se mantiene pero ahora cargada con la información previa. | 0/30/60 |

**Reacciones del cliente (rango por puntaje parcial de la fase):**
- `bajo` (≤30 pts): 🙄 "Ay, ¿no querías ver la caseta del portero?"
- `medio` (31-90 pts): 🙂 "Ah, mira, sabía que había algo más."
- `alto` (91+ pts): 😮 "¡Qué preguntas! Ya entiendo por qué te contrataron."

**Mensaje post-fase (chat):**
> Rosa: "Ahora sí, ya entiendo qué necesito. Seguimos."

---

### Fase 2 · DISEÑAR (Diseñador UX)

**Explicación:**
> "Eres diseñador UX. Tu trabajo es decidir qué ve y qué NO ve la persona que va a usar esto. El portero no sabe leer inglés, no tiene smartphone, y no le interesan los gráficos. Menos es más."

**Mensaje del cliente:**
> Rosa: "El portero don Tomás mide la batería dos veces al día. Quiero que cuando algo ande mal, él se entere sin tener que pensar."

**Decisiones:**

| # | Mecánica | Qué pasa | Puntaje |
|---|---|---|---|
| 1 | **Slider entre imágenes** (NUEVO) | Hay 4 mockups del celular del portero, ordenados de "minimalista" a "completo". El estudiante mueve un slider: cuanto más al centro (ni muy vacío ni muy lleno), mejor el puntaje. Mockup "óptimo" = posición 60-70% del slider. | distancia desde óptimo: { "0-15": 60, "16-30": 30, "31+": 0 } |
| 2 | **Pregunta normal** | ¿Idioma en pantalla? Opciones: solo iconos, español, inglés técnico. | 0/30/60 |
| 3 | **Mapa de calor** (re-uso) | Sobre el mismo mockup, **marca dónde va el botón de alerta**. Zonas válidas: la parte inferior central (pulgar del portero). Trampa: esquinas superiores (zona muerta). | `tablaPuntaje`: { "1": 60, "0": 0 } (binario) |

**Reacciones:**
- `bajo`: 😅 "Mmm, el portero me dijo que no entiende esos gráficos..."
- `medio`: 🙂
- `alto`: 😍 "¡Quedó hermosísimo y se entiende!"

---

### Fase 3 · CONSTRUIR (Desarrollador)

**Explicación:**
> "Eres desarrollador. Tu trabajo es traducir la decisión humana en una regla que la computadora entienda. Vas a armar la lógica de las alertas usando bloques de colores, como un Lego. Después la computadora 'ejecuta' y ves qué responde."

**Mensaje del cliente:**
> Rosa: "Quiero que la batería baja igual le avise al portero a tiempo, no después de que se cortó la clase."

**Decisiones:**

| # | Mecánica | Qué pasa | Puntaje |
|---|---|---|---|
| 1 | **Bloques Scratch** (NUEVO) | Bloques disponibles: `SI`, `Y`, `O`, `bateria < 20`, `bateria < 50`, `hora > 18`, `hora > 6`, `portero_cerca`, `portero_lejos`. El estudiante **arrastra hasta 4 bloques** para armar la condición de la alerta. Correcto: `SI` + `bateria < 20` + `Y` + `hora > 18`. | `tablaPuntaje`: { "4": 60, "3": 30, "2": 30, "1": 0, "0": 0 } |
| 2 | **Escribir** (re-uso) | Ya armado el armazón, escribir el número del umbral. Última línea: `if (bateria < ___ && hora > 18) enviarSMS(portero);` → estudiante escribe `20`. | 0/30/60 |
| 3 | **Pregunta relámpago** | "Si la batería está en 25% y son las 19:00, ¿qué pasa?" Opciones: "se manda SMS", "no pasa nada", "la pantalla parpadea". 8 segundos. | 0/30/60 |

**Panel de "ejecución" (la consola simulada):**
Después de la decisión 2, aparece en pantalla:
```
> corriendo...
> ✔ SMS enviado a +51 9... 968 142 305
> "Quedan 2 horas de luz"
```
Si la decisión 1 fue mala, la consola devuelve un error o no-manda-nada. Cada bloque conectado incorrecto se traduce en un mensaje distinto en la consola — **el feedback pedagógico es instantáneo**.

**Reacciones:**
- `bajo`: 😟 "Hiciste algo, ¿no? Pero no me llegó el mensaje cuando lo probé..."
- `medio`: 🙂
- `alto`: 🤩 "¡Lo probé en mi celular y funcionó!"

---

### Fase 4 · PROBAR (QA)

**Explicación:**
> "Eres QA. Tu trabajo es probar lo que armó el desarrollador y decidir qué se arregla primero. Nunca hay tiempo para todo, así que priorizás mirando el daño real, no la molestia."

**Mensaje del cliente:**
> Rosa: "Ya hay 3 reportes del portero. No podemos arreglar todo hoy. Decidí vos cuál primero."

**Decisiones:**

| # | Mecánica | Qué pasa | Puntaje |
|---|---|---|---|
| 1 | **Bandeja de tickets** (mejora visual del `seleccion-unica`) | 3 tarjetas de tamaño/severidad distinta. Cada una tiene su severidad visual (verde/amarillo/rojo), su descripción y un campo "reportado por". Solo podés elegir 1. Trampa: una tarjeta tiene severidad "rojo" pero descripción cosmética. | 0/30/60 + bonus `bugCritico` |
| 2 | **Pregunta normal** | "Cómo confirmás que quedó arreglado?" Opciones: prueba real con Rosa, revisar el código, asumir que compila. | 0/30/60 |
| 3 | **Pregunta relámpago** | "El bug vuelve a aparecer a las 3am. ¿Qué hace el sistema?" 8s. | 0/30/60 |

**Reacciones:**
- `bajo`: 😤 "Otra vez el mismo problema, ¿eh?"
- `medio`: 😅 "Menos mal, pero ojo con los siguientes."
- `alto`: 🥰 "¡Lo lograste! El portero está feliz."

---

### Fase 5 · DESPLEGAR (DevOps)

**Explicación:**
> "Eres DevOps. Tu trabajo es hacer llegar el sistema al usuario real. De nada sirve la mejor app si el portero no puede abrirla. Pensá en el celular que él tiene, no en el que vos querrías que tuviera."

**Mensaje del cliente:**
> Rosa: "El portero tiene un celular de los viejos, de botones. ¿Cómo le hacemos llegar la alerta?"

**Decisiones:**

| # | Mecánica | Qué pasa | Puntaje |
|---|---|---|---|
| 1 | **Slider entre imágenes** (re-uso) | 4 mockups de "canal de entrega": SMS, web, app Play Store, llamada. El slider va de "más universal" a "más sofisticado". Posición correcta: izquierda (SMS). | distancia desde óptimo: 0/30/60 |
| 2 | **Slider entre imágenes** | 4 mockups de "plan de respaldo": solo SMS, SMS + webhook, SMS + app + email. Óptimo: el más simple que funcione. | 0/30/60 |
| 3 | **Pregunta normal** | "Don Tomás te dice que la pantalla de su celular parpadea. ¿Qué hacés?" Opciones: cambio el plan, le doy un celular nuevo, le explico que es normal. | 0/30/60 |

**Reacciones:**
- `bajo`: 😞 "El portero me llamó para decirme que no funcionó. Habrá que volver a empezar."
- `medio`: 🙂
- `alto`: 🥳 "¡3 meses después, no perdimos una clase!"

---

### Epílogo (variantes)

| Puntaje | Texto |
|---|---|
| 800-1000 | "3 meses después, el colegio no perdió una sola clase de computación. Don Tomás recibe la alerta en su celular de botones y duerme tranquilo. Rosa te manda una foto del aula llena de chicos programando." |
| 600-799 | "La app funciona la mayoría del tiempo. Cada 2 semanas Rosa tiene que llamar para recordar. No es perfecto, pero los chicos ya no pierden todas las clases." |
| 400-599 | "Hay días que funciona y días que no. Rosa está contenta a medias; el portero sigue renuente. Volvés a la semana que viene a iterar." |
| 0-399 | "La app quedó instalada en un solo celular y nadie la usó. Rosa te dice 'gracias por intentarlo', pero vos sabés que no resolviste nada." |

---

## 2. Replicabilidad para los otros 2 escenarios (resumen)

| Escenario | Cliente | Dolor | Lo que se construye |
|---|---|---|---|
| **B · Turno Seguro** | Julio, supervisor de seguridad minera | Checklist en papel se pierde; hubo incidente evitable. | Checklist digital con bloqueo de equipo y alerta de fatiga. |
| **C · Campo al Mercado** | Elena, productora de quinua | Venden a mitad de precio por no poder demostrar origen. | App de trazabilidad y precio en tiempo real. |

**Ambos siguen el mismo arco de 5 fases** con la misma distribución de mecánicas:

| Fase | Mecánica 1 | Mecánica 2 | Mecánica 3 |
|---|---|---|---|
| descubrir | mapa-calor | relampago | seleccion-unica |
| disenar | slider-imagenes | seleccion-unica | mapa-calor |
| construir | bloques-logica | escribir | relampago |
| probar | bandeja (seleccion-unica visual) | seleccion-unica | relampago |
| desplegar | slider-imagenes | slider-imagenes | seleccion-unica |

La **estructura narrativa es la misma** (5 fases × 8-10 decisiones). Lo que cambia es el contenido del JSON: clientes, dolores, "valores críticos", nombres, frases del chat. **El motor no se entera.**

---

## 3. Lo que el estudiante se lleva a casa (mensaje de cierre)

En la pantalla de resultado, **un solo cartel grande**:

> "El software no se escribe, se decide. Hoy hiciste 10 decisiones como un desarrollador. Cada decisión que tomaste cambió la vida de un peruano real."

Debajo, en texto chico:

> "Las 5 fases que viviste hoy (descubrir, diseñar, construir, probar, desplegar) son las mismas que usan los ingenieros de software en todo el mundo. Si te gustó, en Tecsup Arequipa podés aprender a hacer esto (y mucho más) en la carrera de Diseño y Desarrollo de Software."

---

## 4. Lo que se mueve en cada fase (resumen visual)

```
DESCUBRIR    →  mapa de calor  +  relámpago  +  pregunta normal
DISEÑAR      →  slider  +  pregunta normal  +  mapa de calor
CONSTRUIR    →  bloques Scratch  +  escribir  +  relámpago
PROBAR       →  tickets  +  pregunta normal  +  relámpago
DESPLEGAR    →  slider  +  slider  +  pregunta normal
```

**5 fases × 9 decisiones = 9 puntos de decisión.** Cae perfecto en el rango 8-10 que propusimos. Sin timer global. Cada decisión tiene su tiempo individual (los `relampago` 8s, los `mapa-calor` 30s, los normales sin límite).

---

## 5. Validación contra las reglas de oro

| Regla | Cumplida? | Cómo |
|---|---|---|
| Motor sin narrativa | ✅ | Todo el contenido está en `src/content/*.json`. Las `reacciones`, los `mensajeCliente`, la disposición de fases, el orden de decisiones. |
| Escenario nuevo = JSON nuevo | ✅ | El `contrato-escenario.md` ampliado admite 4 mecánicas nuevas. El `BloquesScratch.jsx` y `MapaCalor.jsx` son standalone. |
| Offline-first | ✅ | Sin timer global. El leaderboard en vivo es opt-in y sale del flujo si no hay red. |
| Cero jerga hasta el debrief | ✅ | La explicación de cada fase sigue siendo lenguaje simple. El mensaje de cierre introduce jerga por primera vez. |
| No-todo-cuestionario | ✅ | Hay mapa de calor, slider, bloques Scratch, tickets. Sólo 4 de 9 decisiones son `seleccion-unica` pura. |
| 1366×768 sin scroll | ⚠️ | El slider de 4 imágenes requiere más altura que el wireframe actual. Hay que validar layout. Si no entra, los mockups son más pequeños. |
| Sin audio indispensable | ✅ | No agregamos nada de audio. |

**Riesgo a resolver:** layout del slider (3.6). Si no entra en 1366×768, los mockups se renderizan más compactos o aparece un carrusel.

---

## 6. Tareas para maquetar este storytelling en código

| # | Tarea | Esfuerzo |
|---|---|---|
| 1 | Confirmar el cambio de contrato en `contrato-escenario.md` | 2h |
| 2 | Migrar `ccorca.json` a v2 con las 9 decisiones y mecánicas de este doc | 6h |
| 3 | Crear `src/minigames/MapaCalor.jsx` | 8h |
| 4 | Crear `src/minigames/SliderImagenes.jsx` | 8h |
| 5 | Crear `src/minigames/Relampago.jsx` (wrapper de `DecisionUnica` con timer corto) | 4h |
| 6 | Crear `src/minigames/BloquesScratch.jsx` | 12h |
| 7 | Implementar `cliente.reacciones[]` + `BurbujaChat` | 4h |
| 8 | Animaciones del personaje (5 estados) | 3h |
| 9 | Quitar Timer global | 4h |
| 10 | Panel de leaderboard en vivo (depende de Supabase) | 6h |
| 11 | Validar layout 1366×768 con todos los minijuegos | 4h |
| 12 | Probar con 2-3 estudiantes ajenos (Etapa 3 del procedimiento) | — |

**Total estimado:** ~59h de trabajo (aprox 1.5-2 semanas a tiempo parcial). El orden 1→2→3/4/5/6→7→8→9→11→12 es la ruta crítica. El 10 puede ir en paralelo con Supabase (Etapa 4).

---

## 7. Notas abiertas

- **El mapa de calor de la Fase 1** requiere un SVG del colegio. Hoy no existe. Opciones: (a) lo hace el equipo de diseño, (b) lo hago yo mismo en Figma/similar en 2h, (c) lo reemplazamos por un mapa simplificado de iconos clicables. Recomiendo (c) para la v1.
- **El slider de imágenes de la Fase 2** requiere 4 mockups del celular del portero. También dependen del diseño. Recomiendo hacerlos en Balsamiq/Figma en 1 jornada y guardarlos en `public/assets/mockups-ccorca/`.
- **Los bloques Scratch** requieren paleta de colores y diseño de bloques. Sugerencia: usar los mismos tokens (`--cyan`, `--pink`, `--green`, `--gold`) para mantener coherencia.
- **Pantalla de resultado** con "Ver conversación" del chat: agregar como tarea 13, 2h.

---

*Fin del borrador. Si estás de acuerdo con la historia, arrancamos por la Tarea 1 (actualizar el contrato). Si querés cambiar el orden de las mecánicas, ajustar el `slider` o cambiar la cantidad de decisiones, decime y lo iteramos.*
