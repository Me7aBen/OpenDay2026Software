# Lluvia de ideas — cómo narrar mejor las partidas de MISIÓN DEPLOY

> Documento de ideas, no de Spec. Pensado para elegir dirección **antes** de tocar el motor ni los JSON.
> Fecha: sesión actual. Etapa del proyecto: **Etapa 2** del `procedimiento-claude-code.md` (motor + escenario A feos, sin diseño, sin Supabase, sin B/C).

---

## 0. Contexto (para no repetir fundamentos)

- **Público:** chicos de 15-17 años, sin nociones de desarrollo ni jerga. ~16 min de partida.
- **Mecánica actual:** 5 fases fijas × 2-3 decisiones = 12 decisiones, 0/30/60 pts. Tipos de interacción: `seleccion-unica`, `seleccion-multiple` (drag & drop), `escribir` (bloque de código).
- **Contrato rígido del JSON:** `decisiones` con `opciones` + `puntaje` → ya condiciona que casi todo el juego sea "elige A/B/C". Eso es justo donde más se nota el "cuestionario".
- **Leaderboard:** un puntaje numérico 0-1000 por sesión, en Supabase. **El ranking es lo que sostiene el engagement**, no la narrativa.
- **Reglas de oro del `CLAUDE.md`:** (1) motor sin narrativa vive en JSON, (2) agregar contenido no toca motor, (3) offline-first, (4) cero jerga hasta el debrief, (5) no-todo-cuestionario, (6) 1366×768 sin scroll, (7) sin audio indispensable.

Todo lo que sigue vive o muere según respete (1), (5) y (4). El resto se negocia.

---

## 1. Diagnóstico rápido: dónde se siente "cuestionario" hoy

Mirando `ccorca.json` y los minijuegos:

| Fase | Minijuego | Sensación que da |
|---|---|---|
| 1 descubrir | `Entrevista` (re-venta de `DecisionUnica`) | 3 pantallas de "¿cuál de las 3 frases elegís?" con trampa obvia. Cero sensación de entrevista. |
| 2 diseñar | `Wireframe` (drag & drop) + 2 decisiones de un solo botón | El drag cae simpático, pero las 2 preguntas de idioma/colores son botones disfrazados. |
| 3 construir | `Logica` (input de texto) | Es el único momento realmente "interactivo". Funciona. |
| 4 probar | `Bugs` (re-venta de `DecisionUnica`) | Bandeja de bugs prometida en propuesta; en código son 3 botones con severidad cosmética. |
| 5 desplegar | `Deploy` (re-venta de `DecisionUnica`) | La propuesta decía "elegir canal de entrega"; acá es 1 sola decisión de tres botones. |

**Conclusión:** 4 de 5 minijuegos son `DecisionUnica` con distinto emoji encima. Eso es lo que más se nota como "cuestionario", no la cantidad de preguntas.

---

## 2. Recomendación global (la que yo tomaría)

**Migrar de 5 "minijuegos por fase" a 4-5 "mecánicas reutilizables"**, declaradas en el JSON, y dejar que cada fase las combine en vez de tener una pantalla-de-fase-mono-mecánica.

En otras palabras: en vez de decir *"este minijuego es la Entrevista"*, decir *"esta decisión es tipo `elegir-de-una-lista` o tipo `ordenar` o tipo `mapa-de-calor` o tipo `consola-de-código`"*. El motor lee el tipo de la decisión, no la fase. Esto no rompe la regla de oro 1 ni la 2: la narrativa sigue 100% en el JSON, y el escenario A se migra decisión por decisión.

**Por qué:** abre la puerta a interacciones que el contrato actual no puede expresar (ordenar, comparar, explorar, recortar, etiquetar). Y los 3 escenarios futuros pueden combinar mecánicas en vez de copiar A.

El cambio es chico en código (esencialmente ampliar `contrato-escenario.md` y el switch en `PantallaJuego.jsx`) y grande en lo que se puede contar.

---

## 3. Mecánicas que valen la pena (top 8, ordenadas por impacto/costo)

### 3.1 🗺️ Mapa de calor / "marca en el colegio" — para `descubrir`
En vez de elegir la pregunta, el estudiante ve un **mapa del colegio** (SVG simple con la sala de cómputo, el patio, la oficina de Rosa, la caseta del portero) y debe **marcar 3 puntos críticos** haciendo clic. Cada punto activa un mini-dialogo de Rosa distinto (uno bueno, uno para iluminar, uno que distrae). La "trampa" deja de ser una frase obvia y pasa a ser un clic en el lugar bonito pero irrelevante.

- **Pro:** primera decisión se siente exploratoria, no optativa.
- **Pro:** los chicos de 15-17 se enganchan con marcar territorios.
- **Contra:** nuevo asset (mapa SVG), un poco más de layout.
- **Score:** sigue cabiendo en `tablaPuntaje` por cantidad de puntos útiles marcados.

