import { formatarDuracao } from '../../lib/formatadores.js'

const ALTURA_MAX = 64 // px da coluna mais alta

/**
 * Mini-colunas do tempo médio por questão nas últimas sessões (a atual em destaque).
 * Colunas finas com topo arredondado, base reta; valor no tooltip (title) e na lista oculta.
 *
 * @param {{ sessoes: {sessao_id:any, numero:number, tempo_medio_por_questao_segundos:number}[], atualId: any }} props
 */
export function BarrasTempoMedio({ sessoes, atualId }) {
  if (!sessoes?.length) return null
  const maior = Math.max(...sessoes.map((s) => s.tempo_medio_por_questao_segundos), 1)
  return (
    <figure className="mt-auto">
      <div className="flex h-[88px] items-end justify-around gap-2 border-b border-espaco-500/70 px-1" aria-hidden>
        {sessoes.map((s) => {
          const atual = String(s.sessao_id) === String(atualId)
          const altura = Math.max(6, (s.tempo_medio_por_questao_segundos / maior) * ALTURA_MAX)
          return (
            <div key={s.sessao_id} className="group relative flex w-6 flex-col items-center justify-end">
              <span
                className={`mb-1 text-[10px] tabular-nums ${atual ? 'font-semibold text-white' : 'text-espaco-300 opacity-0 group-hover:opacity-100'}`}
              >
                {formatarDuracao(s.tempo_medio_por_questao_segundos, { curto: true })}
              </span>
              <div
                title={`Sessão #${s.numero}: ${formatarDuracao(s.tempo_medio_por_questao_segundos)} por questão`}
                className={`w-full rounded-t ${atual ? 'bg-cosmo-ciano shadow-brilho' : 'bg-sky-600/70 group-hover:bg-sky-500'}`}
                style={{ height: altura }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex justify-around gap-2 px-1 text-[11px]" aria-hidden>
        {sessoes.map((s) => (
          <span
            key={s.sessao_id}
            className={`w-6 text-center ${String(s.sessao_id) === String(atualId) ? 'font-semibold text-white' : 'text-espaco-300'}`}
          >
            S{s.numero}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">
        Tempo médio por questão nas últimas sessões:{' '}
        {sessoes
          .map((s) => `sessão ${s.numero}, ${formatarDuracao(s.tempo_medio_por_questao_segundos)}`)
          .join('; ')}
        .
      </figcaption>
    </figure>
  )
}
