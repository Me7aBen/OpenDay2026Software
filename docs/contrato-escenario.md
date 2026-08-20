# Contrato del JSON de escenario

Un escenario = un archivo en `src/content/<id>.json`. El motor (`src/engine/`) no
conoce narrativa: solo sabe leer este contrato y ejecutar las 5 fases en orden.
Agregar un escenario nuevo (B, C, D...) es agregar un JSON que cumpla este
contrato, sin tocar el motor.

## Ideas clave del diseño

- El motor solo entiende **dos tipos de interacción para puntuar**:
  `seleccion-unica` y `seleccion-multiple`. El campo `estilo` de cada fase es
  puramente cosmético (le dice a `src/minigames/` qué componente renderizar) y
  no afecta el puntaje. Dentro de `seleccion-unica`, el minijuego puede
  presentarla como clic (botones), o como campo de texto que el jugador
  escribe (`escribir`, ver más abajo) — el motor puntúa igual en ambos casos:
  busca la opción cuyo `id` coincide con lo elegido/escrito.
- Cada fase tiene entre 2 y 4 `decisiones`. El escenario define una escala
  equilibrada; en Código Cero los retos suman 800 puntos.
- Bonos especiales (`bugCritico`, `usuarioReal`, hasta 80 pts combinados) van
  colgados del campo `bonus` de la opción correcta, no como lógica aparte.
- El bono de tiempo restante (hasta 200 pts) y el descuento de pista (-10 c/u)
  los calcula el motor; no viven en el JSON salvo `pista` (o el legado
  `pistaTexto`) que
  habilita el descuento si el jugador la pide.
- Timer global: default 960s (16 min) en el motor, puede sobreescribirse con
  `tiempoTotalSeg` en el JSON. Timer por fase: `tiempoSegFase`, auto-avanza al
  vencer (las decisiones sin responder puntúan 0).
- **Nada de cuestionario disfrazado.** El público son chicos de secundaria que
  no conocen las etapas de desarrollo ni la jerga técnica. Toda fase trae un
  campo `explicacion` en lenguaje simple que se muestra completo, sin presión
  de tiempo de decisión, antes de la primera decisión de esa fase. Y la
  interacción de cada minijuego debe ser real: arrastrar en el wireframe,
  escribir en el bloque de lógica — no todo botones (ver `tipoInteraccion:
  'escribir'` más abajo).
- **Placeholders de imagen.** El contrato ya reserva los campos `imagen`
  (en `cliente` y en cada `fase`) para cuando la etapa de diseño entregue
  retratos, diagramas e íconos. En esta etapa fea van en `null` y el motor
  renderiza un placeholder gris con el texto alternativo — así el escenario
  no necesita cambiar cuando lleguen los assets reales.

## Esquema

