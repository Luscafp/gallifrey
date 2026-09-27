/**
 * Formatação para exibição (pt-BR, fuso local do aluno). Os dados da API chegam em UTC/segundos.
 */

const dois = (n) => String(n).padStart(2, '0')

/** 107 → "01:47"; 3725 → "1:02:05" */
export function formatarCronometro(segundos) {
  const s = Math.max(0, Math.floor(segundos || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return h ? `${h}:${dois(m)}:${dois(r)}` : `${dois(m)}:${dois(r)}`
}

/** Duração legível: 43 → "43s"; 760 → "12min 40s"; 12240 → "3h 24min" */
export function formatarDuracao(segundos, { curto = false } = {}) {
  const s = Math.max(0, Math.round(segundos || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h) return m ? `${h}h ${m}min` : `${h}h`
  if (m) return curto || !r ? `${m}min` : `${m}min ${r}s`
  return `${r}s`
}

/** 85 → "85%"; 78.5 → "78,5%"; null → "—" */
export function formatarPercentual(valor, casas = 0) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  const arredondado = casas ? Number(valor.toFixed(casas)) : Math.round(valor)
  return `${arredondado.toLocaleString('pt-BR')}%`
}

/** "20 de abril de 2026" */
export function formatarData(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** "20 de abril de 2026 • 14:32" */
export function formatarDataHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${formatarData(iso)} • ${hora}`
}

/** "20/04" — rótulos curtos de gráfico */
export function formatarDiaMes(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** 5 → "5ª" */
export const ordinal = (n) => `${n}ª`

/** Singular/plural simples: plural(1, 'erro') → "1 erro"; plural(3, 'questão', 'questões') → "3 questões" */
export function plural(n, singular, pluralForma = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForma}`
}

export const ROTULO_NIVEL = {
  ANALISE: 'Análise',
  AVALIACAO: 'Avaliação',
}

export const ROTULO_STATUS = {
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  ENCERRADA_MANUALMENTE: 'Encerrada antes do fim',
}
