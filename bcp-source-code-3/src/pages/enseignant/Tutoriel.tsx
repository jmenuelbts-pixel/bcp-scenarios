// Tutoriel.tsx
// Page de tutoriel cote professeur : recherche par mots-cles + deux onglets
// (Cote professeur / Cote eleve), contenu par themes et sous-themes pas-a-pas.

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COULEUR_PROF } from '../../data/schema'
import { TUTO_PROF, TUTO_ELEVE, type ThemeTuto } from '../../data/tutoriel'

function filtrer(themes: ThemeTuto[], q: string): ThemeTuto[] {
  const mots = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (mots.length === 0) return themes
  const contient = (txt: string) => mots.every((m) => txt.toLowerCase().includes(m))
  return themes
    .map((t) => {
      if (contient(t.titre)) return t
      const sous = t.sousThemes.filter(
        (s) => contient(s.titre) || contient(s.ou) || s.etapes.some((e) => contient(e))
      )
      return sous.length ? { ...t, sousThemes: sous } : null
    })
    .filter((t): t is ThemeTuto => t !== null)
}

export function Tutoriel() {
  const navigate = useNavigate()
  const [onglet, setOnglet] = useState<'prof' | 'eleve'>('prof')
  const [q, setQ] = useState('')

  const themes = onglet === 'prof' ? TUTO_PROF : TUTO_ELEVE
  const resultats = useMemo(() => filtrer(themes, q), [themes, q])
  const autre = onglet === 'prof' ? TUTO_ELEVE : TUTO_PROF
  const resultatsAutre = useMemo(() => (q ? filtrer(autre, q) : []), [autre, q])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate('/enseignant')} style={{ fontFamily: 'Arial, sans-serif', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFFFFF', borderRadius: 99, padding: '6px 14px', fontSize: 13, cursor: 'pointer', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15,5 8,12 15,19" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Tableau de bord
          </button>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Tutoriel</h1>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (ex : exporter, délai, Face ID, rouvrir...)"
          style={{ fontFamily: 'Arial, sans-serif', width: '100%', boxSizing: 'border-box', border: '1px solid #C9D6E3', borderRadius: 10, padding: '11px 14px', fontSize: 14, marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {(['prof', 'eleve'] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOnglet(o)}
              style={{ fontFamily: 'Arial, sans-serif', flex: 1, background: onglet === o ? COULEUR_PROF : '#FFFFFF', color: onglet === o ? '#FFFFFF' : '#374151', border: `1px solid ${onglet === o ? COULEUR_PROF : '#D8DEE5'}`, borderRadius: 10, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              {o === 'prof' ? 'Côté professeur' : 'Côté élève'}
            </button>
          ))}
        </div>

        {resultats.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6B7280' }}>
            Aucun résultat dans cet onglet{resultatsAutre.length > 0 ? ` — mais ${resultatsAutre.length} résultat(s) dans l'onglet « ${onglet === 'prof' ? 'Côté élève' : 'Côté professeur'} ».` : '.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {resultats.map((t, i) => (
              <section key={i} style={{ background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 12, padding: 18 }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 16, color: COULEUR_PROF }}>{t.titre}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {t.sousThemes.map((s, j) => (
                    <div key={j}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2933' }}>{s.titre}</div>
                      <div style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 6px' }}>Où : {s.ou}</div>
                      <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {s.etapes.map((e, k) => (
                          <li key={k} style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>{e}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
