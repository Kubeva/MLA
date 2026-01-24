import { useEffect, useState } from "react"
import '../CSS/DatabaseEditor.css'

function DatabaseEditor() {
  const [database, setDatabase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAttribute, setNewAttribute] = useState("");
  const [deleteAttribute, setDeleteAttribute] = useState("");
  const [newType, setNewType] = useState(""); 
  const [formAddError, setFormAddError] = useState("");
  const [formDeleteError, setFormDeleteError] = useState("");

  const databaseAttributes = database.length > 0 ? Object.keys(database[0]) : [];

  const addNewAttribute = async (e) => {
    e.preventDefault()

    const attrName = newAttribute.trim();
    if(!attrName) {
      setFormAddError("Attribute name is blank")
      return;
    }
    if(!newType) {
      setFormAddError("Wrong type")
      return;
    }

    setFormAddError("");

    if(database.length > 0 && attrName in database[0]) {
      alert("Attribute already exists");
      return;
    }

    let defaultValue = getFormDefaultValueType(newType);

    const updatedDatabase = database.map((item) => ({
      ...item,
      [attrName]: defaultValue
    }));

    try {
      const res = await fetch("http://localhost:4000/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedDatabase)
      });

      if(!res.ok){
        throw new Error("Failed to save JSON.");
      }

      console.log("Saved JSON file.");
      setDatabase(updatedDatabase);
      setNewAttribute("");
    } catch(err) {
      console.error(err);
      alert(err);
    }
  };

  const deleteExistingAttribute = async (e) => {
    e.preventDefault()

    const attrName = deleteAttribute.trim();
    if(!attrName){
      setFormDeleteError("Attribute name is blank");
      return;
    }

    setFormAddError("");

    if(database.length > 0 && !(attrName in database[0])) {
      alert(`Attribute "${attrName}" doesn't exist`);
      return;
    }

    const updatedDatabase = database.map(item => {
      const newItem = { ...item };
      delete newItem[attrName];
      return newItem;
    });

    try {
      const res = await fetch("http://localhost:4000/database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedDatabase)
      });

      if(!res.ok){
        throw new Error(`Failed to delete "${attrName}"`);
      }

      console.log(`Deleted "${attrName}" in JSON file.`);
      setDatabase(updatedDatabase);
      setDeleteAttribute("");
    } catch(err) {
      console.error(err);
      alert(err);
    }
  };

  const getFormDefaultValueType = (type) => {
    switch(type) {
      case "string": return "";
      case "number": return 0;
      case "boolean": return false;
      case "array": return [];
      case "object": return {};
    }
  }

  const fetchDatabase = async () => {
    try{
      const res = await fetch("http://localhost:4000/database");
      const data = await res.json();
      setDatabase(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getType = (value) => {
    if(Array.isArray(value)) return "array";
    return typeof value;
  }

  useEffect(() => {
    fetchDatabase();
  }, []);

  return (
    <>
      <div className="container p-3">
        <h1>Database Editor</h1>
        <div className="container p-2">
          <h2>Example</h2>
          {loading ? (
            <div class="spinner-border spinner-color" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          ) : database.length === 0 ? (
            <p className="text-danger">No elements in JSON</p>
          ) : (
            <table className="mt-4">
              <thead>
                <tr>
                  <th className="pe-3">Attribute</th>
                  <th className="pe-3">Example value</th>
                  <th>Value type</th>
                </tr>
              </thead>
              <tbody>
                {databaseAttributes.map((attribute) =>(
                  <tr key={attribute}>
                    <td className="fw-bold pe-3">{attribute}</td>
                    <td className="pe-3">{database[0][attribute]?.toString() || "N/A"}</td>
                    <td>{getType(database[0][attribute])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="container p-2">
          <h2>Modify Database</h2>
          <form onSubmit={addNewAttribute} className="mt-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label">Add New Attribute</label>
                <input 
                  className="form-control attribute-input" 
                  type="text" 
                  value={newAttribute} 
                  placeholder="Enter attribute name"
                  onChange={(e) => setNewAttribute(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label"></label>
                <select className="form-select attribute-input" value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option value="">Choose type</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary attribute-button" type="submit">
                  Add attribute
                </button>
              </div>
            </div>
          </form>
          {formAddError && <div className="text-danger mt-2">{formAddError}</div>}
          <form onSubmit={deleteExistingAttribute} className="mt-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label">Delete Attribute</label>
                <input 
                  className="form-control attribute-input" 
                  type="text" 
                  value={deleteAttribute} 
                  placeholder="Enter attribute name"
                  onChange={(e) => setDeleteAttribute(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button className="btn btn-danger" type="submit">
                  Delete attribute
                </button>
              </div>
            </div>
          </form>
          {formDeleteError && <div className="text-danger mt-2">{formDeleteError}</div>}
        </div>
      </div>
    </>
  )
}

export default DatabaseEditor
