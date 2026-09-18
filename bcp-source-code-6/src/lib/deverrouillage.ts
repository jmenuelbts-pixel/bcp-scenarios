// deverrouillage.ts
// Gestion de l'etat verrouille/ouvert des onglets par mission, synchronise
// avec la table Supabase deverrouillages_onglets.
// Regles :
//   - le journal de bord est toujours ouvert (non verrouillable) ;
//   - un onglet sans entree en base est considere comme ouvert par defaut ;
//   - les evaluations sont gerees globalement (voir evaluationsOuvertes) ;
//   - deux niveaux : GLOBAL (etudiant_id null) et INDIVIDUEL (par eleve).
//     L'etat individuel d'un eleve prime toujours sur le global (option A) :
//     s'il existe une entree pour cet eleve, elle est utilisee ; sinon on
//     retombe sur l'etat global ; sinon sur le defaut.

import { supabase } from './supabase'
import { ONGLETS_PAR_ID, type OngletId } from '../data/schema'

// Marqueur d'etat global (colonne etudiant_id NULL en base).
export const GLOBAL = 'GLOBAL'

// Cle composite mission + onglet + portee (GLOBAL ou id eleve).
function cle(missionId: string, ongletId: string, portee: string): string {
  return `${missionId}::${ongletId}::${portee}`
}

// Etat des onglets : true = ouvert, false = verrouille.
export type EtatDeverrouillage = Map<string, boolean>

export const DEVERROUILLAGE_DEFAUT: EtatDeverrouillage = new Map()

// Identifiant d'onglet special reserve a l'ouverture des evaluations.
export const ONGLET_EVALUATION = 'evaluation'

// Charge tout l'etat de deverrouillage depuis Supabase (global + individuel).
export async function chargerDeverrouillages(): Promise<EtatDeverrouillage> {
  const etat: EtatDeverrouillage = new Map()
  const { data } = await supabase
    .from('deverrouillages_onglets')
    .select('mission_id, onglet_id, ouvert, etudiant_id')
  if (data) {
    for (const ligne of data as {
      mission_id: string
      onglet_id: string
      ouvert: boolean
      etudiant_id: string | null
    }[]) {
      const portee = ligne.etudiant_id ?? GLOBAL
      etat.set(cle(ligne.mission_id, ligne.onglet_id, portee), ligne.ouvert)
    }
  }
  return etat
}

// Valeur brute enregistree pour une portee donnee (ou undefined).
function valeurPortee(
  etat: EtatDeverrouillage,
  missionId: string,
  ongletId: string,
  portee: string
): boolean | undefined {
  return etat.get(cle(missionId, ongletId, portee))
}

// Indique si un onglet de mission est ouvert pour un eleve donne (ou en global
// si etudiantId n'est pas fourni). Le journal de bord est toujours ouvert.
// Resolution : individuel > global > defaut (VERROUILLE).
// Par defaut tout est verrouille : c'est le professeur qui deverrouille.
export function ongletOuvert(
  missionId: string,
  ongletId: OngletId,
  etat: EtatDeverrouillage = DEVERROUILLAGE_DEFAUT,
  etudiantId?: string
): boolean {
  const onglet = ONGLETS_PAR_ID[ongletId]
  if (onglet && !onglet.verrouillable) return true
  if (etudiantId) {
    const indiv = valeurPortee(etat, missionId, ongletId, etudiantId)
    if (indiv !== undefined) return indiv
  }
  const global = valeurPortee(etat, missionId, ongletId, GLOBAL)
  return global === undefined ? false : global
}

// Indique si un eleve a un reglage individuel explicite pour cet onglet.
export function aReglageIndividuel(
  missionId: string,
  ongletId: string,
  etudiantId: string,
  etat: EtatDeverrouillage = DEVERROUILLAGE_DEFAUT
): boolean {
  return valeurPortee(etat, missionId, ongletId, etudiantId) !== undefined
}

// Indique si les evaluations d'une mission sont ouvertes pour un eleve donne
// (ou en global). Par defaut fermees.
export function evaluationsOuvertes(
  missionId: string,
  etat: EtatDeverrouillage = DEVERROUILLAGE_DEFAUT,
  etudiantId?: string
): boolean {
  if (etudiantId) {
    const indiv = valeurPortee(etat, missionId, ONGLET_EVALUATION, etudiantId)
    if (indiv !== undefined) return indiv
  }
  const global = valeurPortee(etat, missionId, ONGLET_EVALUATION, GLOBAL)
  return global === undefined ? false : global
}

// Definit l'etat GLOBAL d'un onglet (ou des evaluations) pour une mission.
export async function definirOnglet(
  scenarioId: string,
  missionId: string,
  ongletId: string,
  ouvert: boolean,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  const { error } = await supabase.from('deverrouillages_onglets').upsert(
    {
      scenario_id: scenarioId,
      mission_id: missionId,
      onglet_id: ongletId,
      etudiant_id: null,
      ouvert,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'mission_id,onglet_id,etudiant_id' }
  )
  if (error) throw new Error(error.message)
  const nouvelEtat = new Map(etat)
  nouvelEtat.set(cle(missionId, ongletId, GLOBAL), ouvert)
  return nouvelEtat
}

