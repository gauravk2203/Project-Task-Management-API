import { query } from "../config/mysql.js";

const columns = "id, user_id, title, description, status, created_at, updated_at";

function mapProject(row) {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createProject({ userId, title, description, status }) {
  const result = await query(
    "INSERT INTO projects (user_id, title, description, status) VALUES (?, ?, ?, ?)",
    [userId, title, description, status]
  );
  return findOwnedProject(Number(result.insertId), userId);
}

export async function listProjectsByUser(userId) {
  const rows = await query(
    `SELECT ${columns} FROM projects WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
    [userId]
  );
  return rows.map(mapProject);
}

export async function findOwnedProject(id, userId) {
  const rows = await query(
    `SELECT ${columns} FROM projects WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function updateOwnedProject(id, userId, fields) {
  const sets = [];
  const params = [];
  const allowed = ["title", "description", "status"];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }

  if (sets.length === 0) {
    return findOwnedProject(id, userId);
  }

  params.push(id, userId);
  await query(
    `UPDATE projects SET ${sets.join(", ")} WHERE id = ? AND user_id = ?`,
    params
  );

  return findOwnedProject(id, userId);
}

export async function deleteOwnedProject(id, userId) {
  const result = await query(
    "DELETE FROM projects WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
}

export async function getProjectStats(userId) {
  const rows = await query(
    `SELECT
       COUNT(*) AS totalProjects,
       COALESCE(SUM(status = 'active'), 0) AS activeProjects,
       COALESCE(SUM(status = 'completed'), 0) AS completedProjects
     FROM projects
     WHERE user_id = ?`,
    [userId]
  );
  const row = rows[0];

  return {
    totalProjects: Number(row.totalProjects),
    activeProjects: Number(row.activeProjects),
    completedProjects: Number(row.completedProjects),
  };
}
