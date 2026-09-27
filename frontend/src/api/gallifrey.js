import { requisicao } from './cliente.js'

/**
 * Funções de acesso à API do Gallifrey — uma por rota de docs/contrato-api.md.
 * As páginas nunca chamam `fetch` diretamente: sempre passam por aqui.
 */

/** @returns {Promise<import('./tipos.js').Aluno>} */
export const buscarAlunoAtual = (sinal) => requisicao('GET', '/alunos/me', { sinal })

/** @returns {Promise<import('./tipos.js').Topico[]>} */
export const listarTopicos = (sinal) => requisicao('GET', '/topicos', { sinal })

/**
 * Última sessão finalizada do aluno (card "Última sessão" da configuração).
 * @returns {Promise<import('./tipos.js').SessaoResumo | null>}
 */
export const buscarUltimaSessao = (sinal) => requisicao('GET', '/sessoes/ultima', { sinal })

/**
 * Sessão EM_ANDAMENTO do aluno, se houver (permite "Continuar missão" após fechar a aba).
 * @returns {Promise<import('./tipos.js').Sessao | null>}
 */
export const buscarSessaoEmAndamento = (sinal) =>
  requisicao('GET', '/sessoes/em-andamento', { sinal })

/**
 * Cria a sessão — ÚNICO momento em que o contador de sessões é incrementado.
 * O lote sempre mistura questões de todos os níveis cognitivos.
 * @param {{ topico_ids: import('./tipos.js').Id[], num_questoes: number }} parametros
 * @returns {Promise<import('./tipos.js').Sessao>}
 */
export const iniciarSessao = (parametros) => requisicao('POST', '/sessoes', { corpo: parametros })

/** @returns {Promise<import('./tipos.js').Sessao>} */
export const buscarSessao = (sessaoId, sinal) => requisicao('GET', `/sessoes/${sessaoId}`, { sinal })

/**
 * Exibe a próxima questão (o servidor registra `exibida_em`). Idempotente: se a questão atual
 * ainda não foi respondida, devolve a mesma. Retorna null quando não há mais questões.
 * @returns {Promise<import('./tipos.js').QuestaoDaSessao | null>}
 */
export const exibirProximaQuestao = (sessaoId) =>
  requisicao('POST', `/sessoes/${sessaoId}/questoes/proxima`)

/**
 * Registra a resposta assim que confirmada (persistência incremental).
 * @param {import('./tipos.js').NovaResposta} resposta
 * @returns {Promise<import('./tipos.js').ResultadoResposta>}
 */
export const registrarResposta = (sessaoId, resposta) =>
  requisicao('POST', `/sessoes/${sessaoId}/respostas`, { corpo: resposta })

/**
 * Finaliza a sessão (conclusão ou "Encerrar sessão") e devolve as métricas calculadas.
 * @param {import('./tipos.js').MotivoFinalizacao} motivo
 * @returns {Promise<import('./tipos.js').ResultadoSessao>}
 */
export const finalizarSessao = (sessaoId, motivo) =>
  requisicao('POST', `/sessoes/${sessaoId}/finalizar`, { corpo: { motivo } })

/** @returns {Promise<import('./tipos.js').ResultadoSessao>} */
export const buscarResultado = (sessaoId, sinal) =>
  requisicao('GET', `/sessoes/${sessaoId}/resultado`, { sinal })

/** @returns {Promise<import('./tipos.js').RespostaRevisada[]>} */
export const listarRespostasDaSessao = (sessaoId, sinal) =>
  requisicao('GET', `/sessoes/${sessaoId}/respostas`, { sinal })

/**
 * @param {import('./tipos.js').PeriodoHistorico} periodo
 * @returns {Promise<import('./tipos.js').Historico>}
 */
export const buscarHistorico = (periodo, sinal) =>
  requisicao('GET', '/historico', { query: { periodo }, sinal })
