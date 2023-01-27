import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../client/build')));


// Move app.use() inside the conditional statement
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('/*', function (req: Request, res: Response) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const hostRouter = require('./app/routes/Host');
const remoteRouter = require('./app/routes/Remote');

app.use('/api/host', hostRouter);
app.use('/api/remote', remoteRouter);



const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
