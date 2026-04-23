import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('coldbrewed.db');
let isDBInitialized = false;

type Nullable<T> = T | null;

type BatchRow = {
  id: number;
  name: string;
  date: Nullable<string>;
  beans: Nullable<string>;
  ratio: Nullable<string>;
  water: Nullable<string>;
  method_group: Nullable<string>;
  created_at: string;
};

type BrewItemRow = {
  id: number;
  batch_id: number;
  label: Nullable<string>;
  duration: Nullable<number>;
  harvest_time: Nullable<string>;
  fragrance: Nullable<number>;
  acidity: Nullable<number>;
  sweetness: Nullable<number>;
  mouthfeel: Nullable<number>;
  aftertaste: Nullable<number>;
  total_score: Nullable<number>;
  notes: Nullable<string>;
};

export type Batch = {
  id: number;
  name: string;
  date: string;
  beans: string;
  ratio: string;
  water: string;
  methodGroup: string;
  createdAt: string;
};

export type BrewItem = {
  id: number;
  batchId: number;
  label: string;
  duration: number;
  harvestTime: string;
  fragrance: number;
  acidity: number;
  sweetness: number;
  mouthfeel: number;
  aftertaste: number;
  totalScore: number;
  notes: string;
};

export type NewBatchInput = {
  name: string;
  date?: string;
  beans?: string;
  ratio?: string | number;
  water?: string;
  methodGroup?: string;
};

export type NewBrewItemInput = {
  label: string;
  duration?: number;
  harvestTime?: string;
  fragrance?: number;
  acidity?: number;
  sweetness?: number;
  mouthfeel?: number;
  aftertaste?: number;
  totalScore?: number;
  notes?: string;
};

export type BrewItemUpdateInput = {
  id: number;
} & NewBrewItemInput;

const toBatch = (row: BatchRow): Batch => ({
  id: row.id,
  name: row.name,
  date: row.date ?? '',
  beans: row.beans ?? '',
  ratio: row.ratio ?? '',
  water: row.water ?? '',
  methodGroup: row.method_group ?? '',
  createdAt: row.created_at,
});

const toBrewItem = (row: BrewItemRow): BrewItem => ({
  id: row.id,
  batchId: row.batch_id,
  label: row.label ?? '',
  duration: row.duration ?? 0,
  harvestTime: row.harvest_time ?? '',
  fragrance: row.fragrance ?? 0,
  acidity: row.acidity ?? 0,
  sweetness: row.sweetness ?? 0,
  mouthfeel: row.mouthfeel ?? 0,
  aftertaste: row.aftertaste ?? 0,
  totalScore: row.total_score ?? 0,
  notes: row.notes ?? '',
});

const normalizeBatchInput = (batchData: NewBatchInput) => ({
  name: batchData.name.trim(),
  date: batchData.date?.trim() ?? '',
  beans: batchData.beans?.trim() ?? '',
  ratio: String(batchData.ratio ?? '').trim(),
  water: batchData.water?.trim() ?? '',
  methodGroup: batchData.methodGroup?.trim() ?? '',
});

const normalizeBrewItemInput = (item: NewBrewItemInput) => {
  const fragrance = item.fragrance ?? 0;
  const acidity = item.acidity ?? 0;
  const sweetness = item.sweetness ?? 0;
  const mouthfeel = item.mouthfeel ?? 0;
  const aftertaste = item.aftertaste ?? 0;

  return {
    label: item.label.trim(),
    duration: item.duration ?? 0,
    harvestTime: item.harvestTime?.trim() ?? '',
    fragrance,
    acidity,
    sweetness,
    mouthfeel,
    aftertaste,
    totalScore:
      item.totalScore ??
      fragrance + acidity + sweetness + mouthfeel + aftertaste,
    notes: item.notes?.trim() ?? '',
  };
};