### 3.2 🎛️ Comparación lado a lado con slider — para `disenar`
Wireframe de 2 mockups del celular del portero, el estudiante **mueve un slider central** del mockup "minimalista" al "completo". El puntaje es la distancia desde la "posición correcta" (no el extremo). Invita a comparar en vez de etiquetar elementos.

- **Pro:** interactividad real, no es botonera.
- **Pro:** ranking se mantiene preciso (slider → distancia = puntos).
- **Contra:** el "punta de slider" tiene que estar en el JSON como dato.
- **Variante más barata:** 3 mockups numerados y el estudiante los arrastra a un eje "limpio ↔ recargado".

### 3.3 🧩 Cadena de lógica armable con bloques — para `construir`
Ya existe el `Logica` con input de texto. Upgrade:** bloques arrastrables tipo Scratch** (`SI`, `Y`, `bateria < 20`, `hora > 18`, `enviarSMS`) que el chico encastra en la consola. El último paso sigue siendo escribir un valor — el gancho de la propuesta original.

- **Pro:** la propuesta de la pág. §5 Fase 3 habla explícitamente de "bloques tipo Scratch". Hoy no se cumple.
- **Pro:** más memorable visualmente que un input.
- **Contra:** más JS de UI. Se puede hacer *honest* con CSS Grid y drag-and-drop nativo, sin librería.

### 3.4 🐞 Cola de tickets con prioridad visible — para `probar`
Reemplaza los 3 botones por una **bandeja de issues** con tarjetas de distinto tamaño y color. El estudiante **arrastra UNA tarjeta** a la "lista de hoy puedo arreglar". El resto se queda visible pero tachado. Las tarjetas trampa tienen prioridad visual falsa (un ticket "crítico" en verde claro con icono cosmético).

- **Pro:** reconocer cuál es crítico entre 3 tarjetas de severidad variable es la habilidad real de QA.
- **Pro:** cabe 100% en el contrato actual (`seleccion-unica` con metadata visual en el JSON).
- **Contra:** trampa requiere un poco más de copy.

### 3.5 🚀 Deploy por escena animada — para `desplegar`
El "elegí canal" se convierte en un **diagrama de decisión del DevOps**: gráfico de árbol con 3 ramas (Play Store / Web / SMS) y una pregunta intermedia ("¿el portero tiene smartphone?"). El estudiante **aprieta el árbol** y ve qué ramas se cierran en función de la respuesta. La rama correcta es la que sobrevive.

- **Pro:** cuenta el *razonamiento* detrás de la decisión, no solo el resultado.
- **Pro:** reutilizable para escenarios B y C.
- **Contra:** SVG más complejo o librería liviana (D3 no, mejor un componente custom).

### 3.6 📱 Mensajes del cliente — para TODAS las fases
Hoy `EscenaCliente` muestra un diálogo estático. Upgrade: **chat que avanza con cada decisión**, mensajes cortos del cliente en burbujas, con un *emoji-reaction* cuando algo se decide (👍, 🚨, 🎉). El chat vive en localStorage y se "rellena" según avance el `decisionIndex`. Después del debrief, el facilitador puede **leer la conversación completa** como narrativa de la partida.

- **Pro:** vuelve la narración continua en vez de 5 narraciones aisladas.
- **Pro:** cero costo en performance (es solo un array de strings en el reducer).
- **Contra:** el `EscenaCliente` ahora tiene más responsabilidad; convendría partirlo en `EscenaCliente` + `BurbujaChat`.

### 3.7 ⏱️ Eventos aleatorios en el timer — para TODAS las fases
Cada cierto tiempo (cada 60-90s random), el juego dispara un **evento contextual** que aparece en pantalla como un banner ("Rosa llama: 'la luz se cortó de nuevo'") con 1 decisión rápida asociada (30 pts, 5s para responder). Si no la respondés, no pasa nada, pero se siente "vivo".

- **Pro:** distingue esto de un cuestionario muerto.
- **Pro:** sube la densidad de decisiones sin alargar la partida.
- **Contra:** hay que cuidar que no sume 200 pts. Capear el evento en el motor.

### 3.8 🏷️ Etiquetar / Taguear — para varias
Mini-mecánica muy barata: 4 títulos candidatos para una pantalla, el estudiante debe **arrastrar la etiqueta correcta** debajo del elemento del wireframe. Útil sobre todo en `disenar` (etiquetas de accesibilidad, idioma, etc.). 3 minutos de código, gran salto de "se siente app".

---

## 4. Sobre la duración de la partida

Hoy el motor corre 16 min con 12 decisiones. Decís *"podría ser más largo"*. Mi lectura:

