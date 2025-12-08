import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_SECRET: string = process.env.ACCESS_SECRET || 'admin';

export function createToken(payload: object): string {
    return jwt.sign(payload, ACCESS_SECRET, { algorithm: 'HS256', expiresIn: '30min' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, ACCESS_SECRET);
    } catch {
        return null;
    }
}
