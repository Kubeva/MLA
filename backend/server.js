import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { getFormDefaultValueType } from "./extra.js"
import sharp from "sharp";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger.json" with { type: "json" };

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

passport.use(
  new LocalStrategy(
    async function(username, password, done) {
      try {
        const user = findUser(username);

        if (!user) { 
          return done(null, false); 
        }

        const goodPassword = await bcrypt.compare(password, user.password);
        if (!goodPassword) { 
          return done(null, false); 
        }
        return done(null, user);
      } catch(err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  try {
    const user = findUser(username);

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "SECRET"
};

passport.use(
  new JwtStrategy(opts, (payload, done) => {
    try {
      const user = findUser(payload.username);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      done(err);
    }
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "list_data.json");
const tagsPath = path.join(__dirname, "tags.json");
const imagesPath = path.join(__dirname, "images/");
const imageExtensions = ["jpg", "jpeg", "png"];
const usersPath = path.join(__dirname, "users.json");

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
});

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/database", (req, res) => {
  try {
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);
    res.status(200).json(data);
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
    res.status(500).json({ error: "Failed to add attribute to database." });
  }
});

app.delete("/database/deleteAttribute", (req, res) => {
  try {
    const { name } = req.body;
    const file = fs.readFileSync(dbPath, "utf-8");

    if (!file.trim()) {
      return res.json([]);
    }

    const data = JSON.parse(file);

    const exists = data.some(item => Object.hasOwn(item, name));
    if(!exists){
      return res.status(404).json({ message: "Attribute doesn't exist." });
    }

    const updatedDatabase = data.map(item => {
      const newItem = { ...item };
      delete newItem[name];
      return newItem;
    });

    fs.writeFileSync(dbPath, JSON.stringify(updatedDatabase, null, 2));

    res.status(200).json({ message: "Deleted attribute." });
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

    res.status(201).json({message: "Item added."});
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed to add item to database" });
  }
})

app.put("/database/editItem", (req, res) => {
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
    return res.status(201).json({ message: "Image uploaded."});
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

//API for user managment

const getUsers = () =>  {
  const file = fs.readFileSync(usersPath, "utf-8");

  if (!file.trim()) {
    return JSON.parse([]);
  }

  return JSON.parse(file);
};

const findUser = (username) => {
  return getUsers().find(u => u.username === username);
};

app.post("/users/login", passport.authenticate("local", { session: false }), (req, res) => {
  try {
    const token = jwt.sign(
      {
        id: req.user.id,
        username: req.user.username
      },
      "SECRET",
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful.", token });
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed login." });
  }
});

app.post("/users/register", (req, res) => {
  try {
    const { username, password } = req.body;
    const data = getUsers();

    if (data.length === 0) {
      return res.json([]);
    }

    const exists = data.some(user => user.username === username);
    if(exists){
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    const maxId = data.length > 0 ? Math.max(...data.map(user => user.id)) : 0;
    
    const newUser = {
      id: maxId + 1,
      username: username,
      password: hashedPassword
    };

    data.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));

    res.status(201).json({message: "User registered."});
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: "Failed login." });
  }
});

app.get("/users/me", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.json(req.user);
  }
);

app.listen(4000, () => console.log("Backend running on port 4000"));