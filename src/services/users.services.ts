// ...existing code...
import { db } from "../db";
import { hashPassword } from "./password.services";
import { SQLInputValue } from "node:sqlite";

export function getAllUsers() {
  const stmt = db.prepare("SELECT * FROM users");
  return stmt.all();
}

interface VolunteerData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  city: string;
}

export async function addVolunteer(volunteerData: VolunteerData) {
  const city = await capitalize(volunteerData.city);
  const hashedPassword = await hashPassword(volunteerData.password);
  if (!isValidEmail(volunteerData.email)) {
    return { error: "Invalid email format" };
  }
  if (verifyEmail(volunteerData.email) <= 0) {
    db.exec(`
        INSERT INTO cities (name)
        SELECT '${city}'
        WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = '${city}');`);
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
        );`);
    return { success: "users add" };
  } else {
    return { error: "Email already exists" };
  }
}

export function getUserById(id: number) {
  const stmt = db.prepare(`
        SELECT 
            u.id,
            u.firstname,
            u.lastname,
            u.email,
            c.name AS city
        FROM users AS u
        JOIN cities AS c ON u.city_id = c.id
        WHERE u.id = ?
    `);
  return stmt.get(id);
}

export async function updateUser(
  userId: number,
  userData: {
    city: string;
    email: string;
    password: string;
    firstname: SQLInputValue;
    lastname: SQLInputValue;
  }
) {
  const city = capitalize(userData.city);
  const currentEmail = getemail(userId);
  if (!isValidEmail(userData.email)) {
    return { error: "Invalid email format" };
  }

  if (currentEmail === userData.email || verifyEmail(userData.email) <= 0) {

    db.exec(`
            INSERT INTO cities (name)
            SELECT '${city}'
            WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = '${city}');
        `);

    const fields = [
      "firstname = ?",
      "lastname = ?",
      ...(currentEmail !== userData.email ? ["email = ?"] : []),
      ...(userData.password ? ["password = ?"] : []),
      "city_id = (SELECT id FROM cities WHERE name = ?)",
    ];
    const values = [
      userData.firstname,
      userData.lastname,
      ...(currentEmail !== userData.email ? [userData.email] : []),
      ...(userData.password ? [await hashPassword(userData.password)] : []),
      city,
      userId,
    ];
    const stmt = db.prepare(`
            UPDATE users SET ${fields.join(", ")}
            WHERE id = ?
        `);
    stmt.run(...values);

    return { success: "Utilisateur mis à jour" };
  } else {
    return { error: "L'email existe déjà" };
  }
}

export function listUsersByName(name: string | undefined) {
    if (!name) {
        // Retourne tous les utilisateurs si name est undefined
        const users = db.prepare(`
            SELECT 
            u.id,
            u.firstname,
            u.lastname,
            u.email,
            c.name AS city,
            u.moderator,
            u.admin
            FROM users AS u
            JOIN cities AS c ON u.city_id = c.id
            LIMIT 6
        `);
        return users.all();
    }
    const users = db.prepare(`
        SELECT 
            u.id,
            u.firstname,
            u.lastname,
            u.email,
            u.moderator,
            u.admin,
            c.name AS city
        FROM users AS u
        JOIN cities AS c ON u.city_id = c.id
        WHERE LOWER(u.firstname) LIKE LOWER(?)
            OR LOWER(u.lastname) LIKE LOWER(?)
        LIMIT 6
    `);
    return users.all(`%${name}%`, `%${name}%`);
};

function getemail(Id: number) {
  const stmt = db.prepare("SELECT email FROM users WHERE id = ?");
  const volunteer = stmt.get(Id);
  return volunteer ? (volunteer["email"] as string) : undefined;
}
export function addModerator(id: number) {
  const stmt = db.prepare("UPDATE users SET moderator = 1 WHERE id = ?");
  stmt.run(id);
  const user = getUserById(id);
return {
    success: `Utilisateur ${user?.firstname} ${user?.lastname} promu modérateur`,
};
}

export function removeModerator(id: number) {
  const stmt = db.prepare("UPDATE users SET moderator = 0 WHERE id = ?");
  stmt.run(id); 
    const user = getUserById(id);
    return {
        success: `Utilisateur ${user?.firstname} ${user?.lastname} rétrogradé du statut de modérateur`,
    };
}

export function addAdmin(idParam: string) {
    const id = parseInt(idParam);
    const stmt = db.prepare("UPDATE users SET admin = 1 WHERE id = ?");
    stmt.run(id); 
      const user = getUserById(id);
    return {
        success: `Utilisateur ${user?.firstname} ${user?.lastname} promu administrateur`,
    };
  }

export function removeAdmin(idParam: string ,userId: number) {
    const id = parseInt(idParam);
    if (id === userId) {
        return {
            success: "Vous ne pouvez pas vous rétrograder vous-même du statut d'administrateur",
        };
    }
    const stmt = db.prepare("UPDATE users SET admin = 0 WHERE id = ?"); 
    stmt.run(id);
        const user = getUserById(id);   
    return {
        success: `Utilisateur ${user?.firstname} ${user?.lastname} rétrogradé du statut d'administrateur`,
    };
  } 

export function capitalize(city: string) {
  const cityLower = city.toLowerCase();
  const cityCapitalize =
    (cityLower[0] as string).toUpperCase() + cityLower.slice(1);
  const cityNoSpaces = cityCapitalize.replace(/\s+/g, '');
  return cityNoSpaces;
}

export function verifyEmail(email: string): number {
  const stmt = db.prepare(
    "SELECT COUNT(*) as count FROM users WHERE email = ?"
  );
  const user = stmt.get(email);
  return typeof user?.count === "number" ? user.count : 0;
}

export function getPasswordByEmail(email: string) {
  const stmt = db.prepare("SELECT password FROM users WHERE email = ?");
  const user = stmt.get(email);
  return user ? (user["password"] as string) : undefined;
}
export function getIdByEmail(email: string) {
  const stmt = db.prepare("SELECT id FROM users WHERE email = ?");
  const user = stmt.get(email);
  return user ? (user["id"] as number) : undefined;
}

export function getAdminById(id: number) {
  const stmt = db.prepare("SELECT admin FROM users WHERE id = ?");
  const user = stmt.get(id);
  return user ? (user["admin"] as number) : 0;
}

export function getModeratorById(id: number) {
  const stmt = db.prepare("SELECT moderator FROM users WHERE id = ?");
  const user = stmt.get(id);
  return user ? (user["moderator"] as number) : 0;
}

export function isValidEmail(email: string): boolean {
  const emailPattern = /^(?!.*\.\.)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}


