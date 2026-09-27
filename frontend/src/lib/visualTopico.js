import andromeda from '../assets/cosmo/planets/andromeda.svg'
import jupiter from '../assets/cosmo/planets/jupiter.svg'
import marte from '../assets/cosmo/planets/marte.svg'
import mercurio from '../assets/cosmo/planets/mercurio.svg'
import netuno from '../assets/cosmo/planets/netuno.svg'
import saturno from '../assets/cosmo/planets/saturno.svg'
import terra from '../assets/cosmo/planets/terra.svg'
import urano from '../assets/cosmo/planets/urano.svg'
import venus from '../assets/cosmo/planets/venus.svg'

/**
 * Cada tópico é representado por um planeta da Cosmo (como na trilha "Noções básicas de Python").
 * O backend não precisa saber disso: o planeta é escolhido de forma estável a partir do id do tópico.
 */
export const PLANETAS = {
  andromeda: { src: andromeda, nome: 'Andrômeda', cor: '#8b5cf6' },
  netuno: { src: netuno, nome: 'Netuno', cor: '#38bdf8' },
  marte: { src: marte, nome: 'Marte', cor: '#f43f5e' },
  jupiter: { src: jupiter, nome: 'Júpiter', cor: '#fb923c' },
  terra: { src: terra, nome: 'Terra', cor: '#2dd4bf' },
  mercurio: { src: mercurio, nome: 'Mercúrio', cor: '#c4b5fd' },
  venus: { src: venus, nome: 'Vênus', cor: '#f59e0b' },
  saturno: { src: saturno, nome: 'Saturno', cor: '#a3e635' },
  urano: { src: urano, nome: 'Urano', cor: '#a78bfa' },
}

const ORDEM = Object.keys(PLANETAS)

/** @param {{id: number|string}} topico */
export function planetaDoTopico(topico) {
  const id = topico?.id ?? topico?.topico_id
  const n = typeof id === 'number' ? id - 1 : hash(String(id))
  return PLANETAS[ORDEM[((n % ORDEM.length) + ORDEM.length) % ORDEM.length]]
}

function hash(texto) {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

/**
 * Cor da barra de desempenho — mesma escala do protótipo:
 * verde ≥ 80%, ciano ≥ 60%, lavanda abaixo disso (tons frios, sem laranja).
 */
export function corDoPercentual(p) {
  if (p >= 80) return { barra: 'from-emerald-400 to-acerto', texto: 'text-acerto' }
  if (p >= 60) return { barra: 'from-sky-400 to-cosmo-ciano', texto: 'text-cosmo-ciano' }
  return { barra: 'from-indigo-400 to-atencao', texto: 'text-atencao' }
}
