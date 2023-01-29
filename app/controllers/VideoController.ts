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

    public nextVideo(roomId: string, discard?: boolean): boolean{
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
            room.shiftVideoList(discard);
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
        if (force) {
            if (room.videoList.length > 0){
                this._io.to(roomId).emit("video:nextVideo", {'videoLink': room.videoList[0].videoLink});
            }else{
                this._io.to(roomId).emit("video:nextVideo", {'videoLink': ''});
            }
        }

        this.pingVideoList(roomId);

        return true;
    }

    public pingVideoList(roomId: string): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }

        this._io.to(roomId).emit("video:videoList", {'videoList': room.videoList});

        return true;
    }

    public deleteVideo(roomId: string, index: number): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }
        if (room.videoList.length > index) {
            room.videoList.splice(index, 1);
            this.updateVideoList(roomId, index === 0);
        }

        return true;
    }

    public raiseVideo(roomId: string, index: number): boolean{
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }
        if (room.videoList.length > index && index > 0) {
            const temp = room.videoList[index - 1];
            room.videoList[index - 1] = room.videoList[index];
            room.videoList[index] = temp;

            this.updateVideoList(roomId, index === 1);
        }

        return true;
    }
}

export default VideoController;