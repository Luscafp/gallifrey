/**
 * Pontos de progresso do rodapé: verde = acerto, vermelho = erro, atual com anel, restantes em cinza.
 * Com muitas questões, mostra só uma janela ao redor da atual (com reticências).
 *
 * @param {{ total: number, respostas: {ordem: number, correta: boolean}[], atual?: number|null, maxVisiveis?: number, aoClicar?: (ordem: number) => void }} props
 */
export function PontosProgresso({ total, respostas, atual = null, maxVisiveis = 24, aoClicar }) {
  const porOrdem = new Map(respostas.map((r) => [r.ordem, r.correta]))
  const itens = janela(total, atual ?? respostas.length, maxVisiveis)

  return (
    <ol className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2" aria-label="Progresso da sessão">
      {itens.map((item, i) => {
        if (item === '…') {
          return (
            <li key={`r${i}`} className="px-0.5 text-xs text-espaco-300" aria-hidden>
              …
            </li>
          )
        }
        const correta = porOrdem.get(item)
        const ehAtual = item === atual
        const cor =
          correta === true ? 'bg-acerto' : correta === false ? 'bg-erro' : 'bg-espaco-400/80'
        const descricao = `Questão ${item}: ${
          correta === true ? 'correta' : correta === false ? 'errada' : ehAtual ? 'atual' : 'não respondida'
        }`
        const Tag = aoClicar && correta !== undefined ? 'button' : 'span'
        return (
          <li key={item} className="flex">
            {ehAtual ? (
              <span
                aria-current="step"
                title={descricao}
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ring-2 ring-offset-2 ring-offset-espaco-900 ${
                  correta === true
                    ? 'bg-acerto text-espaco-900 ring-acerto/60'
                    : correta === false
                      ? 'bg-erro text-white ring-erro/60'
                      : 'bg-cosmo-ciano text-espaco-900 ring-cosmo-ciano/60'
                }`}
              >
                {item}
                <span className="sr-only">{descricao}</span>
              </span>
            ) : (
              <Tag
                {...(Tag === 'button' ? { type: 'button', onClick: () => aoClicar(item) } : {})}
                title={descricao}
                className={`block h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${cor}`}
              >
                <span className="sr-only">{descricao}</span>
              </Tag>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Lista de ordens (1-based) a exibir, com '…' onde houver cortes. */
function janela(total, atual, max) {
  const todos = Array.from({ length: total }, (_, i) => i + 1)
  if (total <= max) return todos
  const lado = Math.floor((max - 4) / 2)
  let inicio = Math.max(2, atual - lado)
  let fim = Math.min(total - 1, inicio + (max - 4))
  inicio = Math.max(2, fim - (max - 4))
  const meio = todos.slice(inicio - 1, fim)
  return [1, ...(inicio > 2 ? ['…'] : []), ...meio, ...(fim < total - 1 ? ['…'] : []), total]
}
