import { config } from '../config.js'

/**
 * Erro padronizado das chamadas à API.
 * O backend deve responder erros no formato: { "erro": { "codigo": "...", "mensagem": "...", "detalhes": {...} } }
 */
export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} codigo
   * @param {string} mensagem
   * @param {unknown} [detalhes]
   */
  constructor(status, codigo, mensagem, detalhes) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.detalhes = detalhes
  }
}

/**
 * Obtém o token do aluno autenticado na Cosmo.
 * Pode ser substituído pela integração real (ex.: contexto de auth da Cosmo) via `definirProvedorDeToken`.
 * @type {() => string | null}
 */
let provedorDeToken = () => {
  try {
    return localStorage.getItem(config.chaveToken)
  } catch {
    return null
  }
}

/** @param {() => string | null} fn */
export function definirProvedorDeToken(fn) {
  provedorDeToken = fn
}

/** Handler do mock carregado sob demanda (fica fora do bundle de produção quando VITE_API_MOCK=false). */
let mockPromise = null
function carregarMock() {
  mockPromise ??= import('./mock/servidor.js')
  return mockPromise
}

/**
 * Faz uma requisição JSON à API do Gallifrey.
 * @template T
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} metodo
 * @param {string} caminho  ex.: "/sessoes/12/resultado"
 * @param {{ corpo?: unknown, query?: Record<string, string|number|undefined>, sinal?: AbortSignal }} [opcoes]
 * @returns {Promise<T>}
 */
export async function requisicao(metodo, caminho, opcoes = {}) {
  const { corpo, query, sinal } = opcoes
  const qs = query
    ? '?' +
      new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''

  if (config.usarMock) {
    const { tratarRequisicaoMock } = await carregarMock()
    const resposta = await tratarRequisicaoMock(metodo, caminho + qs, corpo, { sinal })
    return lerResposta(resposta)
  }

  const headers = { Accept: 'application/json' }
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'
  const token = provedorDeToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(config.apiUrl + caminho + qs, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      credentials: 'include',
      signal: sinal,
    })
  } catch (e) {
    if (e?.name === 'AbortError') throw e
    throw new ApiError(0, 'SEM_CONEXAO', 'Não foi possível falar com o servidor. Verifique sua conexão.')
  }
  return lerResposta(resposta)
}

/** @param {Response} resposta */
async function lerResposta(resposta) {
  if (resposta.status === 204) return null
  const texto = await resposta.text()
  let dados = null
  if (texto) {
    try {
      dados = JSON.parse(texto)
    } catch {
      dados = null
    }
  }
  if (!resposta.ok) {
    const erro = dados?.erro ?? {}
    throw new ApiError(
      resposta.status,
      erro.codigo || `HTTP_${resposta.status}`,
      erro.mensagem || mensagemPadrao(resposta.status),
      erro.detalhes,
    )
  }
  return dados
}

function mensagemPadrao(status) {
  if (status === 401) return 'Sua sessão na Cosmo expirou. Entre novamente.'
  if (status === 403) return 'Você não tem acesso a este conteúdo.'
  if (status === 404) return 'Não encontramos o que você procurava.'
  if (status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.'
  return 'Algo deu errado na comunicação com o servidor.'
}
