// Systeme de sauvegarde automatique des brouillons (travail non encore envoye).
//
// Objectif pedagogique : un eleve qui n'a pas fini sa mission et qui change
// d'onglet, ferme la page ou se deconnecte (ex : la sonnerie retentit) ne doit
// JAMAIS perdre sa saisie. A son retour, meme sur un autre poste, il retrouve
// son travail en cours.
//
// Double persistance :
//  - localStorage : ecriture synchrone immediate a chaque frappe. Filet de
//    securite instantane, fonctionne meme hors-ligne ou si l'onglet se ferme
//    aussitot. Lie a l'appareil/navigateur.
//  - Supabase (table `brouillons`) : ecriture debouncee (~800 ms). Persistance
//    durable et multi-appareils, rattachee a l'identite eleve.
//
// Au chargement, on lit les deux et on garde la version la plus recente
// (comparaison de timestamp), pour recuperer toujours l'etat le plus avance,
// en ligne comme hors-ligne.

import { supabase } from './supabase'

// Un composant de mission = un onglet sauvegarde separement.
export type ComposantBrouillon =
  | 'travaux'
  | 'synthese'
  | 'autoeval'
  | 'journal'
  | 'activites'

interface Enveloppe<T> {
  donnees: T
  maj: number // timestamp ms de la derniere modification
}

function cleLocale(etudiantId: string, missionId: string, composant: ComposantBrouillon): string {
  return `bcp:brouillon:${etudiantId}:${missionId}:${composant}`
}

// --- localStorage (synchrone, immediat) -------------------------------------

function lireLocal<T>(etudiantId: string, missionId: string, composant: ComposantBrouillon): Enveloppe<T> | null {
  try {
    const brut = localStorage.getItem(cleLocale(etudiantId, missionId, composant))
    if (!brut) return null
    const env = JSON.parse(brut) as Enveloppe<T>
    if (env && typeof env.maj === 'number') return env
    return null
  } catch {
    return null
  }
}

function ecrireLocal<T>(etudiantId: string, missionId: string, composant: ComposantBrouillon, donnees: T, maj: number): void {
  try {
    localStorage.setItem(cleLocale(etudiantId, missionId, composant), JSON.stringify({ donnees, maj }))
  } catch {
    // quota plein ou stockage indisponible : on ignore, Supabase prend le relais
  }
}

function effacerLocal(etudiantId: string, missionId: string, composant: ComposantBrouillon): void {
  try {
    localStorage.removeItem(cleLocale(etudiantId, missionId, composant))
  } catch {
    // ignore
  }
}

// --- Supabase (debounced) ---------------------------------------------------

async function lireDistant<T>(etudiantId: string, missionId: string, composant: ComposantBrouillon): Promise<Enveloppe<T> | null> {
  try {
    const { data } = await supabase
      .from('brouillons')
      .select('donnees, maj')
      .eq('etudiant_id', etudiantId)
      .eq('mission_id', missionId)
      .eq('composant', composant)
      .maybeSingle()
    if (!data) return null
    const d = data as { donnees: unknown; maj: string | number | null }
    const maj = typeof d.maj === 'number' ? d.maj : d.maj ? Date.parse(d.maj) : 0
    return { donnees: d.donnees as T, maj: maj || 0 }
  } catch {
    return null
  }
}

async function ecrireDistant<T>(etudiantId: string, missionId: string, composant: ComposantBrouillon, donnees: T, maj: number): Promise<void> {
  try {
    await supabase.from('brouillons').upsert(
      {
        etudiant_id: etudiantId,
        mission_id: missionId,
        composant,
        donnees: donnees as unknown as object,
        maj: new Date(maj).toISOString(),
      },
      { onConflict: 'etudiant_id,mission_id,composant' }
    )
  } catch {
    // hors-ligne ou erreur reseau : le brouillon local reste le filet de securite
  }
}

async function effacerDistant(etudiantId: string, missionId: string, composant: ComposantBrouillon): Promise<void> {
  try {
    await supabase
      .from('brouillons')
      .delete()
      .eq('etudiant_id', etudiantId)
      .eq('mission_id', missionId)
      .eq('composant', composant)
  } catch {
    // ignore
  }
}

// --- API publique -----------------------------------------------------------

// Charge le brouillon le plus recent (local vs distant). Retourne null si aucun.
export async function chargerBrouillon<T>(
  etudiantId: string,
  missionId: string,
  composant: ComposantBrouillon
): Promise<T | null> {
  const local = lireLocal<T>(etudiantId, missionId, composant)
  const distant = await lireDistant<T>(etudiantId, missionId, composant)
  if (local && distant) {
    const gagnant = local.maj >= distant.maj ? local : distant
    // on resynchronise le perdant pour converger (ex : local plus recent -> push distant)
    if (local.maj > distant.maj) void ecrireDistant(etudiantId, missionId, composant, local.donnees, local.maj)
    else if (distant.maj > local.maj) ecrireLocal(etudiantId, missionId, composant, distant.donnees, distant.maj)
    return gagnant.donnees
  }
  if (local) return local.donnees
  if (distant) {
    ecrireLocal(etudiantId, missionId, composant, distant.donnees, distant.maj)
    return distant.donnees
  }
  return null
}

// Cree un enregistreur debounce pour un composant donne. A appeler une fois
// (ex : via useRef) puis invoquer .sauver(donnees) a chaque onChange.
// localStorage est ecrit immediatement ; Supabase apres `delaiMs` d'inactivite.
export function creerEnregistreurBrouillon<T>(
  etudiantId: string,
  missionId: string,
  composant: ComposantBrouillon,
  delaiMs = 800
) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let dernier: { donnees: T; maj: number } | null = null

  function flushDistant() {
    if (dernier) void ecrireDistant(etudiantId, missionId, composant, dernier.donnees, dernier.maj)
  }

  return {
    // Appele a chaque modification : ecrit localStorage tout de suite, planifie Supabase.
    sauver(donnees: T) {
      const maj = Date.now()
      dernier = { donnees, maj }
      ecrireLocal(etudiantId, missionId, composant, donnees, maj)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        flushDistant()
        timer = null
      }, delaiMs)
    },
    // Force l'ecriture distante immediate (ex : avant demontage / unload).
    flush() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      flushDistant()
    },
    // Annule un envoi distant en attente sans le declencher.
    annuler() {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
  }
}

// Efface le brouillon (local + distant), a appeler apres un envoi definitif
// pour ne pas reproposer un brouillon obsolete.
export async function effacerBrouillon(
  etudiantId: string,
  missionId: string,
  composant: ComposantBrouillon
): Promise<void> {
  effacerLocal(etudiantId, missionId, composant)
  await effacerDistant(etudiantId, missionId, composant)
}
