import {Server} from "socket.io";

const axios = require('axios').default;

import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";
import VideoController from "../controllers/VideoController";

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();


module.exports = (io: Server) => {
    const subscribe = function (this: any, params: any) {
        let roomId = params.roomId;

        const socket = this;

        socket.join(roomId);
        VideoController.getInstance().pingVideoList(roomId);

    };

    const nextVideo = function (params: any) {
        VideoController.getInstance().nextVideo(params.roomId, params.discard);
    };

    const ping = function (this: any, params: any) {
        const socket = this;
        console.log(this.request.session.id);
    };

    return {
        subscribe,
        nextVideo
    }
}