// Definit l'etat INDIVIDUEL d'un onglet pour un eleve donne.
export async function definirOngletEleve(
  scenarioId: string,
  missionId: string,
  ongletId: string,
  etudiantId: string,
  ouvert: boolean,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  const { error } = await supabase.from('deverrouillages_onglets').upsert(
    {
      scenario_id: scenarioId,
      mission_id: missionId,
      onglet_id: ongletId,
      etudiant_id: etudiantId,
      ouvert,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'mission_id,onglet_id,etudiant_id' }
  )
  if (error) throw new Error(error.message)
  const nouvelEtat = new Map(etat)
  nouvelEtat.set(cle(missionId, ongletId, etudiantId), ouvert)
  return nouvelEtat
}

// Verrouille (ou ouvre) l'etat GLOBAL de tous les onglets verrouillables de
// toutes les missions fournies, en une seule ecriture groupee. Sert au bouton
// "Tout verrouiller" pour repartir d'un etat propre.
export async function definirTousOnglets(
  missions: { scenarioId: string; missionId: string }[],
  ongletIds: string[],
  ouvert: boolean,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  const maintenant = new Date().toISOString()
  const lignes = missions.flatMap((m) =>
    ongletIds.map((ongletId) => ({
      scenario_id: m.scenarioId,
      mission_id: m.missionId,
      onglet_id: ongletId,
      etudiant_id: null,
      ouvert,
      updated_at: maintenant,
    }))
  )
  const { error } = await supabase
    .from('deverrouillages_onglets')
    .upsert(lignes, { onConflict: 'mission_id,onglet_id,etudiant_id' })
  if (error) throw new Error(error.message)
  const nouvelEtat = new Map(etat)
  for (const m of missions) {
    for (const ongletId of ongletIds) {
      nouvelEtat.set(cle(m.missionId, ongletId, GLOBAL), ouvert)
    }
  }
  return nouvelEtat
}

export async function reinitialiserOngletEleve(
  missionId: string,
  ongletId: string,
  etudiantId: string,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  await supabase
    .from('deverrouillages_onglets')
    .delete()
    .eq('mission_id', missionId)
    .eq('onglet_id', ongletId)
    .eq('etudiant_id', etudiantId)
  const nouvelEtat = new Map(etat)
  nouvelEtat.delete(cle(missionId, ongletId, etudiantId))
  return nouvelEtat
}

// Verrouille TOUT, partout : supprime toutes les lignes de deverrouillage
// (globales ET individuelles par eleve, tous onglets, evaluations comprises,
// tous scenarios). Retour a l'etat par defaut = tout ferme. C'est le vrai
// "tout verrouiller".
export async function toutVerrouillerPartout(): Promise<EtatDeverrouillage> {
  const { error } = await supabase
    .from('deverrouillages_onglets')
    .delete()
    .not('mission_id', 'is', null)
  if (error) throw new Error(error.message)
  return new Map()
}

// --- Enchainement automatique (par eleve) -----------------------------------

// Ordre des onglets de la chaine sequentielle. Le journal est hors chaine.
// 'activites' contient glossaire/flashcards puis quiz/glisser, geres a part.
const CHAINE: OngletId[] = ['travaux', 'synthese', 'autoeval', 'activites']

// A l'envoi d'un onglet par un eleve : ferme cet onglet et ouvre le suivant de
// la chaine, au niveau INDIVIDUEL de l'eleve. N'ecrit rien pour le journal.
// Renvoie le nouvel etat. Le professeur garde la main (ses reglages manuels
// ne sont pas touches ici : on ne fait qu'ajouter des entrees individuelles).
export async function avancerEnchainement(
  scenarioId: string,
  missionId: string,
  ongletEnvoye: OngletId,
  etudiantId: string,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  const idx = CHAINE.indexOf(ongletEnvoye)
  if (idx === -1) return etat
  let nouvel = etat
  // On n'ouvre que le suivant. L'onglet envoye reste consultable (correction)
  // jusqu'a ce que l'eleve change d'onglet : c'est fermerPrecedent qui le
  // verrouille alors, pour empecher tout retour en arriere (anti-triche).
  const suivant = CHAINE[idx + 1]
  if (suivant) {
    nouvel = await definirOngletEleve(scenarioId, missionId, suivant, etudiantId, true, nouvel)
  }
  return nouvel
}

// Ferme definitivement un onglet deja envoye quand l'eleve le quitte pour un
// onglet plus avance de la chaine. Empeche de revenir consulter ses reponses
// (anti-triche vis-a-vis du quiz / glisser). Ne ferme jamais un onglet non
// encore envoye ni un onglet situe apres celui qu'on quitte.
export async function fermerPrecedent(
  scenarioId: string,
  missionId: string,
  ongletQuitte: OngletId,
  ongletDestination: OngletId,
  etudiantId: string,
  etat: EtatDeverrouillage
): Promise<EtatDeverrouillage> {
  const iQuitte = CHAINE.indexOf(ongletQuitte)
  const iDest = CHAINE.indexOf(ongletDestination)
  // On ne ferme que si on avance dans la chaine (destination plus loin).
  if (iQuitte === -1 || iDest === -1 || iDest <= iQuitte) return etat
  return definirOngletEleve(scenarioId, missionId, ongletQuitte, etudiantId, false, etat)
}
