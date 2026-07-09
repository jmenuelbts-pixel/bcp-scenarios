// classes.ts
// Gestion des classes et des groupes.
//   - un eleve appartient a UNE classe (profiles.classe_id) ;
//   - un groupe appartient a UNE classe ;
//   - un eleve peut etre dans plusieurs groupes (table eleves_groupes).

import { supabase } from './supabase'

export interface Classe {
  id: string
  nom: string
}

export interface Groupe {
  id: string
  classe_id: string
  nom: string
}

export interface LiaisonGroupe {
  eleve_id: string
  groupe_id: string
}

// --- Classes ---

export async function listerClasses(): Promise<Classe[]> {
  const { data } = await supabase.from('classes').select('id, nom').order('nom', { ascending: true })
  return (data as Classe[]) ?? []
}

export async function creerClasse(nom: string): Promise<{ id: string | null; erreur: string | null }> {
  const { data, error } = await supabase.from('classes').insert({ nom }).select('id').single()
  return { id: (data as { id: string } | null)?.id ?? null, erreur: error?.message ?? null }
}

export async function renommerClasse(id: string, nom: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('classes').update({ nom }).eq('id', id)
  return { erreur: error?.message ?? null }
}

export async function supprimerClasse(id: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('classes').delete().eq('id', id)
  return { erreur: error?.message ?? null }
}

// --- Groupes ---

export async function listerGroupes(): Promise<Groupe[]> {
  const { data } = await supabase.from('groupes').select('id, classe_id, nom').order('nom', { ascending: true })
  return (data as Groupe[]) ?? []
}

export async function creerGroupe(classeId: string, nom: string): Promise<{ id: string | null; erreur: string | null }> {
  const { data, error } = await supabase.from('groupes').insert({ classe_id: classeId, nom }).select('id').single()
  return { id: (data as { id: string } | null)?.id ?? null, erreur: error?.message ?? null }
}

export async function renommerGroupe(id: string, nom: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('groupes').update({ nom }).eq('id', id)
  return { erreur: error?.message ?? null }
}

export async function supprimerGroupe(id: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('groupes').delete().eq('id', id)
  return { erreur: error?.message ?? null }
}

// --- Affectations ---

// Affecte un eleve a une classe (ou null pour retirer).
export async function affecterClasse(eleveId: string, classeId: string | null): Promise<{ erreur: string | null }> {
  const { error } = await supabase.from('profiles').update({ classe_id: classeId }).eq('id', eleveId)
  return { erreur: error?.message ?? null }
}

export async function listerLiaisonsGroupes(): Promise<LiaisonGroupe[]> {
  const { data } = await supabase.from('eleves_groupes').select('eleve_id, groupe_id')
  return (data as LiaisonGroupe[]) ?? []
}

export async function ajouterEleveGroupe(eleveId: string, groupeId: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('eleves_groupes')
    .upsert({ eleve_id: eleveId, groupe_id: groupeId }, { onConflict: 'eleve_id,groupe_id' })
  return { erreur: error?.message ?? null }
}

export async function retirerEleveGroupe(eleveId: string, groupeId: string): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('eleves_groupes')
    .delete()
    .eq('eleve_id', eleveId)
    .eq('groupe_id', groupeId)
  return { erreur: error?.message ?? null }
}
