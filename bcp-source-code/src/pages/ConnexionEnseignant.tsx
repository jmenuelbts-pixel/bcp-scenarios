// ConnexionEnseignant.tsx
// Espace professeur : connexion uniquement (aucune inscription possible).
// Seul l'email enseignant autorise peut acceder ; tout autre email est refuse
// meme avec un mot de passe valide. Bouton Retour vers l'accueil. Bouton vert.

import { useState } from 'react'
import { useAuth, EMAIL_ENSEIGNANT } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { ChampMotDePasse } from '../components/ui/ChampMotDePasse'
import { faceIdDisponible, faceIdActiveSurCetAppareil, connexionFaceId } from '../lib/faceId'

interface Props {
  onRetour: () => void
}

const VERT = '#1B6B3A'

export function ConnexionEnseignant({ onRetour }: Props) {
  const { connecter } = useAuth()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const faceIdActif = faceIdActiveSurCetAppareil() && faceIdDisponible()
  // Quand Face ID est actif, les champs email/mot de passe sont masques par
  // defaut : grand ecran Face ID, puis « Utiliser mon mot de passe » les revele.
  const [montrerChamps, setMontrerChamps] = useState(false)

  function afficherToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3500)
  }

  async function seConnecterFaceId() {
    // Si Face ID n'a pas ete active sur cet appareil, on invite d'abord a se
    // connecter par mot de passe (message ephemere).
    if (!faceIdActif) {
      afficherToast("Connectez-vous d'abord avec vos identifiants pour activer Face ID.")
      return
    }
    setErreur(null)
    setEnCours(true)
    try {
      const { erreur } = await connexionFaceId()
      if (erreur) setErreur(erreur)
    } finally {
      setEnCours(false)
    }
  }

  async function soumettre() {
    setErreur(null)
    // Verrou : seul l'email enseignant autorise peut tenter la connexion ici.
    if (email.trim().toLowerCase() !== EMAIL_ENSEIGNANT) {
      setErreur("Accès réservé. Cette adresse n'est pas autorisee pour l'espace professeur.")
      return
    }
    setEnCours(true)
    try {
      const { erreur } = await connecter(email.trim(), motDePasse)
      if (erreur) {
        setErreur(erreur)
        return
      }
      // Securite supplementaire : verifier que le profil connecte est bien enseignant.
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        if (!prof || prof.role !== 'enseignant') {
          await supabase.auth.signOut()
          setErreur("Accès réservé a l'enseignant.")
        }
      }
    } finally {
      setEnCours(false)
    }
  }

  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #C9D6E3',
    borderRadius: 10,
    padding: '11px 13px',
    fontSize: 14,
    color: '#1F2933',
  }
  const etiquette: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    color: '#1F2933',
    marginBottom: 6,
    marginTop: 16,
    fontWeight: 700,
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F0F7FE 0%, #E2F0FB 50%, #D2E7F8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 18,
          boxShadow: '0 10px 34px rgba(0,0,0,0.10)',
          width: '100%',
          maxWidth: 460,
          padding: 32,
        }}
      >
        <button
          type="button"
          onClick={onRetour}
          style={{
            fontFamily: 'Arial, sans-serif',
            background: 'none',
            border: 'none',
            color: '#6B7280',
            fontSize: 15,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
            <polyline points="11,6 5,12 11,18" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>

        <h1 style={{ margin: '0 0 4px 0', fontSize: 26, color: '#1F2933' }}>Espace professeur</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Connectez-vous à votre compte</p>

        {toast && (
          <div style={{ marginTop: 16, background: '#16456E', color: '#FFFFFF', borderRadius: 10, padding: '10px 12px', fontSize: 13, lineHeight: 1.4 }}>
            {toast}
          </div>
        )}

        {(() => {
          const blocFaceId = faceIdDisponible() ? (
            <div key="faceid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: faceIdActif ? '20px 0 4px' : '18px 0 4px' }}>
              <button
                type="button"
                onClick={seConnecterFaceId}
                aria-label="Se connecter avec Face ID"
                style={{ width: faceIdActif ? 60 : 50, height: faceIdActif ? 60 : 50, borderRadius: '50%', border: `1.5px solid ${VERT}`, background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width={faceIdActif ? 30 : 26} height={faceIdActif ? 30 : 26} viewBox="0 0 24 24" fill="none" stroke={VERT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8 V6 a2 2 0 0 1 2 -2 h2" />
                  <path d="M16 4 h2 a2 2 0 0 1 2 2 v2" />
                  <path d="M20 16 v2 a2 2 0 0 1 -2 2 h-2" />
                  <path d="M8 20 H6 a2 2 0 0 1 -2 -2 v-2" />
                  <path d="M9 10 v1.5" /><path d="M15 10 v1.5" />
                  <path d="M12 9.5 v4" /><path d="M9 15.5 s1 1.3 3 1.3 3 -1.3 3 -1.3" />
                </svg>
              </button>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Face ID</span>
            </div>
          ) : null

          const sep = (
            <div key="sep" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 2px' }}>
              <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span style={{ fontSize: 12, color: '#9AA5B1' }}>ou</span>
              <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>
          )

          const blocMotDePasse = (
            <div key="mdp">
              <label style={etiquette}>Adresse email</label>
              <input
                style={champ}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                autoComplete="email"
              />
              <label style={etiquette}>Mot de passe</label>
              <ChampMotDePasse valeur={motDePasse} onChange={setMotDePasse} autoComplete="current-password" />
              {erreur && (
                <p style={{ fontSize: 13, color: '#9B2C2C', background: '#FDECEC', borderRadius: 8, padding: '8px 10px', margin: '16px 0 0 0' }}>{erreur}</p>
              )}
              <button
                type="button"
                disabled={enCours || !email.trim() || !motDePasse}
                onClick={soumettre}
                style={{ fontFamily: 'Arial, sans-serif', width: '100%', marginTop: 22, padding: '13px 0', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: enCours || !email.trim() || !motDePasse ? 'not-allowed' : 'pointer', background: enCours || !email.trim() || !motDePasse ? '#A9C7B5' : VERT, color: '#FFFFFF' }}
              >
                {enCours ? 'Veuillez patienter...' : 'Se connecter'}
              </button>
            </div>
          )

          // Face ID actif : grand ecran Face ID, champs masques jusqu'au clic
          // sur « Utiliser mon mot de passe ».
          if (faceIdActif && !montrerChamps) {
            return (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, margin: '26px 0 4px' }}>
                  <button
                    type="button"
                    onClick={seConnecterFaceId}
                    disabled={enCours}
                    aria-label="Déverrouiller avec la reconnaissance faciale"
                    style={{ width: 96, height: 96, borderRadius: '50%', border: 'none', background: '#FFFFFF', boxShadow: '0 6px 20px rgba(0,0,0,0.10)', cursor: enCours ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1F2933" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 8 V6 a2 2 0 0 1 2 -2 h2" /><path d="M16 4 h2 a2 2 0 0 1 2 2 v2" /><path d="M20 16 v2 a2 2 0 0 1 -2 2 h-2" /><path d="M8 20 H6 a2 2 0 0 1 -2 -2 v-2" />
                      <path d="M9 10 v1.5" /><path d="M15 10 v1.5" /><path d="M12 9.5 v4" /><path d="M9 15.5 s1 1.3 3 1.3 3 -1.3 3 -1.3" />
                    </svg>
                  </button>
                  <div style={{ fontSize: 16, color: '#1F2933', textAlign: 'center' }}>Déverrouiller avec la reconnaissance faciale</div>
                </div>
                {erreur && (
                  <p style={{ fontSize: 13, color: '#9B2C2C', background: '#FDECEC', borderRadius: 8, padding: '8px 10px', margin: '16px 0 0 0' }}>{erreur}</p>
                )}
                <div style={{ height: 1, background: '#E2E8F0', margin: '24px 0' }} />
                <button
                  type="button"
                  onClick={() => { setErreur(null); setMontrerChamps(true) }}
                  style={{ fontFamily: 'Arial, sans-serif', width: '100%', padding: '13px 10px', fontSize: 16, fontWeight: 700, border: 'none', borderRadius: 99, background: '#FBE7D6', color: '#8A4B12', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A4B12" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11 V7 a4 4 0 0 1 8 0 v4" />
                  </svg>
                  Utiliser mon mot de passe
                </button>
              </>
            )
          }

          // Face ID non actif : formulaire en haut, icone Face ID en bas.
          return <>{blocMotDePasse}{blocFaceId ? sep : null}{blocFaceId}</>
        })()}
      </div>
    </div>
  )
}
