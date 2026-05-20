/**
 * Compute the Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a, b) {
  const matrix = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

/**
 * Normalized similarity between 0 and 1.
 * 1 = identical, 0 = completely different.
 */
export function similarity(a, b) {
  if (!a && !b) return 1
  if (!a || !b) return 0
  const dist = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length)
  return maxLen === 0 ? 1 : 1 - dist / maxLen
}

/**
 * Token-based similarity (word level).
 * Useful for languages where word order matters less or for longer phrases.
 */
export function tokenSimilarity(a, b) {
  const tokensA = a.toLowerCase().trim().split(/\s+/)
  const tokensB = b.toLowerCase().trim().split(/\s+/)
  const common = tokensA.filter((t) => tokensB.includes(t)).length
  return common / Math.max(tokensA.length, tokensB.length)
}

/**
 * Combined evaluation score for Spanish writing/speaking.
 * Returns: 'correct' | 'close' | 'incorrect'
 * Thresholds tuned for Spanish with possible Whisper errors (~17% WER).
 */
export function evaluateSpanishAnswer(user, expected) {
  const normUser = user.toLowerCase().trim().replace(/[¿¡.,]/g, '').replace(/\s+/g, ' ')
  const normExpected = expected.toLowerCase().trim().replace(/[¿¡.,]/g, '').replace(/\s+/g, ' ')

  const charSim = similarity(normUser, normExpected)
  const wordSim = tokenSimilarity(normUser, normExpected)

  // Weighted combination: words matter more than characters
  const score = wordSim * 0.6 + charSim * 0.4

  if (score >= 0.92) return { status: 'correct', score }
  if (score >= 0.75) return { status: 'close', score }
  return { status: 'incorrect', score }
}
