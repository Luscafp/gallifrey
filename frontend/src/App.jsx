import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { config } from './config.js'
import { ProvedorAluno } from './contexto/AlunoContexto.jsx'
import { LayoutRaiz, LayoutPadrao } from './components/layout/Layouts.jsx'
import { Carregando } from './components/ui/Carregando.jsx'

const Inicio = lazy(() => import('./paginas/Inicio.jsx'))
const ConfigurarMissao = lazy(() => import('./paginas/ConfigurarMissao.jsx'))
const Questao = lazy(() => import('./paginas/Questao.jsx'))
const Resultados = lazy(() => import('./paginas/Resultados.jsx'))
const Revisao = lazy(() => import('./paginas/Revisao.jsx'))
const Historico = lazy(() => import('./paginas/Historico.jsx'))
const Sobre = lazy(() => import('./paginas/Sobre.jsx'))
const NaoEncontrado = lazy(() => import('./paginas/NaoEncontrado.jsx'))

const pagina = (Componente) => (
  <Suspense fallback={<Carregando />}>
    <Componente />
  </Suspense>
)

/**
 * Rotas (ver docs/diagramas/fluxos_gallifrey-01 - Fluxo Geral de Navegação):
 *   /                              Tela Inicial
 *   /missao/nova                   Configurar Missão
 *   /missao/:sessaoId              Tela de Questão (sessão em andamento)
 *   /missao/:sessaoId/resultado    Tela de Resultados
 *   /missao/:sessaoId/revisao      "Ver todas as questões" (?filtro=erradas para só as erradas)
 *   /historico                     Histórico de Sessões
 *   /sobre                         Sobre o Gallifrey
 */
const roteador = createBrowserRouter(
  [
    {
      element: <LayoutRaiz />,
      children: [
        // A Tela de Questão tem cabeçalho próprio (compacto, com barra de progresso)
        { path: 'missao/:sessaoId', element: pagina(Questao) },
        {
          element: <LayoutPadrao />,
          children: [
            { index: true, element: pagina(Inicio) },
            { path: 'missao/nova', element: pagina(ConfigurarMissao) },
            { path: 'missao/:sessaoId/resultado', element: pagina(Resultados) },
            { path: 'missao/:sessaoId/revisao', element: pagina(Revisao) },
            { path: 'historico', element: pagina(Historico) },
            { path: 'sobre', element: pagina(Sobre) },
            { path: '*', element: pagina(NaoEncontrado) },
          ],
        },
      ],
    },
  ],
  { basename: config.basePath.replace(/\/$/, '') || '/' },
)

export default function App() {
  return (
    <ProvedorAluno>
      <RouterProvider router={roteador} />
    </ProvedorAluno>
  )
}
