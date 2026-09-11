// ErrorBoundary.tsx
// Filet de securite global : attrape les erreurs d'affichage React qui, sans
// lui, produiraient un ecran blanc. Affiche a la place un message clair et un
// bouton pour recharger, afin qu'un eleve bloque puisse repartir seul.

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  enErreur: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { enErreur: false }

  static getDerivedStateFromError(): State {
    return { enErreur: true }
  }

  componentDidCatch() {
    // On pourrait journaliser ici. On reste silencieux pour ne pas gener.
  }

  render() {
    if (!this.state.enErreur) return this.props.children

    return (
      <div
        style={{
          fontFamily: 'Arial, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#F1F5F9',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 32,
            maxWidth: 440,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2933', marginBottom: 10 }}>
            Un problème est survenu
          </div>
          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, margin: '0 0 22px' }}>
            La page n'a pas pu s'afficher correctement. Vos réponses envoyées sont conservées. Rechargez pour continuer.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: '#3478C8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
        </div>
      </div>
    )
  }
}
