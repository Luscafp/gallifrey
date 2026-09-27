/**
 * Configuração em tempo de build (variáveis VITE_* — ver .env.example).
 */
const env = import.meta.env

function booleano(valor, padrao) {
  if (valor === undefined || valor === '') return padrao
  return String(valor).toLowerCase() === 'true'
}

export const config = {
  apiUrl: (env.VITE_API_URL || '/api').replace(/\/$/, ''),
  usarMock: booleano(env.VITE_API_MOCK, true),
  latenciaMock: Number(env.VITE_API_MOCK_LATENCIA ?? 250),
  basePath: env.BASE_URL || '/',
  chaveToken: env.VITE_AUTH_TOKEN_KEY || 'cosmo_token',
  pausarCronometroAbaOculta: booleano(env.VITE_PAUSAR_CRONOMETRO_ABA_OCULTA, false),
}

/**
 * Quantidade fixa de questões por missão (o aluno não escolhe). Quem aplica é o backend; o frontend
 * usa este valor só no resumo da configuração e o mock o usa no sorteio. Manter igual ao do backend.
 */
export const NUM_QUESTOES_POR_SESSAO = 10

/** Estimativa usada no "Tempo estimado" do resumo da configuração. */
export const SEGUNDOS_ESTIMADOS_POR_QUESTAO = 90
