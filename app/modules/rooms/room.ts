import {User, UserManager} from "../users/user";
import {TIMEOUT} from "../memory_manager/memory_manager";

interface VideoPlayerState {
    videoSeconds: number
    videoDuration: number
    currentTime: number
    playing: boolean
    volume: number
    muted: boolean
}

class Room {
    private readonly _roomId: string;

    public readonly roomName: string | undefined;
    private readonly _users: Map<string, User>;
    private _hostId: string;
    private readonly _usernames: Set<string>;
    private readonly _videoList: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}[];
    private readonly _historicalVideoList: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}[];
    private _videoCount: number;
    private _lastUsed: Date;
    private _videoPlayerState: VideoPlayerState;


    constructor(roomId: string, roomName: string | undefined, hostId: string) {
        this._roomId = roomId;
        this.roomName = roomName;
        this._users = new Map<string, User>();
        this._hostId = hostId;
        this._usernames = new Set<string>();
        this._videoList = [];
        this._historicalVideoList = [];
        this._videoCount = 0;
        this._lastUsed = new Date();
        this._videoPlayerState = {
            videoSeconds: 0,
            videoDuration: 1,
            currentTime: 0,
            playing: false,
            volume: 25,
            muted: false
        }
    }

    public useRoom(): void {
        this._lastUsed = new Date();
    }

    public get lastUsed(): Date {
        return this._lastUsed;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public get hostId(): string {
        return this._hostId;
    }

    public addUser(user: User, username: string): void {
        user.joinRoom(this._roomId, username);
        this._usernames.add(username);
        this._users.set(user.userId, user);
    }

    public usernameExists(username: string): boolean {
        return this._usernames.has(username);
    }

    public removeUser(userId: string, leaveRoom: boolean = true): void {
        const user = this._users.get(userId);
        if (user !== undefined && leaveRoom) {
            const username = user.getUsername(this._roomId);
            if (username !== undefined) {
                this._usernames.delete(username);
            }
            user.leaveRoom(this._roomId);
        }
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

    public getUsers(): Map<string, User> {
        return this._users;
    }

    public updateVideoPlayerState(type: string, info: any) {
        if (type === "progress") {
            if (info.videoSeconds !== undefined) {this._videoPlayerState.videoSeconds = info.videoSeconds;}
            if (info.videoDuration !== undefined) {this._videoPlayerState.videoDuration = info.videoDuration;}
            if (info.currentTime !== undefined) {this._videoPlayerState.currentTime = info.currentTime;}
            if (info.playing !== undefined) {this._videoPlayerState.playing = info.playing;}
        } else if (type === "volume") {
            if (info.volume !== undefined) {this._videoPlayerState.volume = info.volume;}
            if (info.muted !== undefined) {this._videoPlayerState.muted = info.muted;}
        }
    }

    public get videoPlayerState(): VideoPlayerState {
        return this._videoPlayerState;
    }


}

class RoomManager {
    private _rooms: Map<string, Room>;
    private nullRoom = new Room("null", undefined, "null");
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

    public createRoom(roomId: string, roomName: string, owner: string): Room {
        let room = new Room(roomId, roomName, owner);
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

    public addUserToRoom(roomId: string, user: User, username: string): void {
        this.getRoom(roomId).addUser(user, username);
    }

    public removeUserFromRoom(roomId: string, userId: string): void {
        this.getRoom(roomId).removeUser(userId);
    }

    public getRoom(roomId: string, use: boolean=true): Room {
        const room = this._rooms.get(roomId);
        if (room == undefined) {
            return this.nullRoom;
        }else{
            if (use) {
                room.useRoom();
            }
            return room;
        }
    }

    public deleteRoom(roomId: string): void {
        const room = this._rooms.get(roomId);
        if (room) {
            for (const user of room.getUsers()) {
                user[1].leaveRoom(roomId);
            }

            this._rooms.delete(roomId);
        }
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

    public clearUnusedRooms(): void {
        const now = new Date();
        this._rooms.forEach((room, roomId) => {
            if (now.getTime() - room.lastUsed.getTime() > TIMEOUT
            ) {
                this.deleteRoom(roomId);
            }
        });
    }
}

export {Room, RoomManager};