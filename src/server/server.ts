import express, { Request, Response } from 'express';
import path from 'path';
const app = express();
const port = 8080;
const messages = require("./messages.ts");


app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(messages.home);
});

app.post('/submit', (req, res) => {
    console.log(`here`);
  console.log(req.body);
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
    res.status(404).send(messages.notFound);
  });

app.listen(port, () => {
  console.log(`Server is Running On Port ${port}`);
});
