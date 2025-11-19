import e from "express";
import { db } from "../db";
import { capitalize } from "./users.services";
import fs from "fs";
import path from "path";

interface FurnitureData {
  type: string;
  colors: string;
  materials: string;
  city: string;
  price: number;
  description: string;
  title: string;
}

export async function addfurniture(data: FurnitureData, id: number) {
  db.exec(`
        INSERT INTO furnitures_type (name)
        SELECT '${capitalize(data.type)}'
        WHERE NOT EXISTS (SELECT 1 FROM furnitures_type WHERE name = '${capitalize(
          data.type
        )}');`);
  db.exec(`
        INSERT INTO colors (name)
        SELECT '${capitalize(data.colors)}'
        WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name = '${capitalize(
          data.colors
        )}');`);
  db.exec(`
        INSERT INTO furnitures_materials (name)
        SELECT '${capitalize(data.materials)}'
        WHERE NOT EXISTS (SELECT 1 FROM furnitures_materials WHERE name = '${capitalize(
          data.materials
        )}');`);
  db.exec(`
        INSERT INTO cities (name)
        SELECT '${capitalize(data.city)}'
        WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = '${capitalize(
          data.city
        )}');`);
  const stmt = db.prepare(`
        INSERT INTO furnitures (type_id, title, price, colors_id, description, materials_id, city_id, user_id, status_id, created_at, updated_at)
        VALUES (
            (SELECT id FROM furnitures_type WHERE name = '${capitalize(
              data.type
            )}'),
            '${data.title}',
            ${data.price},
            (SELECT id FROM colors WHERE name = '${capitalize(data.colors)}'),
            '${data.description}',
            (SELECT id FROM furnitures_materials WHERE name = '${capitalize(
              data.materials
            )}'),
            (SELECT id FROM cities WHERE name = '${capitalize(data.city)}'),
            ${id},
            1,
            datetime('now'),
            datetime('now')
        );
    `);
  const result = stmt.run();
  return result.lastInsertRowid;
}

export function validateFurniture(id: number) {
  const stmt = db.prepare(`
        SELECT status_id FROM furnitures WHERE id = ?;
    `);
  const row = stmt.get(id);

  const venduStatusIdStmt = db.prepare(`
        SELECT id FROM furnitures_status WHERE status = 'vendu';
    `);
  const venduStatus = venduStatusIdStmt.get();

  if (row && venduStatus && row.status_id === venduStatus.id) {
    throw new Error("Impossible de valider : le meuble est déjà vendu.");
  }

  db.exec(`
        UPDATE furnitures
        SET status_id = (SELECT id FROM furnitures_status WHERE status = 'valider')
        WHERE id = ${id};
    `);
}
export function rejectFurniture(id: number) {
  const stmt = db.prepare(`
        SELECT status_id FROM furnitures WHERE id = ?;
    `);
  const row = stmt.get(id);

  const venduStatusIdStmt = db.prepare(`
        SELECT id FROM furnitures_status WHERE status = 'vendu';
    `);
  const venduStatus = venduStatusIdStmt.get();

  if (row && venduStatus && row.status_id === venduStatus.id) {
    throw new Error("Impossible de refuser : le meuble est déjà vendu.");
  }

  db.exec(`
        UPDATE furnitures
        SET status_id = (SELECT id FROM furnitures_status WHERE status = 'refuser')
        WHERE id = ${id};
    `);
}

