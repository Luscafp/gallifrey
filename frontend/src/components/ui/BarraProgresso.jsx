import { corDoPercentual } from '../../lib/visualTopico.js'

/**
 * Barra horizontal de percentual (0–100).
 * @param {{ valor: number, cor?: string, altura?: string, rotulo?: string, className?: string }} props
 *   cor: classes de gradiente (ex.: "from-sky-400 to-cosmo-ciano"); padrão = escala por desempenho
 */
export function BarraProgresso({ valor, cor, altura = 'h-2.5', rotulo, className = '' }) {
  const v = Math.max(0, Math.min(100, valor || 0))
  const gradiente = cor ?? corDoPercentual(v).barra
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
      className={`w-full overflow-hidden rounded-full bg-espaco-600/70 ${altura} ${className}`}
    >
      <div
        className={`h-full rounded-full bg-linear-to-r ${gradiente} transition-[width] duration-700 ease-out`}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}
