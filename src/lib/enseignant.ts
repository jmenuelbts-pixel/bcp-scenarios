// enseignant.ts
// Acces aux donnees pour l'espace professeur : profils eleves, demandes
// d'inscription, acceptation et refus, et suivi individuel (progression,
// resultats, travaux, journal de bord).

import { supabase } from './supabase'
import type { Profil } from './auth'

const CHAMPS = 'id, email, prenom, nom, date_naissance, role, entreprise, statut'

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
  submitted_at: string
}

export interface TravailRendu {
  id: string
  mission_id: string
  contenu: string | null
  correction: string | null
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
    .select('mission_id, activite_id, reponses, score, submitted_at')
    .eq('etudiant_id', eleveId)
    .order('submitted_at', { ascending: false })
  return (data as ReponseQuiz[]) ?? []
}

// Travaux rendus par un eleve.
export async function travauxEleve(eleveId: string): Promise<TravailRendu[]> {
  const { data } = await supabase
    .from('travaux')
    .select('id, mission_id, contenu, correction, created_at')
    .eq('etudiant_id', eleveId)
    .order('created_at', { ascending: false })
  return (data as TravailRendu[]) ?? []
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
