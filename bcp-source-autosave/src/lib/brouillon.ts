// brouillon.ts
// Autosauvegarde des saisies eleve. Des qu'un eleve ecrit dans un onglet
// (Travaux, Synthese, Auto-evaluation, Journal, Activites : flashcards / quiz /
// glisser), le contenu est persiste automatiquement, sans clic. Au retour
// (changement d'onglet, navigation, deconnexion, sonnerie), tout est restaure.
//
// Strategie : ecriture immediate en localStorage (filet de securite hors ligne,
// instantane) + ecriture debouncee dans Supabase (table brouillons) pour que le
// travail suive l'eleve d'un appareil a l'autre. La lecture privilegie la
// version la plus recente entre Supabase et localStorage.
//
// IMPORTANT : un brouillon n'est PAS un envoi au professeur. L'envoi
// (table travaux / reponses_quiz / journal_bord) reste declenche par le bouton.
// Le brouillon evite seulement la perte de saisie avant l'envoi.

import { supabase } from './supabase'

// Cle locale unique par eleve + mission + zone (onglet ou sous-activite).
function cleLocale(etudiantId: string, missionId: string, zone: string): string {
  return `bcp.brouillon.${etudiantId}.${missionId}.${zone}`
}

interface Enveloppe {
  valeur: unknown
  ts: number
}

// Sauvegarde immediate en local (synchrone, ne peut pas echouer silencieusement
// au point de perdre la saisie) + planification d'une ecriture Supabase.
export function sauverBrouillon(
  etudiantId: string | undefined,
  missionId: string,
  zone: string,
  valeur: unknown
): void {
  if (!etudiantId) return
  const ts = Date.now()
  const env: Enveloppe = { valeur, ts }
  try {
    localStorage.setItem(cleLocale(etudiantId, missionId, zone), JSON.stringify(env))
  } catch {
    // quota plein ou stockage indisponible : on continue vers Supabase
  }
  planifierEcritureDistante(etudiantId, missionId, zone, valeur, ts)
}

// Debounce par (mission, zone) : on n'ecrit dans Supabase qu'apres une courte
// pause de frappe, pour ne pas saturer le reseau a chaque caractere.
const minuteurs = new Map<string, ReturnType<typeof setTimeout>>()
// Derniere valeur en attente d'ecriture distante, pour pouvoir la forcer (flush)
// avant une fermeture de page.
const enAttente = new Map<
  string,
  { etudiantId: string; missionId: string; zone: string; valeur: unknown; ts: number }
>()
const DELAI_MS = 800

function planifierEcritureDistante(
  etudiantId: string,
  missionId: string,
  zone: string,
  valeur: unknown,
  ts: number
): void {
  const cle = `${missionId}|${zone}`
  const ancien = minuteurs.get(cle)
  if (ancien) clearTimeout(ancien)
  enAttente.set(cle, { etudiantId, missionId, zone, valeur, ts })
  const minuteur = setTimeout(() => {
    minuteurs.delete(cle)
    enAttente.delete(cle)
    void ecrireDistant(etudiantId, missionId, zone, valeur, ts)
  }, DELAI_MS)
  minuteurs.set(cle, minuteur)
}

async function ecrireDistant(
  etudiantId: string,
  missionId: string,
  zone: string,
  valeur: unknown,
  ts: number
): Promise<void> {
  try {
    await supabase.from('brouillons').upsert(
      {
        etudiant_id: etudiantId,
        mission_id: missionId,
        zone,
        valeur,
        updated_at: new Date(ts).toISOString(),
      },
      { onConflict: 'etudiant_id,mission_id,zone' }
    )
  } catch {
    // hors ligne : le brouillon local reste la source de verite jusqu'au retour
  }
}

// Force l'envoi distant immediat des brouillons en attente (appele avant un
// rechargement/fermeture de page pour ne rien perdre).
export function viderFileBrouillons(): void {
  for (const [, m] of minuteurs) clearTimeout(m)
  minuteurs.clear()
  for (const [, p] of enAttente) {
    void ecrireDistant(p.etudiantId, p.missionId, p.zone, p.valeur, p.ts)
  }
  enAttente.clear()
}

// Lecture du brouillon : compare local et distant, renvoie le plus recent.
// Renvoie null si aucun brouillon (l'appelant garde alors sa valeur chargee
// depuis un envoi precedent, le cas echeant).
export async function lireBrouillon<T = unknown>(
  etudiantId: string | undefined,
  missionId: string,
  zone: string
): Promise<T | null> {
  if (!etudiantId) return null

  let local: Enveloppe | null = null
  try {
    const brut = localStorage.getItem(cleLocale(etudiantId, missionId, zone))
    if (brut) local = JSON.parse(brut) as Enveloppe
  } catch {
    local = null
  }

  let distant: Enveloppe | null = null
  try {
    const { data } = await supabase
      .from('brouillons')
      .select('valeur, updated_at')
      .eq('etudiant_id', etudiantId)
      .eq('mission_id', missionId)
      .eq('zone', zone)
      .maybeSingle()
    const ligne = data as { valeur: unknown; updated_at: string } | null
    if (ligne) {
      distant = { valeur: ligne.valeur, ts: new Date(ligne.updated_at).getTime() }
    }
  } catch {
    distant = null
  }

  const gagnant =
    local && distant
      ? local.ts >= distant.ts
        ? local
        : distant
      : local ?? distant
  if (!gagnant) return null
  return gagnant.valeur as T
}

// Efface le brouillon d'une zone (apres un envoi reussi, le brouillon n'a plus
// d'utilite ; on nettoie pour eviter qu'une vieille version ne reapparaisse).
export async function effacerBrouillon(
  etudiantId: string | undefined,
  missionId: string,
  zone: string
): Promise<void> {
  if (!etudiantId) return
  try {
    localStorage.removeItem(cleLocale(etudiantId, missionId, zone))
  } catch {
    // ignore
  }
  try {
    await supabase
      .from('brouillons')
      .delete()
      .eq('etudiant_id', etudiantId)
      .eq('mission_id', missionId)
      .eq('zone', zone)
  } catch {
    // ignore : sera ecrase au prochain envoi de toute facon
  }
}
