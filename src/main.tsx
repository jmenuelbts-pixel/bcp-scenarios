import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Enregistrement du service worker (PWA). Verifie une mise a jour a chaque
// ouverture et au retour sur l'app. Quand une nouvelle version est prete, on
// affiche une petite banniere "Nouvelle version disponible".
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Verifie tout de suite, puis a chaque retour au premier plan.
        reg.update()
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update()
        })

        reg.addEventListener('updatefound', () => {
          const nouveau = reg.installing
          if (!nouveau) return
          nouveau.addEventListener('statechange', () => {
            // Nouvelle version installee alors qu'une version tourne deja.
            if (nouveau.state === 'installed' && navigator.serviceWorker.controller) {
              afficherBanniereMaj()
            }
          })
        })
      })
      .catch(() => {
        // Echec d'enregistrement : l'app fonctionne quand meme, sans PWA.
      })

    // Quand le nouveau SW prend le controle, on recharge une seule fois.
    let dejaRecharge = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (dejaRecharge) return
      dejaRecharge = true
      window.location.reload()
    })
  })
}

function afficherBanniereMaj() {
  if (document.getElementById('banniere-maj')) return
  const barre = document.createElement('div')
  barre.id = 'banniere-maj'
  barre.style.cssText =
    'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#3478C8;color:#FFFFFF;' +
    'font-family:Arial,sans-serif;font-size:14px;padding:12px 16px;display:flex;' +
    'align-items:center;justify-content:center;gap:14px;'
  const texte = document.createElement('span')
  texte.textContent = 'Nouvelle version disponible'
  const bouton = document.createElement('button')
  bouton.textContent = 'Mettre à jour'
  bouton.style.cssText =
    'font-family:Arial,sans-serif;background:#FFFFFF;color:#1B5FA8;border:none;border-radius:8px;' +
    'padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;'
  bouton.onclick = () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.waiting?.postMessage('skip')
      // Repli : si pas de waiting, on recharge directement.
      if (!reg?.waiting) window.location.reload()
    })
  }
  barre.appendChild(texte)
  barre.appendChild(bouton)
  document.body.appendChild(barre)
}
