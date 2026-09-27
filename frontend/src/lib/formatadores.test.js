import { describe, expect, it } from 'vitest'
import { formatarCronometro, formatarDuracao, formatarPercentual, plural } from './formatadores.js'
import { mensagemDeDesempenho } from './doctorWho.js'
import { planetaDoTopico } from './visualTopico.js'

describe('formatadores', () => {
  it('cronômetro mm:ss e h:mm:ss', () => {
    expect(formatarCronometro(107)).toBe('01:47')
    expect(formatarCronometro(503)).toBe('08:23')
    expect(formatarCronometro(3725)).toBe('1:02:05')
    expect(formatarCronometro(-3)).toBe('00:00')
  })

  it('duração legível', () => {
    expect(formatarDuracao(43)).toBe('43s')
    expect(formatarDuracao(760)).toBe('12min 40s')
    expect(formatarDuracao(760, { curto: true })).toBe('12min')
    expect(formatarDuracao(12240)).toBe('3h 24min')
    expect(formatarDuracao(7200)).toBe('2h')
  })

  it('percentual', () => {
    expect(formatarPercentual(85)).toBe('85%')
    expect(formatarPercentual(66.7, 1)).toBe('66,7%')
    expect(formatarPercentual(null)).toBe('—')
  })

  it('plural', () => {
    expect(plural(1, 'erro')).toBe('1 erro')
    expect(plural(3, 'questão', 'questões')).toBe('3 questões')
  })
})

describe('mensagens e visual', () => {
  it('faixas de desempenho', () => {
    expect(mensagemDeDesempenho(95).titulo).toBe('Fantástico!')
    expect(mensagemDeDesempenho(85).titulo).toBe('Brilhante!')
    expect(mensagemDeDesempenho(60).titulo).toBe('Allons-y!')
    expect(mensagemDeDesempenho(10).titulo).toBe('Geronimo!')
  })

  it('planeta estável por tópico (ids numéricos ou texto)', () => {
    expect(planetaDoTopico({ id: 1 })).toBe(planetaDoTopico({ id: 1 }))
    expect(planetaDoTopico({ id: 1 })).not.toBe(planetaDoTopico({ id: 2 }))
    expect(planetaDoTopico({ id: 'variaveis' }).src).toBeTruthy()
  })
})
