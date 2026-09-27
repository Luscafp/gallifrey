import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, ChevronRight, Lock, Rocket } from 'lucide-react'
import { buscarUltimaSessao, iniciarSessao, listarTopicos } from '../api/gallifrey.js'
import { OverlayMaterializando } from '../components/configuracao/OverlayMaterializando.jsx'
import { ResumoSessao } from '../components/configuracao/ResumoSessao.jsx'
import { RotaDePlanetas } from '../components/configuracao/RotaDePlanetas.jsx'
import { Botao } from '../components/ui/Botao.jsx'
import { Carregando } from '../components/ui/Carregando.jsx'
import { EstadoErro } from '../components/ui/EstadoErro.jsx'
import { NUM_QUESTOES_PADRAO, OPCOES_NUM_QUESTOES, SEGUNDOS_ESTIMADOS_POR_QUESTAO } from '../config.js'
import { useRecurso } from '../hooks/useRecurso.js'

/** Tempo mínimo do "Materializando TARDIS…" (0 para quem prefere menos movimento). */
function duracaoMinimaOverlay() {
  const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  return reduzir ? 0 : 900
}

/**
 * Configurar Missão (fluxo 02). Escolher parâmetros NÃO cria nada no servidor:
 * a sessão só nasce no clique em "Iniciar Sessão" (Critérios de Aceitação §3.1).
 * Não há filtro de nível cognitivo: toda sessão mistura questões de todos os níveis.
 */
