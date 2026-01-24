import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/database", (req, res) => {
    const data = JSON.parse(fs.readFileSync("list_data.json"));
    res.json(data);
});

app.post("/database", (req, res) => {
    const newData = req.body;
    fs.writeFileSync("list_data.json", JSON.stringify(newData, null, 2));
    res.json({ message: "Saved!" });
});

app.listen(4000, () => console.log("Backend running on port 4000"));