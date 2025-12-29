import { NextFunction, Request, Response } from "express";
import { auth as betterauth } from "../lib/auth"


export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean
            }
        }
    }
}
const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // get user session
        try {
            const session = await betterauth.api.getSession(
                {
                    headers: req.headers as any
                }
            )

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not auhorized"
                })
            }
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email varification required, please verify your email"
                })
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as string,
                emailVerified: session.user.emailVerified
            }

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to access this page"
                })
            }


            next()

        } catch (error) {
            next(error)
        }
    }
}


export default auth;