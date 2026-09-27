import { RotateCcw } from 'lucide-react'
import { Astronauta } from '../cosmo/Astronauta.jsx'
import { Botao } from './Botao.jsx'

/**
 * Falha ao carregar algo da API. Mostra a mensagem do servidor (ApiError) e permite tentar de novo.
 * @param {{ erro: Error & {codigo?: string}, aoTentarNovamente?: () => void, titulo?: string }} props
 */
export function EstadoErro({ erro, aoTentarNovamente, titulo = 'Houston, temos um problema…' }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-6 py-16 text-center">
      <Astronauta
        tamanho="w-20"
        fala={
          <>
            <strong className="block text-white">{titulo}</strong>
            <span className="text-espaco-200">{erro?.message || 'Algo saiu da órbita.'}</span>
          </>
        }
      />
      {aoTentarNovamente && (
        <Botao variante="secundario" onClick={aoTentarNovamente} icone={<RotateCcw className="h-4 w-4" />}>
          Tentar novamente
        </Botao>
      )}
    </div>
  )
}
