// renduMissionPdf.tsx
// Rend une mission complete hors-ecran (tous les onglets de contenu empiles),
// pour un eleve donne et un mode (vierge/rempli), puis capture le tout en PDF
// via le moteur de capture. Reutilise les vrais composants d'onglet : fidelite
// totale a l'app (documents, images /docs, tableaux, visuels dessines par code).

import { createRoot } from 'react-dom/client'
import { getScenario, getMission } from '../data/schema'
import { getContenuMission } from '../data/contenus'
import { couleurEntete } from '../data/schema'
import { OngletTravaux } from '../components/mission/OngletTravaux'
import { OngletSynthese } from '../components/mission/OngletSynthese'
import { OngletAutoEval } from '../components/mission/OngletAutoEval'
import { OngletActivites } from '../components/mission/OngletActivites'
import { capturerNoeudEnPdf, type ModeExport } from './exportExercice'

const LARGEUR_PX = 794

interface Cible {
  scenarioId: string
  missionId: string
  etudiantId?: string // undefined => vierge structurel (aucune reponse chargee)
}

// Rend une mission hors-ecran, attend le chargement (images /docs incluses),
// renvoie le noeud DOM pret a capturer + une fonction de nettoyage.
async function monterMission(
  cible: Cible,
  mode: ModeExport
): Promise<{ noeud: HTMLElement; nettoyer: () => void } | null> {
  const scenario = getScenario(cible.scenarioId)
  const mission = getMission(cible.scenarioId, cible.missionId)
  const contenu = getContenuMission(cible.missionId)
  if (!scenario || !mission || !contenu) return null
  const accent = couleurEntete(scenario.couleur)

  const hote = document.createElement('div')
  hote.style.position = 'fixed'
  hote.style.left = '-10000px'
  hote.style.top = '0'
  hote.style.width = LARGEUR_PX + 'px'
  hote.style.background = '#FFFFFF'
  document.body.appendChild(hote)
  const root = createRoot(hote)

  // En mode vierge, on ne passe pas d'etudiantId : aucun contenu eleve n'est
  // charge, les champs restent vides et les bonnes reponses ne s'affichent pas.
  const idPourRendu = mode === 'rempli' ? cible.etudiantId : undefined

  const vue = (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1F2933', background: '#FFFFFF', padding: 24 }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 10, marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: '#5C6B7A', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {scenario.nom} — Mission {mission.numero}
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: accent, marginTop: 2 }}>{mission.titre}</div>
      </div>
      <BlocOnglet titre="Travaux à réaliser">
        <OngletTravaux contenu={contenu.travaux} couleur={accent} etudiantId={idPourRendu} missionId={mission.id} />
      </BlocOnglet>
      <BlocOnglet titre="Synthèse">
        <OngletSynthese contenu={contenu.synthese} couleur={accent} etudiantId={idPourRendu} missionId={mission.id} />
      </BlocOnglet>
      <BlocOnglet titre="Auto-évaluation">
        <OngletAutoEval contenu={contenu.autoEval} couleur={accent} etudiantId={idPourRendu} missionId={mission.id} />
      </BlocOnglet>
      <BlocOnglet titre="Activités">
        <OngletActivites contenu={contenu.activites} couleur={accent} etudiantId={idPourRendu} missionId={mission.id} />
      </BlocOnglet>
    </div>
  )

  await new Promise<void>((resolve) => {
    root.render(vue)
    setTimeout(resolve, 100)
  })
  // Laisse le temps aux images /docs et aux chargements asynchrones.
  await attendreImages(hote)

  return {
    noeud: hote.firstElementChild as HTMLElement,
    nettoyer: () => {
      setTimeout(() => {
        root.unmount()
        hote.remove()
      }, 1200)
    },
  }
}

function BlocOnglet({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#16456E', margin: '0 0 10px', paddingBottom: 4, borderBottom: '1px solid #E2E8F0' }}>{titre}</div>
      {children}
    </section>
  )
}

// Attend le chargement des images presentes dans le noeud (avec plafond de temps).
async function attendreImages(hote: HTMLElement): Promise<void> {
  const debut = Date.now()
  // Deux passes : d'abord laisser React monter, puis attendre les <img>.
  await new Promise((r) => setTimeout(r, 500))
  while (Date.now() - debut < 6000) {
    const imgs = Array.from(hote.querySelectorAll('img'))
    const enCours = imgs.filter((im) => !im.complete)
    if (enCours.length === 0) break
    await new Promise((r) => setTimeout(r, 300))
  }
  await new Promise((r) => setTimeout(r, 300))
}

// Exporte une mission (un eleve, un mode) en PDF fidele.
export async function exporterMissionPdf(
  cible: Cible,
  mode: ModeExport,
  piedNom?: string
): Promise<void> {
  const monte = await monterMission(cible, mode)
  if (!monte) {
    alert("Contenu de mission introuvable.")
    return
  }
  const scenario = getScenario(cible.scenarioId)
  const mission = getMission(cible.scenarioId, cible.missionId)
  const titre = `${scenario?.nom ?? 'Exercice'} - Mission ${mission?.numero ?? ''}`
  const pied = `${scenario?.nom ?? ''} — Mission ${mission?.numero ?? ''} : ${mission?.titre ?? ''}`
  try {
    document.body.classList.add('impression-pdf')
    document.body.classList.toggle('impression-vierge', mode === 'vierge')
    await capturerNoeudEnPdf(monte.noeud, titre, piedNom ?? pied)
  } finally {
    document.body.classList.remove('impression-pdf', 'impression-vierge')
    monte.nettoyer()
  }
}
