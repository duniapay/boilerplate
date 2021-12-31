import { config } from 'dotenv';

config();

const {
  DB_TYPE,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  DB_DATABASE,
  DB_SYNC,
} = process.env;

export const type = DB_TYPE;
export const host = DB_HOST;
export const port = DB_PORT;
export const username = DB_USERNAME;
export const password = DB_PASSWORD;
export const database = DB_DATABASE;
export const migrations = [__dirname + '/src/migrations/*{.ts,.js}'];
export const entities = [__dirname + '/src/**/*.entity.{ts,js}'];
export const subscribers = [__dirname + '/src/**/*.subscriber.{ts,js}'];
export const synchronize = DB_SYNC;
