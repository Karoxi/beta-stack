import { openDatabaseAsync } from 'expo-sqlite';

let db = null;

export const initDB = async () => {
  try {
    db = await openDatabaseAsync('betastack.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        imageUri TEXT,
        createdAt TEXT
      );
    `);
    console.log('📦 Database initialized');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
  }
};

export const insertCard = async (title, notes, imageUri) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const createdAt = new Date().toISOString();
  try {
    const result = await db.runAsync(
      'INSERT INTO cards (title, notes, imageUri, createdAt) VALUES (?, ?, ?, ?);',
      [title, notes, imageUri, createdAt]
    );
    return result;
  } catch (err) {
    console.error('❌ Failed to insert card:', err);
    throw err;
  }
};

export const fetchCards = async () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    const result = await db.getAllAsync('SELECT * FROM cards ORDER BY createdAt DESC;');
    return result;
  } catch (err) {
    console.error('❌ Failed to fetch cards:', err);
    throw err;
  }
};

export const fetchCardById = async (id) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    const results = await db.getAllAsync('SELECT * FROM cards WHERE id = ?;', [id]);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error('❌ Failed to fetch card by ID:', err);
    throw err;
  }
};

export const updateCard = async (id, title, notes, imageUri) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    const result = await db.runAsync(
      'UPDATE cards SET title = ?, notes = ?, imageUri = ? WHERE id = ?;',
      [title, notes, imageUri, id]
    );
    return result;
  } catch (err) {
    console.error('❌ Failed to update card:', err);
    throw err;
  }
};

export const deleteCard = async (id) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  try {
    const result = await db.runAsync(
      'DELETE FROM cards WHERE id = ?;',
      [id]
    );
    return result;
  } catch (err) {
    console.error('❌ Failed to delete card:', err);
    throw err;
  }
};
