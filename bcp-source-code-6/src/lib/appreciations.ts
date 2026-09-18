// appreciations.ts
// Genere automatiquement une appreciation, tiree au hasard parmi trois, selon
// la note sur 10 de l'eleve. Utilise pour les activites notees automatiquement
// (Quiz, Glisser-deposer). La couleur d'affichage de la note et de l'appreciation
// est toujours le rouge de correction (voir ROUGE_CORRECTION).

export const ROUGE_CORRECTION = '#C1121F'

interface Tranche {
  min: number
  max: number
  textes: [string, string, string]
}

// Tranches selon la note sur 10 (notes par pas de 0,5).
const TRANCHES: Tranche[] = [
  {
    min: 9, max: 10,
    textes: [
      'Excellent travail ! Les compétences évaluées sont totalement maîtrisées. Bravo !',
      'Très belle réussite ! Les compétences sont parfaitement acquises et maîtrisées. Félicitations !',
      'Un travail remarquable ! Les compétences évaluées sont pleinement maîtrisées. Continuez ainsi !',
    ],
  },
  {
    min: 8, max: 8.5,
    textes: [
      'Très bon travail ! Les compétences évaluées sont bien maîtrisées. Quelques éléments restent à consolider.',
      'Bravo ! Les compétences sont solidement acquises. Poursuivez vos efforts pour atteindre une maîtrise complète.',
      'Un résultat très satisfaisant ! Les compétences sont bien maîtrisées malgré quelques petites erreurs.',
    ],
  },
  {
    min: 6, max: 7.5,
    textes: [
      'Bon travail ! Les compétences évaluées sont globalement acquises. Quelques éléments restent à consolider.',
      'Résultat satisfaisant ! Les principales compétences sont maîtrisées, mais certains points restent à approfondir.',
      'Les compétences sont globalement acquises. Continuez vos efforts pour les consolider et progresser.',
    ],
  },
  {
    min: 5, max: 5.5,
    textes: [
      "Les compétences sont en cours d'acquisition. Certaines notions restent encore fragiles.",
      'Un résultat encourageant ! Les bases des compétences sont présentes, mais elles doivent encore être consolidées.',
      'Les compétences commencent à être acquises. Poursuivez vos entraînements pour progresser.',
    ],
  },
  {
    min: 3.5, max: 4.5,
    textes: [
      'Les compétences restent fragiles et sont encore insuffisamment maîtrisées. Une reprise des notions essentielles est nécessaire.',
      "Des difficultés persistent dans l'acquisition des compétences. Il faut reprendre les bases et poursuivre les entraînements.",
      'Les compétences sont encore peu maîtrisées. Un travail régulier permettra de consolider les connaissances essentielles.',
    ],
  },
  {
    min: 0, max: 3,
    textes: [
      'Les compétences évaluées ne sont pas encore acquises. Une reprise des notions fondamentales est nécessaire.',
      "Les compétences restent très fragiles. Il faut reprendre les bases et s'entraîner davantage.",
      'Les éléments essentiels des compétences ne sont pas encore maîtrisés. Poursuivez vos efforts pour progresser.',
    ],
  },
]

// Renvoie les trois appreciations possibles pour une note sur 10.
function tranchePour(note10: number): [string, string, string] {
  const n = Math.max(0, Math.min(10, note10))
  for (const t of TRANCHES) {
    if (n >= t.min && n <= t.max) return t.textes
  }
  // Filet : valeur intermediaire eventuelle (ne devrait pas arriver avec des
  // demi-points), on prend la tranche dont le max est le plus proche par en bas.
  let choisie = TRANCHES[TRANCHES.length - 1]
  for (const t of TRANCHES) {
    if (n >= t.min) { choisie = t; break }
  }
  return choisie.textes
}

// Choisit au hasard une appreciation adaptee a la note sur 10.
export function appreciationAuto(note10: number): string {
  const textes = tranchePour(note10)
  const i = Math.floor(Math.random() * textes.length)
  return textes[i]
}
