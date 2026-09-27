/**
 * Referências a Doctor Who usadas nas mensagens do Gallifrey.
 * Gallifrey é o planeta natal do Doctor — por isso as sessões são "viagens" e o aluno, um(a) explorador(a).
 * Mantemos só frases curtas e bordões (sem imagens oficiais da série).
 */

/**
 * Título e mensagem de desempenho da Tela de Resultados, por faixa de aproveitamento.
 * @param {number} percentual 0–100
 */
export function mensagemDeDesempenho(percentual) {
  if (percentual >= 90)
    return {
      titulo: 'Fantástico!',
      texto: 'Desempenho digno de um Senhor do Tempo.',
      patente: 'Senhor(a) do Tempo',
    }
  if (percentual >= 75)
    return {
      titulo: 'Brilhante!',
      texto: 'Excelente desempenho — a TARDIS está orgulhosa.',
      patente: 'Companheiro(a) de viagem',
    }
  if (percentual >= 50)
    return {
      titulo: 'Allons-y!',
      texto: 'Bom caminho. Revise os pontos de atenção e siga viagem.',
      patente: 'Viajante do tempo',
    }
  return {
    titulo: 'Geronimo!',
    texto: 'Toda regeneração começa assim. Revise os tópicos e tente de novo.',
    patente: 'Cadete da Academia',
  }
}

/** Frases de carregamento ("materializando" a TARDIS). */
export const FRASES_CARREGAMENTO = [
  'Materializando a TARDIS…',
  'Calibrando o circuito camaleão…',
  'Atravessando o Vórtice do Tempo…',
  'Consultando a Matriz de Gallifrey…',
]

export const fraseAleatoria = (lista) => lista[Math.floor(Math.random() * lista.length)]
