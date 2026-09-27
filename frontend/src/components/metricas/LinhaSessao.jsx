import { Link } from 'react-router-dom'
import { ArrowRight, Check, Orbit, Rocket } from 'lucide-react'
import { corDoPercentual } from '../../lib/visualTopico.js'
import { formatarDataHora, formatarDuracao, formatarPercentual } from '../../lib/formatadores.js'

/** "25 set 2026 • 15:21" — data compacta para caber na linha. */
function dataCompacta(iso) {
  const d = new Date(iso)
  const dia = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ')
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dia} • ${hora}`
}

/**
 * Linha da lista "Sessões anteriores" do Histórico. Abre os resultados da sessão
 * (ou retoma a missão, se ainda estiver em andamento).
 * @param {{ sessao: import('../../api/tipos.js').SessaoResumo, indice: number }} props
 */
export function LinhaSessao({ sessao, indice }) {
  const emAndamento = sessao.status === 'EM_ANDAMENTO'
  const Icone = indice % 2 === 0 ? Rocket : Orbit
  const cor = corDoPercentual(sessao.percentual_aproveitamento)
  const topicos = sessao.todos_topicos ? 'Todos os tópicos' : sessao.topicos.map((t) => t.nome).join(', ')
  const destino = emAndamento ? `/missao/${sessao.id}` : `/missao/${sessao.id}/resultado`
  const rotuloAcessivel = emAndamento
    ? `Continuar sessão #${sessao.numero}, em andamento`
    : `Ver resultados da sessão #${sessao.numero}: ${sessao.total_acertos} de ${sessao.total_questoes_respondidas} acertos, ${formatarPercentual(sessao.percentual_aproveitamento)}`

  return (
    <li>
      <Link
        to={destino}
        aria-label={rotuloAcessivel}
        className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-espaco-500/50 bg-espaco-850/60 px-3 py-3 transition-colors hover:border-cosmo-ciano/60 hover:bg-espaco-700/60 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto] sm:gap-4 sm:px-4"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full border border-espaco-400/60 bg-espaco-800 text-espaco-200 group-hover:text-cosmo-ciano">
          <Icone className="h-5 w-5" aria-hidden />
        </span>

        <span className="min-w-0">
          <span className="block whitespace-nowrap font-semibold text-white">Sessão #{sessao.numero}</span>
          <time
            dateTime={sessao.data_inicio}
            title={formatarDataHora(sessao.data_inicio)}
            className="block whitespace-nowrap text-xs text-espaco-300"
          >
            {dataCompacta(sessao.data_inicio)}
          </time>
          <span
            className="mt-1.5 hidden max-w-full truncate rounded-full border border-espaco-400/60 px-2.5 py-0.5 text-[11px] text-espaco-200 sm:inline-block"
            title={topicos}
          >
            {topicos}
          </span>
        </span>

        {emAndamento ? (
          <span className="whitespace-nowrap rounded-full border border-cosmo-magenta/50 px-3 py-1 text-xs font-semibold text-cosmo-magenta sm:col-span-3">
            Em andamento
          </span>
        ) : (
          <>
            <span className="hidden items-center gap-1 whitespace-nowrap font-semibold tabular-nums text-white sm:flex">
              {sessao.total_acertos}/{sessao.total_questoes_respondidas}
              <Check className={`h-4 w-4 ${cor.texto}`} aria-hidden />
            </span>
            <span className="hidden whitespace-nowrap text-sm tabular-nums text-espaco-200 sm:block">
              {formatarDuracao(sessao.tempo_total_segundos)}
            </span>
            <span
              className={`grid h-12 w-12 place-items-center rounded-full border-2 border-current/40 bg-espaco-900/70 text-sm font-semibold tabular-nums ${cor.texto}`}
            >
              {formatarPercentual(sessao.percentual_aproveitamento)}
            </span>
          </>
        )}

        <ArrowRight
          className="hidden h-5 w-5 text-cosmo-ciano transition-transform group-hover:translate-x-1 sm:block"
          aria-hidden
        />

        {/* Detalhes compactos no celular */}
        {!emAndamento && (
          <span className="col-span-3 -mt-1 flex flex-wrap gap-x-3 gap-y-1 pl-14 text-xs text-espaco-300 sm:hidden">
            <span className="tabular-nums">
              {sessao.total_acertos}/{sessao.total_questoes_respondidas} certas
            </span>
            <span>{formatarDuracao(sessao.tempo_total_segundos)}</span>
            <span className="truncate">{topicos}</span>
          </span>
        )}
      </Link>
    </li>
  )
}
