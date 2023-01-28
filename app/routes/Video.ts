import session from "express-session";

const axios = require('axios').default;

import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

module.exports = (io) => {
    const subscribe = function (params) {
        let roomId = params.roomId;

        const socket = this;
        socket.join(roomId);
        const room = roomManager.getRoom(roomId);
        io.to(roomId).emit("video:videoList", {'videoList': room !== undefined ? room.videoList: []});

    };

    const nextVideo = function (params) {
        let roomId = params.roomId;
        const room = roomManager.getRoom(roomId);

        if (room.videoList.length > 1) {
            const nextVideoObject = room.videoList[1];
            io.to(roomId).emit("video:nextVideo", {'video': nextVideoObject});
        }else{
            io.to(roomId).emit("video:nextVideo", {'video': ''});
        }

        if (room.videoList.length > 0) {
            room.videoList.shift();
        }

        io.to(roomId).emit("video:videoList", {'videoList': room.videoList});

    };

    return {
        subscribe,
        nextVideo
    }
}