```
Escenario
├─ id: string                          // 'ccorca', usado en localStorage y Supabase
├─ titulo: string
├─ cliente: { nombre, rol, dolorFrase, imagen?, retrato? }
│                                       // dolorFrase: máx 2 líneas; imagen: placeholder, null por ahora
│                                       // retrato: cómo dibujarlo, ver "Bloque presentacion"
├─ tiempoTotalSeg?: number              // opcional, default 960 (16 min)
├─ presentacion?: object                // opcional. Escena, avatar, medidor, música, perfiles.
│                                       // Ver "Bloque presentacion" más abajo.
├─ fases: Fase[5]                       // orden fijo: descubrir, disenar, construir, probar, desplegar
└─ epilogos: Epilogo[]                  // buckets por rango de puntaje, orden no importa

Fase
├─ id: 'descubrir'|'disenar'|'construir'|'probar'|'desplegar'
├─ rol: string                          // 'Analista', 'Diseñador UX', ... (para el HUD/insignias)
├─ titulo: string
├─ intro?: string                       // diálogo del cliente, máx 2 líneas
├─ explicacion?: string                 // Lenguaje simple, sin jerga, explica qué va a hacer el
│                                        // estudiante y por qué antes de decidir. Se muestra
│                                        // completo, con un botón "Entiendo, comenzar".
│                                        // OBLIGATORIO salvo que la fase declare `historieta`,
│                                        // que lo reemplaza. Ver "Historietas".
├─ historieta?: Panel[2-3]              // tira de viñetas que abre la fase, en lugar de
│                                        // `explicacion`. Ver "Historietas".
├─ textoBotonHistorieta?: string        // texto del botón al final de la tira
├─ historietaCierre?: PanelHistorieta[] // consecuencia mostrada al terminar la fase
├─ textoBotonCierre?: string            // botón que lleva a la fase siguiente
├─ mensajeCierre?: string               // frase del cliente durante ese cierre
├─ imagen?: string|null                 // placeholder de diagrama/foto de la fase, null por ahora
├─ musica?: string                      // opcional. Nombre de pista mientras dura la fase.
│                                        // Solo tiene efecto si el escenario declara presentacion.musica.
├─ tiempoSegFase: number                // segundos antes del auto-avance (incluye lectura + decisión)
├─ estilo: 'entrevista'|'wireframe'|'logica'|'bugs'|'deploy'  // solo cosmético
└─ decisiones: Decision[2-4]

Decision
├─ id: string                           // único en el escenario, ej 'descubrir-1'
├─ tipoInteraccion: 'seleccion-unica' | 'seleccion-multiple' | 'escribir'
│                   | 'arquitectura-nodos' | 'mapa-calor' | 'seleccion-cards'
│                   | 'circuito-conexiones' | 'detectar-intruso'
│                   | 'mecanografia-codigo' | 'ordenar-pasos' | 'puerta-seguridad'
├─ pregunta: string                     // máx 2 líneas
├─ mensajeClienteDecision?: string      // lo que dice el cliente en el panel lateral MIENTRAS
│                                        // esta decisión está en pantalla. Si falta, se sigue
│                                        // mostrando el `intro` de la fase. (Campo que ya usaba
│                                        // ccorca-v2 y no estaba documentado.)
├─ hitoIndicador?: number               // opcional. Valor al que sube el medidor global al
│                                        // responder esta decisión. Ver "Bloque presentacion".
├─ ilustracion?: string                 // escena pixel art que acompaña a la decisión. Ver
│                                        // "Decisiones ilustradas".
├─ pista?: string                       // ayuda orientadora; pedirla cuesta 10 pts una sola vez
├─ pistaTexto?: string                  // alias legado de `pista`
├─ metaMinijuego?: object               // datos de flavor para el render (ej. plantillaCodigo)
├─ seleccionExacta?: number             // solo seleccion-multiple: cuántas debe elegir/arrastrar
├─ tablaPuntaje?: { [conteoCorrectos: string]: number }  // solo seleccion-multiple
├─ feedbackSinCoincidencia?: string     // solo 'escribir': texto si lo tipeado no matchea ninguna opción
└─ opciones: Opcion[]

Opcion
├─ id: string
├─ texto: string                        // en 'escribir', también es el valor que se matchea (trim, sin
│                                        // importar mayúsculas) contra lo que tipeó el jugador
├─ puntaje?: number                     // 0|30|60, solo seleccion-unica / escribir
├─ esCorrecta?: boolean                 // en seleccion-multiple marca las opciones correctas.
│                                        // En 'escribir' marca cuál es LA respuesta buena, y solo
│                                        // se usa si metaMinijuego.intentosPermitidos > 1.
├─ esTrampa?: boolean                   // cosmético/feedback, no cambia el puntaje
├─ escena?: string                      // dibujo de la opción; si alguna opción la trae, todas
│                                        // se renderizan como tarjetas con imagen
├─ escenaConsecuencia?: string          // a qué escena cambia la ilustración al elegir esta
├─ rotuloConsecuencia?: string          // 2-3 palabras sobre la ilustración al elegir
├─ descubrimiento?: string              // texto revelado al elegir (usado en 'entrevista')
├─ feedback?: string                    // el "por qué", se muestra al resolver la decisión
└─ bonus?: { tipo: 'bugCritico'|'usuarioReal', puntos: number }

Epilogo
├─ min: number
├─ max: number
├─ texto: string
└─ mensaje?: string                     // opcional. Segunda línea, en verde, debajo del epílogo.
```

