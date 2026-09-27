import { imgAstronauta } from './imagens.js'

/**
 * O pequeno astronauta da Cosmo — mascote que "fala" com o aluno em estados vazios, erros e resultados.
 *
 * @param {{ fala?: React.ReactNode, tamanho?: string, lado?: 'esquerda'|'direita', flutuar?: boolean, className?: string }} props
 *   tamanho: classes de largura do Tailwind (ex.: "w-24")
 */
export function Astronauta({ fala, tamanho = 'w-24', lado = 'direita', flutuar = true, className = '' }) {
  return (
    <div
      className={`flex items-end gap-3 ${lado === 'esquerda' ? 'flex-row-reverse' : ''} ${className}`}
    >
      <img
        src={imgAstronauta}
        alt="Pequeno astronauta da Cosmo"
        className={`${tamanho} shrink-0 drop-shadow-[0_8px_24px_rgba(139,92,246,0.45)] ${flutuar ? 'animate-flutuar' : ''}`}
      />
      {fala && (
        <div
          className={`relative mb-10 max-w-xs rounded-2xl border border-cosmo-ciano/40 bg-espaco-800/95 px-4 py-3 text-sm leading-relaxed text-cosmo-gelo shadow-brilho ${
            lado === 'esquerda' ? 'rounded-br-sm' : 'rounded-bl-sm'
          }`}
        >
          {fala}
        </div>
      )}
    </div>
  )
}
