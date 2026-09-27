import { Planeta } from '../cosmo/Planeta.jsx'
import { BarraProgresso } from '../ui/BarraProgresso.jsx'
import { corDoPercentual } from '../../lib/visualTopico.js'
import { formatarPercentual } from '../../lib/formatadores.js'

/**
 * Barras de % de acerto por tópico (cada tópico com o seu planeta da Cosmo).
 * @param {{ topicos: import('../../api/tipos.js').DesempenhoTopico[], compacto?: boolean }} props
 */
export function ListaDesempenhoTopico({ topicos, compacto = false }) {
  if (!topicos?.length) {
    return <p className="py-6 text-center text-sm text-espaco-300">Nenhuma questão respondida ainda.</p>
  }
  return (
    <ul className="flex flex-col divide-y divide-espaco-500/40">
      {topicos.map((t) => {
        const cor = corDoPercentual(t.percentual_acerto)
        return (
          <li
            key={t.topico_id}
            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[auto_minmax(0,9rem)_1fr_auto] ${compacto ? 'py-2' : 'py-3'}`}
          >
            <Planeta topico={{ id: t.topico_id }} className={compacto ? 'w-6' : 'w-8'} />
            <span className="truncate text-sm text-cosmo-gelo" title={t.nome}>
              {t.nome}
            </span>
            <BarraProgresso
              valor={t.percentual_acerto}
              rotulo={`${t.nome}: ${formatarPercentual(t.percentual_acerto)} de acerto`}
              className="order-last col-span-3 sm:order-none sm:col-span-1"
            />
            <span className="flex min-w-[4.5rem] flex-col items-end leading-tight">
              <span className={`text-lg font-semibold tabular-nums ${cor.texto}`}>
                {formatarPercentual(t.percentual_acerto)}
              </span>
              <span className="text-[11px] tabular-nums text-espaco-300">
                {t.acertos}/{t.respondidas} certas
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