### `tipoInteraccion: 'escribir'`

Igual que `seleccion-unica` para el motor (busca en `opciones` la que
coincide), pero el minijuego la renderiza como un campo de texto/número que el
jugador escribe (ej. completar el hueco de una línea de código), no como
botones. Si lo escrito no matchea el `texto` de ninguna opción, el motor no
encuentra opción → puntúa 0, y el minijuego muestra `feedbackSinCoincidencia`
en vez del `feedback` de una opción concreta. Se usa en la fase "construir"
(`src/minigames/Logica.jsx`), donde el estudiante literalmente escribe el
valor del umbral o la hora, tal como en la propuesta original (§5, Fase 3).

### `tipoInteraccion: 'arquitectura-nodos'`

El minijuego de la fase "construir" (`src/minigames/ArquitecturaNodos.jsx`).
Toda su configuración va en `metaMinijuego` y devuelve **un solo puntaje** al
motor: la suma de lo que el jugador saca en cada paso de mecanografía.

```json
"metaMinijuego": {
  "nodos": [
    { "id": "back", "label": "BACKEND", "icono": "⚙️", "subtitulo": "el cerebro que decide" }
  ],
  "columnas": [
    { "titulo": "LO QUE VE DON TOMÁS", "nodos": ["app"] },
    { "titulo": "EL CEREBRO",          "nodos": ["back"] },
    { "titulo": "LO QUE HACE EL TRABAJO", "nodos": ["db", "api-sms"] }
  ],
  "pasos": [
    { "id": "p1", "tipo": "activar",  "nodoObjetivo": "back",
      "codigo": "recibir_alerta(bateria)", "puntosMax": 30, "puntosMin": 10,
      "segundosParaSalto": 30 },
    { "id": "p2", "tipo": "conectar", "nodoOrigen": "back", "nodoDestino": "app",
      "codigo": "fetch('/alerta')", "puntosMax": 30, "puntosMin": 10 }
  ],
  "narraciones": [
    { "antesDePaso": "p1", "texto": "Primero enciende la pieza que recibe los datos." }
  ]
}
```

**Las piezas no llevan coordenadas.** Se declaran en `columnas`, de izquierda a
derecha, que es como se lee un flujo. Mover una pieza es sacar su id de una
lista y ponerlo en otra; agregarla es sumar el id. El componente mide las
posiciones reales en el DOM para dibujar las conexiones, así que el diagrama se
acomoda solo a cualquier resolución y no hay `viewBox` que recalcular.

- `nodos[]`: `id` (referenciado por pasos y columnas), `label`, `icono` (un
  emoji) y `subtitulo` (3–5 palabras en lenguaje llano, sin jerga: es lo que
  hace entendible la pieza para alguien que nunca programó).
- `columnas[]`: `titulo` (opcional, se muestra arriba de la columna) y `nodos`
  con los ids en el orden vertical que quieras. Una pieza con un id que no
  figure en ninguna columna aparece igual, en una columna extra al final, para
  que un typo se vea en pantalla en vez de desaparecer.
- `pasos[]`: se juegan en orden. `tipo: 'activar'` pide un clic en
  `nodoObjetivo`; `tipo: 'conectar'` pide clic en `nodoOrigen` y después en
  `nodoDestino`. En los dos casos, después se tipea `codigo` y el puntaje sale
  entre `puntosMin` y `puntosMax` según la velocidad.
- `narraciones[]`: el texto del cliente que se muestra antes de cada paso,
  emparejado por `antesDePaso`.

Si un escenario viejo trae `x`/`y` en los nodos y no trae `columnas`, el
componente deriva las columnas agrupando por `x`. Es solo compatibilidad: el
formato a usar es `columnas`.

### `tipoInteraccion: 'circuito-conexiones'`

Tablero de cables (`src/minigames/CircuitoConexiones.jsx`). El jugador gira
piezas hasta llevar la energía desde un nodo origen hasta todos los destinos,
pasando por el nodo de seguridad y sin tocar el infectado. Devuelve **un solo
puntaje** al motor vía `puntajeDirecto`.

