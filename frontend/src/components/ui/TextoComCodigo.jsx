/**
 * Renderiza texto que pode conter `código inline` entre crases e quebras de linha "\n".
 * @param {{ texto: string, className?: string }} props
 */
export function TextoComCodigo({ texto = '', className = '' }) {
  const partes = String(texto).split(/(`[^`]+`)/g)
  return (
    <span className={`whitespace-pre-line ${className}`}>
      {partes.map((parte, i) =>
        parte.startsWith('`') && parte.endsWith('`') && parte.length > 1 ? (
          <code key={i} className="codigo-inline whitespace-pre">
            {parte.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{parte}</span>
        ),
      )}
    </span>
  )
}
