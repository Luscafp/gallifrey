import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, UserRound, X } from 'lucide-react'
import { Logo } from './Logo.jsx'
import { useAluno } from '../../contexto/AlunoContexto.jsx'
import { config } from '../../config.js'

const LINKS = [
  { para: '/', rotulo: 'Início', fim: true },
  { para: '/historico', rotulo: 'Histórico' },
]

/**
 * Barra superior. `compacto` reduz a altura (usada na Tela de Questão, que precisa de espaço).
 * @param {{ compacto?: boolean, children?: React.ReactNode }} props  children aparece abaixo (ex.: barra de progresso)
 */
export function Cabecalho({ compacto = false, children }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const { aluno } = useAluno()

  const classeLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive ? 'font-semibold text-cosmo-ciano' : 'text-espaco-200 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-30 border-b border-espaco-500/50 bg-espaco-900/80 backdrop-blur-md">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 ${compacto ? 'h-14' : 'h-16'}`}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-lg" aria-label="Gallifrey — página inicial">
            <Logo />
          </Link>
          {config.usarMock && (
            <span
              title="Backend simulado no navegador (VITE_API_MOCK=true)"
              className="hidden rounded-md bg-cosmo-magenta/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cosmo-magenta/80 sm:inline"
            >
              dados simulados
            </span>
          )}
        </div>

        <nav aria-label="Principal" className="hidden items-center gap-2 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.para} to={l.para} end={l.fim} className={classeLink}>
              {l.rotulo}
            </NavLink>
          ))}
          <span
            title={aluno ? `${aluno.nome} · ${aluno.email}` : 'Aluno'}
            className="ml-4 grid h-10 w-10 place-items-center rounded-full border-2 border-cosmo-ciano/80 text-cosmo-ciano shadow-brilho"
          >
            {aluno?.nome ? (
              <span className="text-sm font-bold">{iniciais(aluno.nome)}</span>
            ) : (
              <UserRound className="h-5 w-5" aria-hidden />
            )}
          </span>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-espaco-200 md:hidden"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto((v) => !v)}
        >
          {menuAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAberto && (
        <nav
          aria-label="Principal (móvel)"
          className="flex flex-col gap-1 border-t border-espaco-500/50 px-4 py-3 md:hidden"
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.para}
              to={l.para}
              end={l.fim}
              className={classeLink}
              onClick={() => setMenuAberto(false)}
            >
              {l.rotulo}
            </NavLink>
          ))}
        </nav>
      )}
      {children}
    </header>
  )
}

const CONECTIVOS = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])

function iniciais(nome) {
  return nome
    .split(/\s+/)
    .filter((p) => /^[A-Za-zÀ-ÿ]/.test(p) && !CONECTIVOS.has(p.toLowerCase()))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
