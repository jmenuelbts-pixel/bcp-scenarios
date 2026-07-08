// ClassesGroupes.tsx
// Ecran de gestion des classes et des groupes. Le professeur cree/renomme/
// supprime des classes et des groupes (un groupe appartient a une classe),
// et affecte chaque eleve a une classe et a des groupes.

import { useEffect, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { COULEUR_PROF } from '../../data/schema'
import { listerElevesAcceptes, ajouterEleveManuel } from '../../lib/enseignant'
import type { Profil } from '../../lib/auth'
import {
  listerClasses,
  creerClasse,
  renommerClasse,
  supprimerClasse,
  listerGroupes,
  creerGroupe,
  renommerGroupe,
  supprimerGroupe,
  affecterClasse,
  listerLiaisonsGroupes,
  ajouterEleveGroupe,
  retirerEleveGroupe,
  type Classe,
  type Groupe,
  type LiaisonGroupe,
} from '../../lib/classes'

const champ: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  border: '1px solid #C9D6E3',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
}
const btnVert: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  background: COULEUR_PROF,
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 8,
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
}

export function ClassesGroupes() {
  const [classes, setClasses] = useState<Classe[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [eleves, setEleves] = useState<Profil[]>([])
  const [liaisons, setLiaisons] = useState<LiaisonGroupe[]>([])
  const [nouvelleClasse, setNouvelleClasse] = useState('')
  const [nouveauGroupe, setNouveauGroupe] = useState('')
  const [classeCourante, setClasseCourante] = useState<string | null>(null)

  async function toutRecharger() {
    const [c, g, e, l] = await Promise.all([
      listerClasses(),
      listerGroupes(),
      listerElevesAcceptes(),
      listerLiaisonsGroupes(),
    ])
    setClasses(c)
    setGroupes(g)
    setEleves(e)
    setLiaisons(l)
    if (!classeCourante && c.length > 0) setClasseCourante(c[0].id)
  }

  useEffect(() => {
    toutRecharger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function ajouterClasse() {
    if (!nouvelleClasse.trim()) return
    const { id, erreur } = await creerClasse(nouvelleClasse.trim())
    if (erreur) { alert('Création impossible : ' + erreur); return }
    setNouvelleClasse('')
    await toutRecharger()
    if (id) setClasseCourante(id)
  }

  async function ajouterGroupe() {
    if (!classeCourante) { alert('Choisissez d’abord une classe.'); return }
    if (!nouveauGroupe.trim()) return
    const { erreur } = await creerGroupe(classeCourante, nouveauGroupe.trim())
    if (erreur) { alert('Création impossible : ' + erreur); return }
    setNouveauGroupe('')
    await toutRecharger()
  }

  const groupesClasse = groupes.filter((g) => g.classe_id === classeCourante)
  const elevesClasse = eleves.filter((e) => e.classe_id === classeCourante)
  const dansGroupe = (eleveId: string, groupeId: string) =>
    liaisons.some((l) => l.eleve_id === eleveId && l.groupe_id === groupeId)

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant" />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 20, color: '#1F2933', margin: '0 0 16px' }}>Classes et groupes</h1>

        {/* Creation de classe */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Nouvelle classe :</span>
            <input value={nouvelleClasse} onChange={(e) => setNouvelleClasse(e.target.value)} placeholder="Ex : Terminale MCV B" style={{ ...champ, minWidth: 220 }} />
            <button type="button" onClick={ajouterClasse} style={btnVert}>Créer la classe</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {classes.map((c) => (
              <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: classeCourante === c.id ? `2px solid ${COULEUR_PROF}` : '1px solid #D2DCE6', borderRadius: 99, padding: '6px 12px', background: classeCourante === c.id ? '#EAF2EC' : '#FFFFFF' }}>
                <button type="button" onClick={() => setClasseCourante(c.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{c.nom}</button>
                <button type="button" title="Renommer" onClick={async () => { const n = prompt('Nouveau nom de la classe :', c.nom); if (n && n.trim()) { await renommerClasse(c.id, n.trim()); toutRecharger() } }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 12 }}>✎</button>
                <button type="button" title="Supprimer" onClick={async () => { if (window.confirm(`Supprimer la classe « ${c.nom} » ? Les élèves ne seront plus rattachés à une classe et ses groupes seront supprimés.`)) { await supprimerClasse(c.id); if (classeCourante === c.id) setClasseCourante(null); toutRecharger() } }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#C1554F', fontSize: 12 }}>✕</button>
              </span>
            ))}
            {classes.length === 0 && <span style={{ fontSize: 13, color: '#6B7280' }}>Aucune classe pour le moment.</span>}
          </div>
        </div>

        {classeCourante && (
          <>
            {/* Groupes de la classe */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Groupes de cette classe :</span>
                <input value={nouveauGroupe} onChange={(e) => setNouveauGroupe(e.target.value)} placeholder="Ex : Groupe A" style={{ ...champ, minWidth: 180 }} />
                <button type="button" onClick={ajouterGroupe} style={btnVert}>Créer le groupe</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {groupesClasse.map((g) => (
                  <span key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #D2DCE6', borderRadius: 99, padding: '6px 12px', background: '#F7FAFC' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2933' }}>{g.nom}</span>
                    <button type="button" title="Renommer" onClick={async () => { const n = prompt('Nouveau nom du groupe :', g.nom); if (n && n.trim()) { await renommerGroupe(g.id, n.trim()); toutRecharger() } }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 12 }}>✎</button>
                    <button type="button" title="Supprimer" onClick={async () => { if (window.confirm(`Supprimer le groupe « ${g.nom} » ?`)) { await supprimerGroupe(g.id); toutRecharger() } }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#C1554F', fontSize: 12 }}>✕</button>
                  </span>
                ))}
                {groupesClasse.length === 0 && <span style={{ fontSize: 13, color: '#6B7280' }}>Aucun groupe dans cette classe.</span>}
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 10 }}>Les groupes servent à l'appel et aux missions (déverrouillage), pas aux notes.</p>
            </div>

            {/* Affectation des eleves */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Élèves de la classe et groupes</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', fontSize: 12, color: '#6B7280', padding: '6px 8px', borderBottom: '1px solid #EEF2F5' }}>Élève</th>
                      <th style={{ textAlign: 'left', fontSize: 12, color: '#6B7280', padding: '6px 8px', borderBottom: '1px solid #EEF2F5' }}>Classe</th>
                      {groupesClasse.map((g) => (
                        <th key={g.id} style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', padding: '6px 8px', borderBottom: '1px solid #EEF2F5' }}>{g.nom}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {elevesClasse.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontSize: 13, fontWeight: 600, padding: '6px 8px', borderBottom: '1px solid #F3F6F9' }}>{e.nom} {e.prenom}</td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid #F3F6F9' }}>
                          <select value={e.classe_id ?? ''} onChange={async (ev) => { await affecterClasse(e.id, ev.target.value || null); toutRecharger() }} style={{ ...champ, padding: '4px 6px', fontSize: 12 }}>
                            <option value="">— Sans classe —</option>
                            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                          </select>
                        </td>
                        {groupesClasse.map((g) => (
                          <td key={g.id} style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '1px solid #F3F6F9' }}>
                            <input
                              type="checkbox"
                              checked={dansGroupe(e.id, g.id)}
                              onChange={async (ev) => {
                                if (ev.target.checked) await ajouterEleveGroupe(e.id, g.id)
                                else await retirerEleveGroupe(e.id, g.id)
                                toutRecharger()
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {elevesClasse.length === 0 && (
                      <tr><td colSpan={2 + groupesClasse.length} style={{ fontSize: 13, color: '#6B7280', padding: '10px 8px' }}>Aucun élève dans cette classe. Affectez-les depuis « Demandes d'inscription » ou changez leur classe ci-dessous.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Eleves sans classe : rattachement rapide */}
              <ElevesSansClasse eleves={eleves} classes={classes} onChange={toutRecharger} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function ElevesSansClasse({ eleves, classes, onChange }: { eleves: Profil[]; classes: Classe[]; onChange: () => void }) {
  const sans = eleves.filter((e) => !e.classe_id)
  if (sans.length === 0) return null
  return (
    <div style={{ marginTop: 16, borderTop: '1px dashed #E2E8F0', paddingTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#8A5A00' }}>Élèves sans classe ({sans.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sans.map((e) => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, minWidth: 200 }}>{e.nom} {e.prenom}</span>
            <select defaultValue="" onChange={async (ev) => { if (ev.target.value) { await affecterClasse(e.id, ev.target.value); onChange() } }} style={{ ...champ, padding: '4px 6px', fontSize: 12 }}>
              <option value="">— Affecter à une classe —</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
