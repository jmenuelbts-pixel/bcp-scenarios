// AccueilEnseignant.tsx
// Tableau de bord du professeur : en-tete avec navigation, 6 items colores
// avec icone SVG et infobulle. Chaque item mene vers une fonction de l'espace
// enseignant. Style inline, Arial, aucun emoji.

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { ID_ENSEIGNANT } from '../../lib/auth'
import { COULEUR_PROF } from '../../data/schema'
import { Infobulle } from '../../components/ui/Infobulle'
import { nombreNonLus } from '../../lib/messagerie'
import { tousLesTravaux, listerDemandes } from '../../lib/enseignant'
import { sonderPresences } from '../../lib/presence'

interface ItemTableau {
  id: string
  titre: string
  fond: string
  bord: string
  description: string
  route: string
  icone: React.ReactNode
}

const ITEMS: ItemTableau[] = [
  {
    id: 'classes',
    titre: 'Classes et groupes',
    fond: '#E7F3F0',
    bord: '#9BCFC2',
    description: 'Créer des classes et des groupes, et y répartir les élèves.',
    route: '/enseignant/classes',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8" cy="9" r="2.4" fill="none" stroke="#1E8A6E" strokeWidth="2" />
        <circle cx="16" cy="9" r="2.4" fill="none" stroke="#1E8A6E" strokeWidth="2" />
        <path d="M3.5 19 a4.5 4.5 0 0 1 9 0" fill="none" stroke="#1E8A6E" strokeWidth="2" strokeLinecap="round" />
        <path d="M11.5 19 a4.5 4.5 0 0 1 9 0" fill="none" stroke="#1E8A6E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'comptes',
    titre: 'Comptes élèves',
    fond: '#EDEAF7',
    bord: '#BBB0E0',
    description: 'Identifiants de connexion et mots de passe des élèves.',
    route: '/enseignant/comptes',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="#5A44A8" strokeWidth="2" />
        <path d="M5 20 a7 7 0 0 1 14 0" fill="none" stroke="#5A44A8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="6" r="2" fill="none" stroke="#5A44A8" strokeWidth="1.6" />
        <line x1="18" y1="8" x2="18" y2="11" stroke="#5A44A8" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'inscriptions',
    titre: "Demandes d'inscription",
    fond: '#FEF7E0',
    bord: '#F2D98A',
    description: 'Accepter ou refuser les nouveaux eleves qui demandent un acces.',
    route: '/enseignant/inscriptions',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" fill="none" stroke="#B8860B" strokeWidth="2" />
        <path d="M3.5 19 a5.5 5.5 0 0 1 11 0" fill="none" stroke="#B8860B" strokeWidth="2" />
        <line x1="18" y1="8" x2="18" y2="14" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="11" x2="21" y2="11" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'deverrouillage',
    titre: 'Déverrouillage',
    fond: '#FBEEE0',
    bord: '#EEC59B',
    description: 'Ouvrir et fermer les onglets des missions et les evaluations.',
    route: '/enseignant/deverrouillage',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#C2792E" strokeWidth="2" />
        <path d="M8 11 V8 a4 4 0 0 1 7 -2" fill="none" stroke="#C2792E" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'exports',
    titre: 'Exports PDF',
    fond: '#FBE9F1',
    bord: '#EBA9C7',
    description: 'Exporter journaux de bord, resultats, devoirs, travaux et activites.',
    route: '/enseignant/exports',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3 h7 l4 4 v14 a1 1 0 0 1 -1 1 H7 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 z" fill="none" stroke="#C13C7B" strokeWidth="2" strokeLinejoin="round" />
        <polyline points="12,11 12,17" fill="none" stroke="#C13C7B" strokeWidth="2" strokeLinecap="round" />
        <polyline points="9,14 12,17 15,14" fill="none" stroke="#C13C7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'liste',
    titre: 'Liste des élèves',
    fond: '#EAF2EC',
    bord: '#A8CBB4',
    description: 'Appel par séance et notes des élèves.',
    route: '/enseignant/liste',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#0EA5E9" strokeWidth="2" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="13" y2="16" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'messagerie',
    titre: 'Messagerie',
    fond: '#F1EAFB',
    bord: '#C4ABE8',
    description: 'Envoyer des messages individuels ou a toute la classe.',
    route: '/enseignant/messagerie',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="#6E3FA3" strokeWidth="2" />
        <polyline points="4,7 12,13 20,7" fill="none" stroke="#6E3FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'presence',
    titre: 'Présence en temps réel',
    fond: '#E4EFF9',
    bord: '#A9CBE9',
    description: 'Qui est en ligne, sur quelle page, et avancement en direct.',
    route: '/enseignant/presence',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" fill="#2E8B57" />
        <path d="M5.5 12 a6.5 6.5 0 0 1 13 0" fill="none" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
        <path d="M2.5 12 a9.5 9.5 0 0 1 19 0" fill="none" stroke="#9AD0AC" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'eleves',
    titre: 'Suivi des élèves',
    fond: '#FDEDE1',
    bord: '#F0BE9C',
    description: 'Progression, connexions et resultats de chaque élève.',
    route: '/enseignant/eleves',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 17 l5 -5 l4 4 l8 -8" fill="none" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16,8 20,8 20,12" fill="none" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'travaux',
    titre: 'Travaux à rendre',
    fond: '#FCF3D9',
    bord: '#E8D48A',
    description: 'Travaux rendus par les eleves et corrections a apporter.',
    route: '/enseignant/travaux',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="#2E8B57" strokeWidth="2" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="13" y2="16" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'synthese',
    titre: 'Synthèse par classe',
    fond: '#E7F0FB',
    bord: '#A9C7E8',
    description: 'Vue de pilotage : pour chaque élève, moyenne générale, assiduité (absences, retards, exclusions) et travaux rendus/corrigés. Statistiques de classe et export d\'un bulletin PDF par élève. Choisissez la classe, le groupe et la période.',
    route: '/enseignant/synthese',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="5" y1="20" x2="5" y2="10" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="5" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" />
        <line x1="19" y1="20" x2="19" y2="13" stroke="#2E6CB0" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'securite',
    titre: 'Sécurité / Face ID',
    fond: '#E7F0FB',
    bord: '#A9C7E8',
    description: 'Activez la connexion par Face ID (ou Touch ID) sur cet appareil pour vous connecter sans taper votre mot de passe. Le mot de passe reste toujours disponible en secours. L\'activation est propre à chaque appareil.',
    route: '/enseignant/securite',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8 V6 a2 2 0 0 1 2 -2 h2" /><path d="M16 4 h2 a2 2 0 0 1 2 2 v2" /><path d="M20 16 v2 a2 2 0 0 1 -2 2 h-2" /><path d="M8 20 H6 a2 2 0 0 1 -2 -2 v-2" />
        <path d="M9 10 v1.5" /><path d="M15 10 v1.5" /><path d="M12 9.5 v4" /><path d="M9 15.5 s1 1.3 3 1.3 3 -1.3 3 -1.3" />
      </svg>
    ),
  },
  {
    id: 'tutoriel',
    titre: 'Tutoriel',
    fond: '#EAF6EE',
    bord: '#B6DCC4',
    description: 'Guide pas-à-pas de toutes les fonctionnalités, côté professeur et côté élève, avec une recherche par mots-clés.',
    route: '/enseignant/tutoriel',
    icone: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1B7A4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5 a2 2 0 0 1 2 -2 h6 v16 h-6 a2 2 0 0 0 -2 2 z" />
        <path d="M20 5 a2 2 0 0 0 -2 -2 h-6 v16 h6 a2 2 0 0 1 2 2 z" />
      </svg>
    ),
  },
]

