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

// Date de demarrage de l'appel automatique : rien avant le 10 septembre 2026.
const DEBUT_APPEL_AUTO = new Date('2026-09-10T00:00:00')

// Creneaux horaires (doivent correspondre a CRENEAUX_HORAIRES cote appel).
// Index -> heure de debut. 12h-13h est exclu (pause). heure_index :
// 0=8h,1=9h,2=10h,3=11h, 4=13h,5=14h,6=15h,7=16h,8=17h.
function heureIndexActuel(d: Date): number | null {
  const h = d.getHours()
  if (h >= 8 && h < 12) return h - 8          // 0..3
  if (h >= 13 && h < 18) return 4 + (h - 13)  // 4..8
  return null
}

// Enregistre le battement courant dans l'historique (presence_journal) pour
// l'appel automatique. Silencieux en cas d'erreur : ne doit jamais gener
// l'eleve. Ne fait rien avant la date de demarrage ou hors creneau.
async function loggerJournal(etudiantId: string): Promise<void> {
  const maintenant = new Date()
  if (maintenant < DEBUT_APPEL_AUTO) return
  const idx = heureIndexActuel(maintenant)
  if (idx === null) return
  const dateJour = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}-${String(maintenant.getDate()).padStart(2, '0')}`
  try {
    const { data } = await supabase
      .from('presence_journal')
      .select('nb_battements, premier_battement')
      .eq('etudiant_id', etudiantId)
      .eq('date_jour', dateJour)
      .eq('heure_index', idx)
      .maybeSingle()
    const existant = data as { nb_battements: number; premier_battement: string } | null
    await supabase.from('presence_journal').upsert(
      {
        etudiant_id: etudiantId,
        date_jour: dateJour,
        heure_index: idx,
        premier_battement: existant?.premier_battement ?? maintenant.toISOString(),
        dernier_battement: maintenant.toISOString(),
        nb_battements: (existant?.nb_battements ?? 0) + 1,
      },
      { onConflict: 'etudiant_id,date_jour,heure_index' }
    )
  } catch {
    // silencieux
  }
}

export async function battre(etudiantId: string, position: Position): Promise<{ erreur: string | null }> {
  void loggerJournal(etudiantId)
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
  intervalleMs = 10000,
  surErreur?: (message: string | null) => void
): () => void {
  let actif = true
  const tic = async () => {
    if (!actif) return
    try {
      const { erreur } = await battre(etudiantId, obtenirPosition())
      if (surErreur) surErreur(erreur)
    } catch (e) {
      if (surErreur) surErreur(e instanceof Error ? e.message : 'Erreur reseau presence')
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