export function getAllValidatedFurnitures(
  search?: string | string[],
  type?: string | string[],
  color?: string | string[],
  material?: string | string[],
  city?: string | string[],
  priceMin?: number,
  priceMax?: number
) {
  let query = `
    SELECT 
      f.id,
      f.title,
      ft.name AS type,
      f.price,
      c.name AS color,
      f.description,
      fm.name AS material,
      ci.name AS city,
      f.user_id,
      fs.status,
      f.created_at,
      f.updated_at,
      GROUP_CONCAT(i.url) AS images
    FROM furnitures f
    JOIN furnitures_type ft ON f.type_id = ft.id
    JOIN colors c ON f.colors_id = c.id
    JOIN furnitures_materials fm ON f.materials_id = fm.id
    JOIN cities ci ON f.city_id = ci.id
    JOIN furnitures_status fs ON f.status_id = fs.id
    LEFT JOIN images i ON i.furnitures_id = f.id
    WHERE f.status_id = (SELECT id FROM furnitures_status WHERE status = 'valider')
  `;

  const params: any[] = [];

  if (
    search &&
    (Array.isArray(search) ? search.length > 0 : search.trim() !== "")
  ) {
    const searchArr = Array.isArray(search) ? search : [search];
    const searchConditions = searchArr.map(
      () => `
      (
        f.title LIKE ? OR 
        f.description LIKE ? OR 
        ft.name LIKE ? OR 
        c.name LIKE ? OR 
        fm.name LIKE ? OR 
        ci.name LIKE ?
      )
    `
    );
    query += " AND (" + searchConditions.join(" OR ") + ")";
    searchArr.forEach((s) => {
      const searchParam = `%${s}%`;
      params.push(
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam,
        searchParam
      );
    });
  }

  const addArrayOrStringFilter = (
    value: string | string[] | undefined,
    alias: string
  ) => {
    if (value && (Array.isArray(value) ? value.length > 0 : value !== "all")) {
      const arr = Array.isArray(value) ? value : [value];
      query += ` AND (${arr.map(() => `${alias}.name = ?`).join(" OR ")})`;
      params.push(...arr);
    }
  };

  addArrayOrStringFilter(type, "ft");
  addArrayOrStringFilter(color, "c");
  addArrayOrStringFilter(material, "fm");
  addArrayOrStringFilter(city, "ci");

  if (priceMin !== undefined && priceMin !== null) {
    query += " AND f.price >= ?";
    params.push(priceMin);
  }
  if (priceMax !== undefined && priceMax !== null) {
    query += " AND f.price <= ?";
    params.push(priceMax);
  }

  query += " GROUP BY f.id ORDER BY f.created_at DESC LIMIT 25;";

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export function getAllmoderatorFurnitures(status: string, search: string) {
  let query = `
        SELECT 
            f.id,
            f.title,
            ft.name AS type,
            f.price,
            c.name AS color,
            f.description,
            fm.name AS material,
            ci.name AS city,
            f.user_id,
            u.email AS user_mail,
            fs.status,
            f.created_at,
            f.updated_at,
            GROUP_CONCAT(i.url) AS images
        FROM furnitures f
        JOIN furnitures_type ft ON f.type_id = ft.id
        JOIN colors c ON f.colors_id = c.id
        JOIN furnitures_materials fm ON f.materials_id = fm.id
        JOIN cities ci ON f.city_id = ci.id
        JOIN furnitures_status fs ON f.status_id = fs.id
        JOIN users u ON f.user_id = u.id
        LEFT JOIN images i ON i.furnitures_id = f.id
    `;

  const params: any[] = [];
  const conditions: string[] = [];

  if (status !== "all") {
    conditions.push(
      `f.status_id = (SELECT id FROM furnitures_status WHERE status = ?)`
    );
    params.push(status);
  }

  if (search && search.trim() !== "") {
    conditions.push(
      `(f.title LIKE ? OR f.description LIKE ? OR ft.name LIKE ? OR c.name LIKE ? OR fm.name LIKE ? OR ci.name LIKE ? Or u.email LIKE ? OR f.price LIKE ?)`
    );
    const searchParam = `%${search}%`;
    params.push(
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam
    );
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY f.id ORDER BY f.created_at DESC LIMIT 25 ;";

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export function getAllUsersFurnitures(
  status: string,
  search: string,
  user_id: number
) {
  let query = `
        SELECT 
            f.id,
            f.title,
            ft.name AS type,
            f.price,
            c.name AS color,
            f.description,
            fm.name AS material,
            ci.name AS city,
            f.user_id,
            u.email AS user_mail,
            fs.status,
            f.created_at,
            f.updated_at,
            GROUP_CONCAT(i.url) AS images
        FROM furnitures f
        JOIN furnitures_type ft ON f.type_id = ft.id
        JOIN colors c ON f.colors_id = c.id
        JOIN furnitures_materials fm ON f.materials_id = fm.id
        JOIN cities ci ON f.city_id = ci.id
        JOIN furnitures_status fs ON f.status_id = fs.id
        JOIN users u ON f.user_id = u.id
        LEFT JOIN images i ON i.furnitures_id = f.id
    `;

  const params: any[] = [];
  const conditions: string[] = [];

  conditions.push(`f.user_id = ?`);
  params.push(user_id);

  if (status !== "all") {
    conditions.push(
      `f.status_id = (SELECT id FROM furnitures_status WHERE status = ?)`
    );
    params.push(status);
  }

  if (search && search.trim() !== "") {
    conditions.push(
      `(f.title LIKE ? OR f.description LIKE ? OR ft.name LIKE ? OR c.name LIKE ? OR fm.name LIKE ? OR ci.name LIKE ? Or u.email LIKE ? OR f.price LIKE ?)`
    );
    const searchParam = `%${search}%`;
    params.push(
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam,
      searchParam
    );
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY f.id ORDER BY f.created_at DESC LIMIT 25 ;";

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

export function deleteFurnitureById(
  id: number,
  user_id: number,
  isModerator: boolean = false
) {
  if (!isModerator) {
    const furnitureStmt = db.prepare(
      "SELECT user_id FROM furnitures WHERE id = ?"
    );
    const furniture = furnitureStmt.get(id);
    if (!furniture) {
      return { error: `Le meuble avec l'id ${id} n'existe pas.` };
    } else if (furniture.user_id !== user_id) {
      return { error: `User is not authorized to delete this furniture.` };
    }
  }
  const furnitureStmt = db.prepare(
    "SELECT * FROM furnitures WHERE id = ?"
  );
  const furniture = furnitureStmt.get(id);
  if (!furniture) {
    return { error: `Le meuble avec l'id ${id} n'existe pas.` };
  }

  const stmtGetImages = db.prepare(
    "SELECT url FROM images WHERE furnitures_id = ?"
  );
  const images = stmtGetImages.all(id);

  images.forEach((img: Record<string, any>) => {
    const imagePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      img.url as string
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
  const stmtImg = db.prepare("DELETE FROM images WHERE furnitures_id = ?");
  stmtImg.run(id);

  const stmt = db.prepare("DELETE FROM furnitures WHERE id = ?");
  stmt.run(id);

  
  const assocTables = [
    { table: "cities", column: "city_id", id: furniture.city_id },
    { table: "colors", column: "colors_id", id: furniture.colors_id },
    { table: "furnitures_materials", column: "materials_id", id: furniture.materials_id },
    { table: "furnitures_type", column: "type_id", id: furniture.type_id },
  ];

  assocTables.forEach(({ table, column, id }) => {
    if (id !== undefined && furniture.id !== undefined) {
      const countStmt = db.prepare(
        `SELECT COUNT(*) as count FROM furnitures WHERE ${column} = ? AND id != ?`
      );
      const result = countStmt.get(id as number, furniture.id as number);
      const count = result ? result.count : 0;
      if (count === 0) {
        const delStmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
        delStmt.run(id);
      }
    }
  });
  return { success: `Le meuble avec l'id ${id} a été supprimé avec succès.` };
}

export function getTypeListe() {
  const stmt = db.prepare(`
    SELECT ft.name 
    FROM furnitures_type ft
    JOIN furnitures f ON f.type_id = ft.id
    JOIN furnitures_status fs ON f.status_id = fs.id
    WHERE fs.status = 'valider'
    GROUP BY ft.name;
  `);
  return stmt.all();
}
export function getCityListe() {
  const stmt = db.prepare(`
    SELECT c.name 
    FROM cities c
    JOIN furnitures f ON f.city_id = c.id
    JOIN furnitures_status fs ON f.status_id = fs.id
    WHERE fs.status = 'valider'
    GROUP BY c.name;
  `);
  return stmt.all();
}

export function getColorListe() {
  const stmt = db.prepare(`
    SELECT c.name 
    FROM colors c
    JOIN furnitures f ON f.colors_id = c.id
    JOIN furnitures_status fs ON f.status_id = fs.id
    WHERE fs.status = 'valider'
    GROUP BY c.name;
  `);
  return stmt.all();
}

export function getMaterialListe() {
  const stmt = db.prepare(`
    SELECT fm.name 
    FROM furnitures_materials fm
    JOIN furnitures f ON f.materials_id = fm.id
    JOIN furnitures_status fs ON f.status_id = fs.id
    WHERE fs.status = 'valider'
    GROUP BY fm.name;
  `);
  return stmt.all();
}
