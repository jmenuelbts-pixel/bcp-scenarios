// ConnexionEtudiant.tsx
// Espace étudiant : connexion ou creation de compte. Bouton Retour vers
// l'accueil de selection. Inscription reservee aux eleves, validation par le
// professeur. Style inline, Arial.

import { useState } from 'react'
import { useAuth } from '../lib/auth'

type Vue = 'connexion' | 'inscription'

interface Props {
  onRetour: () => void
}

const ACCENT = '#C2660C' // orange etudiant

export function ConnexionEtudiant({ onRetour }: Props) {
  const { connecter, inscrireEleve } = useAuth()
  const [vue, setVue] = useState<Vue>('connexion')

  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [prenom, setPrénom] = useState('')
  const [nom, setNom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')

  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  function reset() {
    setErreur(null)
    setInfo(null)
  }

  async function soumettre() {
    reset()
    setEnCours(true)
    try {
      if (vue === 'connexion') {
        const { erreur } = await connecter(email.trim(), motDePasse)
        if (erreur) setErreur(erreur)
      } else {
        if (!nom.trim() || !prenom.trim()) {
          setErreur('Le nom et le prénom sont obligatoires.')
          return
        }
        if (motDePasse.length < 6) {
          setErreur('Le mot de passe doit comporter au moins 6 caractères.')
          return
        }
        if (motDePasse !== confirmation) {
          setErreur('Les deux mots de passe ne correspondent pas.')
          return
        }
        const { erreur } = await inscrireEleve({
          email: email.trim(),
          motDePasse,
          prenom: prenom.trim(),
          nom: nom.trim(),
          dateNaissance,
        })
        if (erreur) {
          setErreur(erreur)
        } else {
          setInfo('Demande envoyée. Votre professeur doit valider votre inscription avant la connexion.')
          setVue('connexion')
          setMotDePasse('')
          setConfirmation('')
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

        <h1 style={{ margin: '0 0 4px 0', fontSize: 26, color: '#1F2933' }}>
          {vue === 'connexion' ? 'Espace élève' : 'Créer mon compte'}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
          {vue === 'connexion'
            ? 'Connectez-vous à votre compte'
            : 'Votre professeur devra valider votre inscription.'}
        </p>

        {vue === 'inscription' && (
          <>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={etiquette}>Nom</label>
                <input style={champ} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="DUPONT" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={etiquette}>Prénom</label>
                <input style={champ} value={prenom} onChange={(e) => setPrénom(e.target.value)} placeholder="Marie" />
              </div>
            </div>

            <label style={etiquette}>Date de naissance</label>
            <input style={champ} type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
          </>
        )}

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
          placeholder={vue === 'inscription' ? '6 caractères minimum' : ''}
          autoComplete={vue === 'connexion' ? 'current-password' : 'new-password'}
        />

        {vue === 'inscription' && (
          <>
            <label style={etiquette}>Confirmer le mot de passe</label>
            <input
              style={champ}
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
            />
          </>
        )}

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
            background: enCours || !email.trim() || !motDePasse ? '#D6BBA0' : ACCENT,
            color: '#FFFFFF',
          }}
        >
          {enCours
            ? 'Veuillez patienter...'
            : vue === 'connexion'
            ? 'Se connecter'
            : 'Envoyer ma demande'}
        </button>

        {vue === 'connexion' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
              <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span style={{ fontSize: 13, color: '#9AA5B1' }}>ou</span>
              <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>
            <button
              type="button"
              onClick={() => {
                setVue('inscription')
                reset()
              }}
              style={{
                fontFamily: 'Arial, sans-serif',
                width: '100%',
                padding: '13px 0',
                fontSize: 15,
                fontWeight: 700,
                border: '1px solid #C9D6E3',
                borderRadius: 10,
                background: '#FFFFFF',
                color: '#1F2933',
                cursor: 'pointer',
              }}
            >
              Créer mon compte
            </button>
            <p style={{ fontSize: 13, color: '#9AA5B1', textAlign: 'center', margin: '14px 0 0 0' }}>
              Votre professeur devra valider votre inscription.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
