const GENDER_ERRORS = {
  'rojo': 'roja',
  'roja': 'rojo',
  'negro': 'negra',
  'negra': 'negro',
  'blanco': 'blanca',
  'blanca': 'blanco',
  'azul': 'azul',
  'verde': 'verde',
  'grande': 'grande',
  'pequeño': 'pequeña',
  'pequeña': 'pequeño',
  'bueno': 'buena',
  'buena': 'bueno',
  'nuevo': 'nueva',
  'nueva': 'nuevo',
}

const DIGIT_MAP = {
  '0': 'cero', '1': 'uno', '2': 'dos', '3': 'tres', '4': 'cuatro',
  '5': 'cinco', '6': 'seis', '7': 'siete', '8': 'ocho', '9': 'nueve',
}

function normalize(text) {
  return text.toLowerCase().trim().replace(/[¿¡]/g, '').replace(/\s+/g, ' ').replace(/\d/g, (d) => DIGIT_MAP[d] ?? d)
}

const ARTICLE_ERRORS = {
  'el': 'la',
  'la': 'el',
  'un': 'una',
  'una': 'un',
}

export default function WritingFeedback({ userAnswer, expectedAnswer }) {
  const normalizedUser = normalize(userAnswer)
  const normalizedExpected = normalize(expectedAnswer)
  const userWords = normalizedUser.split(' ')
  const expectedWords = normalizedExpected.split(' ')

  const hints = []

  // Check for gender agreement errors
  Object.entries(GENDER_ERRORS).forEach(([wrong, right]) => {
    if (userWords.includes(wrong) && expectedWords.includes(right)) {
      hints.push(`Gender agreement: "${wrong}" should be "${right}".`)
    }
  })

  // Check for article errors
  Object.entries(ARTICLE_ERRORS).forEach(([wrong, right]) => {
    if (userWords.includes(wrong) && expectedWords.includes(right)) {
      hints.push(`Article mismatch: "${wrong}" should be "${right}".`)
    }
  })

  // Check missing words
  expectedWords.forEach((word) => {
    if (!userWords.includes(word)) {
      hints.push(`Missing word: "${word}".`)
    }
  })

  // Check extra words
  userWords.forEach((word) => {
    if (!expectedWords.includes(word)) {
      hints.push(`Extra word: "${word}".`)
    }
  })

  // Accent hint
  const accentMap = {
    'esta': 'está',
    'estan': 'están',
    'si': 'sí',
    'tu': 'tú',
    'el': 'él',
    'como': 'cómo',
    'que': 'qué',
    'cual': 'cuál',
    'cuando': 'cuándo',
    'donde': 'dónde',
  }
  Object.entries(accentMap).forEach(([wrong, right]) => {
    if (userWords.includes(wrong) && expectedWords.includes(right)) {
      hints.push(`Accent: "${wrong}" should be "${right}".`)
    }
  })

  const uniqueHints = [...new Set(hints)].slice(0, 3)

  if (uniqueHints.length === 0) {
    return <p className="mt-1 text-sm text-origen-carbon/60">You wrote: {userAnswer}</p>
  }

  return (
    <div className="mt-2 space-y-1">
      <p className="text-sm text-origen-carbon/60">You wrote: {userAnswer}</p>
      <div className="mt-2 space-y-1">
        {uniqueHints.map((hint, i) => (
          <p key={i} className="text-xs font-bold text-origen-granate">{hint}</p>
        ))}
      </div>
    </div>
  )
}
