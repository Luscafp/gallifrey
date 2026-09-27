import { forwardRef } from 'react'
import { Check, X } from 'lucide-react'
import { TextoComCodigo } from '../ui/TextoComCodigo.jsx'

/**
 * Estado visual de uma alternativa:
 *  - 'neutra'       ainda não respondida (pode estar selecionada)
 *  - 'escolhida-errada' | 'correta' | 'correta-escolhida' | 'apagada'  após a resposta
 * @typedef {'neutra'|'escolhida-errada'|'correta'|'correta-escolhida'|'apagada'} EstadoAlternativa
 */

const ESTILOS = {
  neutra: 'border-espaco-500/70 bg-espaco-800/70 hover:border-cosmo-ciano/60 hover:bg-espaco-700/70',
  selecionada: 'border-cosmo-ciano bg-espaco-700/90 shadow-brilho',
  'escolhida-errada': 'border-erro/80 bg-erro-escuro/60',
  correta: 'border-acerto/70 bg-acerto-escuro/60',
  'correta-escolhida': 'border-acerto bg-acerto-escuro/70 shadow-[0_0_24px_-6px_rgb(52_211_153_/_0.7)]',
  apagada: 'border-espaco-500/40 bg-espaco-800/40 opacity-70',
}

const LETRA = {
  neutra: 'border border-espaco-400 text-espaco-200',
  selecionada: 'bg-cosmo-ciano text-espaco-900',
  'escolhida-errada': 'bg-erro text-white',
  correta: 'bg-acerto text-espaco-900',
  'correta-escolhida': 'bg-acerto text-espaco-900',
  apagada: 'border border-espaco-500 text-espaco-300',
}

/**
 * Cartão de alternativa (A–D) com semântica de rádio.
 * @param {{ alternativa: {id: string, texto: string}, selecionada?: boolean, estado?: EstadoAlternativa, desabilitada?: boolean, aoSelecionar?: () => void, tabIndex?: number }} props
 */
export const CartaoAlternativa = forwardRef(function CartaoAlternativa(
  { alternativa, selecionada = false, estado = 'neutra', desabilitada = false, aoSelecionar, tabIndex },
  ref,
) {
  const chave = estado === 'neutra' && selecionada ? 'selecionada' : estado
  const respondida = estado !== 'neutra'
  // Saídas de programa com várias linhas (ex.: "3\n4") ficam em fonte monoespaçada
  const ehSaida = /\n/.test(alternativa.texto) && !alternativa.texto.includes('`')
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selecionada}
      aria-disabled={desabilitada || undefined}
      tabIndex={tabIndex}
      onClick={() => !desabilitada && aoSelecionar?.()}
      className={`group flex w-full [&_code]:[font-variant-ligatures:none] items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 sm:px-5 ${
        ESTILOS[chave]
      } ${desabilitada ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-bold transition-colors ${LETRA[chave]}`}
        aria-hidden
      >
        {alternativa.id}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="sr-only">Alternativa {alternativa.id}: </span>
        <TextoComCodigo texto={alternativa.texto} className={`break-words leading-snug text-cosmo-gelo ${ehSaida ? 'font-mono text-sm [font-variant-ligatures:none]' : 'text-[0.95rem]'}`} />
        {(estado === 'correta' || estado === 'correta-escolhida') && (
          <span className="text-sm font-semibold text-acerto">
            {estado === 'correta' ? 'Esta era a correta' : 'Você acertou!'}
          </span>
        )}
      </span>
      {respondida && (estado === 'correta' || estado === 'correta-escolhida') && (
        <Check className="h-7 w-7 shrink-0 text-acerto" aria-label="correta" />
      )}
      {estado === 'escolhida-errada' && <X className="h-7 w-7 shrink-0 text-erro" aria-label="sua resposta, incorreta" />}
    </button>
  )
})
