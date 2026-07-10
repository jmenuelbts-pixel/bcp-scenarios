// listeEleves.ts
// Acces aux donnees de la Liste Eleves cote professeur : appels (presence par
// seance) et notes (colonnes dynamiques + notes par eleve). RLS desactivee.

import { supabase } from './supabase'

// --- Appels ----------------------------------------------------------------

export interface Appel {
  id: string
  date_appel: string
  etudiant_id: string
  absent: boolean
  retard_minutes: number | null
}

// Appels d'une date donnee (un par eleve present dans la table).
export async function appelsDuJour(date: string): Promise<Appel[]> {
  const { data } = await supabase
    .from('appels')
    .select('id, date_appel, etudiant_id, absent, retard_minutes')
    .eq('date_appel', date)
  return (data as Appel[]) ?? []
}

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

// Enregistre (ou met a jour) l'appel d'un eleve pour une date.
export async function enregistrerAppel(
  date: string,
  etudiantId: string,
  absent: boolean,
  retardMinutes: number | null
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('appels').upsert(
    {
      date_appel: date,
      etudiant_id: etudiantId,
      absent,
      retard_minutes: absent ? null : retardMinutes,
    },
    { onConflict: 'date_appel,etudiant_id' }
  )
  return { erreur: error?.message ?? null }
}

// Supprime tous les appels d'une date (suppression d'une entree d'historique).
export async function supprimerAppelDate(date: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('appels').delete().eq('date_appel', date)
  return { erreur: error?.message ?? null }
}

// --- Notes -----------------------------------------------------------------

export interface ColonneNote {
  id: string
  intitule: string
  date_eval: string | null
  compter_moyenne: boolean
  ordre: number
  bareme: number
  activite_liee_mission: string | null
  activite_liee_id: string | null
}

export interface NoteEleve {
  id: string
  colonne_id: string
  etudiant_id: string
  note: number | null
  bareme: number
}

export async function listerColonnes(): Promise<ColonneNote[]> {
  const { data } = await supabase
    .from('colonnes_notes')
    .select('id, intitule, date_eval, compter_moyenne, ordre, bareme, activite_liee_mission, activite_liee_id')
    .order('ordre', { ascending: true })
    .order('created_at', { ascending: true })
  return (data as ColonneNote[]) ?? []
}

// Ajoute une colonne en calculant l'ordre suivant. Renvoie l'id cree (ou erreur).
export async function ajouterColonne(
  intitule: string,
  bareme = 20
): Promise<{ id: string | null; erreur: string | null }> {
  // Ordre = max existant + 1.
  const { data: existantes } = await supabase.from('colonnes_notes').select('ordre')
  const ordreMax = ((existantes as { ordre: number }[]) ?? []).reduce(
    (m, c) => Math.max(m, c.ordre ?? 0),
    0
  )
  const { data, error } = await supabase
    .from('colonnes_notes')
    .insert({ intitule, ordre: ordreMax + 1, bareme, compter_moyenne: true })
    .select('id')
    .single()
  return { id: (data as { id: string } | null)?.id ?? null, erreur: error?.message ?? null }
}

export async function majColonne(
  id: string,
  champs: Partial<
    Pick<
      ColonneNote,
      'intitule' | 'date_eval' | 'compter_moyenne' | 'bareme' | 'activite_liee_mission' | 'activite_liee_id'
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
    .select('id, colonne_id, etudiant_id, note, bareme')
  return (data as NoteEleve[]) ?? []
}

export async function enregistrerNote(
  colonneId: string,
  etudiantId: string,
  note: number | null,
  bareme: number
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('notes_eleves').upsert(
    { colonne_id: colonneId, etudiant_id: etudiantId, note, bareme },
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
  let reportees = 0
  for (const l of lignes) {
    if (l.score === null || l.score === undefined) continue
    const baremeSource = l.bareme && l.bareme > 0 ? l.bareme : 10
    const noteConvertie = Math.round((l.score / baremeSource) * colonne.bareme * 100) / 100
    const { error: e2 } = await supabase.from('notes_eleves').upsert(
      { colonne_id: colonne.id, etudiant_id: l.etudiant_id, note: noteConvertie, bareme: colonne.bareme },
      { onConflict: 'colonne_id,etudiant_id' }
    )
    if (!e2) reportees += 1
  }
  return { reportees, erreur: null }
}
