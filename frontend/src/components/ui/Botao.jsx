import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'

const VARIANTES = {
  // Ciano brilhante — ação principal (Iniciar Missão, Próxima Questão, Nova Sessão)
  primario:
    'bg-cosmo-ciano text-espaco-900 font-semibold shadow-brilho hover:bg-[#7ee0ff] hover:shadow-brilho-forte disabled:bg-espaco-500 disabled:text-espaco-300 disabled:shadow-none',
  // Contorno — ações secundárias (Ver meu histórico, Ver todas as questões)
  secundario:
    'border border-cosmo-ciano/50 bg-espaco-800/40 text-cosmo-ciano font-semibold hover:border-cosmo-ciano hover:bg-cosmo-ciano/10 disabled:opacity-50',
  // Texto — ações terciárias (Voltar ao início, Encerrar sessão)
  fantasma:
    'text-espaco-200 hover:text-white underline-offset-4 hover:underline disabled:opacity-50',
  perigo:
    'bg-erro/90 text-espaco-900 font-semibold hover:bg-erro disabled:opacity-50',
}

const TAMANHOS = {
  sm: 'h-9 px-4 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-6 text-base rounded-xl gap-2',
  lg: 'h-14 px-8 text-lg rounded-2xl gap-3',
}

/**
 * Botão padrão. Vira <Link> quando recebe `para`.
 * @param {{ variante?: keyof typeof VARIANTES, tamanho?: keyof typeof TAMANHOS, para?: string, carregando?: boolean, icone?: React.ReactNode, iconeFim?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Botao({
  variante = 'primario',
  tamanho = 'md',
  para,
  carregando = false,
  icone,
  iconeFim,
  className = '',
  children,
  disabled,
  type = 'button',
  ...resto
}) {
  const classes = `inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`
  const conteudo = (
    <>
      {carregando ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> : icone}
      {children}
      {!carregando && iconeFim}
    </>
  )
  if (para && !disabled) {
    return (
      <Link to={para} className={classes} {...resto}>
        {conteudo}
      </Link>
    )
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {conteudo}
    </button>
  )
}
