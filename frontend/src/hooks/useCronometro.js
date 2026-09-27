import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '../config.js'

/**
 * Cronômetro da questão (Documentação Funcional §3.3):
 *  - começa no instante em que a questão é exibida (`exibida_em`, relógio do servidor);
 *  - congela quando o aluno confirma a resposta (`parar`) — o tempo lendo o feedback não conta;
 *  - mede quanto tempo a aba ficou oculta (enviado ao backend como `tempo_oculto_segundos`).
 *
 * O valor exibido é só informativo: o tempo oficial é calculado pelo servidor.
 *
 * @param {{ exibidaEm?: string, servidorAgora?: string }} [inicio]
 *   Quando informados, o cronômetro parte de (servidorAgora − exibidaEm), o que mantém a contagem
 *   correta mesmo após recarregar a página e corrige diferenças entre o relógio do aluno e o do servidor.
 */
export function useCronometro(inicio) {
  const [agora, setAgora] = useState(() => performance.now())
  const [parado, setParado] = useState(false)
  const origemRef = useRef(performance.now())
  const ocultoTotalRef = useRef(0)
  const ocultoDesdeRef = useRef(null)
  const congeladoRef = useRef(null)

  const chave = inicio?.exibidaEm ?? null

  // Reinicia a cada nova questão
  useEffect(() => {
    const decorrido =
      inicio?.exibidaEm && inicio?.servidorAgora
        ? Math.max(0, Date.parse(inicio.servidorAgora) - Date.parse(inicio.exibidaEm))
        : 0
    origemRef.current = performance.now() - decorrido
    ocultoTotalRef.current = 0
    ocultoDesdeRef.current = document.visibilityState === 'hidden' ? performance.now() : null
    congeladoRef.current = null
    setParado(false)
    setAgora(performance.now())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])

  useEffect(() => {
    if (parado) return undefined
    const id = setInterval(() => setAgora(performance.now()), 250)
    return () => clearInterval(id)
  }, [parado])

  useEffect(() => {
    function aoMudarVisibilidade() {
      if (congeladoRef.current) return
      if (document.visibilityState === 'hidden') {
        ocultoDesdeRef.current = performance.now()
      } else if (ocultoDesdeRef.current !== null) {
        ocultoTotalRef.current += performance.now() - ocultoDesdeRef.current
        ocultoDesdeRef.current = null
      }
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    return () => document.removeEventListener('visibilitychange', aoMudarVisibilidade)
  }, [])

  const medir = useCallback((instante) => {
    const ocultoEmCurso = ocultoDesdeRef.current !== null ? instante - ocultoDesdeRef.current : 0
    const ocultoMs = ocultoTotalRef.current + ocultoEmCurso
    const brutoMs = instante - origemRef.current
    const visivelMs = config.pausarCronometroAbaOculta ? brutoMs - ocultoMs : brutoMs
    return { segundos: Math.max(0, Math.floor(visivelMs / 1000)), ocultoSegundos: Math.round(ocultoMs / 1000) }
  }, [])

  /** Congela o cronômetro e devolve as medidas do cliente. */
  const parar = useCallback(() => {
    if (!congeladoRef.current) {
      congeladoRef.current = medir(performance.now())
      setParado(true)
    }
    return congeladoRef.current
  }, [medir])

  const atual = congeladoRef.current ?? medir(agora)
  return { segundos: atual.segundos, ocultoSegundos: atual.ocultoSegundos, parado, parar }
}
