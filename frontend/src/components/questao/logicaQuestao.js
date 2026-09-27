/**
 * Regras puras da Tela de Questão (sem React) — testáveis isoladamente.
 */

const PALAVRAS_CHAVE = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
  'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in',
  'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
])

const EMBUTIDAS = new Set([
  'print', 'input', 'len', 'int', 'float', 'str', 'bool', 'type', 'range', 'list', 'dict', 'set',
  'tuple', 'abs', 'round', 'min', 'max', 'sum', 'isinstance', 'id', 'sorted', 'enumerate', 'zip',
  'map', 'filter', 'divmod', 'pow', 'ord', 'chr', 'repr', 'format',
])

const PADRAO = new RegExp(
  [
    '(?<comentario>#[^\\n]*)',
    '(?<texto>[rRbBfF]{0,2}(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"?|\'(?:\\\\.|[^\'\\\\\\n])*\'?))',
    '(?<numero>\\b\\d+(?:\\.\\d*)?(?:[eE][+-]?\\d+)?j?\\b|\\.\\d+\\b)',
    '(?<nome>[A-Za-z_À-ÿ][\\wÀ-ÿ]*)',
    '(?<operador>\\*\\*=?|//=?|==|!=|<=|>=|->|[+\\-*/%<>=&|^~]=?)',
    '(?<espaco>\\s+)',
    '(?<outro>.)',
  ].join('|'),
  'gu',
)

/**
 * Divide código Python em tokens para realce de sintaxe (tokenizador simples, sem dependências).
 * @param {string} codigo
 * @returns {{tipo: 'palavra'|'embutida'|'texto'|'numero'|'comentario'|'operador'|'nome'|'outro'|'espaco', valor: string}[]}
 */
export function tokenizarPython(codigo) {
  const tokens = []
  for (const m of String(codigo).matchAll(PADRAO)) {
    const [tipo, valor] = Object.entries(m.groups).find(([, v]) => v !== undefined)
    if (tipo === 'nome') {
      tokens.push({
        tipo: PALAVRAS_CHAVE.has(valor) ? 'palavra' : EMBUTIDAS.has(valor) ? 'embutida' : 'nome',
        valor,
      })
    } else {
      tokens.push({ tipo, valor })
    }
  }
  return tokens
}

/**
 * Para questões "Código A × Código B", tenta inferir se cada trecho está correto a partir do texto
 * da alternativa correta. Só retorna algo quando o mapeamento é inequívoco; caso contrário, null.
 * @param {{codigos: {rotulo: string}[], alternativas: {id: string, texto: string}[]}} questao
 * @param {string|null} alternativaCorreta
 * @returns {('correto'|'incorreto')[] | null}
 */
export function situacaoDosCodigos(questao, alternativaCorreta) {
  if (!alternativaCorreta || questao.codigos?.length !== 2) return null
  const texto = questao.alternativas.find((a) => a.id === alternativaCorreta)?.texto ?? ''
  const t = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
  if (/^apenas o codigo a (esta|e) corret/.test(t)) return ['correto', 'incorreto']
  if (/^apenas o codigo b (esta|e) corret/.test(t)) return ['incorreto', 'correto']
  if (/^ambos (estao|sao) corretos/.test(t)) return ['correto', 'correto']
  if (/^ambos (estao|sao) incorretos/.test(t)) return ['incorreto', 'incorreto']
  return null
}

/**
 * Calcula o estado de cada letra após a resposta.
 * @param {string} letra @param {string|null} escolhida @param {string|null} correta
 * @returns {import('./CartaoAlternativa.jsx').EstadoAlternativa}
 */
export function estadoDaAlternativa(letra, escolhida, correta) {
  if (!correta) return 'neutra'
  if (letra === correta) return letra === escolhida ? 'correta-escolhida' : 'correta'
  if (letra === escolhida) return 'escolhida-errada'
  return 'apagada'
}
