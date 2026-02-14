import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import '../../CSS/MLAHeader.css';

function MLAHeader() {
  return (
  <Navbar className="mla-header" expand="lg">
    <Container>
      <Navbar.Brand as={Link} to="/">MLA</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse>
        <Nav>
          <Nav.Link as={Link} to="/">List</Nav.Link>
          <Nav.Link as={Link} to="DBEditor">Database Editor</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  )
}

export default MLAHeader;