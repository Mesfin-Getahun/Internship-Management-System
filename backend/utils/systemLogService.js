import db from "../config/mysql.js";

let cachedColumns = null;

const candidateColumn = (columns, names, fallback = null) =>
  names.find((name) => columns.has(name)) || fallback;

const getSystemLogColumns = async () => {
  if (cachedColumns) {
    return cachedColumns;
  }

  const [rows] = await db.query("SHOW COLUMNS FROM system_logs");
  cachedColumns = new Set(rows.map((row) => row.Field));
  return cachedColumns;
};

export const invalidateSystemLogColumnCache = () => {
  cachedColumns = null;
};

export const insertSystemLog = async ({ actorId = null, action, description = null }) => {
  const columns = await getSystemLogColumns();
  const logIdColumn = candidateColumn(columns, ["user_id", "admin_id", "actor_id", "performed_by"]);
  const actionColumn = candidateColumn(columns, ["action", "event", "activity", "message"]);
  const descriptionColumn = candidateColumn(columns, ["description", "details", "detail", "message"]);

  const insertColumns = [];
  const values = [];

  if (logIdColumn && actorId !== null && actorId !== undefined) {
    insertColumns.push(logIdColumn);
    values.push(actorId);
  }

  if (actionColumn && action) {
    insertColumns.push(actionColumn);
    values.push(action);
  }

  if (
    descriptionColumn &&
    description &&
    descriptionColumn !== actionColumn
  ) {
    insertColumns.push(descriptionColumn);
    values.push(description);
  }

  if (insertColumns.length === 0) {
    throw new Error("No compatible columns found for system_logs insert");
  }

  const placeholders = insertColumns.map(() => "?").join(", ");
  await db.query(
    `INSERT INTO system_logs (${insertColumns.join(", ")}) VALUES (${placeholders})`,
    values
  );
};

export const fetchSystemLogs = async (limit = 100) => {
  const columns = await getSystemLogColumns();

  const idColumn = candidateColumn(columns, ["log_id", "id"]);
  const actorColumn = candidateColumn(columns, ["user_id", "admin_id", "actor_id", "performed_by"]);
  const actionColumn = candidateColumn(columns, ["action", "event", "activity", "message"]);
  const descriptionColumn = candidateColumn(columns, ["description", "details", "detail", "message"]);
  const createdAtColumn = candidateColumn(columns, ["created_at", "logged_at", "timestamp", "created_on"]);
  const orderColumn = createdAtColumn || idColumn || actionColumn;

  const selectParts = [
    `${idColumn || "NULL"} AS log_id`,
    `${actorColumn || "NULL"} AS user_id`,
    `${actionColumn || "NULL"} AS action`,
    `${descriptionColumn || "NULL"} AS description`,
    `${createdAtColumn || "NULL"} AS created_at`,
  ];

  const query = `
    SELECT ${selectParts.join(", ")}
    FROM system_logs
    ${orderColumn ? `ORDER BY ${orderColumn} DESC` : ""}
    LIMIT ?
  `;

  const [rows] = await db.query(query, [Number(limit)]);
  return rows;
};
