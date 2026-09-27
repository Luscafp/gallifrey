/**
 * Decoração inspirada na escrita circular gallifreyana: círculos concêntricos, arcos e pontos.
 * Puramente ornamental (aria-hidden). Gira lentamente.
 * @param {{ className?: string, girar?: boolean }} props
 */
export function AneisGallifreyanos({ className = 'w-96', girar = true }) {
  const cor = 'currentColor'
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} ${girar ? 'animate-girar-lento' : ''}`}
      aria-hidden
      fill="none"
      stroke={cor}
    >
      <circle cx="100" cy="100" r="96" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="90" strokeWidth="2" />
      {/* "palavras": círculos tangentes ao anel principal */}
      <circle cx="100" cy="28" r="16" strokeWidth="1.2" />
      <circle cx="100" cy="28" r="10" strokeWidth="0.8" />
      <circle cx="162" cy="64" r="13" strokeWidth="1.2" />
      <circle cx="156" cy="146" r="18" strokeWidth="1.2" />
      <circle cx="160" cy="150" r="7" strokeWidth="0.8" />
      <circle cx="46" cy="148" r="14" strokeWidth="1.2" />
      <circle cx="36" cy="70" r="11" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="38" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="30" strokeWidth="0.6" strokeDasharray="2 4" />
      {/* linhas de ligação */}
      <path d="M100 44 L100 62" strokeWidth="1" />
      <path d="M149 72 L133 84" strokeWidth="1" />
      <path d="M140 136 L128 122" strokeWidth="1" />
      <path d="M58 138 L72 124" strokeWidth="1" />
      <path d="M46 76 L64 88" strokeWidth="1" />
      {/* arcos */}
      <path d="M62 100 A38 38 0 0 1 100 62" strokeWidth="3" strokeLinecap="round" />
      <path d="M138 100 A38 38 0 0 1 112 136" strokeWidth="3" strokeLinecap="round" />
      {/* pontos (vogais) */}
      {[
        [100, 16],
        [92, 34],
        [108, 34],
        [168, 58],
        [150, 158],
        [40, 142],
        [52, 152],
        [30, 64],
        [100, 100],
        [122, 92],
        [84, 116],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill={cor} stroke="none" />
      ))}
    </svg>
  )
}
