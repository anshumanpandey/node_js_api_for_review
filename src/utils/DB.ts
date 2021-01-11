import knex from "knex"
import { ApiError } from "./ApiError";

export let DB: knex<any, unknown[]> | null = null;
export const initDb = async () => {
  DB = knex({
    client: process.env.DB_DIALECT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  });
  return DB
}

const connectionStore = new Map<string, knex<any, unknown[]>>();

export const getDbFor = (dbName?: string) => {
  const databaseName = dbName || process.env.DB_NAME
  if (!databaseName) throw new ApiError("Could not stablish connection to unknown database")

  const foundConn = connectionStore.get(databaseName)

  if (!foundConn) {
    const conn = knex({
      client: process.env.DB_DIALECT,
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: databaseName
      }
    });
    connectionStore.set(databaseName, conn);
    return conn
  } else {
    return foundConn;
  }
}

export default DB;