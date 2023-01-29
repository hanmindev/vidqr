import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import path from "path";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(cors({
    "origin": "http://localhost:3000",
    "methods": "GET,POST",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true
}));


const MemoryStore = require('memorystore')(session);

app.use(session({
    secret: require('crypto').randomBytes(64).toString('hex'),
    resave: false,
    cookie: { maxAge: 86400000 },
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
}));

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});


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

const { subscribe, nextVideo } = require("./app/routes/Video")(io);

io.on("connection", (socket: any) => {

    console.log("a user connected");
    socket.on("video:subscribe", subscribe);
    socket.on("video:nextVideo", nextVideo);
    }
);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

module.exports = io;