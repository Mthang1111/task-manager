//React frontend
//docs: https://react.dev/reference/react
//docs: https://developer.mozilla.org/en-US/

import {useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './App.css'


const API_URL = 'http://127.0.0.1:5000/api'


function BoardsPage() {
    const [boards, setBoards] = useState([]) //current value and function to set that value, to be unpacked and put into an empty array
    const [newBoardName, setNewBoardName] = useState('') //track what the user types  
    const [loading, setLoading] = useState(true)    // tracks whether initial fetch is still in progress
    const [error, setError] = useState(null)        // tracks any fetch/network errors
    const [editingBoardId, setEditingBoardId] = useState(null) //which board is being edited
    const [editBoardName, setEditBoardName] = useState('')
            
    // Fetch all boards once when the page first loads, happen outside of rendering 
    useEffect(() => {
        setLoading(true)
        fetch(`${API_URL}/boards`)  //1. returns object needed for response
        .then(response => {   //2. receive the object from fetch
            if (!response.ok) throw new Error('Failed to fetch boards')  //throw error if response isn't successful
            return response.json()
        })
        .then(data => { //3. receives the parsed json, loaded into data
            setBoards(data) //stores this in React's state, trigger React to re-render updated data
            setError(null)
        })
        .catch(err => setError(err.message)) //only runs if any of the steps above throw an error, receive error thrown earlier
        .finally(() => setLoading(false)) //always runs last regardless of result
    }, [])

    function createBoardHandle() {
        if (!newBoardName.trim()) return  // don't submit empty/whitespace-only names

        //need headers and body when sending new data to server to tell the server that data sent is formatted as json
        fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to create board')
            return response.json()
        })
        .then(newBoard => {
            setBoards([...boards, newBoard])  // copy everything from boards then add the new board to the existing array
            setNewBoardName('')               // clear the input field
        })
        .catch(err => setError(err.message))
    }

    function updateBoardHandle(boardId){
      fetch(`${API_URL}/boards/${boardId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: editBoardName,
        })
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update board')
        return response.json()
      })
      .then(updatedBoard => {
        setBoards(boards.map(board => board.id === boardId ? updatedBoard : board))
        setEditingBoardId(null) //close editing box on success
      })
      .catch(err => setError(err.message))
    }

    function deleteBoardHandle(boardId) {
        fetch(`${API_URL}/boards/${boardId}`, {
        method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete board')
            // filter out the deleted board from state, no need to re-fetch
            setBoards(boards.filter(board => board.id !== boardId))
        })
        .catch(err => setError(err.message))
    }

  return (
    <div className="app">
        <h1>My Boards</h1>
        
        {/* Only render error if error is true */}
        {error && <p className="error">{error}</p>} 

        <div className="create-board">
            <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="New Board Name"
            />
        <button onClick={createBoardHandle}>Create Board</button>
      </div>

      {loading ? (
        <p>Loading boards...</p>
      ) : boards.length === 0 ? (
        <p className="empty-state">No boards yet, create one above.</p>
      ) : (
        <ul className="board-list">
      {boards.map(board => (
        <li key={board.id} className="board-item">

          {editingBoardId === board.id ? (
            <>
              <input
                value={editBoardName}
                onChange={(e) => setEditBoardName(e.target.value)}   
              />
              <button onClick={() => updateBoardHandle(board.id)}>Save</button>   
              <button onClick={() => setEditingBoardId(null)}>Cancel</button>  
            </>
          ) : (
            <>
              <Link to={`/boards/${board.id}`}>{board.name}</Link>
              <button onClick={() => {
                setEditingBoardId(board.id)      
                setEditBoardName(board.name)     
              }}>Edit</button>
            </>
          )}
          
          <button className="delete-btn" onClick={() => deleteBoardHandle(board.id)}>Delete</button>
        </li>
      ))}
        </ul>
      )}
    </div>
  )
}

export default BoardsPage
