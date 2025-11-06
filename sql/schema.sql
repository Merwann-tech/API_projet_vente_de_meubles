drop TABLE IF EXISTS images;
drop TABLE IF EXISTS furnitures; 
drop TABLE IF EXISTS users;
drop TABLE IF EXISTS furnitures_status;
drop TABLE IF EXISTS furnitures_type;
drop TABLE IF EXISTS furnitures_materials;
drop TABLE IF EXISTS colors;
drop TABLE IF EXISTS cities;


PRAGMA foreign_keys = ON;

CREATE TABLE cities (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE colors (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE furnitures_type (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE furnitures_status (
  id INTEGER PRIMARY KEY NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE furnitures_materials (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY NOT NULL,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  city_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  admin BOOLEAN NOT NULL DEFAULT 0,
  moderator BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE furnitures (
  id INTEGER PRIMARY KEY NOT NULL,
  type_id INTEGER NOT NULL,
  price INTEGER NOT NULL,
  colors_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  materials_id INTEGER NOT NULL,
  city_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (materials_id) REFERENCES furnitures_materials(id),
  FOREIGN KEY (type_id) REFERENCES furnitures_type(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (status_id) REFERENCES furnitures_status(id),
  FOREIGN KEY (colors_id) REFERENCES colors(id)
);

CREATE TABLE images (
  url TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  furnitures_id INTEGER NOT NULL,
  FOREIGN KEY (furnitures_id) REFERENCES furnitures(id)
);

INSERT INTO cities (name) VALUES ('Paris');
INSERT INTO users (firstname, lastname, email, password, city_id, created_at, updated_at, admin)
VALUES ('admin', 'admin', 'admin@admin.com', '$argon2id$v=19$m=65536,t=3,p=4$k07c8Ot270p8gYQ+mPEfAg$Lc6dhSgek7E/cTk4pv4ISFBrZxdqep6uJfzkcqQZFxo', 1, datetime('now'), datetime('now'), 1);

INSERT INTO furnitures_status (status) VALUES ('attente de validation');
INSERT INTO furnitures_status (status) VALUES ('valider');
INSERT INTO furnitures_status (status) VALUES ('refuser');
INSERT INTO furnitures_status (status) VALUES ('vendu');

INSERT INTO furnitures_type (name) VALUES ('Chaise');
INSERT INTO colors (name) VALUES ('Rouge');
INSERT INTO furnitures_materials (name) VALUES ('Bois');
INSERT INTO furnitures (type_id, price, colors_id, description, materials_id, city_id, user_id, status_id, created_at, updated_at)
VALUES (1, 150, 1, 'Chaise en bois rouge', 1, 1, 1, 1, datetime('now'), datetime('now'));