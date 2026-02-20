import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import '../../CSS/MLAHeader.css';

function MLAHeader() {
  return (
  <Navbar className="mla-header" expand="lg">
    <Container>
      <Navbar.Brand className="mla-nav-link" as={Link} to="/">MLA</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse>
        <Nav>
          <Nav.Link className="mla-nav-link" as={Link} to="/">List</Nav.Link>
          <Nav.Link className="mla-nav-link" as={Link} to="DBEditor">Database Editor</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  )
}

export default MLAHeader;