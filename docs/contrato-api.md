# Contrato da API — Gallifrey

Este documento define a interface entre o **frontend** (este repositório, pasta `frontend/`) e o **backend** do Gallifrey.
Ele deriva da *Documentação Funcional*, dos *Requisitos Técnicos* e dos diagramas em `docs/diagramas/`.

O frontend já funciona de ponta a ponta contra um **backend simulado** (`frontend/src/api/mock/`), que implementa
exatamente este contrato. Ele é a referência executável: na dúvida sobre um cálculo, veja
`frontend/src/api/mock/metricas.js` (coberto por testes em `frontend/src/api/mock/*.test.js`).

---

## 1. Convenções

| Item | Regra |
|---|---|
| Base URL | `VITE_API_URL` (padrão `/api`). Todas as rotas abaixo são relativas a ela. |
| Formato | JSON (`Content-Type: application/json`), chaves em `snake_case`, nomes em português. |
| Autenticação | Feita pela **Cosmo**. O frontend envia `Authorization: Bearer <token>` (token lido do `localStorage`, chave `VITE_AUTH_TOKEN_KEY`, padrão `cosmo_token`) **e** `credentials: 'include'` (cookies). O backend aceita o que a Cosmo usar. Sem aluno autenticado → `401`. |
| Datas | ISO 8601 em **UTC** com `Z` (ex.: `2026-04-20T17:32:00Z`). O frontend converte para o fuso do aluno só na exibição. |
| Durações | Sempre **segundos inteiros**, campos com sufixo `_segundos`. |
| Percentuais | Número de 0 a 100, até 1 casa decimal (ex.: `78.5`). |
| IDs | Opacos para o frontend (inteiro ou string). |
| Enums | `nivel_cognitivo` (só na questão): `ANALISE`, `AVALIACAO`. A sessão não filtra por nível: toda sessão mistura todos os níveis. `status` da sessão: `EM_ANDAMENTO`, `CONCLUIDA`, `ENCERRADA_MANUALMENTE`. `periodo`: `7d`, `30d`, `tudo`. Alternativas: `A`, `B`, `C`, `D`. |
| Vazio | Quando "não há" o recurso (ex.: nenhuma sessão em andamento), responder **`204 No Content`**. |

### Formato de erro

Qualquer status ≥ 400:

```json
{ "erro": { "codigo": "PARAMETROS_INVALIDOS", "mensagem": "Selecione pelo menos um tópico.", "detalhes": { "topico_ids": "Selecione pelo menos um tópico." } } }
```

`mensagem` é exibida ao aluno — escreva em português, em linguagem simples. `detalhes` é opcional (erros por campo).

| Código | Status | Quando |
|---|---|---|
| `NAO_AUTENTICADO` | 401 | Token ausente/expirado |
| `SESSAO_NAO_ENCONTRADA` | 404 | Sessão inexistente **ou de outro aluno** (não revelar existência) |
| `PARAMETROS_INVALIDOS` | 422 | Validação do `POST /sessoes` |
| `SEM_QUESTOES` | 422 | Nenhuma questão para a combinação tópicos × nível |
| `SESSAO_FINALIZADA` | 409 | Tentativa de exibir/responder questão em sessão finalizada |
| `QUESTAO_NAO_EXIBIDA` | 409 | Resposta para questão que não é a atual |
| `QUESTAO_JA_RESPONDIDA` | 409 | Resposta duplicada (duplo clique, reenvio) |
| `ALTERNATIVA_INVALIDA` | 422 | Letra fora de A–D |
| `PERIODO_INVALIDO` | 422 | `periodo` fora de `7d`/`30d`/`tudo` |

---

## 2. Rotas

Resumo (atende ao mínimo exigido em *Requisitos Técnicos §1.2*: iniciar sessão, registrar resposta, finalizar, resultados e histórico):

