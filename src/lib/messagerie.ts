// messagerie.ts
// Acces aux messages entre le professeur et les eleves : envoi individuel ou
// collectif (toute la classe), lecture d'une conversation, marquage comme lu,
// comptage des messages non lus.

import { supabase } from './supabase'
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
