# MISIÓN DEPLOY
### Taller-simulador de Diseño y Desarrollo de Software — Tecsup Arequipa
*Propuesta de implementación · v1 · para revisión*

---

## 1. La idea en una frase

Un simulador web tipo videojuego donde el estudiante de secundaria recibe un problema real de una comunidad peruana y lo resuelve pasando por las 5 etapas del ciclo de desarrollo de software (descubrir, diseñar, construir, probar, desplegar), tomando decisiones que suman puntaje y compiten en un leaderboard por sesión.

**Mensaje que se llevan:** *"El software no se escribe, se decide. Y las decisiones de un desarrollador cambian la vida de gente real."*

**Nombres alternativos:** `MISIÓN DEPLOY` (recomendado) · `SPRINT 25` · `CÓDIGO CON CAUSA`

---

## 2. Cómo cumple la guía institucional

| Requisito de la guía | Cómo se resuelve |
|---|---|
| Mostrar cómo el área responde a una causa | Los 3 escenarios salen directo de la causa global: energía limpia, seguridad laboral, producción responsable |
| Hacer sentir al estudiante protagonista | Él **es** el desarrollador contratado. Sus decisiones cambian el epílogo de la historia |
| Breve, participativo, inspirador | ~30 min cronometrados, 0 minutos de diapositivas pasivas, 12 decisiones por partida |
| Diferencial tecnológico Tecsup | El propio taller es el diferencial: no hablamos de software, lo hacen. Cierre conecta con laboratorios, XR, GDG y proyectos reales del Centro de Innovación |
| Problemática concreta + aporte de la carrera | Cada escenario abre con un cliente humano con un dolor específico, no con un tema abstracto |

---

## 3. Guion de los ~30 minutos

| Tiempo | Bloque | Qué pasa |
|---|---|---|
| 0:00–2:00 | **Gancho** | Facilitador: *"En los próximos 25 minutos ustedes van a ser contratados. Alguien en el Perú tiene un problema y solo el software lo puede resolver."* Se proyecta el leaderboard vacío con los nombres de sus colegios |
| 2:00–4:00 | **Registro + elección** | La PC ya tiene el juego abierto en la pantalla de inicio. Escribe nombre y colegio con teclado (rápido), elige uno de 3 escenarios |
| 4:00–20:00 | **La partida (16 min)** | Timer visible. 5 fases; cada una abre con una explicación breve en lenguaje simple (nada de jerga) antes de pedir decisiones, y combina clic, arrastrar y escribir según la fase. Auto-avance si se pasan del tiempo |
| 20:00–24:00 | **Debrief guiado** | Facilitador proyecta 3 decisiones críticas: *"El 70% de ustedes eligió la app bonita. Miren qué pasó."* Aquí se nombra cada rol real: analista, UX, dev, QA, DevOps |
| 24:00–27:00 | **Leaderboard en vivo + premiación** | Se proyecta el top 5 de **esa sesión**. Premio a los 3 primeros |
| 27:00–30:00 | **Cierre motivacional** | 60 s de "esto que acabas de hacer es un semestre de la carrera" + QR a la carrera/admisión |

> El juego dura 16 minutos reales (subido de los 11 originales tras el primer prototipo jugable: los estudiantes de secundaria necesitan que cada etapa se les explique explícitamente antes de decidir, no solo un cuestionario). El resto es lo que convierte el juego en taller. Este número es provisional — la etapa 5 del plan de construcción (§10, ensayo con estudiantes reales) es la que lo confirma o ajusta.

---

## 4. Los tres escenarios

Todos comparten el mismo motor. Cambia solo el contenido (un archivo JSON por escenario), así que agregar un cuarto escenario después no requiere programar.

### A · "Luz para Ccorca" — Acceso a energía limpia
Un colegio rural tiene paneles solares donados, pero las baterías se descargan sin aviso y los chicos pierden clases de computación. **Cliente:** profesora Rosa.
**Lo que se construye:** un sistema de monitoreo con alertas.

