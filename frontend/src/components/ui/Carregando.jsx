import { useState } from 'react'
import { Tardis } from '../whovian/Tardis.jsx'
import { FRASES_CARREGAMENTO, fraseAleatoria } from '../../lib/doctorWho.js'

/**
 * Estado de carregamento: a TARDIS "materializando".
 * @param {{ frase?: string, className?: string }} props
 */
export function Carregando({ frase, className = 'py-24' }) {
  const [texto] = useState(() => frase ?? fraseAleatoria(FRASES_CARREGAMENTO))
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-5 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-tardis-claro/30 blur-2xl" />
        <Tardis className="w-14 animate-materializar" />
      </div>
      <p className="text-sm tracking-wide text-espaco-200">{texto}</p>
    </div>
  )
}
