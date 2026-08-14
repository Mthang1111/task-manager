//docs: https://react.dev/reference/react
//docs: https://developer.mozilla.org/en-US/

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom' 
import CardsList from './CardsList.jsx'
import LabelManager from './LabelManager.jsx'

const API_URL = 'http://127.0.0.1:5000/api'

function BoardPage() {
    // useParams() reads the URL parameter defined as ":boardId" in App.jsx
    const {boardId} = useParams()
    const [error, setError] = useState(null) 
    const [loading, setLoading] = useState(true)    
    const [lists, setLists] = useState([])
    const [newListName, setNewListName] = useState('')
    const [editingListId, setEditingListId] = useState(null)
    const [editListName, setEditListName] = useState('')

    const [board, setBoard] = useState(null)
    const [editingBoard, setEditingBoard] = useState(false)
    const [editBoardName, setEditBoardName] = useState('')

    const [labels, setLabels] = useState([]) // single source of truth for labels, shared by LabelManager + every CardsList

    useEffect(() => {
        setLoading(true)
        fetch(`${API_URL}/boards/${boardId}/lists`) 
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch lists')
            return response.json()
        })
        .then(data => {
            setLists(data) 
            setError(null)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, [boardId])
    // [boardId] instead of [] to re-runs the fetch if the user navigates from /boards/1 to /boards/2

    useEffect(() => {
        fetch(`${API_URL}/boards/${boardId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch board')
            return response.json()
        })
        .then(data => {
            setBoard(data)
            setError(null)
        })
        .catch(err => setError(err.message))
    }, [boardId])

    useEffect(() => {
        fetch(`${API_URL}/labels`)
        .then(response => {
            if (!response.ok) throw new Error ('Failed to fetch labels')
            return response.json()
        })
        .then(data => {
            setLabels(data)
            setError(null)
        })
        .catch(err => setError(err.message))
    },[])

    function createListHandle() {
        if (!newListName.trim()) return  

        fetch(`${API_URL}/boards/${boardId}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to create list')
            return response.json()
        })
        .then(newList => {
            setLists([...lists, newList])  
            setNewListName('')          
        })
        .catch(err => setError(err.message))
    }

    function updateListHandle(listId){
        fetch(`${API_URL}/lists/${listId}`,{
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name: editListName})
        })
        .then(response => {
            if (!response.ok) throw new Error ('Error: Failed to update list')
            return response.json()
        })
        .then(updatedList => {
            setLists(lists.map(list => list.id === listId ? updatedList : list))
            setEditingListId(null)
        })
        .catch(err => setError(err.message))
    }

    function deleteListHandle(listId) {
        fetch(`${API_URL}/lists/${listId}`, {
        method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete list')
            setLists(lists.filter(list => list.id !== listId))
        })
        .catch(err => setError(err.message))
    }

    function updateBoardHandle(){
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
        setBoard(updatedBoard) //only need to display the updatedBoard here
        setEditingBoard(false) 
      })
      .catch(err => setError(err.message))
    }


    return (
    <div className="app">
        <Link to="/">Back to boards</Link>
        {editingBoard ? (
            <div className="board-title-edit">
                <input
                    value={editBoardName}
                    onChange={(e) => setEditBoardName(e.target.value)}
                />
                <button onClick={updateBoardHandle}>Save</button>
                <button onClick={() => setEditingBoard(false)}>Cancel</button>
            </div>
        ) : (
            <h1>
                {board ? board.name : 'Loading...'} 
                {/* board && to prevent edit button from appearing first */}
                {board && (
                    <button
                        className="board-edit-btn"
                        onClick={() => {
                            setEditBoardName(board.name)
                            setEditingBoard(true)
                        }}
                    >
                        Edit
                    </button>
                )}
            </h1>
        )}

        {error && <p className="error">{error}</p>}
            
        <div className="create-board">
        <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New List Name"
        />
        <button onClick={createListHandle}>Add List</button>
        </div>

        
        {loading ? (
        <p>Loading lists...</p>
        ) : (
        <div className="lists-row">
            {lists.map(list => (
            <div key={list.id} className="list-column">
                {editingListId === list.id ? (
                    <>
                    <input
                        value = {editListName}
                        onChange ={(e) => setEditListName(e.target.value)}
                    />
                    <button onClick={() => updateListHandle(list.id)}>Save</button>
                    <button onClick={() => setEditingListId(null)}>Cancel</button>
                    </>
                ): (
                    <>
                        <h3>{list.name}</h3>
                        <button onClick = {() => {
                          setEditListName(list.name)
                          setEditingListId(list.id)
                        }}>Edit</button>
                    </>
                )}
                <button className="delete-btn" onClick={() => deleteListHandle(list.id)}>
                Delete
                </button>
                <CardsList boardId ={boardId} listId = {list.id} labels={labels}></CardsList>
            </div>
            ))}
        </div>
        )}
            <LabelManager labels={labels} setLabels={setLabels} />
    </div>
    )
}
export default BoardPage