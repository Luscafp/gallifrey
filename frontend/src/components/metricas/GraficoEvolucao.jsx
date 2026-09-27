import { useId, useState } from 'react'
import { useLargura } from './useLargura.js'
import { formatarDataHora, formatarPercentual } from '../../lib/formatadores.js'

const ALTURA = 210
const MARGEM = { topo: 28, direita: 24, base: 30, esquerda: 44 }
const TICKS = [0, 25, 50, 75, 100]

/**
 * Evolução do aproveitamento por sessão (série única, eixo 0–100%).
 * Linha 2px com curva monótona (não ultrapassa 0/100), área em ~10% de opacidade,
 * marcadores com anel na cor da superfície, rótulo direto só no último ponto,
 * crosshair + tooltip ao passar o mouse e tabela oculta para leitores de tela.
 *
 * @param {{ pontos: {sessao_id:any, numero:number, data_inicio:string, percentual_aproveitamento:number}[] }} props
 */
export function GraficoEvolucao({ pontos }) {
  const [ref, largura] = useLargura(560)
  const [ativo, setAtivo] = useState(null)
  const idGradiente = useId().replace(/:/g, '')

  if (!pontos?.length) {
    return <p className="py-10 text-center text-sm text-espaco-300">Sem sessões com respostas neste período.</p>
  }

  const larguraUtil = largura - MARGEM.esquerda - MARGEM.direita
  const alturaUtil = ALTURA - MARGEM.topo - MARGEM.base
  const x = (i) =>
    MARGEM.esquerda + (pontos.length === 1 ? larguraUtil / 2 : (i / (pontos.length - 1)) * larguraUtil)
  const y = (v) => MARGEM.topo + (1 - v / 100) * alturaUtil
  const coords = pontos.map((p, i) => [x(i), y(p.percentual_aproveitamento)])
  const linha = curvaMonotona(coords)
  const base = y(0)
  const area = `${linha} L${coords.at(-1)[0]},${base} L${coords[0][0]},${base} Z`

  // Mostra no máximo ~8 rótulos no eixo X para não colidir
  const passoRotulo = Math.max(1, Math.ceil(pontos.length / Math.max(2, Math.floor(larguraUtil / 56))))
  const ultimo = pontos.length - 1
  const resumo = `Aproveitamento por sessão, de ${formatarPercentual(pontos[0].percentual_aproveitamento)} na sessão ${pontos[0].numero} a ${formatarPercentual(pontos[ultimo].percentual_aproveitamento)} na sessão ${pontos[ultimo].numero}.`

  function aoMover(evento) {
    const caixa = evento.currentTarget.getBoundingClientRect()
    const px = evento.clientX - caixa.left
    let melhor = 0
    coords.forEach(([cx], i) => {
      if (Math.abs(cx - px) < Math.abs(coords[melhor][0] - px)) melhor = i
    })
    setAtivo(melhor)
  }

  const pontoAtivo = ativo !== null ? pontos[ativo] : null

  return (
    <div ref={ref} className="relative w-full">
      <svg
        width={largura}
        height={ALTURA}
        role="img"
        aria-label={resumo}
        className="block touch-none select-none"
        onPointerMove={aoMover}
        onPointerLeave={() => setAtivo(null)}
      >
        <defs>
          <linearGradient id={idGradiente} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#51D4FE" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#51D4FE" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {TICKS.map((t) => (
          <g key={t}>
            <line
              x1={MARGEM.esquerda}
              x2={largura - MARGEM.direita}
              y1={y(t)}
              y2={y(t)}
              stroke="#34427f"
              strokeWidth="1"
              opacity={t === 0 ? 0.9 : 0.45}
            />
            <text x={MARGEM.esquerda - 10} y={y(t) + 4} textAnchor="end" className="fill-espaco-300 text-[11px]">
              {t}%
            </text>
          </g>
        ))}

        {pontos.map((p, i) =>
          i % passoRotulo === 0 || i === ultimo ? (
            <text
              key={p.sessao_id}
              x={coords[i][0]}
              y={ALTURA - 8}
              textAnchor="middle"
              className={`text-[11px] ${i === ativo ? 'fill-white' : 'fill-espaco-300'}`}
            >
              S{p.numero}
            </text>
          ) : null,
        )}

        <path d={area} fill={`url(#${idGradiente})`} />
        <path d={linha} fill="none" stroke="#51D4FE" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {pontoAtivo && (
          <line
            x1={coords[ativo][0]}
            x2={coords[ativo][0]}
            y1={MARGEM.topo - 6}
            y2={base}
            stroke="#8b95c4"
            strokeWidth="1"
          />
        )}

        {coords.map(([cx, cy], i) => (
          <circle
            key={pontos[i].sessao_id}
            cx={cx}
            cy={cy}
            r={i === ativo || i === ultimo ? 6 : 4.5}
            fill="#51D4FE"
            stroke="#141e54"
            strokeWidth="2"
          />
        ))}

        {/* Rótulo direto só no último ponto (valor mais recente) */}
        {ativo === null && (
          <g transform={`translate(${Math.min(coords[ultimo][0], largura - MARGEM.direita - 22)}, ${coords[ultimo][1] - 26})`}>
            <rect x="-22" y="-2" width="44" height="20" rx="5" fill="#51D4FE" />
            <text x="0" y="12" textAnchor="middle" className="fill-espaco-900 text-[11px] font-semibold">
              {formatarPercentual(pontos[ultimo].percentual_aproveitamento)}
            </text>
          </g>
        )}
      </svg>

      {pontoAtivo && (
        <div
          className="pointer-events-none absolute z-10 w-max -translate-x-1/2 rounded-lg border border-espaco-500 bg-espaco-900/95 px-3 py-2 text-xs shadow-xl"
          style={{
            left: Math.min(Math.max(coords[ativo][0], 80), largura - 80),
            top: Math.max(0, coords[ativo][1] - 64),
          }}
        >
          <p className="font-semibold text-white">
            Sessão #{pontoAtivo.numero} · {formatarPercentual(pontoAtivo.percentual_aproveitamento)}
          </p>
          <p className="text-espaco-300">{formatarDataHora(pontoAtivo.data_inicio)}</p>
        </div>
      )}

      {/* Tabela para leitores de tela (<table> ignora a largura de 1px do sr-only, por isso o <div>) */}
      <div className="sr-only">
        <table>
          <caption>Aproveitamento por sessão</caption>
          <thead>
            <tr>
              <th scope="col">Sessão</th>
              <th scope="col">Data</th>
              <th scope="col">Aproveitamento</th>
            </tr>
          </thead>
          <tbody>
            {pontos.map((p) => (
              <tr key={p.sessao_id}>
                <td>#{p.numero}</td>
                <td>{formatarDataHora(p.data_inicio)}</td>
                <td>{formatarPercentual(p.percentual_aproveitamento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Caminho SVG com interpolação cúbica monótona (Fritsch–Carlson): suave, sem "overshoot".
 * @param {[number, number][]} p
 */
function curvaMonotona(p) {
  if (p.length === 1) return `M${p[0][0]},${p[0][1]}`
  const n = p.length
  const dx = [], m = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = p[i + 1][0] - p[i][0]
    m[i] = (p[i + 1][1] - p[i][1]) / dx[i]
  }
  const t = [m[0]]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  t[n - 1] = m[n - 2]
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
      continue
    }
    const a = t[i] / m[i]
    const b = t[i + 1] / m[i]
    const s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      t[i] = k * a * m[i]
      t[i + 1] = k * b * m[i]
    }
  }
  let d = `M${p[0][0]},${p[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += ` C${p[i][0] + h},${p[i][1] + t[i] * h} ${p[i + 1][0] - h},${p[i + 1][1] - t[i + 1] * h} ${p[i + 1][0]},${p[i + 1][1]}`
  }
  return d
}