export default function ConfigurarMissao() {
  const navegar = useNavigate()
  const idErroTopicos = useId()
  const idTituloTopicos = useId()
  const topicosRecurso = useRecurso((sinal) => listarTopicos(sinal), [])
  const ultimaRecurso = useRecurso((sinal) => buscarUltimaSessao(sinal), [])

  const topicos = topicosRecurso.dados ?? []
  // null = padrão "todos selecionados" (evita sincronizar estado quando os tópicos chegam)
  const [escolhidos, setEscolhidos] = useState(null)
  const [numQuestoes, setNumQuestoes] = useState(NUM_QUESTOES_PADRAO)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState(null)

  const selecionados = escolhidos ?? topicos.map((t) => t.id)
  const semTopico = topicos.length > 0 && selecionados.length === 0
  const minutosEstimados = Math.max(1, Math.round((numQuestoes * SEGUNDOS_ESTIMADOS_POR_QUESTAO) / 60))

  function alternarTopico(id) {
    setErroEnvio(null)
    setEscolhidos((atual) => {
      const base = atual ?? topicos.map((t) => t.id)
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
    })
  }

  async function iniciar() {
    if (semTopico || enviando) return
    setErroEnvio(null)
    setEnviando(true)
    try {
      const ordenados = topicos.map((t) => t.id).filter((id) => selecionados.includes(id))
      const [sessao] = await Promise.all([
        iniciarSessao({ topico_ids: ordenados, num_questoes: numQuestoes }),
        new Promise((r) => setTimeout(r, duracaoMinimaOverlay())),
      ])
      navegar(`/missao/${sessao.id}`)
    } catch (erro) {
      setErroEnvio(erro)
      setEnviando(false)
    }
  }

  if (topicosRecurso.carregando) return <Carregando />
  if (topicosRecurso.erro)
    return <EstadoErro erro={topicosRecurso.erro} aoTentarNovamente={topicosRecurso.recarregar} />

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
      {enviando && <OverlayMaterializando />}

      <nav aria-label="Trilha" className="text-sm text-espaco-300">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-white">
              Início
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-4 w-4" />
          </li>
          <li aria-current="page" className="text-cosmo-gelo">
            Nova Sessão
          </li>
        </ol>
      </nav>

      <header className="mt-5 flex items-start gap-4">
        <Rocket className="mt-1 h-9 w-9 shrink-0 text-cosmo-ciano" aria-hidden />
        <div>
          <h1 className="font-display text-2xl tracking-wide text-white sm:text-4xl">CONFIGURAR MISSÃO</h1>
          <p className="mt-1 text-espaco-200">Personalize sua sessão de estudo</p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form
          className="flex flex-col gap-8 lg:col-span-7"
          onSubmit={(e) => {
            e.preventDefault()
            iniciar()
          }}
        >
          {/* role="group" em vez de <fieldset>: permite ações ("Selecionar todos") ao lado do título */}
          <div role="group" aria-labelledby={idTituloTopicos}>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={idTituloTopicos} className="text-lg font-semibold text-white">
                <span className="text-cosmo-ciano">1.</span> Tópicos{' '}
                <span className="text-sm font-normal text-espaco-300">— os planetas da sua rota</span>
              </h2>
              <div className="flex gap-1 text-sm">
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-cosmo-ciano hover:bg-cosmo-ciano/10 disabled:opacity-40"
                  onClick={() => setEscolhidos(topicos.map((t) => t.id))}
                  disabled={selecionados.length === topicos.length}
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-espaco-200 hover:bg-espaco-700 disabled:opacity-40"
                  onClick={() => setEscolhidos([])}
                  disabled={selecionados.length === 0}
                >
                  Limpar
                </button>
              </div>
            </div>
            <RotaDePlanetas
              topicos={topicos}
              selecionados={selecionados}
              aoAlternar={alternarTopico}
              invalido={semTopico}
              idDescricao={semTopico ? idErroTopicos : undefined}
            />
            {semTopico && (
              <p id={idErroTopicos} role="alert" className="mt-3 flex items-center gap-2 text-sm text-erro">
                <AlertCircle className="h-4 w-4" aria-hidden />
                Selecione pelo menos um tópico para iniciar a sessão.
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-4 text-lg font-semibold text-white">
              <span className="text-cosmo-ciano">2.</span> Quantidade de questões
            </legend>
            <div className="grid grid-cols-4 gap-1 rounded-2xl border border-espaco-500/70 bg-espaco-850/80 p-1">
              {OPCOES_NUM_QUESTOES.map((n) => (
                <label
                  key={n}
                  className={`cursor-pointer rounded-xl py-2.5 text-center font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cosmo-ciano ${
                    numQuestoes === n
                      ? 'bg-cosmo-ciano text-espaco-900 shadow-brilho'
                      : 'text-espaco-200 hover:bg-espaco-700 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="num_questoes"
                    value={n}
                    checked={numQuestoes === n}
                    onChange={() => setNumQuestoes(n)}
                    className="sr-only"
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            {erroEnvio && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-erro/40 bg-erro-escuro/60 px-4 py-3 text-sm text-erro">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {erroEnvio.message}
              </p>
            )}
            <Botao
              type="submit"
              tamanho="lg"
              className="w-full"
              disabled={semTopico || topicos.length === 0}
              carregando={enviando}
              iconeFim={<ArrowRight className="h-6 w-6" aria-hidden />}
            >
              Iniciar Sessão
            </Botao>
            <p className="text-center text-xs text-espaco-300">
              <span className="font-display tracking-wider text-gallifrey">Geronimo!</span> — o cronômetro
              de cada questão começa quando ela aparece na tela.
            </p>
          </div>
        </form>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <ResumoSessao
              topicosSelecionados={topicos.filter((t) => selecionados.includes(t.id))}
              totalTopicos={topicos.length}
              numQuestoes={numQuestoes}
              minutosEstimados={minutosEstimados}
              ultimaSessao={ultimaRecurso.dados}
              carregandoUltima={ultimaRecurso.carregando}
            />
          </div>
        </div>
      </div>

      <p className="mt-10 flex items-center justify-center gap-2 text-sm text-espaco-300">
        <Lock className="h-4 w-4 text-cosmo-ciano" aria-hidden />
        Suas respostas são salvas automaticamente
      </p>
    </div>
  )
}
