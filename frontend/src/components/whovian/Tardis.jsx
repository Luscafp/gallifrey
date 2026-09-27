/**
 * TARDIS estilizada (desenho próprio, sem arte oficial da série).
 * @param {{ className?: string, titulo?: string }} props
 */
export function Tardis({ className = 'w-10', titulo }) {
  return (
    <svg
      viewBox="0 0 60 100"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
    >
      {/* luz do topo */}
      <rect x="27" y="1" width="6" height="7" rx="1.5" fill="#EDF3F8" />
      <rect x="25.5" y="7" width="9" height="2.5" rx="1" fill="#1d4e9e" />
      <circle cx="30" cy="4.5" r="5" fill="#51D4FE" opacity="0.35" />
      {/* telhado */}
      <path d="M8 16 L30 9.5 L52 16 Z" fill="#1d4e9e" />
      <rect x="6" y="15.5" width="48" height="4" rx="1" fill="#17407f" />
      {/* placa */}
      <rect x="6" y="19.5" width="48" height="7" fill="#0b1033" />
      <rect x="14" y="21.8" width="32" height="2.4" rx="1" fill="#EDF3F8" opacity="0.9" />
      {/* corpo */}
      <rect x="6" y="26.5" width="48" height="67" fill="#1d4e9e" />
      <rect x="4" y="91" width="52" height="6" rx="1" fill="#17407f" />
      {/* colunas */}
      <rect x="6" y="26.5" width="4" height="67" fill="#17407f" />
      <rect x="50" y="26.5" width="4" height="67" fill="#17407f" />
      <rect x="29" y="26.5" width="2" height="67" fill="#17407f" />
      {/* janelas */}
      {[12, 32].map((x) => (
        <g key={x}>
          <rect x={x} y="30" width="16" height="11" rx="0.8" fill="#EDF3F8" opacity="0.92" />
          <path d={`M${x + 8} 30 V41 M${x} 35.5 H${x + 16}`} stroke="#1d4e9e" strokeWidth="1.2" />
        </g>
      ))}
      {/* painéis */}
      {[45, 60, 75].map((y) =>
        [12, 32].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="16"
            height="12"
            rx="0.8"
            fill="none"
            stroke="#3b82d6"
            strokeWidth="1.2"
          />
        )),
      )}
      {/* aviso na porta */}
      <rect x="14" y="46.5" width="12" height="9" rx="0.5" fill="#EDF3F8" opacity="0.85" />
      <rect x="27" y="60" width="1.6" height="4" rx="0.8" fill="#EDF3F8" />
    </svg>
  )
}
