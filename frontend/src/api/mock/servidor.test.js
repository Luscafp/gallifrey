import { beforeEach, describe, expect, it } from 'vitest'
import { criarServidorMock } from './servidor.js'
import { pontoDeAtencao, resumirRespostas, unicasERepetidas } from './metricas.js'
import questoes from './data/questoes.json'

/** Servidor em memória com relógio controlado. */
function montar({ semearHistorico = false } = {}) {
  let agora = Date.parse('2026-04-20T12:00:00Z')
  const srv = criarServidorMock({
    armazenamento: null,
    agora: () => agora,
    aleatorio: sequencia(),
    semearHistorico,
  })
  const chamar = (metodo, url, corpo) => srv.tratar(metodo, url, corpo)
  const avancar = (segundos) => {
    agora += segundos * 1000
  }
  return { srv, chamar, avancar }
}

function sequencia(semente = 42) {
  let s = semente
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const gabarito = (id) => questoes.find((q) => q.id === id).alternativa_correta
const errada = (id) => ['A', 'B', 'C', 'D'].find((l) => l !== gabarito(id))

describe('POST /sessoes (Critérios §3.1)', () => {
  let api
  beforeEach(() => {
    api = montar()
  })

  it('exige ao menos um tópico', () => {
    const r = api.chamar('POST', '/sessoes', { topico_ids: [], num_questoes: 5 })
    expect(r.status).toBe(422)
    expect(r.corpo.erro.detalhes.topico_ids).toBeTruthy()
  })

  it('só incrementa o nº de sessões ao iniciar', () => {
    expect(api.chamar('GET', '/alunos/me').corpo.estatisticas.num_sessoes).toBe(0)
    api.chamar('GET', '/topicos') // configurar não cria nada
    const r = api.chamar('POST', '/sessoes', { topico_ids: [1, 2], num_questoes: 5 })
    expect(r.status).toBe(201)
    expect(r.corpo.numero).toBe(1)
    expect(r.corpo.data_inicio).toBe('2026-04-20T12:00:00.000Z')
    expect(api.chamar('GET', '/alunos/me').corpo.estatisticas.num_sessoes).toBe(1)
  })

  it('filtra o lote por tópico e mistura todos os níveis cognitivos', () => {
    const { corpo } = api.chamar('POST', '/sessoes', { topico_ids: [4], num_questoes: 20 })
    const ids = api.srv.estado.sessoes.find((s) => s.id === corpo.id).questao_ids
    expect(ids.length).toBe(10) // só 10 questões de Condicionais (5 Análise + 5 Avaliação) no banco de exemplo
    expect(corpo.progresso.total).toBe(10)
    expect(corpo).not.toHaveProperty('nivel_cognitivo')
    const niveis = new Set()
    for (const id of ids) {
      const q = questoes.find((x) => x.id === id)
      expect(q.topico_id).toBe(4)
      niveis.add(q.nivel_cognitivo)
    }
    expect([...niveis].sort()).toEqual(['ANALISE', 'AVALIACAO'])
  })
})

describe('Fluxo de resolução (Critérios §3.2)', () => {
  it('não envia gabarito antes da resposta e calcula o tempo no servidor', () => {
    const api = montar()
    const sessao = api.chamar('POST', '/sessoes', { topico_ids: [1], num_questoes: 3 }).corpo
    const exibida = api.chamar('POST', `/sessoes/${sessao.id}/questoes/proxima`).corpo
    expect(exibida.ordem).toBe(1)
    expect(JSON.stringify(exibida)).not.toMatch(/alternativa_correta|justificativa/)

    api.avancar(30)
    // idempotente: mesma questão, mesmo instante de exibição
    const denovo = api.chamar('POST', `/sessoes/${sessao.id}/questoes/proxima`).corpo
    expect(denovo.questao.id).toBe(exibida.questao.id)
    expect(denovo.exibida_em).toBe(exibida.exibida_em)

    api.avancar(77)
    const r = api.chamar('POST', `/sessoes/${sessao.id}/respostas`, {
      questao_id: exibida.questao.id,
      alternativa_escolhida: gabarito(exibida.questao.id),
      tempo_cliente_segundos: 999, // o cliente não define o tempo oficial
      tempo_oculto_segundos: 0,
    })
    expect(r.status).toBe(201)
    expect(r.corpo.correta).toBe(true)
    expect(r.corpo.tempo_gasto_segundos).toBe(107)
    expect(r.corpo.justificativas).toHaveLength(4)
    expect(r.corpo.justificativas.filter((j) => j.correta)).toHaveLength(1)
    expect(r.corpo.progresso).toMatchObject({ respondidas: 1, acertos: 1, tempo_total_segundos: 107 })
  })

  it('rejeita resposta duplicada', () => {
    const api = montar()
    const s = api.chamar('POST', '/sessoes', { topico_ids: [1], num_questoes: 2 }).corpo
    const q = api.chamar('POST', `/sessoes/${s.id}/questoes/proxima`).corpo.questao
    const corpo = { questao_id: q.id, alternativa_escolhida: 'A', tempo_cliente_segundos: 1, tempo_oculto_segundos: 0 }
    expect(api.chamar('POST', `/sessoes/${s.id}/respostas`, corpo).status).toBe(201)
    expect(api.chamar('POST', `/sessoes/${s.id}/respostas`, corpo).status).toBe(409)
  })

  it('encerrar antes do fim preserva as respostas e calcula só com elas', () => {
    const api = montar()
    const s = api.chamar('POST', '/sessoes', { topico_ids: [1, 4], num_questoes: 10 }).corpo
    const tempos = [40, 60, 20]
    tempos.forEach((t, i) => {
      const q = api.chamar('POST', `/sessoes/${s.id}/questoes/proxima`).corpo.questao
      api.avancar(t)
      api.chamar('POST', `/sessoes/${s.id}/respostas`, {
        questao_id: q.id,
        alternativa_escolhida: i === 1 ? errada(q.id) : gabarito(q.id),
        tempo_cliente_segundos: t,
        tempo_oculto_segundos: 0,
      })
      api.avancar(15) // lendo o feedback: não conta
    })
    const res = api.chamar('POST', `/sessoes/${s.id}/finalizar`, { motivo: 'ENCERRADA_MANUALMENTE' }).corpo
    expect(res.sessao.status).toBe('ENCERRADA_MANUALMENTE')
    expect(res.total_questoes_respondidas).toBe(3)
    expect(res.total_acertos).toBe(2)
    expect(res.total_erros).toBe(1)
    expect(res.percentual_aproveitamento).toBe(66.7)
    expect(res.tempo_total_segundos).toBe(120)
    expect(res.tempo_medio_por_questao_segundos).toBe(40)
    expect(res.ponto_de_atencao).not.toBeNull()
    // resultado reaberto depois traz os mesmos números (Critérios §3.4)
    expect(api.chamar('GET', `/sessoes/${s.id}/resultado`).corpo).toEqual(res)
    // não aceita mais respostas
    expect(api.chamar('POST', `/sessoes/${s.id}/questoes/proxima`).status).toBe(409)
  })
})

describe('Resultados e histórico (Critérios §3.3 e §3.4)', () => {
  it('compara com a sessão finalizada imediatamente anterior', () => {
    const api = montar()
    const jogar = (tempo) => {
      const s = api.chamar('POST', '/sessoes', { topico_ids: [2], num_questoes: 2 }).corpo
      for (;;) {
        const r = api.chamar('POST', `/sessoes/${s.id}/questoes/proxima`)
        if (r.status === 204) break
        api.avancar(tempo)
        api.chamar('POST', `/sessoes/${s.id}/respostas`, {
          questao_id: r.corpo.questao.id,
          alternativa_escolhida: gabarito(r.corpo.questao.id),
          tempo_cliente_segundos: tempo,
          tempo_oculto_segundos: 0,
        })
      }
      return api.chamar('POST', `/sessoes/${s.id}/finalizar`, { motivo: 'CONCLUIDA' }).corpo
    }
    const primeira = jogar(50)
    expect(primeira.comparacao_sessao_anterior).toBeNull()
    expect(primeira.sessao.status).toBe('CONCLUIDA')
    api.avancar(3600)
    const segunda = jogar(30)
    expect(segunda.comparacao_sessao_anterior).toMatchObject({
      numero: 1,
      diferenca_tempo_total_segundos: -40,
      diferenca_tempo_medio_segundos: -20,
    })
    expect(segunda.tempo_medio_ultimas_sessoes.map((s) => s.numero)).toEqual([1, 2])
    expect(segunda.aluno.num_sessoes).toBe(2)
  })

  it('histórico: filtros recalculam tudo de forma consistente', () => {
    const api = montar({ semearHistorico: true })
    const tudo = api.chamar('GET', '/historico?periodo=tudo').corpo
    const sete = api.chamar('GET', '/historico?periodo=7d').corpo
    expect(tudo.estatisticas.total_sessoes).toBe(tudo.sessoes.length)
    expect(sete.estatisticas.total_sessoes).toBe(sete.sessoes.length)
    expect(sete.sessoes.length).toBeLessThan(tudo.sessoes.length)
    // mais recente primeiro
    const datas = tudo.sessoes.map((s) => Date.parse(s.data_inicio))
    expect([...datas].sort((a, b) => b - a)).toEqual(datas)
    // evolução cronológica
    const evol = tudo.evolucao.map((e) => Date.parse(e.data_inicio))
    expect([...evol].sort((a, b) => a - b)).toEqual(evol)
    // únicas + repetidas = respondidas
    const e = tudo.estatisticas
    expect(e.questoes_unicas + e.questoes_repetidas).toBe(e.questoes_respondidas)
    // soma por tópico = total de respostas
    expect(tudo.desempenho_por_topico.reduce((s, t) => s + t.respondidas, 0)).toBe(e.questoes_respondidas)
    expect(api.chamar('GET', '/historico?periodo=ontem').status).toBe(422)
  })
})

describe('metricas', () => {
  it('ponto de atenção usa a maior PROPORÇÃO de erros', () => {
    const p = pontoDeAtencao([
      { topico_id: 1, nome: 'A', respondidas: 10, acertos: 6, erros: 4, percentual_acerto: 60 },
      { topico_id: 2, nome: 'B', respondidas: 2, acertos: 0, erros: 2, percentual_acerto: 0 },
    ])
    expect(p.nome).toBe('B')
    expect(pontoDeAtencao([{ topico_id: 1, nome: 'A', respondidas: 3, acertos: 3, erros: 0 }])).toBeNull()
  })

  it('resumo sem respostas não divide por zero', () => {
    expect(resumirRespostas([])).toMatchObject({ percentual_aproveitamento: 0, tempo_medio_por_questao_segundos: 0 })
  })

  it('únicas vs repetidas', () => {
    expect(unicasERepetidas([{ questao_id: 1 }, { questao_id: 1 }, { questao_id: 2 }])).toEqual({
      unicas: 2,
      repetidas: 1,
    })
  })
})
