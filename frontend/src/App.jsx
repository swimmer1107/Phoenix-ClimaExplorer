import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage      from './pages/LandingPage'
import AuthPage         from './pages/AuthPage'
import DashboardLayout  from './layouts/DashboardLayout'
import DashboardPage    from './pages/DashboardPage'
import GlobeViewPage    from './pages/GlobeViewPage'
import CompareYearsPage from './pages/CompareYearsPage'
import InsightsPage     from './pages/InsightsPage'

const isAuth = () => !!localStorage.getItem('token')

function Protected({ children }) {
  return isAuth() ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/globe" element={<GlobeViewPage />} />
        <Route path="/compare" element={<CompareYearsPage />} />
        <Route path="/insights" element={<InsightsPage />} />

        <Route path="/dashboard" element={<Protected><DashboardLayout /></Protected>}>
          <Route index element={<DashboardPage />} />
          <Route path="compare" element={<CompareYearsPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  )
}
