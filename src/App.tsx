import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import LeadRouter from './pages/LeadRouter'
import Pipeline from './pages/Pipeline'
import Marketing from './pages/Marketing'
import Analytics from './pages/Analytics'
import SettingsPage from './pages/SettingsPage'
import GossipHub from './pages/GossipHub'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/leads" element={<LeadRouter />} />
      <Route path="/pipeline" element={<Pipeline />} />
      <Route path="/marketing" element={<Marketing />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/gossip" element={<GossipHub />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}