La lógica pura (rotación, recorrido, puntaje) vive en
`src/minigames/circuitoLogica.js` y no depende de React.

```json
"metaMinijuego": {
  "idRespuesta": "circuito-resuelto",
  "puntosMax": 200, "puntosMin": 90,
  "girosOptimos": 9,
  "penalizacionPorGiroExtra": 4,
  "penalizacionPorReinicio": 15,
  "tablero": {
    "columnas": 4,
    "celdas": [
      { "id": "respaldo", "rol": "origen", "label": "RESPALDO", "icono": "servidor",
        "fija": true, "conexiones": [false, false, true, false] },
      { "id": "v1", "forma": "vacia" },
      { "id": "p2", "forma": "curva", "rotacion": 0 }
    ]
  }
}
```

- `celdas[]` es una lista **plana** leída de izquierda a derecha y de arriba
  abajo; `columnas` dice dónde corta cada fila. 4x4 = 16 celdas.
- `conexiones` es `[N, E, S, O]`: qué lados de la pieza tienen cable **en la
  rotación 0**. Girar 90° mueve el cable del lado `i` al `(i+1) % 4`. Si no se
  declara, se toma de `forma`: `recta` (N-S), `curva` (N-E), `te` (N-E-S),
  `vacia` (celda bloqueada, no se dibuja ni se puede tocar).
- `rotacion` (0-3) es la posición inicial. `fija: true` marca las piezas que no
  giran: son el enunciado, no la solución.
- `rol` puede ser `origen`, `destino`, `seguridad` o `infectado`. Sin `rol`, es
  una pieza de cable común. `icono` elige el glifo (ver `src/ui/IconoServicio.jsx`).
- Dos celdas vecinas se unen solo si **las dos** tienen cable en el lado que da
  a la otra. El puzzle se resuelve cuando todos los `destino` reciben energía,
  la ruta pasa por `seguridad` y **no** llega al `infectado`.
- Puntaje: `puntosMax`, menos `penalizacionPorGiroExtra` por cada giro que
  exceda `girosOptimos`, menos `penalizacionPorReinicio` por cada reinicio, con
  piso en `puntosMin`. Quien lo resuelve nunca baja de `puntosMin`.

**Al diseñar un nivel nuevo, verifícalo antes de subirlo**: que tenga solución,
que el estado inicial no venga ya resuelto, y que existan rutas que sí tocan el
nodo infectado (si no, esa regla es decorativa). Es una búsqueda exhaustiva de
`4^piezas_girables` combinaciones sobre `analizarCircuito()`, barata de correr.

### `tipoInteraccion: 'detectar-intruso'`

Dos actos (`src/minigames/DetectarIntruso.jsx`): encontrar el nodo que no sigue
el patrón, y después cerrarle dos barreras. Devuelve `puntajeDirecto`.

```json
"metaMinijuego": {
  "idRespuesta": "intruso-aislado",
  "segundosObservacion": 4,
  "puntosMax": 150, "puntosMin": 50,
  "penalizacionPorIntento": 30,
  "nodos": [
    { "id": "n1", "label": "NODO 01" },
    { "id": "n4", "label": "NODO 04", "intruso": true }
  ],
  "barreras": [
    { "id": "b-entrada", "label": "Barrera de entrada", "lado": "izquierda" },
    { "id": "b-salida",  "label": "Barrera de salida",  "lado": "derecha" }
  ],
  "feedbackFallo": "...", "feedbackAcierto": "..."
}
```

- Exactamente **un** nodo lleva `intruso: true`. El componente lo distingue por
  cuatro señales a la vez (ritmo, desfase, contorno dentado y glifo distinto) y
  lo declara en su `aria-label`. Nunca por color solo.
- `barreras[]` necesita un `lado` (`izquierda` | `derecha`) por cada ranura.
- Puntaje: `puntosMax` menos `penalizacionPorIntento` por cada nodo equivocado,
  con piso en `puntosMin`. Equivocarse no reinicia la fase.

### `tipoInteraccion: 'mecanografia-codigo'`

Copiar una línea de código completa y ejecutarla
(`src/minigames/CodigoMecanografia.jsx`). Devuelve `puntajeDirecto`.

