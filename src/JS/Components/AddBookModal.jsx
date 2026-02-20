import { Modal, Form, Button} from "react-bootstrap";
import { useState, useEffect } from "react";
import MLAFormStatusSelect from "./MLAFormStatusSelect";
import MLATagInput from "./MLATagInput";

function BookModal({ show, onClose, attributes, getType, fetchDatabase }) {
  const [newItem, setNewItem] = useState({});

  const handleChange = (attribute, value) => {
    setNewItem(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const addItemToDatabase = async (e) => {
    e.preventDefault();

    if (!validateNewItem(newItem)) return;

    try {
      const res = await fetch("http://localhost:4000/database/addItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newItem)
      });

      if(!res.ok){
        throw new Error("Failed to add item.");
      }

      console.log("Added item to database.");
      setNewItem({});
      fetchDatabase();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  const validateNewItem = (item) => {
    for (const [attribute, value] of Object.entries(item)) {
      if (!value) {
        alert(`${attribute} is empty`);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (attributes && attributes.length > 0) {
      const initial = attributes.reduce((acc, attr) => {
        acc[attr] = attr === "id" ? -1 : "";
        return acc;
      }, {});
      setNewItem(initial);
    }
  }, [attributes]);

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton className="mla-modal-header">
        <Modal.Title className="modal-title">Book Edit</Modal.Title>
      </Modal.Header>
      <Modal.Body className="mla-modal-body">
        <Form>
          {attributes
            .filter(attribute => attribute !== "id")
            .map((attribute) => (
            <Form.Group className="m-2" key={attribute}>
              {attribute === "status" ? (
              <MLAFormStatusSelect value={newItem[attribute] || ""} onChange={handleChange}/> 
              ) : attribute === "tags" ? (
              <MLATagInput value={newItem[attribute] || []} onChange={handleChange} />
              ) : (
              <Form.Control
                className="attribute-input"
                {...(attribute === "description"
                  ? {as: "textarea", rows: 4}
                  : { type: getType(attribute) === "string" ? "text" : "number" }
                )}
                value={newItem[attribute] || ""}
                placeholder={`${attribute}`} 
                onChange={(e) => handleChange(attribute, e.target.value)} />
              )} 
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer className="mla-modal-footer">
        <Button className="mla-button" onClick={addItemToDatabase}>Save</Button>
        <Button className="btn-danger" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BookModal