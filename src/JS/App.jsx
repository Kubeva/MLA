import { Routes, Route } from "react-router-dom";
import ListPage from "./ListPage.jsx";
import DatabaseEditor from "./DatabaseEditor.jsx";

function App(){

    return (
        <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/DBEditor" element={<DatabaseEditor />} />
        </Routes>
    )
}

export default App