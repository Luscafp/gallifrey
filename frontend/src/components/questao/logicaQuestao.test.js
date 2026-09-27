import { describe, expect, it } from 'vitest'
import { estadoDaAlternativa, situacaoDosCodigos, tokenizarPython } from './logicaQuestao.js'

describe('tokenizarPython', () => {
  it('classifica palavras-chave, embutidas, textos, números, operadores e comentários', () => {
    const tokens = tokenizarPython('if x >= 10:\n    print("oi")  # fim').filter((t) => t.tipo !== 'espaco')
    expect(tokens.map((t) => [t.tipo, t.valor])).toEqual([
      ['palavra', 'if'],
      ['nome', 'x'],
      ['operador', '>='],
      ['numero', '10'],
      ['outro', ':'],
      ['embutida', 'print'],
      ['outro', '('],
      ['texto', '"oi"'],
      ['outro', ')'],
      ['comentario', '# fim'],
    ])
  })

  it('preserva o código original ao juntar os tokens', () => {
    const codigo = 'x = 3.7\nprint(int(x), f"{x}")\n'
    expect(tokenizarPython(codigo).map((t) => t.valor).join('')).toBe(codigo)
  })
})

describe('situacaoDosCodigos', () => {
  const questao = (texto) => ({
    codigos: [{ rotulo: 'Código A' }, { rotulo: 'Código B' }],
    alternativas: [{ id: 'A', texto }],
  })
  it('mapeia só quando o texto da correta é inequívoco', () => {
    expect(situacaoDosCodigos(questao('Apenas o Código B está correto; ...'), 'A')).toEqual(['incorreto', 'correto'])
    expect(situacaoDosCodigos(questao('Ambos estão corretos e são equivalentes.'), 'A')).toEqual(['correto', 'correto'])
    expect(situacaoDosCodigos(questao('O Código A usa if-else tradicional.'), 'A')).toBeNull()
    expect(situacaoDosCodigos(questao('Apenas o Código A está correto'), null)).toBeNull()
  })
})

describe('estadoDaAlternativa', () => {
  it('marca escolhida errada, correta e apagadas', () => {
    expect(estadoDaAlternativa('A', 'A', null)).toBe('neutra')
    expect(estadoDaAlternativa('A', 'A', 'B')).toBe('escolhida-errada')
    expect(estadoDaAlternativa('B', 'A', 'B')).toBe('correta')
    expect(estadoDaAlternativa('B', 'B', 'B')).toBe('correta-escolhida')
    expect(estadoDaAlternativa('C', 'A', 'B')).toBe('apagada')
  })
})
