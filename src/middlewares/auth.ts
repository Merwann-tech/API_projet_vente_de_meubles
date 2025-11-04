import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.services';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getAdminById,getModeratorById } from '../services/users.services';



interface AuthenticatedRequest extends Request {
    id?: number;
}

export function verifyTokenUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Token manquant" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Format d'autorisation invalide" });
    }
    const decoded = verifyToken(token);
    if (decoded === null || typeof decoded === "string" || typeof decoded !== "object") {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    } else {
        req.id = (decoded as JwtPayload).id;
        next();
    }
}

export function verifyTokenAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token manquant" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Format d'autorisation invalide" });
    }

    const decoded = verifyToken(token);
    if (decoded === null || typeof decoded === "string" || typeof decoded !== "object") {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
    if (getAdminById((decoded as JwtPayload).id)) {
        req.id = (decoded as JwtPayload).id;
        next();
    } else {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
}

export function verifyTokenModerator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Token manquant" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Format d'autorisation invalide" });
    }

    const decoded = verifyToken(token);
    if (decoded === null || typeof decoded === "string" || typeof decoded !== "object") {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
    if (getModeratorById((decoded as JwtPayload).id) || getAdminById((decoded as JwtPayload).id)) {
        req.id = (decoded as JwtPayload).id;
        next();
    } else {
        return res.status(403).json({ message: "Token invalide ou expiré" });
    }
}