abstract class User {
    public readonly userId: string | null;
    public username: string;
}

class RealUser extends User {
    public readonly userId: string | undefined;
    public username: string;
    constructor(userId: string, username: string) {
        super();
        this.userId = userId;
        this.username = username;
    }
}

class NullUser extends User {
    public readonly userId: string | undefined;
    public readonly username: string;
    constructor() {
        super();
        this.userId = null;
        this.username = "Invalid Username";
    }
}

class UserManager {
    private _users: Map<string, User>;
    private static _instance: UserManager;

    private constructor() {
        this._users = new Map<string, User>();
        this._users.set(undefined, new NullUser());
    }

    public static getInstance(): UserManager {
        if (UserManager._instance == null) {
            UserManager._instance = new UserManager();
        }

        return UserManager._instance;
    }

    public createUser(userId: string, username: string): User {
        let user = new RealUser(userId, username);
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
        return this._users.get(userId);
    }
}

export {User, UserManager};