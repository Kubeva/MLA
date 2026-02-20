import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap"
import '../CSS/ListPage.css';
import BookModal from "./Components/AddBookModal";


function ListPage() {
  const [loading, setLoading] = useState([]);
  const [database, setDatabase] = useState([]);
  const [showBook, setShowBook] = useState(false);

  const databaseAttributes = database.length > 0 ? Object.keys(database[0]) : [];

  const getType = (value) => {
    if(Array.isArray(database[0][value])) return "array";
    return typeof database[0][value];
  };

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
    setShowBook(false);
  }
  
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
                {databaseAttributes.map((attribute) => (
                  <th className="pe-3" scope="col" key={attribute}>{attribute}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {database
                .filter(item => item.id !== 0)
                .map((item) => (
                <tr key={item.id}>
                  {databaseAttributes.map((attribute, index) =>
                    index === 0 ? (
                      <td className="pe-3" key={`${attribute}_${index}`} scope="row">{String(item[attribute])}</td>
                    ) : (
                      <td className="pe-3" key={`${attribute}_${index}`}>{String(item[attribute]) || "N\\A"}</td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="d-flex justify-content-end">
          <Button className="mla-button" onClick={() => setShowBook(true)}>Add a book</Button>
            <BookModal 
            show={showBook} 
            onClose={closeAddBookModal} 
            attributes={databaseAttributes} 
            getType={getType}
            fetchDatabase={fetchDatabase}/>
        </div>
      </div>
    </>
  );
}

export default ListPage
