// messagerie.ts
// Acces aux messages entre le professeur et les eleves : envoi individuel ou
// collectif (toute la classe), lecture d'une conversation, marquage comme lu,
// comptage des messages non lus.

import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { listerElevesAcceptes } from './enseignant'

export interface PieceJointe {
  chemin: string
  nom: string
  type: string
}

export interface Message {
  id: string
  expediteur_id: string | null
  destinataire_id: string | null
  contenu: string | null
  lu: boolean
  created_at: string
  pieces_jointes: PieceJointe[] | null
  modifie?: boolean
}

// Contraintes de pieces jointes.
export const PJ_TAILLE_MAX = 8 * 1024 * 1024 // 8 Mo par fichier
export const PJ_NOMBRE_MAX = 3
export const PJ_TYPES_AUTORISES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const PJ_BUCKET = 'messages-pj'

// Verifie type et taille d'un fichier. null si ok, sinon message d'erreur.
export function verifierFichierPj(fichier: File): string | null {
  if (!PJ_TYPES_AUTORISES.includes(fichier.type)) {
    return `Type non autorisé : ${fichier.name}. Formats acceptés : image, PDF, Word.`
  }
  if (fichier.size > PJ_TAILLE_MAX) {
    return `Fichier trop lourd : ${fichier.name} (maximum 8 Mo).`
  }
  return null
}

async function televerserPjPrefixe(
  prefixe: string,
  fichiers: File[]
): Promise<{ pieces: PieceJointe[]; erreur: string | null }> {
  const pieces: PieceJointe[] = []
  for (const f of fichiers) {
    const nomSur = f.name.replace(/[^\w.\-() ]/g, '_')
    const chemin = `${prefixe}/${Date.now()}-${Math.random().toString(16).slice(2)}-${nomSur}`
    const { error } = await supabase.storage.from(PJ_BUCKET).upload(chemin, f, {
      contentType: f.type,
      upsert: false,
    })
    if (error) return { pieces, erreur: error.message }
    pieces.push({ chemin, nom: f.name, type: f.type })
  }
  return { pieces, erreur: null }
}

// URL signee temporaire pour lire/telecharger une piece jointe.
export async function urlPieceJointe(chemin: string): Promise<string | null> {
  const { data } = await supabase.storage.from(PJ_BUCKET).createSignedUrl(chemin, 3600)
  return data?.signedUrl ?? null
}

// Envoie un message individuel, avec d'eventuelles pieces jointes. L'id est
// genere cote client pour ne pas dependre d'une relecture RLS immediate.
export async function envoyerMessage(
  expediteurId: string,
  destinataireId: string,
  contenu: string,
  fichiers: File[] = []
): Promise<{ erreur: string | null }> {
  const messageId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const { error } = await supabase.from('messages').insert({
    id: messageId,
    expediteur_id: expediteurId,
    destinataire_id: destinataireId,
    contenu,
    lu: false,
  })
  if (error) return { erreur: error.message }
  if (fichiers.length === 0) return { erreur: null }

  const { pieces, erreur } = await televerserPjPrefixe(messageId, fichiers)
  if (erreur) return { erreur }
  const { error: eMaj } = await supabase
    .from('messages')
    .update({ pieces_jointes: pieces })
    .eq('id', messageId)
  return { erreur: eMaj ? eMaj.message : null }
}

