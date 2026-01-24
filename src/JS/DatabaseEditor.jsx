import { useState } from "react"

function DatabaseEditor() {
  const [database, setDatabase] = useState([]);
  const [newAttribute, setNewAttribute] = useState("");

  const databaseAttributes = database.length > 0 ? Object.keys(database[0]) : [];

  const addNewAttribute = (e) => {
    e.preventDefault()

    const attrName = newAttribute.trim();
    if(!attrName) return;

    const updatedDatabase = database.map((item) => ({
      ...item,
      [attrName]: ""
    }));

    setDatabase(updatedDatabase)
    setNewAttribute("")
  };

  return (
    <>
      <div className="container p-3">
        <h1>Database Editor</h1>
        <div className="container">
          <h2>Example</h2>
          {database.length === 0 ? (
            <p>No elements in JSON</p>
          ) : (
            <div>
              {databaseAttributes.map((attribute) =>(
                <p key={attribute}>{attribute}: {database[0][attribute]?.toString() || "N/A"}</p>
              ))}
            </div>
          )}
        </div>
        <div className="container">
          <h2>Add Attribute To JSON</h2>
          <form onSubmit={addNewAttribute}>
            <div className="form-group">
              <label className="form-label">New Attribute Name</label>
              <input className="form-control" type="text" value={newAttribute} onChange={(e) => setNewAttribute(e.target.value)}></input>
            </div>
            <button className="btn btn-primary" type="submit">
              Add attribute
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default DatabaseEditor
