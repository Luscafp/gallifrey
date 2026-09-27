import { CheckCircle2, XCircle } from 'lucide-react'
import { TextoComCodigo } from '../ui/TextoComCodigo.jsx'
import { Tardis } from '../whovian/Tardis.jsx'
import { formatarDuracao } from '../../lib/formatadores.js'

/**
 * Feedback após a resposta: correto/incorreto + justificativa de cada alternativa.
 * @param {{ correta: boolean, escolhida: string, justificativas: {alternativa: string, texto: string, correta: boolean}[], tempoGastoSegundos?: number, anunciar?: boolean, className?: string }} props
 *   anunciar: usa aria-live para leitores de tela (desligar em listas, como na Revisão)
 */
export function PainelFeedback({ correta, escolhida, justificativas, tempoGastoSegundos, anunciar = true, className = '' }) {
  return (
    <section
      aria-live={anunciar ? 'polite' : undefined}
      className={`painel relative overflow-hidden p-5 [&_code]:[font-variant-ligatures:none] ${correta ? 'border-acerto/50' : 'border-erro/50'} ${className}`}
    >
      <header className="flex flex-wrap items-center gap-3">
        {correta ? (
          <CheckCircle2 className="h-7 w-7 text-acerto" aria-hidden />
        ) : (
          <XCircle className="h-7 w-7 text-erro" aria-hidden />
        )}
        <h2 className={`text-lg font-semibold ${correta ? 'text-acerto' : 'text-erro'}`}>
          {correta ? 'Resposta correta!' : 'Resposta incorreta'}
        </h2>
        {correta && <span className="text-sm font-medium text-cosmo-creme">Fantástico!</span>}
        {tempoGastoSegundos !== undefined && (
          <span className="ml-auto rounded-full border border-espaco-500 px-2.5 py-0.5 text-xs text-espaco-200">
            {formatarDuracao(tempoGastoSegundos)} nesta questão
          </span>
        )}
      </header>

      <p className="rotulo mt-4 border-t border-espaco-500/60 pt-3 text-espaco-200">
        Justificativa das alternativas
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {justificativas.map((j) => {
          const cor = j.correta
            ? 'bg-acerto text-espaco-900'
            : j.alternativa === escolhida
              ? 'bg-erro text-white'
              : 'bg-espaco-600 text-espaco-200'
          return (
            <li key={j.alternativa} className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${cor}`}
                aria-hidden
              >
                {j.alternativa}
              </span>
              <p className={`text-sm leading-relaxed ${j.correta ? 'text-cosmo-gelo' : 'text-espaco-200'}`}>
                <span className="sr-only">
                  Alternativa {j.alternativa}
                  {j.correta ? ' (correta)' : j.alternativa === escolhida ? ' (sua resposta)' : ''}:{' '}
                </span>
                <TextoComCodigo texto={j.texto} />
              </p>
            </li>
          )
        })}
      </ul>

      {correta && (
        <Tardis className="pointer-events-none absolute -bottom-2 right-3 w-8 opacity-20" />
      )}
    </section>
  )
}