### B · "Turno Seguro" — Seguridad laboral
En una operación minera, los operadores llenan su checklist pre-operacional en papel y las hojas se pierden. Hubo un incidente que se pudo evitar. **Cliente:** Julio, supervisor de seguridad.
**Lo que se construye:** checklist digital con bloqueo de equipo y alerta de fatiga.

### C · "Del Campo al Mercado" — Producción responsable
Una asociación de productoras de quinua vende a intermediarios que les pagan la mitad porque no pueden demostrar la calidad ni el origen de su producto. **Cliente:** doña Elena.
**Lo que se construye:** app de trazabilidad y precios en tiempo real.

*(Escenario D en backlog: "Posta Conectada", triaje offline en un centro de salud rural → conectividad digital.)*

---

## 5. Anatomía de una partida

5 fases × ~3 min (incluye una explicación breve, en lenguaje simple, antes de las decisiones de cada fase — el estudiante de secundaria no conoce las etapas de desarrollo ni la jerga técnica, así que cada una se presenta explícitamente antes de pedirle decidir). Ejemplo con el escenario A:

### Fase 1 · DESCUBRIR *(el analista)*
Videollamada con la profesora Rosa. Tienes tiempo para **3 preguntas de 6 posibles**.
- ✅ *"¿Quién revisa las baterías hoy?"* → descubres que es el portero, y no sabe leer el medidor
- ✅ *"¿Hay señal de internet en el colegio?"* → hay señal de celular, no wifi. **Esto cambia todo el diseño**
- ❌ *"¿Qué color prefiere para la app?"* → pierdes tu pregunta
**Lección:** programar sin entender el problema es la forma más caras de fallar.

### Fase 2 · DISEÑAR *(el diseñador UX)*
Arrastras 4 de 8 elementos a la pantalla del celular del portero.
- Un botón gigante verde/rojo gana sobre un dashboard con 12 gráficos
- Decisión trampa: *"¿pantalla en español o con iconos sin texto?"*
**Lección:** el diseño no es decorar, es decidir qué NO poner.

### Fase 3 · CONSTRUIR *(el desarrollador)*
Armas la regla de alerta con bloques tipo Scratch (mouse):
`SI batería < 20% Y hora > 18:00 → enviar SMS al portero`
Al costado aparece el mismo bloque en código real. Y como están en PC con teclado, **el último paso lo escriben**: una sola línea con un hueco.

```js
if (bateria < ___ && hora > 18) enviarSMS(portero);
```

Escriben `20`, presionan **RUN**, y la consola simulada responde `✔ SMS enviado a +51 9...`. Ese es el momento "yo programé algo y funcionó" — el que se llevan a casa.
**Lección:** programar es traducir una decisión humana a una regla exacta.

### Fase 4 · PROBAR *(el QA)*
Tu app ya está en el colegio. Llegan 3 reportes; solo alcanzas a arreglar 1.
- "La alerta llega a las 3 de la mañana" (molesto)
- "No llega la alerta cuando la batería baja rápido" (**crítico: es el bug que causó el problema original**)
- "El logo se ve chico" (cosmético)
**Lección:** priorizar es parte del oficio.

### Fase 5 · DESPLEGAR *(el DevOps)*
¿App en Play Store, web, o SMS puro? Solo una funciona con el celular de botones del portero.
Luego: **epílogo personalizado** según tus decisiones. Desde *"3 meses después, el colegio no perdió una sola clase"* hasta *"la app quedó instalada en un solo celular y nadie la usó"*.

---

## 6. Puntaje

| Concepto | Puntos |
|---|---|
| 12 decisiones × 0 / 30 / 60 pts | hasta **720** |
| Bonus de tiempo (proporcional al tiempo restante) | hasta **200** |
| Bonus "bug crítico" + "usuario real atendido" | hasta **80** |
| Pista usada | −20 cada una |
| **Total** | **1000** |

Reglas de diseño del puntaje:
- Nunca hay una opción "0 puntos que te elimina": todas avanzan, pero unas te dejan peor epílogo. Nadie se frustra ni queda fuera del juego.
- El puntaje se muestra al final de cada fase con una micro-explicación de *por qué* (esto es lo que enseña).
- El desempate es por tiempo, así que la partida premia decidir bien **y** rápido.

---

## 7. Leaderboard por sesión

