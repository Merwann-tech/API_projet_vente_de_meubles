import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('./database.db');

export { db };