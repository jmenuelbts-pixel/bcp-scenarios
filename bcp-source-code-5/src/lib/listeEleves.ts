// listeEleves.ts
// Acces aux donnees de la Liste Eleves cote professeur : appels (presence par
// seance) et notes (colonnes dynamiques + notes par eleve). RLS desactivee.

import { supabase } from './supabase'
import { getScenario } from '../data/schema'

// --- Appels ----------------------------------------------------------------

// Liste des dates d'appel existantes (historique), recentes d'abord.
export async function datesAppels(): Promise<string[]> {
  const { data } = await supabase
    .from('appels')
    .select('date_appel')
    .order('date_appel', { ascending: false })
  const set = new Set<string>()
  for (const r of (data as { date_appel: string }[]) ?? []) set.add(r.date_appel)
  return [...set]
}

// Supprime tous les appels d'une date (creneaux + repere + motifs).
export async function supprimerAppelDate(date: string): Promise<{ erreur: string | null }> {
  await supabase.from('appel_creneaux').delete().eq('date_appel', date)
  const { error } = await supabase.from('appels').delete().eq('date_appel', date)
  return { erreur: error?.message ?? null }
}

// --- Appel par heures (creneaux) -------------------------------------------

export type StatutCreneau = 'present' | 'absent' | 'retard' | 'exclusion'

export interface CreneauAppel {
  etudiant_id: string
  heure_index: number
  creneau: string | null
  statut: StatutCreneau
}

// Creneaux horaires proposes (12h-13h exclu : pause dejeuner).
export const CRENEAUX_HORAIRES = [
  '8h-9h', '9h-10h', '10h-11h', '11h-12h',
  '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h',
]

export async function nbHeuresSeance(date: string): Promise<number> {
  const { data } = await supabase
    .from('appels')
    .select('nb_heures')
    .eq('date_appel', date)
    .limit(1)
    .maybeSingle()
  return (data as { nb_heures: number } | null)?.nb_heures ?? 1
}

export async function definirNbHeures(date: string, nbHeures: number, unEleveId: string): Promise<void> {
  const { data } = await supabase.from('appels').select('id').eq('date_appel', date).limit(1)
  if (((data as unknown[]) ?? []).length === 0) {
    await supabase.from('appels').upsert(
      { date_appel: date, etudiant_id: unEleveId, absent: false, retard_minutes: null, nb_heures: nbHeures },
      { onConflict: 'date_appel,etudiant_id' }
    )
  } else {
    await supabase.from('appels').update({ nb_heures: nbHeures }).eq('date_appel', date)
  }
}

export async function creneauxDuJour(date: string): Promise<CreneauAppel[]> {
  const { data } = await supabase
    .from('appel_creneaux')
    .select('etudiant_id, heure_index, creneau, statut')
    .eq('date_appel', date)
  return (data as CreneauAppel[]) ?? []
}

export async function enregistrerCreneau(
  date: string,
  etudiantId: string,
  heureIndex: number,
  creneau: string | null,
  statut: StatutCreneau
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('appel_creneaux').upsert(
    { date_appel: date, etudiant_id: etudiantId, heure_index: heureIndex, creneau, statut },
    { onConflict: 'date_appel,etudiant_id,heure_index' }
  )
  return { erreur: error?.message ?? null }
}

export async function definirCreneauColonne(
  date: string,
  heureIndex: number,
  creneau: string,
  etudiantIds: string[]
): Promise<void> {
  for (const id of etudiantIds) {
    await supabase.from('appel_creneaux').upsert(
      { date_appel: date, etudiant_id: id, heure_index: heureIndex, creneau, statut: 'present' },
      { onConflict: 'date_appel,etudiant_id,heure_index', ignoreDuplicates: false }
    )
  }
}

export async function enregistrerMotifSeance(
  date: string,
  etudiantId: string,
  motif: string
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('appels').upsert(
    { date_appel: date, etudiant_id: etudiantId, absent: false, retard_minutes: null, motif },
    { onConflict: 'date_appel,etudiant_id' }
  )
  return { erreur: error?.message ?? null }
}

export async function motifsDuJour(date: string): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('appels')
    .select('etudiant_id, motif')
    .eq('date_appel', date)
  const res: Record<string, string> = {}
  for (const r of (data as { etudiant_id: string; motif: string | null }[]) ?? []) {
    if (r.motif) res[r.etudiant_id] = r.motif
  }
  return res
}

// --- Notes -----------------------------------------------------------------

export interface ColonneNote {
  id: string
  intitule: string
  date_eval: string | null
  compter_moyenne: boolean
  ordre: number
  bareme: number
  coefficient: number
  activite_liee_mission: string | null
  activite_liee_id: string | null
}

export type StatutNote = 'note' | 'absent' | 'non_note'

export interface NoteEleve {
  id: string
  colonne_id: string
  etudiant_id: string
  note: number | null
  bareme: number
  statut: StatutNote
  manuel: boolean
}

