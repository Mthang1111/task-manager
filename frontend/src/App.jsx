//for app routing

import { Routes, Route } from 'react-router-dom'
import BoardsPage from './BoardsPage.jsx'
import BoardPage from './BoardPage.jsx'
import './App.css'

function App() {
  return (
    // Routes picks ONE matching Route based on the current URL
    <Routes>
      <Route path="/" element={<BoardsPage />} />

      {/* ":boardId" is a URL parameter similar to <int:board_id>.*/}
      <Route path="/boards/:boardId" element={<BoardPage />} />
    </Routes>
  )
}

export default App