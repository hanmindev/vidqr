import {RoomManager} from "../modules/rooms/room";

const roomManager = RoomManager.getInstance();

class VideoController {
    private static _instance: VideoController;
    private _io: any;

    private constructor() {
        this._io = require('../../index');
    }

    public static getInstance(): VideoController {
        if (VideoController._instance == null) {
            VideoController._instance = new VideoController();
        }

        return VideoController._instance;
    }

    public nextVideo(roomId: string): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }

        if (room.videoList.length > 1) {
            const nextVideoObject = room.videoList[1];
            this._io.to(roomId).emit("video:nextVideo", {'video': nextVideoObject});
        }else{
            this._io.to(roomId).emit("video:nextVideo", {'video': ''});
        }

        if (room.videoList.length > 0) {
            room.shiftVideoList();
        }

        this._io.to(roomId).emit("video:videoList", {'videoList': room.videoList});

        return true;
    }

    public toggleVideo(roomId: string): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }
        if (room.videoList.length > 0) {
            this._io.to(roomId).emit("video:toggleVideo", {});
        }

        return true;
    }

    public prevVideo(roomId: string): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }
        if (room.unshiftVideoList()){
            this.updateVideoList(roomId, true);
        }

        return true;
    }

    public updateVideoList(roomId: string, force?: boolean): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }
        if (room.videoList.length == 1 || force) {
            this._io.to(roomId).emit("video:nextVideo", {'videoLink': room.videoList[0].videoLink});
        }

        this._io.to(roomId).emit("video:videoList", {'videoList': room.videoList});

        return true;
    }
}

export default VideoController;