import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { buscarResultado, listarRespostasDaSessao } from '../api/gallifrey.js'
import { useRecurso } from '../hooks/useRecurso.js'
import { Astronauta } from '../components/cosmo/Astronauta.jsx'
import { Botao } from '../components/ui/Botao.jsx'
import { Carregando } from '../components/ui/Carregando.jsx'
import { EstadoErro } from '../components/ui/EstadoErro.jsx'
import { EnunciadoQuestao } from '../components/questao/EnunciadoQuestao.jsx'
import { GrupoAlternativas } from '../components/questao/GrupoAlternativas.jsx'
import { PainelFeedback } from '../components/questao/PainelFeedback.jsx'
import { PontosProgresso } from '../components/questao/PontosProgresso.jsx'
import { SeloQuestao } from '../components/questao/SeloQuestao.jsx'
import { formatarDataHora, formatarDuracao } from '../lib/formatadores.js'

const FILTROS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'erradas', rotulo: 'Erradas' },
  { id: 'corretas', rotulo: 'Corretas' },
]

const VAZIO = {
  todas: 'Nenhuma questão foi respondida nesta sessão.',
  erradas: 'Nenhuma questão errada. Fantástico!',
  corretas: 'Nenhum acerto desta vez. Geronimo — revise as justificativas e tente de novo!',
}

/**
 * Revisão da sessão ("Ver todas as questões" / "Ver questões erradas" da Tela de Resultados).
 * Somente leitura: mostra cada questão respondida no estado de feedback, com o tempo gasto.
 */
export default function Revisao() {
  const { sessaoId } = useParams()
  const [params, setParams] = useSearchParams()
  const filtro = FILTROS.some((f) => f.id === params.get('filtro')) ? params.get('filtro') : 'todas'

  const { dados, erro, carregando, recarregar } = useRecurso(
    (sinal) =>
      Promise.all([listarRespostasDaSessao(sessaoId, sinal), buscarResultado(sessaoId, sinal)]).then(
        ([respostas, resultado]) => ({ respostas, resultado }),
      ),
    [sessaoId],
  )

  const visiveis = useMemo(() => {
    const lista = dados?.respostas ?? []
    if (filtro === 'erradas') return lista.filter((r) => !r.correta)
    if (filtro === 'corretas') return lista.filter((r) => r.correta)
    return lista
  }, [dados, filtro])

  if (carregando && !dados) return <Carregando frase="Rebobinando a linha do tempo…" />
  if (erro) return <EstadoErro erro={erro} aoTentarNovamente={recarregar} />

  const { respostas, resultado } = dados
  const contagem = {
    todas: respostas.length,
    erradas: respostas.filter((r) => !r.correta).length,
    corretas: respostas.filter((r) => r.correta).length,
  }

  function irPara(ordem) {
    const alvo = document.getElementById(`questao-${ordem}`)
    if (!alvo) {
      setParams({ filtro: 'todas' }, { replace: true })
      requestAnimationFrame(() => document.getElementById(`questao-${ordem}`)?.scrollIntoView({ behavior: 'smooth' }))
      return
    }
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link
        to={`/missao/${sessaoId}/resultado`}
        className="inline-flex w-fit items-center gap-2 rounded-lg text-sm text-espaco-200 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar aos resultados
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="rotulo">Diário de bordo · Sessão #{resultado.sessao.numero}</p>
          <h1 className="font-display text-3xl text-white sm:text-4xl">Revisão da missão</h1>
          <p className="text-sm text-espaco-200">
            {formatarDataHora(resultado.sessao.data_inicio)} · {resultado.total_acertos} de{' '}
            {resultado.total_questoes_respondidas} corretas ·{' '}
            {formatarDuracao(resultado.tempo_total_segundos)} no total
          </p>
        </div>
        <div role="tablist" aria-label="Filtrar questões" className="flex rounded-xl border border-espaco-500 bg-espaco-800/60 p-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filtro === f.id}
              onClick={() => setParams(f.id === 'todas' ? {} : { filtro: f.id }, { replace: true })}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors sm:px-4 ${
                filtro === f.id ? 'bg-cosmo-ciano font-semibold text-espaco-900' : 'text-espaco-200 hover:text-white'
              }`}
            >
              {f.rotulo} <span className="opacity-70">({contagem[f.id]})</span>
            </button>
          ))}
        </div>
      </header>

      {respostas.length > 0 && (
        <nav aria-label="Ir para a questão" className="painel px-4 py-3">
          <PontosProgresso
            total={respostas.length}
            respostas={respostas.map((r) => ({ ordem: r.ordem, correta: r.correta }))}
            atual={null}
            maxVisiveis={60}
            aoClicar={irPara}
          />
        </nav>
      )}

      {visiveis.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-12">
          <Astronauta fala={VAZIO[filtro]} tamanho="w-24" />
          <Botao variante="secundario" para={`/missao/${sessaoId}/resultado`}>
            Voltar aos resultados
          </Botao>
        </div>
      ) : (
        <ol className="flex flex-col gap-6">
          {visiveis.map((r) => (
            <li key={r.ordem} id={`questao-${r.ordem}`} className="scroll-mt-24">
              <article
                className={`painel flex flex-col gap-5 p-5 sm:p-6 ${r.correta ? 'border-acerto/30' : 'border-erro/30'}`}
                aria-label={`Questão ${r.ordem}, ${r.correta ? 'correta' : 'errada'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <SeloQuestao questao={r.questao} />
                  <div className="flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-espaco-200">
                      <Clock className="h-4 w-4" aria-hidden />
                      {formatarDuracao(r.tempo_gasto_segundos)}
                    </span>
                    {r.correta ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-acerto">
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> Acertou
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-erro">
                        <XCircle className="h-4 w-4" aria-hidden /> Errou
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                  <EnunciadoQuestao questao={r.questao} ordem={r.ordem} alternativaCorreta={r.alternativa_correta} />
                  <GrupoAlternativas
                    alternativas={r.questao.alternativas}
                    selecionada={r.alternativa_escolhida}
                    alternativaCorreta={r.alternativa_correta}
                    rotulo={`Alternativas da questão ${r.ordem}`}
                  />
                </div>

                <PainelFeedback
                  correta={r.correta}
                  escolhida={r.alternativa_escolhida}
                  justificativas={r.justificativas}
                  tempoGastoSegundos={r.tempo_gasto_segundos}
                  anunciar={false}
                  className="bg-espaco-900/50"
                />
              </article>
            </li>
          ))}
        </ol>
      )}

      {visiveis.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Botao variante="secundario" para={`/missao/${sessaoId}/resultado`} icone={<ArrowLeft className="h-4 w-4" />}>
            Voltar aos resultados
          </Botao>
          <Botao para="/missao/nova">Nova Sessão</Botao>
        </div>
      )}
    </div>
  )
}
