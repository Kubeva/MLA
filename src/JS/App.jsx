import { Routes, Route } from "react-router-dom";
import ListPage from "./ListPage.jsx";
import DatabaseEditor from "./DatabaseEditor.jsx";
import MLAHeader from "./Components/MLAHeader.jsx"

function App(){

  return (
    <>
      <MLAHeader />
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/DBEditor" element={<DatabaseEditor />} />
      </Routes>
    </>
  )
}

export default App;