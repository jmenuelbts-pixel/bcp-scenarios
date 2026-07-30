// messagerie.ts
// Acces aux messages entre le professeur et les eleves : envoi individuel ou
// collectif (toute la classe), lecture d'une conversation, marquage comme lu,
// comptage des messages non lus.

import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { listerElevesAcceptes } from './enseignant'

export interface Message {
  id: string
  expediteur_id: string | null
  destinataire_id: string | null
  contenu: string | null
  lu: boolean
  created_at: string
}

// Envoie un message d'un expediteur vers un destinataire.
export async function envoyerMessage(
  expediteurId: string,
  destinataireId: string,
  contenu: string
): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('messages').insert({
    expediteur_id: expediteurId,
    destinataire_id: destinataireId,
    contenu,
    lu: false,
  })
  return { erreur: error ? error.message : null }
}

// Envoie un message collectif a tous les eleves acceptes.
export async function envoyerMessageCollectif(
  expediteurId: string,
  contenu: string
): Promise<{ erreur: string | null }> {
  const eleves = await listerElevesAcceptes()
  if (eleves.length === 0) return { erreur: null }
  const lignes = eleves.map((e) => ({
    expediteur_id: expediteurId,
    destinataire_id: e.id,
    contenu,
    lu: false,
  }))
  const { error } = await supabase.from('messages').insert(lignes)
  return { erreur: error ? error.message : null }
}

// Recupere la conversation entre deux personnes (dans les deux sens), triee.
// Deux requetes simples puis fusion : plus robuste avec RLS que or(and(...)).
export async function conversation(
  personneA: string,
  personneB: string
): Promise<Message[]> {
  const { data: envoyes } = await supabase
    .from('messages')
    .select('id, expediteur_id, destinataire_id, contenu, lu, created_at')
    .eq('expediteur_id', personneA)
    .eq('destinataire_id', personneB)
  const { data: recus } = await supabase
    .from('messages')
    .select('id, expediteur_id, destinataire_id, contenu, lu, created_at')
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
    .select('id, expediteur_id, destinataire_id, contenu, lu, created_at')
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
