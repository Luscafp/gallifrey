/**
 * Tipos do contrato entre o frontend e o backend do Gallifrey.
 * A especificação completa (rotas, códigos de erro, regras) está em docs/contrato-api.md.
 *
 * Convenções:
 *  - JSON em snake_case, nomes em português (seguindo a modelagem de dados do projeto).
 *  - Datas em ISO 8601 UTC (ex.: "2026-04-20T17:32:00Z"); o frontend converte para o fuso local só na exibição.
 *  - Durações sempre em segundos inteiros (sufixo `_segundos`).
 *  - Percentuais de 0 a 100 (número, até 1 casa decimal).
 *  - IDs são opacos para o frontend (number ou string).
 */

/** @typedef {number|string} Id */

/** @typedef {'ANALISE'|'AVALIACAO'} NivelCognitivo */
/** @typedef {NivelCognitivo|'TODOS'} FiltroNivelCognitivo */
/** @typedef {'EM_ANDAMENTO'|'CONCLUIDA'|'ENCERRADA_MANUALMENTE'} StatusSessao */
/** @typedef {'CONCLUIDA'|'ENCERRADA_MANUALMENTE'} MotivoFinalizacao */
/** @typedef {'7d'|'30d'|'tudo'} PeriodoHistorico */
/** @typedef {'A'|'B'|'C'|'D'} LetraAlternativa */

/**
 * @typedef {Object} Aluno
 * @property {Id} id
 * @property {string} nome
 * @property {string} email
 * @property {string} data_cadastro
 * @property {EstatisticasAluno} estatisticas
 */

/**
 * Contadores globais — sempre DERIVADOS de RespostaSessao no backend.
 * @typedef {Object} EstatisticasAluno
 * @property {number} num_sessoes
 * @property {number} tempo_total_estudo_segundos
 * @property {number|null} taxa_acerto_global  null quando ainda não há respostas
 * @property {number} total_questoes_respondidas
 */

/**
 * @typedef {Object} Topico
 * @property {Id} id
 * @property {string} nome
 * @property {number} [total_questoes]  quantidade de questões cadastradas (opcional)
 */

/**
 * @typedef {Object} TrechoCodigo
 * @property {string} rotulo      ex.: "Código A"
 * @property {string} linguagem   ex.: "python"
 * @property {string} conteudo
 */

/**
 * @typedef {Object} Alternativa
 * @property {LetraAlternativa} id
 * @property {string} texto  pode conter `código inline` entre crases
 */

/**
 * Questão como enviada ANTES da resposta — nunca contém gabarito nem justificativas.
 * @typedef {Object} QuestaoPublica
 * @property {Id} id
 * @property {Topico} topico
 * @property {NivelCognitivo} nivel_cognitivo
 * @property {string} enunciado
 * @property {TrechoCodigo[]} codigos
 * @property {Alternativa[]} alternativas
 */

/**
 * @typedef {Object} Justificativa
 * @property {LetraAlternativa} alternativa
 * @property {string} texto
 * @property {boolean} correta
 */

/**
 * @typedef {Object} Progresso
 * @property {number} total           questões previstas no lote da sessão
 * @property {number} respondidas
 * @property {number} acertos
 * @property {number} erros
 * @property {number} tempo_total_segundos  soma dos tempo_gasto_segundos já registrados
 * @property {{ordem:number, correta:boolean}[]} respostas  uma entrada por questão respondida, na ordem
 */

/**
 * @typedef {Object} Sessao
 * @property {Id} id
 * @property {number} numero                ordinal da sessão para o aluno (1ª, 2ª, ...)
 * @property {StatusSessao} status
 * @property {string} data_inicio
 * @property {string|null} data_fim
 * @property {FiltroNivelCognitivo} nivel_cognitivo
 * @property {Topico[]} topicos
 * @property {boolean} todos_topicos        true quando todos os tópicos existentes foram selecionados
 * @property {number} num_questoes_configuradas
 * @property {Progresso} progresso
 */

/**
 * Resposta de POST /sessoes/{id}/questoes/proxima.
 * @typedef {Object} QuestaoDaSessao
 * @property {number} ordem           posição 1-based dentro da sessão
 * @property {number} total
 * @property {string} exibida_em      instante (servidor) em que a questão foi exibida — início do cronômetro
 * @property {string} servidor_agora  relógio do servidor, para corrigir diferença com o relógio do aluno
 * @property {QuestaoPublica} questao
 */

