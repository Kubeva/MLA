import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { getFormDefaultValueType } from "./extra.js"
import sharp from "sharp";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "list_data.json");
const tagsPath = path.join(__dirname, "tags.json");
const imagesPath = path.join(__dirname, "images/");
const imageExtensions = ["jpg", "jpeg", "png"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesPath);
  },
  filename: function (req, file, cb) {
    const name = req.params.id;
    const ext = path.extname(file.originalname);

    for (const ext of imageExtensions) {
      const oldPath = path.join(imagesPath, `${name}.${ext}`);

      if(fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    cb(null, `${name}${ext}`);
  }
})

const uploadImage = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowed = ["image/jpeg", "image/png"];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

app.get("/database", (req, res) => {
  try {
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);
    res.status(201).json(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to read database" });
  }
});

app.post("/database/addAttribute", (req, res) => {
  try {
    const { name, type } = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);

    const exists = data.some(item => Object.hasOwn(item, name))
    if(exists){
      return res.status(409).json({ message: "Attribute already exists." });
    }

    const defaultValue = getFormDefaultValueType(type);
    const updatedDatabase = data.map((item) => ({
      ...item,
      [name]: defaultValue
    }));

    fs.writeFileSync(dbPath, JSON.stringify(updatedDatabase, null, 2));

    res.status(201).json({ message: "Added attribute." });
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to add attribute to database" });
  }
});

app.post("/database/deleteAttribute", (req, res) => {
  try {
    const { name } = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);

    const exists = data.some(item => Object.hasOwn(item, name));
    if(!exists){
      return res.status(409).json({ message: "Attribute doesn't exist." });
    }

    const updatedDatabase = data.map(item => {
      const newItem = { ...item };
      delete newItem[name];
      return newItem;
    });

    fs.writeFileSync(dbPath, JSON.stringify(updatedDatabase, null, 2));

    res.status(201).json({ message: "Deleted attribute." });
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to delete attribute from database" });
  }
});

app.post("/database/addItem", (req, res) => {
  try {
    const newItem = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }
    const data = JSON.parse(file);

    const exists = data.some(item => item.name === newItem.name)
    if(exists){
      return res.status(409).json({ message: "Item already exists." });
    }

    const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;

    newItem.id = maxId + 1;

    data.push(newItem);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    res.json({message: "Item added."});
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to add item to database" });
  }
})

app.post("/database/editItem", (req, res) => {
  try {
    const editedItem = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(dbPath));

    const index = data.findIndex(item => item.id === editedItem.id);
    if (index === -1){
      return res.status(404).json({ error: "Item not found" });
    }

    data[index] = editedItem;

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    res.json({message: `Item ${editedItem.id} updated.`});
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to edit item in database" });
  }
});

app.get("/database/getImageById/:id", (req, res) => {
  try {
    const id = req.params.id;

    if (!id){
      return res.status(400).json({ error: "Id is null." });
    }

    let filePath = null;

    for (const ext of imageExtensions) {
      const examplePath = path.join(imagesPath, `${id}.${ext}`);

      if(fs.existsSync(examplePath)) {
        filePath = examplePath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.set("Content-Type", "image/jpeg");

    sharp(filePath)
      .resize({ 
        width: 200, 
        height: 276,
        fit: "inside"
      })
      .jpeg()
      .pipe(res);
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to find image." });
  }
});

app.post("/database/uploadImage/:id", uploadImage.single("image"), (req, res) => {
  try {
    return res.json({ message: "Image uploaded."});
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to upload image." });
  }
});

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
    console.log(err)
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

    const exists = data.some(tag => tag.name === newTag.name)
    if(exists){
      return res.status(409).json({ message: "Tag already exists." });
    }

    const maxId = data.length > 0 ? Math.max(...data.map(tag => tag.id)) : 0;
    newTag.id = maxId + 1;

    data.push(newTag);
    fs.writeFileSync(tagsPath, JSON.stringify(data, null, 2));

    res.status(201).json({message: "Tag added."});
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to add tag" });
  }
});

app.listen(4000, () => console.log("Backend running on port 4000"));