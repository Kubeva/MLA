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
const tagsPath = path.join(__dirname, "tags.json");

app.get("/database", (req, res) => {
  try {
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);
    res.json(data);
  } catch (err) {
    console.error("Error reading database:", err);
    res.status(500).json({ error: "Failed to read database" });
  }
});

app.post("/database", (req, res) => {
  try {
    const newData = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2));

    res.json({ message: "Saved!" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add attribute to database" });
  }
});

app.post("/database/addItem", (req, res) => {
  try {
    const newItem = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(dbPath));

    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;

    newItem.id = maxId + 1;

    data.push(newItem);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    res.json({message: "Item added."});
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item to database" });
  }
})

//API for tags

app.get("/tags", (req, res) => {
    try {
    const file = fs.readFileSync(tagsPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);
    res.json(data);
  } catch (err) {
    console.error("Error reading tags:", err);
    res.status(500).json({ error: "Failed to read tags" });
  }
});

app.post("/tags/addTag", (req, res) => {
    try {
        const newTag = req.body;
        const file = fs.readFileSync(tagsPath, "utf-8");

        if (!file.trim()) {
        return res.json([]);
        }

        const data = JSON.parse(file);

        const maxId = data.length > 0 ? Math.max(...data.map(tag => tag.id)) : 0;
        newTag.id = maxId + 1;

        data.push(newTag);
        fs.writeFileSync(tagsPath, JSON.stringify(data, null, 2));

        res.json({message: "Tag added."});
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add tag" });
    }
});

app.listen(4000, () => console.log("Backend running on port 4000"));