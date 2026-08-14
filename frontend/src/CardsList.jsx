//docs: https://react.dev/reference/react
//docs: https://developer.mozilla.org/en-US/

import { useEffect, useState } from "react"

const API_URL = 'http://127.0.0.1:5000/api'

function CardsList({boardId, listId, labels}){
    const [cards, setCards] = useState([])
    const [cardTitle, setCardTitle] = useState('')
    const [cardDescription, setCardDescription] = useState('')
    const [cardDueDate, setCardDueDate] = useState('')

    const [editCardTitle, setEditCardTitle] = useState('')
    const [editCardDescription, setEditCardDescription] = useState('')
    const [editCardDueDate, setEditCardDueDate] = useState('')
    const [editingCardId, setEditingCardId] = useState(null)
    
    const [error, setError] = useState(null)

    const [cardLabels, setCardLabels] = useState({}) // { [cardId]: [label, ...] } labels already attached
    const [openPickerCardId, setOpenPickerCardId] = useState(null) //which card has the picker opened

    useEffect(() => {
        fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards`) 
        .then(response => {
            if (!response.ok) throw new Error ('Failed to fetch cards')
            return response.json()
        })
        .then(data => {
            setCards(data)
            setError(null)
            data.forEach(card => fetchCardLabels(card.id))
        })
        .catch(err => setError(err.message))
    },[boardId, listId])

    function fetchCardLabels(cardId){
        fetch(`${API_URL}/cards/${cardId}/labels`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch card labels')
            return response.json()
        })
        .then(data => {
            setCardLabels(prev => ({...prev, [cardId]: data}))
        })
        .catch(err => setError(err.message))
    }

    function isLabelAttached(cardId, labelId){
        return (cardLabels[cardId] || []).some(l => l.id === labelId)
    }

    function toggleLabelHandle(cardId, labelId){
        const attached = isLabelAttached(cardId, labelId)

        fetch(`${API_URL}/cards/${cardId}/labels/${labelId}`, {
            method: attached ? 'DELETE' : 'POST'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update card labels')
            fetchCardLabels(cardId) // re-sync from the server rather than guessing the new state
        })
        .catch(err => setError(err.message))
    }

    function createCardHandle(){
        if (!cardTitle.trim()) return

        const cardData = {title: cardTitle}
        if (cardDescription.trim()) cardData["description"] = cardDescription
        if (cardDueDate) cardData["due_date"] = cardDueDate

        fetch(`${API_URL}/boards/${boardId}/lists/${listId}/cards`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(cardData)
        })
        .then(response => {
            if (!response.ok) throw new Error ('Failed to create card')
            return response.json()
        })
        .then(newCard => {
            setCards([...cards, newCard])
            setCardTitle('')
            setCardDescription('')
            setCardDueDate('')
        })
        .catch(err => setError(err.message))
    }

    function updateCardHandle(cardId){
        fetch(`${API_URL}/cards/${cardId}`,{
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                title: editCardTitle,
                description: editCardDescription,
                due_date: editCardDueDate
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update')
            return response.json()
        })
        .then(updatedCard => {
            setCards(cards.map(card => card.id === cardId ? updatedCard : card))
            setEditingCardId(null)
        })
        .catch(err => setError(err.message))
    }

    function deleteCardHandle(cardId){
        fetch(`${API_URL}/cards/${cardId}`,{
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok ) throw new Error ('Failed to delete card')
            setCards(cards.filter(card => card.id !== cardId))
            setCardLabels(prev => {
                const next = { ...prev }
                delete next[cardId]
                return next
            })
        })
        .catch(err => setError(err.message))
    }

    return(
        <div className="cards-list">
            {error && <p className="error">{error}</p>}
            {cards.map(card => (
                <div key = {card.id} className="card-item">
                    {editingCardId === card.id ? (
                        <>
                            <input
                                value = {editCardTitle}
                                onChange={(e) => setEditCardTitle (e.target.value)}
                            />
                            <input
                                value = {editCardDescription}
                                onChange={(e) => setEditCardDescription(e.target.value)}
                            />
                            <input
                                type = "date"
                                value = {editCardDueDate}
                                onChange={(e) => setEditCardDueDate(e.target.value)}
                            />
                                <button onClick={() => updateCardHandle(card.id)}>Save</button>
                                <button onClick={() => setEditingCardId(null)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <span>{card.title}</span>
                            {card.description && <p className="card-desc">{card.description}</p>}
                            {card.due_date && <p className="card-date">{new Date(card.due_date).toLocaleDateString()}</p>}

                            {(cardLabels[card.id] || []).length > 0 && (
                                <div className="card-labels">
                                    {cardLabels[card.id].map(label => (
                                        <span
                                            key={label.id}
                                            className="label-customize"
                                            style={{ background: label.color }}
                                        >
                                            {label.label}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <button
                                className="labels-toggle-btn"
                                onClick={() => setOpenPickerCardId(
                                    openPickerCardId === card.id ? null : card.id
                                )}
                            >
                                Labels
                            </button>

                            {openPickerCardId === card.id && (
                                <div className="label-picker">
                                    {labels.length === 0 ? (
                                        <p className="empty-state">No labels yet, create one below</p>
                                    ) : (
                                        labels.map(label => (
                                            <label key={label.id} className="label-picker-row">
                                                <input
                                                    type="checkbox"
                                                    checked={isLabelAttached(card.id, label.id)}
                                                    onChange={() => toggleLabelHandle(card.id, label.id)}
                                                />
                                                <span
                                                    className="label-customize"
                                                    style={{ background: label.color }}
                                                >
                                                    {label.label}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            )}

                            <button onClick={() => {
                                setEditCardTitle(card.title)
                                setEditCardDescription(card.description)
                                setEditCardDueDate(card.due_date)
                                setEditingCardId(card.id)
                            }}>Edit</button>                        
                        </>
                    )}
                    <button className="delete-btn" onClick={() => deleteCardHandle(card.id)}>x</button>
                </div>
            ))}
            
            <input 
                value = {cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                placeholder="New Card Name"
            />
            <input
                value = {cardDescription}
                onChange = {(e) => setCardDescription(e.target.value)}
                placeholder="New Card Description"
            />
            <input
                type = "date"
                value = {cardDueDate}
                onChange={(e) => setCardDueDate(e.target.value)}
            />
            <button onClick={createCardHandle}>Add Card</button>
        </div>
        
    )
}

export default CardsList