**Antes de estirar, convendría preguntar si el debrief aguanta más tiempo.** El problema que veo no es que 16 min sea corto: es que **12 decisiones no dan lugar a que la historia respire**. Si bajás a 8 decisiones más jugosas, sentís que jugaste algo. Si subís a 18 decisiones más flojas, sentís que rendiste un examen.

**Recomendación concreta:** mantener 16 minutos, pero apuntar a **9-10 decisiones más densas**, con tiempos por fase más generosos (la `descubrir` de 200s sube a 260s, `construir` de 220s a 280s). Esto **no requiere cambios de motor**, solo ajustar `decisiones` por fase y `tiempoSegFase`. El leaderboard no se entera.

**Si querés estirar a 20 min** (para miles de estudiantes, modo "feria abierta"), te sugiero:
- Modo **"3 vidas / 3 errores"** en vez de juego lineal sin fracaso. Cae mejor con público adolescente.
- O un **modo historia extendida** que dispara una *fase 6 sorpresa* (ej. *"El colegio pide más funcionalidades, ¿qué priorizás?"* — agregás un JSON `extension.json` o una extensión por escenario).
- O un **ramal post-epílogo** donde el estudiante comparte su partida en redes con un QR (0 impacto en el puntaje).

Yo arrancaría por la versión "9-10 decisiones más densas en 16 min" y dejaría el modo largo para v2.

---

## 5. Sobre el leaderboard

El ranking numérico de 0-1000 sigue siendo el motor de competencia. Pero hay tres ideas que **conectan mejor la narrativa con el ranking** sin tocar el contrato del puntaje:

### 5.1 Apodos en vez de nombres en la partida
El estudiante se registra como "Andrea M." (regla de privacidad que ya pediste). El ranking podría mostrar **el personaje que adoptó** ("Andrea M. · la analista de Ccorca"). Eso ata personaje a puntaje y hace que el top-3 se sienta menos anónimo.

### 5.2 Categorías de ranking
"Mejor analista", "Mejor UX", "Mejor dev", "Mejor QA", "Mejor DevOps" — el estudiante que gana la fase X es el que más puntos **crudos** acumuló en esa fase. Mostrar 5 categorías en pantalla, una por fase, al lado del top general. Cero cambio en el modelo de datos: ya guardás `puntajeDecisiones` por fase, solo hay que exponerlo.

### 5.3 Racha de escenario
Si un jugador vuelve a jugar el mismo escenario, mostrar su **mejor puntaje** en rojo y el actual en gris. Genera record personal sincanje.

> **Lo que NO recomiendo:** sumar badges, achievements, niveles, XP. Eso es work extra y ruido. El taller es de 30 min; la concentración narrativa pesa más.

---

## 6. Sobre la narrativa (lo que el `EscenaCliente` debería contar)

Hoy el cliente aparece una vez al inicio de cada fase y desaparece. Lo que el chico recordaría el viernes en el colegio es **el arco emocional del cliente**:

> *Rosa al inicio: nerviosa, perdida.*
> *Rosa a mitad de la fase 2: aliviada, "ahora sí me escucharon".*
> *Rosa en la fase 4: preocupada, "los chicos igual se quedaron sin luz".*
> *Rosa al final: agradecida si el puntaje es alto, frustrada si no.*

**Implementación barata:** array `reaccionesPorPuntaje` en el JSON de escenario, con 4-5 mensajes por fase. El motor elige el mensaje en función de un puntaje parcial acumulado. Lo podés meter en el JSON sin tocar el motor (es solo un campo nuevo de `Cliente`):

```jsonc
"cliente": {
  "nombre": "Rosa",
  "reacciones": [
    { "fase": "descubrir", "rangoPuntaje": "bajo",  "emoji": "🙄", "frase": "Ay, pensé que preguntarían otra cosa..." },
    { "fase": "descubrir", "rangoPuntaje": "alto",  "emoji": "😮", "frase": "¡Qué buenas preguntas! Nadie había preguntado eso." }
  ]
}
```

**Pro:** convierte 12 clicks sueltos en una historia emocional reconocible. Es la mejora narrativa más barata y más efectiva.

---

## 7. Lo que NO cambiaría (líneas rojas)

- **El motor no toca narrativa.** Sigue regla de oro 1.
- **12 ± 2 decisiones, 5 fases, 16 min.** Dentro de eso, todo lo demás se mueve.
- **5 fases del ciclo de vida.** Son el corazón pedagógico del taller; la propuesta entera se sostiene en ese andamiaje.
- **El contrato 0/30/60.** Es la única pieza que sostiene el ranking limpio. Si lo cambiás, rompés el leaderboard.
- **El puntaje total 1000.** Ídem.
- **Cero jerga hasta el debrief.** Esto es no negociable para el público real.

---