// Envoie un message collectif (Modele A : diffusion). Cree un message par
// eleve (option classe) + une annonce d'historique. Pieces jointes possibles.
export async function envoyerMessageCollectif(
  expediteurId: string,
  contenu: string,
  classeId?: string | null,
  cible?: string,
  fichiers: File[] = []
): Promise<{ erreur: string | null }> {
  let eleves = await listerElevesAcceptes()
  if (classeId) eleves = eleves.filter((e) => e.classe_id === classeId)
  if (eleves.length === 0) return { erreur: null }

  const annonceId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  let pieces: PieceJointe[] = []
  if (fichiers.length > 0) {
    const res = await televerserPjPrefixe(`annonce/${annonceId}`, fichiers)
    if (res.erreur) return { erreur: res.erreur }
    pieces = res.pieces
  }

  const lignes = eleves.map((e) => ({
    expediteur_id: expediteurId,
    destinataire_id: e.id,
    contenu,
    lu: false,
    pieces_jointes: pieces.length > 0 ? pieces : null,
    annonce_id: annonceId,
  }))
  const { error } = await supabase.from('messages').insert(lignes)
  if (error) return { erreur: error.message }

  await supabase.from('annonces').insert({
    id: annonceId,
    prof_id: expediteurId,
    classe_id: classeId ?? null,
    cible: cible ?? 'Toutes les classes',
    contenu,
    pieces_jointes: pieces.length > 0 ? pieces : null,
  })
  return { erreur: null }
}

export interface Annonce {
  id: string
  classe_id: string | null
  cible: string
  contenu: string
  created_at: string
  pieces_jointes: PieceJointe[] | null
}

// Liste les annonces diffusees par le professeur, plus recentes d'abord.
export async function listerAnnonces(profId: string): Promise<Annonce[]> {
  const { data } = await supabase
    .from('annonces')
    .select('id, classe_id, cible, contenu, created_at, pieces_jointes')
    .eq('prof_id', profId)
    .order('created_at', { ascending: false })
  return (data as Annonce[]) ?? []
}

// Modifie un message individuel (reserve a l'expediteur par RLS).
export async function modifierMessage(
  messageId: string,
  contenu: string
): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('messages')
    .update({ contenu, modifie: true })
    .eq('id', messageId)
  return { erreur: error ? error.message : null }
}

// Supprime un message individuel (une seule bulle).
export async function supprimerMessage(messageId: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('messages').delete().eq('id', messageId)
  return { erreur: error ? error.message : null }
}

// Supprime les fichiers du bucket pour une liste de messages, puis vide leur
// champ pieces_jointes (le texte du message est conserve).
async function effacerPjDeMessages(messages: { id: string; pieces_jointes: PieceJointe[] | null }[]): Promise<number> {
  const chemins: string[] = []
  const idsAvecPj: string[] = []
  for (const m of messages) {
    if (m.pieces_jointes && m.pieces_jointes.length > 0) {
      for (const p of m.pieces_jointes) chemins.push(p.chemin)
      idsAvecPj.push(m.id)
    }
  }
  if (chemins.length === 0) return 0
  // Supabase limite la suppression par lots ; on decoupe par 100.
  for (let i = 0; i < chemins.length; i += 100) {
    await supabase.storage.from(PJ_BUCKET).remove(chemins.slice(i, i + 100))
  }
  for (let i = 0; i < idsAvecPj.length; i += 200) {
    await supabase.from('messages').update({ pieces_jointes: null }).in('id', idsAvecPj.slice(i, i + 200))
  }
  return chemins.length
}

// Vide les pieces jointes d'UNE conversation (entre prof et un interlocuteur).
// Le texte des messages est conserve. Renvoie le nombre de fichiers supprimes.
export async function viderPjConversation(
  profId: string,
  autreId: string
): Promise<{ supprimes: number; erreur: string | null }> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, pieces_jointes')
    .or(`and(expediteur_id.eq.${profId},destinataire_id.eq.${autreId}),and(expediteur_id.eq.${autreId},destinataire_id.eq.${profId})`)
  if (error) return { supprimes: 0, erreur: error.message }
  const n = await effacerPjDeMessages((data as { id: string; pieces_jointes: PieceJointe[] | null }[]) ?? [])
  return { supprimes: n, erreur: null }
}

// Vide TOUTES les pieces jointes de toute la messagerie (menage de fin d'annee).
// Le texte des messages est conserve. Renvoie le nombre de fichiers supprimes.
export async function viderToutesPj(): Promise<{ supprimes: number; erreur: string | null }> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, pieces_jointes')
    .not('pieces_jointes', 'is', null)
  if (error) return { supprimes: 0, erreur: error.message }
  const n = await effacerPjDeMessages((data as { id: string; pieces_jointes: PieceJointe[] | null }[]) ?? [])
  return { supprimes: n, erreur: null }
}

