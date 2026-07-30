// invite.ts
// Gestion de l'acces invite : un unique compte "Visiteur" que le professeur
// active/desactive, rattache a une classe reelle, et pour lequel il ouvre un
// ou plusieurs scenarios. L'invite ne voit QUE les scenarios ouverts. La
// creation du compte passe par l'Edge Function creer-invite (cle service_role
// cote serveur). Le filtrage reel est garanti par les politiques RLS.

import { supabase } from './supabase'
import type { Profil } from './auth'

// Cree ou reactive le compte invite avec un mot de passe, rattache a une classe.
export async function creerOuActiverInvite(
  motDePasse: string,
  classeId: string | null
): Promise<{ email: string | null; erreur: string | null }> {
  const { data, error } = await supabase.functions.invoke('creer-invite', {
    body: { mot_de_passe: motDePasse, classe_id: classeId },
  })
  if (error) return { email: null, erreur: error.message }
  const rep = data as { ok?: boolean; email?: string; erreur?: string } | null
  if (rep?.erreur) return { email: null, erreur: rep.erreur }
  return { email: rep?.email ?? null, erreur: null }
}

// Lit le profil invite s'il existe (pour connaitre son etat et sa classe).
export async function lireInvite(): Promise<Profil | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, prenom, nom, role, classe_id, est_invite, invite_actif')
    .eq('est_invite', true)
    .maybeSingle()
  return (data as unknown as Profil | null) ?? null
}

// Active ou desactive l'acces invite (bloque/retablit sa connexion effective
// cote donnees via invite_actif, verifie par les politiques RLS).
export async function definirInviteActif(actif: boolean): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ invite_actif: actif })
    .eq('est_invite', true)
  return { erreur: error ? error.message : null }
}

// Change la classe rattachee a l'invite.
export async function definirClasseInvite(classeId: string | null): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ classe_id: classeId })
    .eq('est_invite', true)
  return { erreur: error ? error.message : null }
}

// Liste des scenarios ouverts a l'invite (ids).
export async function scenariosOuverts(): Promise<string[]> {
  const { data } = await supabase.from('scenarios_invite').select('scenario_id')
  return ((data as { scenario_id: string }[]) ?? []).map((r) => r.scenario_id)
}

// Definit la liste complete des scenarios ouverts (remplace l'existant).
export async function definirScenariosOuverts(ids: string[]): Promise<{ erreur: string | null }> {
  // On efface tout puis on reinsere : simple et fiable pour une petite liste.
  const { error: eDel } = await supabase.from('scenarios_invite').delete().neq('scenario_id', '__aucun__')
  if (eDel) return { erreur: eDel.message }
  if (ids.length === 0) return { erreur: null }
  const lignes = ids.map((id) => ({ scenario_id: id }))
  const { error: eIns } = await supabase.from('scenarios_invite').insert(lignes)
  return { erreur: eIns ? eIns.message : null }
}
