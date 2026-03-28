
function MLASearchBar({ search, setSearch }) {

  return (
    <div>
      <input
        className="attribute-input"
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}

export default MLASearchBar;