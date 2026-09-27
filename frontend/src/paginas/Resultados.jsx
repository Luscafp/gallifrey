import { useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChartColumn,
  ChartNoAxesColumn,
  ChartPie,
  Hourglass,
  Orbit,
  Rocket,
  Star,
  Target,
} from 'lucide-react'
import { buscarResultado } from '../api/gallifrey.js'
import { useRecurso } from '../hooks/useRecurso.js'
import { Carregando } from '../components/ui/Carregando.jsx'
import { EstadoErro } from '../components/ui/EstadoErro.jsx'
import { Botao } from '../components/ui/Botao.jsx'
import { BarraProgresso } from '../components/ui/BarraProgresso.jsx'
import { Astronauta } from '../components/cosmo/Astronauta.jsx'
import { imgBrilho, imgCometa } from '../components/cosmo/imagens.js'
import { PLANETAS } from '../lib/visualTopico.js'
import { CartaoMetrica } from '../components/metricas/CartaoMetrica.jsx'
import { ListaDesempenhoTopico } from '../components/metricas/ListaDesempenhoTopico.jsx'
import { BarrasTempoMedio } from '../components/metricas/BarrasTempoMedio.jsx'
import { CartaoPontoDeAtencao } from '../components/metricas/CartaoPontoDeAtencao.jsx'
import { mensagemDeDesempenho } from '../lib/doctorWho.js'
import {
  formatarCronometro,
  formatarDataHora,
  formatarDuracao,
  formatarPercentual,
  ordinal,
  plural,
} from '../lib/formatadores.js'

/**
 * Tela de Resultados (Documentação Funcional §3.4) — métricas calculadas pelo backend ao finalizar a sessão.
 * Também é aberta a partir do Histórico, sempre com os mesmos números (Critérios §3.4).
 */
export default function Resultados() {
  const { sessaoId } = useParams()
  const { dados, erro, carregando, recarregar } = useRecurso(
    (sinal) => buscarResultado(sessaoId, sinal),
    [sessaoId],
  )

  if (erro) return <Moldura><EstadoErro erro={erro} aoTentarNovamente={recarregar} /></Moldura>
  if (carregando || !dados) return <Carregando frase="Calculando sua trajetória…" />

  if (dados.sessao.status === 'EM_ANDAMENTO') return <SessaoEmAndamento resultado={dados} />

  return (
    <div className="animate-surgir">
      <Heroi resultado={dados} />
      <Moldura>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
          <MetricasDaSessao resultado={dados} />
          <AnalisePorTopico resultado={dados} />
        </div>
        <Acoes sessaoId={dados.sessao.id} />
      </Moldura>
    </div>
  )
}

function Moldura({ children }) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</div>
}

/* ------------------------------------------------------------------ herói */

