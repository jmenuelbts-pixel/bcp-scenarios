// presence.ts
// Presence temps reel a deux niveaux, par sondage.
// Le statut n'est jamais stocke : on enregistre l'heure du dernier battement,
// et le statut est derive de son anciennete. Un eleve actif reste vert ; un
// eleve qui ferme l'onglet vieillit et passe orange puis gris tout seul.

import { supabase } from './supabase'

export const SEUIL_CONNECTE = 25
export const SEUIL_INACTIF = 75

export type StatutPresence = 'connecte' | 'inactif' | 'hors_ligne'

export interface LignePresence {
  etudiant_id: string
  page: string | null
  scenario_id: string | null
  mission_id: string | null
  onglet_id: string | null
  progression: number | null
  updated_at: string
}

export interface PresenceEleve extends LignePresence {
  statut: StatutPresence
  secondesDepuis: number
}

export interface Position {
  page: string | null
  scenarioId: string | null
  missionId: string | null
  ongletId: string | null
  progression: number | null
}

export async function battre(etudiantId: string, position: Position): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('presence').upsert(
    {
      etudiant_id: etudiantId,
      page: position.page,
      scenario_id: position.scenarioId,
      mission_id: position.missionId,
      onglet_id: position.ongletId,
      progression: position.progression,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'etudiant_id' }
  )
  return { erreur: error ? error.message : null }
}

export async function diagnostiquer(etudiantId: string): Promise<string> {
  const ecriture = await battre(etudiantId, {
    page: 'Test diagnostic',
    scenarioId: null,
    missionId: null,
    ongletId: null,
    progression: null,
  })
  if (ecriture.erreur) return `Echec ecriture : ${ecriture.erreur}`
  const { data, error } = await supabase.from('presence').select('etudiant_id').eq('etudiant_id', etudiantId)
  if (error) return `Echec lecture : ${error.message}`
  if (!data || data.length === 0) return 'Ecriture acceptee mais relecture vide (anormal).'
  return 'OK : ecriture et lecture fonctionnent.'
}

function deriver(l: LignePresence, maintenant: number): PresenceEleve {
  const t = new Date(l.updated_at).getTime()
  const secondesDepuis = Number.isNaN(t) ? Infinity : Math.max(0, (maintenant - t) / 1000)
  let statut: StatutPresence
  if (secondesDepuis < SEUIL_CONNECTE) statut = 'connecte'
  else if (secondesDepuis < SEUIL_INACTIF) statut = 'inactif'
  else statut = 'hors_ligne'
  return { ...l, statut, secondesDepuis }
}

export async function lirePresences(): Promise<PresenceEleve[]> {
  const { data } = await supabase
    .from('presence')
    .select('etudiant_id, page, scenario_id, mission_id, onglet_id, progression, updated_at')
  const maintenant = Date.now()
  return ((data as LignePresence[]) ?? []).map((l) => deriver(l, maintenant))
}

export function demarrerBattement(
  etudiantId: string,
  obtenirPosition: () => Position,
  intervalleMs = 10000
): () => void {
  let actif = true
  const tic = async () => {
    if (!actif) return
    try {
      await battre(etudiantId, obtenirPosition())
    } catch {
      // prochain battement reessaiera
    }
  }
  void tic()
  const timer = setInterval(tic, intervalleMs)
  return () => {
    actif = false
    clearInterval(timer)
  }
}

export function sonderPresences(
  surPresences: (liste: PresenceEleve[]) => void,
  intervalleMs = 5000
): () => void {
  let actif = true
  const tic = async () => {
    if (!actif) return
    try {
      const liste = await lirePresences()
      if (actif) surPresences(liste)
    } catch {
      // prochain tic
    }
  }
  void tic()
  const timer = setInterval(tic, intervalleMs)
  return () => {
    actif = false
    clearInterval(timer)
  }
}
