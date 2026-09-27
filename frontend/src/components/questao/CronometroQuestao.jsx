import { Timer } from 'lucide-react'
import { formatarCronometro } from '../../lib/formatadores.js'

/**
 * Relógio grande do canto superior direito: tempo da questão + tempo acumulado da sessão.
 * @param {{ segundosQuestao: number, segundosSessao: number, parado?: boolean }} props
 */
export function CronometroQuestao({ segundosQuestao, segundosSessao, parado = false }) {
  return (
    <div className="flex flex-col items-end leading-tight" aria-label="Cronômetros">
      <p
        className={`flex items-center gap-2 font-mono text-2xl font-semibold tabular-nums sm:text-3xl ${
          parado ? 'text-cosmo-ciano' : 'text-white'
        }`}
        title={parado ? 'Tempo registrado para esta questão' : 'Tempo nesta questão'}
      >
        <Timer className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
        <span>
          <span className="sr-only">Tempo na questão: </span>
          {formatarCronometro(segundosQuestao)}
        </span>
      </p>
      <p className="mt-0.5 font-mono text-sm tabular-nums text-espaco-200">
        Sessão: {formatarCronometro(segundosSessao)}
      </p>
    </div>
  )
}
