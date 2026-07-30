// ComptesEleves.tsx
// Espace Comptes eleves cote professeur. Pour chaque eleve accepte : nom,
// prenom, email. Le professeur peut DEFINIR un nouveau mot de passe, jamais le
// relire : les mots de passe sont chiffres par Supabase Auth et ne sont plus
// stockes en clair dans la base.
// Style inline, Arial, couleur professeur.

import { useEffect, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { COULEUR_PROF } from '../../data/schema'
import { listerComptesEleves, definirMotDePasseEleve } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'

function triNom(a: Profil, b: Profil): number {
  return (a.nom ?? '').localeCompare(b.nom ?? '', 'fr')
}

export function ComptesEleves() {
  const [eleves, setEleves] = useState<Profil[]>([])
  const [chargement, setChargement] = useState(true)
  // Edition du mot de passe simple : id de l'eleve en cours d'edition + valeur.
  const [editionId, setEditionId] = useState<string | null>(null)
  const [valeur, setValeur] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function recharger() {
    const liste = await listerComptesEleves()
    setEleves([...liste].sort(triNom))
    setChargement(false)
  }

  useEffect(() => {
    recharger()
  }, [])

  function commencerEdition(e: Profil) {
    setEditionId(e.id)
    setValeur('')
  }

  async function enregistrer(id: string) {
    const mdp = valeur.trim()
    if (mdp.length < 6) {
      alert('Le mot de passe doit comporter au moins 6 caractères.')
      return
    }
    setEnCours(true)
    const { erreur } = await definirMotDePasseEleve(id, mdp)
    setEnCours(false)
    if (erreur) {
      alert(
        "L'enregistrement a échoué. Vérifiez que la fonction reinitialiser-mdp-eleve est bien déployée dans Supabase.\n\nDétail : " +
          erreur
      )
      return
    }
    setEditionId(null)
    setValeur('')
    alert('Mot de passe enregistré. Notez-le : il ne sera plus affiché.')
    recharger()
  }

  const manuels = eleves.filter((e) => e.manuel === true)
  const auth = eleves.filter((e) => e.manuel !== true)

  const carte: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: 14,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    padding: 22,
    marginBottom: 22,
  }
  const th: React.CSSProperties = {
    textAlign: 'left',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 700,
    padding: '8px 10px',
    borderBottom: '2px solid #E5EAF0',
  }
  const td: React.CSSProperties = {
    fontSize: 14,
    color: '#1F2933',
    padding: '10px',
    borderBottom: '1px solid #EEF2F6',
  }
  const champ: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #C9D6E3',
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 14,
    color: '#1F2933',
    width: 160,
  }
  const bouton: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    border: 'none',
    borderRadius: 8,
    padding: '7px 12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    background: COULEUR_PROF,
    color: '#FFFFFF',
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <EnteteProf actif="/enseignant" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: 24, color: '#1F2933', margin: '0 0 6px 0' }}>Comptes élèves</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 22px 0', lineHeight: 1.6 }}>
          Identifiants de connexion des élèves. Vous pouvez définir un nouveau mot de passe pour un élève,
          mais aucun mot de passe n'est lisible : ils sont chiffrés côté serveur et ne sont plus conservés
          en clair dans la base. Après avoir défini un mot de passe, notez-le et transmettez-le à l'élève :
          il ne sera plus affiché. L'élève peut aussi le réinitialiser lui-même depuis la page de connexion
          (lien « Mot de passe oublié »).
        </p>

        {chargement ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>Chargement...</p>
        ) : (
          <>
            <div style={carte}>
              <h2 style={{ fontSize: 17, color: '#1F2933', margin: '0 0 4px 0' }}>Élèves ajoutés à la main</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px 0' }}>
                Vous pouvez définir un mot de passe. Il ne sera pas affiché ensuite.
              </p>
              {manuels.length === 0 ? (
                <p style={{ fontSize: 14, color: '#9AA5B1', margin: 0 }}>Aucun élève ajouté à la main.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>Nom</th>
                      <th style={th}>Prénom</th>
                      <th style={th}>Email</th>
                      <th style={th}>Mot de passe</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {manuels.map((e) => (
                      <tr key={e.id}>
                        <td style={td}>{e.nom}</td>
                        <td style={td}>{e.prenom}</td>
                        <td style={td}>{e.email}</td>
                        <td style={td}>
                          {editionId === e.id ? (
                            <input
                              style={champ}
                              value={valeur}
                              onChange={(ev) => setValeur(ev.target.value)}
                              placeholder="6 caractères minimum"
                              autoFocus
                            />
                          ) : (
                            <span style={{ color: '#9AA5B1' }}>chiffré (non lisible)</span>
                          )}
                        </td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          {editionId === e.id ? (
                            <>
                              <button
                                type="button"
                                style={{ ...bouton, opacity: enCours ? 0.6 : 1 }}
                                disabled={enCours}
                                onClick={() => enregistrer(e.id)}
                              >
                                Enregistrer
                              </button>
                              <button
                                type="button"
                                style={{ ...bouton, background: '#E5EAF0', color: '#1F2933', marginLeft: 8 }}
                                onClick={() => {
                                  setEditionId(null)
                                  setValeur('')
                                }}
                              >
                                Annuler
                              </button>
                            </>
                          ) : (
                            <button type="button" style={bouton} onClick={() => commencerEdition(e)}>
                              Définir
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={carte}>
              <h2 style={{ fontSize: 17, color: '#1F2933', margin: '0 0 4px 0' }}>Comptes créés par les élèves</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px 0' }}>
                Mot de passe chiffré, non lisible. En cas d'oubli, l'élève utilise le lien
                « Mot de passe oublié » sur sa page de connexion.
              </p>
              {auth.length === 0 ? (
                <p style={{ fontSize: 14, color: '#9AA5B1', margin: 0 }}>Aucun compte de ce type.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>Nom</th>
                      <th style={th}>Prénom</th>
                      <th style={th}>Email</th>
                      <th style={th}>Mot de passe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auth.map((e) => (
                      <tr key={e.id}>
                        <td style={td}>{e.nom}</td>
                        <td style={td}>{e.prenom}</td>
                        <td style={td}>{e.email}</td>
                        <td style={{ ...td, color: '#9AA5B1' }}>chiffré (non lisible)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
