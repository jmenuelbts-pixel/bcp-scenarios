// ChampMotDePasse.tsx
// Champ de saisie de mot de passe reutilisable : bouton oeil pour afficher ou
// masquer la saisie, et affichage optionnel des regles de complexite avec
// validation en temps reel (une coche par regle satisfaite).
// Style inline, Arial.

import { useState } from 'react'

// Regles de complexite. Exportees pour etre reutilisees par la validation des
// formulaires (inscription, reinitialisation) afin de garder une seule source
// de verite.
export const REGLES_MDP: { libelle: string; test: (v: string) => boolean }[] = [
  { libelle: 'Au moins 8 caractères', test: (v) => v.length >= 8 },
  { libelle: 'Une lettre majuscule', test: (v) => /[A-Z]/.test(v) },
  { libelle: 'Une lettre minuscule', test: (v) => /[a-z]/.test(v) },
  { libelle: 'Un chiffre', test: (v) => /[0-9]/.test(v) },
  { libelle: 'Un caractère spécial (!?@#...)', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

// Renvoie true si le mot de passe satisfait toutes les regles.
export function motDePasseValide(v: string): boolean {
  return REGLES_MDP.every((r) => r.test(v))
}

interface Props {
  valeur: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  // Affiche la liste des regles avec validation en temps reel (inscription,
  // reinitialisation). Laisser a false pour un simple champ de connexion.
  afficherRegles?: boolean
  style?: React.CSSProperties
}

export function ChampMotDePasse({
  valeur,
  onChange,
  placeholder,
  autoComplete,
  afficherRegles = false,
  style,
}: Props) {
  const [visible, setVisible] = useState(false)

  const champBase: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #C9D6E3',
    borderRadius: 10,
    padding: '11px 44px 11px 13px',
    fontSize: 14,
    color: '#1F2933',
    ...style,
  }

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          style={champBase}
          type={visible ? 'text' : 'password'}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {visible ? (
            // Oeil barre (mot de passe visible : cliquer pour masquer)
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                fill="none"
                stroke="#6B7280"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="none" stroke="#6B7280" strokeWidth="1.8" />
              <line x1="4" y1="20" x2="20" y2="4" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            // Oeil ouvert (mot de passe masque : cliquer pour afficher)
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
                fill="none"
                stroke="#6B7280"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="none" stroke="#6B7280" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>

      {afficherRegles && (
        <ul style={{ listStyle: 'none', margin: '10px 0 0 0', padding: 0 }}>
          {REGLES_MDP.map((r) => {
            const ok = r.test(valeur)
            return (
              <li
                key={r.libelle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12.5,
                  color: ok ? '#1B6B3A' : '#6B7280',
                  marginBottom: 4,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                  {ok ? (
                    <polyline
                      points="5,12 10,17 19,7"
                      fill="none"
                      stroke="#1B6B3A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <circle cx="12" cy="12" r="4" fill="#C9D6E3" />
                  )}
                </svg>
                {r.libelle}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
