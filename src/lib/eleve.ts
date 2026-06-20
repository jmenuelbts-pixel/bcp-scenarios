// eleve.ts
// Enregistrement et lecture des donnees produites par l'eleve : onglets
// visites, travaux rendus, journal de bord, resultats d'activites.
// Les travaux, le journal, les syntheses et les auto-evaluations sont en mode
// "ecraser" : un seul enregistrement par eleve et par mission (upsert sur la
// contrainte d'unicite correspondante).

import { supabase } from './supabase'

// Marque un onglet de mission comme visite par l'eleve.
// On insere une trace ; les doublons ne sont pas genants pour le calcul de
// progression (on compte les missions distinctes).
export async function marquerVisite(
  userId: string,
  missionId: string,
  ongletId: string
): Promise<void> {
  await supabase.from('onglets_visites').insert({
    user_id: userId,
    mission_id: missionId,
    onglet_id: ongletId,
  })
}

// Enregistre (ou remplace) le travail rendu pour une mission.
export async function enregistrerTravail(
  etudiantId: string,
  missionId: string,
  contenu: string
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('travaux').upsert(
    { etudiant_id: etudiantId, mission_id: missionId, contenu },
    { onConflict: 'etudiant_id,mission_id' }
  )
  return { erreur: error ? error.message : null }
}

// Charge le dernier travail rendu pour une mission (ou null).
export async function chargerTravail(
  etudiantId: string,
  missionId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('travaux')
    .select('contenu')
    .eq('etudiant_id', etudiantId)
    .eq('mission_id', missionId)
    .maybeSingle()
  return (data as { contenu: string | null } | null)?.contenu ?? null
}

// Retour du professeur sur le travail rendu : commentaire et competences.
export interface RetourTravail {
  commentaire: string | null
  competences: { intitule: string; niveau: string | null }[] | null
}

export async function chargerRetourTravail(
  etudiantId: string,
  missionId: string
): Promise<RetourTravail | null> {
  const { data } = await supabase
    .from('travaux')
    .select('commentaire, competences')
    .eq('etudiant_id', etudiantId)
    .eq('mission_id', missionId)
    .maybeSingle()
  return (data as RetourTravail | null) ?? null
}

// Enregistre (ou remplace) le journal de bord d'une mission.
export async function enregistrerJournal(
  etudiantId: string,
  missionId: string,
  nonReussi: string,
  moinsBienReussi: string
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('journal_bord').upsert(
    {
      etudiant_id: etudiantId,
      mission_id: missionId,
      non_reussi: nonReussi,
      moins_bien_reussi: moinsBienReussi,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'etudiant_id,mission_id' }
  )
  return { erreur: error ? error.message : null }
}

// Charge le journal de bord d'une mission.
export async function chargerJournal(
  etudiantId: string,
  missionId: string
): Promise<{ nonReussi: string; moinsBienReussi: string }> {
  const { data } = await supabase
    .from('journal_bord')
    .select('non_reussi, moins_bien_reussi')
    .eq('etudiant_id', etudiantId)
    .eq('mission_id', missionId)
    .maybeSingle()
  const ligne = data as { non_reussi: string | null; moins_bien_reussi: string | null } | null
  return {
    nonReussi: ligne?.non_reussi ?? '',
    moinsBienReussi: ligne?.moins_bien_reussi ?? '',
  }
}

// Enregistre (ou remplace) le resultat d'une activite (quiz) pour une mission.
export async function enregistrerQuiz(
  etudiantId: string,
  missionId: string,
  activiteId: string,
  reponses: unknown,
  score: number
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('reponses_quiz').upsert(
    {
      etudiant_id: etudiantId,
      mission_id: missionId,
      activite_id: activiteId,
      reponses,
      score,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: 'etudiant_id,mission_id,activite_id' }
  )
  return { erreur: error ? error.message : null }
}
