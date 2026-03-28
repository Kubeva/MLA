import MLAFormStatusSelect from "./MLAFormStatusSelect";
import "../../CSS/MLASearchBar.css";

function MLASearchBar({ search, searchOnChange, statusValue, statusOnChange }) {

  return (
    <div className="search-container">
      <input
        className="mla-search-bar"
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => searchOnChange(e.target.value)}
      />
      <MLAFormStatusSelect 
        style={{ width: "215px" }} 
        value={statusValue || ""} 
        onChange={statusOnChange}
      />
    </div>
  )
}

export default MLASearchBar;