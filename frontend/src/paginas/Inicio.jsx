import { ArrowRight, Clock, History, Rocket, Target } from 'lucide-react'
import { buscarSessaoEmAndamento } from '../api/gallifrey.js'
import { Astronauta } from '../components/cosmo/Astronauta.jsx'
import { Planeta } from '../components/cosmo/Planeta.jsx'
import { FigurasHero } from '../components/inicio/FigurasHero.jsx'
import { Logo } from '../components/layout/Logo.jsx'
import { Botao } from '../components/ui/Botao.jsx'
import { AneisGallifreyanos } from '../components/whovian/AneisGallifreyanos.jsx'
import { Tardis } from '../components/whovian/Tardis.jsx'
import { useAluno } from '../contexto/AlunoContexto.jsx'
import { useRecurso } from '../hooks/useRecurso.js'
import { formatarDuracao, formatarPercentual, plural } from '../lib/formatadores.js'

/** Tela Inicial (fluxo 01): ponto de partida para "Iniciar Missão" e "Ver meu histórico". */
export default function Inicio() {
  const { aluno } = useAluno()
  // Falha ao buscar a sessão em andamento não impede o uso da tela: o card só não aparece.
  const { dados: emAndamento } = useRecurso((sinal) => buscarSessaoEmAndamento(sinal), [])
  const primeiroNome = aluno?.nome?.split(/\s+/)[0]
  const estatisticas = aluno?.estatisticas

  return (
    <div className="relative isolate mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col items-center overflow-x-clip px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
      <FigurasHero />

      <section aria-labelledby="titulo-inicio" className="relative flex flex-col items-center text-center">
        <AneisGallifreyanos className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-[58%] text-cosmo-ciano/10" />
        <h1 id="titulo-inicio" className="animate-surgir">
          <Logo tamanho="lg" />
        </h1>
        <p className="mt-6 text-xl text-cosmo-gelo/90 sm:text-2xl">Explore o universo do Python</p>
        <p className="mt-4 max-w-md text-base leading-relaxed text-espaco-200">
          Teste seus conhecimentos em Python com questões de múltipla escolha. Analise seu
          desempenho, descubra seus pontos fracos e evolua a cada sessão.
        </p>

        {emAndamento && (
          <div className="painel mt-8 flex w-full max-w-md animate-surgir flex-col items-center gap-3 border-cosmo-ciano/60 p-4 shadow-brilho sm:flex-row sm:text-left">
            <Planeta topico={emAndamento.topicos?.[0]} className="w-12 shrink-0" />
            <div className="flex-1">
              <p className="rotulo">Missão em andamento</p>
              <p className="text-sm text-espaco-200">
                Questão {Math.min(emAndamento.progresso.respondidas + 1, emAndamento.progresso.total)} de{' '}
                {emAndamento.progresso.total}
              </p>
            </div>
            <Botao para={`/missao/${emAndamento.id}`} tamanho="sm" iconeFim={<ArrowRight className="h-4 w-4" />}>
              Continuar missão
            </Botao>
          </div>
        )}

        <div className="mt-10 flex w-full max-w-xs flex-col gap-4 sm:max-w-sm">
          <Botao
            para="/missao/nova"
            tamanho="lg"
            className="w-full"
            iconeFim={<ArrowRight className="h-6 w-6" aria-hidden />}
          >
            Iniciar Missão
          </Botao>
          <Botao
            para="/historico"
            variante="secundario"
            tamanho="lg"
            className="w-full"
            icone={<History className="h-5 w-5" aria-hidden />}
          >
            Ver meu histórico
          </Botao>
        </div>
      </section>

      {estatisticas?.num_sessoes > 0 && (
        <dl className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-2 sm:gap-4">
          <Estatistica icone={Rocket} rotulo="Sessões" valor={estatisticas.num_sessoes} />
          <Estatistica
            icone={Target}
            rotulo="Taxa de acerto"
            valor={formatarPercentual(estatisticas.taxa_acerto_global)}
          />
          <Estatistica
            icone={Clock}
            rotulo="Tempo de estudo"
            valor={formatarDuracao(estatisticas.tempo_total_estudo_segundos, { curto: true })}
          />
        </dl>
      )}

      <div className="mt-10 flex w-full justify-center sm:absolute sm:bottom-16 sm:right-8 sm:mt-0 sm:w-auto">
        <Astronauta
          tamanho="w-16 sm:w-20"
          lado="esquerda"
          fala={
            <>
              Olá{primeiroNome ? `, ${primeiroNome}` : ''}!{' '}
              {estatisticas?.num_sessoes
                ? `Já são ${plural(estatisticas.num_sessoes, 'viagem', 'viagens')}. Bora para a próxima? `
                : 'Bora para a primeira viagem? '}
              <strong className="text-cosmo-ciano">Allons-y!</strong>
            </>
          }
        />
      </div>

      <footer className="mt-auto flex items-center gap-2 pt-12 text-xs text-espaco-300">
        <span>v1.0</span>
        <span aria-hidden>•</span>
        <span>Feito para aprendizado ativo</span>
        <span aria-hidden>•</span>
        <span className="inline-flex items-center gap-1.5">
          Maior por dentro <Tardis className="w-3" />
        </span>
      </footer>
    </div>
  )
}

function Estatistica({ icone: Icone, rotulo, valor }) {
  return (
    <div className="painel flex flex-col items-center gap-1 px-2 py-3 text-center">
      <Icone className="h-4 w-4 text-cosmo-ciano" aria-hidden />
      <dt className="order-last text-[11px] uppercase tracking-wider text-espaco-300">{rotulo}</dt>
      <dd className="text-lg font-semibold text-white sm:text-xl">{valor}</dd>
    </div>
  )
}
