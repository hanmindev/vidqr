import {Server} from "socket.io";

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
        const videoList = VideoController.getInstance().getVideoList(roomId)

        if (videoList !== undefined) {
            socket.emit("video:videoList", videoList);
        }

    };

    const nextVideo = function (this: any, params: any) {
        const socket = this;

        VideoController.getInstance().nextVideo(params.roomId, params.discard);
    };

    const ping = function (this: any, params: any) {
        const socket = this;
        console.log(this.request.session.id);
    };

    const videoProgress = function (this: any, params: any) {
        const socket = this;
        // console.log(this.request.session.id);

        const room = roomManager.getRoom(params.roomId)
        
        room.updateVideoPlayerState(params.type, params.info)

        if (params.type === "progress" || params.type === "volume") {
            io.to(params.roomId).except(socket.id).emit("video:videoProgress", {type: params.type, info: params.info});
        }
    };

    return {
        subscribe,
        nextVideo,
        videoProgress
    }
}