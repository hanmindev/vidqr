class User {

    public readonly userId: string;
    private _usernames: Map<string, string>;
    private _currentRoomId: string;
    constructor(userId: string) {
        this.userId = userId;
        this._usernames = new Map<string, string>();
        this._currentRoomId = "";
    }

    public get currentRoomId(): string {
        return this._currentRoomId;
    }

    public joinRoom(roomId: string, username: string) {
        this._usernames.set(roomId, username);
        this._currentRoomId = roomId;
    }

    public getUsername(roomId: string): string | undefined {
        return this._usernames.get(roomId);
    }

    public leaveRoom(roomId: string): void {
        this._usernames.delete(roomId);
        this._currentRoomId = "";
    }

}

class UserManager {
    private _users: Map<string | undefined, User>;
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
        this._users.delete(userId);
    }

    public getUser(userId: string): User {
        const user = this._users.get(userId);
        if (user == undefined) {
            return this.createUser(userId);
        }else {
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
}

export {User, UserManager};