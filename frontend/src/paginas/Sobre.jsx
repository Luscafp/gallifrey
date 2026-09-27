import { BarChart3, Clock, GraduationCap, Hourglass, Layers, Rocket, Target } from 'lucide-react'
import { Astronauta } from '../components/cosmo/Astronauta.jsx'
import { imgLogoCosmo, imgPython } from '../components/cosmo/imagens.js'
import { Botao } from '../components/ui/Botao.jsx'
import { AneisGallifreyanos } from '../components/whovian/AneisGallifreyanos.jsx'
import { Tardis } from '../components/whovian/Tardis.jsx'
import { PLANETAS } from '../lib/visualTopico.js'

/** Os 4 dados coletados e seus objetivos (Documentação Funcional §2). */
const DADOS_COLETADOS = [
  {
    icone: Clock,
    titulo: 'Tempo em cada questão',
    objetivo:
      'Mostra em quais questões você gasta mais tempo — um indicador da dificuldade real que você percebe, independente da dificuldade cadastrada.',
  },
  {
    icone: Hourglass,
    titulo: 'Tempo total resolvendo questões',
    objetivo:
      'Mede quanto tempo você fica estudando, para entender se o engajamento está adequado ou se algo atrapalha a permanência.',
  },
  {
    icone: Rocket,
    titulo: 'Número de sessões',
    objetivo:
      'Mostra quantas vezes você usou a ferramenta, separando o estudo contínuo do estudo concentrado antes de uma prova.',
  },
  {
    icone: Target,
    titulo: 'Acertos e erros',
    objetivo:
      'Identifica em quais questões e assuntos você tem mais dificuldade, para apontar o que vale revisar.',
  },
]