| Método | Rota | Tela | Função no frontend (`src/api/gallifrey.js`) |
|---|---|---|---|
| GET | `/alunos/me` | Cabeçalho | `buscarAlunoAtual` |
| GET | `/topicos` | Configurar Missão | `listarTopicos` |
| GET | `/sessoes/ultima` | Configurar Missão (card "Última sessão") | `buscarUltimaSessao` |
| GET | `/sessoes/em-andamento` | Tela Inicial ("Continuar missão") | `buscarSessaoEmAndamento` |
| POST | `/sessoes` | Configurar Missão → **Iniciar Sessão** | `iniciarSessao` |
| GET | `/sessoes/{id}` | Tela de Questão (retomada) | `buscarSessao` |
| POST | `/sessoes/{id}/questoes/proxima` | Tela de Questão | `exibirProximaQuestao` |
| POST | `/sessoes/{id}/respostas` | Tela de Questão → **Confirmar** | `registrarResposta` |
| POST | `/sessoes/{id}/finalizar` | Última questão / **Encerrar sessão** | `finalizarSessao` |
| GET | `/sessoes/{id}/resultado` | Tela de Resultados | `buscarResultado` |
| GET | `/sessoes/{id}/respostas` | "Ver todas as questões" / "Ver questões erradas" | `listarRespostasDaSessao` |
| GET | `/historico?periodo=` | Histórico de Sessões | `buscarHistorico` |

### 2.1 `GET /alunos/me`

```json
{
  "id": 1,
  "nome": "Ana Souza",
  "email": "ana@cosmo.edu.br",
  "data_cadastro": "2026-03-01T12:00:00Z",
  "estatisticas": {
    "num_sessoes": 12,
    "tempo_total_estudo_segundos": 12240,
    "taxa_acerto_global": 78.0,
    "total_questoes_respondidas": 248
  }
}
```

`estatisticas` é **derivado** de `RESPOSTA_SESSAO`/`SESSAO` (não armazenar agregado). `taxa_acerto_global` é `null` sem respostas.

### 2.2 `GET /topicos`

```json
[ { "id": 1, "nome": "Variáveis", "total_questoes": 10 }, { "id": 4, "nome": "Condicionais SE", "total_questoes": 10 } ]
```

`total_questoes` é opcional (o frontend usa só para informação).

### 2.3 `GET /sessoes/ultima` → `SessaoResumo` ou `204`

Última sessão **finalizada** com ao menos uma resposta. Formato `SessaoResumo`:

```json
{
  "id": 11, "numero": 11, "status": "CONCLUIDA",
  "data_inicio": "2026-04-18T14:02:00Z", "data_fim": "2026-04-18T14:14:10Z",
  "topicos": [ { "id": 1, "nome": "Variáveis" } ],
  "todos_topicos": false,
  "num_questoes_configuradas": 10,
  "total_questoes_respondidas": 10,
  "total_acertos": 8,
  "percentual_aproveitamento": 80.0,
  "tempo_total_segundos": 730
}
```

`numero` = posição da sessão na ordem cronológica de **todas** as sessões criadas pelo aluno (1ª, 2ª, …).

### 2.4 `GET /sessoes/em-andamento` → `Sessao` ou `204`

Permite retomar uma sessão cuja aba foi fechada. Formato `Sessao` na seção 2.6.

### 2.5 `POST /sessoes` — Iniciar Sessão

```json
{ "topico_ids": [1, 2, 4], "num_questoes": 10 }
```

Regras (*Doc. Funcional §3.2*, *Critérios §3.1*):
- Só aqui a sessão é criada e passa a contar em `num_sessoes`. Configurar parâmetros **não** gera registro.
- `topico_ids` com pelo menos 1 tópico; `num_questoes` inteiro (frontend oferece 5, 10, 15, 20). Não há escolha de nível cognitivo.
- Registra `data_inicio` (UTC), grava `SESSAO_TOPICO` e sorteia o **lote** de questões filtrando apenas por tópico — questões de **todos** os níveis cognitivos entram no sorteio.
  Recomendado: intercalar tópicos e priorizar questões ainda não respondidas pelo aluno.
- Se houver menos questões que `num_questoes`, o lote fica menor (`progresso.total` reflete o real). Se não houver nenhuma → `422 SEM_QUESTOES`.
- Se já houver uma sessão `EM_ANDAMENTO`, o mock a encerra como `ENCERRADA_MANUALMENTE` (sugestão; o backend pode escolher outra política).

Resposta `201` → `Sessao`.

### 2.6 `GET /sessoes/{id}` → `Sessao`

```json
{
  "id": 13, "numero": 13, "status": "EM_ANDAMENTO",
  "data_inicio": "2026-04-20T17:32:00Z", "data_fim": null,
  "topicos": [ { "id": 1, "nome": "Variáveis" }, { "id": 4, "nome": "Condicionais SE" } ],
  "todos_topicos": false,
  "num_questoes_configuradas": 20,
  "progresso": {
    "total": 20, "respondidas": 7, "acertos": 5, "erros": 2,
    "tempo_total_segundos": 503,
    "respostas": [ { "ordem": 1, "correta": true }, { "ordem": 2, "correta": false } ]
  }
}
```

