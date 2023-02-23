import {User, UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";
import {default as axios} from "axios";
import VideoController from "../controllers/VideoController";
import VideoSearchController from "../controllers/VideoSearchController";


const express = require('express');
const router = express.Router();

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

router.post('/get_username/:roomId', function (req: any, res: any) {
    let roomId = req.params.roomId;

    const username = userManager.getUser(req.session.id).getUsername(roomId);

    res.send({'username': username});
});

router.post('/join_room/:roomId', function (req: any, res: any) {

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

        let user = userManager.getUser(req.session.id)

        roomManager.addUserToRoom(roomId, user, username);

        console.log(username + " has joined a room with id: " + roomId);
        res.send({'roomId': roomId, 'username': username, 'validRoom': true});
    } else {
        res.send({'validRoom': false});
    }
});

module.exports = router;