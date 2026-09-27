import { Link } from 'react-router-dom'
import { ArrowRight, PartyPopper, TriangleAlert } from 'lucide-react'
import { plural } from '../../lib/formatadores.js'

/**
 * "Pontos de atenção": tópico com maior proporção de erros na sessão.
 * @param {{ ponto: import('../../api/tipos.js').PontoDeAtencao | null, sessaoId: any }} props
 */
export function CartaoPontoDeAtencao({ ponto, sessaoId }) {
  if (!ponto) {
    return (
      <section className="flex items-start gap-4 rounded-2xl border border-acerto/50 bg-acerto-escuro/40 p-5">
        <PartyPopper className="h-9 w-9 shrink-0 text-acerto" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-acerto">Pontos de atenção</h3>
          <p className="mt-2 font-semibold text-white">Nenhum erro nesta missão. Fantástico!</p>
          <p className="mt-1 text-sm text-espaco-200">Que tal aumentar o desafio com o nível Avaliação?</p>
        </div>
      </section>
    )
  }
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-atencao/50 bg-atencao/10 p-5">
      <div className="flex items-start gap-4">
        <TriangleAlert className="h-9 w-9 shrink-0 text-atencao" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cosmo-ciano">Pontos de atenção</h3>
          <p className="mt-2 font-semibold text-white">Assunto com mais erros: {ponto.nome}</p>
          <p className="mt-1 text-sm text-espaco-200">
            {ponto.erros} de {plural(ponto.respondidas, 'questão', 'questões')}{' '}
            {ponto.erros === 1 ? 'errada' : 'erradas'} neste tópico. Vale revisar antes da próxima viagem.
          </p>
        </div>
      </div>
      <Link
        to={`/missao/${sessaoId}/revisao?filtro=erradas`}
        className="inline-flex shrink-0 items-center gap-2 self-end rounded-lg text-sm font-semibold text-cosmo-ciano hover:text-white"
      >
        Ver questões erradas <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  )
}