`progresso.respostas` alimenta os pontinhos do rodapé da Tela de Questão.

### 2.7 `POST /sessoes/{id}/questoes/proxima` — exibir questão

Sem corpo. O servidor marca **`exibida_em`** (início oficial do cronômetro) e devolve a questão **sem gabarito**:

```json
{
  "ordem": 7,
  "total": 20,
  "exibida_em": "2026-04-20T17:40:23Z",
  "servidor_agora": "2026-04-20T17:40:23Z",
  "questao": {
    "id": 42,
    "topico": { "id": 4, "nome": "Condicionais SE" },
    "nivel_cognitivo": "ANALISE",
    "enunciado": "Analise os dois trechos de código abaixo. Qual a diferença fundamental entre eles?",
    "codigos": [
      { "rotulo": "Código A", "linguagem": "python", "conteudo": "x = 10\nif x > 5:\n    print(\"Maior\")\nelse:\n    print(\"Menor ou igual\")" },
      { "rotulo": "Código B", "linguagem": "python", "conteudo": "x = 10\nprint(\"Maior\") if x > 5 else print(\"Menor ou igual\")" }
    ],
    "alternativas": [
      { "id": "A", "texto": "O Código A usa if-else tradicional e o Código B usa o operador ternário." },
      { "id": "B", "texto": "O Código A é mais rápido que o Código B." },
      { "id": "C", "texto": "O Código B usa mais memória que o Código A." },
      { "id": "D", "texto": "Não há diferença, ambos são equivalentes em todos os casos." }
    ]
  }
}
```

- **Idempotente**: se a questão atual já foi exibida e ainda não respondida, devolve a mesma com o `exibida_em` original (recarregar a página não zera nem "rouba" tempo).
- `servidor_agora` permite ao frontend corrigir a diferença entre o relógio do aluno e o do servidor.
- Sem mais questões → `204`. Sessão finalizada → `409 SESSAO_FINALIZADA`.
- `codigos` pode ter 0, 1 ou 2 trechos. Textos podem conter `` `código inline` `` entre crases e `\n`.
- **Nunca** enviar `alternativa_correta` nem justificativas antes da resposta.

### 2.8 `POST /sessoes/{id}/respostas` — confirmar resposta

```json
{ "questao_id": 42, "alternativa_escolhida": "A", "tempo_cliente_segundos": 107, "tempo_oculto_segundos": 0 }
```

Regras (*Doc. Funcional §3.3*, *Requisitos §1.1*, *Critérios §3.2*):
- **Persistência incremental**: gravar a linha de `RESPOSTA_SESSAO` imediatamente.
- `tempo_gasto_segundos` **oficial = `timestamp_resposta − exibida_em`, calculado no servidor.**
  `tempo_cliente_segundos` (medido no navegador) e `tempo_oculto_segundos` (tempo com a aba oculta) são enviados
  para análise e para decidir os pontos em aberto (§4) — recomenda-se persisti-los também.
- `correta` = comparação com o gabarito; o acerto/erro fica vinculado ao **tópico da questão**.

Resposta `201`:

```json
{
  "resposta_id": 901,
  "correta": false,
  "alternativa_escolhida": "B",
  "alternativa_correta": "A",
  "justificativas": [
    { "alternativa": "A", "texto": "Correta. O Código B usa o operador ternário…", "correta": true },
    { "alternativa": "B", "texto": "Incorreta. Não há diferença relevante de desempenho…", "correta": false },
    { "alternativa": "C", "texto": "Incorreta. …", "correta": false },
    { "alternativa": "D", "texto": "Incorreta. …", "correta": false }
  ],
  "tempo_gasto_segundos": 107,
  "progresso": { "total": 20, "respondidas": 7, "acertos": 5, "erros": 2, "tempo_total_segundos": 503, "respostas": [ … ] },
  "ha_proxima": true
}
```

O frontend congela o cronômetro da questão no clique e passa a exibir `tempo_gasto_segundos`. O cronômetro da sessão
passa a exibir `progresso.tempo_total_segundos` (soma dos tempos das questões — o tempo lendo o feedback não entra).

