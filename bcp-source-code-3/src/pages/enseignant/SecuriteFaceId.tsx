// SecuriteFaceId.tsx
// Page d'activation de Face ID sur l'appareil courant (cote professeur).
// L'utilisateur doit deja etre connecte (par mot de passe) pour activer.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF } from '../../data/schema'
import { faceIdDisponible, faceIdActiveSurCetAppareil, activerFaceId, desactiverFaceIdLocal } from '../../lib/faceId'
import { useAuth } from '../../lib/auth'
import { listerClasses, type Classe } from '../../lib/classes'
import { deconnecterClasse } from '../../lib/enseignant'

export function SecuriteFaceId() {
  const navigate = useNavigate()
  const [actif, setActif] = useState(faceIdActiveSurCetAppareil())
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const { deconnecterPartout } = useAuth()
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false)

  async function toutDeconnecter() {
    setDeconnexionEnCours(true)
    try {
      await deconnecterPartout()
      // La session locale etant coupee, l'app redirige vers l'ecran de connexion.
    } finally {
      setDeconnexionEnCours(false)
      setConfirmOuvert(false)
    }
  }

  // Deconnexion des eleves (par classe).
  const [classes, setClasses] = useState<Classe[]>([])
  const [classeChoisie, setClasseChoisie] = useState<string>('')
  const [confirmElevesOuvert, setConfirmElevesOuvert] = useState(false)
  const [elevesEnCours, setElevesEnCours] = useState(false)
  const [elevesMsg, setElevesMsg] = useState<{ texte: string; ok: boolean } | null>(null)

  useEffect(() => {
    listerClasses().then(setClasses)
  }, [])

  async function deconnecterLesEleves() {
    setElevesEnCours(true)
    setElevesMsg(null)
    try {
      const { deconnectes, erreur } = await deconnecterClasse(classeChoisie || null)
      if (erreur) {
        setElevesMsg({ texte: erreur, ok: false })
      } else {
        const cible = classeChoisie ? classes.find((c) => c.id === classeChoisie)?.nom ?? 'la classe' : 'toutes les classes'
        setElevesMsg({ texte: `${deconnectes} élève(s) de ${cible} déconnecté(s) de leurs appareils.`, ok: true })
      }
    } finally {
      setElevesEnCours(false)
      setConfirmElevesOuvert(false)
    }
  }
  const dispo = faceIdDisponible()

  async function activer() {
    setErreur(null); setMessage(null); setEnCours(true)
    try {
      const { erreur } = await activerFaceId()
      if (erreur) { setErreur(erreur); return }
      setActif(true)
      setMessage('Face ID est maintenant activé sur cet appareil. Vous pourrez l\'utiliser à la prochaine connexion.')
    } finally {
      setEnCours(false)
    }
  }

  function desactiver() {
    desactiverFaceIdLocal()
    setActif(false)
    setMessage('Face ID ne sera plus proposé sur cet appareil. Le mot de passe reste disponible.')
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={{ fontFamily: 'Arial, sans-serif', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFFFFF', borderRadius: 99, padding: '6px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Sécurité / Face ID</h1>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 54, height: 54, borderRadius: 14, background: '#EAF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8 V6 a2 2 0 0 1 2 -2 h2" /><path d="M16 4 h2 a2 2 0 0 1 2 2 v2" /><path d="M20 16 v2 a2 2 0 0 1 -2 2 h-2" /><path d="M8 20 H6 a2 2 0 0 1 -2 -2 v-2" />
                <path d="M9 10 v1.5" /><path d="M15 10 v1.5" /><path d="M12 9.5 v4" /><path d="M9 15.5 s1 1.3 3 1.3 3 -1.3 3 -1.3" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2933' }}>Connexion par Face ID</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                {actif ? 'Activé sur cet appareil.' : 'Non activé sur cet appareil.'}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
            Face ID vous permet de vous connecter d'un simple regard sur cet appareil, sans taper votre mot de passe. Le mot de passe reste toujours disponible en secours. L'activation est propre à cet appareil.
          </p>

          {!dispo && (
            <p style={{ fontSize: 13, color: '#9B2C2C', background: '#FDECEC', borderRadius: 8, padding: '10px 12px', margin: 0 }}>
              Cet appareil ou ce navigateur ne prend pas en charge Face ID.
            </p>
          )}
          {message && (
            <p style={{ fontSize: 13, color: '#0F7A52', background: '#DEF3E8', borderRadius: 8, padding: '10px 12px', margin: 0 }}>{message}</p>
          )}
          {erreur && (
            <p style={{ fontSize: 13, color: '#9B2C2C', background: '#FDECEC', borderRadius: 8, padding: '10px 12px', margin: 0 }}>{erreur}</p>
          )}

          {dispo && !actif && (
            <button type="button" onClick={activer} disabled={enCours} style={{ fontFamily: 'Arial, sans-serif', background: enCours ? '#9BB8DE' : '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: enCours ? 'wait' : 'pointer' }}>
              {enCours ? 'Veuillez patienter...' : 'Activer Face ID sur cet appareil'}
            </button>
          )}
          {dispo && actif && (
            <button type="button" onClick={desactiver} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#B0413E', border: '1px solid #E2B3B1', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Ne plus proposer Face ID sur cet appareil
            </button>
          )}
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, padding: 24, marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 54, height: 54, borderRadius: 14, background: '#FDECEC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#B0413E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2933' }}>Me déconnecter de partout</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Ferme toutes vos sessions, sur tous les appareils.</div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
            Si vous avez peut-être laissé votre session ouverte ailleurs (ordinateur, tablette), ce bouton déconnecte votre compte de tous les appareils à la fois. Vous pourrez ensuite vous reconnecter tranquillement.
          </p>

          <button type="button" onClick={() => setConfirmOuvert(true)} style={{ fontFamily: 'Arial, sans-serif', background: '#B0413E', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Me déconnecter de partout
          </button>

          <div style={{ height: 1, background: '#EAF0F5', alignSelf: 'stretch', margin: '4px 0' }} />

          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2933', marginBottom: 4 }}>Déconnecter les élèves de partout</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 12px' }}>
              Ferme les sessions des élèves restées ouvertes après le cours. Choisissez une classe, ou déconnectez toutes les classes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <select value={classeChoisie} onChange={(e) => setClasseChoisie(e.target.value)} style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9D6E3', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#1F2933', minWidth: 200 }}>
                <option value="">Toutes les classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <button type="button" onClick={() => { setElevesMsg(null); setConfirmElevesOuvert(true) }} style={{ fontFamily: 'Arial, sans-serif', background: '#C2660C', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Déconnecter les élèves
              </button>
            </div>
            {elevesMsg && (
              <p style={{ fontSize: 13, borderRadius: 8, padding: '10px 12px', margin: '12px 0 0', color: elevesMsg.ok ? '#0F7A52' : '#9B2C2C', background: elevesMsg.ok ? '#DEF3E8' : '#FDECEC' }}>{elevesMsg.texte}</p>
            )}
          </div>
        </div>
      </main>

      {confirmOuvert && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}
          onClick={() => !deconnexionEnCours && setConfirmOuvert(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2933', marginBottom: 8 }}>Déconnecter toutes les sessions ?</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 20px' }}>
              Voulez-vous vraiment déconnecter votre compte de tous les appareils ? Toute session ouverte ailleurs sera fermée. Vous serez aussi déconnecté ici et devrez vous reconnecter.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setConfirmOuvert(false)} disabled={deconnexionEnCours} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#6B7280', border: '1px solid #D8DEE5', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: deconnexionEnCours ? 'wait' : 'pointer' }}>Annuler</button>
              <button type="button" onClick={toutDeconnecter} disabled={deconnexionEnCours} style={{ fontFamily: 'Arial, sans-serif', background: deconnexionEnCours ? '#D89B99' : '#B0413E', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: deconnexionEnCours ? 'wait' : 'pointer' }}>
                {deconnexionEnCours ? 'Déconnexion...' : 'Oui, déconnecter partout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmElevesOuvert && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000 }}
          onClick={() => !elevesEnCours && setConfirmElevesOuvert(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2933', marginBottom: 8 }}>Déconnecter les élèves ?</div>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 20px' }}>
              {classeChoisie
                ? `Tous les élèves de « ${classes.find((c) => c.id === classeChoisie)?.nom ?? ''} » seront déconnectés de tous leurs appareils. Ils devront se reconnecter.`
                : 'Tous les élèves de toutes les classes seront déconnectés de tous leurs appareils. Ils devront se reconnecter.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setConfirmElevesOuvert(false)} disabled={elevesEnCours} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', color: '#6B7280', border: '1px solid #D8DEE5', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: elevesEnCours ? 'wait' : 'pointer' }}>Annuler</button>
              <button type="button" onClick={deconnecterLesEleves} disabled={elevesEnCours} style={{ fontFamily: 'Arial, sans-serif', background: elevesEnCours ? '#DDA870' : '#C2660C', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: elevesEnCours ? 'wait' : 'pointer' }}>
                {elevesEnCours ? 'Déconnexion...' : 'Oui, déconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
