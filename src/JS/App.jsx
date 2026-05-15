import { Routes, Route } from "react-router-dom";
import ListPage from "./ListPage.jsx";
import DatabaseEditor from "./DatabaseEditor.jsx";
import MLAHeader from "./Components/MLAHeader.jsx"
import LoginPage from "./LoginPage.jsx";
import RegisterPage from "./RegisterPage.jsx";

function App(){

  return (
    <>
      <MLAHeader />
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/DBEditor" element={<DatabaseEditor />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App;