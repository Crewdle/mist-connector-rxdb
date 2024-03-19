import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection, RxJsonSchema, MangoQuerySortPart } from 'rxdb';
import {getRxStorageDexie} from 'rxdb/plugins/storage-dexie';

import { v4 as uuidv4 } from 'uuid';

import type { IValueType, IDatabaseTableQuery, IKeyValueDatabaseConnector, IKeyValueDatabaseTableConnector, IDatabaseLayout } from '@crewdle/web-sdk';

/**
 * The RxDB key-value database connector - Connect to an RxDB database.
 * @category Connector
 */
export class RxDBDatabaseConnector implements IKeyValueDatabaseConnector {
  private db?: RxDatabase;
  private collections: { [tableName: string]: RxCollection } = {};

  constructor(
    private readonly dbKey: string,
    private readonly layout: RxJsonSchema<IDatabaseLayout>
  ) {}

  /**
   * Opens the database and initializes collections based on the layout.
   */
  async open(): Promise<void> {
    // ...
    this.db = await createRxDatabase({
      name: this.dbKey,
      storage: getRxStorageDexie()
    });

    const collectionsToAdd: Record<string, any> = {};
    Object.entries(this.layout).forEach(([tableName, schema]) => {
      collectionsToAdd[tableName] = { schema };
    });

    const addedCollections = await this.db.addCollections(collectionsToAdd);

    Object.keys(this.layout).forEach((tableName) => {
      this.collections[tableName] = addedCollections[tableName];
    });
  }

  /**
   * Closes the database.
   */
  async close(): Promise<void> {
    await this.db?.destroy();
    this.collections = {};
  }

  /**
   * Checks if the table exists.
   */
  hasTable(tableName: string): boolean {
    return !!this.collections[tableName];
  }

  /**
   * Table creation should be done during DB initialization. RxDB does not support creating tables dynamically.
   */
  createTable(tableName: string): void {
    if (!this.hasTable(tableName)) {
      throw new Error(`Table ${tableName} is not predefined and cannot be created dynamically.`);
    }
  }

  /**
   * Gets a table connector.
   */
  getTableConnector<T extends IValueType>(tableName: string): IKeyValueDatabaseTableConnector<T> {
    if (!this.hasTable(tableName)) {
      throw new Error(`Table ${tableName} does not exist`);
    }

    return new RxDBDatabaseTableConnector<T>(this.collections[tableName]);
  }
}

/**
 * The RxDB database table connector - Connect to a collection in an RxDB database.
 */
export class RxDBDatabaseTableConnector<T extends IValueType> implements IKeyValueDatabaseTableConnector<T> {
  constructor(private readonly collection: RxCollection<T>) {}

  /**
   * Gets a value.
   */
  async get(key: string): Promise<T | undefined> {
    const doc = await this.collection.findOne(key).exec();
    return doc ? (doc.toJSON() as T) : undefined;
  }

  /**
   * Sets a value.
   */
  async set(key: string, value: Omit<T, 'id'>): Promise<T> {
    await this.collection.upsert({ ...value, id: key } as T);
    return { ...value, id: key } as T;
  }

  /**
   * Adds a value. The key will be generated.
   */
  async add(value: Omit<T, 'id'>): Promise<T> {
    const id = uuidv4();
    await this.collection.insert({ ...value, id } as T);
    return { ...value, id } as T;
  }

  /**
   * Deletes a value.
   */
  async delete(key: string): Promise<void> {
    const doc = await this.collection.findOne(key).exec();
    if (doc) {
      await doc.remove();
    }
  }

  /**
   * Clears the collection.
   */
  async clear(): Promise<void> {
    await this.collection.remove();
  }

  /**
   * Lists values based on a query.
   */
  async list(query?: IDatabaseTableQuery): Promise<T[]> {
    let rxQuery = this.collection.find();

    if (query?.where) {
      const whereQuery = transformWhereClause(query.where);
      rxQuery = rxQuery.where(whereQuery);
    }

    if (query?.orderBy) {
      const sortOrder = {
        [query.orderBy.key]: query.orderBy.direction,
      } as MangoQuerySortPart<T>;
      rxQuery = rxQuery.sort(sortOrder);
    }

    if (query?.limit !== undefined) {
      rxQuery = rxQuery.limit(query.limit);
    }

    let results = await rxQuery.exec();
    if (query?.offset !== undefined) {
      results = results.slice(query.offset);
    }

    return results.map(doc => doc.toJSON()) as T[];
  }

  /**
   * Counts values based on a query.
   */
  async count(query?: IDatabaseTableQuery): Promise<number> {
    // Similar to list, but returns a count
    return this.collection.count().exec();
  }

   /**
   * Calculates the approximate size of the collection by summing the sizes of the stringified documents.
   * @returns A promise that resolves with the size in bytes.
   */
    async calculateSize(): Promise<number> {
      const allDocs = await this.collection.find().exec();
      const totalSize = allDocs.reduce((sum, doc) => {
        const docSize = new Blob([JSON.stringify(doc)]).size;
        return sum + docSize;
      }, 0);

      return totalSize;
    }
}

/**
 * Transforms a where clause to a Mango query.
 * @param whereClause The where clause to transform.
 * @returns The Mango query.
 * @internal
 * @ignore
 */

function transformWhereClause(whereClause: IDatabaseTableQuery['where']): any {
  if (!whereClause) {
    return {};
  }
  if ('values' in whereClause) {
    return { [whereClause.key]: { $in: whereClause.values } };
  }

  if ('between' in whereClause) {
    const between = whereClause.between as [number, number];
    return { [whereClause.key]: { $gte: between[0], $lte: between[1] } };
  }

  if ('value' in whereClause) {
    return { [whereClause.key]: { $eq: whereClause.value } };
  }
}
