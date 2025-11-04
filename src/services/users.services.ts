import e from "express";
import { db } from "../db";
import { hashPassword } from "./password.services";
import { get } from "http";

export function getAllUsers() {
  const stmt = db.prepare("SELECT * FROM users");
  return stmt.all();
}

export function getUserById(id: number) {
    const stmt = db.prepare("SELECT firstname, lastname, email FROM users WHERE id = ?");
    const user = stmt.get(id);
    return user;
}

interface VolunteerData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    city: string;
}

export async function addVolunteer(volunteerData: VolunteerData) {
    let city = await capitalize(volunteerData.city)
    let hashedPassword = await hashPassword(volunteerData.password)
    if (!isValidEmail(volunteerData.email)) {
        return { error: "Invalid email format" }
    }
    if (verifyEmail(volunteerData.email) <= 0) {
        db.exec(`
        INSERT INTO cities (name)
        SELECT '${city}'
        WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = '${city}');`)
        db.exec(`
        INSERT INTO users (firstname, lastname, email, password, city_id, created_at, updated_at)
        VALUES (
            '${volunteerData.firstname}',
            '${volunteerData.lastname}',
            '${volunteerData.email}',
            '${hashedPassword}',
            (SELECT id FROM cities WHERE name = '${city}'),
            datetime('now'),
            datetime('now')
        );`,)
        return { success: "users add" }
    } else {
        return { error: "Email already exists" }
    }
};

export function addModerator(id: number) {
    const stmt = db.prepare('UPDATE users SET moderator = 1 WHERE id = ?');
    stmt.run(id);
    const user = getUserById(id);
    return { success: `User ${user?.firstname} ${user?.lastname} promoted to moderator` };
}

function capitalize(city : string) {
    let cityLower = city.toLowerCase()
    let cityCapitalize = (cityLower[0] as string).toUpperCase() + cityLower.slice(1)
    return cityCapitalize
}

export function verifyEmail(email: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
    const user = stmt.get(email);
    return typeof user?.count === "number" ? user.count : 0;
}

export function getPasswordByEmail(email: string){
    const stmt = db.prepare('SELECT password FROM users WHERE email = ?');
    const user = stmt.get(email);
    return user ? (user['password'] as string) : undefined;
}
export function getIdByEmail(email: string) {
    const stmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const user = stmt.get(email);
    return user ? (user['id']as number) : undefined;
}

export function getAdminById(id: number){
    const stmt = db.prepare('SELECT admin FROM users WHERE id = ?');
    const user = stmt.get(id);
    return user ? (user['admin'] as number) : 0;
}

export function getModeratorById(id: number){
    const stmt = db.prepare('SELECT moderator FROM users WHERE id = ?');
    const user = stmt.get(id);
    return user ? (user['moderator'] as number) : 0;
}

export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
