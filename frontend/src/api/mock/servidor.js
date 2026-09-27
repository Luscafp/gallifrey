/**
 * Backend SIMULADO do Gallifrey, executado no navegador (ativo quando VITE_API_MOCK=true).
 *
 * Implementa todas as rotas de docs/contrato-api.md com as mesmas regras de negócio que o backend real
 * deve seguir, persistindo em localStorage. Serve para desenvolver/demonstrar o frontend enquanto o
 * backend não existe e como referência executável do contrato.
 */
import questoesSemente from './data/questoes.json'
import topicosSemente from './data/topicos.json'
import {
  DIA_MS,
  desempenhoPorTopico,
  estaFinalizada,
  janelaDoPeriodo,
  percentual,
  pontoDeAtencao,
  resumirRespostas,
  sessaoAnterior,
  unicasERepetidas,
} from './metricas.js'
import { gerarHistoricoDemonstracao } from './semente.js'
import { config } from '../../config.js'

const CHAVE_STORAGE = 'gallifrey_mock_v1'
const LETRAS = ['A', 'B', 'C', 'D']
const NIVEIS_VALIDOS = ['ANALISE', 'AVALIACAO', 'TODOS']

class ErroHttp extends Error {
  constructor(status, codigo, mensagem, detalhes) {
    super(mensagem)
    this.status = status
    this.codigo = codigo
    this.detalhes = detalhes
  }
}

/**
 * @param {{ armazenamento?: Storage | null, agora?: () => number, aleatorio?: () => number, semearHistorico?: boolean }} [opcoes]
 */
