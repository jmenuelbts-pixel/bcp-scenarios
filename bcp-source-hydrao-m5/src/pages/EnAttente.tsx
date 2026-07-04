// EnAttente.tsx
// Affiche un message d'attente aux eleves dont le compte n'a pas encore ete
// accepte par le professeur. Propose la deconnexion.

import { useAuth } from '../lib/auth'

export function EnAttente() {
  const { deconnecter, profil } = useAuth()
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EAF3FB 0%, #D6E8F7 45%, #C2DCF2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          maxWidth: 440,
          width: '100%',
          padding: 32,
          textAlign: 'center',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" style={{ marginBottom: 12 }}>
          <circle cx="12" cy="12" r="10" fill="none" stroke="#16456E" strokeWidth="2" />
          <polyline points="12,7 12,12 15,14" fill="none" stroke="#16456E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#16456E' }}>
          Compte en attente de validation
        </h1>
        <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, margin: '0 0 20px 0' }}>
          {profil?.prenom ? `Bonjour ${profil.prenom}. ` : ''}
          Votre inscription a bien ete enregistree. Le professeur doit accepter votre
          compte avant que vous puissiez acceder aux scenarios.
        </p>
        <button
          type="button"
          onClick={deconnecter}
          style={{
            fontFamily: 'Arial, sans-serif',
            background: '#16456E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
