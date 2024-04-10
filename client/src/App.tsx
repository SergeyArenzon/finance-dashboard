
// import './App.css'
import { Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';



function App() {

  return (
    <div>
      <nav>nav</nav>
      <main>
        <Routes>
          <Route path="/" element={<div>home</div>}></Route>
          <Route path="/dashboard" element={<div>dashboard</div>}></Route>
          <Route path="/signup" element={<div>signup</div>}></Route>
          <Route path="/login" element={<LoginPage/>}></Route>
        </Routes>

      </main>
    </div>
  )
}

export default App
