import { Tardis } from '../whovian/Tardis.jsx'
import { AneisGallifreyanos } from '../whovian/AneisGallifreyanos.jsx'

/** Tela cheia exibida enquanto a sessão é criada ("vworp vworp"). */
export function OverlayMaterializando() {
  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-50 grid animate-surgir place-items-center bg-espaco-950/90 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center gap-6">
        <AneisGallifreyanos className="absolute left-1/2 top-1/2 -z-10 w-72 -translate-x-1/2 -translate-y-[62%] text-tardis-claro/30" />
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-tardis-claro/40 blur-3xl" />
          <Tardis className="w-20 animate-materializar" />
        </div>
        <p className="font-display text-lg tracking-wider text-cosmo-ciano">Materializando TARDIS…</p>
        <p className="text-sm text-espaco-200">Preparando as questões da sua missão</p>
      </div>
    </div>
  )
}
