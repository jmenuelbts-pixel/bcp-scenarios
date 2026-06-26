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
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')

  const [erreur, setErreur] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  // Charte RGPD : modale, scroll jusqu'en bas, acceptation obligatoire.
  const [charteOuverte, setCharteOuverte] = useState(false)
  const [charteAcceptee, setCharteAcceptee] = useState(false)
  const [basAtteint, setBasAtteint] = useState(false)

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
                <input style={champ} value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Marie" />
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

        {vue === 'inscription' && (
          <button
            type="button"
            onClick={() => {
              setCharteOuverte(true)
              setBasAtteint(false)
            }}
            style={{
              fontFamily: 'Arial, sans-serif',
              width: '100%',
              marginTop: 22,
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              background: charteAcceptee ? '#EAF7EF' : '#FFCC00',
              color: charteAcceptee ? '#1B6B3A' : '#5A4500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {charteAcceptee ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="5,12 10,17 19,7" fill="none" stroke="#1B6B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Charte de confidentialité acceptée
              </>
            ) : (
              'Lire la charte de confidentialité (obligatoire)'
            )}
          </button>
        )}

        <button
          type="button"
          disabled={
            enCours ||
            !email.trim() ||
            !motDePasse ||
            (vue === 'inscription' && !charteAcceptee)
          }
          onClick={soumettre}
          style={{
            fontFamily: 'Arial, sans-serif',
            width: '100%',
            marginTop: vue === 'inscription' ? 12 : 22,
            padding: '13px 0',
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            borderRadius: 10,
            cursor:
              enCours || !email.trim() || !motDePasse || (vue === 'inscription' && !charteAcceptee)
                ? 'not-allowed'
                : 'pointer',
            background:
              enCours || !email.trim() || !motDePasse || (vue === 'inscription' && !charteAcceptee)
                ? '#C9CDD2'
                : ACCENT,
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

      {charteOuverte && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 1000,
          }}
          onClick={() => setCharteOuverte(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              width: '100%',
              maxWidth: 560,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E8EDF2' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#1F2933' }}>Charte de confidentialité</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
                Faites défiler jusqu'en bas pour pouvoir accepter.
              </p>
            </div>

            <div
              onScroll={(e) => {
                const el = e.currentTarget
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setBasAtteint(true)
              }}
              style={{ padding: '18px 22px', overflowY: 'auto', fontSize: 13, color: '#374151', lineHeight: 1.65 }}
            >
              {CHARTE.map((section) => (
                <div key={section.titre} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#1F2933', marginBottom: 4 }}>{section.titre}</div>
                  <div>{section.texte}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid #E8EDF2', minHeight: 30 }}>
              {basAtteint ? (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#1F2933' }}>
                  <input
                    type="checkbox"
                    checked={charteAcceptee}
                    onChange={(e) => {
                      setCharteAcceptee(e.target.checked)
                      if (e.target.checked) setTimeout(() => setCharteOuverte(false), 400)
                    }}
                    style={{ marginTop: 2, width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span>
                    J'ai lu et j'accepte la charte de confidentialité et le traitement de mes données dans le cadre
                    décrit ci-dessus.
                  </span>
                </label>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: '#9AA5B1', textAlign: 'center' }}>
                  Continuez à faire défiler pour accepter la charte.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CHARTE: { titre: string; texte: string }[] = [
  {
    titre: 'Responsable du traitement',
    texte:
      "Le traitement des données personnelles est mis en oeuvre par J.M., professeur d'Économie-Gestion, Lycée Maria Deraismes, Paris 17e, dans le cadre de l'enseignement du Bac Professionnel Métiers du Commerce et de la Vente, option B.",
  },
  {
    titre: 'Données collectées',
    texte:
      'Les données suivantes sont collectées : nom, prénom, adresse email, travaux rendus, progression pédagogique séance par séance, scores aux évaluations, niveau de maîtrise des compétences.',
  },
  {
    titre: 'Finalité du traitement',
    texte:
      "Ces données sont utilisées exclusivement dans le cadre du suivi pédagogique de la formation Bac Professionnel Métiers du Commerce et de la Vente, option B. Elles permettent à l'enseignant de suivre votre progression, corriger vos travaux et vous accompagner tout au long de la formation.",
  },
  {
    titre: 'Accès aux données',
    texte:
      "Seul l'enseignant responsable a accès à vos données. Elles ne sont pas transmises à des tiers, ne sont pas utilisées à des fins commerciales et ne font l'objet d'aucune cession.",
  },
  {
    titre: 'Durée de conservation',
    texte:
      "Vos données sont conservées pendant la durée de votre formation. Elles sont supprimées à l'issue de l'année scolaire ou sur demande de votre part.",
  },
  {
    titre: 'Vos droits',
    texte:
      "Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679), vous disposez d'un droit d'accès, de rectification et d'effacement de vos données. Pour exercer ces droits, contactez votre enseignant directement via la messagerie de l'application.",
  },
  {
    titre: 'Sécurité',
    texte:
      "Les données sont hébergées sur des serveurs sécurisés situés en Europe (Supabase, région eu-west-1). L'accès est protégé par authentification. Aucune donnée n'est stockée localement sur votre appareil.",
  },
]
