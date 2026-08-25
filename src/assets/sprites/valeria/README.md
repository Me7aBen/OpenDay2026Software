# Sprites de Valeria

Paquete de sprites en PNG RGBA con fondo transparente, preparado para la interfaz web y el minijuego.

## Organización

- `portrait/`: retrato principal.
- `expressions/`: cuatro expresiones normalizadas a 512 × 512 px.
- `dialogue/`: cuatro poses de busto para conversaciones.
- `body/`: dos poses estáticas y cuatro cuadros de caminata.
- `sheets/`: hojas horizontales con los mismos cuadros ya ordenados.
- `sprites.json`: dimensiones, orden de cuadros y rutas relativas.

## Renderizado recomendado

```css
.valeria-sprite {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  object-fit: contain;
}
```

Para interfaces y diálogos conviene usar los PNG individuales. Para animar al personaje en el minijuego puede usarse `sheets/valeria-body-sheet.png`, cuyos cuadros miden 362 × 724 px y están ordenados según `sprites.json`.