No confundir con `escribir` (`Logica.jsx`, el de Ccorca): allá hay que DEDUCIR
qué valor va en un hueco; acá la línea está entera a la vista y solo hay que
copiarla. El estudiante no necesita saber programar ni adivinar nada.

```json
"metaMinijuego": {
  "codigo": "if (senal < 20) { activarAlerta(\"HOSPITAL\"); }",
  "idRespuesta": "codigo-ejecutado",
  "etiquetaEjecutar": "EJECUTAR",
  "puntosMax": 150, "puntosMin": 60,
  "penalizacionPorError": 6,
  "segundosRapido": 30, "segundosLento": 110,
  "escenaAntes": "hospital-sin-senal",
  "escenaDespues": "hospital-encendido",
  "mensajeExito": "¡Funcionó! El hospital vuelve a estar conectado.",
  "salidaEjecucion": ["> regla compilada", "> enlace restaurado"]
}
```

- Cada carácter bien tipeado se pinta en cian; el que toca ahora lleva cursor;
  uno equivocado queda en rojo **sin borrar nada** y se corrige con Retroceso.
- `EJECUTAR` está bloqueado hasta que lo escrito coincida exactamente.
- `escenaAntes`/`escenaDespues` son la consecuencia visible: al ejecutar, la
  ilustración del puzzle cambia de una a la otra.
- Puntaje: entre `puntosMin` y `puntosMax` según la velocidad, menos
  `penalizacionPorError` por cada tecla equivocada, con piso en `puntosMin`.
  Equivocarse cuesta puntos, nunca la decisión.
- **Nada de lo que escribe el jugador se ejecuta.** No hay `eval`,
  `Function()` ni interpretación dinámica: se comparan dos cadenas. El texto se
  pinta como texto de React, nunca como HTML. Pegar está bloqueado por tres
  vías (el código no se selecciona, el campo rechaza inserciones de más de un
  carácter, y `onPaste` se cancela).

### `tipoInteraccion: 'ordenar-pasos'`

Construir una secuencia tocando pasos y colocándolos en una ruta numerada
(`src/minigames/OrdenarPasos.jsx`). Devuelve `puntajeDirecto`.

```json
"metaMinijuego": {
  "idRespuesta": "orden-correcto",
  "intentosPermitidos": 3,
  "puntosMax": 50,
  "puntosMin": 30,
  "penalizacionPorIntento": 10,
  "pasos": [
    { "id": "respaldo", "texto": "Verificar el respaldo", "icono": "▣" },
    { "id": "hospital", "texto": "Encender el hospital", "icono": "+" }
  ],
  "ordenCorrecto": ["respaldo", "hospital"]
}
```

- Tocar un paso lo agrega; tocarlo dentro de la ruta lo devuelve.
- Un intento incorrecto marca cada posición con ✔ o ✕ y permite reordenar.
- Al agotar intentos se revela la secuencia correcta y la historia continúa.
- No depende de arrastrar: es operable con teclado, mouse y pantalla táctil.

### Historietas

Una historieta es una tira de 2-3 viñetas pixel art que cuenta lo que pasa, en
lugar de describirlo con un párrafo (`src/ui/HistorietaPixel.jsx`). Cada panel:

```json
{ "escena": "protocolo-cero", "quien": "NIA", "texto": "NEXO está bajo ataque." }
```

- `escena`: id del catálogo de `src/ui/EscenaPixel.jsx`. Ahí viven los dibujos:
  un fondo, unas piezas encima y un efecto opcional (`glitch`, `alerta`,
  `foco`, `calma`). Componer por capas es lo que permite muchas escenas
  distintas sin dibujar cada una desde cero.
- `quien`: rótulo del globo, opcional.
- `texto`: una frase corta. Los límites de texto están más abajo.
- La escena `jugador` dibuja el avatar que eligió el estudiante, así el
  personaje de la historieta es el suyo.

Se declaran en tres lugares, todos opcionales:

