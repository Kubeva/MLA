import { Form, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import "../../CSS/MLATagInput.css";

function MLATagInput({ value = [], onChange }) {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const fetchTags = async () => {
    try {
      const res = await fetch("http://localhost:4000/tags");
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      console.log("Successfully fetched tags");
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().startsWith(input.toLowerCase()) &&
    !value.includes(tag)
  );

  const addTag = async (tagToAdd) => {
    try {
      if (!value.includes(tagToAdd)) {
        if (!tags.find(tag => tag.name.toLowerCase() === tagToAdd.toLowerCase())) {
          const res = await fetch("http://localhost:4000/tags/addTag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: tagToAdd }),
          });

          if(!res.ok){
            throw new Error("Failed to save tags JSON.");
          }

          console.log("Added tag to JSON.");

          fetchTags();
        }
        onChange("tags", [...value, tagToAdd])
      }
      setInput("");
      setHighlightedIndex(-1);
    } catch (err) {
        console.error(err);
    }
  };

  const removeTag = (tagToRemove) => {
    if (value.includes(tagToRemove)) {
      onChange("tags", value.filter(tag => tag !== tagToRemove));
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredTags.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >=0 && highlightedIndex < filteredTags.length) {
        await addTag(filteredTags[highlightedIndex].name);
      } else if (input.trim !== "") {
        await addTag(input.trim());
      }
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div>
      <div className="mb-2">
        {value.map(tag => (
          <Badge 
          className="mla-badge me-2"
          key={tag}
          onClick={() => removeTag(tag)}>
            {tag} ✕
          </Badge>
        ))}
      </div>
      <Form.Control 
        className="attribute-input" 
        value={input} 
        placeholder="Add tags" 
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={handleKeyDown} />
      {input && filteredTags.length > 0 && (
        <div className="mla-tags-search border mt-1 p-2">
          {filteredTags.slice(0, 3).map((tag, index) => (
            <div 
            className={`mla-tags-search-item ${index === highlightedIndex ? 'highlight' : ''}`}
            key={tag.id} 
            onClick={() => addTag(tag.name)}
            onMouseEnter={() => setHighlightedIndex(index)}>
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MLATagInput;