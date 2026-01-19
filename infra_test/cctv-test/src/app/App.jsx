import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import CctvPage from '../pages/cctv/CctvPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '10px', background: '#333', marginBottom: '20px' }}>
        <Link to="/cctv" style={{ color: 'white', marginRight: '20px' }}>CCTV 송출</Link>
        <Link to="/dashboard" style={{ color: 'white' }}>관리자 대시보드</Link>
      </nav>
      <Routes>
        <Route path="/cctv" element={<CctvPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<CctvPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
