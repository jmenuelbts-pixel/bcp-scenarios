// deverrouillage.ts
// Gestion de l'etat verrouille/ouvert des onglets par mission, synchronise
// avec la table Supabase deverrouillages_onglets.
// Regles :
//   - le journal de bord est toujours ouvert (non verrouillable) ;
//   - un onglet sans entree en base est considere comme ouvert par defaut ;
//   - les evaluations sont gerees globalement (voir evaluationsOuvertes).

import { supabase } from './supabase'
import { ONGLETS_PAR_ID, type OngletId } from '../data/schema'

// Cle composite mission + onglet pour l'etat en memoire.
function cle(missionId: string, ongletId: string): string {
  return `${missionId}::${ongletId}`
}

// Etat des onglets : true = ouvert, false = verrouille.
export type EtatDeverrouillage = Map<string, boolean>

export const DEVERROUILLAGE_DEFAUT: EtatDeverrouillage = new Map()

// Identifiant d'onglet special reserve a l'ouverture des evaluations.
export const ONGLET_EVALUATION = 'evaluation'

// Charge tout l'etat de deverrouillage depuis Supabase.
export async function chargerDeverrouillages(): Promise<EtatDeverrouillage> {
  const etat: EtatDeverrouillage = new Map()
  const { data } = await supabase
    .from('deverrouillages_onglets')
    .select('mission_id, onglet_id, ouvert')
  if (data) {
    for (const ligne of data as { mission_id: string; onglet_id: string; ouvert: boolean }[]) {
      etat.set(cle(ligne.mission_id, ligne.onglet_id), ligne.ouvert)
    }
  }
  return etat
}

// Indique si un onglet de mission est ouvert.
// Le journal de bord est toujours ouvert.
export function ongletOuvert(
  missionId: string,
  ongletId: OngletId,
  etat: EtatDeverrouillage = DEVERROUILLAGE_DEFAUT
): boolean {
  const onglet = ONGLETS_PAR_ID[ongletId]
  if (onglet && !onglet.verrouillable) return true
  const valeur = etat.get(cle(missionId, ongletId))
  // Ouvert par defaut tant que le professeur n'a pas explicitement ferme.
  return valeur === undefined ? true : valeur
}

// Indique si les evaluations d'une mission sont ouvertes.
// Par defaut fermees (les evaluations sont verrouillees tant que le professeur
// ne les ouvre pas).
export function evaluationsOuvertes(
  missionId: string,
  etat: EtatDeverrouillage = DEVERROUILLAGE_DEFAUT
): boolean {
  const valeur = etat.get(cle(missionId, ONGLET_EVALUATION))
  return valeur === undefined ? false : valeur
}

// Definit l'etat d'un onglet (ou des evaluations) pour une mission, et
// synchronise avec Supabase. Renvoie le nouvel etat en memoire.
export async function definirOnglet(
  scenarioId: string,
  missionId: string,
  ongletId: string,
  ouvert: boolean,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  await supabase.from('deverrouillages_onglets').upsert(
    {
      scenario_id: scenarioId,
      mission_id: missionId,
      onglet_id: ongletId,
      ouvert,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'mission_id,onglet_id' }
  )
  const nouvelEtat = new Map(etat)
  nouvelEtat.set(cle(missionId, ongletId), ouvert)
  return nouvelEtat
}