- El código de sesión va en la URL: `/?s=AQP-1809-A`. Cada PC arranca con esa URL abierta (acceso directo en el escritorio o página de inicio de Chrome), así que **el estudiante nunca escribe el código ni ve una pantalla de sesión**.
- Para no editar 30 accesos directos entre sesión y sesión: si la URL no trae `?s=`, el juego consulta cuál es la sesión abierta en Supabase y la usa automáticamente. El facilitador solo abre/cierra sesiones desde su panel. Un acceso directo fijo sirve todo el evento.
- El leaderboard se proyecta en la pantalla del aula y se actualiza cada 4 segundos (no hace falta realtime; ver §8).
- Muestra: **posición · nombre · colegio · escenario · puntaje · tiempo**.
- Al cerrar la sesión, el facilitador descarga el CSV de la sesión (respaldo y premiación).
- Vista de "solo esta sesión" por defecto, con pestaña opcional de "récord histórico" para picar el orgullo entre colegios.

**Datos personales:** solo nombre y colegio, como pediste. Recomiendo pedir **nombre y primera letra del apellido** ("Andrea M.") y poner un aviso de una línea en el registro: *"Tu nombre y colegio se mostrarán en la pantalla del ranking durante el evento."*

---

## 8. Arquitectura técnica

```
┌────────────────────────────────────────────┐
│  GitHub Pages (estático, gratis, HTTPS)    │
│  React + Vite  →  motor del juego          │
│  escenarios/*.json  →  contenido           │
│  localStorage  →  partida en curso         │
└──────────────────┬─────────────────────────┘
                   │  INSERT partida / SELECT top 20
                   ▼
┌────────────────────────────────────────────┐
│  Supabase (plan free)                      │
│  Postgres + API REST autogenerada + RLS    │
└────────────────────────────────────────────┘
```

**Supabase (confirmado).** Plan free, sin backend propio: la API REST se autogenera desde las tablas. El volumen del evento (unos cientos de filas) es trivial para el free tier y no expira por inactividad si hay uso semanal. La `anon key` queda visible en el bundle de GitHub Pages — eso es normal y esperado en Supabase; la seguridad la da RLS, no ocultar la key.

Setup real, en orden:
1. Proyecto nuevo en Supabase (región São Paulo, la más cercana).
2. Correr el SQL de abajo en el editor.
3. Activar RLS en ambas tablas y crear 3 policies (§ siguiente).
4. Copiar `SUPABASE_URL` y `SUPABASE_ANON_KEY` a las variables de Vite (`VITE_…`).
5. Insertar una sesión de prueba y jugar una partida completa de punta a punta **antes** de seguir construyendo.

**Sobre realtime:** no lo necesitas. Un `SELECT` cada 4 s desde la pantalla del leaderboard es más simple, más robusto con wifi malo y no cambia la experiencia percibida.

### Esquema mínimo

```sql
create table sesiones (
  codigo      text primary key,        -- 'AQP-1809-A'
  nombre      text,                    -- 'Colegio San José, turno mañana'
  fecha       date default current_date,
  abierta     boolean default true
);

create table partidas (
  id          uuid primary key default gen_random_uuid(),
  sesion      text references sesiones(codigo),
  nombre      text not null,
  colegio     text not null,
  escenario   text not null,           -- 'ccorca' | 'turno-seguro' | 'campo-mercado'
  puntaje     int  not null check (puntaje between 0 and 1000),
  tiempo_seg  int  not null check (tiempo_seg between 120 and 1800),
  modo        text default 'individual',  -- 'individual' | 'pareja'
  decisiones  jsonb,                   -- para el debrief y estadísticas del taller
  creado_en   timestamptz default now()
);
```

**RLS (3 policies):**
- `partidas`: `INSERT` público, `SELECT` público, sin `UPDATE` ni `DELETE`.
- `sesiones`: `SELECT` público (para resolver la sesión abierta), escritura solo con la `service_role` desde el panel del facilitador.

Los `check` del esquema ya bloquean el intento obvio de meter 999999 puntos desde la consola. Un estudiante muy motivado igual podría insertar un 1000 limpio; con premios simbólicos no vale la pena defenderse más, y si el premio sube de valor, la mitigación real es que **el facilitador confirme el top 3 contra su CSV** antes de premiar.

