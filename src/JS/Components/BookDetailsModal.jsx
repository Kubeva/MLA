import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import MLAFormStatusSelect from "./MLAFormStatusSelect";
import MLATagInput from "./MLATagInput";

function BookDetailsModal({ show, onClose, selectedBook, setSelectedBook, getStatus, fetchDatabase }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  const handleChange = (attribute, value) => {
    setEditedItem(prev => ({
      ...prev,
      [attribute]: value
    }));
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditedItem(null);
  };

  const editItemInDatabase = async (e) => {
    e.preventDefault();

    if (!validateNewItem(editedItem)) return;

    try {
      const res = await fetch("http://localhost:4000/database/editItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedItem)
      });

      if(!res.ok){
        throw new Error("Failed to add item.");
      }

      console.log(`Edited item ${editedItem.id} in database.`);
      setSelectedBook(editedItem);
      setEditedItem({});
      setIsEditing(false);
      fetchDatabase();
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

  return (
    <Modal show={show} onHide={onClose} onExited={handleClose} dialogClassName="mla-modal-big">
      <Modal.Header closeButton className="mla-modal-header">
        <Modal.Title className="modal-title">{selectedBook.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="mla-modal-body">
        {isEditing ? (
          <>
            <textarea 
              className="mla-description-edit" 
              value={editedItem.description}
              rows={4}
              onChange={(e) => handleChange("description", e.target.value)} />
            <div className="mla-detail">
              <span className="mla-modal-label">Link</span> 
              <input
                className="mla-modal-input"
                value={editedItem.link}
                onChange={(e) => handleChange("link", e.target.value)}/>
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Chapter</span>
              <input
                className="mla-modal-input"
                value={editedItem.current_chapter}
                onChange={(e) => handleChange("current_chapter", e.target.value)}/>
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Status</span>
              <MLAFormStatusSelect style={{ width: "200px" }} value={editedItem.status || ""} onChange={handleChange}/>
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Tags</span>
              <MLATagInput value={editedItem.tags || []} onChange={handleChange} />
            </div>
          </>
        ) : (
          <>
            <div className="mla-description">
              {selectedBook.description}
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Link</span> 
              <a
              className="mla-modal-value mla-link"
              href={selectedBook.link}
              target="_blank"
              rel="noopener noreferrer">
                {selectedBook.link}
              </a>
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Chapter</span>
              <span className="mla-modal-value">{selectedBook.current_chapter}</span>
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Status</span>
              <span className="mla-modal-value">
                {getStatus(selectedBook.status)}
              </span>
            </div>
            <div className="mla-detail">
              <span className="mla-modal-label">Tags</span>
              <span className="mla-modal-value">{String(selectedBook.tags)}</span>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="mla-modal-footer">
        <Button className="btn-danger" onClick={onClose}>Close</Button>
        {isEditing ? (
          <Button className="mla-button" onClick={editItemInDatabase}>Save</Button>
        ) : (
          <Button className="mla-button" onClick={() => {setIsEditing(!isEditing); setEditedItem({...selectedBook})}}>Edit</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BookDetailsModal;