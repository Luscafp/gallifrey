import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Eye, Flag, LogOut, X } from 'lucide-react'
import {
  buscarSessao,
  exibirProximaQuestao,
  finalizarSessao,
  registrarResposta,
} from '../api/gallifrey.js'
import { Cabecalho } from '../components/layout/Cabecalho.jsx'
import { Botao } from '../components/ui/Botao.jsx'
import { Carregando } from '../components/ui/Carregando.jsx'
import { EstadoErro } from '../components/ui/EstadoErro.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { Tardis } from '../components/whovian/Tardis.jsx'
import { CronometroQuestao } from '../components/questao/CronometroQuestao.jsx'
import { EnunciadoQuestao } from '../components/questao/EnunciadoQuestao.jsx'
import { GrupoAlternativas } from '../components/questao/GrupoAlternativas.jsx'
import { PainelFeedback } from '../components/questao/PainelFeedback.jsx'
import { PontosProgresso } from '../components/questao/PontosProgresso.jsx'
import { SeloQuestao } from '../components/questao/SeloQuestao.jsx'
import { useCronometro } from '../hooks/useCronometro.js'
import { config } from '../config.js'
import { plural } from '../lib/formatadores.js'

const LETRAS = ['A', 'B', 'C', 'D']

/**
 * Tela de Questão — fluxo central de coleta (Doc. Funcional §3.3):
 * exibe a questão (servidor marca `exibida_em`) → aluno escolhe e confirma → cronômetro congela →
 * resposta é gravada na hora → feedback com justificativas → próxima questão ou resultados.
 */
