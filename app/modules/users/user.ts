class User {

    public readonly userId: string;
    public username: string;
    constructor(userId: string, username: string) {
        this.userId = userId;
        this.username = username;
    }
}

class UserManager {
    private _users: Map<string | undefined, User>;
    private _nullUser: User = new User("null", "null");

    public constructor() {
        this._users = new Map<string, User>();
    }

    public createUser(userId: string, username: string): User {
        let user = new User(userId, username);
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
            return this._nullUser;
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