// reglages.ts
// Reglages globaux de l'application, stockes dans la table `reglages`
// (cle/valeur). Actuellement : delai avant affichage de la correction
// automatique a l'eleve (Quiz, Glisser-deposer).

import { supabase } from './supabase'

const CLE_DELAI = 'delai_correction_minutes'
const DELAI_DEFAUT = 60 // 1 heure

// Options proposees dans le menu deroulant (en minutes).
export const OPTIONS_DELAI: { valeur: number; libelle: string }[] = [
  { valeur: 15, libelle: '15 minutes' },
  { valeur: 30, libelle: '30 minutes' },
  { valeur: 60, libelle: '1 heure (par défaut)' },
  { valeur: 120, libelle: '2 heures' },
  { valeur: 180, libelle: '3 heures' },
  { valeur: 360, libelle: '6 heures' },
  { valeur: 720, libelle: '12 heures' },
  { valeur: 1440, libelle: '24 heures' },
]

// Lit le delai (en minutes). Renvoie 60 par defaut si absent ou erreur.
export async function lireDelaiCorrection(): Promise<number> {
  const { data } = await supabase
    .from('reglages')
    .select('valeur')
    .eq('cle', CLE_DELAI)
    .maybeSingle()
  const v = (data as { valeur: string } | null)?.valeur
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) && n >= 0 ? n : DELAI_DEFAUT
}

// Enregistre le delai (en minutes).
export async function definirDelaiCorrection(minutes: number): Promise<{ erreur: string | null }> {
  const { error } = await supabase
    .from('reglages')
    .upsert({ cle: CLE_DELAI, valeur: String(minutes) }, { onConflict: 'cle' })
  return { erreur: error?.message ?? null }
}

// La correction est-elle visible pour l'eleve, compte tenu de l'heure d'envoi
// et du delai courant ? Renvoie aussi le nombre de minutes restantes.
export function correctionVisible(submittedAtISO: string, delaiMinutes: number): { visible: boolean; minutesRestantes: number } {
  const envoi = new Date(submittedAtISO).getTime()
  if (!Number.isFinite(envoi)) return { visible: true, minutesRestantes: 0 }
  const echeance = envoi + delaiMinutes * 60_000
  const maintenant = Date.now()
  if (maintenant >= echeance) return { visible: true, minutesRestantes: 0 }
  return { visible: false, minutesRestantes: Math.ceil((echeance - maintenant) / 60_000) }
}
