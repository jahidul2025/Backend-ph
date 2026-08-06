import { IRequestUser } from "./requestUser.interfaces";

declare global {
    namespace Express {
        interface Request {
            user: IRequestUser;
        }
    }
}
