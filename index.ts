import dotenv from "dotenv";
import express, {Express, Request, Response} from "express";
import path from "path";
import session from "express-session";
import {createServer} from "http";
import {Server} from "socket.io";
import cors from "cors";
import clearMemoryLoop from "./app/modules/memory_manager/memory_manager";


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

const sessionMiddleware = session({
    secret: require('crypto').randomBytes(64).toString('hex'),
    resave: false,
    cookie: {maxAge: 86400000},
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
});

app.use(sessionMiddleware);


app.use(require('sanitize').middleware);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://admin.socket.io"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

const {instrument} = require("@socket.io/admin-ui");
instrument(io, {
    auth: false,
    mode: "development",
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('/*', function (req: Request, res: Response) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

const roomRouter = require('./app/routes/Room');
const userRouter = require('./app/routes/User');
const videoRouter = require('./app/routes/Video');

app.use('/api/room', roomRouter);
app.use('/api/user', userRouter);
app.use('/api/video', videoRouter);

const {subscribe, nextVideo} = require("./app/routes/Sockets")(io);

io.on("connection", (socket: any) => {
        console.log("a user connected");
        socket.on("video:subscribe", subscribe);
        socket.on("video:nextVideo", nextVideo);

        socket.on('disconnect', function () {
            console.log('a user disconnected');
        });
    }
);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

clearMemoryLoop();

module.exports = io;