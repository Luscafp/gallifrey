import { TextoComCodigo } from '../ui/TextoComCodigo.jsx'
import { BlocoCodigo } from './BlocoCodigo.jsx'
import { situacaoDosCodigos } from './logicaQuestao.js'

/**
 * Número da questão + enunciado + trechos de código (lado a lado quando há dois).
 * @param {{ questao: import('../../api/tipos.js').QuestaoPublica, ordem: number, alternativaCorreta?: string|null }} props
 */
export function EnunciadoQuestao({ questao, ordem, alternativaCorreta = null }) {
  const situacoes = situacaoDosCodigos(questao, alternativaCorreta)
  const codigos = questao.codigos ?? []
  // Lado a lado só quando os trechos são estreitos; linhas longas ficam empilhadas (sem rolagem lateral)
  const maiorLinha = Math.max(0, ...codigos.flatMap((c) => c.conteudo.split(/\r?\n/).map((l) => l.length)))
  const ladoALado = codigos.length === 2 && maiorLinha <= 30
  return (
    <div className="flex flex-col gap-6 [&_code]:[font-variant-ligatures:none]">
      <div className="flex items-start gap-4">
        <span className="shrink-0 rounded-lg bg-cosmo-ciano px-2.5 py-1 font-mono text-sm font-semibold text-espaco-900">
          #{String(ordem).padStart(2, '0')}
        </span>
        <h1 className="min-w-0 text-lg leading-relaxed text-white sm:text-xl">
          <TextoComCodigo texto={questao.enunciado} />
        </h1>
      </div>
      {codigos.length > 0 && (
        <div className={`grid gap-4 ${ladoALado ? 'md:grid-cols-2' : ''}`}>
          {codigos.map((c, i) => (
            <BlocoCodigo
              key={`${c.rotulo}-${i}`}
              codigo={c}
              situacao={situacoes ? situacoes[i] : null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
