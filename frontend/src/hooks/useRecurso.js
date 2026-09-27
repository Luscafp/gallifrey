import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carrega um recurso da API com estados de carregamento/erro e cancelamento automático.
 *
 * @template T
 * @param {(sinal: AbortSignal) => Promise<T>} carregar  função que chama a API (recebe AbortSignal)
 * @param {unknown[]} deps  dependências que disparam novo carregamento
 * @returns {{ dados: T | undefined, erro: Error | null, carregando: boolean, recarregar: () => void, definirDados: (d: T) => void }}
 *
 * @example
 * const { dados, erro, carregando } = useRecurso((sinal) => buscarHistorico(periodo, sinal), [periodo])
 */
export function useRecurso(carregar, deps) {
  const [estado, setEstado] = useState({ dados: undefined, erro: null, carregando: true })
  const [versao, setVersao] = useState(0)
  const carregarRef = useRef(carregar)
  carregarRef.current = carregar

  useEffect(() => {
    const controle = new AbortController()
    setEstado((e) => ({ ...e, erro: null, carregando: true }))
    carregarRef
      .current(controle.signal)
      .then((dados) => {
        if (!controle.signal.aborted) setEstado({ dados, erro: null, carregando: false })
      })
      .catch((erro) => {
        if (controle.signal.aborted || erro?.name === 'AbortError') return
        setEstado((e) => ({ ...e, erro, carregando: false }))
      })
    return () => controle.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])
  const definirDados = useCallback((dados) => setEstado({ dados, erro: null, carregando: false }), [])

  return { ...estado, recarregar, definirDados }
}
