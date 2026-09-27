import { useMemo } from 'react'
import { imgBrilho } from '../cosmo/imagens.js'

/**
 * Fundo espacial fixo: gradiente profundo, estrelas pequenas, alguns brilhos da Cosmo
 * e a órbita tracejada do protótipo. Fica atrás de todo o conteúdo (z-0, pointer-events-none).
 */
export function CampoEstelar() {
  const estrelas = useMemo(() => gerarEstrelas(140, 7), [])
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1b2766_0%,#0b1033_45%,#050a24_100%)]" />
      <div className="absolute left-1/2 top-[18%] h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full bg-cosmo-ciano/5 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {estrelas.map((e, i) => (
          <circle
            key={i}
            cx={`${e.x}%`}
            cy={`${e.y}%`}
            r={e.r}
            fill="#EDF3F8"
            opacity={e.o}
            className={e.pisca ? 'animate-cintilar' : undefined}
            style={e.pisca ? { animationDelay: `${e.atraso}s`, transformOrigin: `${e.x}% ${e.y}%` } : undefined}
          />
        ))}
      </svg>
      {[
        ['2.5%', '14%', 'w-7'],
        ['96%', '30%', 'w-5'],
        ['3.5%', '78%', 'w-5'],
        ['97%', '70%', 'w-4'],
      ].map(([x, y, w], i) => (
        <img
          key={i}
          src={imgBrilho}
          alt=""
          className={`absolute ${w} animate-cintilar opacity-80 [filter:hue-rotate(160deg)_saturate(0.4)_brightness(1.8)]`}
          style={{ left: x, top: y, animationDelay: `${i * 0.7}s` }}
        />
      ))}
      <div className="absolute -bottom-24 -right-24 h-72 w-[26rem] rotate-[-18deg] rounded-[50%] border border-dashed border-cosmo-ciano/40" />
    </div>
  )
}

/** Gerador pseudoaleatório determinístico (mesmo céu a cada render). */
function gerarEstrelas(qtd, semente) {
  let s = semente
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: qtd }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: rand() < 0.9 ? 0.6 + rand() * 0.6 : 1.4,
    o: 0.25 + rand() * 0.6,
    pisca: rand() < 0.12,
    atraso: rand() * 3,
  }))
}
