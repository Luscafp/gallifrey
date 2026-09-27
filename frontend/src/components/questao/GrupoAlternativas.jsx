import { useRef } from 'react'
import { CartaoAlternativa } from './CartaoAlternativa.jsx'
import { estadoDaAlternativa } from './logicaQuestao.js'

/**
 * Alternativas A–D como radiogroup acessível (setas ↑/↓ movem a seleção).
 * Depois da resposta (`alternativaCorreta` definida), fica somente leitura e mostra o feedback.
 *
 * @param {{
 *   alternativas: {id: string, texto: string}[],
 *   selecionada: string|null,
 *   alternativaCorreta?: string|null,
 *   aoSelecionar?: (letra: string) => void,
 *   rotulo?: string,
 * }} props
 */
export function GrupoAlternativas({ alternativas, selecionada, alternativaCorreta = null, aoSelecionar, rotulo = 'Alternativas' }) {
  const refs = useRef([])
  const respondida = Boolean(alternativaCorreta)
  const indiceFoco = Math.max(0, alternativas.findIndex((a) => a.id === selecionada))

  function aoTeclar(e) {
    if (respondida) return
    const delta = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (!delta) return
    e.preventDefault()
    const atual = alternativas.findIndex((a) => a.id === selecionada)
    const proximo = (atual + delta + alternativas.length) % alternativas.length
    aoSelecionar?.(alternativas[proximo].id)
    refs.current[proximo]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      aria-readonly={respondida || undefined}
      onKeyDown={aoTeclar}
      className="flex flex-col gap-3"
    >
      {alternativas.map((a, i) => (
        <CartaoAlternativa
          key={a.id}
          ref={(el) => (refs.current[i] = el)}
          alternativa={a}
          selecionada={selecionada === a.id}
          estado={estadoDaAlternativa(a.id, selecionada, alternativaCorreta)}
          desabilitada={respondida}
          tabIndex={i === indiceFoco ? 0 : -1}
          aoSelecionar={() => aoSelecionar?.(a.id)}
        />
      ))}
    </div>
  )
}
