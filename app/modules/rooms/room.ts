import {User, UserManager} from "../users/user";


class Room {
    private readonly _roomId: string;

    public readonly roomName: string | undefined;
    private readonly _users: Map<string, User>;
    private readonly _usernames: Set<string>;
    private readonly _videoList: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}[];
    private readonly _historicalVideoList: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}[];
    private _videoCount: number;


    constructor(roomId: string, roomName: string | undefined) {
        this._roomId = roomId;
        this.roomName = roomName;
        this._users = new Map<string, User>();
        this._usernames = new Set<string>();
        this._videoList = [];
        this._historicalVideoList = [];
        this._videoCount = 0;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public addUser(user: User): void {
        this._users.set(user.userId, user);
        this._usernames.add(user.username);
    }

    public usernameExists(username: string): boolean {
        return this._usernames.has(username);
    }

    public removeUser(userId: string): void {
        this._users.delete(userId);
        this._usernames.delete(UserManager.getInstance().getUser(userId).username);
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

    public shiftVideoList(discard?: boolean): void {
        if (this._videoList.length > 0){
            const pop = this._videoList.shift();
            if (!discard && pop != undefined) {
                this._historicalVideoList.push(pop);
            }
        }
    }

    public unshiftVideoList(): boolean {
        if (this._historicalVideoList.length > 0){
            const pop = this._historicalVideoList.pop();
            if (pop != undefined) {
                this._videoList.unshift(pop);
            }
            return true
        }
        return false
    }

    public getCurrentVideo(){
        return this._videoList[0];
    }

    public getCumulativeVideoCount(): number {
        return this._videoCount;
    }


}

class RoomManager {
    private _rooms: Map<string, Room>;
    private nullRoom = new Room("null", undefined);
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

    public createRoom(roomId: string, roomName: string): Room {
        let room = new Room(roomId, roomName);
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
        this.getRoom(roomId).addUser(user);
    }

    public removeUserFromRoom(roomId: string, userId: string): void {
        this.getRoom(roomId).removeUser(userId);
    }

    public getRoom(roomId: string): Room {
        const room = this._rooms.get(roomId);
        if (room == undefined) {
            return this.nullRoom;
        }else{
            return room;
        }
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

    public getRandomName(): string {
        return "Uncreative Room Name";
    }
}

export {Room, RoomManager};