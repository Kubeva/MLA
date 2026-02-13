import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "list_data.json");

app.get("/database", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dbPath));
    res.json(data);
});

app.post("/database", (req, res) => {
    const newData = req.body;
    fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2));
    res.json({ message: "Saved!" });
});

app.post("/database/addItem", (req, res) => {
    const newItem = req.body;
    const data = JSON.parse(fs.readFileSync(dbPath));

    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 1;

    newItem.id = maxId + 1;

    data.push(newItem);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    res.json({message: "Item added."});
})

app.listen(4000, () => console.log("Backend running on port 4000"));