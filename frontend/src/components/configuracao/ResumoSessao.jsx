import { Clock, FileText, ListOrdered, Star, Target } from 'lucide-react'
import { imgAstronautaEspiando } from '../cosmo/imagens.js'
import { formatarData, formatarDuracao } from '../../lib/formatadores.js'

/**
 * Coluna "Resumo da sessão" + "Última sessão" da Configurar Missão.
 * Apenas exibe o que foi escolhido — nada é enviado ao servidor aqui.
 *
 * @param {{
 *   topicosSelecionados: {id:any, nome:string}[],
 *   totalTopicos: number,
 *   numQuestoes: number,
 *   minutosEstimados: number,
 *   ultimaSessao: import('../../api/tipos.js').SessaoResumo | null | undefined,
 *   carregandoUltima: boolean,
 * }} props
 */
export function ResumoSessao({
  topicosSelecionados,
  totalTopicos,
  numQuestoes,
  minutosEstimados,
  ultimaSessao,
  carregandoUltima,
}) {
  const qtdTopicos = topicosSelecionados.length
  const rotuloTopicos =
    qtdTopicos === 0
      ? 'Nenhum'
      : qtdTopicos === totalTopicos
        ? `Todos (${totalTopicos})`
        : `${qtdTopicos} de ${totalTopicos}`

  return (
    <aside aria-labelledby="titulo-resumo" className="painel overflow-hidden">
      <div className="p-6">
        <h2 id="titulo-resumo" className="flex items-center gap-3 font-semibold uppercase tracking-wider text-white">
          <FileText className="h-6 w-6 text-cosmo-ciano" aria-hidden />
          Resumo da sessão
        </h2>
        <dl className="mt-4 divide-y divide-espaco-500/50">
          <Linha icone={Target} rotulo="Tópicos" valor={rotuloTopicos}>
            {qtdTopicos > 0 && qtdTopicos < totalTopicos && (
              <span className="mt-1 block text-xs text-espaco-300">
                {topicosSelecionados.map((t) => t.nome).join(' · ')}
              </span>
            )}
          </Linha>
          <Linha icone={ListOrdered} rotulo="Questões" valor={numQuestoes} />
          <Linha icone={Clock} rotulo="Tempo estimado" valor={`~${minutosEstimados} minutos`} />
        </dl>
      </div>

      <div className="border-t-2 border-espaco-500/60 bg-espaco-850/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-espaco-200">Última sessão</p>
        {carregandoUltima ? (
          <div className="mt-3 h-24 animate-pulse rounded-xl bg-espaco-700/50" />
        ) : ultimaSessao ? (
          <>
            <p className="mt-1 text-sm text-espaco-200">{formatarData(ultimaSessao.data_inicio)}</p>
            <dl className="mt-3 grid grid-cols-3 divide-x divide-espaco-500/60 rounded-xl border border-espaco-500/60 bg-espaco-900/50 py-3 text-center">
              <MiniDado icone={Target} rotulo="Acertos">
                {ultimaSessao.total_acertos}/{ultimaSessao.total_questoes_respondidas} acertos
              </MiniDado>
              <MiniDado icone={Clock} rotulo="Duração">
                {formatarDuracao(ultimaSessao.tempo_total_segundos, { curto: true })}
              </MiniDado>
              <MiniDado icone={Star} rotulo="Número">
                Sessão #{ultimaSessao.numero}
              </MiniDado>
            </dl>
          </>
        ) : (
          <div className="mt-3 flex items-center gap-4">
            <img
              src={imgAstronautaEspiando}
              alt=""
              aria-hidden
              className="h-24 w-14 rounded-xl object-cover object-bottom"
            />
            <p className="text-sm text-espaco-200">
              <strong className="block text-white">Esta será sua primeira viagem!</strong>
              Seus resultados aparecerão aqui depois da missão.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

function Linha({ icone: Icone, rotulo, valor, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <Icone className="mt-0.5 h-5 w-5 shrink-0 text-cosmo-ciano" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-espaco-200">{rotulo}</dt>
          <dd className="text-right font-semibold text-cosmo-ciano">{valor}</dd>
        </div>
        {children}
      </div>
    </div>
  )
}

function MiniDado({ icone: Icone, rotulo, children }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2">
      <Icone className="h-5 w-5 text-cosmo-ciano" aria-hidden />
      <dt className="sr-only">{rotulo}</dt>
      <dd className="text-xs text-cosmo-gelo sm:text-sm">{children}</dd>
    </div>
  )
}
