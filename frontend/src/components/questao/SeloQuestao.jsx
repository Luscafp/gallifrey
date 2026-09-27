import { BrainCircuit } from 'lucide-react'
import { Planeta } from '../cosmo/Planeta.jsx'
import { ROTULO_NIVEL } from '../../lib/formatadores.js'

/**
 * Selos da questão: nível cognitivo (Bloom) e tópico com o planeta correspondente.
 * @param {{ questao: import('../../api/tipos.js').QuestaoPublica }} props
 */
export function SeloQuestao({ questao }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cosmo-ciano/60 px-3 py-1 text-sm text-cosmo-ciano">
        <BrainCircuit className="h-4 w-4" aria-hidden />
        <span className="sr-only">Nível cognitivo: </span>
        {ROTULO_NIVEL[questao.nivel_cognitivo] ?? questao.nivel_cognitivo}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-espaco-500 bg-espaco-800/60 py-1 pl-1.5 pr-3 text-sm text-espaco-200">
        <Planeta topico={questao.topico} className="h-5 w-5 object-contain" />
        <span className="sr-only">Tópico: </span>
        {questao.topico?.nome}
      </span>
    </div>
  )
}