/**
 * Corpo de POST /sessoes/{id}/respostas.
 * @typedef {Object} NovaResposta
 * @property {Id} questao_id
 * @property {LetraAlternativa} alternativa_escolhida
 * @property {number} tempo_cliente_segundos  medido no navegador (referência; o oficial é calculado no servidor)
 * @property {number} tempo_oculto_segundos   tempo em que a aba ficou oculta durante a questão
 */

/**
 * @typedef {Object} ResultadoResposta
 * @property {Id} resposta_id
 * @property {boolean} correta
 * @property {LetraAlternativa} alternativa_escolhida
 * @property {LetraAlternativa} alternativa_correta
 * @property {Justificativa[]} justificativas
 * @property {number} tempo_gasto_segundos    valor oficial (servidor)
 * @property {Progresso} progresso
 * @property {boolean} ha_proxima             false quando a última questão do lote foi respondida
 */

/**
 * @typedef {Object} DesempenhoTopico
 * @property {Id} topico_id
 * @property {string} nome
 * @property {number} respondidas
 * @property {number} acertos
 * @property {number} erros
 * @property {number} percentual_acerto
 */

/**
 * @typedef {Object} PontoDeAtencao
 * @property {Id} topico_id
 * @property {string} nome
 * @property {number} erros
 * @property {number} respondidas
 * @property {number} percentual_erro
 */

/**
 * @typedef {Object} ComparacaoSessaoAnterior
 * @property {Id} sessao_id
 * @property {number} numero
 * @property {number} tempo_total_segundos
 * @property {number} tempo_medio_por_questao_segundos
 * @property {number} percentual_aproveitamento
 * @property {number} diferenca_tempo_total_segundos   atual − anterior (negativo = mais rápido)
 * @property {number} diferenca_tempo_medio_segundos   atual − anterior (negativo = mais rápido)
 */

/**
 * GET /sessoes/{id}/resultado (e retorno de POST /sessoes/{id}/finalizar).
 * @typedef {Object} ResultadoSessao
 * @property {Sessao} sessao
 * @property {number} total_questoes_respondidas
 * @property {number} total_acertos
 * @property {number} total_erros
 * @property {number} percentual_aproveitamento
 * @property {number} tempo_total_segundos
 * @property {number} tempo_medio_por_questao_segundos
 * @property {ComparacaoSessaoAnterior|null} comparacao_sessao_anterior
 * @property {DesempenhoTopico[]} desempenho_por_topico
 * @property {PontoDeAtencao|null} ponto_de_atencao
 * @property {{sessao_id:Id, numero:number, tempo_medio_por_questao_segundos:number}[]} tempo_medio_ultimas_sessoes  até 5, cronológico, incluindo a atual
 * @property {{num_sessoes:number, total_questoes_respondidas:number}} aluno
 */

/**
 * Item de GET /sessoes/{id}/respostas (revisão "Ver todas as questões").
 * @typedef {Object} RespostaRevisada
 * @property {number} ordem
 * @property {QuestaoPublica} questao
 * @property {LetraAlternativa} alternativa_escolhida
 * @property {LetraAlternativa} alternativa_correta
 * @property {boolean} correta
 * @property {number} tempo_gasto_segundos
 * @property {Justificativa[]} justificativas
 */

/**
 * @typedef {Object} SessaoResumo
 * @property {Id} id
 * @property {number} numero
 * @property {StatusSessao} status
 * @property {string} data_inicio
 * @property {string|null} data_fim
 * @property {FiltroNivelCognitivo} nivel_cognitivo
 * @property {Topico[]} topicos
 * @property {boolean} todos_topicos
 * @property {number} num_questoes_configuradas
 * @property {number} total_questoes_respondidas
 * @property {number} total_acertos
 * @property {number} percentual_aproveitamento
 * @property {number} tempo_total_segundos
 */

/**
 * GET /historico?periodo=
 * @typedef {Object} Historico
 * @property {PeriodoHistorico} periodo
 * @property {string|null} inicio   início da janela (null para "tudo")
 * @property {string} fim
 * @property {{
 *   total_sessoes:number,
 *   taxa_acerto_global:number|null,
 *   tempo_total_estudo_segundos:number,
 *   tempo_medio_por_sessao_segundos:number,
 *   questoes_respondidas:number,
 *   questoes_unicas:number,
 *   questoes_repetidas:number,
 *   sessoes_mes_atual:number,
 *   variacao_taxa_acerto_pp:number|null
 * }} estatisticas
 * @property {SessaoResumo[]} sessoes   da mais recente para a mais antiga
 * @property {{sessao_id:Id, numero:number, data_inicio:string, percentual_aproveitamento:number}[]} evolucao  cronológica
 * @property {DesempenhoTopico[]} desempenho_por_topico
 */

export {}
