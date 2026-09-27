import { imgCometa, imgSatelite } from '../cosmo/imagens.js'
import { PLANETAS } from '../../lib/visualTopico.js'

/**
 * Figuras da Cosmo que "orbitam" o hero da Tela Inicial. Puramente decorativas:
 * aria-hidden, sem eventos de ponteiro e reduzidas/ocultas em telas pequenas.
 */
export function FigurasHero() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <img
        src={PLANETAS.andromeda.src}
        alt=""
        className="absolute left-[4%] top-[14%] hidden w-28 animate-flutuar opacity-90 md:block lg:w-36"
      />
      <img
        src={PLANETAS.jupiter.src}
        alt=""
        className="absolute right-[7%] top-[10%] hidden w-14 animate-flutuar sm:block opacity-80 [animation-delay:1.2s] sm:w-20"
      />
      <img
        src={PLANETAS.terra.src}
        alt=""
        className="absolute bottom-[12%] left-[10%] hidden w-16 animate-flutuar opacity-80 [animation-delay:2.4s] lg:block"
      />
      <img
        src={PLANETAS.marte.src}
        alt=""
        className="absolute bottom-[30%] right-[4%] hidden w-12 animate-flutuar opacity-75 [animation-delay:0.6s] md:block"
      />
      <img
        src={imgCometa}
        alt=""
        className="absolute left-[18%] top-[6%] hidden w-20 -rotate-12 opacity-80 lg:block"
      />
      <img
        src={imgSatelite}
        alt=""
        className="absolute right-[20%] top-[46%] hidden w-16 rotate-12 animate-flutuar opacity-70 [animation-delay:3s] xl:block"
      />
    </div>
  )
}