// Modifie une annonce ET propage le texte a toutes les copies des eleves.
export async function modifierAnnonce(
  annonceId: string,
  contenu: string
): Promise<{ erreur: string | null }> {
  const { error: e1 } = await supabase.from('annonces').update({ contenu }).eq('id', annonceId)
  if (e1) return { erreur: e1.message }
  const { error: e2 } = await supabase
    .from('messages')
    .update({ contenu, modifie: true })
    .eq('annonce_id', annonceId)
  return { erreur: e2 ? e2.message : null }
}

// Supprime une annonce ET toutes les copies recues par les eleves.
export async function supprimerAnnonceEtMessages(
  annonceId: string
): Promise<{ erreur: string | null }> {
  const { error: e1 } = await supabase.from('messages').delete().eq('annonce_id', annonceId)
  if (e1) return { erreur: e1.message }
  const { error: e2 } = await supabase.from('annonces').delete().eq('id', annonceId)
  return { erreur: e2 ? e2.message : null }
}

// Recupere la conversation entre deux personnes (dans les deux sens), triee.
// Deux requetes simples puis fusion : plus robuste avec RLS que or(and(...)).
export async function conversation(
  personneA: string,
  personneB: string
): Promise<Message[]> {
  const { data: envoyes } = await supabase
    .from('messages')
    .select('id, expediteur_id, destinataire_id, contenu, lu, created_at, pieces_jointes, modifie')
    .eq('expediteur_id', personneA)
    .eq('destinataire_id', personneB)
  const { data: recus } = await supabase
    .from('messages')
    .select('id, expediteur_id, destinataire_id, contenu, lu, created_at, pieces_jointes, modifie')
    .eq('expediteur_id', personneB)
    .eq('destinataire_id', personneA)
  const tout = [...((envoyes as Message[]) ?? []), ...((recus as Message[]) ?? [])]
  tout.sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
  return tout
}

// Tous les messages recus par une personne.
export async function messagesRecus(destinataireId: string): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('id, expediteur_id, destinataire_id, contenu, lu, created_at, pieces_jointes, modifie')
    .eq('destinataire_id', destinataireId)
    .order('created_at', { ascending: true })
  return (data as Message[]) ?? []
}

// Nombre de messages non lus recus par une personne.
export async function nombreNonLus(destinataireId: string): Promise<number> {
  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('destinataire_id', destinataireId)
    .eq('lu', false)
  return count ?? 0
}

// Marque comme lus tous les messages recus par destinataire en provenance
// d'un expediteur donne.
export async function marquerLus(
  destinataireId: string,
  expediteurId: string
): Promise<void> {
  await supabase
    .from('messages')
    .update({ lu: true })
    .eq('destinataire_id', destinataireId)
    .eq('expediteur_id', expediteurId)
    .eq('lu', false)
}

// Supprime tous les messages echanges entre deux personnes (dans les deux sens).
export async function supprimerConversation(
  personneA: string,
  personneB: string
): Promise<{ erreur: string | null }> {
  const { error: e1 } = await supabase
    .from('messages')
    .delete()
    .eq('expediteur_id', personneA)
    .eq('destinataire_id', personneB)
  const { error: e2 } = await supabase
    .from('messages')
    .delete()
    .eq('expediteur_id', personneB)
    .eq('destinataire_id', personneA)
  const erreur = e1?.message ?? e2?.message ?? null
  return { erreur }
}

