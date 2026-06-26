// progression.ts
// Calcul de la progression d'un eleve par scenario.
// Pour l'instant la source est une carte en memoire (vide par defaut) ;
// le branchement sur la table onglets_visites de Supabase se fera au moment
// du suivi individuel. La signature des fonctions ne changera pas.

import { SCENARIOS, type Scenario } from '../data/schema'

// Cle de progression : ensemble des identifiants de missions considerees
// comme abordees par l'eleve. Une mission est comptee comme abordee des
// qu'au moins un de ses onglets a ete visite.
export type ProgressionEleve = Set<string>

// Progression vide par defaut (aucune mission abordee).
export const PROGRESSION_VIDE: ProgressionEleve = new Set<string>()

// Nombre de missions abordees dans un scenario.
export function missionsAbordees(
  scenario: Scenario,
  progression: ProgressionEleve
): number {
  return scenario.missions.filter((m) => progression.has(m.id)).length
}

// Pourcentage de progression d'un scenario, arrondi a l'entier.
export function pourcentageScenario(
  scenario: Scenario,
  progression: ProgressionEleve
): number {
  if (scenario.missions.length === 0) return 0
  const abordees = missionsAbordees(scenario, progression)
  return Math.round((abordees / scenario.missions.length) * 100)
}

// Progression globale tous scenarios confondus.
export function pourcentageGlobal(progression: ProgressionEleve): number {
  const total = SCENARIOS.reduce((n, s) => n + s.missions.length, 0)
  if (total === 0) return 0
  const abordees = SCENARIOS.reduce(
    (n, s) => n + missionsAbordees(s, progression),
    0
  )
  return Math.round((abordees / total) * 100)
}
