import { useEffect, useState, useMemo } from "react";
import { Table, Button } from "react-bootstrap";
import Fuse from "fuse.js";
import AddBookModal from "./Components/AddBookModal";
import BookDetailsModal from "./Components/BookDetailsModal";
import MLASearchBar from "./Components/MLASearchBar";

function ListPage() {
  const [loading, setLoading] = useState([]);
  const [database, setDatabase] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showBookDetailsModal, setShowBookDetailsModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const databaseAttributes = database.length > 0 ? Object.keys(database[0]) : [];

  const { searchKey, searchValue } = useMemo(() => {
    let key = "name";
    let value = "";
    if (searchInput.startsWith("tags:")) {
      key = "tags";
      value = searchInput.split(":")[1].trim();
    } else {
      key = "name";
      value = searchInput;
    }

    return { searchKey: key, searchValue: value}
  }, [searchInput]);

  const fuseObject = useMemo(() => {
    return new Fuse(database, {
      keys: [searchKey],
      threshold: 0.0,
      ignoreLocation: true,
      minMatchCharLength: 2,
      shouldSort: false
    });
  }, [database, searchKey]);

  const filteredDatabase = searchValue 
    ? fuseObject.search(searchValue).map(result => result.item)
    : database;

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
        <MLASearchBar 
          search={searchInput} 
          searchOnChange={setSearchInput} 
          statusValue={statusFilter} 
          statusOnChange={setStatusFilter}
          />
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
                <th className="mla-table-id-col pe-3" scope="col">id</th>
                <th className="mla-table-name-col pe-3" scope="col">Name</th>
                <th className="mla-table-curr-chap-col pe-3" scope="col">Current chapter</th>
                <th className="mla-table-status-col pe-3" scope="col">Status</th>
                <th className="mla-table-tags-col pe-3" scope="col">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredDatabase
                .filter(item => item.id !== 0)
                .filter(item => !statusFilter || item.status === statusFilter)
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
