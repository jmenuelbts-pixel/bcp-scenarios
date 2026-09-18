// PanneauInvite.tsx
// Encadre "Accès invité" (page Comptes élèves). Le professeur cree/active un
// compte invite unique, le rattache a une classe reelle, choisit les scenarios
// visibles, et active/desactive l'acces. Couleur distincte (violet) pour bien
// le separer des vrais eleves.

import { useEffect, useState } from 'react'
import { SCENARIOS } from '../../data/schema'
import { listerClasses, type Classe } from '../../lib/classes'
import {
  creerOuActiverInvite,
  lireInvite,
  definirInviteActif,
  definirClasseInvite,
  scenariosOuverts,
  definirScenariosOuverts,
} from '../../lib/invite'
import type { Profil } from '../../lib/auth'

const VIOLET = '#6D28D9'
const VIOLET_CLAIR = '#F4EEFC'

export function PanneauInvite() {
  const [classes, setClasses] = useState<Classe[]>([])
  const [invite, setInvite] = useState<Profil | null>(null)
  const [classeId, setClasseId] = useState<string>('')
  const [ouverts, setOuverts] = useState<string[]>([])
  const [mdp, setMdp] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function recharger() {
    const [cs, inv, ouv] = await Promise.all([listerClasses(), lireInvite(), scenariosOuverts()])
    setClasses(cs)
    setInvite(inv)
    setOuverts(ouv)
    if (inv?.classe_id) setClasseId(inv.classe_id)
    else if (cs.length > 0) setClasseId((p) => p || cs[0].id)
  }

  useEffect(() => {
    recharger()
  }, [])

  const actif = invite?.invite_actif === true

  async function creerActiver() {
    if (mdp.trim().length < 6) {
      setMessage('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }
    setEnCours(true)
    setMessage(null)
    const { email, erreur } = await creerOuActiverInvite(mdp.trim(), classeId || null)
    setEnCours(false)
    if (erreur) {
      setMessage('Erreur : ' + erreur)
      return
    }
    setMessage(`Accès invité activé. Identifiant : ${email} — mot de passe : celui que vous venez de saisir. Notez-le.`)
    setMdp('')
    recharger()
  }

  async function basculerActif() {
    setEnCours(true)
    const { erreur } = await definirInviteActif(!actif)
    setEnCours(false)
    if (erreur) { setMessage('Erreur : ' + erreur); return }
    recharger()
  }

  async function changerClasse(id: string) {
    setClasseId(id)
    if (invite) await definirClasseInvite(id || null)
  }

  async function basculerScenario(id: string) {
    const nouveau = ouverts.includes(id) ? ouverts.filter((x) => x !== id) : [...ouverts, id]
    setOuverts(nouveau)
    await definirScenariosOuverts(nouveau)
  }

  return (
    <div style={{ background: VIOLET_CLAIR, border: `1.5px solid ${VIOLET}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ background: VIOLET, color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>ACCÈS INVITÉ</span>
        <h2 style={{ fontSize: 17, color: '#1F2933', margin: 0 }}>Collègue ou inspecteur</h2>
      </div>
      <p style={{ fontSize: 13, color: '#5B4B7A', margin: '0 0 12px 0', lineHeight: 1.6 }}>
        Un compte visiteur unique qui voit l'interface élève d'une classe réelle, mais uniquement les scénarios que vous ouvrez.
        Désactivez l'accès une fois la visite terminée.
      </p>

      {/* Identifiant fixe, toujours visible */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D8CBEE', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Identifiant de connexion de l'invité (toujours le même) :</span>
        <div style={{ fontSize: 14, fontWeight: 700, color: VIOLET, fontFamily: 'monospace', marginTop: 2 }}>invite@bcp-scenarios-mcvb.app</div>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Vous choisissez le mot de passe ci-dessous et le donnez à l'invité. Seul ce compte peut le voir.</span>
      </div>

      {/* Etat actuel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2933' }}>État :</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: actif ? '#0F9E75' : '#9AA5B1' }}>
          {invite ? (actif ? 'Actif' : 'Désactivé') : 'Non créé'}
        </span>
        {invite && (
          <button
            type="button"
            onClick={basculerActif}
            disabled={enCours}
            style={{ fontFamily: 'Arial, sans-serif', background: actif ? '#C0392B' : '#0F9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            {actif ? 'Désactiver l\u2019accès' : 'Réactiver l\u2019accès'}
          </button>
        )}
      </div>

      {/* Classe rattachee */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', display: 'block', marginBottom: 6 }}>Classe visible par l'invité</label>
        <select
          value={classeId}
          onChange={(e) => changerClasse(e.target.value)}
          style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9B8E6', borderRadius: 8, padding: '9px 12px', fontSize: 14, minWidth: 220 }}
        >
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>

      {/* Scenarios ouverts */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', display: 'block', marginBottom: 8 }}>
          Scénarios visibles par l'invité (cochez ce que vous ouvrez)
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SCENARIOS.map((s) => {
            const coche = ouverts.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => basculerScenario(s.id)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  border: `1.5px solid ${coche ? VIOLET : '#D8CBEE'}`,
                  background: coche ? VIOLET : '#FFFFFF',
                  color: coche ? '#FFFFFF' : '#5B4B7A',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {coche ? '\u2713 ' : ''}{s.nom}
              </button>
            )
          })}
        </div>
        {ouverts.length === 0 && (
          <p style={{ fontSize: 12, color: '#C0392B', margin: '8px 0 0 0' }}>Aucun scénario ouvert : l'invité ne verra rien.</p>
        )}
      </div>

      {/* Creation / mot de passe */}
      <div style={{ borderTop: '1px solid #D8CBEE', paddingTop: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', display: 'block', marginBottom: 6 }}>
          {invite ? 'Redéfinir le mot de passe invité' : 'Créer l\u2019accès invité (choisir un mot de passe)'}
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            placeholder="6 caractères minimum"
            style={{ fontFamily: 'Arial, sans-serif', border: '1px solid #C9B8E6', borderRadius: 8, padding: '9px 12px', fontSize: 14, minWidth: 220 }}
          />
          <button
            type="button"
            onClick={creerActiver}
            disabled={enCours}
            style={{ fontFamily: 'Arial, sans-serif', background: VIOLET, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: enCours ? 'wait' : 'pointer' }}
          >
            {invite ? 'Mettre à jour' : 'Créer l\u2019accès'}
          </button>
        </div>
        {message && (
          <p style={{ fontSize: 12.5, color: message.startsWith('Erreur') ? '#C0392B' : '#0F7B4F', margin: '10px 0 0 0', lineHeight: 1.5 }}>{message}</p>
        )}
        {invite && (
          <p style={{ fontSize: 12, color: '#6B7280', margin: '8px 0 0 0' }}>
            Identifiant de connexion : <strong>{invite.email}</strong>
          </p>
        )}
      </div>
    </div>
  )
}
