import { db } from "../db";

export const getAllUsers = () => {
  const stmt = db.prepare("SELECT * FROM users");
  return stmt.all();
}