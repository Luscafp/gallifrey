import { useEffect, useRef, useState } from 'react'

/**
 * Mede a largura de um elemento (para os gráficos SVG desenharem em pixels reais,
 * sem distorcer texto e marcadores).
 * @param {number} inicial largura usada antes da primeira medição
 */
export function useLargura(inicial = 600) {
  const ref = useRef(null)
  const [largura, setLargura] = useState(inicial)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const medir = () => setLargura(Math.max(200, Math.round(el.getBoundingClientRect().width)))
    medir()
    if (typeof ResizeObserver === 'undefined') return undefined
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, largura]
}
