import bcrypt from "bcryptjs";
import db from "../config/mysql.js";

const mustChangeColumnPromises = new Map();

export const generateTemporaryPassword = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$";
  const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];

  return [
    pick(letters),
    pick(letters.toLowerCase()),
    pick(digits),
    pick(symbols),
    ...Array.from({ length: 8 }, () => pick(`${letters}${digits}${symbols}`)),
  ]
    .sort(() => Math.random() - 0.5)
    .join("");
};

export const ensureMustChangePasswordColumn = async (tableName) => {
  if (!tableName) return;

  if (mustChangeColumnPromises.has(tableName)) {
    return mustChangeColumnPromises.get(tableName);
  }

  const promise = (async () => {
    const [columns] = await db.query(
      `SHOW COLUMNS FROM \`${tableName}\` WHERE Field = 'must_change_password'`,
    );

    if (columns.length === 0) {
      await db.query(
        `ALTER TABLE \`${tableName}\` ADD COLUMN must_change_password tinyint(1) DEFAULT 0 AFTER password`,
      );
    }
  })().catch((error) => {
    mustChangeColumnPromises.delete(tableName);
    throw error;
  });

  mustChangeColumnPromises.set(tableName, promise);
  return promise;
};

export const resetAccountPassword = async ({
  table,
  idColumn,
  accountId,
  temporaryPassword = generateTemporaryPassword(),
}) => {
  await ensureMustChangePasswordColumn(table);

  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  const [result] = await db.query(
    `
    UPDATE \`${table}\`
    SET password = ?, must_change_password = TRUE
    WHERE \`${idColumn}\` = ?
    `,
    [hashedPassword, accountId],
  );

  return {
    affectedRows: result.affectedRows || 0,
    temporaryPassword,
  };
};
