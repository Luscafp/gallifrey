import { useEffect, useId, useRef } from 'react'

/**
 * Diálogo modal acessível (usa <dialog> nativo: foco preso, Esc fecha).
 * @param {{ aberto: boolean, aoFechar: () => void, titulo: string, children: React.ReactNode, acoes?: React.ReactNode, icone?: React.ReactNode }} props
 */
export function Modal({ aberto, aoFechar, titulo, children, acoes, icone }) {
  const ref = useRef(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberto && !dialogo.open) dialogo.showModal?.()
    if (!aberto && dialogo.open) dialogo.close?.()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault()
        aoFechar()
      }}
      onClick={(e) => {
        if (e.target === ref.current) aoFechar()
      }}
      className="m-auto w-[min(92vw,30rem)] rounded-2xl border border-espaco-500 bg-espaco-800 p-0 text-cosmo-gelo shadow-2xl backdrop:bg-espaco-950/75 backdrop:backdrop-blur-sm"
    >
      {aberto && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start gap-4">
            {icone}
            <div className="flex flex-col gap-2">
              <h2 id={idTitulo} className="text-lg font-semibold text-white">
                {titulo}
              </h2>
              <div className="text-sm leading-relaxed text-espaco-200">{children}</div>
            </div>
          </div>
          {acoes && <div className="mt-2 flex flex-wrap justify-end gap-3">{acoes}</div>}
        </div>
      )}
    </dialog>
  )
}
