import { normalizarAvatar } from './avatarOpciones';

// Avatar pixel art del jugador, dibujado como SVG de rectángulos sobre una
// grilla de 16x18 "píxeles". `shapeRendering="crispEdges"` es lo que hace que
// los bordes no se antialiasen: sin eso, escalar el SVG a 120px lo convierte en
// un dibujo borroso en vez de pixel art.
//
// No hay ni un archivo de imagen detrás. El dibujo es la composición de tres
// capas (rostro, chaqueta, accesorio) definidas en avatarOpciones.js, así que
// las 48 combinaciones posibles pesan lo mismo que una.
//
// Props:
//   avatar  { rostro, color, accesorio }  - ids; cualquier hueco cae al default
//   tam     number                        - lado en px (el SVG es cuadrado-ish)
//   titulo  string                        - texto accesible; si no se pasa, el
//                                           SVG queda oculto a lectores (decorativo)

export default function Avatar({ avatar, tam = 96, titulo }) {
  const { rostro, color, accesorio } = normalizarAvatar(avatar);
  const alto = Math.round((tam * 18) / 16);

  return (
    <svg
      className="avatar-pixel"
      width={tam}
      height={alto}
      viewBox="0 0 16 18"
      shapeRendering="crispEdges"
      role={titulo ? 'img' : undefined}
      aria-label={titulo || undefined}
      aria-hidden={titulo ? undefined : 'true'}
    >
      {/* --- Capa 1: cabeza y rostro --- */}
      <rect x="4" y="3" width="8" height="7" fill={rostro.piel} />
      {/* Sombra lateral: le da volumen sin necesidad de degradados. */}
      <rect x="11" y="3" width="1" height="7" fill="#000" opacity="0.16" />
      <rect x="7" y="10" width="2" height="1" fill={rostro.piel} />

      {/* Pelo, distinto por peinado. */}
      {rostro.peinado === 'corto' && (
        <>
          <rect x="4" y="2" width="8" height="2" fill={rostro.pelo} />
          <rect x="4" y="4" width="1" height="2" fill={rostro.pelo} />
          <rect x="11" y="4" width="1" height="2" fill={rostro.pelo} />
        </>
      )}
      {rostro.peinado === 'largo' && (
        <>
          <rect x="4" y="2" width="8" height="2" fill={rostro.pelo} />
          <rect x="3" y="3" width="1" height="7" fill={rostro.pelo} />
          <rect x="12" y="3" width="1" height="7" fill={rostro.pelo} />
        </>
      )}
      {rostro.peinado === 'rapado' && (
        <>
          <rect x="4" y="2" width="8" height="1" fill={rostro.pelo} />
          <rect x="4" y="3" width="8" height="1" fill={rostro.pelo} opacity="0.45" />
        </>
      )}

      {/* Ojos y boca. Se dibujan antes del accesorio para que lentes y visor
          queden por encima, como corresponde. */}
      <rect x="6" y="6" width="1" height="1" fill="#141d38" />
      <rect x="9" y="6" width="1" height="1" fill="#141d38" />
      <rect x="7" y="8" width="2" height="1" fill="#141d38" opacity="0.55" />

      {/* --- Capa 2: chaqueta --- */}
      <rect x="3" y="11" width="10" height="6" fill={color.base} />
      <rect x="3" y="11" width="10" height="1" fill={color.claro} />
      <rect x="7" y="12" width="2" height="5" fill={color.claro} opacity="0.75" />
      <rect x="2" y="12" width="1" height="5" fill={color.base} />
      <rect x="13" y="12" width="1" height="5" fill={color.base} />
      <rect x="2" y="12" width="1" height="5" fill="#000" opacity="0.2" />
      <rect x="13" y="12" width="1" height="5" fill="#000" opacity="0.2" />

      {/* --- Capa 3: accesorio --- */}
      {accesorio.id === 'audifonos' && (
        <>
          <rect x="4" y="1" width="8" height="1" fill="#c8d4ec" />
          <rect x="3" y="2" width="1" height="2" fill="#c8d4ec" />
          <rect x="12" y="2" width="1" height="2" fill="#c8d4ec" />
          <rect x="3" y="4" width="1" height="3" fill="#4ad9ff" />
          <rect x="12" y="4" width="1" height="3" fill="#4ad9ff" />
        </>
      )}
      {accesorio.id === 'lentes' && (
        <>
          <rect x="5" y="5" width="3" height="3" fill="#4ad9ff" opacity="0.35" />
          <rect x="8" y="5" width="3" height="3" fill="#4ad9ff" opacity="0.35" />
          <rect x="5" y="5" width="3" height="1" fill="#4ad9ff" />
          <rect x="8" y="5" width="3" height="1" fill="#4ad9ff" />
          <rect x="5" y="7" width="3" height="1" fill="#4ad9ff" />
          <rect x="8" y="7" width="3" height="1" fill="#4ad9ff" />
          <rect x="4" y="5" width="1" height="1" fill="#4ad9ff" />
          <rect x="11" y="5" width="1" height="1" fill="#4ad9ff" />
        </>
      )}
      {accesorio.id === 'visor' && (
        <>
          <rect x="3" y="5" width="10" height="3" fill="#101a30" />
          <rect x="4" y="6" width="8" height="1" fill="#ff5c9d" />
          <rect x="4" y="5" width="8" height="1" fill="#4ad9ff" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
