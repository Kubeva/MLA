import { Form, Badge, Overlay } from "react-bootstrap";
import { useState, useEffect, useRef, useMemo } from "react";
import Fuse from "fuse.js";
import "../../CSS/MLATagInput.css";

function MLATagInput({ style, value = [], onChange }) {
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);

  const inputBarRef = useRef(null);
  const listRef = useRef(null);

  const { searchKey, searchValue } = useMemo(() => {
    const key = "name";
    const value = input;

    return { searchKey: key, searchValue: value}
  }, [input]);

  const fuseObject = useMemo(() => {
    return new Fuse(tags, {
      keys: [searchKey],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 1,
      shouldSort: true
    });
  }, [tags, searchKey]);

  const searchTags = searchValue 
    ? fuseObject.search(searchValue).map(result => result.item)
    : tags;

  const filteredTags = searchTags
    .filter(tag =>!value.includes(tag))
    .filter(tag => tag.id !== 1);

  const fetchTags = async () => {
    try {
      const res = await fetch("http://localhost:4000/tags");
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      console.log("Tried fetching tags");
    }
  };

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
      } else if (input.trim() !== "") {
        await addTag(input.trim());
      }
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const elem = listRef.current?.children?.[highlightedIndex];
    if (elem) {
      elem.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [highlightedIndex]);

  return (
    <div>
      <div className="mb-2">
        {value.map(tag => (
          <Badge 
          className="mla-badge me-2"
          key={tag}
          onMouseDown={() => removeTag(tag)}>
            {tag} ✕
          </Badge>
        ))}
      </div>
      <Form.Control 
        style={style}
        className="attribute-input" 
        value={input} 
        placeholder="Add tags" 
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        ref={inputBarRef}
      />
        <Overlay
          key={value.length}
          target={inputBarRef.current} 
          show={focused} 
          placement="bottom-start"
          transition={false}
        >
        {(props) => (
          <div 
            {...props} 
            className="mla-tags-search border mt-1 p-2"
            style={{
              ...props.style,
              zIndex: 999999,
              maxHeight: "200px",
              overflowY: "auto",
              width: inputBarRef.current.offsetWidth
            }} 
          >
            <div ref={listRef}>
              {filteredTags.map((tag, index) => (
                <div 
                  className={`mla-tags-search-item ${index === highlightedIndex ? 'highlight' : ''}`}
                  key={tag.id} 
                  onMouseDown={() => addTag(tag.name)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </Overlay>
    </div>
  );
}

export default MLATagInput;