| Dónde | Cuándo se ve |
|---|---|
| `presentacion.historietaIntro` | entre el avatar y la primera fase (pantalla propia; el reloj todavía no corre) |
| `fase.historieta` | al abrir cada fase, en lugar de `fase.explicacion` |
| `fase.historietaCierre` | después de la última decisión y antes de la fase siguiente |
| `presentacion.historietaEpilogo` | en el resultado, con la tira entera visible de una |

### Decisiones ilustradas

Una decisión `seleccion-unica` que declara `ilustracion` cambia de forma: la
escena pasa a ocupar el lugar principal y las opciones van al costado. Si
además las opciones declaran `escena`, se renderizan como tarjetas con dibujo
en vez de botones de texto.

Al elegir, la ilustración cambia a `escenaConsecuencia` y aparece
`rotuloConsecuencia` encima: la decisión se ve, no solo se lee.

Sin `ilustracion`, la decisión se renderiza como siempre (es el caso de Ccorca
v1 y v2, que no la declaran y no cambiaron en nada).

### Límites de texto

"Código Cero" se escribió con estos topes, y conviene mantenerlos en cualquier
escenario que use historietas: el público lee poco y mira mucho.

| Campo | Máximo |
|---|---|
| texto de viñeta | 10 palabras |
| `mensajeClienteDecision` | 15 palabras |
| `pregunta` | 12 palabras |
| `opcion.texto` | 7 palabras |
| `feedback` / `descubrimiento` | 15 palabras |
| `explicacion` de fase | reemplazarla por `historieta` |

### Bloque `presentacion`

Todo opcional y todo con default. Un escenario que no lo declara (como Ccorca
v1 y v2) se comporta exactamente igual que antes de que este bloque existiera:
sin escena, sin avatar, sin medidor, con el mp3 de fondo y sin perfil final.

```json
"presentacion": {
  "escena": "ciudad-nexo",
  "personalizacionAvatar": { "titulo": "...", "subtitulo": "...",
                             "rolJugador": "...", "textoBoton": "..." },
  "indicadorGlobal": { "etiqueta": "CIUDAD RECUPERADA", "unidad": "%",
                       "inicial": 5, "maximo": 100 },
  "musica": { "intro": "misterio", "porDefecto": "misterio", "final": "resolucion" },
  "historietaIntro": [ { "escena": "feria-tranquila", "texto": "La feria acaba de comenzar." } ],
  "historietaEpilogo": [ { "escena": "ciudad-recuperada", "texto": "La ciudad volvió a encenderse." } ],
  "textoBotonIntro": "ENTRAR A LA RED",
  "perfiles": [ { "id": "detective", "fase": "descubrir",
                  "nombre": "Detective digital", "descripcion": "..." } ],
  "mensajeFinal": "..."
}
```

- **`escena`**: nombre de una escena ilustrada, resuelto por el mapa de
  `src/ui/EscenaFondo.jsx`. Reemplaza la franja de título del HUD y reaparece en
  el resultado. Hoy existe `ciudad-nexo`. Sin este campo no se renderiza nada.
- **`personalizacionAvatar`**: si está presente, entre elegir escenario y jugar
  se muestra `src/screens/PersonalizacionAvatar.jsx` (rostro, color, accesorio).
  El reloj de la partida **no** corre en esa pantalla. El resultado se guarda en
  `jugador.avatar` y se muestra en la barra superior y en el resultado; **no**
  viaja al leaderboard. Las piezas se declaran en `src/ui/avatarOpciones.js`.
- **`indicadorGlobal`**: medidor narrativo del escenario. Su valor no lo simula
  nadie: sube a `decision.hitoIndicador` al responder cada decisión, y nunca
  baja. `inicial` fija el punto de partida.
- **`musica`**: activa el sintetizador (`src/lib/sintetizador.js`) en vez del
  mp3. Las pistas disponibles son `misterio`, `tension` y `resolucion`. Cada
  fase elige la suya con `fase.musica`; `porDefecto` cubre las que no lo digan,
  `intro` la pantalla de avatar y `final` el resultado. Sin este campo suena el
  mp3 de siempre. El botón de silencio y su preferencia guardada son los mismos
  para ambas fuentes, y las dos nunca suenan a la vez.
