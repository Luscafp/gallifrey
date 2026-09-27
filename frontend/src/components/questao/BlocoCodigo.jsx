import { Check, X } from 'lucide-react'
import { tokenizarPython } from './logicaQuestao.js'

const CORES = {
  palavra: 'text-cosmo-ciano',
  embutida: 'text-sky-300',
  texto: 'text-emerald-300',
  numero: 'text-orange-300',
  comentario: 'text-espaco-300 italic',
  operador: 'text-cosmo-magenta/90',
  nome: 'text-cosmo-gelo',
  outro: 'text-espaco-200',
}

/**
 * Bloco de código com realce de sintaxe Python.
 * @param {{ codigo: {rotulo: string, linguagem?: string, conteudo: string}, situacao?: 'correto'|'incorreto'|null, className?: string }} props
 */
export function BlocoCodigo({ codigo, situacao = null, className = '' }) {
  const tokens = tokenizarPython(codigo.conteudo)
  const borda =
    situacao === 'correto'
      ? 'border-acerto/70'
      : situacao === 'incorreto'
        ? 'border-erro/70'
        : 'border-cosmo-ciano/60'
  return (
    <figure className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <figcaption className="flex min-h-6 items-center justify-between gap-2">
        <span className="rotulo">{codigo.rotulo}</span>
        {situacao && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              situacao === 'correto'
                ? 'border-acerto/60 bg-acerto-escuro text-acerto'
                : 'border-erro/60 bg-erro-escuro text-erro'
            }`}
          >
            {situacao === 'correto' ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
            {situacao === 'correto' ? 'Correto' : 'Incorreto'}
          </span>
        )}
      </figcaption>
      <div className={`min-w-0 rounded-xl border-2 bg-espaco-950/80 shadow-inner ${borda}`}>
        {/* Ligaduras desligadas: o aluno precisa ver exatamente `<=`, `==`, `!=` — não símbolos combinados */}
        <pre
          className="overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed [font-variant-ligatures:none] sm:px-5 sm:text-[0.95rem]"
          aria-label={`${codigo.rotulo} em ${codigo.linguagem ?? 'python'}`}
        >
          <code>
            {tokens.map((t, i) =>
              t.tipo === 'espaco' ? (
                t.valor
              ) : (
                <span key={i} className={CORES[t.tipo]}>
                  {t.valor}
                </span>
              ),
            )}
          </code>
        </pre>
      </div>
    </figure>
  )
}
