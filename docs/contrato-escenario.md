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
- Cada fase tiene 2-3 `decisiones`. Entre las 5 fases suman exactamente
  **12 decisiones**, cada una puntúa 0/30/60 (hasta 720 en total).
- Bonos especiales (`bugCritico`, `usuarioReal`, hasta 80 pts combinados) van
  colgados del campo `bonus` de la opción correcta, no como lógica aparte.
- El bono de tiempo restante (hasta 200 pts) y el descuento de pista (-20 c/u)
  los calcula el motor; no viven en el JSON salvo el `pistaTexto` opcional que
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
├─ cliente: { nombre, rol, dolorFrase, imagen? }  // dolorFrase: máx 2 líneas; imagen: placeholder, null por ahora
├─ tiempoTotalSeg?: number              // opcional, default 960 (16 min)
├─ fases: Fase[5]                       // orden fijo: descubrir, disenar, construir, probar, desplegar
└─ epilogos: Epilogo[]                  // buckets por rango de puntaje, orden no importa

Fase
├─ id: 'descubrir'|'disenar'|'construir'|'probar'|'desplegar'
├─ rol: string                          // 'Analista', 'Diseñador UX', ... (para el HUD/insignias)
├─ titulo: string
├─ intro?: string                       // diálogo del cliente, máx 2 líneas
├─ explicacion: string                  // obligatorio. Lenguaje simple, sin jerga, explica qué
│                                        // va a hacer el estudiante y por qué antes de decidir.
│                                        // Se muestra completo, sin presión de tiempo de decisión,
│                                        // con un botón "Entiendo, comenzar". ~4-6 líneas máx.
├─ imagen?: string|null                 // placeholder de diagrama/foto de la fase, null por ahora
├─ tiempoSegFase: number                // segundos antes del auto-avance (incluye lectura + decisión)
├─ estilo: 'entrevista'|'wireframe'|'logica'|'bugs'|'deploy'  // solo cosmético
└─ decisiones: Decision[2-3]

Decision
├─ id: string                           // único en el escenario, ej 'descubrir-1'
├─ tipoInteraccion: 'seleccion-unica' | 'seleccion-multiple' | 'escribir'
├─ pregunta: string                     // máx 2 líneas
├─ pistaTexto?: string                  // si existe, el jugador puede pedirla (-20 pts)
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
├─ esCorrecta?: boolean                 // solo seleccion-multiple
├─ esTrampa?: boolean                   // cosmético/feedback, no cambia el puntaje
├─ descubrimiento?: string              // texto revelado al elegir (usado en 'entrevista')
├─ feedback?: string                    // el "por qué", se muestra al resolver la decisión
└─ bonus?: { tipo: 'bugCritico'|'usuarioReal', puntos: number }

Epilogo
├─ min: number
├─ max: number
└─ texto: string
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

### Cómo puntúa el motor una decisión

- `seleccion-unica`: puntaje de la opción elegida.
- `seleccion-multiple`: cuenta cuántas de las opciones elegidas tienen
  `esCorrecta: true` y busca ese conteo como clave en `tablaPuntaje`
  (ej. `tablaPuntaje["4"]` si eligió 4 correctas). Si la clave no existe, 0.
- Si la opción elegida trae `bonus`, esos puntos se suman aparte al total de
  bonos especiales (tope 80 en todo el escenario, pero el motor no lo capea
  explícitamente: el contenido debe cuidar no pasarse).
- Si se pidió la pista de esa decisión, se restan 20 puntos (una sola vez por
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