### 2.9 `POST /sessoes/{id}/finalizar`

```json
{ "motivo": "CONCLUIDA" }            // após responder a última questão
{ "motivo": "ENCERRADA_MANUALMENTE" } // botão "Encerrar sessão"
```

- Marca `data_fim` e `status`. Idempotente (finalizar de novo não altera nada).
- Encerrada antes do fim: as métricas usam **apenas as questões respondidas** (*Doc. Funcional §3.3*).
- Resposta `200` → `ResultadoSessao` (igual à 2.10), para o frontend já abrir a Tela de Resultados.

### 2.10 `GET /sessoes/{id}/resultado` → `ResultadoSessao`

```json
{
  "sessao": { "...": "Sessao (2.6)" },
  "total_questoes_respondidas": 20,
  "total_acertos": 17,
  "total_erros": 3,
  "percentual_aproveitamento": 85.0,
  "tempo_total_segundos": 872,
  "tempo_medio_por_questao_segundos": 44,
  "comparacao_sessao_anterior": {
    "sessao_id": 12, "numero": 4,
    "tempo_total_segundos": 992, "tempo_medio_por_questao_segundos": 50, "percentual_aproveitamento": 70.0,
    "diferenca_tempo_total_segundos": -120,
    "diferenca_tempo_medio_segundos": -6
  },
  "desempenho_por_topico": [
    { "topico_id": 1, "nome": "Variáveis", "respondidas": 4, "acertos": 4, "erros": 0, "percentual_acerto": 100.0 },
    { "topico_id": 4, "nome": "Condicionais SE", "respondidas": 4, "acertos": 2, "erros": 2, "percentual_acerto": 50.0 }
  ],
  "ponto_de_atencao": { "topico_id": 4, "nome": "Condicionais SE", "erros": 2, "respondidas": 4, "percentual_erro": 50.0 },
  "tempo_medio_ultimas_sessoes": [
    { "sessao_id": 9, "numero": 1, "tempo_medio_por_questao_segundos": 58 },
    { "sessao_id": 13, "numero": 5, "tempo_medio_por_questao_segundos": 44 }
  ],
  "aluno": { "num_sessoes": 5, "total_questoes_respondidas": 84 }
}
```

Cálculos (*Doc. Funcional §3.4*, *Critérios §3.3*):

| Campo | Fórmula |
|---|---|
| `tempo_total_segundos` | Σ `tempo_gasto_segundos` das respostas da sessão |
| `percentual_aproveitamento` | `acertos / respondidas × 100` (0 se nenhuma resposta) |
| `tempo_medio_por_questao_segundos` | `round(tempo_total / respondidas)` |
| `desempenho_por_topico` | Agrupa respostas da sessão pelo `topico_id` **da questão**; só tópicos com respostas; ordenado por id |
| `ponto_de_atencao` | Tópico com a **maior proporção de erros** da sessão; desempate: mais erros, depois mais respondidas; `null` se não houve erro |
| `comparacao_sessao_anterior` | Sessão **finalizada imediatamente anterior** (por `data_inicio`) do mesmo aluno com ao menos 1 resposta; `null` se não houver. Diferenças = atual − anterior (negativo = mais rápido) |
| `tempo_medio_ultimas_sessoes` | Até 5 sessões (finalizadas + a atual), cronológicas, terminando na atual — alimenta o mini-gráfico S1…S5 |
| `aluno.num_sessoes` | Nº de sessões criadas pelo aluno (card "Sessões realizadas") |

Deve retornar **os mesmos números** sempre (inclusive quando aberto a partir do Histórico — *Critérios §3.4*): por isso tudo é derivado das respostas, nunca de valores gravados.

### 2.11 `GET /sessoes/{id}/respostas` → `RespostaRevisada[]`

Revisão da sessão ("Ver todas as questões"), em ordem:

```json
[
  {
    "ordem": 1,
    "questao": { "...": "QuestaoPublica (2.7)" },
    "alternativa_escolhida": "B",
    "alternativa_correta": "A",
    "correta": false,
    "tempo_gasto_segundos": 107,
    "justificativas": [ { "alternativa": "A", "texto": "…", "correta": true } ]
  }
]
```

### 2.12 `GET /historico?periodo=7d|30d|tudo` → `Historico`

