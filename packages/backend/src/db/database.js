const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const initDatabase = require('./migrations/init');

const state = { db: null };

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

const connect = async () => {
  if (state.db) {
    return state.db;
  }

  return new Promise((resolve, reject) => {
    try {
      const fs = require('node:fs');

      if (fs.existsSync(DB_PATH)) {
        const stats = fs.statSync(DB_PATH);
        console.log('Database file size:', stats.size, 'bytes');

        const files = fs.readdirSync(__dirname);
        console.log('Files in db directory:', files.length);
      }

      state.db = new sqlite3.Database(DB_PATH, async (err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          reject(err);
          return;
        }

        console.log('Connected to SQLite database');

        try {
          await initDatabase(state.db);
          console.log('Database initialized');
          resolve(state.db);
        } catch (error) {
          console.error('Error initializing database:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Failed to create database connection:', error);
      reject(error);
    }
  });
};

// Get database instance - throws error if not connected
const getDb = () => {
  if (!state.db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return state.db;
};

const closeConnection = () => {
  return new Promise((resolve, reject) => {
    if (!state.db) {
      resolve();
      return;
    }

    state.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        reject(err);
        return;
      }
      state.db = null;
      resolve();
    });
  });
};

module.exports = {
  closeConnection,
  connect,
  getDb
};
