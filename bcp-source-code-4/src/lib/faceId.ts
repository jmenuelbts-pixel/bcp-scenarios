// faceId.ts
// Connexion par Face ID / Touch ID via les passkeys Supabase (WebAuthn).
// Le mot de passe reste toujours disponible : Face ID ne fait que s'ajouter.
//
// On memorise localement (par appareil) le fait que Face ID a ete active, pour
// afficher l'icone en priorite sur l'ecran de connexion de cet appareil.

import { supabase } from './supabase'

const CLE_ACTIVE = 'bcp_faceid_active'

// Le navigateur supporte-t-il WebAuthn (donc potentiellement Face ID) ?
export function faceIdDisponible(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

// Face ID a-t-il ete active sur CET appareil ?
export function faceIdActiveSurCetAppareil(): boolean {
  try {
    return localStorage.getItem(CLE_ACTIVE) === '1'
  } catch {
    return false
  }
}

function marquerActive(actif: boolean) {
  try {
    if (actif) localStorage.setItem(CLE_ACTIVE, '1')
    else localStorage.removeItem(CLE_ACTIVE)
  } catch {
    /* stockage indisponible : on ignore */
  }
}

// Enregistre un passkey pour l'utilisateur connecte (a appeler APRES une
// connexion classique par mot de passe). Declenche la demande Face ID du
// systeme. Renvoie une erreur lisible en cas d'echec ou d'annulation.
export async function activerFaceId(): Promise<{ erreur: string | null }> {
  if (!faceIdDisponible()) {
    return { erreur: "Cet appareil ou ce navigateur ne prend pas en charge Face ID." }
  }
  try {
    const { error } = await supabase.auth.registerPasskey()
    if (error) {
      if (dejaEnregistre(error.message)) { marquerActive(true); return { erreur: null } }
      return { erreur: traduire(error.message) }
    }
    marquerActive(true)
    return { erreur: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (dejaEnregistre(msg)) { marquerActive(true); return { erreur: null } }
    return { erreur: traduire(msg) }
  }
}

// Retire le marquage local (l'utilisateur ne veut plus proposer Face ID ici).
export function desactiverFaceIdLocal() {
  marquerActive(false)
}

// Connexion par Face ID. Declenche la demande biometrique du systeme.
export async function connexionFaceId(): Promise<{ erreur: string | null }> {
  if (!faceIdDisponible()) {
    return { erreur: "Cet appareil ne prend pas en charge Face ID." }
  }
  try {
    const { error } = await supabase.auth.signInWithPasskey()
    if (error) return { erreur: traduire(error.message) }
    return { erreur: null }
  } catch (e) {
    return { erreur: traduire(e instanceof Error ? e.message : String(e)) }
  }
}

function dejaEnregistre(message: string): boolean {
  const m = message.toLowerCase()
  return m.includes('previously registered') || m.includes('already registered') || m.includes('already exists')
}

function traduire(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('notallowed') || m.includes('cancel') || m.includes('abort')) {
    return 'La demande Face ID a été annulée.'
  }
  if (m.includes('no credential') || m.includes('not found')) {
    return "Aucun Face ID n'est enregistré sur cet appareil. Connectez-vous avec votre mot de passe."
  }
  if (m.includes('not enabled') || m.includes('disabled')) {
    return "Face ID n'est pas encore activé pour cette application."
  }
  return 'Face ID indisponible pour le moment. Utilisez votre mot de passe.'
}

// Appareil mobile ou tablette (pas un ordinateur) ? Combine l'agent utilisateur
// et la presence d'un ecran tactile fin. Sert a n'afficher Face ID que sur
// smartphone / tablette cote eleve, jamais sur ordinateur.
export function estMobileOuTablette(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const parAgent = /Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle|BlackBerry|Opera Mini|IEMobile/i.test(ua)
  // iPad recent se declare parfois comme Mac : on detecte le tactile multipoint.
  const iPadMac = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1
  const tactile = (navigator.maxTouchPoints ?? 0) > 0
  return parAgent || iPadMac || (tactile && window.matchMedia('(pointer: coarse)').matches)
}
