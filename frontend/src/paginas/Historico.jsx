import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, FileText, Hourglass, Orbit, Target } from 'lucide-react'
import { buscarHistorico } from '../api/gallifrey.js'
import { useRecurso } from '../hooks/useRecurso.js'
import { Carregando } from '../components/ui/Carregando.jsx'
import { EstadoErro } from '../components/ui/EstadoErro.jsx'
import { Botao } from '../components/ui/Botao.jsx'
import { Astronauta } from '../components/cosmo/Astronauta.jsx'
import { PLANETAS } from '../lib/visualTopico.js'
import { CartaoMetrica } from '../components/metricas/CartaoMetrica.jsx'
import { GraficoEvolucao } from '../components/metricas/GraficoEvolucao.jsx'
import { ListaDesempenhoTopico } from '../components/metricas/ListaDesempenhoTopico.jsx'
import { LinhaSessao } from '../components/metricas/LinhaSessao.jsx'
import { formatarDuracao, formatarPercentual, plural } from '../lib/formatadores.js'

const PERIODOS = [
  { valor: '7d', rotulo: '7 dias', comparacao: 'vs. 7 dias anteriores' },
  { valor: '30d', rotulo: '30 dias', comparacao: 'vs. 30 dias anteriores' },
  { valor: 'tudo', rotulo: 'Tudo', comparacao: '' },
]
const SESSOES_VISIVEIS = 6

/**
 * Histórico de Sessões (Documentação Funcional §3.5). O filtro de período fica na URL (?periodo=)
 * e, ao mudar, TODOS os blocos são recalculados juntos pelo backend (Critérios §3.4).
 */
