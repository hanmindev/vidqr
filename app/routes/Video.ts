import session from "express-session";

const axios = require('axios').default;

import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";
import VideoController from "../controllers/VideoController";

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

module.exports = (io) => {
    const subscribe = function (params) {
        let roomId = params.roomId;

        const socket = this;
        socket.join(roomId);
        VideoController.getInstance().updateVideoList(roomId);

    };

    const nextVideo = function (params) {
        let roomId = params.roomId;
        VideoController.getInstance().nextVideo(roomId);
    };

    return {
        subscribe,
        nextVideo
    }
}