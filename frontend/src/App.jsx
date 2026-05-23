import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Machines from './pages/Machines'
import Alerts from './pages/Alerts'
import Orders from './pages/Orders'
import Assistant from './pages/Assistant'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="machines" element={<Machines />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App