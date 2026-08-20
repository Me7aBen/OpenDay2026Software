# Audio de la partida

Acá va la música de fondo. **Poné tu archivo en esta carpeta con este nombre exacto:**

```
musica-fondo.mp3
```

Y listo, no hay que tocar código. La música arranca sola al elegir el escenario
y suena en bucle durante toda la partida.

## Qué archivo poner

- **Formato:** `.mp3`. Es el único que reproducen todos los navegadores sin
  excepciones. Si preferís `.ogg` o `.m4a`, cambiá la constante `ARCHIVO` en
  [`src/lib/musica.js`](../../src/lib/musica.js).
- **Duración:** que el loop cierre bien. La partida dura ~16 minutos, así que un
  track de 1–3 minutos que empalme con su propio inicio es lo ideal.
- **Peso:** por debajo de 2–3 MB. El archivo viaja en el bundle a GitHub Pages y
  en el laboratorio se descarga una vez por PC.
- **Volumen:** no hace falta normalizarlo, el juego lo baja a 35%.
- **Licencia:** que sea libre de derechos (o propia). El proyecto es público.

## Cómo se comporta si NO hay archivo

Todo sigue funcionando. `docs/CLAUDE.md` (regla 7) dice que el audio es
decorativo y que las PCs del laboratorio no tienen parlantes, así que la falta
del archivo no es un error:

- La partida corre normal, sin ningún mensaje ni error en consola.
- El botón de silencio de la barra superior no se muestra.

Por eso esta carpeta puede quedar sin el `.mp3` y no se rompe nada.

## Detalles que ya están resueltos

- **Bucle:** sí, `loop` nativo, sin cortes entre repeticiones.
- **Silencio:** hay un botón en la barra superior. La preferencia se guarda en
  `localStorage` (`md:musica-silenciada`), así que si el facilitador silencia, se
  mantiene silenciado al recargar y entre partidas.
- **Autoplay del navegador:** arranca con el clic en "ELEGIR ESCENARIO", que
  cuenta como interacción del usuario. Si igual el navegador lo bloquea, queda
  esperando y arranca en el siguiente clic o tecla, sin molestar al jugador.
- **Cuándo suena:** desde que se elige el escenario hasta la pantalla de
  resultado. Al volver al registro (abandonar o jugar de nuevo) se corta.
