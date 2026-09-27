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

/** Opções de quantidade de questões por missão (vira `num_questoes` em POST /sessoes). */
export const OPCOES_NUM_QUESTOES = [5, 10, 15, 20]
export const NUM_QUESTOES_PADRAO = 10

/** Estimativa usada no "Tempo estimado" do resumo da configuração. */
export const SEGUNDOS_ESTIMADOS_POR_QUESTAO = 90
