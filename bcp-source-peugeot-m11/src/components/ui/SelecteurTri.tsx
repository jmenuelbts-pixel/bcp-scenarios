// SelecteurTri.tsx
// Selecteur de tri reutilisable pour les listes de devoirs rendus. Discret mais
// immediatement visible. Memes options partout : alphabetique, date de remise,
// note, statut, avancement, derniere activite.

export type CleTri =
  | 'alphabetique'
  | 'date_remise'
  | 'note'
  | 'statut'
  | 'avancement'
  | 'derniere_activite'

export const OPTIONS_TRI: { cle: CleTri; libelle: string }[] = [
  { cle: 'alphabetique', libelle: 'Alphabétique (nom)' },
  { cle: 'date_remise', libelle: 'Date et heure de remise' },
  { cle: 'note', libelle: 'Note obtenue' },
  { cle: 'statut', libelle: 'Statut' },
  { cle: 'avancement', libelle: 'Avancement' },
  { cle: 'derniere_activite', libelle: 'Dernière activité' },
]

export function SelecteurTri({
  valeur,
  onChange,
}: {
  valeur: CleTri
  onChange: (cle: CleTri) => void
}) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="4" y1="7" x2="20" y2="7" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="12" x2="18" y2="12" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="17" x2="15" y2="17" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Trier par
      <select
        value={valeur}
        onChange={(e) => onChange(e.target.value as CleTri)}
        style={{
          fontFamily: 'Arial, sans-serif',
          border: '1px solid #C9D6E3',
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 13,
          color: '#1F2933',
          background: '#FFFFFF',
          cursor: 'pointer',
        }}
      >
        {OPTIONS_TRI.map((o) => (
          <option key={o.cle} value={o.cle}>
            {o.libelle}
          </option>
        ))}
      </select>
    </label>
  )
}