export default function Questao() {
  const { sessaoId } = useParams()
  const navegar = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  const [progresso, setProgresso] = useState(null)
  const [exibicao, setExibicao] = useState(null)
  const [selecionada, setSelecionada] = useState(null)
  const [resultado, setResultado] = useState(null)

  const [enviando, setEnviando] = useState(false)
  const [avancando, setAvancando] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)
  const [modalEncerrar, setModalEncerrar] = useState(false)
  const [encerrando, setEncerrando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const cronometro = useCronometro(
    exibicao ? { exibidaEm: exibicao.exibida_em, servidorAgora: exibicao.servidor_agora } : undefined,
  )

  const irParaResultados = useCallback(
    () => navegar(`/missao/${sessaoId}/resultado`, { replace: true }),
    [navegar, sessaoId],
  )

  // ------------------------------------------------------------------ carga inicial
  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      setErroCarga(null)
      try {
        const sessao = await buscarSessao(sessaoId)
        if (!ativo) return
        if (sessao.status !== 'EM_ANDAMENTO') return irParaResultados()
        const proxima = await exibirProximaQuestao(sessaoId)
        if (!ativo) return
        if (!proxima) {
          await finalizarSessao(sessaoId, 'CONCLUIDA')
          if (ativo) irParaResultados()
          return
        }
        setProgresso(sessao.progresso)
        setExibicao(proxima)
        setSelecionada(null)
        setResultado(null)
        setCarregando(false)
      } catch (e) {
        if (!ativo) return
        if (e?.codigo === 'SESSAO_FINALIZADA') return irParaResultados()
        setErroCarga(e)
        setCarregando(false)
      }
    }
    carregar()
    return () => {
      ativo = false
    }
  }, [sessaoId, tentativa, irParaResultados])

  // ------------------------------------------------------------------ ações
  const confirmar = useCallback(async () => {
    if (!exibicao || !selecionada || resultado || enviando) return
    setEnviando(true)
    setErroAcao(null)
    const medida = cronometro.parar()
    try {
      const r = await registrarResposta(sessaoId, {
        questao_id: exibicao.questao.id,
        alternativa_escolhida: selecionada,
        tempo_cliente_segundos: medida.segundos,
        tempo_oculto_segundos: medida.ocultoSegundos,
      })
      setResultado(r)
      setProgresso(r.progresso)
      setAviso(null)
    } catch (e) {
      setErroAcao(e)
    } finally {
      setEnviando(false)
    }
  }, [exibicao, selecionada, resultado, enviando, cronometro, sessaoId])

  const avancar = useCallback(async () => {
    if (!resultado || avancando) return
    setAvancando(true)
    setErroAcao(null)
    try {
      if (resultado.ha_proxima) {
        const proxima = await exibirProximaQuestao(sessaoId)
        if (proxima) {
          setExibicao(proxima)
          setSelecionada(null)
          setResultado(null)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
      }
      await finalizarSessao(sessaoId, 'CONCLUIDA')
      irParaResultados()
    } catch (e) {
      setErroAcao(e)
    } finally {
      setAvancando(false)
    }
  }, [resultado, avancando, sessaoId, irParaResultados])

  async function encerrar() {
    setEncerrando(true)
    try {
      await finalizarSessao(sessaoId, 'ENCERRADA_MANUALMENTE')
      irParaResultados()
    } catch (e) {
      setErroAcao(e)
      setModalEncerrar(false)
      setEncerrando(false)
    }
  }

  // ------------------------------------------------------------------ teclado: 1–4 / A–D escolhem, Enter confirma/avança
  useEffect(() => {
    function aoTeclar(e) {
      if (modalEncerrar || e.ctrlKey || e.metaKey || e.altKey) return
      const alvo = e.target
      if (alvo instanceof HTMLElement && alvo.closest('input, textarea, select, [contenteditable="true"]')) return
      const tecla = e.key.toUpperCase()
      const indice = ['1', '2', '3', '4'].indexOf(tecla)
      const letra = indice >= 0 ? LETRAS[indice] : LETRAS.includes(tecla) ? tecla : null
      if (letra && !resultado && exibicao?.questao.alternativas.some((a) => a.id === letra)) {
        e.preventDefault()
        setSelecionada(letra)
        return
      }
      if (e.key === 'Enter') {
        // Enter em botões/links mantém o comportamento nativo (clique)
        if (alvo instanceof HTMLElement && alvo.closest('a, button:not([role="radio"])')) return
        e.preventDefault()
        if (resultado) avancar()
        else confirmar()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [modalEncerrar, resultado, exibicao, confirmar, avancar])

  // ------------------------------------------------------------------ "Não pisque!": aviso ao voltar para a aba
  const respondidaRef = useRef(false)
  useEffect(() => {
    respondidaRef.current = Boolean(resultado)
  }, [resultado])
  useEffect(() => {
    let ocultaDesde = null
    function aoMudar() {
      if (document.visibilityState === 'hidden') {
        ocultaDesde = respondidaRef.current ? null : Date.now()
      } else if (ocultaDesde !== null) {
        const segundos = Math.round((Date.now() - ocultaDesde) / 1000)
        ocultaDesde = null
        if (segundos >= 3 && !respondidaRef.current) setAviso(segundos)
      }
    }
    document.addEventListener('visibilitychange', aoMudar)
    return () => document.removeEventListener('visibilitychange', aoMudar)
  }, [])

  // ------------------------------------------------------------------ render
  if (carregando || erroCarga) {
    return (
      <>
        <Cabecalho compacto />
        <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
          {erroCarga ? (
            <EstadoErro
              erro={erroCarga}
              titulo={erroCarga.status === 404 ? 'Missão não encontrada' : undefined}
              aoTentarNovamente={erroCarga.status === 404 ? undefined : () => setTentativa((t) => t + 1)}
            />
          ) : (
            <Carregando frase="Materializando a próxima questão…" />
          )}
          {erroCarga?.status === 404 && (
            <div className="flex justify-center">
              <Botao variante="secundario" para="/">
                Voltar ao início
              </Botao>
            </div>
          )}
        </main>
      </>
    )
  }

  const { questao, ordem, total } = exibicao
  const respondidas = progresso?.respondidas ?? 0
  const segundosQuestao = resultado ? resultado.tempo_gasto_segundos : cronometro.segundos
  const segundosSessao = resultado
    ? resultado.progresso.tempo_total_segundos
    : (progresso?.tempo_total_segundos ?? 0) + cronometro.segundos
  const percentualConcluido = total ? (respondidas / total) * 100 : 0

  return (
    <>
      <Cabecalho compacto>
        <div
          className="h-1.5 w-full bg-espaco-600/60"
          role="progressbar"
          aria-label="Questões respondidas"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={respondidas}
        >
          <div
            className="h-full rounded-r-full bg-linear-to-r from-cosmo-ciano-forte to-acerto shadow-brilho transition-[width] duration-700"
            style={{ width: `${percentualConcluido}%` }}
          />
        </div>
      </Cabecalho>

      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
          {/* Linha de status */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <p className="font-display text-lg tracking-wider text-cosmo-ciano">
                QUESTÃO {ordem} DE {total}
              </p>
              <SeloQuestao questao={questao} />
            </div>
            <div className="ml-auto">
              <CronometroQuestao
                segundosQuestao={segundosQuestao}
                segundosSessao={segundosSessao}
                parado={Boolean(resultado)}
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* Enunciado + código */}
            <section className="painel animate-surgir p-5 sm:p-7" key={`q-${questao.id}`}>
              <EnunciadoQuestao
                questao={questao}
                ordem={ordem}
                alternativaCorreta={resultado?.alternativa_correta ?? null}
              />
            </section>

            {/* Alternativas + ações + feedback */}
            <section className="flex flex-col gap-4" aria-label="Responder">
              <GrupoAlternativas
                alternativas={questao.alternativas}
                selecionada={resultado ? resultado.alternativa_escolhida : selecionada}
                alternativaCorreta={resultado?.alternativa_correta ?? null}
                aoSelecionar={setSelecionada}
                rotulo={`Alternativas da questão ${ordem}`}
              />

              {erroAcao && (
                <p role="alert" className="rounded-xl border border-erro/50 bg-erro-escuro/60 px-4 py-3 text-sm text-erro">
                  {erroAcao.message} {!resultado && 'Tente confirmar novamente.'}
                </p>
              )}

              {resultado ? (
                <Botao
                  tamanho="lg"
                  onClick={avancar}
                  carregando={avancando}
                  iconeFim={resultado.ha_proxima ? <ArrowRight className="h-5 w-5" /> : <Flag className="h-5 w-5" />}
                  className="w-full"
                  autoFocus
                >
                  {resultado.ha_proxima ? 'Próxima Questão' : 'Ver resultados'}
                </Botao>
              ) : (
                <Botao
                  tamanho="lg"
                  onClick={confirmar}
                  disabled={!selecionada}
                  carregando={enviando}
                  className="w-full"
                >
                  Confirmar resposta
                </Botao>
              )}
              {!resultado && (
                <p className="text-center text-xs text-espaco-300">
                  Atalhos: <kbd className="codigo-inline">1</kbd>–<kbd className="codigo-inline">4</kbd> ou{' '}
                  <kbd className="codigo-inline">A</kbd>–<kbd className="codigo-inline">D</kbd> para escolher,{' '}
                  <kbd className="codigo-inline">Enter</kbd> para confirmar
                </p>
              )}

              {resultado && (
                <PainelFeedback
                  correta={resultado.correta}
                  escolhida={resultado.alternativa_escolhida}
                  justificativas={resultado.justificativas}
                  className="animate-surgir"
                />
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Rodapé fixo com o placar da sessão */}
      <footer className="sticky bottom-0 z-20 border-t border-espaco-500/50 bg-espaco-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 md:flex-nowrap md:py-3">
          <ul className="order-1 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 md:w-auto md:justify-start text-xs text-espaco-200 sm:text-sm md:gap-x-5">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cosmo-ciano" aria-hidden />
              {respondidas} {respondidas === 1 ? 'respondida' : 'respondidas'}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-acerto" aria-hidden />
              {progresso?.acertos ?? 0} {(progresso?.acertos ?? 0) === 1 ? 'correta' : 'corretas'}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-erro" aria-hidden />
              {progresso?.erros ?? 0} {(progresso?.erros ?? 0) === 1 ? 'errada' : 'erradas'}
            </li>
          </ul>
          <div className="order-2 min-w-0 flex-1 md:flex-none">
            <PontosProgresso total={total} respostas={progresso?.respostas ?? []} atual={ordem} />
          </div>
          <div className="order-3 flex justify-end">
            <Botao
              variante="fantasma"
              tamanho="sm"
              onClick={() => setModalEncerrar(true)}
              icone={<LogOut className="h-4 w-4" />}
              className="decoration-dashed"
            >
              Encerrar<span className="-ml-0.5 hidden sm:inline">sessão</span>
            </Botao>
          </div>
        </div>
      </footer>

      {aviso !== null && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-40 flex w-[min(92vw,28rem)] -translate-x-1/2 animate-surgir items-start gap-3 rounded-2xl border border-cosmo-creme/40 bg-espaco-800/95 px-4 py-3 text-sm shadow-2xl md:bottom-24"
        >
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-cosmo-creme" aria-hidden />
          <p className="text-espaco-200">
            <strong className="text-cosmo-creme">Não pisque!</strong> Você ficou {plural(aviso, 'segundo')} fora da
            aba —{' '}
            {config.pausarCronometroAbaOculta
              ? 'o cronômetro exibido foi pausado, mas o tempo fora da aba é registrado.'
              : 'o tempo continua contando.'}
          </p>
          <button
            type="button"
            onClick={() => setAviso(null)}
            className="rounded-md p-1 text-espaco-300 hover:text-white"
            aria-label="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Modal
        aberto={modalEncerrar}
        aoFechar={() => !encerrando && setModalEncerrar(false)}
        titulo="Encerrar a viagem agora?"
        icone={<Tardis className="w-9 shrink-0" />}
        acoes={
          <>
            <Botao variante="secundario" tamanho="sm" onClick={() => setModalEncerrar(false)} disabled={encerrando}>
              Continuar respondendo
            </Botao>
            <Botao variante="perigo" tamanho="sm" onClick={encerrar} carregando={encerrando}>
              Encerrar sessão
            </Botao>
          </>
        }
      >
        Suas respostas até aqui já estão salvas.{' '}
        {respondidas === 0
          ? 'Como nenhuma questão foi respondida, os resultados ficarão vazios.'
          : `Os resultados vão considerar apenas ${
              respondidas === 1 ? 'a questão respondida' : `as ${respondidas} questões respondidas`
            }${resultado ? '' : ' (a questão atual não entra)'}.`}
      </Modal>
    </>
  )
}
