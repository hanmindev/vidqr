import {User, UserManager} from "../users/user";


class Room {
    private _roomId: string;

    public roomName: string;
    private _users: Map<string, User>;
    private _videoList: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}[];
    private _videoCount: number


    constructor(roomId: string) {
        this._roomId = roomId;
        this._users = new Map<string, User>();
        this._videoList = [];
        this._videoCount = 0;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public addUser(user: User): void {
        this._users.set(user.userId, user);
    }

    public removeUser(userId: string): void {
        this._users.delete(userId);
    }

    public addVideo(video: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string}): void {
        this._videoCount++;
        const newVideo = {
            videoLink: video.videoLink,
            videoTitle: video.videoTitle,
            videoThumbnail: video.videoThumbnail,
            videoUsername: video.videoUsername,
            videoId: this._videoCount
        }
        this._videoList.push(newVideo);
    }

    public get videoList(): {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}[] {
        return this._videoList;
    }

    public getCumulativeVideoCount(): number {
        return this._videoCount;
    }


}

class RoomManager {
    private _rooms: Map<string, Room>;
    private static _instance: RoomManager;

    private constructor() {
        this._rooms = new Map<string, Room>();
    }

    public static getInstance(): RoomManager {
        if (RoomManager._instance == null) {
            RoomManager._instance = new RoomManager();
        }

        return RoomManager._instance;
    }

    public createRoom(roomId: string): Room {
        let room = new Room(roomId);
        this._rooms.set(roomId, room);
        return room;
    }

    public getUnusedId(): string {
        let id = Math.random().toString().substring(2, 10);
        while (this._rooms.has(id)) {
            id = Math.random().toString().substring(2, 10);
        }
        return id;
    }

    public addUserToRoom(roomId: string, user: User): void {
        this._rooms.get(roomId).addUser(user);
    }

    public removeUserFromRoom(roomId: string, userId: string): void {
        this._rooms.get(roomId).removeUser(userId);
    }

    public getRoom(roomId: string): Room {
        return this._rooms.get(roomId);
    }

    public deleteRoom(roomId: string): void {
        this._rooms.delete(roomId);
    }

    public roomExists(roomId: string): boolean {
        if (roomId == undefined) {
            return false;
        }
        return this._rooms.has(roomId);
    }
}

export {Room, RoomManager};