**Plan B sin internet (importante):** la partida corre 100% en el navegador. Si falla el wifi, el juego no se entera; el envío al leaderboard se encola en `localStorage` y se reintenta. Si nada llega, el estudiante ve su puntaje en pantalla y el facilitador lo anota. **El taller nunca se cae.**

**Detalle de GitHub Pages:** hay que configurar `base: '/mision-deploy/'` en `vite.config.js`, o usar un repo `usuario.github.io` para servirlo en la raíz. Cloudflare Pages es igual de gratis y evita ese detalle, si prefieres.

### Lo que cambia por jugar en el laboratorio

| Tema | Decisión |
|---|---|
| **Resolución objetivo** | Diseñar para **1366×768** (lo típico en labs), verificar en 1920×1080. Nada de scroll vertical durante la partida: cada pantalla entra completa |
| **Interacción** | Mouse (drag & drop cómodo, sin dedos gordos) + **teclado** (nombre rápido, y la línea de código de la fase 3) |
| **Estado residual** | El `localStorage` de la PC arrastra la partida del grupo anterior. Se limpia al terminar la partida y al cargar si el `?s=` cambió. También un `Ctrl+Shift+R` de reinicio para el facilitador |
| **Red** | Probablemente cableada y estable → menor riesgo que con celulares. Igual se mantiene la cola offline |
| **Audio** | Las PCs de lab suelen no tener parlantes o audífonos: **el juego debe ser 100% comprensible en silencio**. Todo sonido es opcional y decorativo |
| **Navegador** | Verificar Chrome/Edge actualizado. Build con target ES2019 por si alguna máquina está atrasada |
| **Aforo real** | El número de PCs operativas define el aforo. Si hay más estudiantes que PCs, se pasa a parejas (ver §11) |

**Modo pareja:** el registro acepta hasta dos nombres (`Andrea M. y Luis C.`) y guarda `modo: 'pareja'`. En el leaderboard aparecen como una fila. No hace falta lógica extra ni ranking separado: en ~30 minutos separar categorías confunde más de lo que aporta. Además las parejas suelen sacar mejor puntaje porque discuten las decisiones — si eso te molesta para la premiación, el panel del facilitador puede filtrar el ranking a solo individuales con un click.

---

## 9. Lo que hay que diseñar → brief para Claude Design

### Identidad
- Wordmark "MISIÓN DEPLOY" con estética de consola/terminal cruzada con póster de misión espacial
- Paleta: institucional Tecsup como base + un acento neón para estados de acierto/error
- Tipografía: una display con carácter para títulos + una mono para todo lo que sea "código" o dato del sistema
- Tono visual: game jam, no corporativo. Que se sienta *juego*, no *módulo de capacitación*

### Pantallas (11)
1. **Inicio / registro** — nombre, colegio, botón grande "ACEPTAR MISIÓN"
2. **Selección de escenario** — 3 cards ilustradas con el dolor en una frase
3. **Intro narrativa** — retrato del cliente + diálogo tipo chat que aparece escribiéndose
4. **HUD de partida** — timer, puntaje, barra de progreso de las 5 fases
5. **Pantalla de decisión** — pregunta + 2–4 opciones + feedback inmediato con el "por qué"
6. **Mini-juego wireframe** — arrastrar componentes a un mockup de celular
7. **Mini-juego de bloques lógicos** — condición armable + panel de código real al costado + **consola simulada** con el botón `RUN` y la respuesta del sistema
8. **Bandeja de bugs** — 3 tickets, elegir uno, con severidad visual
9. **Deploy + epílogo** — animación de despliegue y desenlace ilustrado (3 variantes: excelente / aceptable / fallido)
10. **Leaderboard proyectado** — legible a 8 metros, con logos de colegios
11. **Panel del facilitador** — crear sesión, abrir/cerrar, descargar CSV

