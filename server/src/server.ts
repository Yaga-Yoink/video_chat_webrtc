import express from "express";
import path from "path";
const app = express();
const port = process.env.PORT || 8080;
const messages = require("./messages.ts");

app.use(express.json());

app.get("/api", (req, res) => {
  console.log('api was fetched')
  res.send(["very interesting data"]);
});

app.use((req, res) => {
  res.status(404).send(messages.notFound);
});

app.listen(port, () => {
  console.log(`Server is Running On Port ${port}`);
});
