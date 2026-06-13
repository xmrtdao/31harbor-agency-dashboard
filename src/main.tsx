import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import DBProvider from './components/DBProvider'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <DBProvider>
      <App />
    </DBProvider>
  </HashRouter>,
)