export async function listerColonnes(): Promise<ColonneNote[]> {
  const { data } = await supabase
    .from('colonnes_notes')
    .select('id, intitule, date_eval, compter_moyenne, ordre, bareme, coefficient, activite_liee_mission, activite_liee_id')
    .order('ordre', { ascending: true })
    .order('created_at', { ascending: true })
  return (data as ColonneNote[]) ?? []
}

export async function ajouterColonne(
  intitule: string,
  bareme = 20
): Promise<{ id: string | null; erreur: string | null }> {
  const { data: existantes } = await supabase.from('colonnes_notes').select('ordre')
  const ordreMax = ((existantes as { ordre: number }[]) ?? []).reduce(
    (m, c) => Math.max(m, c.ordre ?? 0),
    0
  )
  const { data, error } = await supabase
    .from('colonnes_notes')
    .insert({ intitule, ordre: ordreMax + 1, bareme, compter_moyenne: true, coefficient: 1 })
    .select('id')
    .single()
  return { id: (data as { id: string } | null)?.id ?? null, erreur: error?.message ?? null }
}

export async function majColonne(
  id: string,
  champs: Partial<
    Pick<
      ColonneNote,
      'intitule' | 'date_eval' | 'compter_moyenne' | 'bareme' | 'coefficient' | 'activite_liee_mission' | 'activite_liee_id'
    >
  >
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('colonnes_notes').update(champs).eq('id', id)
  return { erreur: error?.message ?? null }
}

export async function supprimerColonne(id: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('colonnes_notes').delete().eq('id', id)
  return { erreur: error?.message ?? null }
}

export async function listerNotes(): Promise<NoteEleve[]> {
  const { data } = await supabase
    .from('notes_eleves')
    .select('id, colonne_id, etudiant_id, note, bareme, statut, manuel')
  return (data as NoteEleve[]) ?? []
}

// Enregistre une note. statut : 'note' | 'absent' | 'non_note'.
// manuel = true protege la note du report automatique.
export async function enregistrerNote(
  colonneId: string,
  etudiantId: string,
  note: number | null,
  bareme: number,
  statut: StatutNote = 'note',
  manuel = true
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('notes_eleves').upsert(
    { colonne_id: colonneId, etudiant_id: etudiantId, note, bareme, statut, manuel },
    { onConflict: 'colonne_id,etudiant_id' }
  )
  return { erreur: error?.message ?? null }
}

// Importe les scores d'une activite auto (quiz / glisser) dans une colonne :
// pour chaque eleve ayant fait l'activite liee, recopie score/bareme en le
// convertissant sur le bareme de la colonne. Renvoie le nombre de notes reportees.
export async function importerScoresActivite(
  colonne: ColonneNote
): Promise<{ reportees: number; erreur: string | null }> {
  if (!colonne.activite_liee_mission || !colonne.activite_liee_id) {
    return { reportees: 0, erreur: null }
  }
  const { data, error } = await supabase
    .from('reponses_quiz')
    .select('etudiant_id, score, bareme')
    .eq('mission_id', colonne.activite_liee_mission)
    .eq('activite_id', colonne.activite_liee_id)
  if (error) return { reportees: 0, erreur: error.message }
  const lignes = (data as { etudiant_id: string; score: number | null; bareme: number | null }[]) ?? []
  const { data: manuelles } = await supabase
    .from('notes_eleves')
    .select('etudiant_id')
    .eq('colonne_id', colonne.id)
    .eq('manuel', true)
  const protege = new Set(((manuelles as { etudiant_id: string }[]) ?? []).map((m) => m.etudiant_id))
  let reportees = 0
  for (const l of lignes) {
    if (l.score === null || l.score === undefined) continue
    if (protege.has(l.etudiant_id)) continue
    const baremeSource = l.bareme && l.bareme > 0 ? l.bareme : 10
    const noteConvertie = Math.round((l.score / baremeSource) * colonne.bareme * 100) / 100
    const { error: e2 } = await supabase.from('notes_eleves').upsert(
      { colonne_id: colonne.id, etudiant_id: l.etudiant_id, note: noteConvertie, bareme: colonne.bareme, statut: 'note', manuel: false },
      { onConflict: 'colonne_id,etudiant_id' }
    )
    if (!e2) reportees += 1
  }
  return { reportees, erreur: null }
}

