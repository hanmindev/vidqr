import {RoomManager} from "../modules/rooms/room";

const roomManager = RoomManager.getInstance();

class VideoController {
    private static _instance: VideoController;
    private getIo(): any {
        return require('../../index');
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
            this.getIo().to(roomId).emit("video:changeVideo", {'roomId': roomId, 'video': nextVideoObject});
        }else{
            this.getIo().to(roomId).emit("video:changeVideo", {'roomId': roomId, 'video': ''});
        }

        if (room.videoList.length > 0) {
            room.shiftVideoList(discard);
        }

        this.getIo().to(roomId).emit("video:videoList", {'roomId': roomId, 'videoList': room.videoList});

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
                this.getIo().to(roomId).emit("video:changeVideo", {'roomId': roomId, 'video': room.videoList[0]});
            }else{
                this.getIo().to(roomId).emit("video:changeVideo", {'roomId': roomId, 'video': ''});
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

        this.getIo().to(roomId).emit("video:videoList", {'roomId': roomId, 'videoList': room.videoList});

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

    moveTo(roomId: string, index: number, to: number) {
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }

        if (room.videoList.length <= index || room.videoList.length <= to) {
            return false;
        }

        const force = index === 0 || to === 0;

        while (index != to) {
            if (index < to) {
                const temp = room.videoList[index];
                room.videoList[index] = room.videoList[index + 1];
                room.videoList[index + 1] = temp;
                index++;
            }else{
                const temp = room.videoList[index];
                room.videoList[index] = room.videoList[index - 1];
                room.videoList[index - 1] = temp;
                index--;
            }
        }
        this.updateVideoList(roomId, force);
        return true;
    }

    getVideoList(roomId: string) {
        const room = roomManager.getRoom(roomId);
        if (!room) {
            return false;
        }

        return room.videoList;

    }
}

export default VideoController;