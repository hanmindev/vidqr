import "express-session"

declare module "express-session" {
    interface Session {
        roomId: string;
        authenticated: boolean;
    }
}