```json
{
  "periodo": "tudo",
  "inicio": null,
  "fim": "2026-04-20T18:00:00Z",
  "estatisticas": {
    "total_sessoes": 12,
    "taxa_acerto_global": 78.0,
    "tempo_total_estudo_segundos": 12240,
    "tempo_medio_por_sessao_segundos": 1020,
    "questoes_respondidas": 248,
    "questoes_unicas": 84,
    "questoes_repetidas": 164,
    "sessoes_mes_atual": 3,
    "variacao_taxa_acerto_pp": null
  },
  "sessoes": [ { "...": "SessaoResumo (2.3), da mais recente para a mais antiga" } ],
  "evolucao": [ { "sessao_id": 7, "numero": 7, "data_inicio": "2026-04-06T12:21:00Z", "percentual_aproveitamento": 70.0 } ],
  "desempenho_por_topico": [ { "topico_id": 1, "nome": "Variáveis", "respondidas": 40, "acertos": 36, "erros": 4, "percentual_acerto": 90.0 } ]
}
```

Regras (*Doc. Funcional §3.5*, *Critérios §3.4*):
- Janela: `7d` = últimos 7×24h, `30d` = últimos 30×24h, `tudo` = sem limite; filtro por `data_inicio` da sessão (UTC).
- **Todos** os blocos (estatísticas, lista, evolução, tópicos) são recalculados com as mesmas sessões da janela.
- `sessoes` ordenada da mais recente para a mais antiga; `evolucao` em ordem cronológica, só sessões com respostas.
- `questoes_unicas` = nº de questões distintas respondidas na janela; `questoes_repetidas` = respostas − únicas.
- `tempo_medio_por_sessao_segundos` = tempo total ÷ sessões com ao menos uma resposta.
- `sessoes_mes_atual` = sessões iniciadas no mês corrente (independe do filtro) → "+3 este mês".
- `variacao_taxa_acerto_pp` = taxa da janela − taxa da janela anterior de mesmo tamanho, em pontos percentuais
  (`null` para `tudo` ou sem dados) → "+5% vs. semana passada".

---

## 3. Modelo de dados esperado

Igual ao diagrama ER (`docs/diagramas/fluxos_gallifrey-06 - Modelo de Dados (ER)(1).jpg`), com três acréscimos sugeridos:

| Tabela | Acréscimo | Motivo |
|---|---|---|
| `SESSAO` | `questao_ids` (ordem do lote) ou tabela `SESSAO_QUESTAO(sessao_id, questao_id, ordem, exibida_em)` | Lote fixo por sessão + `exibida_em` para o cálculo de tempo no servidor |
| `RESPOSTA_SESSAO` | `ordem`, `tempo_cliente_segundos`, `tempo_oculto_segundos` | Ordem na sessão e dados para os pontos em aberto |
| `QUESTAO` | `justificativas` por alternativa (ex.: tabela `ALTERNATIVA(questao_id, letra, texto, justificativa, correta)`) | Feedback "Justificativa das alternativas" |

Formato de questão usado no banco de exemplo (`frontend/src/api/mock/data/questoes.json`):

```json
{
  "id": 1, "topico_id": 4, "nivel_cognitivo": "ANALISE",
  "enunciado": "…", "codigos": [ { "rotulo": "Código", "linguagem": "python", "conteudo": "…" } ],
  "alternativas": [ { "id": "A", "texto": "…" } ],
  "alternativa_correta": "C",
  "justificativas": { "A": "Incorreta. …", "B": "…", "C": "Correta. …", "D": "…" }
}
```

---

## 4. Pontos em aberto da documentação e como o frontend se preparou

| Ponto (Doc. Funcional §6) | O que o frontend faz hoje |
|---|---|
| Aba oculta / inatividade: pausar o cronômetro? | Mede o tempo com a aba oculta e envia em `tempo_oculto_segundos`. A exibição pode pausar com `VITE_PAUSAR_CRONOMETRO_ABA_OCULTA=true`. O backend decide se subtrai do tempo oficial. |
| Tempo máximo antes de considerar a questão "abandonada" | Nada é imposto no frontend. Se o backend definir um limite, basta limitar `tempo_gasto_segundos` no servidor. |
| Questões únicas vs. repetidas | Adotado: únicas = questões distintas na janela; repetidas = respostas − únicas (seção 2.12). |
| Tempo da sessão durante a leitura da justificativa | Adotado: **não** conta. O tempo da sessão é a soma dos tempos por questão, como define §3.3. |
