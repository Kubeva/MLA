import { Modal, Form, Button} from "react-bootstrap";

function BookModal({ show, onClose }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton className="mla-modal-header">
        <Modal.Title className="modal-title">Book Edit</Modal.Title>
      </Modal.Header>
      <Modal.Body className="mla-modal-body">
        <Form>
          <Form.Group>
            <Form.Control type="text" />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="mla-modal-footer">
        <Button className="mla-button">Save</Button>
        <Button className="btn-secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BookModal