- **`perfiles`**: perfil vocacional del resultado. Cada entrada apunta a una
  `fase`; gana aquella donde el jugador tuvo mejor desempeño **relativo** al
  máximo de esa fase. Los empates se resuelven por orden de declaración. Es
  determinista: mismas respuestas, mismo perfil (`src/lib/perfilVocacional.js`).
- **`mensajeFinal`**: cierre del escenario, debajo del desglose de puntaje.

`cliente.retrato` elige cómo se dibuja el cliente en el panel lateral
(`src/ui/RetratoCliente.jsx`): `emoji` es el default histórico y `nia` dibuja un
núcleo pixel art con cinco expresiones. Recibe los mismos 5 estados del motor.

### Campos opcionales de `escribir` (minijuego `Logica`)

Todos opt-in dentro de `metaMinijuego`. Sin ellos el minijuego se comporta como
siempre: un intento, botón `▶ RUN`, sin sonido y sin animación.

| Campo | Efecto |
|---|---|
| `modoEntrada: "numeric"` | teclado numérico en celular |
| `etiquetaEjecutar` | texto del botón (default `▶ RUN`) |
| `autoFoco` | enfoca el campo al montar |
| `animarEjecucion` | barrido de ejecución + efectos de sonido |
| `intentosPermitidos` | `> 1` habilita reintentos; requiere `esCorrecta` en la opción buena |
| `penalizacionPorIntento` | puntos que cuesta cada intento fallido |
| `puntajeMinimo` | piso al aplicar esa penalización |
| `salidaEjecucion` | líneas de consola al acertar |

Lo que escribe el jugador **nunca se ejecuta**: se compara como texto contra las
`opciones` del JSON. Nada de `eval`, `Function()` ni `dangerouslySetInnerHTML`.

### Cómo puntúa el motor una decisión

- Si el minijuego devuelve un `puntajeDirecto` (segundo argumento de
  `onElegir`), el motor lo usa tal cual y no intenta puntuar por su cuenta. Es
  el camino de las mecánicas que sí saben cuánto vale lo que hizo el jugador:
  circuito, intruso y `escribir` con reintentos. El `bonus` sigue saliendo de la
  opción elegida. (`arquitectura-nodos` tiene su propia regla, anterior a esta,
  con el `bonusArquitecturaCompleta`.)
- `seleccion-unica`: puntaje de la opción elegida.
- `seleccion-multiple`: cuenta cuántas de las opciones elegidas tienen
  `esCorrecta: true` y busca ese conteo como clave en `tablaPuntaje`
  (ej. `tablaPuntaje["4"]` si eligió 4 correctas). Si la clave no existe, 0.
- Si la opción elegida trae `bonus`, esos puntos se suman aparte al total de
  bonos especiales (tope 80 en todo el escenario, pero el motor no lo capea
  explícitamente: el contenido debe cuidar no pasarse).
- Si se pidió la pista de esa decisión, se restan 10 puntos (una sola vez por
  decisión).

## Ejemplo comentado (extracto del escenario A · Ccorca)

