import { NUM_QUESTOES_POR_SESSAO } from '../../config.js'
import { DIA_MS } from './metricas.js'

/**
 * Gera um histórico fictício (≈ 40 dias) para o aluno de demonstração, para que as telas de
 * Histórico e Resultados tenham dados já no primeiro acesso ao mock.
 * Os registros seguem exatamente o formato das tabelas SESSAO e RESPOSTA_SESSAO.
 */
export function gerarHistoricoDemonstracao(db, { questoes, agora, aleatorio }) {
  const planos = [
    // [dias atrás, hora, tópicos, taxa de acerto alvo, seg. médios, encerrada antes?]
    [38, 19, [1, 2, 3], 0.5, 70, false],
    [33, 21, [1, 2, 3, 4], 0.6, 64, false],
    [27, 9, [1, 2, 3, 4, 5, 6], 0.55, 66, false],
    [22, 14, [4, 5], 0.5, 72, true],
    [16, 20, [1, 2, 3, 4, 5, 6], 0.68, 58, false],
    [11, 10, [3, 4, 6], 0.72, 55, false],
    [6, 16, [1, 2, 3, 4, 5, 6], 0.78, 51, false],
    [3, 11, [4, 5], 0.7, 49, false],
    [1, 15, [1, 2, 3, 4, 5, 6], 0.87, 45, false],
  ]

  for (const [diasAtras, hora, topicoIds, taxa, segMedios, encerrada] of planos) {
    const dia = new Date(agora - diasAtras * DIA_MS)
    dia.setHours(hora, Math.floor(aleatorio() * 50), 0, 0)
    let instante = dia.getTime()

    const candidatas = questoes.filter((q) => topicoIds.includes(q.topico_id))
    const lote = embaralhar(candidatas, aleatorio).slice(0, NUM_QUESTOES_POR_SESSAO)
    if (!lote.length) continue

    const sessao = {
      id: db.proximoId.sessao++,
      aluno_id: db.aluno.id,
      data_inicio: new Date(instante).toISOString(),
      data_fim: null,
      status: encerrada ? 'ENCERRADA_MANUALMENTE' : 'CONCLUIDA',
      topico_ids: topicoIds,
      num_questoes_configuradas: NUM_QUESTOES_POR_SESSAO,
      questao_ids: lote.map((q) => q.id),
      exibicao_atual: null,
    }
    const respondidas = encerrada ? Math.ceil(lote.length * 0.6) : lote.length

    lote.slice(0, respondidas).forEach((q, i) => {
      // Tópicos 4 (Condicionais) e 5 (Operadores) um pouco mais difíceis, para dar um "ponto de atenção".
      const dificuldade = q.topico_id === 4 ? 0.15 : q.topico_id === 5 ? 0.08 : 0
      const correta = aleatorio() < taxa - dificuldade
      const tempo = Math.max(8, Math.round(segMedios * (0.45 + aleatorio() * 1.1) + (correta ? 0 : 12)))
      instante += tempo * 1000
      const escolhida = correta
        ? q.alternativa_correta
        : ['A', 'B', 'C', 'D'].filter((l) => l !== q.alternativa_correta)[Math.floor(aleatorio() * 3)]
      db.respostas.push({
        id: db.proximoId.resposta++,
        sessao_id: sessao.id,
        questao_id: q.id,
        ordem: i + 1,
        alternativa_escolhida: escolhida,
        correta,
        tempo_gasto_segundos: tempo,
        tempo_cliente_segundos: tempo,
        tempo_oculto_segundos: 0,
        timestamp_resposta: new Date(instante).toISOString(),
      })
      instante += 6000 // leitura do feedback: não entra no tempo da questão
    })
    sessao.data_fim = new Date(instante).toISOString()
    db.sessoes.push(sessao)
  }
}

function embaralhar(lista, aleatorio) {
  const copia = lista.slice()
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
