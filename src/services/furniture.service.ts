import e from "express";
import { db } from "../db";
import {capitalize} from "./users.services";

interface FurnitureData {
    type: string;
    colors: string;
    materials: string;
    city: string;
    price: number;
    description: string;
    title: string;
}

export async function addfurniture(data: FurnitureData,id: number) {
    db.exec(`
        INSERT INTO furnitures_type (name)
        SELECT '${capitalize(data.type)}'
        WHERE NOT EXISTS (SELECT 1 FROM furnitures_type WHERE name = '${capitalize(data.type)}');`
    );
    db.exec(`
        INSERT INTO colors (name)
        SELECT '${capitalize(data.colors)}'
        WHERE NOT EXISTS (SELECT 1 FROM colors WHERE name = '${capitalize(data.colors)}');`
    );
    db.exec(`
        INSERT INTO furnitures_materials (name)
        SELECT '${capitalize(data.materials)}'
        WHERE NOT EXISTS (SELECT 1 FROM furnitures_materials WHERE name = '${capitalize(data.materials)}');`
    );
    db.exec(`
        INSERT INTO cities (name)
        SELECT '${capitalize(data.city)}'
        WHERE NOT EXISTS (SELECT 1 FROM cities WHERE name = '${capitalize(data.city)}');`)
    const stmt = db.prepare(`
        INSERT INTO furnitures (type_id, title, price, colors_id, description, materials_id, city_id, user_id, status_id, created_at, updated_at)
        VALUES (
            (SELECT id FROM furnitures_type WHERE name = '${capitalize(data.type)}'),
            '${data.title}',
            ${data.price},
            (SELECT id FROM colors WHERE name = '${capitalize(data.colors)}'),
            '${data.description}',
            (SELECT id FROM furnitures_materials WHERE name = '${capitalize(data.materials)}'),
            (SELECT id FROM cities WHERE name = '${capitalize(data.city)}'),
            ${id},
            1,
            datetime('now'),
            datetime('now')
        );
    `);
    const result = stmt.run();
    return result.lastInsertRowid ;
}

export function validateFurniture(id: number) {
    db.exec(`
        UPDATE furnitures
        SET status_id = (SELECT id FROM furnitures_status WHERE status = 'valider')
        WHERE id = ${id};
    `);
}
export function rejectFurniture(id: number) {
    db.exec(`
        UPDATE furnitures
        SET status_id = (SELECT id FROM furnitures_status WHERE status = 'refuser')
        WHERE id = ${id};
    `);
}

export function getAllValidatedFurnitures() {
    const stmt = db.prepare(`
        SELECT 
            f.id,
            ft.name AS type,
            f.price,
            c.name AS color,
            f.description,
            fm.name AS material,
            ci.name AS city,
            f.user_id,
            fs.status,
            f.created_at,
            f.updated_at
        FROM furnitures f
        JOIN furnitures_type ft ON f.type_id = ft.id
        JOIN colors c ON f.colors_id = c.id
        JOIN furnitures_materials fm ON f.materials_id = fm.id
        JOIN cities ci ON f.city_id = ci.id
        JOIN furnitures_status fs ON f.status_id = fs.id
        WHERE f.status_id = (SELECT id FROM furnitures_status WHERE status = 'valider');
    `);
    return stmt.all();
}