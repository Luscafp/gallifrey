# Gallifrey

Plataforma de **missões** de questões de múltipla escolha de Python (Algoritmos I — ABI Ciência da Computação e IA),
integrada à plataforma **Cosmo**. Durante cada sessão o sistema coleta tempo por questão, tempo total, número de sessões e
acertos/erros para gerar a **Tela de Resultados** e o **Histórico de Sessões** do aluno.

> *Gallifrey* é o planeta natal do Doctor, de Doctor Who — as sessões são viagens pelo universo do Python.

| Pasta | Conteúdo |
|---|---|
| [`frontend/`](frontend/README.md) | App React + Vite + Tailwind (funciona sozinho com backend simulado) |
| [`docs/contrato-api.md`](docs/contrato-api.md) | **Contrato frontend ↔ backend**: rotas, JSON, erros e fórmulas das métricas |
| `docs/*.docx` | Documentação Funcional e Requisitos Técnicos |
| `docs/diagramas/` | Fluxos e modelo de dados (ER) |
| `docs/prototipo/` | Protótipos (Figma) do Gallifrey e assets da Cosmo |

```bash
cd frontend && npm install && npm run dev
```
