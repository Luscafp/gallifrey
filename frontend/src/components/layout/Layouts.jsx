import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { CampoEstelar } from './CampoEstelar.jsx'
import { Cabecalho } from './Cabecalho.jsx'

/** Fundo espacial + restauração de rolagem, comum a todas as telas. */
export function LayoutRaiz() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.getElementById('conteudo')?.focus({ preventScroll: true })
  }, [pathname])
  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-lg bg-cosmo-ciano px-4 py-2 text-espaco-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <CampoEstelar />
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}

/** Cabeçalho padrão + área de conteúdo. */
export function LayoutPadrao() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
    </>
  )
}
