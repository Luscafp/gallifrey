/**
 * Cálculo das métricas do Gallifrey a partir dos registros brutos.
 *
 * Este módulo é a implementação de referência das regras de negócio descritas em
 * "Documentação Funcional" §3.4/§3.5 e "Requisitos Técnicos" §3.3/§3.4. Ele é usado pelo
 * backend simulado e coberto por testes — o backend real deve produzir os mesmos números.
 *
 * Princípio (Requisitos §1.1 e §2.3): nada é armazenado agregado; tudo deriva de RespostaSessao.
 */

export const DIA_MS = 24 * 60 * 60 * 1000

/** @param {number} parte @param {number} total */
export function percentual(parte, total) {
  if (!total) return 0
  return Math.round((parte / total) * 1000) / 10
}

/**
 * Resumo numérico de um conjunto de respostas.
 * @param {{correta:boolean, tempo_gasto_segundos:number}[]} respostas
 */
export function resumirRespostas(respostas) {
  const respondidas = respostas.length
  const acertos = respostas.filter((r) => r.correta).length
  const tempoTotal = respostas.reduce((soma, r) => soma + r.tempo_gasto_segundos, 0)
  return {
    respondidas,
    acertos,
    erros: respondidas - acertos,
    percentual_aproveitamento: percentual(acertos, respondidas),
    tempo_total_segundos: tempoTotal,
    tempo_medio_por_questao_segundos: respondidas ? Math.round(tempoTotal / respondidas) : 0,
  }
}

/**
 * Agrupa acertos/erros por tópico. Só entram tópicos com ao menos uma resposta.
 * @param {{questao_id:any, correta:boolean}[]} respostas
 * @param {Map<any, {topico_id:any}>} questoesPorId
 * @param {Map<any, {id:any, nome:string}>} topicosPorId
 */
export function desempenhoPorTopico(respostas, questoesPorId, topicosPorId) {
  const grupos = new Map()
  for (const r of respostas) {
    const topicoId = questoesPorId.get(r.questao_id)?.topico_id
    if (topicoId === undefined) continue
    const g = grupos.get(topicoId) ?? { respondidas: 0, acertos: 0 }
    g.respondidas += 1
    if (r.correta) g.acertos += 1
    grupos.set(topicoId, g)
  }
  return [...grupos.entries()]
    .map(([topicoId, g]) => ({
      topico_id: topicoId,
      nome: topicosPorId.get(topicoId)?.nome ?? 'Tópico',
      respondidas: g.respondidas,
      acertos: g.acertos,
      erros: g.respondidas - g.acertos,
      percentual_acerto: percentual(g.acertos, g.respondidas),
    }))
    .sort((a, b) => compararIds(a.topico_id, b.topico_id))
}

/**
 * "Ponto de atenção": tópico com a MAIOR PROPORÇÃO de erros (Critério §3.3).
 * Desempate: mais erros absolutos, depois mais questões respondidas. Null se não houve erros.
 * @param {ReturnType<typeof desempenhoPorTopico>} desempenho
 */
export function pontoDeAtencao(desempenho) {
  const candidatos = desempenho.filter((t) => t.erros > 0)
  if (!candidatos.length) return null
  candidatos.sort(
    (a, b) =>
      b.erros / b.respondidas - a.erros / a.respondidas ||
      b.erros - a.erros ||
      b.respondidas - a.respondidas,
  )
  const t = candidatos[0]
  return {
    topico_id: t.topico_id,
    nome: t.nome,
    erros: t.erros,
    respondidas: t.respondidas,
    percentual_erro: percentual(t.erros, t.respondidas),
  }
}

/** Sessões finalizadas (concluídas ou encerradas manualmente). */
export function estaFinalizada(sessao) {
  return sessao.status === 'CONCLUIDA' || sessao.status === 'ENCERRADA_MANUALMENTE'
}

/**
 * Sessão finalizada imediatamente anterior do mesmo aluno, com pelo menos uma resposta.
 * @param {any} sessao
 * @param {any[]} sessoesDoAluno
 * @param {(sessaoId:any) => any[]} respostasDe
 */
export function sessaoAnterior(sessao, sessoesDoAluno, respostasDe) {
  return (
    sessoesDoAluno
      .filter(
        (s) =>
          s.id !== sessao.id &&
          estaFinalizada(s) &&
          Date.parse(s.data_inicio) < Date.parse(sessao.data_inicio) &&
          respostasDe(s.id).length > 0,
      )
      .sort((a, b) => Date.parse(b.data_inicio) - Date.parse(a.data_inicio))[0] ?? null
  )
}

/** Janela de tempo do filtro do Histórico. `agora` em ms. */
export function janelaDoPeriodo(periodo, agora) {
  if (periodo === '7d') return { inicio: agora - 7 * DIA_MS, fim: agora, dias: 7 }
  if (periodo === '30d') return { inicio: agora - 30 * DIA_MS, fim: agora, dias: 30 }
  return { inicio: null, fim: agora, dias: null }
}

/**
 * Questões únicas vs. repetidas (ponto em aberto na doc §6 — regra adotada):
 * únicas = nº de questões distintas respondidas no período; repetidas = total de respostas − únicas.
 * @param {{questao_id:any}[]} respostas
 */
export function unicasERepetidas(respostas) {
  const unicas = new Set(respostas.map((r) => r.questao_id)).size
  return { unicas, repetidas: respostas.length - unicas }
}

function compararIds(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true })
}
