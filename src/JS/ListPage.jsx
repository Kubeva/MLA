import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap"
import AddBookModal from "./Components/AddBookModal";
import BookDetailsModal from "./Components/BookDetailsModal";


function ListPage() {
  const [loading, setLoading] = useState([]);
  const [database, setDatabase] = useState([]);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBookDetailsModal, setShowBookDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState({});

  const databaseAttributes = database.length > 0 ? Object.keys(database[0]) : [];

  const getType = (value) => {
    if(Array.isArray(database[0][value])) return "array";
    return typeof database[0][value];
  };

  const getStatus = (value) => {
    switch (value) {
      case 'to_read': return "To read";
      case 'reading': return "Reading";
      case 'finished': return "Finished";
      case 'bored': return "Got bored";
      default: return "Error";
    }
  }

  const fetchDatabase = async () => {
    try {
      const res = await fetch("http://localhost:4000/database");
      const data = await res.json();
      setDatabase(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const closeAddBookModal = () => {
    setShowAddBookModal(false);
  };

  const closeBookDetailsModal = () => {
    setShowBookDetailsModal(false);
  };
  
  useEffect(() => {
    fetchDatabase();
  }, []);

  return (
    <>
      <div className="container p-3">
        <h1 className="mb-4">Reading list</h1>
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
                <th className="pe-3" scope="col">id</th>
                <th className="pe-3" scope="col">Name</th>
                <th className="pe-3" scope="col">Current chapter</th>
                <th className="pe-3" scope="col">Status</th>
                <th className="pe-3" scope="col">Tags</th>
              </tr>
            </thead>
            <tbody>
              {database
                .filter(item => item.id !== 0)
                .map((item) => (
                <tr
                className="mla-table-row"
                key={item.id} 
                onClick={() => {
                  setShowBookDetailsModal(true); 
                  setSelectedBook(item);
                }}>
                  <td className="pe-3" scope="row">{String(item.id)}</td>
                  <td className="pe-3">{String(item.name) || "N/A"}</td>
                  <td className="pe-3">{String(item.current_chapter) || "N/A"}</td>
                  <td className="pe-3">{getStatus(item.status) || "N/A"}</td>
                  <td className="pe-3">
                    {item.tags && item.tags.length > 0
                      ? item.tags.slice(0, 3).join(", ") + (item.tags.length > 3 ? "..." : "")
                    : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="d-flex justify-content-end">
          <Button className="mla-button" onClick={() => setShowAddBookModal(true)}>Add a book</Button>
          <AddBookModal 
          show={showAddBookModal} 
          onClose={closeAddBookModal} 
          attributes={databaseAttributes} 
          getType={getType}
          fetchDatabase={fetchDatabase}/>
          <BookDetailsModal 
          show={showBookDetailsModal}
          onClose={closeBookDetailsModal}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          getStatus={getStatus}
          fetchDatabase={fetchDatabase}/>
        </div>
      </div>
    </>
  );
}

export default ListPage
