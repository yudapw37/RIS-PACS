import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const DbUrl = process.env.DATABASE_URL || "mysql://root:rootpassword@127.0.0.1:3306/ris_v2";

const poolConnection = mysql.createPool({
  uri: DbUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