const ONGLETS_PROF = [
  { libelle: 'Tableau de bord', route: '/enseignant', aide: "Vue d'ensemble : accès à tous les outils du professeur." },
  { libelle: 'Corrigés', route: '/enseignant/corriges', aide: 'Consulter et saisir les corrigés de chaque mission.' },
  { libelle: 'Déroulement', route: '/enseignant/deroulement', aide: 'Préparer le déroulé pédagogique de chaque séance.' },
  { libelle: 'Progression', route: '/enseignant/progression', aide: 'Suivre la progression et les résultats des élèves.' },
]

export function AccueilEnseignant() {
  const navigate = useNavigate()
  const { deconnecter, profil } = useAuth()
  const [nonLus, setNonLus] = useState(0)
  const [aCorriger, setACorriger] = useState(0)
  const [enAttente, setEnAttente] = useState(0)
  const [enLigne, setEnLigne] = useState(0)
  const [infoOuvert, setInfoOuvert] = useState<string | null>(null)

  useEffect(() => {
    const id = profil?.id ?? ID_ENSEIGNANT
    nombreNonLus(id).then(setNonLus)
    tousLesTravaux().then((ts) => setACorriger(ts.filter((t) => !t.corrige).length))
    listerDemandes().then((d) => setEnAttente(d.length))
    const arret = sonderPresences((liste) => setEnLigne(liste.filter((p) => p.statut === 'connecte').length))
    return () => arret()
  }, [profil])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F1F6F3' }}>
      {/* En-tete */}
      <header style={{ background: COULEUR_PROF, color: '#FFFFFF', padding: '16px 24px' }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>Scénarios MCV B</div>
            {profil?.prenom && (
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
                {profil.prenom} {profil.nom}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={deconnecter}
            style={{
              fontFamily: 'Arial, sans-serif',
              background: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Onglets de navigation */}
      <nav style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {ONGLETS_PROF.map((o, i) => {
            const actif = i === 0
            return (
              <Infobulle key={o.route} texte={o.aide}>
                <button
                  type="button"
                  onClick={() => navigate(o.route)}
                  style={{
                    fontFamily: 'Arial, sans-serif',
                    background: 'none',
                    border: 'none',
                    borderBottom: actif ? `3px solid ${COULEUR_PROF}` : '3px solid transparent',
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: actif ? 700 : 500,
                    color: actif ? COULEUR_PROF : '#4A5568',
                    cursor: 'pointer',
                  }}
                >
                  {o.libelle}
                </button>
              </Infobulle>
            )
          })}
        </div>
      </nav>

      {/* Grille des items */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <CarteCompteur valeur={enLigne} libelle="Élèves en ligne" accent="#0F9E75" fond="#E4F5EC" onClick={() => navigate('/enseignant/presence')} />
          <CarteCompteur valeur={aCorriger} libelle="Travaux à corriger" accent="#E08A1E" fond="#FCEFD6" onClick={() => navigate('/enseignant/travaux')} />
          <CarteCompteur valeur={nonLus} libelle="Messages non lus" accent="#2563EB" fond="#E4EDFF" onClick={() => navigate('/enseignant/messagerie')} />
          <CarteCompteur valeur={enAttente} libelle="Inscriptions en attente" accent="#7C3AED" fond="#EDE4F7" onClick={() => navigate('/enseignant/inscriptions')} />
        </div>
        {SECTIONS.map((sec) => {
          const tuiles = sec.ids.map((id) => ITEMS.find((x) => x.id === id)).filter(Boolean) as ItemTableau[]
          if (tuiles.length === 0) return null
          return (
            <div key={sec.titre} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E2E8F0' }}>{sec.titre}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
                {tuiles.map((item) => (
                  <Tuile key={item.id} item={item} navigate={navigate} nonLus={nonLus} aCorriger={aCorriger} infoOuvert={infoOuvert} setInfoOuvert={setInfoOuvert} />
                ))}
              </div>
            </div>
          )
        })}

      </main>
    </div>
  )
}

const SECTIONS: { titre: string; ids: string[] }[] = [
  { titre: 'Ma classe au quotidien', ids: ['liste', 'presence', 'messagerie'] },
  { titre: 'Travail des élèves', ids: ['eleves', 'travaux', 'synthese'] },
  { titre: 'Gestion de la classe', ids: ['classes', 'comptes', 'inscriptions', 'deverrouillage', 'securite'] },
  { titre: 'Documents', ids: ['exports'] },
  { titre: 'Aide', ids: ['tutoriel'] },
]

function Tuile({ item, navigate, nonLus, aCorriger, infoOuvert, setInfoOuvert }: { item: ItemTableau; navigate: (r: string) => void; nonLus: number; aCorriger: number; infoOuvert: string | null; setInfoOuvert: (v: string | null | ((c: string | null) => string | null)) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => navigate(item.route)} style={{ fontFamily: 'Arial, sans-serif', textAlign: 'left', width: '100%', background: item.fond, border: `1px solid ${item.bord}`, borderRadius: 14, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ position: 'relative', flexShrink: 0, width: 48, height: 48, borderRadius: 12, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.icone}
          {item.id === 'messagerie' && nonLus > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box', borderRadius: 999, background: '#D93636', color: '#FFFFFF', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' }}>{nonLus > 99 ? '99+' : nonLus}</span>
          )}
          {item.id === 'travaux' && aCorriger > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box', borderRadius: 999, background: '#E08A1E', color: '#FFFFFF', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFFFFF' }}>{aCorriger > 99 ? '99+' : aCorriger}</span>
          )}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1F2933' }}>{item.titre}</span>
      </button>
      <button type="button" aria-label={`À quoi sert « ${item.titre} » ?`} onClick={(e) => { e.stopPropagation(); setInfoOuvert((c) => (c === item.id ? null : item.id)) }} style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 999, border: `1.5px solid ${item.bord}`, background: '#FFFFFF', color: '#6B7280', fontSize: 13, fontWeight: 700, fontStyle: 'italic', fontFamily: 'Georgia, serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>i</button>
      {infoOuvert === item.id && (
        <div style={{ position: 'absolute', top: 38, right: 10, left: 10, background: '#FFFFFF', border: `1px solid ${item.bord}`, borderRadius: 10, padding: '12px 14px', boxShadow: '0 6px 20px rgba(0,0,0,0.14)', zIndex: 50 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2933', marginBottom: 6 }}>{item.titre}</div>
          <p style={{ fontSize: 12.5, color: '#4A5568', lineHeight: 1.55, margin: 0 }}>{item.description}</p>
          <button type="button" onClick={(e) => { e.stopPropagation(); setInfoOuvert(null) }} style={{ marginTop: 8, background: 'none', border: 'none', color: COULEUR_PROF, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'Arial, sans-serif' }}>Fermer</button>
        </div>
      )}
    </div>
  )
}

function CarteCompteur({ valeur, libelle, accent, fond, onClick }: { valeur: number; libelle: string; accent: string; fond: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ fontFamily: 'Arial, sans-serif', background: '#FFFFFF', border: '1px solid #EAF0F5', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ width: 42, height: 42, borderRadius: 11, background: fond, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18, fontWeight: 800, color: accent }}>{valeur}</span>
      <span style={{ fontSize: 13, color: '#4B5563', fontWeight: 600 }}>{libelle}</span>
    </button>
  )
}
