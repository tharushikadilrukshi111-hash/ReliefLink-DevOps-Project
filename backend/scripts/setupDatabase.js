import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { hashPassword } from '../src/utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbName = process.env.DB_NAME || 'crisisbridge';
if (!/^[A-Za-z0-9_]+$/.test(dbName)) throw new Error('DB_NAME may only contain letters, numbers, and underscores.');

const baseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const root = path.resolve(__dirname, '../../database');
const schemaSql = fs.readFileSync(path.join(root, 'schema.sql'), 'utf8');
const seedSql = fs.readFileSync(path.join(root, 'seed.sql'), 'utf8');

let connection;
try {
  connection = await mysql.createConnection(baseConfig);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${dbName}\``);
  await connection.query(schemaSql);

  const { salt, hash } = hashPassword('admin123');
  await connection.execute(
    `INSERT INTO users (username, password_salt, password_hash, full_name, role, is_active)
     VALUES ('admin', ?, ?, 'CrisisBridge Administrator', 'admin', 1)
     ON DUPLICATE KEY UPDATE password_salt=VALUES(password_salt), password_hash=VALUES(password_hash), full_name=VALUES(full_name), role=VALUES(role), is_active=1`,
    [salt, hash]
  );

  await connection.query(seedSql);
  console.log(`Database '${dbName}' is ready.`);
  console.log('Demo login: admin / admin123');
} catch (error) {
  console.error('\nDatabase setup failed.');
  console.error(error.message);
  console.error('\nCheck that MySQL is running and that backend/.env has the correct DB_HOST, DB_PORT, DB_USER and DB_PASSWORD.');
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