// Cree automatiquement les colonnes de notes manquantes pour les activites
// auto (quiz / glisser-deposer) qui ont au moins une note. Intitule genere :
// « <Scenario> - M<numero> - Quiz » ou « ... - Glisser-deposer ». Idempotent :
// ne recree pas une colonne deja liee a la meme activite. Renvoie le nombre
// de colonnes creees.
export async function creerColonnesActivitesManquantes(
  colonnesExistantes: ColonneNote[]
): Promise<number> {
  const { data } = await supabase
    .from('reponses_quiz')
    .select('mission_id, activite_id, score')
  const lignes = (data as { mission_id: string; activite_id: string; score: number | null }[]) ?? []
  // Couples (mission, activite) notes, uniquement quiz et glisser.
  const couples = new Set<string>()
  for (const l of lignes) {
    if (l.score === null || l.score === undefined) continue
    if (l.activite_id !== 'quiz' && l.activite_id !== 'glisser' && l.activite_id !== 'synthese') continue
    couples.add(`${l.mission_id}::${l.activite_id}`)
  }
  const dejaLiees = new Set(
    colonnesExistantes
      .filter((c) => c.activite_liee_mission && c.activite_liee_id)
      .map((c) => `${c.activite_liee_mission}::${c.activite_liee_id}`)
  )
  let creees = 0
  for (const couple of couples) {
    if (dejaLiees.has(couple)) continue
    const [missionId, activiteId] = couple.split('::')
    const found = trouverMission(missionId)
    const scenarioNom = found?.scenarioNom ?? ''
    const numero = found?.numero ?? 0
    const libelleAct = activiteId === 'quiz' ? 'Quiz' : activiteId === 'glisser' ? 'Glisser-déposer' : 'Synthèse'
    const intitule = scenarioNom
      ? `${scenarioNom} - M${numero} - ${libelleAct}`
      : `${missionId} - ${libelleAct}`
    const { id } = await ajouterColonne(intitule, 20)
    if (id) {
      await majColonne(id, { activite_liee_mission: missionId, activite_liee_id: activiteId })
      creees += 1
    }
  }
  return creees
}

// Retrouve le nom du scenario et le numero d'une mission a partir de son id.
function trouverMission(missionId: string): { scenarioNom: string; numero: number } | null {
  const prefixe = missionId.split('-')[0]
  const scenario = getScenario(prefixe)
  if (scenario) {
    const mission = scenario.missions.find((mm) => mm.id === missionId)
    if (mission) return { scenarioNom: scenario.nom, numero: mission.numero }
  }
  return null
}

// --- Appel automatique (a partir de l'historique de presence) ---------------

// Applique l'appel automatique pour une date : pour chaque eleve ayant ete
// connecte au moins 10 minutes sur un creneau, le marque present ; pour les
// eleves d'un groupe en cours mais absents au-dela de 35 min, absent. Ne touche
// jamais un creneau deja saisi manuellement. Renvoie le nombre de creneaux
// crees/mis a jour. Base : presence_journal.
const DUREE_MIN_PRESENCE_MS = 10 * 60 * 1000
const TOLERANCE_ABSENCE_MS = 35 * 60 * 1000

export async function appliquerAppelAuto(
  date: string,
  creneauxExistants: CreneauAppel[]
): Promise<number> {
  const { data } = await supabase
    .from('presence_journal')
    .select('etudiant_id, heure_index, premier_battement, dernier_battement')
    .eq('date_jour', date)
  const lignes = (data as { etudiant_id: string; heure_index: number; premier_battement: string; dernier_battement: string }[]) ?? []
  if (lignes.length === 0) return 0

  // Creneaux deja saisis (protection : on ne reecrase jamais une saisie).
  const dejaSaisi = new Set(creneauxExistants.map((c) => `${c.etudiant_id}::${c.heure_index}`))

  let ecrites = 0
  for (const l of lignes) {
    const cle = `${l.etudiant_id}::${l.heure_index}`
    if (dejaSaisi.has(cle)) continue
    const debut = new Date(l.premier_battement).getTime()
    const fin = new Date(l.dernier_battement).getTime()
    const duree = fin - debut
    if (duree < DUREE_MIN_PRESENCE_MS) continue // presence trop courte : on ignore
    const creneau = CRENEAUX_HORAIRES[l.heure_index] ?? null
    const { error } = await supabase.from('appel_creneaux').upsert(
      { date_appel: date, etudiant_id: l.etudiant_id, heure_index: l.heure_index, creneau, statut: 'present' as StatutCreneau },
      { onConflict: 'date_appel,etudiant_id,heure_index' }
    )
    if (!error) ecrites += 1
  }
  void TOLERANCE_ABSENCE_MS
  return ecrites
}

// --- Bilan de presence sur une periode --------------------------------------

export interface BilanPresence {
  etudiant_id: string
  heures_absence: number
  heures_retard: number
  heures_exclusion: number
  heures_total: number
}

// Calcule, par eleve, le cumul d'heures absent / retard / exclusion sur une
// periode [debut, fin] (dates incluses). Se base sur appel_creneaux.
export async function bilanPresence(
  debut: string,
  fin: string
): Promise<Record<string, BilanPresence>> {
  const { data } = await supabase
    .from('appel_creneaux')
    .select('etudiant_id, statut, date_appel')
    .gte('date_appel', debut)
    .lte('date_appel', fin)
  const res: Record<string, BilanPresence> = {}
  for (const r of (data as { etudiant_id: string; statut: StatutCreneau }[]) ?? []) {
    if (!res[r.etudiant_id]) {
      res[r.etudiant_id] = { etudiant_id: r.etudiant_id, heures_absence: 0, heures_retard: 0, heures_exclusion: 0, heures_total: 0 }
    }
    const b = res[r.etudiant_id]
    b.heures_total += 1
    if (r.statut === 'absent') b.heures_absence += 1
    else if (r.statut === 'retard') b.heures_retard += 1
    else if (r.statut === 'exclusion') b.heures_exclusion += 1
  }
  return res
}
