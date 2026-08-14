import { useState } from "react";


const API_URL = 'http://127.0.0.1:5000/api'

function LabelManager({labels, setLabels}){
    const [error, setError] = useState(null)
    const [labelName, setLabelName] = useState('')
    const [labelColor, setLabelColor] = useState('#a9a49a')
    const [editingLabelId, setEditingLabelId] = useState(null)
    const [editLabelName, setEditLabelName] = useState('')
    const [editLabelColor, setEditLabelColor] = useState('#a9a49a')

    //initial label fetch already happened at BoardPage.jsx


    function createLabelHandle(){
        if (!labelName.trim() || !labelColor.trim()) return
        
        fetch(`${API_URL}/labels`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({label: labelName, color: labelColor})
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to make labels')
            return response.json()
        })
        .then(newLabel => {
            setLabels([...labels,newLabel])
            setLabelName('')
            setLabelColor('#a9a49a')
            setError(null)
        })
        .catch(err => setError(err.message))
    }

    function deleteLabelHandle(labelId){
        fetch(`${API_URL}/labels/${labelId}`,{
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete labels')
            setLabels(labels.filter(label => labelId !== label.id))
        })
        .catch(err => setError(err.message))
    }

    function updateLabelHandle(labelId){
        fetch(`${API_URL}/labels/${labelId}`,{
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({label: editLabelName, color: editLabelColor})
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update labels')
            return response.json()
        })
        .then(updatedLabel => {
            setLabels(labels.map(label => label.id === labelId ? updatedLabel : label))
            setEditingLabelId(null)
            setError(null)
        })
        .catch(err => setError(err.message))
    }

    return(
        <div className="label-manager">
            <h2>My Labels</h2>
            {error && <p className="error">{error}</p>}

            <div className="create-label">
                <input
                    value = {labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    placeholder="New Label Name"
                />

                <input
                    type="color"
                    value = {labelColor}
                    onChange={(e) => setLabelColor(e.target.value)}
                />
                <button onClick={createLabelHandle}>Create Label</button>
            </div>

            {labels.length === 0 ? (
                <p className="empty-state">No labels yet, create one</p>):(
                    <ul className="label-holder">
                        {labels.map(label => (
                            <li key ={label.id} >
                                {label.id === editingLabelId ? (
                                    <>
                                        <input
                                            value = {editLabelName}
                                            onChange={(e) => setEditLabelName(e.target.value)}
                                        />

                                        <input
                                            type = "color"
                                            value = {editLabelColor}
                                            onChange={(e) => setEditLabelColor(e.target.value)}
                                        />
                                        <button onClick={() => updateLabelHandle(label.id)}>Save</button>
                                        <button onClick={() => setEditingLabelId(null)}>Cancel</button>
                                    </>
                                ): (
                                    
                                    <>
                                        <span
                                            className="label-customize"
                                            style = {{background: label.color}}
                                        >{label.label}</span>
                                        <button onClick={() => {
                                            setEditingLabelId(label.id)
                                            setEditLabelName(label.label)
                                            setEditLabelColor(label.color)
                                        }}>Edit</button>
                                    </>
                                )}
                                <button onClick={() => deleteLabelHandle(label.id)}>Delete</button>
                            </li>
                        ))}
                        
                    </ul>
                )}
        </div>
    )
}

export default LabelManager