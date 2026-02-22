import { Modal, Button } from 'react-bootstrap';

function BookDetailsModal({ show, onClose, selectedBook, getStatus }) {

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton className="mla-modal-header">
        <Modal.Title className="modal-title">{selectedBook.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="mla-modal-body">
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
      </Modal.Body>
      <Modal.Footer className="mla-modal-footer">
        <Button className="btn-danger" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookDetailsModal;