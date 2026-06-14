import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import DBProvider from './components/DBProvider'

// Hostname-based redirect for root path (only when not on a company entry page)
if (!window.SUITEAI_COMPANY) {
  const host = window.location.hostname;
  const hash = window.location.hash;
  // Only redirect if on root path (no hash or empty hash)
  if (!hash || hash === '#/' || hash === '') {
    let company = 'harbor';
    if (host.includes('partyfavorphoto')) company = 'party';
    else if (host.includes('mobilemonero') || host.includes('xmrtdao')) company = 'xmrt';
    window.location.replace('/' + company + '/');
  }
}

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <DBProvider>
      <App />
    </DBProvider>
  </HashRouter>,
)