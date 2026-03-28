import { Form } from "react-bootstrap";

function MLAFormStatusSelect({ value, type = null, onChange, style }) {
    
  return (
    <Form.Select 
      className="attribute-input" 
      style ={style} 
      value={value} 
      onChange={(e) => 
        type ? onChange(type, e.target.value) : onChange(e.target.value)
    }>
      <option value="">Choose reading status</option>
      <option value="to_read">To read</option>
      <option value="reading">Reading</option>
      <option value="finished">Finished</option>
      <option value="bored">Got bored</option>
    </Form.Select>
  )
}

export default MLAFormStatusSelect;