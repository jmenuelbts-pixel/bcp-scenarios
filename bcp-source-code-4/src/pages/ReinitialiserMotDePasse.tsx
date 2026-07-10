// ReinitialiserMotDePasse.tsx
// Page publique de redefinition du mot de passe, atteinte via le lien envoye
// par email (resetPasswordForEmail). Supabase place l'utilisateur dans une
// session de recuperation ; on appelle updateUser({ password }) pour fixer le
// nouveau mot de passe, puis on renvoie vers l'accueil.
// Cette route est hors des gardes d'authentification (voir router.tsx).

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ReinitialiserMotDePasse() {
  const [pret, setPret] = useState(false)
  const [sessionOk, setSessionOk] = useState(false)
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  // Le lien email ouvre une session de recuperation. On l'attend, en ecoutant
  // aussi l'evenement PASSWORD_RECOVERY declenche par Supabase.
  useEffect(() => {
    let vivant = true
    supabase.auth.getSession().then(({ data }) => {
      if (!vivant) return
      if (data.session) setSessionOk(true)
      setPret(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setSessionOk(true)
      setPret(true)
    })
    return () => {
      vivant = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function soumettre() {
    setErreur(null)
    setInfo(null)
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }
    setEnCours(true)
    const { error } = await supabase.auth.updateUser({ password: motDePasse })
    setEnCours(false)
    if (error) {
      setErreur(error.message)
      return
    }
    setInfo('Mot de passe modifié. Vous allez être redirigé vers la page de connexion.')
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
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
        <h1 style={{ margin: '0 0 4px 0', fontSize: 24, color: '#1F2933' }}>Nouveau mot de passe</h1>

        {!pret ? (
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 12 }}>Chargement...</p>
        ) : !sessionOk ? (
          <>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '10px 0 0', lineHeight: 1.6 }}>
              Ce lien de réinitialisation n'est plus valide ou a expiré. Retournez à la page de connexion et
              demandez un nouveau lien.
            </p>
            <button
              type="button"
              onClick={() => (window.location.href = '/')}
              style={{
                fontFamily: 'Arial, sans-serif',
                width: '100%',
                marginTop: 22,
                padding: '13px 0',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                background: '#C2660C',
                color: '#FFFFFF',
              }}
            >
              Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>
              Choisissez un nouveau mot de passe pour votre compte.
            </p>

            <label style={etiquette}>Nouveau mot de passe</label>
            <input
              style={champ}
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="6 caractères minimum"
              autoComplete="new-password"
            />

            <label style={etiquette}>Confirmer le mot de passe</label>
            <input
              style={champ}
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
            />

            {erreur && (
              <p style={{ fontSize: 13, color: '#9B2C2C', background: '#FDECEC', borderRadius: 8, padding: '8px 10px', margin: '16px 0 0 0' }}>
                {erreur}
              </p>
            )}
            {info && (
              <p style={{ fontSize: 13, color: '#1B6B3A', background: '#EAF7EF', borderRadius: 8, padding: '8px 10px', margin: '16px 0 0 0' }}>
                {info}
              </p>
            )}

            <button
              type="button"
              disabled={enCours || !motDePasse || !confirmation}
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
                cursor: enCours || !motDePasse || !confirmation ? 'not-allowed' : 'pointer',
                background: enCours || !motDePasse || !confirmation ? '#C9CDD2' : '#C2660C',
                color: '#FFFFFF',
              }}
            >
              {enCours ? 'Veuillez patienter...' : 'Valider le nouveau mot de passe'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
