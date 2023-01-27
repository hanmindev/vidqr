import express from 'express';
import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";

const router = express.Router();



const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();


router.post('/create_room', function (req: any, res, next) {
    let roomId;
    if (req.session.roomId) {
        roomId = req.session.roomId;
        console.log("A host has joined a room with id: " + roomId);
    } else {
        roomId = roomManager.getUnusedId()
        roomManager.createRoom(roomId);
        req.session.roomId = roomId;
        console.log("A host has made a room with id: " + roomId);
    }

    res.send({'roomId': roomId});
});

router.get('/get_current_video/:roomId', function (req, res, next) {
    const roomId = req.params.roomId;
    const room = roomManager.getRoom(roomId);

    if (room === undefined) {
        res.send({'video': []});
        return;
    }

    res.send({'video': room.videoList[0]});
});

module.exports = router;