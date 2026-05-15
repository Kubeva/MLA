import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import MLAFormStatusSelect from "./MLAFormStatusSelect";
import MLATagInput from "./MLATagInput";

function BookDetailsModal({ show, onClose, selectedBook, setSelectedBook, getStatus, fetchDatabase }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [image, setImage] = useState(null);
  const [imageToUpload, setImageToUpload] = useState(null);

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

  const handleImageUpload = (file) => {
    if(!file){
      return;
    }

    setImageToUpload(file);
  };

  const uploadImage = async () => {
    if (!imageToUpload) {
      return;
    }

    const formData = new FormData();
    formData.append("image", imageToUpload);

    try {
      const res = await fetch(`http://localhost:4000/database/uploadImage/${editedItem.id}`, {
        method: "POST",
        body: formData
      });

      if(!res.ok){
        throw new Error("Failed to upload image.");
      }

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
      alert(err);
    }
  };

  const editItemInDatabase = async (e) => {
    e.preventDefault();

    if (!validateNewItem(editedItem)) return;

    try {
      uploadImage();

      const res = await fetch("http://localhost:4000/database/editItem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editedItem)
      });

      if(!res.ok){
        throw new Error("Failed to edit item.");
      }

      const data = await res.json();
      console.log(data);
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

  const fetchBookImage = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/database/getImageById/${id}`);
      const data = await res.blob();

      setImage(URL.createObjectURL(data));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if(selectedBook?.id){
      fetchBookImage(selectedBook.id);
    }
  }, [selectedBook])

  return (
    <Modal show={show} onHide={onClose} onExited={handleClose} dialogClassName="mla-modal-big">
      <Modal.Header closeButton className="mla-modal-header">
        <Modal.Title className="modal-title">{selectedBook.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="mla-modal-body">
        {isEditing ? (
          <div className="mla-modal-content">
            <div>
              <input 
                type="file"
                accept="image/*"
                id="imageUpload"
                hidden
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
              <label htmlFor="imageUpload" className="mla-image-upload-box">
                <img src={image}/>
              </label>
            </div>
            <div className="mla-modal-info">
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
                <MLAFormStatusSelect 
                  style={{ width: "200px" }} 
                  value={editedItem.status || ""} 
                  onChange={handleChange}
                  type={"status"}
                  />
              </div>
              <div className="mla-detail">
                <span className="mla-modal-label">Tags</span>
                <MLATagInput value={editedItem.tags || []} onChange={handleChange} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mla-modal-content">
            <div className="mla-image-box">
              <img src={image}/>
            </div>
            <div className="mla-modal-info">
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
            </div>
          </div>
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