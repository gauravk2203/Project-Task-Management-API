import { query } from "../config/mysql.js";

function mapUser(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUserRecord(row) {
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
  };
}

const publicColumns = "id, name, email, created_at, updated_at";

export async function createUser({ name, email, passwordHash }) {
  const result = await query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return findUserById(Number(result.insertId));
}

export async function findUserById(id) {
  const rows = await query(
    `SELECT ${publicColumns} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserByEmail(email) {
  const rows = await query(
    `SELECT ${publicColumns}, password_hash FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] ? mapUserRecord(rows[0]) : null;
}

export async function updateUser(id, fields) {
  const sets = [];
  const params = [];

  if (fields.name !== undefined) {
    sets.push("name = ?");
    params.push(fields.name);
  }
  if (fields.email !== undefined) {
    sets.push("email = ?");
    params.push(fields.email);
  }

  if (sets.length === 0) {
    return findUserById(id);
  }

  params.push(id);
  await query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, params);
  return findUserById(id);
}
