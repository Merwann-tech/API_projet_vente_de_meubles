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
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE furnitures (
  id INTEGER PRIMARY KEY NOT NULL,
  type_id INTEGER NOT NULL,
  price INTEGER NOT NULL,
  colors_id INTEGER NOT NULL,
  furniture_size_cm INTEGER NOT NULL,
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
INSERT INTO users (firstname, lastname, email, password, city_id, created_at, updated_at)
VALUES ('Jean', 'Dupont', 'jean.dupont@example.com', 'motdepasse123', 1, datetime('now'), datetime('now'));