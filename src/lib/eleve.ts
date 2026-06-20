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

export interface SoumissionQuiz {
  reponses: unknown
  score: number | null
  submitted_at: string
}

export async function chargerQuiz(
  etudiantId: string,
  missionId: string,
  activiteId: string
): Promise<SoumissionQuiz | null> {
  const { data } = await supabase
    .from('reponses_quiz')
    .select('reponses, score, submitted_at')
    .eq('etudiant_id', etudiantId)
    .eq('mission_id', missionId)
    .eq('activite_id', activiteId)
    .maybeSingle()
  return (data as SoumissionQuiz | null) ?? null
}

// Liste les activites deja envoyees par un eleve pour une mission, sous forme
// d'ensemble d'activite_id (ex : { 'travaux', 'quiz' }). Sert au calcul de la
// progression en camembert (6 composants obligatoires).
export async function activitesEnvoyees(
  etudiantId: string,
  missionId: string
): Promise<Set<string>> {
  const fait = new Set<string>()
  // Le travail redige est dans la table travaux, les autres dans reponses_quiz.
  const [resTravaux, resQuiz] = await Promise.all([
    supabase
      .from('travaux')
      .select('contenu')
      .eq('etudiant_id', etudiantId)
      .eq('mission_id', missionId)
      .maybeSingle(),
    supabase
      .from('reponses_quiz')
      .select('activite_id')
      .eq('etudiant_id', etudiantId)
      .eq('mission_id', missionId),
  ])
  const travail = resTravaux.data as { contenu: string | null } | null
  if (travail && (travail.contenu?.trim().length ?? 0) > 0) fait.add('travaux')
  for (const r of (resQuiz.data as { activite_id: string }[]) ?? []) fait.add(r.activite_id)
  return fait
}

// Charge toutes les soumissions d'activites d'un eleve pour une mission, en une
// requete, indexees par activite_id (synthese, autoeval, flashcards, quiz,
// glisser). Sert a l'affichage des reponses cote professeur.
export async function chargerReponsesActivites(
  etudiantId: string,
  missionId: string
): Promise<Record<string, SoumissionQuiz>> {
  const { data } = await supabase
    .from('reponses_quiz')
    .select('activite_id, reponses, score, submitted_at')
    .eq('etudiant_id', etudiantId)
    .eq('mission_id', missionId)
  const map: Record<string, SoumissionQuiz> = {}
  for (const r of (data as ({ activite_id: string } & SoumissionQuiz)[]) ?? []) {
    map[r.activite_id] = { reponses: r.reponses, score: r.score, submitted_at: r.submitted_at }
  }
  return map
}

// Les 6 composants obligatoires d'une mission (le glossaire et le journal ne
// comptent pas). Ordre sans importance pour le calcul.
export const COMPOSANTS_MISSION = ['travaux', 'synthese', 'autoeval', 'flashcards', 'quiz', 'glisser'] as const

// Progression d'une mission en pourcentage (0 a 100), sur 6 composants.
export function progressionMission(faits: Set<string>): number {
  const n = COMPOSANTS_MISSION.filter((c) => faits.has(c)).length
  return Math.round((n / COMPOSANTS_MISSION.length) * 100)
}
