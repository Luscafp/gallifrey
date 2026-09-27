import { Check } from 'lucide-react'
import { Planeta } from '../cosmo/Planeta.jsx'

/**
 * Seleção de tópicos no estilo da trilha da Cosmo: cada tópico é um planeta da rota,
 * ligados por uma órbita tracejada. Semântica de checkbox (um input por tópico).
 *
 * @param {{ topicos: {id:any, nome:string, total_questoes?:number}[], selecionados: any[], aoAlternar: (id:any) => void, invalido?: boolean, idDescricao?: string }} props
 */
export function RotaDePlanetas({ topicos, selecionados, aoAlternar, invalido = false, idDescricao }) {
  return (
    <div className="relative">
      {/* órbita tracejada ligando os planetas (decorativa) */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full text-cosmo-ciano/35"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M8 22 C 40 5, 60 40, 92 22 S 60 80, 50 70 S 10 60, 8 85"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <ul className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
        {topicos.map((topico) => {
          const marcado = selecionados.includes(topico.id)
          return (
            <li key={topico.id}>
              <label
                className={`group flex h-full cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3 pb-3 pt-4 text-center transition-all duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cosmo-ciano ${
                  marcado
                    ? 'border-cosmo-ciano/80 bg-cosmo-ciano/10 shadow-brilho'
                    : invalido
                      ? 'border-erro/50 bg-espaco-850/80 hover:border-erro'
                      : 'border-espaco-500/70 bg-espaco-850/80 hover:border-cosmo-ciano/50'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={marcado}
                  onChange={() => aoAlternar(topico.id)}
                  aria-describedby={idDescricao}
                />
                <span className="relative">
                  <Planeta
                    topico={topico}
                    className={`w-14 transition-all duration-300 sm:w-16 ${
                      marcado ? 'group-hover:scale-105' : 'opacity-45 grayscale-[60%] group-hover:opacity-80'
                    }`}
                  />
                  <span
                    aria-hidden
                    className={`absolute -right-1.5 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 transition-colors ${
                      marcado
                        ? 'border-cosmo-ciano bg-cosmo-ciano text-espaco-900'
                        : 'border-espaco-400 bg-espaco-900 text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </span>
                <span className={`text-sm font-semibold ${marcado ? 'text-white' : 'text-espaco-200'}`}>
                  {topico.nome}
                </span>
                {topico.total_questoes !== undefined && (
                  <span className="text-[11px] text-espaco-300">{topico.total_questoes} questões</span>
                )}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
