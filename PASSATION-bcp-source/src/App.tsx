import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { BandeauHorsLigne } from './components/ui/BandeauHorsLigne'
import { AuthProvider } from './lib/auth'

function App() {
  return (
    <AuthProvider>
      <BandeauHorsLigne />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
