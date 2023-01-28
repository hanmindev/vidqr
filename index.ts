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


const oneDay = 1000 * 60 * 60 * 24;
const sessionMiddleware = session({
  secret: require('crypto').randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: oneDay,
    secure: false
  }
});

app.set('trust proxy', 1)
app.use(sessionMiddleware);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    allowedHeaders: ["vidqr-header"],
    methods: ["GET", "POST"],
    credentials: true
  },
    cookie: {
        name: "io",
        path: "/",
        httpOnly: true,
        sameSite: "lax"
    }
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));


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

const { subscribe, addVideo, nextVideo, disconnect } = require("./app/routes/Video")(io);

io.on("connection", (socket: any) => {
    // console.log(socket.request.session);

    console.log("a user connected");
    socket.on("video:subscribe", subscribe);
    socket.on("video:addVideo", addVideo);
    socket.on("video:nextVideo", nextVideo);
    // socket.on("disconnect", disconnect);


    }
);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