```jsonc
{
  "id": "ccorca",
  "titulo": "Luz para Ccorca",
  "cliente": {
    "nombre": "Rosa",
    "rol": "Profesora",
    "dolorFrase": "Las baterías se descargan sin aviso y los chicos pierden clases de computación.",
    "imagen": null
  },
  "tiempoTotalSeg": 960,
  "fases": [
    {
      "id": "descubrir",
      "rol": "Analista",
      "titulo": "Fase 1 · Descubrir",
      "explicacion": "Un analista es la primera persona que habla con el cliente antes de programar cualquier cosa. Su trabajo es entender bien el problema real preguntando, no inventar una solución de una vez. Ahora vas a hacer 3 preguntas a la profesora Rosa: elige con cuidado, porque cada pregunta que 'gastas' en algo que no importa es una que no vas a poder volver a hacer.",
      "intro": "Videollamada con la profesora Rosa. Tienes tiempo para 3 preguntas.",
      "imagen": null,
      "tiempoSegFase": 200,
      "estilo": "entrevista",
      "decisiones": [
        {
          "id": "descubrir-1",
          "tipoInteraccion": "seleccion-unica",
          "pregunta": "Elige tu primera pregunta para Rosa",
          "opciones": [
            {
              "id": "quien-revisa",
              "texto": "¿Quién revisa las baterías hoy?",
              "puntaje": 60,
              "esTrampa": false,
              "descubrimiento": "Es el portero, y no sabe leer el medidor.",
              "feedback": "Bien: ahora sabes quién opera el sistema día a día."
            },
            {
              "id": "color-app",
              "texto": "¿Qué color prefiere para la app?",
              "puntaje": 0,
              "esTrampa": true,
              "descubrimiento": "Pierdes tu pregunta en algo que no importa aún.",
              "feedback": "Programar sin entender el problema es la forma más cara de fallar."
            }
          ]
        }
      ]
    },
    {
      "id": "disenar",
      "rol": "Diseñador UX",
      "titulo": "Fase 2 · Diseñar",
      "explicacion": "Un diseñador decide qué ve el usuario en la pantalla, y sobre todo qué NO ve: menos elementos, más claro. El portero no es programador ni le interesa serlo: solo necesita saber en un segundo si algo anda mal. Vas a armar su pantalla arrastrando elementos, y luego decidir el idioma y los colores.",
      "imagen": null,
      "tiempoSegFase": 200,
      "estilo": "wireframe",
      "decisiones": [
        {
          "id": "disenar-1",
          "tipoInteraccion": "seleccion-multiple",
          "pregunta": "Arrastra 4 elementos a la pantalla del portero",
          "seleccionExacta": 4,
          "tablaPuntaje": { "4": 60, "3": 30, "2": 30, "1": 0, "0": 0 },
          "opciones": [
            { "id": "boton-grande", "texto": "Botón gigante verde/rojo", "esCorrecta": true },
            { "id": "dashboard-12", "texto": "Dashboard con 12 gráficos", "esCorrecta": false }
          ]
        }
      ]
    }
  ],
  "epilogos": [
    { "min": 800, "max": 1000, "texto": "3 meses después, el colegio no perdió una sola clase de computación." },
    { "min": 400, "max": 799, "texto": "El sistema funciona casi siempre, aunque a veces Rosa tiene que llamar para avisar." },
    { "min": 0,   "max": 399, "texto": "La app quedó instalada en un solo celular y nadie la usó." }
  ]
}
```

El escenario A completo (12 decisiones, 5 fases) vive en
`src/content/ccorca.json` siguiendo exactamente esta forma.

## Escenarios existentes

| Archivo | Escenario | Qué mecánicas usa |
|---|---|---|
| `src/content/ccorca.json` | Luz para Ccorca (v1) | `seleccion-unica`, `seleccion-multiple`, `escribir` |
| `src/content/ccorca-v2.json` | Luz para Ccorca (v2) | + `mapa-calor`, `seleccion-cards`, `arquitectura-nodos` |
| `src/content/codigo-cero.json` | Código Cero | + `circuito-conexiones`, `detectar-intruso`, `mecanografia-codigo`, historietas y bloque `presentacion` |

Para que un escenario aparezca como tarjeta jugable hay que importarlo y
agregarlo a `ESCENARIOS_DISPONIBLES` en `src/screens/SeleccionEscenario.jsx`.
Ahí puede declarar una `portada` opcional (`{ color, fondo, icono }`); sin ella
usa la portada por defecto.

## Sobre validar el JSON

El motor **no valida** estos archivos en tiempo de ejecución: confía en que
cumplen el contrato. Un campo mal escrito no da un error legible, da un
`undefined` que se propaga. Se evaluó agregar una validación ligera al cargar el
escenario y se descartó por ahora: con tres escenarios y sin editor externo, el
riesgo real es bajo y el costo de mantener el validador sincronizado con cada
mecánica nueva no se justifica todavía. **La recomendación queda anotada**: si
en algún momento alguien edita estos JSON sin correr el juego, o si se suman
varios escenarios más, conviene implementarla (sin librerías: un chequeo de
campos obligatorios por tipo de interacción alcanza).

Mientras tanto, la red de seguridad es jugar el escenario completo antes de
subirlo — que es el criterio de aceptación permanente de `docs/CLAUDE.md`.
