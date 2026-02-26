import { Form } from "react-bootstrap";

function MLAFormStatusSelect({ value, onChange, style }) {
    
  return (
    <Form.Select className="attribute-input" style ={style} value={value} onChange={(e) => onChange("status", e.target.value)}>
      <option>Choose reading status</option>
      <option value="to_read">To read</option>
      <option value="reading">Reading</option>
      <option value="finished">Finished</option>
      <option value="bored">Got bored</option>
    </Form.Select>
  )
}

export default MLAFormStatusSelect;