import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { BandeauHorsLigne } from './components/ui/BandeauHorsLigne'
import { AuthProvider } from './lib/auth'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BandeauHorsLigne />
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
