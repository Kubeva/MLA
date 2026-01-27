import { useEffect, useState } from "react";
import { Form, Button, Table } from "react-bootstrap";
import '../CSS/DatabaseEditor.css';

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
            <div className="spinner-border spinner-color" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : database.length === 0 ? (
            <p className="text-danger">No elements in JSON</p>
          ) : (
            <Table className="mla-table mt-4">
              <thead>
                <tr>
                  <th className="pe-3" scope="col">Attribute</th>
                  <th className="pe-3" scope="col">Example value</th>
                  <th>Value type</th>
                </tr>
              </thead>
              <tbody>
                {databaseAttributes.map((attribute) =>(
                  <tr key={attribute}>
                    <td className="fw-bold pe-3" scope="row">{attribute}</td>
                    <td className="pe-3">{database[0][attribute]?.toString() || "N/A"}</td>
                    <td>{getType(database[0][attribute])}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        <div className="container p-2">
          <h2>Modify Database</h2>
          <Form onSubmit={addNewAttribute}>
            <div className="row g-3 align-items-end">
              <Form.Group className="col-md-5">
                <Form.Label>Add New Attribute</Form.Label>
                <Form.Control 
                  className="attribute-input" 
                  type="text" 
                  value={newAttribute} 
                  placeholder="Enter attribute name"
                  onChange={(e) => setNewAttribute(e.target.value)} />
              </Form.Group>
              <Form.Group className="col-md-2">
                <Form.Label className="form-label"></Form.Label>
                <Form.Select className="attribute-input" value={newType} onChange={(e) => setNewType(e.target.value)}>
                  <option>Choose type</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="col-md-2">
                <Button className="mla-button" type="submit">
                  Add attribute
                </Button>
              </Form.Group>
            </div>
          </Form>
          {formAddError && <div className="text-danger mt-2">{formAddError}</div>}
          <Form onSubmit={deleteExistingAttribute} className="mt-4">
            <div className="row g-3 align-items-end">
              <Form.Group className="col-md-5">
                <Form.Label>Delete Attribute</Form.Label>
                <Form.Control 
                  className="attribute-input" 
                  type="text" 
                  value={deleteAttribute} 
                  placeholder="Enter attribute name"
                  onChange={(e) => setDeleteAttribute(e.target.value)} />
              </Form.Group>
              <Form.Group className="col-md-2">
                <Button className="btn-danger" type="submit">
                  Delete attribute
                </Button>
              </Form.Group>
            </div>
          </Form>
          {formDeleteError && <div className="text-danger mt-2">{formDeleteError}</div>}
        </div>
      </div>
    </>
  );
}

export default DatabaseEditor
