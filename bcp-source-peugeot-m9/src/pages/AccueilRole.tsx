// AccueilRole.tsx
// Premier ecran : selection de l'espace (etudiant ou enseignant) avant
// connexion. Fond degrade de bleus tres lumineux, deux cartes de choix,
// bouton A propos, pied de page etablissement. Style inline, Arial.

import { useState } from 'react'

interface Props {
  onChoisir: (role: 'etudiant' | 'enseignant') => void
}

export function AccueilRole({ onChoisir }: Props) {
  const [aproposOuvert, setAproposOuvert] = useState(false)

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F0F7FE 0%, #E2F0FB 50%, #D2E7F8 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Bouton A propos */}
      <button
        type="button"
        onClick={() => setAproposOuvert(true)}
        style={{
          fontFamily: 'Arial, sans-serif',
          position: 'absolute',
          top: 20,
          left: 20,
          background: '#FFFFFF',
          border: '1px solid #BFD6EC',
          borderRadius: 10,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          color: '#16456E',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#16456E" strokeWidth="2" />
          <line x1="12" y1="11" x2="12" y2="16" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="7.5" r="1.2" fill="#16456E" />
        </svg>
        A propos
      </button>

      {/* Logo */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 22,
          background: 'linear-gradient(160deg, #2E7DB8 0%, #1B6090 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 22px rgba(27, 96, 144, 0.35)',
          marginBottom: 20,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 l7 3 v5 c0 4 -3 7 -7 8 c-4 -1 -7 -4 -7 -8 V6 z" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" opacity="0.9" />
          <text x="12" y="14" textAnchor="middle" fontSize="7" fontFamily="Arial, sans-serif" fontWeight="700" fill="#FFFFFF">MCV</text>
        </svg>
      </div>

      {/* Titre */}
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: '#16456E' }}>Scénarios MCV B</h1>
      <p style={{ margin: '8px 0 28px 0', fontSize: 15, color: '#33648C' }}>
        Baccalauréat Métiers du Commerce et de la Vente - option B
      </p>

      {/* Cartes de choix */}
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button
          type="button"
          onClick={() => onChoisir('etudiant')}
          style={{
            fontFamily: 'Arial, sans-serif',
            textAlign: 'left',
            border: 'none',
            borderRadius: 16,
            padding: '22px 26px',
            cursor: 'pointer',
            background: 'linear-gradient(160deg, #2E7DB8 0%, #1B6090 100%)',
            color: '#FFFFFF',
            boxShadow: '0 6px 18px rgba(27, 96, 144, 0.30)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, opacity: 0.85 }}>ESPACE</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>Élève</div>
        </button>

        <button
          type="button"
          onClick={() => onChoisir('enseignant')}
          style={{
            fontFamily: 'Arial, sans-serif',
            textAlign: 'left',
            borderRadius: 16,
            padding: '22px 26px',
            cursor: 'pointer',
            background: '#FFFFFF',
            border: '2px solid #BFD6EC',
            color: '#16456E',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#7896B0' }}>ESPACE</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>Enseignant</div>
        </button>
      </div>

      {/* Pied de page */}
      <p style={{ marginTop: 32, fontSize: 13, color: '#5E83A6' }}>
        Lycée Maria Deraismes - Paris 17e
      </p>

      {/* Modale A propos */}
      {aproposOuvert && (
        <div
          onClick={() => setAproposOuvert(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 52, 84, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 440,
              width: '100%',
              padding: 28,
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 19, color: '#16456E' }}>A propos</h2>
              <button
                type="button"
                onClick={() => setAproposOuvert(false)}
                aria-label="Fermer"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke="#16456E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, margin: 0 }}>
              Cette application accompagne la formation au Baccalauréat Métiers du
              Commerce et de la Vente, option B Prospection clientèle et valorisation
              de l'offre commerciale. Elle s'appuie sur des scénarios d'entreprises
              au sein desquels chaque élève réalise des missions professionnelles
              concrètes. Chaque mission propose des travaux à rendre, une synthèse de
              cours, une auto-évaluation, des activités interactives et un journal de
              bord. L'objectif est de développer et d'évaluer les compétences par une
              mise en situation proche du réel. Le suivi de la progression permet de
              préparer l'évaluation par compétences dans le cadre des contrôles en
              cours de formation CCF E31 et E32. Le professeur accède au travail de
              chaque élève, le corrige et communique avec lui directement dans
              l'application.
            </p>
            <p style={{ fontSize: 13, color: '#16456E', fontWeight: 700, margin: '16px 0 0 0' }}>
              Jacky MENUEL - Professeur Économie-Gestion
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
