// Travaux.tsx
// Liste de tous les travaux rendus par les eleves, avec selecteur de tri.
// Ordre par defaut : alphabetique par nom. Le professeur peut ouvrir le suivi
// de l'eleve pour corriger.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EnteteProf } from '../../components/ui/EnteteProf'
import { SelecteurTri, type CleTri } from '../../components/ui/SelecteurTri'
import { COULEUR_PROF, getMission } from '../../data/schema'
import { tousLesTravaux, type TravailListe } from '../../lib/enseignant'

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
  const navigate = useNavigate()
  const [travaux, setTravaux] = useState<TravailListe[]>([])
  const [chargement, setChargement] = useState(true)
  const [tri, setTri] = useState<CleTri>('alphabetique')

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
            {tries.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(`/enseignant/eleves/${t.eleveId}`)}
                style={{
                  fontFamily: 'Arial, sans-serif',
                  textAlign: 'left',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
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
                <span
                  style={{
                    flexShrink: 0,
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
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
