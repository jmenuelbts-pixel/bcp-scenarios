// Travaux.tsx
// Liste de tous les travaux rendus par les eleves, avec selecteur de tri.
// Ordre par defaut : alphabetique par nom. Le professeur peut ouvrir le suivi
// de l'eleve pour corriger.

import { useEffect, useMemo, useState } from 'react'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { SelecteurTri, type CleTri } from '../../components/ui/SelecteurTri'
import { COULEUR_PROF, getMission } from '../../data/schema'
import { tousLesTravaux, type TravailListe } from '../../lib/enseignant'
import { DetailActivitesEleve } from '../../components/enseignant/DetailActivitesEleve'

function titreMission(missionId: string): string {
  const scenarioId = missionId.split('-m')[0]
  const m = getMission(scenarioId, missionId)
  return m ? `Mission ${m.numero} - ${m.titre}` : missionId
}

function trier(liste: TravailListe[], cle: CleTri): TravailListe[] {
  const copie = [...liste]
  switch (cle) {
    case 'alphabetique':
      return copie.sort((a, b) => a.eleveNom.localeCompare(b.eleveNom, 'fr'))
    case 'date_remise':
    case 'derniere_activite':
      return copie.sort((a, b) => b.created_at.localeCompare(a.created_at))
    case 'statut':
    case 'avancement':
      // Non corriges d'abord (en attente), puis corriges.
      return copie.sort((a, b) => Number(a.corrige) - Number(b.corrige))
    case 'note':
      // Pas de note chiffree sur les travaux : corriges (evalues) en premier.
      return copie.sort((a, b) => Number(b.corrige) - Number(a.corrige))
    default:
      return copie
  }
}

export function Travaux() {
  const [travaux, setTravaux] = useState<TravailListe[]>([])
  const [chargement, setChargement] = useState(true)
  const [tri, setTri] = useState<CleTri>('alphabetique')
  const [ouvert, setOuvert] = useState<string | null>(null)

  useEffect(() => {
    tousLesTravaux().then((t) => {
      setTravaux(t)
      setChargement(false)
    })
  }, [])

  const tries = useMemo(() => trier(travaux, tri), [travaux, tri])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F4F7FA' }}>
      <EnteteProf actif="/enseignant" />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h1 style={{ fontSize: 20, color: '#1F2933', margin: 0 }}>Travaux à rendre</h1>
          <SelecteurTri valeur={tri} onChange={setTri} />
        </div>

        {chargement ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Chargement...</p>
        ) : tries.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6B7280' }}>Aucun travail rendu pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tries.map((t) => {
              const estOuvert = ouvert === t.id
              return (
                <div key={t.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setOuvert(estOuvert ? null : t.id)}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>
                        {t.eleveNom} {t.elevePrenom}
                      </div>
                      <div style={{ fontSize: 13, color: '#4B5563', marginTop: 2 }}>{titreMission(t.missionId)}</div>
                      <div style={{ fontSize: 12, color: '#9AA5B1', marginTop: 2 }}>
                        Rendu le {new Date(t.created_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(t.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '5px 12px',
                          borderRadius: 99,
                          background: t.corrige ? '#EAF2EC' : '#FDF1E3',
                          color: t.corrige ? COULEUR_PROF : '#B26B16',
                        }}
                      >
                        {t.corrige ? 'Corrigé' : 'En attente'}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: estOuvert ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        <polyline points="6,9 12,16 18,9" fill="none" stroke="#9AA5B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>

                  {estOuvert && (
                    <div style={{ padding: '0 16px 16px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#16456E', margin: '4px 0 4px' }}>Travail rédigé</div>
                      <div style={{ background: '#F8FAFC', border: '1px solid #E6ECF2', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#1F2933', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                        {(t.contenu ?? '').trim().length > 0 ? t.contenu : 'Aucun texte rédigé.'}
                      </div>
                      <DetailActivitesEleve eleveId={t.eleveId} missionId={t.missionId} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