export const initDB = () => {
  if (isDBInitialized) {
    return;
  }

  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT,
      beans TEXT,
      ratio TEXT,
      water TEXT,
      method_group TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS brew_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER,
      label TEXT,
      duration INTEGER,
      harvest_time TEXT,
      fragrance INTEGER,
      acidity INTEGER,
      sweetness INTEGER,
      mouthfeel INTEGER,
      aftertaste INTEGER,
      total_score INTEGER,
      notes TEXT,
      FOREIGN KEY (batch_id) REFERENCES batches (id)
    );
  `);

  isDBInitialized = true;
};

export const saveCompleteBatch = (
  batchData: NewBatchInput,
  brewItems: NewBrewItemInput[]
) => {
  try {
    initDB();

    const normalizedBatch = normalizeBatchInput(batchData);
    const normalizedItems = brewItems.map(normalizeBrewItemInput);

    db.withTransactionSync(() => {
      const result = db.runSync(
        'INSERT INTO batches (name, beans, ratio, date, water, method_group) VALUES (?, ?, ?, ?, ?, ?)',
        [
          normalizedBatch.name,
          normalizedBatch.beans,
          normalizedBatch.ratio,
          normalizedBatch.date,
          normalizedBatch.water,
          normalizedBatch.methodGroup,
        ]
      );

      const batchId = Number(result.lastInsertRowId);

      for (const item of normalizedItems) {
        db.runSync(
          `INSERT INTO brew_items
          (batch_id, label, duration, harvest_time, fragrance, acidity, sweetness, mouthfeel, aftertaste, total_score, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            batchId,
            item.label,
            item.duration,
            item.harvestTime,
            item.fragrance,
            item.acidity,
            item.sweetness,
            item.mouthfeel,
            item.aftertaste,
            item.totalScore,
            item.notes,
          ]
        );
      }
    });

    return { success: true as const };
  } catch (error) {
    console.error('Failed to save batch:', error);
    return { success: false as const, error };
  }
};

export const getAllBatches = (): Batch[] => {
  initDB();

  const rows = db.getAllSync<BatchRow>(
    'SELECT * FROM batches ORDER BY created_at DESC, id DESC'
  );

  return rows.map(toBatch);
};

export const getBatchById = (id: number): Batch | null => {
  initDB();

  const row = db.getFirstSync<BatchRow>(
    'SELECT * FROM batches WHERE id = ?',
    id
  );

  return row ? toBatch(row) : null;
};

export const getBrewItemsByBatchId = (batchId: number): BrewItem[] => {
  initDB();

  const rows = db.getAllSync<BrewItemRow>(
    'SELECT * FROM brew_items WHERE batch_id = ? ORDER BY id ASC',
    batchId
  );

  return rows.map(toBrewItem);
};

export const updateBatchMethodGroup = (batchId: number, methodGroup: string) => {
  initDB();

  try {
    db.runSync('UPDATE batches SET method_group = ? WHERE id = ?', [
      methodGroup.trim(),
      batchId,
    ]);

    return { success: true as const };
  } catch (error) {
    console.error('Failed to update batch method group:', error);
    return { success: false as const, error };
  }
};

export const updateBrewItem = (item: BrewItemUpdateInput) => {
  initDB();

  try {
    const normalizedItem = normalizeBrewItemInput(item);

    db.runSync(
      `UPDATE brew_items
      SET label = ?, duration = ?, harvest_time = ?, fragrance = ?, acidity = ?, sweetness = ?, mouthfeel = ?, aftertaste = ?, total_score = ?, notes = ?
      WHERE id = ?`,
      [
        normalizedItem.label,
        normalizedItem.duration,
        normalizedItem.harvestTime,
        normalizedItem.fragrance,
        normalizedItem.acidity,
        normalizedItem.sweetness,
        normalizedItem.mouthfeel,
        normalizedItem.aftertaste,
        normalizedItem.totalScore,
        normalizedItem.notes,
        item.id,
      ]
    );

    return { success: true as const };
  } catch (error) {
    console.error('Failed to update brew item:', error);
    return { success: false as const, error };
  }
};

export const deleteBrewItem = (itemId: number) => {
  initDB();

  try {
    db.runSync('DELETE FROM brew_items WHERE id = ?', [itemId]);
    return { success: true as const };
  } catch (error) {
    console.error('Failed to delete brew item:', error);
    return { success: false as const, error };
  }
};

export const deleteBatch = (batchId: number) => {
  initDB();

  try {
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM brew_items WHERE batch_id = ?', [batchId]);
      db.runSync('DELETE FROM batches WHERE id = ?', [batchId]);
    });

    return { success: true as const };
  } catch (error) {
    console.error('Failed to delete batch:', error);
    return { success: false as const, error };
  }
};
