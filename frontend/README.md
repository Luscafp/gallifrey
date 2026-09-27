# Gallifrey — Frontend

Interface do **Gallifrey**, o módulo de missões de questões de Python (Algoritmos I) da plataforma **Cosmo**.
Stack: **React 19 + Vite + Tailwind CSS v4** (JavaScript/JSX, tipos documentados com JSDoc), `react-router-dom` e `lucide-react`.

## Rodando

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 — usa o backend SIMULADO por padrão
npm test           # testes das regras de negócio (vitest)
npm run build      # build de produção em dist/
```

Sem backend, o app funciona por completo com o **backend simulado** (`src/api/mock/`): ele roda no navegador,
guarda os dados no `localStorage` (chave `gallifrey_mock_v1`) e já vem com ~9 sessões de exemplo para o Histórico.
Para zerar os dados simulados, apague essa chave no DevTools. Um selo "dados simulados" aparece no canto da tela.

## Ligando no backend real

1. Copie `.env.example` para `.env.local`.
2. Defina `VITE_API_MOCK=false` e `VITE_API_URL` (ex.: `https://api.cosmo.edu.br/gallifrey` ou `/api`).
3. Em desenvolvimento, `VITE_API_PROXY_TARGET=http://localhost:8000` repassa `/api` ao backend local (evita CORS).

O backend deve seguir **[`docs/contrato-api.md`](../docs/contrato-api.md)** — rotas, JSON de cada resposta, códigos de erro
e fórmulas de todas as métricas. O mock é a implementação de referência desse contrato
(`src/api/mock/metricas.js` + testes em `src/api/mock/servidor.test.js`).

| Variável | Padrão | Uso |
|---|---|---|
| `VITE_API_URL` | `/api` | Base das rotas |
| `VITE_API_MOCK` | `true` | `true` = backend simulado no navegador |
| `VITE_API_MOCK_LATENCIA` | `250` | Latência artificial do mock (ms) |
| `VITE_API_PROXY_TARGET` | — | Proxy de `/api` no `npm run dev` |
| `VITE_BASE_PATH` | `/` | Subcaminho quando servido dentro da Cosmo (ex.: `/gallifrey/`) |
| `VITE_AUTH_TOKEN_KEY` | `cosmo_token` | Chave do `localStorage` com o JWT da Cosmo |
| `VITE_PAUSAR_CRONOMETRO_ABA_OCULTA` | `false` | Ponto em aberto da doc: pausar o cronômetro exibido com a aba oculta |

### Autenticação

O login é da Cosmo. O cliente HTTP (`src/api/cliente.js`) envia `Authorization: Bearer <token>` e cookies
(`credentials: 'include'`). Se a Cosmo expuser o token de outra forma, troque o provedor uma única vez na inicialização:

```js
import { definirProvedorDeToken } from './api/cliente.js'
definirProvedorDeToken(() => cosmoAuth.getAccessToken())
```

## Estrutura

```
src/
├── api/
│   ├── cliente.js          requisicao() + ApiError (fetch real ou mock)
│   ├── gallifrey.js        uma função por rota do contrato — as telas só usam estas funções
│   ├── tipos.js            JSDoc de todos os formatos (Sessao, ResultadoSessao, Historico, …)
│   └── mock/               backend simulado + regras de métricas + testes + banco de questões de exemplo
├── assets/cosmo/           ilustrações extraídas do protótipo da Cosmo (planetas, astronauta, cometa, …)
├── components/
│   ├── layout/             Cabecalho, Logo, CampoEstelar (fundo), Layouts
│   ├── ui/                 Botao, Modal, Carregando, EstadoErro, BarraProgresso, TextoComCodigo
│   ├── cosmo/              Astronauta, Planeta, imagens.js
│   ├── whovian/            Tardis, AneisGallifreyanos (referências a Doctor Who)
│   ├── questao/            componentes da Tela de Questão e da revisão
│   ├── metricas/           cartões e gráficos (SVG) de Resultados e Histórico
│   ├── inicio/, configuracao/
├── contexto/AlunoContexto.jsx   aluno autenticado (GET /alunos/me)
├── hooks/                  useRecurso (carregamento com cancelamento), useCronometro
├── lib/                    formatadores (pt-BR), visualTopico (planeta de cada tópico), doctorWho (mensagens)
└── paginas/                uma página por tela do fluxo
```

## Telas e rotas

| Rota | Tela | Dados |
|---|---|---|
| `/` | Tela Inicial | sessão em andamento, estatísticas do aluno |
| `/missao/nova` | Configurar Missão | tópicos, última sessão → `POST /sessoes` |
| `/missao/:id` | Tela de Questão | próxima questão, resposta, finalizar |
| `/missao/:id/resultado` | Tela de Resultados | resultado da sessão |
| `/missao/:id/revisao` | Ver todas as questões (`?filtro=erradas`) | respostas da sessão |
| `/historico` | Histórico de Sessões (`?periodo=7d\|30d\|tudo`) | histórico agregado |
| `/sobre` | Sobre o Gallifrey e dados coletados | — |

## Regras de negócio atendidas no frontend

- A sessão só é criada no clique em **Iniciar Sessão**; configurar não chama o servidor.
- Cronômetro da questão começa quando a questão é exibida (instante `exibida_em` do servidor) e congela na confirmação;
  o tempo lendo o feedback não conta. O cronômetro da sessão é a soma dos tempos das questões.
- O tempo **oficial** é calculado no servidor; o navegador envia o seu tempo e o tempo com a aba oculta como referência.
- Cada resposta é enviada assim que confirmada (fechar a aba não perde dados; a Tela Inicial oferece "Continuar missão").
- "Encerrar sessão" finaliza com as questões respondidas até ali.
- O gabarito e as justificativas só chegam ao navegador depois da resposta.

## Identidade visual e referências

- Paleta, planetas, astronauta, cometa, satélite e foguete vêm da Cosmo (`docs/prototipo/Cosmo`); cada **tópico é um planeta**.
- Doctor Who (Gallifrey é o planeta natal do Doctor): TARDIS "materializando" nos carregamentos, anéis inspirados na escrita
  circular gallifreyana, mensagens de desempenho ("Fantástico!", "Brilhante!", "Allons-y!", "Geronimo!"),
  "Não pisque!" ao voltar para a aba, "Spoilers!" no diário vazio e a página 404 no Vórtice do Tempo.
  Todos os desenhos são próprios (nenhuma arte oficial da série).
- Acessibilidade: navegação por teclado (atalhos 1–4/A–D e Enter na questão), foco visível, `prefers-reduced-motion`,
  semântica de radio/checkbox e gráficos com descrição textual.
