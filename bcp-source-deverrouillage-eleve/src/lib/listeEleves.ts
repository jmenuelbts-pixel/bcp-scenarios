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
    .select('id, intitule, date_eval, compter_moyenne, ordre')
    .order('ordre', { ascending: true })
    .order('created_at', { ascending: true })
  return (data as ColonneNote[]) ?? []
}

export async function ajouterColonne(intitule: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('colonnes_notes').insert({ intitule })
  return { erreur: error?.message ?? null }
}

export async function majColonne(
  id: string,
  champs: Partial<Pick<ColonneNote, 'intitule' | 'date_eval' | 'compter_moyenne'>>
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
