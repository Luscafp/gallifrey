/**
 * Cartão de métrica das telas de Resultados e Histórico: ícone à esquerda, rótulo em caixa alta,
 * valor principal e conteúdo complementar.
 *
 * @param {{ icone: React.ReactNode, titulo: string, valor?: React.ReactNode, legenda?: React.ReactNode, children?: React.ReactNode, className?: string }} props
 */
export function CartaoMetrica({ icone, titulo, valor, legenda, children, className = '' }) {
  return (
    <section className={`painel flex flex-col gap-4 p-5 ${className}`} aria-label={titulo}>
      <div className="flex items-start gap-4">
        <span className="mt-1 shrink-0 text-cosmo-ciano [&>svg]:h-9 [&>svg]:w-9" aria-hidden>
          {icone}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-espaco-200">{titulo}</h3>
          {valor !== undefined && (
            <p className="text-4xl font-semibold leading-tight tracking-tight text-white">{valor}</p>
          )}
          {legenda && <p className="text-sm text-espaco-300">{legenda}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
