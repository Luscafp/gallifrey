/**
 * Marca do Gallifrey: planeta com anel (mesmo traço do protótipo) + nome.
 * @param {{ tamanho?: 'sm'|'lg', className?: string }} props
 */
export function Logo({ tamanho = 'sm', className = '' }) {
  const grande = tamanho === 'lg'
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <IconePlaneta className={grande ? 'w-14 sm:w-24 lg:w-32' : 'w-9'} />
      <span
        className={
          grande
            ? 'font-display text-4xl tracking-wide text-white drop-shadow-[0_0_18px_rgba(81,212,254,0.35)] sm:text-6xl lg:text-7xl'
            : 'font-display text-xl tracking-wider text-cosmo-ciano'
        }
      >
        GALLIFREY
      </span>
    </span>
  )
}

export function IconePlaneta({ className = 'w-9' }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="17" stroke="#51D4FE" strokeWidth="4" />
      <path
        d="M9 45c-6 5-3 9 9 6 9-2 21-8 31-15 12-9 15-17 5-17"
        stroke="#51D4FE"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="56" cy="17" r="4" fill="#51D4FE" />
    </svg>
  )
}
