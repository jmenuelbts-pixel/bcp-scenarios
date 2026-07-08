// enseignant.ts
// Acces aux donnees pour l'espace professeur : profils eleves, demandes
// d'inscription, acceptation et refus, et suivi individuel (progression,
// resultats, travaux, journal de bord).

import { supabase } from './supabase'
import type { Profil } from './auth'

const CHAMPS = 'id, email, prenom, nom, date_naissance, role, entreprise, statut, created_at'

// Ajoute un eleve manuellement (sans passage par l'inscription). Le profil est
// cree avec le statut 'accepte' pour apparaitre immediatement dans l'appel et
// les notes. Renvoie l'id cree ou une erreur.
export async function ajouterEleveManuel(
  prenom: string,
  nom: string,
  email: string
): Promise<{ id: string | null; erreur: string | null }> {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `manuel-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const { error } = await supabase.from('profiles').insert({
    id,
    email,
    prenom,
    nom,
    role: 'etudiant',
    statut: 'accepte',
    manuel: true,
  })
  return { id: error ? null : id, erreur: error?.message ?? null }
}

// Supprime un eleve (profil). A utiliser avec prudence : supprime aussi ses
// notes/appels lies par cascade cote base.
export async function supprimerEleve(eleveId: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('profiles').delete().eq('id', eleveId)
  return { erreur: error?.message ?? null }
}

// Liste tous les profils eleves (tous statuts).
export async function listerEleves(): Promise<Profil[]> {
  const { data } = await supabase
    .from('profiles')
    .select(CHAMPS)
    .eq('role', 'etudiant')
    .order('nom', { ascending: true })
  return (data as Profil[]) ?? []
}

// Liste les eleves acceptes uniquement.
export async function listerElevesAcceptes(): Promise<Profil[]> {
  const { data } = await supabase
    .from('profiles')
    .select(CHAMPS)
    .eq('role', 'etudiant')
    .eq('statut', 'accepte')
    .order('nom', { ascending: true })
  return (data as Profil[]) ?? []
}

// Liste les demandes d'inscription en attente.
export async function listerDemandes(): Promise<Profil[]> {
  const { data } = await supabase
    .from('profiles')
    .select(CHAMPS)
    .eq('role', 'etudiant')
    .eq('statut', 'en_attente')
    .order('created_at', { ascending: true })
  return (data as Profil[]) ?? []
}

// Met a jour le statut d'un eleve (accepte ou refuse).
export async function definirStatut(
  eleveId: string,
  statut: 'accepte' | 'refuse'
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('profiles').update({ statut }).eq('id', eleveId)
  return { erreur: error ? error.message : null }
}

// --- Suivi individuel -------------------------------------------------------

export interface VisiteOnglet {
  mission_id: string
  onglet_id: string
  visited_at: string
}

export interface ReponseQuiz {
  mission_id: string
  activite_id: string | null
  reponses: unknown
  score: number | null
  bareme: number | null
  submitted_at: string
}

export interface EvaluationCompetence {
  intitule: string
  niveau: 'novice' | 'debrouille' | 'averti' | 'expert' | null
}

export interface TravailRendu {
  id: string
  mission_id: string
  contenu: string | null
  correction: string | null
  commentaire: string | null
  competences: EvaluationCompetence[] | null
  created_at: string
}

export interface EntreeJournal {
  mission_id: string
  non_reussi: string | null
  moins_bien_reussi: string | null
  updated_at: string
}

// Onglets visites par un eleve (sert a calculer les missions abordees).
export async function visitesEleve(eleveId: string): Promise<VisiteOnglet[]> {
  const { data } = await supabase
    .from('onglets_visites')
    .select('mission_id, onglet_id, visited_at')
    .eq('user_id', eleveId)
  return (data as VisiteOnglet[]) ?? []
}

// Resultats aux quiz d'un eleve.
export async function quizEleve(eleveId: string): Promise<ReponseQuiz[]> {
  const { data } = await supabase
    .from('reponses_quiz')
    .select('mission_id, activite_id, reponses, score, bareme, submitted_at')
    .eq('etudiant_id', eleveId)
    .order('submitted_at', { ascending: false })
  return (data as ReponseQuiz[]) ?? []
}

// Travaux rendus par un eleve.
export async function travauxEleve(eleveId: string): Promise<TravailRendu[]> {
  const { data } = await supabase
    .from('travaux')
    .select('id, mission_id, contenu, correction, commentaire, competences, created_at')
    .eq('etudiant_id', eleveId)
    .order('created_at', { ascending: false })
  return (data as TravailRendu[]) ?? []
}

// Enregistre la correction d'un travail : commentaire et niveaux de competences.
export async function enregistrerCorrection(
  travailId: string,
  commentaire: string,
  competences: EvaluationCompetence[]
): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('travaux')
    .update({ commentaire, competences })
    .eq('id', travailId)
  return { erreur: error?.message ?? null }
}

// Entrees de journal de bord d'un eleve.
export async function journalEleve(eleveId: string): Promise<EntreeJournal[]> {
  const { data } = await supabase
    .from('journal_bord')
    .select('mission_id, non_reussi, moins_bien_reussi, updated_at')
    .eq('etudiant_id', eleveId)
    .order('updated_at', { ascending: false })
  return (data as EntreeJournal[]) ?? []
}

// Avancement agrege par mission pour un eleve : indique si un travail a ete
// rendu, si une activite a ete faite (quiz avec score), et si le journal est
// rempli. Sert au tableau de progression.
export interface AvancementMission {
  missionId: string
  travailRendu: boolean
  activiteFaite: boolean
  journalRempli: boolean
}

export async function avancementEleve(eleveId: string): Promise<Record<string, AvancementMission>> {
  const [travaux, quiz, journal] = await Promise.all([
    travauxEleve(eleveId),
    quizEleve(eleveId),
    journalEleve(eleveId),
  ])
  const acc: Record<string, AvancementMission> = {}
  const init = (mid: string) => {
    if (!acc[mid]) acc[mid] = { missionId: mid, travailRendu: false, activiteFaite: false, journalRempli: false }
    return acc[mid]
  }
  for (const t of travaux) init(t.mission_id).travailRendu = true
  for (const q of quiz) if (q.score !== null) init(q.mission_id).activiteFaite = true
  for (const j of journal) {
    const rempli = (j.non_reussi?.trim().length ?? 0) > 0 || (j.moins_bien_reussi?.trim().length ?? 0) > 0
    if (rempli) init(j.mission_id).journalRempli = true
  }
  return acc
}

// Enregistre le bareme d'affichage (10 ou 20) choisi par le professeur pour
// une activite donnee.
export async function enregistrerBareme(
  eleveId: string,
  missionId: string,
  activiteId: string | null,
  bareme: number
): Promise<{ erreur: string | null }> {
  let req = supabase.from('reponses_quiz').update({ bareme }).eq('etudiant_id', eleveId).eq('mission_id', missionId)
  req = activiteId === null ? req.is('activite_id', null) : req.eq('activite_id', activiteId)
  const { error } = await req
  return { erreur: error?.message ?? null }
}

// Tous les travaux rendus de tous les eleves acceptes, avec nom et statut de
// correction. Sert a la page Travaux a rendre et au tri transversal.
export interface TravailListe {
  id: string
  eleveId: string
  eleveNom: string
  elevePrenom: string
  missionId: string
  contenu: string | null
  corrige: boolean
  created_at: string
}

export async function tousLesTravaux(): Promise<TravailListe[]> {
  const eleves = await listerElevesAcceptes()
  const parId: Record<string, Profil> = {}
  for (const e of eleves) parId[e.id] = e

  const { data } = await supabase
    .from('travaux')
    .select('id, etudiant_id, mission_id, contenu, commentaire, competences, created_at')
    .order('created_at', { ascending: false })

  const lignes = (data as {
    id: string
    etudiant_id: string
    mission_id: string
    contenu: string | null
    commentaire: string | null
    competences: unknown[] | null
    created_at: string
  }[]) ?? []

  return lignes
    .filter((t) => parId[t.etudiant_id])
    .map((t) => {
      const e = parId[t.etudiant_id]
      const corrige =
        (t.commentaire?.trim().length ?? 0) > 0 ||
        (Array.isArray(t.competences) && t.competences.length > 0)
      return {
        id: t.id,
        eleveId: t.etudiant_id,
        eleveNom: e.nom ?? '',
        elevePrenom: e.prenom ?? '',
        missionId: t.mission_id,
        contenu: t.contenu,
        corrige,
        created_at: t.created_at,
      }
    })
}

// --- Suppression d'eleve ---------------------------------------------------

// Retrait simple : l'eleve passe en statut refuse, ses donnees restent.
export async function refuserEleve(eleveId: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('profiles').update({ statut: 'refuse' }).eq('id', eleveId)
  return { erreur: error ? error.message : null }
}

// Suppression complete : efface les donnees de l'eleve puis son profil.
// Le compte d'authentification (auth.users) n'est pas supprime ici (necessite
// une cle service) ; le profil supprime suffit a couper l'acces applicatif.
export async function supprimerEleveComplet(eleveId: string): Promise<{ erreur: string | null }> {
  // Efface les donnees liees, table par table.
  await supabase.from('travaux').delete().eq('etudiant_id', eleveId)
  await supabase.from('journal_bord').delete().eq('etudiant_id', eleveId)
  await supabase.from('reponses_quiz').delete().eq('etudiant_id', eleveId)
  await supabase.from('auto_evaluations').delete().eq('etudiant_id', eleveId)
  await supabase.from('syntheses').delete().eq('etudiant_id', eleveId)
  await supabase.from('onglets_visites').delete().eq('user_id', eleveId)
  await supabase.from('messages').delete().eq('destinataire_id', eleveId)
  await supabase.from('messages').delete().eq('expediteur_id', eleveId)
  const { error } = await supabase.from('profiles').delete().eq('id', eleveId)
  return { erreur: error ? error.message : null }
}
