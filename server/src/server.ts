import express from "express";
import path from "path";
const app = express();
const port = 8080;
const messages = require("./messages.ts");

app.use(express.json());

app.get("/api", (req, res) => {
  res.send(messages.home);
});


app.use((req, res) => {
  res.status(404).send(messages.notFound);
});

app.listen(port, () => {
  console.log(`Server is Running On Port ${port}`);
});
