// Racine.tsx
// Aiguille l'utilisateur selon son etat d'authentification :
//   - non connecte : ecran d'authentification (selection de role) ;
//   - eleve en attente : ecran d'attente de validation ;
//   - enseignant : espace professeur ;
//   - eleve accepte : espace etudiant (routes scenarios).
// Branche aussi le timeout de session 30 minutes : deconnexion automatique.

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useInactivite } from '../lib/session'
import { Authentification } from '../pages/Authentification'
import { EnAttente } from '../pages/EnAttente'

// Ecran de chargement neutre pendant la resolution de la session.
function Chargement() {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #F0F7FE 0%, #E2F0FB 50%, #D2E7F8 100%)',
        color: '#16456E',
        fontSize: 14,
      }}
    >
      Chargement en cours...
    </div>
  )
}

// Ecran d'erreur : session active mais profil introuvable ou inaccessible.
// Propose la deconnexion pour repartir proprement.
function ProfilIndisponible({ message, onDeconnexion }: { message: string | null; onDeconnexion: () => void }) {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #F0F7FE 0%, #E2F0FB 50%, #D2E7F8 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 10px 34px rgba(0,0,0,0.10)',
          maxWidth: 440,
          width: '100%',
          padding: 28,
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: 19, color: '#16456E' }}>
          Profil indisponible
        </h1>
        <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, margin: '0 0 8px 0' }}>
          Votre compte est connecte mais son profil n'a pas pu etre charge. Reconnectez-vous.
        </p>
        {message && (
          <p style={{ fontSize: 12, color: '#9AA5B1', margin: '0 0 18px 0' }}>{message}</p>
        )}
        <button
          type="button"
          onClick={onDeconnexion}
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

// Garde de l'espace etudiant : reserve aux eleves acceptes.
export function GardeEtudiant() {
  const { session, profil, chargement, erreurProfil, deconnecter } = useAuth()
  const location = useLocation()

  useInactivite(() => {
    void deconnecter()
  }, !!session)

  if (chargement) return <Chargement />
  if (!session) return <Authentification />
  // Session active mais profil non charge : afficher une erreur exploitable
  // plutot que de boucler sur le chargement.
  if (!profil) return <ProfilIndisponible message={erreurProfil} onDeconnexion={deconnecter} />

  if (profil.role === 'enseignant') {
    return <Navigate to="/enseignant" replace state={{ from: location.pathname }} />
  }
  if (profil.statut !== 'accepte') return <EnAttente />

  return <Outlet />
}

// Garde de l'espace professeur : reserve aux enseignants.
export function GardeEnseignant() {
  const { session, profil, chargement, erreurProfil, deconnecter } = useAuth()

  useInactivite(() => {
    void deconnecter()
  }, !!session)

  if (chargement) return <Chargement />
  if (!session) return <Authentification />
  if (!profil) return <ProfilIndisponible message={erreurProfil} onDeconnexion={deconnecter} />

  if (profil.role !== 'enseignant') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
