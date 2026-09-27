import { createContext, useContext, useMemo } from 'react'
import { buscarAlunoAtual } from '../api/gallifrey.js'
import { useRecurso } from '../hooks/useRecurso.js'

/**
 * Aluno autenticado (vem da Cosmo). A autenticação em si é da plataforma Cosmo:
 * o Gallifrey só envia o token (ver api/cliente.js) e lê GET /alunos/me.
 */
const AlunoContexto = createContext({ aluno: null, erro: null, carregando: true, recarregar: () => {} })

export function ProvedorAluno({ children }) {
  const { dados, erro, carregando, recarregar } = useRecurso((sinal) => buscarAlunoAtual(sinal), [])
  const valor = useMemo(
    () => ({ aluno: dados ?? null, erro, carregando, recarregar }),
    [dados, erro, carregando, recarregar],
  )
  return <AlunoContexto.Provider value={valor}>{children}</AlunoContexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAluno = () => useContext(AlunoContexto)
