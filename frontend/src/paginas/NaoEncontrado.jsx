import { Home } from 'lucide-react'
import { Botao } from '../components/ui/Botao.jsx'
import { AneisGallifreyanos } from '../components/whovian/AneisGallifreyanos.jsx'
import { Tardis } from '../components/whovian/Tardis.jsx'

/** 404 — rota inexistente. */
export default function NaoEncontrado() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="relative grid place-items-center">
        <AneisGallifreyanos className="absolute w-72 text-cosmo-ciano/15" />
        {/* Vórtice: a TARDIS gira devagar enquanto flutua */}
        <div className="animate-flutuar">
          <div className="animate-[girar_14s_linear_infinite]">
            <Tardis className="w-24 drop-shadow-[0_0_28px_rgba(59,130,214,0.7)]" titulo="TARDIS à deriva" />
          </div>
        </div>
      </div>
      <p className="rotulo mt-10">Erro 404</p>
      <h1 className="font-display text-3xl tracking-wide text-white sm:text-4xl">
        Você se perdeu no Vórtice do Tempo
      </h1>
      <p className="text-espaco-200">
        Esta página não existe… ou ainda não existe.{' '}
        <em className="whitespace-nowrap text-cosmo-gelo">Wibbly wobbly, timey wimey.</em>
      </p>
      <Botao para="/" icone={<Home className="h-5 w-5" aria-hidden />}>
        Voltar ao início
      </Botao>
    </div>
  )
}
