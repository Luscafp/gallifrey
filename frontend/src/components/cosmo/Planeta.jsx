import { planetaDoTopico } from '../../lib/visualTopico.js'

/**
 * Planeta da Cosmo. Informe `topico` (usa o planeta daquele tópico) ou `src` diretamente.
 * @param {{ topico?: {id:any}, src?: string, className?: string, flutuar?: boolean, alt?: string }} props
 */
export function Planeta({ topico, src, className = 'w-16', flutuar = false, alt = '' }) {
  const planeta = topico ? planetaDoTopico(topico) : null
  return (
    <img
      src={src ?? planeta?.src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`select-none ${flutuar ? 'animate-flutuar' : ''} ${className}`}
    />
  )
}
