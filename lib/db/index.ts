import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

// Create connection pool
const poolConnection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: true,
  },
})

// Create Drizzle instance
export const db = drizzle(poolConnection, { schema, mode: "default" })

// Export schema for use in queries
export { schema }
