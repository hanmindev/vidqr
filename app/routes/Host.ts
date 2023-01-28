import express from 'express';
import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";

const router = express.Router();



const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();


router.post('/rejoin_room', function (req: any, res, next) {
    let roomId;
    let roomName=null;
    if (req.session.roomId) {
        roomId = req.session.roomId;
        roomName = roomManager.getRoom(roomId).roomName;
        console.log("A host has joined a room with id: " + roomId);
    } else {
        roomId = undefined;
    }

    res.send({'roomId': roomId, 'host': roomName===req.session.owner});
});

router.post('/create_room', function (req: any, res, next) {
    let roomId = roomManager.getUnusedId()
    const room = roomManager.createRoom(roomId);
    room.roomName = req.body.roomName;
    req.session.roomId = roomId;
    req.session.owner = roomId;


    console.log("A host has made a room with id: " + roomId);
    res.send({'roomId': roomId});
});

router.post('/get_room_info', function (req: any, res, next) {
    let roomId = req.body.roomId;
    let roomName;

    try {
        roomName = roomManager.getRoom(roomId).roomName;
    }
    catch (e) {
        roomName = undefined;
    }

    res.send({'roomName': roomName, 'host': roomId===req.session.owner});
});

router.post('/get_current_video/:roomId', function (req: any, res, next) {
    try {
        const roomId = req.params.roomId;
        const room = roomManager.getRoom(roomId);

        if (room === undefined) {
            res.send({'video': []});
            return;
        }

        res.send({'video': room.videoList[0]});
    }catch (e) {
        res.send({'video': []});
    }
});

router.post('/mediaControl/', function (req: any, res, next) {
    try {
        const action = req.body.action;
        if (action === "play") {
            res.send({'status': "Done"});

        } else if (action === "next") {

            const io = require('../../index');
            require("./Video")(io).nextVideo({'roomId': req.session.roomId});

            res.send({'status': "Done"});
        } else if (action === "prev") {
            res.send({'status': "Done"});
        } else {
            res.send({'error': "Invalid action"});
        }
    }catch (e) {
        res.send({'error': "Invalid action"});
    }
});

module.exports = router;