/** Página "Sobre": o que é o Gallifrey, transparência sobre os dados e a origem do nome. */
export default function Sobre() {
  return (
    <div className="relative isolate mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6">
      <img
        src={PLANETAS.netuno.src}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-10 top-4 -z-10 hidden w-32 animate-flutuar opacity-70 md:block"
      />
      <img
        src={PLANETAS.venus.src}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-16 top-[42%] -z-10 hidden w-20 animate-flutuar opacity-60 [animation-delay:2s] lg:block"
      />

      <header>
        <p className="rotulo">Sobre o projeto</p>
        <h1 className="mt-2 font-display text-3xl tracking-wide text-white sm:text-5xl">O que é o Gallifrey?</h1>
        <p className="mt-5 text-lg leading-relaxed text-espaco-200">
          O Gallifrey aplica <strong className="text-white">missões</strong> — sessões de questões de múltipla
          escolha — sobre a disciplina de <strong className="text-white">Algoritmos I</strong> do curso ABI
          Ciência da Computação e IA. As questões são organizadas por <strong className="text-white">tópico</strong>{' '}
          (Variáveis, Condicionais, Operadores…) e por <strong className="text-white">nível cognitivo</strong> da
          Taxonomia de Bloom (Análise e Avaliação).
        </p>
      </header>

      <section aria-labelledby="titulo-como" className="mt-10 grid gap-4 sm:grid-cols-3">
        <h2 id="titulo-como" className="sr-only">
          Como funciona
        </h2>
        <Passo numero="1" icone={Layers} titulo="Configure a missão">
          Escolha os tópicos, o nível cognitivo e quantas questões quer responder.
        </Passo>
        <Passo numero="2" icone={Target} titulo="Responda e aprenda">
          Cada resposta traz a justificativa de todas as alternativas na hora.
        </Passo>
        <Passo numero="3" icone={BarChart3} titulo="Acompanhe a evolução">
          Veja seu desempenho por tópico e sua trajetória ao longo das sessões.
        </Passo>
      </section>

      <section aria-labelledby="titulo-cosmo" className="painel mt-10 flex flex-col items-center gap-6 p-6 sm:flex-row">
        <img src={imgLogoCosmo} alt="Cosmo" className="w-48 shrink-0" />
        <div>
          <h2 id="titulo-cosmo" className="text-xl font-semibold text-white">
            Parte da plataforma Cosmo
          </h2>
          <p className="mt-2 leading-relaxed text-espaco-200">
            O Gallifrey é um módulo da Cosmo, a plataforma de aprendizado de programação em Python. Você entra com a
            mesma conta da Cosmo, e cada missão vira mais um planeta explorado na sua jornada.
          </p>
        </div>
        <img src={imgPython} alt="" aria-hidden className="hidden w-12 shrink-0 sm:block" />
      </section>

      <section aria-labelledby="titulo-dados" className="mt-12">
        <h2 id="titulo-dados" className="text-2xl font-semibold text-white">
          Quais dados coletamos e por quê
        </h2>
        <p className="mt-2 text-espaco-200">
          Transparência em primeiro lugar: durante cada sessão registramos apenas o necessário para gerar as suas
          métricas de desempenho.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {DADOS_COLETADOS.map(({ icone: Icone, titulo, objetivo }) => (
            <li key={titulo} className="painel flex gap-4 p-5">
              <Icone className="h-7 w-7 shrink-0 text-cosmo-ciano" aria-hidden />
              <div>
                <h3 className="font-semibold text-white">{titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-espaco-200">{objetivo}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-espaco-300">
          O tempo gasto lendo a justificativa depois de responder não entra no seu tempo. Cada resposta é salva assim
          que confirmada, então nada se perde se a aba fechar.
        </p>
      </section>

      <section
        aria-labelledby="titulo-nome"
        className="relative mt-12 overflow-hidden rounded-2xl border border-tardis-claro/40 bg-tardis/15 p-6 sm:p-8"
      >
        <AneisGallifreyanos className="pointer-events-none absolute -right-20 -top-20 w-72 text-tardis-claro/20" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <Tardis className="w-16 shrink-0 animate-flutuar" titulo="TARDIS" />
          <div>
            <h2 id="titulo-nome" className="font-display text-2xl tracking-wide text-white">
              Por que “Gallifrey”?
            </h2>
            <p className="mt-3 leading-relaxed text-espaco-200">
              Gallifrey é o planeta natal do Doctor, protagonista da série britânica{' '}
              <em className="text-cosmo-gelo">Doctor Who</em> — um Senhor do Tempo que viaja pelo espaço e pelo tempo
              na TARDIS. Aqui, cada sessão é uma viagem e o tempo é justamente um dos dados que mais importam.
            </p>
            <p className="mt-3 leading-relaxed text-espaco-200">
              E, como a TARDIS, o Gallifrey é <strong className="text-cosmo-lilas">maior por dentro</strong>: parece
              só um quiz, mas carrega muita informação sobre como você aprende.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-creditos" className="mt-12 flex flex-col items-center gap-6 text-center">
        <h2 id="titulo-creditos" className="flex items-center gap-2 text-lg font-semibold text-white">
          <GraduationCap className="h-5 w-5 text-cosmo-ciano" aria-hidden />
          Créditos
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-espaco-200">
          Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC), integrado à plataforma Cosmo. Ilustrações de
          planetas, foguetes e do pequeno astronauta: identidade visual da Cosmo. Doctor Who é marca registrada da
          BBC; as referências aqui são uma homenagem de fãs.
        </p>
        <Astronauta tamanho="w-16" fala="Pronto(a) para decolar?" />
        <Botao para="/missao/nova">Iniciar Missão</Botao>
      </section>
    </div>
  )
}

function Passo({ numero, icone: Icone, titulo, children }) {
  return (
    <div className="painel p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-cosmo-ciano/15 font-display text-sm text-cosmo-ciano">
          {numero}
        </span>
        <Icone className="h-5 w-5 text-cosmo-ciano" aria-hidden />
      </div>
      <h3 className="mt-3 font-semibold text-white">{titulo}</h3>
      <p className="mt-1 text-sm leading-relaxed text-espaco-200">{children}</p>
    </div>
  )
}