export default function Historico() {
  const [params, setParams] = useSearchParams()
  const periodo = PERIODOS.some((p) => p.valor === params.get('periodo')) ? params.get('periodo') : 'tudo'
  const { dados, erro, carregando, recarregar } = useRecurso((sinal) => buscarHistorico(periodo, sinal), [periodo])
  const [expandido, setExpandido] = useState(false)

  function mudarPeriodo(valor) {
    setExpandido(false)
    setParams(valor === 'tudo' ? {} : { periodo: valor }, { replace: true })
  }

  // Enquanto recarrega, mantém os dados anteriores esmaecidos (sem "piscar" a tela).
  const atualizando = carregando && dados !== undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="relative flex flex-col gap-6 pb-8 md:flex-row md:items-end md:justify-between lg:pr-52">
        <img
          src={PLANETAS.netuno.src}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-12 -z-10 hidden w-52 opacity-90 drop-shadow-[0_0_40px_rgba(56,189,248,0.4)] lg:block"
        />
        <div>
          <p className="rotulo">Painel do explorador</p>
          <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">Seu Histórico</h1>
          <p className="mt-2 text-espaco-200">Acompanhe sua evolução no universo Python — seu diário de bordo.</p>
        </div>
        <SeletorPeriodo periodo={periodo} aoMudar={mudarPeriodo} />
      </header>

      {erro && <EstadoErro erro={erro} aoTentarNovamente={recarregar} />}
      {!erro && dados === undefined && <Carregando frase="Abrindo o diário de bordo…" />}
      {!erro && dados && (
        <div
          aria-busy={atualizando}
          className={`flex flex-col gap-6 transition-opacity duration-200 ${atualizando ? 'pointer-events-none opacity-50' : 'animate-surgir'}`}
        >
          <Estatisticas historico={dados} />
          {dados.sessoes.length === 0 ? (
            <Vazio />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <SessoesAnteriores
                sessoes={dados.sessoes}
                expandido={expandido}
                aoAlternar={() => setExpandido((v) => !v)}
              />
              <div className="flex min-w-0 flex-col gap-6">
                <section aria-labelledby="titulo-evolucao" className="painel p-5">
                  <h2 id="titulo-evolucao" className="mb-3 font-semibold text-white">
                    Evolução do Aproveitamento
                  </h2>
                  <GraficoEvolucao pontos={dados.evolucao} />
                </section>
                <section aria-labelledby="titulo-desempenho" className="painel p-5">
                  <h2 id="titulo-desempenho" className="mb-1 font-semibold text-white">
                    Desempenho por Tópico
                  </h2>
                  <ListaDesempenhoTopico topicos={dados.desempenho_por_topico} compacto />
                </section>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Controle segmentado 7 dias / 30 dias / Tudo (grupo de rádio acessível, setas mudam a opção). */
function SeletorPeriodo({ periodo, aoMudar }) {
  const refs = useRef([])
  function aoTeclar(e, i) {
    const passo = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!passo) return
    e.preventDefault()
    const proximo = (i + passo + PERIODOS.length) % PERIODOS.length
    aoMudar(PERIODOS[proximo].valor)
    refs.current[proximo]?.focus()
  }
  return (
    <div
      role="radiogroup"
      aria-label="Período"
      className="inline-flex self-start rounded-xl border border-espaco-400/60 bg-espaco-850/80 p-1 md:self-auto"
    >
      {PERIODOS.map((p, i) => {
        const ativo = p.valor === periodo
        return (
          <button
            key={p.valor}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={ativo}
            tabIndex={ativo ? 0 : -1}
            onClick={() => aoMudar(p.valor)}
            onKeyDown={(e) => aoTeclar(e, i)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              ativo ? 'bg-cosmo-ciano text-espaco-900 shadow-brilho' : 'text-espaco-200 hover:text-white'
            }`}
          >
            {p.rotulo}
          </button>
        )
      })}
    </div>
  )
}

function Estatisticas({ historico }) {
  const e = historico.estatisticas
  const comparacao = PERIODOS.find((p) => p.valor === historico.periodo)?.comparacao
  const variacao = e.variacao_taxa_acerto_pp
  return (
    <section aria-label="Estatísticas do período" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CartaoMetrica
        icone={<Orbit />}
        titulo="Total de sessões"
        valor={e.total_sessoes}
        legenda={e.total_sessoes === 1 ? 'sessão realizada' : 'sessões realizadas'}
      >
        {e.sessoes_mes_atual > 0 && (
          <p className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-acerto">
            <ArrowUp className="h-4 w-4" aria-hidden /> +{e.sessoes_mes_atual} este mês
          </p>
        )}
      </CartaoMetrica>

      <CartaoMetrica
        icone={<Target />}
        titulo="Taxa de acerto global"
        valor={<span className="text-cosmo-ciano">{formatarPercentual(e.taxa_acerto_global)}</span>}
        legenda="taxa de acerto"
      >
        {variacao !== null && variacao !== undefined && comparacao && (
          <p
            className={`mt-auto flex items-center gap-1.5 text-sm ${variacao >= 0 ? 'text-acerto' : 'text-atencao'}`}
          >
            {variacao >= 0 ? <ArrowUp className="h-4 w-4" aria-hidden /> : <ArrowDown className="h-4 w-4" aria-hidden />}
            <strong className="font-semibold">
              {variacao > 0 ? '+' : ''}
              {variacao.toLocaleString('pt-BR')} p.p.
            </strong>
            <span className="text-espaco-300">{comparacao}</span>
          </p>
        )}
      </CartaoMetrica>

      <CartaoMetrica
        icone={<Hourglass />}
        titulo="Tempo total de estudo"
        valor={formatarDuracao(e.tempo_total_estudo_segundos, { curto: true })}
        legenda="tempo total estudando"
      >
        {e.tempo_medio_por_sessao_segundos > 0 && (
          <p className="mt-auto text-sm text-espaco-300">
            Média de {formatarDuracao(e.tempo_medio_por_sessao_segundos, { curto: true })} por sessão
          </p>
        )}
      </CartaoMetrica>

      <CartaoMetrica
        icone={<FileText />}
        titulo="Questões respondidas"
        valor={e.questoes_respondidas}
        legenda={e.questoes_respondidas === 1 ? 'questão respondida' : 'questões respondidas'}
      >
        <p className="mt-auto text-sm text-espaco-300">
          {plural(e.questoes_unicas, 'única', 'únicas')} • {plural(e.questoes_repetidas, 'repetida', 'repetidas')}
        </p>
      </CartaoMetrica>
    </section>
  )
}

function SessoesAnteriores({ sessoes, expandido, aoAlternar }) {
  const visiveis = expandido ? sessoes : sessoes.slice(0, SESSOES_VISIVEIS)
  return (
    <section aria-labelledby="titulo-sessoes" className="painel flex min-w-0 flex-col gap-4 p-5">
      <div>
        <h2 id="titulo-sessoes" className="text-lg font-semibold text-white">
          Sessões Anteriores
        </h2>
        <p className="text-sm text-espaco-300">Clique em uma sessão para ver detalhes</p>
      </div>
      <ul id="lista-sessoes" className="flex flex-col gap-2.5">
        {visiveis.map((s, i) => (
          <LinhaSessao key={s.id} sessao={s} indice={i} />
        ))}
      </ul>
      {sessoes.length > SESSOES_VISIVEIS && (
        <button
          type="button"
          onClick={aoAlternar}
          aria-expanded={expandido}
          aria-controls="lista-sessoes"
          className="mx-auto flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold text-cosmo-ciano hover:text-white"
        >
          {expandido ? 'Mostrar menos' : `Ver todas as ${sessoes.length} sessões`}
          <ChevronDown className={`h-4 w-4 transition-transform ${expandido ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      )}
    </section>
  )
}

function Vazio() {
  return (
    <section className="painel flex flex-col items-center gap-6 px-6 py-14 text-center">
      <Astronauta
        tamanho="w-24"
        fala={
          <>
            <strong className="block text-white">Spoilers!</strong>
            Seu diário de bordo ainda está em branco neste período. Que tal começar uma viagem agora?
          </>
        }
      />
      <Botao para="/missao/nova" tamanho="lg" iconeFim={<ArrowRight className="h-5 w-5" />}>
        Iniciar Missão
      </Botao>
    </section>
  )
}
