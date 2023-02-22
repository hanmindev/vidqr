import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";
import {default as axios} from "axios";
import VideoController from "../controllers/VideoController";
import VideoSearchController from "../controllers/VideoSearchController";


const express = require('express');
const router = express.Router();

const roomManager = RoomManager.getInstance();

router.post('/get_username/:roomId', function (req: any, res: any) {
    const userManager = roomManager.getRoom(req.params.roomId).getUserManager();


    if (req.session.userId) {
        let username = userManager.getUser(req.session.userId).username;
        res.send({'username': username});
    } else {
        res.send({'username': undefined});
    }
    req.session.userId = userManager.getUnusedId();
});

router.post('/join_room/:roomId', function (req: any, res: any) {
    const userManager = roomManager.getRoom(req.params.roomId).getUserManager();

    let roomId = req.params.roomId;
    let username = req.body.username;

    if (username !== undefined) {
        username = username.trim();
        if (username.length > 16) {
            username = username.substring(0, 16);
        }
        if (username.length === 0) {
            username = userManager.getRandomName();
        }

        if (!roomManager.roomExists(roomId)) {
            res.send({'username': username, 'validRoom': false});
            return;
        }

        if (roomManager.getRoom(roomId).usernameExists(username)) {
            res.send({'username': undefined, 'validRoom': true});
            return;
        }

        if (!req.session.userId) {
            req.session.userId = userManager.getUnusedId();
            userManager.createUser(req.session.userId, username);
        }
        req.session.roomId = roomId;


        roomManager.addUserToRoom(roomId, userManager.getUser(req.session.userId));

        console.log(username + " has joined a room with id: " + roomId);
        res.send({'roomId': roomId, 'username': username, 'validRoom': true});
    } else {
        res.send({'validRoom': false});
    }
});

module.exports = router;