import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";

var express = require('express');
var router = express.Router();

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

router.get('/get_username/:roomId', function (req, res, next) {
    if (req.session.userId) {
        let username = userManager.getUser(req.session.userId).username;
        res.send({'username': username});
    } else {
        res.send({'username': undefined});
    }
    req.session.userId = userManager.getUnusedId();
});

router.post('/join_room/:roomId', function (req, res, next) {
    let roomId = req.params.roomId;
    let username = req.body.username;
    if (username !== undefined) {

        if (!roomManager.roomExists(roomId)) {
            res.status(404).send("Room does not exist");


            res.send({'validRoom': false});
            return;
        }

        if (!req.session.userId) {
            req.session.userId = userManager.getUnusedId();
            userManager.createUser(req.session.userId, username);
        }


        roomManager.addUserToRoom(roomId, userManager.getUser(req.session.userId));

        console.log(username + " has joined a room with id: " + roomId);
        res.send({'roomId': roomId, 'validRoom': true});
    } else {
        res.send({'goodUsername': false});
    }
});

module.exports = router;