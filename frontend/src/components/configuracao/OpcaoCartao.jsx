/**
 * Cartão selecionável com semântica de radio (nível cognitivo).
 * @param {{ nome: string, valor: string, marcado: boolean, aoSelecionar: (v:string) => void, titulo: string, descricao: string, icone: React.ComponentType<{className?:string}> }} props
 */
export function OpcaoCartao({ nome, valor, marcado, aoSelecionar, titulo, descricao, icone: Icone }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cosmo-ciano ${
        marcado
          ? 'border-cosmo-ciano/80 bg-cosmo-ciano/10 shadow-brilho'
          : 'border-espaco-500/70 bg-espaco-850/80 hover:border-cosmo-ciano/50'
      }`}
    >
      <input
        type="radio"
        name={nome}
        value={valor}
        checked={marcado}
        onChange={() => aoSelecionar(valor)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
          marcado ? 'border-cosmo-ciano' : 'border-espaco-400'
        }`}
      >
        {marcado && <span className="h-2.5 w-2.5 rounded-full bg-cosmo-ciano" />}
      </span>
      <Icone className={`h-7 w-7 shrink-0 ${marcado ? 'text-cosmo-ciano' : 'text-espaco-300'}`} aria-hidden />
      <span className="flex flex-col">
        <span className={`font-semibold ${marcado ? 'text-white' : 'text-cosmo-gelo'}`}>{titulo}</span>
        <span className="text-xs leading-snug text-espaco-200">{descricao}</span>
      </span>
    </label>
  )
}