### Assets
- 3 retratos de personaje (Rosa, Julio, Elena) — ilustración cálida, peruana, sin caer en estereotipo
- 5 iconos de fase + 5 insignias de rol (Analista · Diseñador · Dev · QA · DevOps) que se van desbloqueando
- Animación de "deploy" (15 s, la recompensa visual del taller)
- Sellos de puntaje (+60 / +30 / 0) y microanimación de acierto
- Plantilla de diploma/insignia descargable con QR a la carrera
- Estados: hover, focus, correcto, incorrecto, cargando, sin conexión
- **Lienzo base 1366×768, horizontal, sin scroll durante la partida.** Botones y textos generosos porque se ve en monitor a 60 cm, pero el leaderboard proyectado necesita tipografía mucho mayor (legible a 8 m)
- Aprovechar que hay mouse: drag & drop real, hovers informativos, y una consola simulada con cursor parpadeante para el momento del `RUN`

---

## 10. Plan de construcción

| Etapa | Entregable | Nota |
|---|---|---|
| 0 | **Prototipo jugable feo** de 1 escenario | Antes de diseñar nada. Sirve para cronometrar y ver si el guion aburre o no |
| 1 | Diseño de las 11 pantallas + assets | Claude Design |
| 2 | Motor del juego + escenario A | React/Vite, contenido en JSON |
| 3 | Escenarios B y C | Solo contenido, sin código nuevo |
| 4 | Supabase + leaderboard + panel del facilitador | Incluye modo offline |
| 5 | Ensayo con 5 estudiantes reales | Aquí se ajusta el tiempo, siempre sobra o falta |
| 6 | Kit del facilitador | Guion impreso, checklist pre-taller, plan B, QR listos para proyectar |

---

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Se cae el wifi | Juego offline + cola de sincronización + anotación manual |
| Más estudiantes que PCs operativas | Se juega en parejas (que además discuten las decisiones, lo cual es pedagógicamente mejor). Registro con dos nombres |
| PC con la partida del grupo anterior a medias | Limpieza de `localStorage` al terminar y al cambiar de sesión + atajo de reinicio para el facilitador |
| Nombres ofensivos en pantalla | Lista negra básica + el facilitador puede ocultar una fila desde su panel |
| Se pasan del tiempo | Auto-avance por fase con penalidad suave, no bloqueo |
| Muy fácil / muy difícil | Dificultad ajustable en el JSON tras el primer ensayo |
| Lectores lentos | Texto de 1–2 líneas por decisión, nunca párrafos. Audio opcional en v2 |

---

## 12. Decisiones tomadas y supuestos pendientes

**Confirmado:** PCs del laboratorio · Supabase · juego individual con parejas como plan de contingencia.

**Pendiente de confirmar:**
1. **Cuántas PCs operativas** hay en el laboratorio asignado (define el aforo y si el modo pareja es excepción o norma).
2. **Número de sesiones** en el evento: asumo 4–8.
3. **Proyector disponible** en el mismo laboratorio para el leaderboard y el debrief. Si no hay, el ranking se ve en la pantalla del facilitador y pierde bastante fuerza.
4. **Permisos de TI:** ¿puedes dejar un acceso directo o página de inicio en las PCs? ¿El firewall del campus deja salir a `*.supabase.co`? **Esto conviene probarlo temprano**, es el riesgo técnico más real que veo.
5. **Premio:** asumo algo simbólico (merch Tecsup).
6. **Idioma y tono:** todo en español, cercano, sin jerga técnica hasta el debrief.

---

## 13. Checklist del laboratorio (10 min antes de cada sesión)

1. Abrir el panel del facilitador → **crear la sesión** del grupo (`AQP-1809-B`) y cerrar la anterior.
2. En cada PC: abrir el navegador en la pantalla de inicio del juego (script o acceso directo).
3. Verificar 2 PCs al azar: que cargue, que el nombre se escriba, que la partida de prueba se envíe.
4. Proyectar el leaderboard vacío con el nombre del colegio visitante en el título. **Este detalle levanta la energía del grupo desde que entran.**
5. Tener el CSV de la sesión anterior descargado y la pizarra con el top 3 previo (opcional, genera competencia entre colegios).
6. Plan B a la mano: si Supabase no responde, el juego avisa "modo local" y el facilitador anota los 5 mejores puntajes de viva voz.
