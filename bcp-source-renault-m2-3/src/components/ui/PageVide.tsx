// PageVide.tsx
// Bloc d'attente sobre pour les sections non encore remplies. Style inline.

import { COULEUR_PROF } from '../../data/schema'

export function PageVide({ titre, message }: { titre: string; message: string }) {
  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: '40px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: '#EAF2EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke={COULEUR_PROF} strokeWidth="2" />
            <line x1="8" y1="8" x2="16" y2="8" stroke={COULEUR_PROF} strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="12" x2="16" y2="12" stroke={COULEUR_PROF} strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="16" x2="12" y2="16" stroke={COULEUR_PROF} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: 20, color: COULEUR_PROF }}>{titre}</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#4B5563', lineHeight: 1.6, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          {message}
        </p>
      </div>
    </main>
  )
}
