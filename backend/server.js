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

app.listen(4000, () => console.log("Backend running on port 4000"));