## 8. Lo que sí se puede cambiar sin romper nada (cheapest wins)

Ordenadas de más rápida a más costosa. Cada una se puede hacer **en escenario A sin tocar el motor**:

| # | Idea | Esfuerzo | Impacto | Toca motor |
|---|---|---|---|---|
| 1 | **Burbuja de chat del cliente** que avanza con cada decisión (3.6) | 3h | Alto | No |
| 2 | **Reacciones del cliente según puntaje parcial** (sección 6) | 2h | Muy alto | No |
| 3 | **Bandeja de bugs con severidad visual** (3.4) | 4h | Alto | No |
| 4 | **Evento aleatorio en el timer** (3.7) | 6h | Muy alto | Sí (pequeño) |
| 5 | **Slider de comparación en diseñar** (3.2) | 8h | Alto | Sí |
| 6 | **Mapa de calor en descubrir** (3.1) | 10h | Muy alto | Sí |
| 7 | **Bloques Scratch en construir** (3.3) | 12h | Alto | Sí |
| 8 | **Diagrama de árbol en desplegar** (3.5) | 8h | Medio | Sí |

---

## 9. Tres caminos posibles — yo elegiría (3)

### Camino A — "Mejora barata, mismo juego"
Implementar 1, 2 y 3 del cuadro. Cero cambio de motor. Se puede cerrar en una sesión. **Sirve si el evento es en semanas y querés pulir.**

### Camino B — "Mecánicas nuevas, contrato ampliado"
Implementar 1, 2, 3, 4, 5. Amplía `contrato-escenario.md` con 2 tipos de interacción nuevos. **Sirve si el evento es en 1-2 meses y querés diferenciarte.**

### Camino C — "Rediseño completo"
Hacer 1-8. Reescribir `PantallaJuego.jsx` como router de decisiones por tipo. **Sirve si querés que la versión post-OpenDay viva más allá del evento y se pueda jugar en clase todo el año.**

**Mi recomendación honesta: Camino B.** Da salto cualitativo sin sobredimensionar. La razón: si vas a tener 3 escenarios en el repo, el contrato ampliado se aprovecha desde el día 1. Si vas a tener 1 solo escenario con amigos, también, porque las mecánicas nuevas reemplazan a las 4 que eran `DecisionUnica` con emoji.

---

## 10. Riesgos de las ideas

| Riesgo | Mitigación |
|---|---|
| Rompemos el `contrato-escenario.md` y los JSON viejos dejan de compilar | Mantener `seleccion-unica`, `seleccion-multiple`, `escribir` como están. Los nuevos tipos son *aditivos*. |
| Estiramos la partida y el debrief no entra | Decidí la duración primero (16 min hoy, 20 min hipotético). El debrief no cambia. |
| El público sigue sin engancharse porque no probamos con ellos | **Etapa 3 del procedimiento es obligatoria y no la podemos saltar.** Medir con 2-3 chicos antes de invertir 3 semanas. |
| La "reacción del cliente" se siente prematura si la fase tiene puntaje bajo | Usar **puntaje parcial** no puntaje final. Triggerea en cuanto el chico resuelve mal su primera decisión. |
| Más interactividad = más bugs | El criterio de aceptación permanente del `CLAUDE.md` es no negociable: una partida tiene que poder jugarse entera en cada commit. |

---

## 11. Próximo paso concreto (si te copa la idea)

1. **Hoy / mañana:** elegir Camino A, B o C (o pedirme que combine).
2. **Antes de escribir nada:** validar la elección con 1 persona ajena al proyecto (el que sea). Esto es la Etapa 3 del procedimiento, pero en versión express.
3. **Recién después:** ampliar `contrato-escenario.md` (si vas a B o C) o empezar a poblar los arrays de `reacciones` y `chat` en `ccorca.json` (si vas a A).
4. **Al cerrar:** actualizar `docs/PLAN.md` (que falta) con lo que se decidió y por qué.

---

## 12. Lo que dejé afuera a propósito

- **Modo historia multijugador** (varios estudiantes en la misma sala viendo el mismo cliente). Interesante, pero rompe la regla de oro 5 (cada PC es independiente) y agrega complejidad de sync. Backlog.
- **Generación procedural de escenarios.** Tienta, pero el contenido debe ser **humano y contextual** (es por eso que la propuesta deja B y C para escribir a mano). Backlog.
- **Modo offline con descarga del JSON de escenario.** Ya está cubierto por la regla de oro 3.
- **Sonidos.** Regla de oro 7, decorativo solo. No lo trabajo.
- **Internacionalización.** El taller es local; no vale la pena.

---

*Fin del documento. Las ideas están deliberadamente mezcladas entre "rápido y barato" y "más ambicioso". Elegí el subconjunto que te sirva y descartá el resto sin culpa.*
