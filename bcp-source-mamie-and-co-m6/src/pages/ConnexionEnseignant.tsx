// ConnexionEnseignant.tsx
// Espace professeur : connexion uniquement (aucune inscription possible).
// Seul l'email enseignant autorise peut acceder ; tout autre email est refuse
// meme avec un mot de passe valide. Bouton Retour vers l'accueil. Bouton vert.

import { useState } from 'react'
import { useAuth, EMAIL_ENSEIGNANT } from '../lib/auth'
import { supabase } from '../lib/supabase'

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
        <input
          style={champ}
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          autoComplete="current-password"
        />

        {erreur && (
          <p style={{ fontSize: 13, color: '#9B2C2C', background: '#FDECEC', borderRadius: 8, padding: '8px 10px', margin: '16px 0 0 0' }}>
            {erreur}
          </p>
        )}

        <button
          type="button"
          disabled={enCours || !email.trim() || !motDePasse}
          onClick={soumettre}
          style={{
            fontFamily: 'Arial, sans-serif',
            width: '100%',
            marginTop: 22,
            padding: '13px 0',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            borderRadius: 10,
            cursor: enCours || !email.trim() || !motDePasse ? 'not-allowed' : 'pointer',
            background: enCours || !email.trim() || !motDePasse ? '#A9C7B5' : VERT,
            color: '#FFFFFF',
          }}
        >
          {enCours ? 'Veuillez patienter...' : 'Se connecter'}
        </button>
      </div>
    </div>
  )
}