// --- Temps reel ------------------------------------------------------------
// Ecoute les nouveaux messages destines a une personne et appelle le rappel
// a chaque insertion. Retourne le canal pour pouvoir se desabonner.
// Necessite que la table messages soit activee dans Supabase Realtime.
export function ecouterMessages(
  destinataireId: string,
  surNouveauMessage: (message: Message) => void
): RealtimeChannel {
  const canal = supabase
    .channel(`messages-${destinataireId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `destinataire_id=eq.${destinataireId}`,
      },
      (payload) => {
        surNouveauMessage(payload.new as Message)
      }
    )
    .subscribe()
  return canal
}

// Se desabonne d'un canal temps reel.
export function arreterEcoute(canal: RealtimeChannel): void {
  supabase.removeChannel(canal)
}

// --- Sondage periodique (fallback fiable sans Realtime) --------------------
// Recharge regulierement les messages recus par une personne. Fonctionne sans
// activer Realtime dans Supabase. Retourne une fonction d'arret.
export function sonderMessages(
  destinataireId: string,
  surMessages: (messages: Message[]) => void,
  intervalleMs = 3000
): () => void {
  let actif = true
  async function tic() {
    if (!actif) return
    const recus = await messagesRecus(destinataireId)
    if (actif) surMessages(recus)
  }
  const timer = setInterval(tic, intervalleMs)
  tic()
  return () => {
    actif = false
    clearInterval(timer)
  }
}

// Recharge regulierement la conversation entre deux personnes.
export function sonderConversation(
  personneA: string,
  personneB: string,
  surConversation: (messages: Message[]) => void,
  intervalleMs = 3000
): () => void {
  let actif = true
  async function tic() {
    if (!actif) return
    const conv = await conversation(personneA, personneB)
    if (actif) surConversation(conv)
  }
  const timer = setInterval(tic, intervalleMs)
  tic()
  return () => {
    actif = false
    clearInterval(timer)
  }
}

// --- Verrou de messagerie par classe ---------------------------------------
// Empeche les eleves d'une classe de discuter entre eux (typiquement pendant
// une evaluation). Les echanges avec l'enseignant restent toujours possibles.
// La securite reelle est assuree par les politiques RLS ; ces fonctions ne
// font que piloter et lire l'etat.

import type { Profil } from './auth'

// Lit l'etat de verrouillage d'une classe (false si aucune ligne).
export async function classeVerrouillee(classeId: string): Promise<boolean> {
  const { data } = await supabase
    .from('verrou_messagerie')
    .select('verrouille')
    .eq('classe_id', classeId)
    .maybeSingle()
  return (data as { verrouille: boolean } | null)?.verrouille ?? false
}

// Verrouille ou deverrouille les discussions entre eleves d'une classe.
// Reserve a l'enseignant (garanti par RLS). Upsert sur la cle classe_id.
export async function definirVerrouClasse(
  classeId: string,
  verrouille: boolean
): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('verrou_messagerie')
    .upsert({ classe_id: classeId, verrouille, maj_le: new Date().toISOString() }, { onConflict: 'classe_id' })
  return { erreur: error ? error.message : null }
}

// Liste les contacts d'un eleve dans la messagerie : l'enseignant (toujours),
// et ses camarades de classe si celle-ci n'est pas verrouillee.
// Renvoie chaque contact avec un booleen estEnseignant pour l'affichage.
export async function contactsEleve(
  eleve: Profil
): Promise<{ contact: Profil; estEnseignant: boolean }[]> {
  // L'enseignant : toujours present.
  const { data: profs } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, classe_id')
    .eq('role', 'enseignant')
  const contacts: { contact: Profil; estEnseignant: boolean }[] =
    ((profs as Profil[]) ?? []).map((p) => ({ contact: p, estEnseignant: true }))

  // Les camarades : seulement si la classe n'est pas verrouillee.
  if (eleve.classe_id) {
    const verrou = await classeVerrouillee(eleve.classe_id)
    if (!verrou) {
      const { data: camarades } = await supabase
        .from('profiles')
        .select('id, email, prenom, nom, role, classe_id')
        .eq('role', 'etudiant')
        .eq('classe_id', eleve.classe_id)
        .neq('id', eleve.id)
      for (const c of (camarades as Profil[]) ?? []) {
        contacts.push({ contact: c, estEnseignant: false })
      }
    }
  }
  return contacts
}