function Heroi({ resultado }) {
  const { sessao } = resultado
  const encerrada = sessao.status === 'ENCERRADA_MANUALMENTE'
  const msg = mensagemDeDesempenho(resultado.percentual_aproveitamento)
  const previstas = sessao.progresso?.total ?? sessao.num_questoes_configuradas

  return (
    <section
      aria-labelledby="titulo-trajetoria"
      className="relative isolate overflow-hidden border-b border-dashed border-cosmo-ciano/40"
    >
      {/* Decoração: planeta grande à direita, cometa e brilhos (constelação) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(81,212,254,0.10),transparent_60%)]" />
        <img
          src={PLANETAS.netuno.src}
          alt=""
          className="absolute -right-16 top-4 hidden w-72 opacity-90 drop-shadow-[0_0_40px_rgba(56,189,248,0.45)] md:block lg:right-4"
        />
        <div className="absolute right-0 top-28 hidden h-24 w-[26rem] rotate-[-22deg] rounded-[50%] border border-cosmo-ciano/50 md:block lg:right-10" />
        <img src={imgCometa} alt="" className="absolute left-[6%] top-10 hidden w-20 -rotate-12 opacity-80 sm:block" />
        <svg className="absolute right-[26%] top-6 hidden h-24 w-44 lg:block" viewBox="0 0 176 96" fill="none">
          <path d="M4 20 L46 8 L90 30 L128 18 L170 52 L120 86" stroke="#8b95c4" strokeWidth="1" opacity="0.6" />
          {[[4, 20], [46, 8], [90, 30], [128, 18], [170, 52], [120, 86]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" fill="#EDF3F8" />
          ))}
        </svg>
        {[
          ['24%', '22%', 'w-5'],
          ['30%', '66%', 'w-3'],
          ['70%', '18%', 'w-4'],
          ['66%', '70%', 'w-5'],
        ].map(([l, t, w], i) => (
          <img
            key={i}
            src={imgBrilho}
            alt=""
            className={`absolute ${w} animate-cintilar [filter:hue-rotate(160deg)_saturate(0.6)_brightness(1.6)]`}
            style={{ left: l, top: t, animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <p className="rotulo flex items-center gap-2 text-sm">
          <Star className="h-4 w-4" aria-hidden /> {encerrada ? 'Missão encerrada' : 'Missão concluída'}{' '}
          <Star className="h-4 w-4" aria-hidden />
        </p>
        <h1 id="titulo-trajetoria" className="font-display text-4xl text-white sm:text-6xl">
          SUA TRAJETÓRIA
        </h1>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xl text-espaco-200 sm:text-2xl">
          Você acertou
          <span className="rounded-lg bg-cosmo-ciano px-3 font-display text-4xl text-espaco-900 shadow-brilho-forte sm:text-5xl">
            {resultado.total_acertos}
          </span>
          de {plural(resultado.total_questoes_respondidas, 'questão', 'questões')}
        </p>
        <p className="text-espaco-200">
          <strong className="font-semibold text-white">
            {formatarPercentual(resultado.percentual_aproveitamento)}
          </strong>{' '}
          de aproveitamento · <span className="font-semibold text-cosmo-ciano">{msg.titulo}</span> {msg.texto}
        </p>
        <span className="rounded-full border border-cosmo-lilas/40 bg-cosmo-lilas/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cosmo-lilas">
          Patente: {msg.patente}
        </span>
        {encerrada && (
          <p className="max-w-xl text-sm text-espaco-300">
            Você encerrou a viagem antes do fim: as métricas consideram apenas as{' '}
            {resultado.total_questoes_respondidas} questões respondidas das {previstas} previstas.
          </p>
        )}
        <p className="text-xs text-espaco-400">
          Sessão #{sessao.numero} · {formatarDataHora(sessao.data_inicio)}
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ métricas */

function MetricasDaSessao({ resultado }) {
  const { sessao, comparacao_sessao_anterior: comp } = resultado
  const pctAcertos = resultado.total_questoes_respondidas
    ? (resultado.total_acertos / resultado.total_questoes_respondidas) * 100
    : 0

  return (
    <section aria-labelledby="titulo-metricas" className="flex flex-col gap-5">
      <h2 id="titulo-metricas" className="flex items-center gap-3 text-lg font-semibold uppercase tracking-wide text-white">
        <ChartNoAxesColumn className="h-6 w-6 text-cosmo-ciano" aria-hidden /> Métricas da sessão
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <CartaoMetrica
          icone={<Target />}
          titulo="Acertos e erros"
          valor={
            <span className="flex items-baseline gap-4">
              <span>
                {resultado.total_acertos}
                <span className="ml-1.5 text-base font-normal text-acerto">
                  {resultado.total_acertos === 1 ? 'acerto' : 'acertos'}
                </span>
              </span>
              <span className="text-2xl">
                {resultado.total_erros}
                <span className="ml-1.5 text-base font-normal text-erro">
                  {resultado.total_erros === 1 ? 'erro' : 'erros'}
                </span>
              </span>
            </span>
          }
        >
          <div className="mt-auto flex flex-col gap-2">
            <BarraProgresso
              valor={pctAcertos}
              altura="h-3"
              cor="from-sky-400 to-acerto"
              rotulo={`${resultado.total_acertos} acertos de ${resultado.total_questoes_respondidas}`}
            />
            <p className="text-right text-xs text-espaco-300">
              {resultado.total_acertos} de {resultado.total_questoes_respondidas} corretas
            </p>
          </div>
        </CartaoMetrica>

        <CartaoMetrica
          icone={<Hourglass />}
          titulo="Tempo total"
          valor={<span className="tabular-nums">{formatarCronometro(resultado.tempo_total_segundos)}</span>}
          legenda="tempo na sessão"
        >
          <div className="mt-auto flex flex-col gap-1.5 border-t border-espaco-500/50 pt-3 text-sm">
            <p className="text-espaco-200">
              Tempo médio por questão: {formatarDuracao(resultado.tempo_medio_por_questao_segundos)}
            </p>
            <Comparacao comparacao={comp} />
          </div>
        </CartaoMetrica>

        <CartaoMetrica
          icone={<ChartColumn />}
          titulo="Tempo médio por questão"
          valor={formatarDuracao(resultado.tempo_medio_por_questao_segundos)}
          legenda="por questão (média)"
        >
          <BarrasTempoMedio sessoes={resultado.tempo_medio_ultimas_sessoes} atualId={sessao.id} />
        </CartaoMetrica>

        <CartaoMetrica
          icone={<Rocket />}
          titulo="Sessões realizadas"
          valor={<span className="font-display text-3xl">{ordinal(sessao.numero)} SESSÃO</span>}
          legenda={`de ${plural(resultado.aluno.num_sessoes, 'sessão', 'sessões')} no total`}
        >
          <div className="mt-auto flex flex-col gap-3 border-t border-espaco-500/50 pt-3">
            <p className="text-sm text-espaco-200">
              Total de questões respondidas: {resultado.aluno.total_questoes_respondidas}
            </p>
            <OrbitasDeSessoes numero={sessao.numero} />
          </div>
        </CartaoMetrica>
      </div>
    </section>
  )
}

function Comparacao({ comparacao }) {
  if (!comparacao) {
    return <p className="text-espaco-300">Primeira sessão — ainda sem comparação.</p>
  }
  const dif = comparacao.diferenca_tempo_total_segundos
  if (dif === 0) return <p className="text-espaco-300">Mesmo tempo da sua última sessão.</p>
  const maisRapido = dif < 0
  const Icone = maisRapido ? ArrowDown : ArrowUp
  return (
    <p className={`flex items-center gap-1.5 ${maisRapido ? 'text-acerto' : 'text-atencao'}`}>
      <Icone className="h-4 w-4 shrink-0" aria-hidden />
      {formatarDuracao(Math.abs(dif))} mais {maisRapido ? 'rápido' : 'lento'} que sua última sessão
    </p>
  )
}

/** Uma órbita por sessão (até 5), a mais recente acesa. */
function OrbitasDeSessoes({ numero }) {
  const total = Math.min(5, numero)
  const inicio = numero - total + 1
  return (
    <ol className="flex gap-3" aria-label={`Sessões ${inicio} a ${numero}`}>
      {Array.from({ length: total }, (_, i) => {
        const n = inicio + i
        const atual = n === numero
        return (
          <li key={n} title={`Sessão #${n}`}>
            <Orbit
              className={`h-8 w-8 ${atual ? 'text-cosmo-ciano drop-shadow-[0_0_8px_rgba(81,212,254,0.8)]' : 'text-espaco-400'}`}
              aria-hidden
            />
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ tópicos */

function AnalisePorTopico({ resultado }) {
  const acertos = resultado.total_acertos
  const topicos = resultado.desempenho_por_topico
  return (
    <section aria-labelledby="titulo-topicos" className="flex flex-col gap-5 lg:border-l lg:border-espaco-500/50 lg:pl-10">
      <h2 id="titulo-topicos" className="flex items-center gap-3 text-lg font-semibold uppercase tracking-wide text-white">
        <ChartPie className="h-6 w-6 text-cosmo-ciano" aria-hidden /> Análise por tópico
      </h2>
      <ListaDesempenhoTopico topicos={topicos} />
      <CartaoPontoDeAtencao ponto={resultado.ponto_de_atencao} sessaoId={resultado.sessao.id} />
      <Astronauta
        tamanho="w-16"
        className="self-end"
        lado="esquerda"
        fala={
          resultado.ponto_de_atencao
            ? `${acertos} ${acertos === 1 ? 'acerto' : 'acertos'} nesta viagem! Bora reforçar ${resultado.ponto_de_atencao.nome}?`
            : `${acertos} de ${acertos}! Até o Doctor ficaria impressionado.`
        }
      />
    </section>
  )
}

/* ------------------------------------------------------------------ ações */

function Acoes({ sessaoId }) {
  return (
    <nav
      aria-label="Próximos passos"
      className="mt-10 flex flex-col items-stretch gap-3 border-t border-espaco-500/50 pt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-5"
    >
      <Botao para="/missao/nova" tamanho="lg" iconeFim={<ArrowRight className="h-5 w-5" />}>
        Nova Sessão
      </Botao>
      <Botao para={`/missao/${sessaoId}/revisao`} variante="secundario" tamanho="lg">
        Ver todas as questões
      </Botao>
      <Botao para="/" variante="fantasma" tamanho="lg">
        Voltar ao início
      </Botao>
    </nav>
  )
}

function SessaoEmAndamento({ resultado }) {
  const { sessao } = resultado
  return (
    <Moldura>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
        <Astronauta
          tamanho="w-24"
          fala={
            <>
              <strong className="block text-white">Essa viagem ainda não terminou!</strong>
              <span className="text-espaco-200">
                Você respondeu {sessao.progresso.respondidas} de {sessao.progresso.total} questões da sessão #
                {sessao.numero}. Os resultados aparecem quando a missão for finalizada.
              </span>
            </>
          }
        />
        <Botao para={`/missao/${sessao.id}`} tamanho="lg" iconeFim={<ArrowRight className="h-5 w-5" />}>
          Continuar missão
        </Botao>
      </div>
    </Moldura>
  )
}
