import {RoomManager} from "../rooms/room";
import {TIMEOUT} from "../memory_manager/memory_manager";

class User {

    public readonly userId: string;
    private _usernames: Map<string, string>;
    private readonly _rooms: Set<string>;
    private _lastUsed: Date;
    constructor(userId: string) {
        this.userId = userId;
        this._usernames = new Map<string, string>();
        this._rooms = new Set<string>();
        this._lastUsed = new Date();
    }

    public useUser(): void {
        this._lastUsed = new Date();
    }

    public joinRoom(roomId: string, username: string) {
        this._usernames.set(roomId, username);
        this._rooms.add(roomId);
    }

    public getUsername(roomId: string): string | undefined {
        return this._usernames.get(roomId);
    }

    public leaveRoom(roomId: string): void {
        this._usernames.delete(roomId);

        const room = RoomManager.getInstance().getRoom(roomId);
        if (room) {
            room.removeUser(this.userId, false);
            this._rooms.delete(roomId);
        }
    }

    public get rooms(): Set<string> {
        return this._rooms;
    }

    public lastUsed(): Date {
        return this._lastUsed;
    }
}

class UserManager {
    private _users: Map<string, User>;
    private static _instance: UserManager;

    private constructor() {
        this._users = new Map<string, User>();
    }

    public static getInstance(): UserManager {
        if (UserManager._instance == null) {
            UserManager._instance = new UserManager();
        }

        return UserManager._instance;
    }

    private createUser(userId: string): User {
        let user = new User(userId);
        this._users.set(userId, user);
        return user;
    }

    public getUnusedId(): string {
        let id = Math.random().toString(36).substr(2, 9);
        while (this._users.has(id)) {
            id = Math.random().toString(36).substr(2, 9);
        }
        return id;
    }

    public deleteUser(userId: string): void {
        const user = this._users.get(userId);
        if (user) {
            for (const roomId of user.rooms) {
                user.leaveRoom(roomId);
            }

            this._users.delete(userId);
        }

    }

    public getUser(userId: string): User {
        const user = this._users.get(userId);
        if (user == undefined) {
            return this.createUser(userId);
        }else {
            user.useUser();
            return user;
        }
    }

    public getRandomName(): string {
        let name = Math.random().toString(36).substring(2, 15);
        while (this._users.has(name)) {
            name = Math.random().toString(36).substring(2, 15);
        }
        return name;
    }


    public clearUnusedUsers(): void {
        const now = new Date();
        this._users.forEach((user, userId) => {
            if (now.getTime() - user.lastUsed().getTime() > TIMEOUT
            ) {
                this.deleteUser(userId);
            }
        });
    }
}

export {User, UserManager};