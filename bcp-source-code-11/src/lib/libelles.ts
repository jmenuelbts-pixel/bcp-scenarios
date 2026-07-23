// libelles.ts
// Libelles partages par les exports eleve et enseignant : nom du scenario,
// numero et titre de la mission. Centralise ici pour que les deux cotes
// affichent exactement la meme chose.

import { getScenario, getMission } from '../data/schema'

// Identifiant du scenario deduit de l'identifiant de mission ('enchanted-m8').
export function scenarioDeMission(missionId: string): string {
  return missionId.split('-m')[0]
}

// "Enchanted Tools" ou l'identifiant brut si le scenario est introuvable.
export function nomScenario(missionId: string): string {
  const s = getScenario(scenarioDeMission(missionId))
  return s ? s.nom : scenarioDeMission(missionId)
}

// "Enchanted Tools - Mission 8 : Controler la livraison et traiter une reclamation"
export function titreComplet(missionId: string): string {
  const scenarioId = scenarioDeMission(missionId)
  const s = getScenario(scenarioId)
  const m = getMission(scenarioId, missionId)
  if (!s || !m) return missionId
  return `${s.nom} - Mission ${m.numero} : ${m.titre}`
}

// "Mission 8 : Controler la livraison..." sans le nom du scenario, pour les
// exports deja regroupes par scenario.
export function titreMissionSeule(missionId: string): string {
  const scenarioId = scenarioDeMission(missionId)
  const m = getMission(scenarioId, missionId)
  return m ? `Mission ${m.numero} : ${m.titre}` : missionId
}