export function criarServidorMock(opcoes = {}) {
  const armazenamento = opcoes.armazenamento === undefined ? obterLocalStorage() : opcoes.armazenamento
  const agora = opcoes.agora ?? (() => Date.now())
  const aleatorio = opcoes.aleatorio ?? Math.random
  const semearHistorico = opcoes.semearHistorico ?? true

  const questoes = questoesSemente
  const topicos = topicosSemente
  const questoesPorId = new Map(questoes.map((q) => [q.id, q]))
  const topicosPorId = new Map(topicos.map((t) => [t.id, t]))

  let db = carregar()

  function estadoInicial() {
    const base = {
      versao: 1,
      proximoId: { sessao: 1, resposta: 1 },
      aluno: {
        id: 1,
        nome: 'Explorador(a) da Cosmo',
        email: 'aluno@cosmo.edu.br',
        data_cadastro: new Date(agora() - 45 * DIA_MS).toISOString(),
      },
      sessoes: [],
      respostas: [],
    }
    if (semearHistorico) gerarHistoricoDemonstracao(base, { questoes, agora: agora(), aleatorio })
    return base
  }

  function carregar() {
    if (armazenamento) {
      try {
        const bruto = armazenamento.getItem(CHAVE_STORAGE)
        if (bruto) {
          const dados = JSON.parse(bruto)
          if (dados?.versao === 1) return dados
        }
      } catch {
        /* estado corrompido: recomeça */
      }
    }
    const novo = estadoInicial()
    salvar(novo)
    return novo
  }

  function salvar(estado = db) {
    if (!armazenamento) return
    try {
      armazenamento.setItem(CHAVE_STORAGE, JSON.stringify(estado))
    } catch {
      /* armazenamento cheio/indisponível: segue só em memória */
    }
  }

  // ------------------------------------------------------------------ utilidades

  const iso = (ms) => new Date(ms).toISOString()
  const respostasDe = (sessaoId) => db.respostas.filter((r) => r.sessao_id === sessaoId)
  const sessoesDoAluno = () => db.sessoes.filter((s) => s.aluno_id === db.aluno.id)

  function obterSessao(id) {
    const sessao = db.sessoes.find((s) => String(s.id) === String(id) && s.aluno_id === db.aluno.id)
    if (!sessao) throw new ErroHttp(404, 'SESSAO_NAO_ENCONTRADA', 'Sessão não encontrada.')
    return sessao
  }

  function numeroDaSessao(sessao) {
    return (
      sessoesDoAluno()
        .slice()
        .sort((a, b) => Date.parse(a.data_inicio) - Date.parse(b.data_inicio))
        .findIndex((s) => s.id === sessao.id) + 1
    )
  }

  function questaoPublica(q) {
    return {
      id: q.id,
      topico: { id: q.topico_id, nome: topicosPorId.get(q.topico_id)?.nome ?? 'Tópico' },
      nivel_cognitivo: q.nivel_cognitivo,
      enunciado: q.enunciado,
      codigos: q.codigos ?? [],
      alternativas: q.alternativas.map((a) => ({ id: a.id, texto: a.texto })),
    }
  }

  function justificativasDe(q) {
    return q.alternativas.map((a) => ({
      alternativa: a.id,
      texto: q.justificativas?.[a.id] ?? '',
      correta: a.id === q.alternativa_correta,
    }))
  }

  function progressoDe(sessao) {
    const respostas = respostasDe(sessao.id).sort((a, b) => a.ordem - b.ordem)
    const resumo = resumirRespostas(respostas)
    return {
      total: sessao.questao_ids.length,
      respondidas: resumo.respondidas,
      acertos: resumo.acertos,
      erros: resumo.erros,
      tempo_total_segundos: resumo.tempo_total_segundos,
      respostas: respostas.map((r) => ({ ordem: r.ordem, correta: r.correta })),
    }
  }

  function topicosDaSessao(sessao) {
    return sessao.topico_ids.map((id) => ({ id, nome: topicosPorId.get(id)?.nome ?? 'Tópico' }))
  }

  function sessaoPublica(sessao) {
    return {
      id: sessao.id,
      numero: numeroDaSessao(sessao),
      status: sessao.status,
      data_inicio: sessao.data_inicio,
      data_fim: sessao.data_fim,
      nivel_cognitivo: sessao.nivel_cognitivo,
      topicos: topicosDaSessao(sessao),
      todos_topicos: sessao.topico_ids.length === topicos.length,
      num_questoes_configuradas: sessao.num_questoes_configuradas,
      progresso: progressoDe(sessao),
    }
  }

  function resumoDaSessao(sessao) {
    const r = resumirRespostas(respostasDe(sessao.id))
    return {
      id: sessao.id,
      numero: numeroDaSessao(sessao),
      status: sessao.status,
      data_inicio: sessao.data_inicio,
      data_fim: sessao.data_fim,
      nivel_cognitivo: sessao.nivel_cognitivo,
      topicos: topicosDaSessao(sessao),
      todos_topicos: sessao.topico_ids.length === topicos.length,
      num_questoes_configuradas: sessao.num_questoes_configuradas,
      total_questoes_respondidas: r.respondidas,
      total_acertos: r.acertos,
      percentual_aproveitamento: r.percentual_aproveitamento,
      tempo_total_segundos: r.tempo_total_segundos,
    }
  }

  /** Sorteia o lote: filtra por tópico/nível, prioriza questões inéditas e intercala os tópicos. */
  function sortearLote(topicoIds, nivel, quantidade) {
    const jaRespondidas = new Set(db.respostas.map((r) => r.questao_id))
    const porTopico = topicoIds.map((tid) =>
      embaralhar(
        questoes.filter(
          (q) => q.topico_id === tid && (nivel === 'TODOS' || q.nivel_cognitivo === nivel),
        ),
      ).sort((a, b) => Number(jaRespondidas.has(a.id)) - Number(jaRespondidas.has(b.id))),
    )
    const lote = []
    let rodada = 0
    while (lote.length < quantidade && porTopico.some((lista) => rodada < lista.length)) {
      for (const lista of embaralhar(porTopico)) {
        if (rodada < lista.length && lote.length < quantidade) lote.push(lista[rodada].id)
      }
      rodada += 1
    }
    return lote
  }

  function embaralhar(lista) {
    const copia = lista.slice()
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(aleatorio() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    return copia
  }

  // ------------------------------------------------------------------ rotas

  function getAluno() {
    const respostas = db.respostas.filter((r) =>
      sessoesDoAluno().some((s) => s.id === r.sessao_id),
    )
    const r = resumirRespostas(respostas)
    return {
      ...db.aluno,
      estatisticas: {
        num_sessoes: sessoesDoAluno().length,
        tempo_total_estudo_segundos: r.tempo_total_segundos,
        taxa_acerto_global: r.respondidas ? r.percentual_aproveitamento : null,
        total_questoes_respondidas: r.respondidas,
      },
    }
  }

  function getTopicos() {
    return topicos.map((t) => ({
      id: t.id,
      nome: t.nome,
      total_questoes: questoes.filter((q) => q.topico_id === t.id).length,
    }))
  }

  function getUltimaSessao() {
    const ultima = sessoesDoAluno()
      .filter((s) => estaFinalizada(s) && respostasDe(s.id).length > 0)
      .sort((a, b) => Date.parse(b.data_inicio) - Date.parse(a.data_inicio))[0]
    return ultima ? resumoDaSessao(ultima) : null
  }

  function getSessaoEmAndamento() {
    const atual = sessoesDoAluno()
      .filter((s) => s.status === 'EM_ANDAMENTO')
      .sort((a, b) => Date.parse(b.data_inicio) - Date.parse(a.data_inicio))[0]
    return atual ? sessaoPublica(atual) : null
  }

  function postSessao(corpo) {
    const topicoIds = Array.isArray(corpo?.topico_ids) ? [...new Set(corpo.topico_ids)] : []
    const nivel = corpo?.nivel_cognitivo
    const numQuestoes = Number(corpo?.num_questoes)
    const detalhes = {}
    if (!topicoIds.length) detalhes.topico_ids = 'Selecione pelo menos um tópico.'
    if (topicoIds.some((id) => !topicosPorId.has(id))) detalhes.topico_ids = 'Tópico inexistente.'
    if (!NIVEIS_VALIDOS.includes(nivel)) detalhes.nivel_cognitivo = 'Nível cognitivo inválido.'
    if (!Number.isInteger(numQuestoes) || numQuestoes < 1 || numQuestoes > 50)
      detalhes.num_questoes = 'Informe entre 1 e 50 questões.'
    if (Object.keys(detalhes).length)
      throw new ErroHttp(422, 'PARAMETROS_INVALIDOS', 'Parâmetros da missão inválidos.', detalhes)

    const lote = sortearLote(topicoIds, nivel, numQuestoes)
    if (!lote.length)
      throw new ErroHttp(
        422,
        'SEM_QUESTOES',
        'Não há questões cadastradas para essa combinação de tópicos e nível cognitivo.',
      )

    // Uma sessão EM_ANDAMENTO anterior é considerada abandonada ao iniciar outra.
    for (const s of sessoesDoAluno()) {
      if (s.status === 'EM_ANDAMENTO') finalizar(s, 'ENCERRADA_MANUALMENTE')
    }

    const sessao = {
      id: db.proximoId.sessao++,
      aluno_id: db.aluno.id,
      data_inicio: iso(agora()),
      data_fim: null,
      status: 'EM_ANDAMENTO',
      nivel_cognitivo: nivel,
      topico_ids: topicoIds.slice().sort((a, b) => a - b),
      num_questoes_configuradas: numQuestoes,
      questao_ids: lote,
      exibicao_atual: null,
    }
    db.sessoes.push(sessao)
    salvar()
    return [201, sessaoPublica(sessao)]
  }

  function postProximaQuestao(sessaoId) {
    const sessao = obterSessao(sessaoId)
    if (sessao.status !== 'EM_ANDAMENTO')
      throw new ErroHttp(409, 'SESSAO_FINALIZADA', 'Esta sessão já foi finalizada.')

    const respondidas = respostasDe(sessao.id).length
    if (respondidas >= sessao.questao_ids.length) return null

    const ordem = respondidas + 1
    const questaoId = sessao.questao_ids[ordem - 1]
    // Idempotente: se a questão já está exibida e sem resposta, mantém o instante original.
    if (!sessao.exibicao_atual || sessao.exibicao_atual.ordem !== ordem) {
      sessao.exibicao_atual = { ordem, questao_id: questaoId, exibida_em: iso(agora()) }
      salvar()
    }
    return {
      ordem,
      total: sessao.questao_ids.length,
      exibida_em: sessao.exibicao_atual.exibida_em,
      servidor_agora: iso(agora()),
      questao: questaoPublica(questoesPorId.get(questaoId)),
    }
  }

  function postResposta(sessaoId, corpo) {
    const sessao = obterSessao(sessaoId)
    if (sessao.status !== 'EM_ANDAMENTO')
      throw new ErroHttp(409, 'SESSAO_FINALIZADA', 'Esta sessão já foi finalizada.')
    const exibicao = sessao.exibicao_atual
    if (!exibicao || String(exibicao.questao_id) !== String(corpo?.questao_id))
      throw new ErroHttp(409, 'QUESTAO_NAO_EXIBIDA', 'Esta questão não é a questão atual da sessão.')
    if (respostasDe(sessao.id).some((r) => r.ordem === exibicao.ordem))
      throw new ErroHttp(409, 'QUESTAO_JA_RESPONDIDA', 'Esta questão já foi respondida.')
    if (!LETRAS.includes(corpo?.alternativa_escolhida))
      throw new ErroHttp(422, 'ALTERNATIVA_INVALIDA', 'Alternativa inválida.')

    const questao = questoesPorId.get(exibicao.questao_id)
    const momento = agora()
    // Tempo oficial calculado no servidor: da exibição até a confirmação (Requisitos §1.1).
    const tempoGasto = Math.max(0, Math.round((momento - Date.parse(exibicao.exibida_em)) / 1000))
    const resposta = {
      id: db.proximoId.resposta++,
      sessao_id: sessao.id,
      questao_id: questao.id,
      ordem: exibicao.ordem,
      alternativa_escolhida: corpo.alternativa_escolhida,
      correta: corpo.alternativa_escolhida === questao.alternativa_correta,
      tempo_gasto_segundos: tempoGasto,
      tempo_cliente_segundos: Number(corpo.tempo_cliente_segundos) || 0,
      tempo_oculto_segundos: Number(corpo.tempo_oculto_segundos) || 0,
      timestamp_resposta: iso(momento),
    }
    db.respostas.push(resposta)
    sessao.exibicao_atual = null
    salvar()

    const progresso = progressoDe(sessao)
    return {
      resposta_id: resposta.id,
      correta: resposta.correta,
      alternativa_escolhida: resposta.alternativa_escolhida,
      alternativa_correta: questao.alternativa_correta,
      justificativas: justificativasDe(questao),
      tempo_gasto_segundos: tempoGasto,
      progresso,
      ha_proxima: progresso.respondidas < progresso.total,
    }
  }

  function finalizar(sessao, motivo) {
    if (sessao.status !== 'EM_ANDAMENTO') return
    const respostas = respostasDe(sessao.id)
    const completa = respostas.length >= sessao.questao_ids.length
    sessao.status = motivo === 'CONCLUIDA' && completa ? 'CONCLUIDA' : 'ENCERRADA_MANUALMENTE'
    const ultimaResposta = respostas.map((r) => Date.parse(r.timestamp_resposta)).sort().at(-1)
    sessao.data_fim = iso(motivo === 'CONCLUIDA' && ultimaResposta ? ultimaResposta : agora())
    sessao.exibicao_atual = null
  }

  function postFinalizar(sessaoId, corpo) {
    const sessao = obterSessao(sessaoId)
    const motivo = corpo?.motivo
    if (!['CONCLUIDA', 'ENCERRADA_MANUALMENTE'].includes(motivo))
      throw new ErroHttp(422, 'MOTIVO_INVALIDO', 'Motivo de finalização inválido.')
    finalizar(sessao, motivo) // idempotente
    salvar()
    return getResultado(sessaoId)
  }

  function getResultado(sessaoId) {
    const sessao = obterSessao(sessaoId)
    const respostas = respostasDe(sessao.id)
    const resumo = resumirRespostas(respostas)
    const desempenho = desempenhoPorTopico(respostas, questoesPorId, topicosPorId)

    const anterior = sessaoAnterior(sessao, sessoesDoAluno(), respostasDe)
    let comparacao = null
    if (anterior) {
      const ra = resumirRespostas(respostasDe(anterior.id))
      comparacao = {
        sessao_id: anterior.id,
        numero: numeroDaSessao(anterior),
        tempo_total_segundos: ra.tempo_total_segundos,
        tempo_medio_por_questao_segundos: ra.tempo_medio_por_questao_segundos,
        percentual_aproveitamento: ra.percentual_aproveitamento,
        diferenca_tempo_total_segundos: resumo.tempo_total_segundos - ra.tempo_total_segundos,
        diferenca_tempo_medio_segundos:
          resumo.tempo_medio_por_questao_segundos - ra.tempo_medio_por_questao_segundos,
      }
    }

    const ultimas = sessoesDoAluno()
      .filter(
        (s) =>
          (s.id === sessao.id || estaFinalizada(s)) &&
          Date.parse(s.data_inicio) <= Date.parse(sessao.data_inicio) &&
          respostasDe(s.id).length > 0,
      )
      .sort((a, b) => Date.parse(a.data_inicio) - Date.parse(b.data_inicio))
      .slice(-5)

    const todasRespostasDoAluno = db.respostas.filter((r) =>
      sessoesDoAluno().some((s) => s.id === r.sessao_id),
    )

    return {
      sessao: sessaoPublica(sessao),
      total_questoes_respondidas: resumo.respondidas,
      total_acertos: resumo.acertos,
      total_erros: resumo.erros,
      percentual_aproveitamento: resumo.percentual_aproveitamento,
      tempo_total_segundos: resumo.tempo_total_segundos,
      tempo_medio_por_questao_segundos: resumo.tempo_medio_por_questao_segundos,
      comparacao_sessao_anterior: comparacao,
      desempenho_por_topico: desempenho,
      ponto_de_atencao: pontoDeAtencao(desempenho),
      tempo_medio_ultimas_sessoes: ultimas.map((s) => ({
        sessao_id: s.id,
        numero: numeroDaSessao(s),
        tempo_medio_por_questao_segundos: resumirRespostas(respostasDe(s.id))
          .tempo_medio_por_questao_segundos,
      })),
      aluno: {
        num_sessoes: sessoesDoAluno().length,
        total_questoes_respondidas: todasRespostasDoAluno.length,
      },
    }
  }

  function getRespostasDaSessao(sessaoId) {
    const sessao = obterSessao(sessaoId)
    return respostasDe(sessao.id)
      .sort((a, b) => a.ordem - b.ordem)
      .map((r) => {
        const q = questoesPorId.get(r.questao_id)
        return {
          ordem: r.ordem,
          questao: questaoPublica(q),
          alternativa_escolhida: r.alternativa_escolhida,
          alternativa_correta: q.alternativa_correta,
          correta: r.correta,
          tempo_gasto_segundos: r.tempo_gasto_segundos,
          justificativas: justificativasDe(q),
        }
      })
  }

  function getHistorico(periodo) {
    if (!['7d', '30d', 'tudo'].includes(periodo))
      throw new ErroHttp(422, 'PERIODO_INVALIDO', 'Período inválido. Use 7d, 30d ou tudo.')
    const momento = agora()
    const janela = janelaDoPeriodo(periodo, momento)
    const naJanela = (s, inicio, fim) => {
      const t = Date.parse(s.data_inicio)
      return (inicio === null || t >= inicio) && t <= fim
    }

    const sessoes = sessoesDoAluno()
      .filter((s) => naJanela(s, janela.inicio, janela.fim))
      .sort((a, b) => Date.parse(b.data_inicio) - Date.parse(a.data_inicio))
    const ids = new Set(sessoes.map((s) => s.id))
    const respostas = db.respostas.filter((r) => ids.has(r.sessao_id))
    const resumo = resumirRespostas(respostas)
    const { unicas, repetidas } = unicasERepetidas(respostas)

    let variacao = null
    if (janela.dias) {
      const inicioAnterior = janela.inicio - janela.dias * DIA_MS
      const idsAnteriores = new Set(
        sessoesDoAluno()
          .filter((s) => naJanela(s, inicioAnterior, janela.inicio - 1))
          .map((s) => s.id),
      )
      const anteriores = db.respostas.filter((r) => idsAnteriores.has(r.sessao_id))
      if (anteriores.length && respostas.length) {
        const taxaAnterior = resumirRespostas(anteriores).percentual_aproveitamento
        variacao = Math.round((resumo.percentual_aproveitamento - taxaAnterior) * 10) / 10
      }
    }

    const hoje = new Date(momento)
    const sessoesMesAtual = sessoesDoAluno().filter((s) => {
      const d = new Date(s.data_inicio)
      return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth()
    }).length

    const comRespostas = sessoes.filter((s) => respostasDe(s.id).length > 0)

    return {
      periodo,
      inicio: janela.inicio === null ? null : iso(janela.inicio),
      fim: iso(janela.fim),
      estatisticas: {
        total_sessoes: sessoes.length,
        taxa_acerto_global: resumo.respondidas ? resumo.percentual_aproveitamento : null,
        tempo_total_estudo_segundos: resumo.tempo_total_segundos,
        tempo_medio_por_sessao_segundos: comRespostas.length
          ? Math.round(resumo.tempo_total_segundos / comRespostas.length)
          : 0,
        questoes_respondidas: resumo.respondidas,
        questoes_unicas: unicas,
        questoes_repetidas: repetidas,
        sessoes_mes_atual: sessoesMesAtual,
        variacao_taxa_acerto_pp: variacao,
      },
      sessoes: sessoes.map(resumoDaSessao),
      evolucao: comRespostas
        .slice()
        .reverse()
        .map((s) => ({
          sessao_id: s.id,
          numero: numeroDaSessao(s),
          data_inicio: s.data_inicio,
          percentual_aproveitamento: percentual(
            respostasDe(s.id).filter((r) => r.correta).length,
            respostasDe(s.id).length,
          ),
        })),
      desempenho_por_topico: desempenhoPorTopico(respostas, questoesPorId, topicosPorId),
    }
  }

  // ------------------------------------------------------------------ roteador

  const rotas = [
    ['GET', /^\/alunos\/me$/, () => getAluno()],
    ['GET', /^\/topicos$/, () => getTopicos()],
    ['GET', /^\/sessoes\/ultima$/, () => getUltimaSessao()],
    ['GET', /^\/sessoes\/em-andamento$/, () => getSessaoEmAndamento()],
    ['POST', /^\/sessoes$/, (_m, corpo) => postSessao(corpo)],
    ['GET', /^\/sessoes\/([^/]+)$/, (m) => sessaoPublica(obterSessao(m[1]))],
    ['POST', /^\/sessoes\/([^/]+)\/questoes\/proxima$/, (m) => postProximaQuestao(m[1])],
    ['POST', /^\/sessoes\/([^/]+)\/respostas$/, (m, corpo) => [201, postResposta(m[1], corpo)]],
    ['GET', /^\/sessoes\/([^/]+)\/respostas$/, (m) => getRespostasDaSessao(m[1])],
    ['POST', /^\/sessoes\/([^/]+)\/finalizar$/, (m, corpo) => postFinalizar(m[1], corpo)],
    ['GET', /^\/sessoes\/([^/]+)\/resultado$/, (m) => getResultado(m[1])],
    ['GET', /^\/historico$/, (_m, _c, query) => getHistorico(query.get('periodo') ?? 'tudo')],
  ]

  /**
   * @param {string} metodo
   * @param {string} url  caminho + query string
   * @param {unknown} corpo
   * @returns {{status:number, corpo:unknown}}
   */
  function tratar(metodo, url, corpo) {
    const [caminho, qs = ''] = url.split('?')
    const query = new URLSearchParams(qs)
    // Simula a serialização HTTP (garante que só dados JSON trafeguem).
    const corpoJson = corpo === undefined ? undefined : JSON.parse(JSON.stringify(corpo))
    try {
      for (const [m, padrao, handler] of rotas) {
        const achou = caminho.match(padrao)
        if (achou && m === metodo) {
          const retorno = handler(achou, corpoJson, query)
          const [status, dados] = Array.isArray(retorno) && typeof retorno[0] === 'number' && retorno.length === 2
            ? retorno
            : [retorno === null ? 204 : 200, retorno]
          return { status, corpo: dados === null ? undefined : dados }
        }
      }
      throw new ErroHttp(404, 'ROTA_NAO_ENCONTRADA', `Rota ${metodo} ${caminho} não existe.`)
    } catch (e) {
      if (e instanceof ErroHttp)
        return {
          status: e.status,
          corpo: { erro: { codigo: e.codigo, mensagem: e.message, detalhes: e.detalhes } },
        }
      throw e
    }
  }

  function redefinir() {
    db = estadoInicial()
    salvar()
  }

  return { tratar, redefinir, get estado() { return db } }
}

function obterLocalStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

// ------------------------------------------------------------------ adaptador usado pelo cliente

let instancia = null
const servidor = () => (instancia ??= criarServidorMock())

/** Apaga os dados simulados e recria o histórico de demonstração. */
export function redefinirDadosMock() {
  servidor().redefinir()
}

/**
 * Chamado por api/cliente.js no lugar de `fetch` quando VITE_API_MOCK=true.
 * @returns {Promise<Response>}
 */
export async function tratarRequisicaoMock(metodo, url, corpo, { sinal } = {}) {
  if (config.latenciaMock > 0) {
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, config.latenciaMock)
      sinal?.addEventListener('abort', () => {
        clearTimeout(t)
        reject(new DOMException('Requisição cancelada', 'AbortError'))
      })
    })
  }
  const { status, corpo: dados } = servidor().tratar(metodo, url, corpo)
  return new Response(dados === undefined ? null : JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
